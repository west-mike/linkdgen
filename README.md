This is a [Next.js](https://nextjs.org) project with [Gemini](https://ai.google.dev/gemini-api/docs) integration.

View it [here](https://linkdgen.westmike.com/).

This a simple project that's meant to generate the types of LinkedIn posts you often see (emojis, buzzwords, more emojis).

## Input
You can input a title in the title bar and your prompt or post in the main scrollable text area.

## Modes

There are two modes: turning a current blog post/chunk of text into linkedin-style, or generating a new post, the toggle in the top right by the title input changes the mode.

## Generating a Post

Once there is some amount of text in the text area, press the generate button in the bottom right to send the query to the API.
A toggle will show up in the bottom left. Select response to view the AI response, and prompt to view your original text.

## Limits
Text input is limited to 10k tokens or 40k characters (a Gemini token is 4 characters).
Users are limited to 5 requests per day.
