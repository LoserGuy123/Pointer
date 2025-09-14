"use client"

import { useState, useEffect } from "react"
import { FileExplorer } from "@/components/file-explorer"
import { CodeEditor } from "@/components/code-editor"
import { AIAssistant } from "@/components/ai-assistant"
import { Terminal } from "@/components/terminal"
import { StatusBar } from "@/components/status-bar"
import { MenuBar } from "@/components/menu-bar"
import { Button } from "@/components/ui/button"
import { PanelLeft, PanelRight, TerminalIcon, MessageSquare, FolderOpen } from "lucide-react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function PointerIDE() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true)
  const [rightPanelOpen, setRightPanelOpen] = useState(true)
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [currentFile, setCurrentFile] = useState("")
  const [fileContents, setFileContents] = useState<Record<string, string>>({})

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            if (e.shiftKey) {
              e.preventDefault()
              handleNewFolder()
            } else {
              e.preventDefault()
              handleNewFile()
            }
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
          case "o":
            e.preventDefault()
            handleUpload()
            break
          case "`":
            e.preventDefault()
            setTerminalOpen(!terminalOpen)
            break
          case "b":
            e.preventDefault()
            setLeftPanelOpen(!leftPanelOpen)
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [terminalOpen, leftPanelOpen])

  const handleFileSelect = (file: string) => {
    setCurrentFile(file)
  }

  const handleFileContentChange = (file: string, content: string) => {
    setFileContents((prev) => ({ ...prev, [file]: content }))
  }

  const handleNewFile = () => {
    const fileName = prompt("Enter file name:")
    if (!fileName) return

    const defaultContent = getDefaultFileContent(fileName)
    setFileContents((prev) => ({ ...prev, [fileName]: defaultContent }))
    setCurrentFile(fileName)
  }

  const handleNewFolder = () => {
    alert("Use the folder icon in the file explorer to create new folders")
  }

  const handleSave = () => {
    if (currentFile && fileContents[currentFile]) {
      if ("showSaveFilePicker" in window) {
        ;(async () => {
          try {
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName: currentFile.split("/").pop() || "file.txt",
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
            await writable.write(fileContents[currentFile])
            await writable.close()
          } catch (err) {
            const blob = new Blob([fileContents[currentFile]], { type: "text/plain" })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = currentFile.split("/").pop() || "file.txt"
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
          }
        })()
      } else {
        const blob = new Blob([fileContents[currentFile]], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = currentFile.split("/").pop() || "file.txt"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }
  }

  const handleUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.multiple = true
    input.accept = ".js,.jsx,.ts,.tsx,.py,.css,.html,.json,.md,.txt,.sql,.php,.java,.cpp,.c,.go,.rs,.rb"
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (!files) return

      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setFileContents((prev) => ({ ...prev, [file.name]: content }))
          setCurrentFile(file.name)
        }
        reader.readAsText(file)
      })
    }
    input.click()
  }

  const handleDownload = () => {
    const projectData = {
      files: fileContents,
      structure: Object.keys(fileContents),
    }

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "project-backup.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getDefaultFileContent = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    const templates: Record<string, string> = {
      js: `// ${fileName}\nconsole.log("Hello from ${fileName}");\n`,
      jsx: `import React from 'react';\n\nfunction ${fileName.replace(".jsx", "").replace(/[^a-zA-Z0-9]/g, "")}() {\n  return (\n    <div>\n      <h1>Hello from ${fileName}</h1>\n    </div>\n  );\n}\n\nexport default ${fileName.replace(".jsx", "").replace(/[^a-zA-Z0-9]/g, "")};\n`,
      ts: `// ${fileName}\nconsole.log("Hello from ${fileName}");\n`,
      tsx: `import React from 'react';\n\ninterface Props {}\n\nfunction ${fileName.replace(".tsx", "").replace(/[^a-zA-Z0-9]/g, "")}({}: Props) {\n  return (\n    <div>\n      <h1>Hello from ${fileName}</h1>\n    </div>\n  );\n}\n\nexport default ${fileName.replace(".tsx", "").replace(/[^a-zA-Z0-9]/g, "")};\n`,
      py: `# ${fileName}\nprint("Hello from ${fileName}")\n`,
      css: `/* ${fileName} */\nbody {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 20px;\n}\n`,
      html: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${fileName.replace(".html", "")}</title>\n</head>\n<body>\n  <h1>Hello from ${fileName}</h1>\n</body>\n</html>\n`,
      md: `# ${fileName.replace(".md", "")}\n\nWelcome to your new markdown file!\n`,
      json: `{\n  "name": "${fileName.replace(".json", "")}",\n  "version": "1.0.0"\n}\n`,
    }

    return templates[extension || ""] || `// ${fileName}\n// Start coding here!\n`
  }


  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Menu Bar */}
      <MenuBar
        onNewFile={handleNewFile}
        onNewFolder={handleNewFolder}
        onSave={handleSave}
        onUpload={handleUpload}
        onDownload={handleDownload}
      />

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Left Panel - File Explorer */}
          {leftPanelOpen && (
            <>
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <div className="h-full border-r border-border glass-strong">
                  <FileExplorer
                    currentFile={currentFile}
                    onFileSelect={handleFileSelect}
                    fileContents={fileContents}
                    onFileContentChange={handleFileContentChange}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle />
            </>
          )}

          {/* Center Panel - Code Editor */}
          <ResizablePanel defaultSize={rightPanelOpen ? 60 : 80} minSize={30}>
            <div className="h-full flex flex-col">
              {/* Editor Tabs and Controls */}
              <div className="h-12 border-b border-border glass-strong flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    className="smooth-transition"
                  >
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                  <div className="text-sm text-muted-foreground">{currentFile || "No file selected"}</div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTerminalOpen(!terminalOpen)}
                    className="smooth-transition"
                  >
                    <TerminalIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="smooth-transition"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRightPanelOpen(!rightPanelOpen)}
                    className="smooth-transition"
                  >
                    <PanelRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Code Editor and Terminal Layout */}
              <div className="flex-1 flex flex-col">
                <ResizablePanelGroup direction="vertical" className="flex-1">
                  {/* Code Editor */}
                  <ResizablePanel defaultSize={terminalOpen ? 70 : 100} minSize={30}>
                    {currentFile ? (
                      <CodeEditor
                        file={currentFile}
                        content={fileContents[currentFile] || ""}
                        onContentChange={(content) => handleFileContentChange(currentFile, content)}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-background text-muted-foreground">
                        <div className="text-center">
                          <h3 className="text-lg font-medium mb-2">Welcome to Pointer IDE</h3>
                          <p className="text-sm">Create a new file or open an existing one to get started</p>
                        </div>
                      </div>
                    )}
                  </ResizablePanel>

                  {/* Terminal */}
                  {terminalOpen && (
                    <>
                      <ResizableHandle />
                      <ResizablePanel defaultSize={30} minSize={20}>
                        <div className="h-full border-t border-border glass-strong">
                          <Terminal />
                        </div>
                      </ResizablePanel>
                    </>
                  )}
                </ResizablePanelGroup>
              </div>
            </div>
          </ResizablePanel>

          {/* Right Panel - AI Assistant */}
          {rightPanelOpen && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={20} minSize={15} maxSize={40}>
                <div className="h-full border-l border-border glass-strong">
                  <AIAssistant
                    fileContents={fileContents}
                    currentFile={currentFile}
                    onFileContentChange={handleFileContentChange}
                  />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <StatusBar currentFile={currentFile} fileContents={fileContents} />
    </div>
  )
}
