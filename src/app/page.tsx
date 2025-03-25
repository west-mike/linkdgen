"use client"; // Add this to enable client-side hooks

import { useState, useRef } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import MarkdownRenderer from "@/components/utils/markdownrenderer";
import DOMPurify from 'dompurify';

export default function Home() {
  // state variables
  const [tokenCount, setTokenCount] = useState(0);
  const [responseAreaContent, setResponseAreaContent] = useState("");
  const [inputAreaContent, setInputAreaContent] = useState("");
  const inputTextAreaRef = useRef<HTMLTextAreaElement>(null);
  const [inputToggleMode, setInputToggleMode] = useState("generate");
  const [displayToggleMode, setDisplayToggleMode] = useState("prompt");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [remainingRequests, setRemainingRequests] = useState(5);

  // Function to count tokens, where 1 token ≈ 4 characters
  const calculateTokens = (text: string) => {
    if (!text) return 0;
    // Count the number of characters and divide by 4 (rounded up)
    return Math.ceil(text.length / 4);
  };

  // Sanitize any user input
  const sanitizeInput = (input: string): string => {
    return DOMPurify.sanitize(input);
  };

  // Update token count on text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitizedInput = sanitizeInput(e.target.value);
    setInputAreaContent(sanitizedInput);
    const count = calculateTokens(sanitizedInput);
    setTokenCount(count);
  };

  // Handle input toggle change 
  const handleInputToggleChange = (value: string) => {
    if (value) setInputToggleMode(value);
  };
  // Handle display toggle change 
  const handleDisplayToggleChange = (value: string) => {
    if (value) setDisplayToggleMode(value);
  };

  const generatePost = async () => {
    try {
      setIsGenerating(true);
      setGenerated(true);

      const sanitizedInput = sanitizeInput(inputAreaContent.trim());
      if (!sanitizedInput) {
        alert("Please enter some text before generating a post.");
        return;
      }

      // Call your API route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: sanitizedInput,
          mode: inputToggleMode
        }),
      });

      // Check for rate limit exceeded
      if (response.status === 429) {
        const data = await response.json();
        alert(data.error || "You've reached your limit of 5 requests per day.");
        return;
      }

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Display remaining requests
      if (data.remainingRequests !== undefined) {
        console.log(`You have ${data.remainingRequests} requests remaining today.`);
        setRemainingRequests(data.remainingRequests);
      }

      // Sanitize and set response
      const sanitizedResult = sanitizeInput(data.content);
      setResponseAreaContent(sanitizedResult);
      setTokenCount(calculateTokens(sanitizedResult));

    } catch (error) {
      console.error("Error generating content:", error);
      alert("An error occurred while generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="col-span-8 row-span-8 grid grid-cols-subgrid grid-rows-subgrid text-blue-500 text-l xl:text-xl 2xl:text-2xl">
      <div className="relative grid row-start-2 row-end-3 col-start-3 col-end-7 border-4 border-blue-500 border-round rounded-tl-lg rounded-tr-lg">
        <input
          type="text"
          placeholder="Title"
          className="absolute top-1/2 left-4 transform -translate-y-1/2 border-blue-400 rounded-lg border-2 w-[63%] h-[40%] text-left align-middle"
        />

        <ToggleGroup
          type="single"
          defaultValue="generate"
          value={inputToggleMode}
          onValueChange={handleInputToggleChange}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 border-blue-400 rounded-lg border-2 w-[30%] h-[40%] flex items-center justify-center text-l xl:text-xl 2xl:text-2xl"
        >
          <ToggleGroupItem
            value="generate"
            aria-label="Toggle generate mode"
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white hover:cursor-pointer h-[100%] hover:bg-blue-200"
          >
            From Prompt
          </ToggleGroupItem>
          <ToggleGroupItem
            value="post"
            aria-label="Toggle edit post mode"
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white hover:cursor-pointer h-[100%] hover:bg-blue-200"
          >
            From Post
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className="relative grid row-start-3 row-end-7 col-start-3 col-end-7 border-4 border-blue-500 border-round rounded-bl-lg rounded-br-lg">
        {displayToggleMode === "prompt" ? (
          <textarea
            ref={inputTextAreaRef}
            value={inputAreaContent}
            className="scrollabletextbox m-4 mb-8 border-blue-800 border-opacity-30 border-2 rounded-lg"
            name="post_text"
            placeholder={inputToggleMode === "generate" ? "Enter your prompt..." : "Paste your post..."}
            onChange={handleTextChange}
            maxLength="40000"
          ></textarea>
        ) : (
          <div
            className="scrollabletextbox m-4 mb-8 border-blue-800 border-opacity-30 border-2 rounded-lg p-2 overflow-y-auto"
            style={{ whiteSpace: "pre-wrap" }}
          >
            <MarkdownRenderer content={responseAreaContent} />
          </div>
        )}

        <div className="absolute bottom-1 left-4 flex items-center gap-4">
          <span>Token Count: {tokenCount}/10000</span>
          <span className="text-sm">(Requests remaining today: {remainingRequests}/5)</span>
        </div>

        <button
          className="absolute bottom-1 right-4 rounded-lg bg-blue-500 text-white text-center flex items-center justify-center h-[25px] w-[200px] py-1 hover:cursor-pointer hover:bg-blue-400 2xl:text-xl s:text-l"
          onClick={generatePost}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate!"}
        </button>
      </div>
      {generated && <div className="grid row-start-7 row-end-8 col-start-3 col-end-4">
        <ToggleGroup
          type="single"
          defaultValue="prompt"
          value={displayToggleMode}
          onValueChange={handleDisplayToggleChange}
          className=" border-blue-400 rounded-bl-lg rounded-br-lg border-b-4 border-l-4 border-r-4 flex items-center h-[40px] w-[200px] justify-center text-l xl:text-xl 2xl:text-2xl"
        >
          <ToggleGroupItem
            value="response"
            aria-label="View AI response"
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white hover:cursor-pointer "
          >
            Response
          </ToggleGroupItem>
          <ToggleGroupItem
            value="prompt"
            aria-label="View original prompt"
            className="data-[state=on]:bg-blue-500 data-[state=on]:text-white hover:cursor-pointer"
          >
            Prompt
          </ToggleGroupItem>
        </ToggleGroup>
      </div>}
    </div>
  );
}
