"use client"

import { GitBranch, Wifi, Zap, AlertCircle } from "lucide-react"

interface StatusBarProps {
  currentFile?: string
  fileContents?: Record<string, string>
}

export function StatusBar({ currentFile, fileContents }: StatusBarProps) {
  const getFileStats = () => {
    if (!currentFile || !fileContents?.[currentFile]) {
      return {
        lines: 0,
        characters: 0,
        language: "Plain Text",
        encoding: "UTF-8",
      }
    }

    const content = fileContents[currentFile]
    const lines = content.split("\n").length
    const characters = content.length

    const extension = currentFile.split(".").pop()?.toLowerCase()
    const languageMap: Record<string, string> = {
      js: "JavaScript",
      jsx: "JavaScript React",
      ts: "TypeScript",
      tsx: "TypeScript React",
      py: "Python",
      css: "CSS",
      html: "HTML",
      json: "JSON",
      md: "Markdown",
      sql: "SQL",
      php: "PHP",
      java: "Java",
      cpp: "C++",
      c: "C",
      go: "Go",
      rs: "Rust",
      rb: "Ruby",
    }

    const language = languageMap[extension || ""] || "Plain Text"

    return {
      lines,
      characters,
      language,
      encoding: "UTF-8",
    }
  }

  const fileStats = getFileStats()

  return (
    <div className="h-6 bg-card border-t border-border glass flex items-center justify-between px-4 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          <span>0 errors, 0 warnings</span>
        </div>
        {currentFile && <span>{currentFile}</span>}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-accent" />
          <span>AI Ready</span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi className="h-3 w-3" />
          <span>Connected</span>
        </div>
        <span>{fileStats.language}</span>
        <span>{fileStats.encoding}</span>
        <span>{fileStats.lines} lines</span>
        <span>{fileStats.characters} chars</span>
      </div>
    </div>
  )
}
