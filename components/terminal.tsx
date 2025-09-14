"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { TerminalIcon, Plus, X, Minimize2, Maximize2, Settings, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

interface TerminalSession {
  id: string
  name: string
  cwd: string
  history: TerminalLine[]
  isActive: boolean
}

interface TerminalLine {
  id: string
  type: "command" | "output" | "error"
  content: string
  timestamp: Date
}

const mockCommands = {
  help: "Available commands: ls, cd, pwd, npm, git, clear, help, python, node, cat, mkdir, touch",
  ls: "app/\ncomponents/\nlib/\npackage.json\ntsconfig.json\nREADME.md",
  pwd: "/workspace/pointer-ide",
  "npm --version": "10.2.4",
  "node --version": "v20.10.0",
  "python --version": "Python 3.11.0",
  "git status":
    "On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean",
  "npm run dev":
    "Starting development server...\n> pointer-ide@0.1.0 dev\n> next dev\n\n✓ Ready on http://localhost:3000",
  "npm install": "Installing dependencies...\n\nadded 1247 packages in 23s",
  "cat package.json":
    '{\n  "name": "pointer-ide",\n  "version": "0.1.0",\n  "private": true,\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "start": "next start"\n  }\n}',
  "python -c \"print('Hello from Python!')\"": "Hello from Python!",
  "node -e \"console.log('Hello from Node!')\"": "Hello from Node!",
}

export function Terminal() {
  const [sessions, setSessions] = useState<TerminalSession[]>([
    {
      id: "1",
      name: "Terminal 1",
      cwd: "/workspace/pointer-ide",
      history: [
        {
          id: "1",
          type: "output",
          content: "Welcome to Pointer IDE Terminal",
          timestamp: new Date(),
        },
        {
          id: "2",
          type: "output",
          content: "Type 'help' for available commands",
          timestamp: new Date(),
        },
      ],
      isActive: true,
    },
  ])
  const [currentInput, setCurrentInput] = useState("")
  const [isMinimized, setIsMinimized] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeSession = sessions.find((s) => s.isActive) || sessions[0]

  const scrollToBottom = () => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeSession?.history])

  const executeCommand = (command: string) => {
    if (!command.trim()) return

    const newCommandLine: TerminalLine = {
      id: Date.now().toString(),
      type: "command",
      content: `${activeSession.cwd} $ ${command}`,
      timestamp: new Date(),
    }

    let outputLine: TerminalLine | null = null

    if (command === "clear") {
      setSessions((prev) =>
        prev.map((session) => (session.id === activeSession.id ? { ...session, history: [] } : session)),
      )
      return
    }

    const output = mockCommands[command as keyof typeof mockCommands]
    if (output) {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: output,
        timestamp: new Date(),
      }
    } else if (command.startsWith("cd ")) {
      const path = command.substring(3).trim()
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: `Changed directory to ${path}`,
        timestamp: new Date(),
      }
      // Update cwd
      setSessions((prev) =>
        prev.map((session) => (session.id === activeSession.id ? { ...session, cwd: path } : session)),
      )
    } else if (command.startsWith("mkdir ")) {
      const dirName = command.substring(6).trim()
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: `Directory '${dirName}' created`,
        timestamp: new Date(),
      }
    } else if (command.startsWith("touch ")) {
      const fileName = command.substring(6).trim()
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: `File '${fileName}' created`,
        timestamp: new Date(),
      }
    } else if (command.startsWith("echo ")) {
      const text = command.substring(5).trim()
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: text.replace(/['"]/g, ""),
        timestamp: new Date(),
      }
    } else if (command.includes("python") && command.includes("-c")) {
      // Handle Python one-liners
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: "Python execution completed",
        timestamp: new Date(),
      }
    } else if (command.includes("node") && command.includes("-e")) {
      // Handle Node one-liners
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "output",
        content: "Node.js execution completed",
        timestamp: new Date(),
      }
    } else {
      outputLine = {
        id: (Date.now() + 1).toString(),
        type: "error",
        content: `Command not found: ${command}\nType 'help' for available commands`,
        timestamp: new Date(),
      }
    }

    setSessions((prev) =>
      prev.map((session) =>
        session.id === activeSession.id
          ? {
              ...session,
              history: [...session.history, newCommandLine, ...(outputLine ? [outputLine] : [])],
            }
          : session,
      ),
    )

    setCurrentInput("")
  }

  const createNewSession = () => {
    const newSession: TerminalSession = {
      id: Date.now().toString(),
      name: `Terminal ${sessions.length + 1}`,
      cwd: "/workspace/pointer-ide",
      history: [
        {
          id: Date.now().toString(),
          type: "output",
          content: "New terminal session started",
          timestamp: new Date(),
        },
      ],
      isActive: false,
    }

    setSessions((prev) => [...prev, newSession])
  }

  const switchSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((session) => ({
        ...session,
        isActive: session.id === sessionId,
      })),
    )
  }

  const closeSession = (sessionId: string) => {
    if (sessions.length === 1) return // Don't close the last session

    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId)
      if (prev.find((s) => s.id === sessionId)?.isActive && filtered.length > 0) {
        filtered[0].isActive = true
      }
      return filtered
    })
  }

  const copyOutput = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground border-t border-border">
      {/* Terminal Header */}
      <div className="h-10 bg-card border-b border-border glass flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TerminalIcon className="h-4 w-4 text-accent" />
          <span className="text-sm font-medium">Terminal</span>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={createNewSession}>
            <Plus className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Settings className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsMinimized(!isMinimized)}>
            {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Terminal Tabs */}
          {sessions.length > 1 && (
            <div className="flex bg-muted/20 border-b border-border">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs cursor-pointer border-r border-border smooth-transition",
                    session.isActive ? "bg-background text-foreground" : "hover:bg-muted/30",
                  )}
                  onClick={() => switchSession(session.id)}
                >
                  <span>{session.name}</span>
                  {sessions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeSession(session.id)
                      }}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Terminal Content */}
          <div
            ref={terminalRef}
            className="flex-1 overflow-y-auto editor-scrollbar p-4 font-mono text-sm bg-background"
            onClick={() => inputRef.current?.focus()}
          >
            {activeSession.history.map((line) => (
              <div
                key={line.id}
                className={cn(
                  "mb-1 group relative",
                  line.type === "command" && "text-accent font-medium",
                  line.type === "error" && "text-destructive",
                  line.type === "output" && "text-foreground",
                )}
              >
                <div className="flex items-start justify-between">
                  <pre className="whitespace-pre-wrap flex-1">{line.content}</pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 smooth-transition ml-2"
                    onClick={() => copyOutput(line.content)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Current Input Line */}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-accent font-medium">{activeSession.cwd} $</span>
              <Input
                ref={inputRef}
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    executeCommand(currentInput)
                  } else if (e.key === "Tab") {
                    e.preventDefault()
                    // Tab completion could be implemented here
                  }
                }}
                className="flex-1 bg-transparent border-none p-0 h-auto font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Type a command..."
                autoFocus
              />
            </div>
          </div>

          {/* Terminal Footer */}
          <div className="h-6 bg-card border-t border-border glass flex items-center justify-between px-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Session: {activeSession.name}</span>
              <span>CWD: {activeSession.cwd}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Lines: {activeSession.history.length}</span>
              <span>Shell: bash</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
