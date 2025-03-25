import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { prompt, mode } = await request.json();

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

        // Initialize the AI model (server-side only, with proper API key)
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

        // Select the appropriate model based on mode
        const model = mode === "generate"
            ? genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings, systemInstruction: gen_context })
            : genAI.getGenerativeModel({ model: "gemini-2.0-flash", safetySettings, systemInstruction: edit_context });

        // Generate content
        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Return the generated content
        return NextResponse.json({ content: text });

    } catch (error) {
        console.error("API route error:", error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}