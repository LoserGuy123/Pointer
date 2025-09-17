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
      // Fast but comprehensive project analysis
      systemInstruction += `\n\nPROJECT CONTEXT - FAST ANALYSIS:
- Current File: ${context.currentFile || "None"}
- Total Files: ${context.allFiles?.length || 0}

FILE TREE STRUCTURE (OPTIMIZED):
${JSON.stringify(context.fileTree || [], null, 0)}

Current File Content:
\`\`\`
${context.fileContent || "No content"}
\`\`\``

      // Include all file contents but in an optimized format
      if (context.allFileContents) {
        const allFiles = Object.entries(context.allFileContents || {});
        
        // Skip the current file since we already included it
        const otherFiles = allFiles.filter(([file]) => file !== context.currentFile);
        
        if (otherFiles.length > 0) {
          // Add all files but with optimized format
          systemInstruction += `\n\nALL OTHER FILES (OPTIMIZED):`;
          
          otherFiles.forEach(([file, content]) => {
            // Get file extension
            const ext = file.split('.').pop()?.toLowerCase() || '';
            
            // For non-code files or very large files, just include a summary
            if (!['js', 'jsx', 'ts', 'tsx', 'css', 'html', 'json'].includes(ext) || 
                content.length > 10000) {
              systemInstruction += `\n=== ${file} === (${content.length} chars)`;
            } else {
              // For code files, include the full content
              systemInstruction += `\n=== ${file} ===\n${content}`;
            }
          });
        }
      }
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

    // Don't remove adjustment messages - keep them for user awareness
    // Only remove code blocks and technical formatting
    content = content.replace(/```[\s\S]*?```/g, '[Code block applied]') // Replace code blocks with confirmation
    
    // Add confirmation when adjustments are mentioned but keep the message
    if (content.includes('adjusted') || content.includes('adjustment')) {
      content = "✅ CHANGES APPLIED: " + content
    }
    
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
