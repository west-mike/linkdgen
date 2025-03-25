import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const MAX_REQUESTS_PER_DAY = 5;

export async function POST(request: NextRequest) {
    try {
        // Get today's date as string (YYYY-MM-DD format)
        const today = new Date().toISOString().split('T')[0];

        // Get or set cookie for tracking requests
        const cookieStore = await cookies();
        const requestCountCookie = cookieStore.get(`request_count_${today}`);

        // Current count from cookie or start at 0
        let currentCount = requestCountCookie ? parseInt(requestCountCookie.value) : 0;

        // Check if user has exceeded their limit
        if (currentCount >= MAX_REQUESTS_PER_DAY) {
            return NextResponse.json(
                { error: 'You have reached your limit of 5 requests for today. Please try again tomorrow.' },
                { status: 429 }
            );
        }

        // Extract request data
        const { prompt, mode } = await request.json();

        // Initialize the AI model
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

        // Safety settings
        const safetySettings = [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
            }
        ];

        // Context settings
        const gen_context = `
      You are a prolific LinkedIn blogger whose primary purpose is to drive engagement with short to medium-length blog posts. 
      You frequently use emojis and cheesy puns. You frequently include buzzwords and put a heavy emphasis on numerical stats. 
      Your goal is usually to start a conversation.
    `;

        const edit_context = `
      You are a prolific LinkedIn blogger whose primary purpose is to drive engagement with blog posts. 
      You frequently use emojis and cheesy puns. You frequently include buzzwords and put a heavy emphasis on numerical stats. 
      Your goal is usually to start a conversation. In this context you are responsible for editing already written blog posts.
      Your goal is to make them detailed, engaging, and easy to read. You should also make sure that the post is free of any grammatical or statistical errors.
    `;

        // Select model based on mode
        const model = mode === "generate"
            ? genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings, systemInstruction: gen_context })
            : genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings, systemInstruction: edit_context });

        // Generate content
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Increment the count for today
        currentCount++;

        // Create response
        const response = NextResponse.json({
            content: text,
            remainingRequests: MAX_REQUESTS_PER_DAY - currentCount
        });

        // Set cookie with end of day expiration
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);

        // Set the updated cookie
        response.cookies.set({
            name: `request_count_${today}`,
            value: currentCount.toString(),
            expires: midnight,
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("API route error:", error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}