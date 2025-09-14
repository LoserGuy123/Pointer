"use client"

import { GitBranch, Wifi, Zap, AlertCircle } from "lucide-react"

interface StatusBarProps {
  currentFile?: string
  fileContents?: Record<string, string>
}

// Function to detect language from file content
const detectLanguageFromContent = (content: string): string | null => {
  const contentLower = content.toLowerCase()
  
  // Language-specific patterns
  const patterns = [
    { pattern: /function\s+\w+\s*\(|local\s+\w+\s*=|end\s*$/, language: "Lua" },
    { pattern: /using\s+System|namespace\s+\w+|public\s+class/, language: "C#" },
    { pattern: /#!/bin/(bash|sh|zsh|fish)|echo\s+["']/, language: "Shell Script" },
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
      // Web Technologies
      js: "JavaScript",
      jsx: "JavaScript React",
      ts: "TypeScript",
      tsx: "TypeScript React",
      css: "CSS",
      html: "HTML",
      htm: "HTML",
      xml: "XML",
      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      
      // Programming Languages
      py: "Python",
      java: "Java",
      cpp: "C++",
      cxx: "C++",
      cc: "C++",
      c: "C",
      h: "C/C++ Header",
      hpp: "C++ Header",
      cs: "C#",
      vb: "Visual Basic",
      fs: "F#",
      
      // Scripting Languages
      lua: "Lua",
      rb: "Ruby",
      php: "PHP",
      pl: "Perl",
      sh: "Shell Script",
      bash: "Bash",
      zsh: "Zsh",
      fish: "Fish",
      ps1: "PowerShell",
      
      // Systems Languages
      go: "Go",
      rs: "Rust",
      swift: "Swift",
      kt: "Kotlin",
      scala: "Scala",
      clj: "Clojure",
      hs: "Haskell",
      ml: "OCaml",
      fs: "F#",
      
      // Database
      sql: "SQL",
      mysql: "MySQL",
      pgsql: "PostgreSQL",
      
      // Configuration & Data
      md: "Markdown",
      txt: "Plain Text",
      ini: "INI",
      cfg: "Configuration",
      conf: "Configuration",
      toml: "TOML",
      env: "Environment",
      
      // Build & Package
      dockerfile: "Dockerfile",
      makefile: "Makefile",
      cmake: "CMake",
      gradle: "Gradle",
      pom: "Maven",
      
      // Other
      r: "R",
      m: "Objective-C",
      mm: "Objective-C++",
      dart: "Dart",
      elm: "Elm",
      ex: "Elixir",
      exs: "Elixir",
      erl: "Erlang",
      hrl: "Erlang",
      nim: "Nim",
      zig: "Zig",
      v: "V",
      jl: "Julia",
      cr: "Crystal",
      pas: "Pascal",
      pp: "Pascal",
      ada: "Ada",
      ads: "Ada",
      adb: "Ada",
    }

    let language = languageMap[extension || ""] || "Plain Text"
    
    // If extension not recognized, try to detect from content
    if (language === "Plain Text" && content.trim()) {
      const detectedLanguage = detectLanguageFromContent(content)
      if (detectedLanguage) {
        language = detectedLanguage
      }
    }

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
