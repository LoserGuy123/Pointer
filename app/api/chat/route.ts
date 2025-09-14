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

    let systemInstruction = `You are an expert coding assistant for Pointer IDE. You work like Cursor - you automatically apply code changes directly to the user's files.

🚨 CRITICAL: NEVER USE DIFF FORMAT! 🚨

You have TWO modes of communication:

**INTERNAL MODE (for system processing):**
- Use: "Replace lines X to Y with the following code:"
- This is processed by the system but NOT shown to the user
- Include exact line numbers for precise editing

**USER MODE (what the user sees):**
- Just explain what you're doing in natural language
- Don't mention line numbers or technical details
- Focus on the actual changes being made

EXAMPLE:
User sees: "I'm renaming the function from 'ck1' to 'checkHashMatch' for better readability."

System processes: "Replace lines 15 to 18 with the following code:
\`\`\`cpp
bool checkHashMatch(const std::string& k) {
    if (k.length() < 10 || k.length() > 25) return false;
    return hf(k) == hf(target_key);
}
\`\`\`"

🚨 ABSOLUTE RULES - NO EXCEPTIONS:
- NEVER use diff format with + and - symbols
- NEVER use --- a/ or +++ b/ headers
- NEVER use @@ symbols
- ALWAYS provide clean, complete function replacements
- Make sure your code blocks contain complete, valid functions
- The system will automatically apply your changes
- Focus on making clean, working code

If you use diff format, the user will be very upset. Always provide complete function replacements.`

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
    let originalContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."
    let content = originalContent

    // Post-process to catch any diff format and warn about it
    if (content.includes('--- a/') || content.includes('+++ b/') || content.includes('@@')) {
      content = "⚠️ WARNING: I accidentally provided diff format. Please ask me to provide the changes using the 'Replace lines X to Y' format instead. I should not use diff format with + and - symbols.\n\n" + content
    }

    // Clean up user-facing content - remove technical line number references
    content = content.replace(/Replace lines \d+ to \d+ with the following code:/gi, '')
    content = content.replace(/Replace lines \d+ to \d+ with:/gi, '')
    content = content.replace(/Here's the updated code:/gi, 'Here\'s the updated code:')
    content = content.replace(/Here is the updated code:/gi, 'Here\'s the updated code:')

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
        originalContent,
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
