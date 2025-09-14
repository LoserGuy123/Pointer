export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    // Check if Gemini API key is available
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Gemini API key not found. Please add GEMINI_API_KEY to your environment variables in Project Settings.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    let systemInstruction = `You are an expert coding assistant for Pointer IDE. You help developers with:
- Code explanation and analysis
- Bug fixing and debugging
- Code generation and completion
- Performance optimization
- Best practices and refactoring

When making code changes, follow these guidelines:

1. For SMALL changes (1-5 lines): Provide the complete updated function or section
2. For LARGE changes: Use diff format with clear explanations
3. Always explain what you're changing and why
4. When using diff format, make sure the changes are clear and minimal

IMPORTANT: 
- If you provide a diff format, make sure it's properly formatted
- For small changes, provide the complete updated code block instead of a diff
- Always explain the reasoning behind your changes
- Focus on the exact lines or sections that need to be changed`

    if (context) {
      systemInstruction += `\n\nCurrent Project Context:
- Current File: ${context.currentFile || "None"}
- Available Files: ${context.allFiles?.join(", ") || "None"}
- Project Structure: ${Object.keys(context.projectStructure || {}).length} files total`

      if (context.fileContent && context.fileContent.trim()) {
        systemInstruction += `\n\nCurrent File Content (${context.currentFile}):\n\`\`\`\n${context.fileContent}\n\`\`\``
      }
    }

    // Use direct fetch to Gemini API instead of AI SDK to avoid import issues
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages.map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
          })),
          systemInstruction: {
            parts: [
              {
                text: systemInstruction,
              },
            ],
          },
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const codeBlocks = []
    let match

    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        language: match[1] || "text",
        code: match[2].trim(),
      })
    }

    return new Response(
      JSON.stringify({
        content,
        codeBlocks: codeBlocks.length > 0 ? codeBlocks : null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process chat request. Please check your API key and try again.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}
