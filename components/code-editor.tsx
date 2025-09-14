"use client"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Save, MoreHorizontal } from "lucide-react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  file: string
  content: string
  onContentChange?: (content: string) => void
}

// Function to detect language from file content
const detectLanguageFromContent = (content: string): string | null => {
  const contentLower = content.toLowerCase()
  
  // Language-specific patterns
  const patterns = [
    { pattern: /function\s+\w+\s*\(|local\s+\w+\s*=|end\s*$/, language: "Lua" },
    { pattern: /using\s+System|namespace\s+\w+|public\s+class/, language: "C#" },
    { pattern: /#!\/bin\/(bash|sh|zsh|fish)|echo\s+["']/, language: "Shell Script" },
    { pattern: /def\s+\w+\s*\(|import\s+\w+|print\s*\(/, language: "Python" },
    { pattern: /function\s+\w+\s*\(|const\s+\w+\s*=|let\s+\w+\s*=/, language: "JavaScript" },
    { pattern: /interface\s+\w+|type\s+\w+\s*=|:\s*\w+\[\]/, language: "TypeScript" },
    { pattern: /public\s+class\s+\w+|import\s+java\./, language: "Java" },
    { pattern: /#include\s*<|int\s+main\s*\(|std::/, language: "C++" },
    { pattern: /#include\s*<|int\s+main\s*\(|printf\s*\(/, language: "C" },
    { pattern: /fn\s+\w+\s*\(|let\s+mut\s+\w+|use\s+std::/, language: "Rust" },
    { pattern: /package\s+main|func\s+\w+\s*\(|import\s+"fmt"/, language: "Go" },
    { pattern: /<?php|echo\s+["']|function\s+\w+\s*\(/, language: "PHP" },
    { pattern: /def\s+\w+\s*\(|puts\s+["']|require\s+["']/, language: "Ruby" },
    { pattern: /SELECT\s+\w+|FROM\s+\w+|WHERE\s+\w+/, language: "SQL" },
    { pattern: /<!DOCTYPE\s+html|<html|<head>/, language: "HTML" },
    { pattern: /\.\w+\s*\{|@media|@import/, language: "CSS" },
    { pattern: /{\s*"|"name":\s*"|"version":\s*"/, language: "JSON" },
    { pattern: /#\s+\w+|##\s+\w+|###\s+\w+/, language: "Markdown" },
  ]
  
  for (const { pattern, language } of patterns) {
    if (pattern.test(content)) {
      return language
    }
  }
  
  return null
}

export function CodeEditor({ file, content, onContentChange }: CodeEditorProps) {
  const [code, setCode] = useState(content)
  const [language, setLanguage] = useState("javascript")
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const editorRef = useRef<any>(null)

  useEffect(() => {
    const extension = file.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      // Web Technologies
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      css: "css",
      html: "html",
      htm: "html",
      xml: "xml",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      
      // Programming Languages
      py: "python",
      java: "java",
      cpp: "cpp",
      cxx: "cpp",
      cc: "cpp",
      c: "c",
      h: "c",
      hpp: "cpp",
      cs: "csharp",
      vb: "vb",
      fs: "fsharp",
      
      // Scripting Languages
      lua: "lua",
      rb: "ruby",
      php: "php",
      pl: "perl",
      sh: "shell",
      bash: "shell",
      zsh: "shell",
      fish: "shell",
      ps1: "powershell",
      
      // Systems Languages
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
      scala: "scala",
      clj: "clojure",
      hs: "haskell",
      ml: "ocaml",
      
      // Database
      sql: "sql",
      mysql: "sql",
      pgsql: "sql",
      
      // Configuration & Data
      md: "markdown",
      txt: "plaintext",
      ini: "ini",
      cfg: "ini",
      conf: "ini",
      toml: "toml",
      env: "properties",
      
      // Build & Package
      dockerfile: "dockerfile",
      makefile: "makefile",
      cmake: "cmake",
      gradle: "groovy",
      pom: "xml",
      
      // Other
      r: "r",
      m: "objective-c",
      mm: "objective-cpp",
      dart: "dart",
      elm: "elm",
      ex: "elixir",
      exs: "elixir",
      erl: "erlang",
      hrl: "erlang",
      nim: "nim",
      zig: "zig",
      v: "v",
      jl: "julia",
      cr: "crystal",
      pas: "pascal",
      pp: "pascal",
      ada: "ada",
      ads: "ada",
      adb: "ada",
    }
    let detectedLanguage = languageMap[extension || ""] || "javascript"
    
    // If extension not recognized, try to detect from content
    if (detectedLanguage === "javascript" && content.trim()) {
      const contentDetected = detectLanguageFromContent(content)
      if (contentDetected) {
        // Convert display name to Monaco language ID
        const monacoLanguageMap: Record<string, string> = {
          "Lua": "lua",
          "C#": "csharp",
          "Shell Script": "shell",
          "Python": "python",
          "JavaScript": "javascript",
          "TypeScript": "typescript",
          "Java": "java",
          "C++": "cpp",
          "C": "c",
          "Rust": "rust",
          "Go": "go",
          "PHP": "php",
          "Ruby": "ruby",
          "SQL": "sql",
          "HTML": "html",
          "CSS": "css",
          "JSON": "json",
          "Markdown": "markdown",
        }
        detectedLanguage = monacoLanguageMap[contentDetected] || "javascript"
      }
    }
    
    setLanguage(detectedLanguage)
  }, [file, content])

  useEffect(() => {
    setCode(content)
  }, [content])

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || ""
    setCode(newCode)
    onContentChange?.(newCode)
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({
        line: e.position.lineNumber,
        column: e.position.column,
      })
    })

    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6b7280", fontStyle: "italic" },
        { token: "keyword", foreground: "8b5cf6" },
        { token: "string", foreground: "10b981" },
        { token: "number", foreground: "f59e0b" },
        { token: "type", foreground: "06b6d4" },
        { token: "function", foreground: "f97316" },
      ],
      colors: {
        "editor.background": "#0a0a0a",
        "editor.foreground": "#e5e7eb",
        "editor.lineHighlightBackground": "#1f2937",
        "editor.selectionBackground": "#374151",
        "editorCursor.foreground": "#8b5cf6",
        "editorLineNumber.foreground": "#6b7280",
        "editorLineNumber.activeForeground": "#9ca3af",
        "editor.inactiveSelectionBackground": "#374151",
        "editorIndentGuide.background": "#374151",
        "editorIndentGuide.activeBackground": "#6b7280",
      },
    })

    monaco.editor.setTheme("custom-dark")
  }

  const handleSave = () => {
    console.log("[v0] Saving file:", file, "with content:", code)
    onContentChange?.(code)
    if ("showSaveFilePicker" in window) {
      ;(async () => {
        try {
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName: file.split("/").pop() || "file.txt",
            types: [
              {
                description: "Text files",
                accept: {
                  "text/plain": [".txt", ".js", ".jsx", ".ts", ".tsx", ".py", ".css", ".html", ".json", ".md"],
                },
              },
            ],
          })
          const writable = await fileHandle.createWritable()
          await writable.write(code)
          await writable.close()
        } catch (err) {
          // Fallback to download if user cancels or API not supported
          const blob = new Blob([code], { type: "text/plain" })
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = file.split("/").pop() || "file.txt"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
      })()
    } else {
      // Fallback for browsers without File System Access API
      const blob = new Blob([code], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.split("/").pop() || "file.txt"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  const handleRun = () => {
    console.log("[v0] Running code:", code)
    if (language === "javascript" || language === "typescript") {
      try {
        const result = eval(code)
        console.log("[v0] Execution result:", result)
        alert(`Code executed successfully! Check console for output.`)
      } catch (error) {
        console.error("[v0] Execution error:", error)
        alert(`Error: ${error}`)
      }
    } else {
      alert(`Code execution for ${language} is not supported in the browser. Use the terminal instead.`)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Editor Header */}
      <div className="h-10 border-b border-border glass flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">{file}</div>
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <span className="text-xs text-muted-foreground uppercase">{language}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleSave} title="Save file">
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRun} title="Run code">
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="custom-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-jetbrains-mono), monospace",
            lineNumbers: "on",
            rulers: [80],
            wordWrap: "on",
            automaticLayout: true,
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            renderWhitespace: "selection",
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            tabSize: 2,
            insertSpaces: true,
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: "line",
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            scrollbar: {
              vertical: "auto",
              horizontal: "auto",
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      </div>

      <div className="h-6 bg-card border-t border-border glass flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>
            Ln {cursorPosition.line}, Col {cursorPosition.column}
          </span>
          <span>{code.length} characters</span>
          <span>Language: {language}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>AI Completions: On</span>
          <span>Tab Size: 2</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  )
}
