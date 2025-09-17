export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json()

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY
    
    // Debug logging
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey ? apiKey.length : 0)
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: `Gemini API key not found. Please add GEMINI_API_KEY to your environment variables. Create a .env.local file with: GEMINI_API_KEY=your_api_key_here`,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    let systemInstruction = `You are a fast coding assistant for Pointer IDE. You make direct edits to files.

🚨 CRITICAL: BE FAST AND DIRECT! 🚨

When the user asks for changes:
1. Understand what they want
2. Apply changes to the complete code
3. Provide updated code in a code block (auto-applied)
4. Keep response brief - just say what you did

EXAMPLE:
User: "Add a print statement"
You: "Added print statement."

\`\`\`cpp
// Complete updated code
\`\`\`

🚨 ABSOLUTE RULES - NO EXCEPTIONS:
- ALWAYS provide complete, working code in code blocks
- NEVER show code in your chat response - it's auto-applied
- NEVER use diff format (+/- symbols)
- NEVER show the entire script in chat
- Keep responses brief and fast
- Focus on speed and accuracy
- Just say what you did, don't explain the code`

    if (context) {
      systemInstruction += `\n\nPROJECT CONTEXT - ANALYZE ENTIRE PROJECT:
- Current File: ${context.currentFile || "None"}
- Total Files: ${context.allFiles?.length || 0}
- File Tree Structure: ${JSON.stringify(context.fileTree || [], null, 2)}

AVAILABLE FILES:
${context.allFiles?.map(file => `- ${file} (${context.projectStructure?.[file]?.type || 'unknown'}, ${context.projectStructure?.[file]?.lines || 0} lines)`).join('\n') || 'None'}

IMPORTANT: Before making changes, analyze the ENTIRE project structure and all files to understand:
1. What files exist and their relationships
2. Which file(s) the user's request applies to
3. The project's architecture and dependencies
4. Whether changes should be made to multiple files

Current File Content (${context.currentFile}):
\`\`\`
${context.fileContent || "No content"}
\`\`\`

ALL FILE CONTENTS (for full project understanding):
${Object.entries(context.allFileContents || {}).map(([file, content]) => 
  `\n=== ${file} ===\n${content}\n`).join('\n')}`
    }

    let response: Response
    let data: any

    // Use Gemini API
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
    
    data = await response.json()

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`)
    }
    let originalContent = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."
    let content = originalContent

    // Post-process to catch any diff format and warn about it
    if (content.includes('--- a/') || content.includes('+++ b/') || content.includes('@@')) {
      content = "⚠️ WARNING: I accidentally provided diff format. Please ask me to provide the changes using the 'Replace lines X to Y' format instead. I should not use diff format with + and - symbols.\n\n" + content
    }

    // Clean up user-facing content - remove technical line number references and code explanations
    content = content.replace(/Replace lines \d+ to \d+ with the following code:/gi, '')
    content = content.replace(/Replace lines \d+ to \d+ with:/gi, '')
    content = content.replace(/Here's the updated code:/gi, '')
    content = content.replace(/Here is the updated code:/gi, '')
    content = content.replace(/Here's the code:/gi, '')
    content = content.replace(/Here is the code:/gi, '')
    content = content.replace(/Updated code:/gi, '')
    content = content.replace(/The updated code:/gi, '')
    content = content.replace(/Code updated:/gi, '')
    content = content.replace(/```[\s\S]*?```/g, '') // Remove all code blocks from display
    
    // Clean up any leftover empty lines or formatting issues
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n').trim()

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
        reasoning: data.candidates?.[0]?.reasoning || null,
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
