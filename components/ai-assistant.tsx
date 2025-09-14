"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Send,
  Bot,
  User,
  Code,
  Lightbulb,
  Bug,
  Zap,
  MoreHorizontal,
  Copy,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Check,
  X,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt?: number
  isTyping?: boolean
  codeBlocks?: Array<{ language: string; code: string }>
}

interface Suggestion {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: string
}

interface AIAssistantProps {
  fileContents: Record<string, string>
  currentFile: string
  onFileContentChange: (file: string, content: string) => void
}

function TypingMessage({ content, onComplete }: { content: string; onComplete: () => void }) {
  const [displayedContent, setDisplayedContent] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < content.length) {
      const timer = setTimeout(() => {
        setDisplayedContent((prev) => prev + content[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, 1) // Ultra-fast typing for better responsiveness

      return () => clearTimeout(timer)
    } else {
      onComplete()
    }
  }, [currentIndex, content, onComplete])

  return (
    <ReactMarkdown
      className="prose prose-sm dark:prose-invert max-w-none"
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        code: ({ children, className }) => {
          const isInline = !className
          return isInline ? (
            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
          ) : (
            <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
              <code>{children}</code>
            </pre>
          )
        },
        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        em: ({ children }) => <em className="italic">{children}</em>,
        ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
        li: ({ children }) => <li className="mb-1">{children}</li>,
      }}
    >
      {displayedContent}
    </ReactMarkdown>
  )
}

const quickSuggestions: Suggestion[] = [
  {
    id: "1",
    title: "Explain Code",
    description: "Get explanation of current file",
    icon: <Lightbulb className="h-4 w-4" />,
    action: "explain",
  },
  {
    id: "2",
    title: "Fix Bug",
    description: "Find and fix issues in code",
    icon: <Bug className="h-4 w-4" />,
    action: "debug",
  },
  {
    id: "3",
    title: "Generate Code",
    description: "Create code from description",
    icon: <Code className="h-4 w-4" />,
    action: "generate",
  },
  {
    id: "4",
    title: "Optimize",
    description: "Improve code performance",
    icon: <Zap className="h-4 w-4" />,
    action: "optimize",
  },
]

export function AIAssistant({ fileContents, currentFile, onFileContentChange }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load chat history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('pointer-ide-chat-history')
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages)
        setMessages(parsedMessages)
      } catch (error) {
        console.error('Failed to parse saved chat history:', error)
      }
    }
  }, [])

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('pointer-ide-chat-history', JSON.stringify(messages))
    }
  }, [messages])

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest",
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      createdAt: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context: {
            currentFile,
            fileContent: fileContents[currentFile] || "",
            allFiles: Object.keys(fileContents),
            projectStructure: Object.keys(fileContents).reduce(
              (acc, file) => {
                acc[file] = fileContents[file].split("\n").length
                return acc
              },
              {} as Record<string, number>,
            ),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        createdAt: Date.now(),
        isTyping: true,
        codeBlocks: data.codeBlocks || null,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.",
        createdAt: Date.now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleTypingComplete = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, isTyping: false } : msg)))
  }

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const currentFileContent = fileContents[currentFile] || ""
    const hasContent = currentFileContent.trim().length > 0

    const prompts = {
      explain: hasContent
        ? `Please explain the code in ${currentFile} and how it works.`
        : "Please explain how to get started with coding in this project.",
      debug: hasContent
        ? `Help me find and fix any bugs or issues in ${currentFile}.`
        : "Help me understand common debugging techniques for web development.",
      generate: "Generate a React component with TypeScript for a modern UI.",
      optimize: hasContent
        ? `Optimize the code in ${currentFile} for better performance and readability.`
        : "Give me tips for writing optimized and clean code.",
    }
    setInput(prompts[suggestion.action as keyof typeof prompts])
    inputRef.current?.focus()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const applyCodeToFile = (code: string) => {
    if (currentFile) {
      onFileContentChange(currentFile, code)
    }
  }

  const clearChatHistory = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([])
      localStorage.removeItem('pointer-ide-chat-history')
    }
  }

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground">
      {/* AI Assistant Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">AI Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by Gemini</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={clearChatHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Chat History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Suggestions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b border-sidebar-border">
          <h3 className="text-xs font-medium text-muted-foreground mb-3">Quick Actions</h3>
          {currentFile && (
            <div className="mb-3 p-2 bg-muted/20 rounded text-xs">
              <div className="font-medium">Current File: {currentFile}</div>
              <div className="text-muted-foreground">
                {fileContents[currentFile] ? `${fileContents[currentFile].split("\n").length} lines` : "Empty file"}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            {quickSuggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="p-3 cursor-pointer hover:bg-accent/20 smooth-transition border-border/50 hover-lift card-modern"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-start gap-2">
                  <div className="text-accent mt-0.5">{suggestion.icon}</div>
                  <div>
                    <div className="text-xs font-medium">{suggestion.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto editor-scrollbar p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}>
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                message.role === "user" ? "bg-accent/20" : "bg-primary/20",
              )}
            >
              {message.role === "user" ? (
                <User className="h-4 w-4 text-accent" />
              ) : (
                <Bot className="h-4 w-4 text-primary" />
              )}
            </div>

            <div className={cn("flex-1 max-w-[80%]", message.role === "user" && "text-right")}>
              <div
                className={cn(
                  "rounded-lg p-3 text-sm",
                  message.role === "user" ? "bg-accent text-accent-foreground ml-auto" : "bg-card text-card-foreground",
                )}
              >
                {message.role === "assistant" ? (
                  message.isTyping ? (
                    <TypingMessage content={message.content} onComplete={() => handleTypingComplete(message.id)} />
                  ) : (
                    <ReactMarkdown
                      className="prose prose-sm dark:prose-invert max-w-none"
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        code: ({ children, className }) => {
                          const isInline = !className
                          return isInline ? (
                            <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
                          ) : (
                            <pre className="bg-muted p-2 rounded text-xs font-mono overflow-x-auto">
                              <code>{children}</code>
                            </pre>
                          )
                        },
                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                        li: ({ children }) => <li className="mb-1">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {message.role === "assistant" && !message.isTyping && message.codeBlocks && currentFile && (
                <div className="mt-2 space-y-2">
                  {message.codeBlocks.map((block, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted/20 rounded text-xs">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="flex-1 text-muted-foreground">
                        Apply {block.language} code to {currentFile}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-green-600 hover:text-green-700"
                        onClick={() => applyCodeToFile(block.code)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-red-600 hover:text-red-700">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message actions */}
              {message.role === "assistant" && !message.isTyping && (
                <div className="flex items-center gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => copyToClipboard(message.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                  <span className="text-xs text-muted-foreground ml-2">
                    {new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-card text-card-foreground rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-sidebar-border">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI anything about your code..."
            className="flex-1 bg-input border-border"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} size="sm" className="px-3 btn-primary">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
