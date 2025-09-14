"use client"

import { useEffect, useState } from "react"

interface SyntaxHighlighterProps {
  code: string
  language: string
  className?: string
}

export function SyntaxHighlighter({ code, language, className = "" }: SyntaxHighlighterProps) {
  const [highlightedCode, setHighlightedCode] = useState(code)

  useEffect(() => {
    const highlightCode = (code: string, lang: string): string => {
      const patterns: Record<string, Array<{ pattern: RegExp; className: string }>> = {
        javascript: [
          {
            pattern: /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default)\b/g,
            className: "text-purple-400",
          },
          { pattern: /\b(true|false|null|undefined)\b/g, className: "text-orange-400" },
          { pattern: /"([^"\\]|\\.)*"/g, className: "text-green-400" },
          { pattern: /'([^'\\]|\\.)*'/g, className: "text-green-400" },
          { pattern: /`([^`\\]|\\.)*`/g, className: "text-green-400" },
          { pattern: /\/\/.*$/gm, className: "text-gray-500 italic" },
          { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
          { pattern: /\b\d+\.?\d*\b/g, className: "text-blue-400" },
          { pattern: /[{}[\]()]/g, className: "text-yellow-400" },
        ],
        typescript: [
          {
            pattern:
              /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|interface|type|enum)\b/g,
            className: "text-purple-400",
          },
          { pattern: /\b(string|number|boolean|any|void|never|unknown)\b/g, className: "text-blue-300" },
          { pattern: /\b(true|false|null|undefined)\b/g, className: "text-orange-400" },
          { pattern: /"([^"\\]|\\.)*"/g, className: "text-green-400" },
          { pattern: /'([^'\\]|\\.)*'/g, className: "text-green-400" },
          { pattern: /`([^`\\]|\\.)*`/g, className: "text-green-400" },
          { pattern: /\/\/.*$/gm, className: "text-gray-500 italic" },
          { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
          { pattern: /\b\d+\.?\d*\b/g, className: "text-blue-400" },
          { pattern: /[{}[\]()]/g, className: "text-yellow-400" },
        ],
        python: [
          {
            pattern:
              /\b(def|class|if|elif|else|for|while|try|except|finally|with|import|from|as|return|yield|lambda|pass|break|continue)\b/g,
            className: "text-purple-400",
          },
          { pattern: /\b(True|False|None)\b/g, className: "text-orange-400" },
          { pattern: /"([^"\\]|\\.)*"/g, className: "text-green-400" },
          { pattern: /'([^'\\]|\\.)*'/g, className: "text-green-400" },
          { pattern: /"""[\s\S]*?"""/g, className: "text-green-400" },
          { pattern: /#.*$/gm, className: "text-gray-500 italic" },
          { pattern: /\b\d+\.?\d*\b/g, className: "text-blue-400" },
          { pattern: /[{}[\]()]/g, className: "text-yellow-400" },
        ],
        css: [
          {
            pattern:
              /\b(color|background|margin|padding|border|width|height|display|flex|grid|position|top|left|right|bottom)\b/g,
            className: "text-blue-400",
          },
          { pattern: /#[a-fA-F0-9]{3,6}\b/g, className: "text-green-400" },
          { pattern: /\b\d+(?:px|em|rem|%|vh|vw)\b/g, className: "text-orange-400" },
          { pattern: /"([^"\\]|\\.)*"/g, className: "text-green-400" },
          { pattern: /'([^'\\]|\\.)*'/g, className: "text-green-400" },
          { pattern: /\/\*[\s\S]*?\*\//g, className: "text-gray-500 italic" },
          { pattern: /[{}[\]()]/g, className: "text-yellow-400" },
        ],
        html: [
          { pattern: /<\/?[a-zA-Z][^>]*>/g, className: "text-blue-400" },
          { pattern: /\b(class|id|src|href|alt|title)=/g, className: "text-purple-400" },
          { pattern: /"([^"\\]|\\.)*"/g, className: "text-green-400" },
          { pattern: /'([^'\\]|\\.)*'/g, className: "text-green-400" },
          { pattern: /<!--[\s\S]*?-->/g, className: "text-gray-500 italic" },
        ],
        json: [
          { pattern: /"([^"\\]|\\.)*":/g, className: "text-blue-400" },
          { pattern: /"([^"\\]|\\.)*"/g, className: "text-green-400" },
          { pattern: /\b(true|false|null)\b/g, className: "text-orange-400" },
          { pattern: /\b\d+\.?\d*\b/g, className: "text-blue-400" },
          { pattern: /[{}[\],]/g, className: "text-yellow-400" },
        ],
      }

      const langPatterns = patterns[lang] || patterns.javascript
      let highlighted = code

      highlighted = highlighted
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")

      // Apply syntax highlighting
      langPatterns.forEach(({ pattern, className }) => {
        highlighted = highlighted.replace(pattern, (match) => {
          return `<span class="${className}">${match}</span>`
        })
      })

      return highlighted
    }

    setHighlightedCode(highlightCode(code, language))
  }, [code, language])

  return (
    <div className={`font-mono text-sm leading-6 ${className}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
  )
}
