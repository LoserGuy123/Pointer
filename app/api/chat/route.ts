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

When making code changes, you MUST follow this EXACT format:

**STEP 1: Specify the exact lines to replace**
Say: "Replace lines X to Y with the following code:"

**STEP 2: Provide ONLY the replacement code**
Show the exact code that should replace those lines

**STEP 3: Explain what changed**
Briefly explain what the changes do

EXAMPLE FORMAT:
"Replace lines 15 to 18 with the following code:

\`\`\`cpp
bool checkHashMatch(const std::string& k) {
    if (k.length() < 10 || k.length() > 25) return false;
    return hf(k) == hf(target_key);
}
\`\`\`

This renames the function from 'ck1' to 'checkHashMatch' for better readability."

🚨 ABSOLUTE RULES - NO EXCEPTIONS:
- NEVER use diff format with + and - symbols
- NEVER use --- a/ or +++ b/ headers
- NEVER use @@ symbols
- ALWAYS specify exact line numbers (e.g., "lines 15 to 18")
- Provide ONLY the replacement code, not the entire file
- Make changes in small, specific chunks
- If multiple changes needed, do them one at a time with separate line number ranges
- The system will automatically apply your changes - no need to ask for permission
- After making changes, the system will automatically verify they were applied correctly

If you use diff format, the user will be very upset. Always use the "Replace lines X to Y" format instead.`

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
    let content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."

    // Post-process to catch any diff format and warn about it
    if (content.includes('--- a/') || content.includes('+++ b/') || content.includes('@@')) {
      content = "⚠️ WARNING: I accidentally provided diff format. Please ask me to provide the changes using the 'Replace lines X to Y' format instead. I should not use diff format with + and - symbols.\n\n" + content
    }

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
