"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Folder,
  FolderOpen,
  File,
  FileText,
  Search,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Code,
  ImageIcon,
  Settings,
  Upload,
  FolderPlus,
  FilePlus,
  Trash2,
  Edit,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface FileNode {
  name: string
  type: "file" | "folder"
  path: string
  children?: FileNode[]
  expanded?: boolean
  content?: string
}

interface FileExplorerProps {
  currentFile: string
  onFileSelect: (file: string) => void
  fileContents: Record<string, string>
  onFileContentChange: (file: string, content: string) => void
}

const initialFileTree: FileNode[] = []

export function FileExplorer({ currentFile, onFileSelect, fileContents, onFileContentChange }: FileExplorerProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>(initialFileTree)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredTree, setFilteredTree] = useState<FileNode[]>(initialFileTree)
  const [showNewFileInput, setShowNewFileInput] = useState(false)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [creatingInPath, setCreatingInPath] = useState("")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; node: FileNode } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Load file tree from localStorage on component mount
  useEffect(() => {
    const savedFileTree = localStorage.getItem('pointer-ide-file-tree')
    if (savedFileTree) {
      try {
        const parsedFileTree = JSON.parse(savedFileTree)
        setFileTree(parsedFileTree)
        setFilteredTree(parsedFileTree)
      } catch (error) {
        console.error('Failed to parse saved file tree:', error)
      }
    }
  }, [])

  // Save file tree to localStorage whenever it changes
  useEffect(() => {
    if (fileTree.length > 0) {
      localStorage.setItem('pointer-ide-file-tree', JSON.stringify(fileTree))
    }
  }, [fileTree])

  const initializeContents = (nodes: FileNode[]) => {
    nodes.forEach((node) => {
      if (node.type === "file" && node.content && !fileContents[node.path]) {
        onFileContentChange(node.path, node.content)
      }
      if (node.children) {
        initializeContents(node.children)
      }
    })
  }

  const getFileIcon = (fileName: string, isFolder: boolean, isOpen?: boolean) => {
    if (isFolder) {
      return isOpen ? <FolderOpen className="h-4 w-4 text-accent" /> : <Folder className="h-4 w-4 text-accent" />
    }

    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "tsx":
      case "ts":
      case "js":
      case "jsx":
        return <Code className="h-4 w-4 text-blue-400" />
      case "css":
      case "scss":
      case "sass":
        return <FileText className="h-4 w-4 text-pink-400" />
      case "json":
        return <Settings className="h-4 w-4 text-yellow-400" />
      case "md":
        return <FileText className="h-4 w-4 text-green-400" />
      case "svg":
      case "png":
      case "jpg":
      case "jpeg":
        return <ImageIcon className="h-4 w-4 text-purple-400" />
      default:
        return <File className="h-4 w-4 text-muted-foreground" />
    }
  }

  const toggleFolder = (path: string) => {
    const updateTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === path && node.type === "folder") {
          return { ...node, expanded: !node.expanded }
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) }
        }
        return node
      })
    }

    const newTree = updateTree(fileTree)
    setFileTree(newTree)
    setFilteredTree(newTree)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredTree(fileTree)
      return
    }

    const filterTree = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .map((node) => {
          if (node.type === "file" && node.name.toLowerCase().includes(query.toLowerCase())) {
            return node
          }
          if (node.type === "folder" && node.children) {
            const filteredChildren = filterTree(node.children)
            if (filteredChildren.length > 0) {
              return { ...node, children: filteredChildren, expanded: true }
            }
          }
          return null
        })
        .filter(Boolean) as FileNode[]
    }

    setFilteredTree(filterTree(fileTree))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        console.log("[v0] Uploaded file:", file.name, "Content:", content)

        onFileContentChange(file.name, content)

        const newFile: FileNode = {
          name: file.name,
          type: "file",
          path: file.name,
          content: content,
        }

        setFileTree((prev) => [...prev, newFile])
        setFilteredTree((prev) => [...prev, newFile])

        onFileSelect(file.name)
      }
      reader.readAsText(file)
    })

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleFolderUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const folderStructure: Record<string, FileNode[]> = {}

    Array.from(files).forEach((file) => {
      const pathParts = file.webkitRelativePath.split("/")
      const fileName = pathParts.pop()!
      const folderPath = pathParts.join("/")

      if (!folderStructure[folderPath]) {
        folderStructure[folderPath] = []
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        console.log("[v0] Uploaded folder file:", file.webkitRelativePath, "Content:", content)

        onFileContentChange(file.webkitRelativePath, content)

        folderStructure[folderPath].push({
          name: fileName,
          type: "file",
          path: file.webkitRelativePath,
          content: content,
        })
      }
      reader.readAsText(file)
    })

    setTimeout(() => {
      Object.entries(folderStructure).forEach(([folderPath, files]) => {
        if (folderPath) {
          const folderNode: FileNode = {
            name: folderPath.split("/").pop()!,
            type: "folder",
            path: folderPath,
            expanded: true,
            children: files,
          }
          setFileTree((prev) => [...prev, folderNode])
          setFilteredTree((prev) => [...prev, folderNode])
        } else {
          setFileTree((prev) => [...prev, ...files])
          setFilteredTree((prev) => [...prev, ...files])
        }
      })
    }, 100)
  }

  const createNewFile = () => {
    const fileName = prompt("Enter file name:")
    if (!fileName) return

    const defaultContent = getDefaultFileContent(fileName)

    onFileContentChange(fileName, defaultContent)

    const newFile: FileNode = {
      name: fileName,
      type: "file",
      path: fileName,
      content: defaultContent,
    }

    setFileTree((prev) => [...prev, newFile])
    setFilteredTree((prev) => [...prev, newFile])
    onFileSelect(fileName)
  }

  const createNewFolder = () => {
    const folderName = prompt("Enter folder name:")
    if (!folderName) return

    const newFolder: FileNode = {
      name: folderName,
      type: "folder",
      path: folderName,
      expanded: false,
      children: [],
    }

    setFileTree((prev) => [...prev, newFolder])
    setFilteredTree((prev) => [...prev, newFolder])
  }

  const getDefaultFileContent = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    const templates: Record<string, string> = {
      js: `// ${fileName}
console.log("Hello from ${fileName}");
`,
      jsx: `import React from 'react';

function ${fileName.replace(".jsx", "").replace(/[^a-zA-Z0-9]/g, "")}() {
  return (
    <div>
      <h1>Hello from ${fileName}</h1>
    </div>
  );
}

export default ${fileName.replace(".jsx", "").replace(/[^a-zA-Z0-9]/g, "")};
`,
      ts: `// ${fileName}
console.log("Hello from ${fileName}");
`,
      tsx: `import React from 'react';

interface Props {}

function ${fileName.replace(".tsx", "").replace(/[^a-zA-Z0-9]/g, "")}({}: Props) {
  return (
    <div>
      <h1>Hello from ${fileName}</h1>
    </div>
  );
}

export default ${fileName.replace(".tsx", "").replace(/[^a-zA-Z0-9]/g, "")};
`,
      py: `# ${fileName}
print("Hello from ${fileName}")
`,
      css: `/* ${fileName} */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}
`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName.replace(".html", "")}</title>
</head>
<body>
  <h1>Hello from ${fileName}</h1>
</body>
</html>
`,
      md: `# ${fileName.replace(".md", "")}

Welcome to your new markdown file!
`,
      json: `{
  "name": "${fileName.replace(".json", "")}",
  "version": "1.0.0"
}
`,
    }

    return (
      templates[extension || ""] ||
      `// ${fileName}
// Start coding here!
`
    )
  }

  const deleteNode = (pathToDelete: string) => {
    const deleteFromTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.filter((node) => {
        if (node.path === pathToDelete) {
          return false
        }
        if (node.children) {
          node.children = deleteFromTree(node.children)
        }
        return true
      })
    }

    const newTree = deleteFromTree(fileTree)
    setFileTree(newTree)
    setFilteredTree(newTree)

    const newContents = { ...fileContents }
    delete newContents[pathToDelete]

    if (currentFile === pathToDelete) {
      onFileSelect("")
    }
  }

  const renameNode = (oldPath: string, newName: string) => {
    const renameInTree = (nodes: FileNode[]): FileNode[] => {
      return nodes.map((node) => {
        if (node.path === oldPath) {
          const pathParts = oldPath.split("/")
          pathParts[pathParts.length - 1] = newName
          const newPath = pathParts.join("/")

          return { ...node, name: newName, path: newPath }
        }
        if (node.children) {
          return { ...node, children: renameInTree(node.children) }
        }
        return node
      })
    }

    const newTree = renameInTree(fileTree)
    setFileTree(newTree)
    setFilteredTree(newTree)

    const pathParts = oldPath.split("/")
    pathParts[pathParts.length - 1] = newName
    const newPath = pathParts.join("/")

    if (fileContents[oldPath]) {
      onFileContentChange(newPath, fileContents[oldPath])
      const newContents = { ...fileContents }
      delete newContents[oldPath]
    }

    if (currentFile === oldPath) {
      onFileSelect(newPath)
    }
  }

  const duplicateNode = (path: string) => {
    const node = findNodeByPath(fileTree, path)
    if (!node) return

    const baseName = node.name.includes(".") ? node.name.substring(0, node.name.lastIndexOf(".")) : node.name
    const extension = node.name.includes(".") ? node.name.substring(node.name.lastIndexOf(".")) : ""

    const newName = `${baseName}_copy${extension}`
    const newPath = path.includes("/") ? path.substring(0, path.lastIndexOf("/")) + "/" + newName : newName

    const newNode: FileNode = {
      ...node,
      name: newName,
      path: newPath,
    }

    setFileTree((prev) => [...prev, newNode])
    setFilteredTree((prev) => [...prev, newNode])

    if (node.type === "file" && fileContents[path]) {
      onFileContentChange(newPath, fileContents[path])
    }
  }

  const findNodeByPath = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) return node
      if (node.children) {
        const found = findNodeByPath(node.children, path)
        if (found) return found
      }
    }
    return null
  }

  const clearAllFiles = () => {
    if (confirm('Are you sure you want to clear all files? This action cannot be undone.')) {
      setFileTree([])
      setFilteredTree([])
      localStorage.removeItem('pointer-ide-file-tree')
      onFileSelect('')
    }
  }


  const handleCreateFile = (path: string = "") => {
    setCreatingInPath(path)
    setShowNewFileInput(true)
    setNewFileName("")
    setTimeout(() => fileInputRef.current?.focus(), 100)
  }

  const handleCreateFolder = (path: string = "") => {
    setCreatingInPath(path)
    setShowNewFolderInput(true)
    setNewFolderName("")
    setTimeout(() => folderInputRef.current?.focus(), 100)
  }

  const confirmCreateFile = () => {
    if (!newFileName.trim()) return
    
    const fullPath = creatingInPath ? `${creatingInPath}/${newFileName}` : newFileName
    const defaultContent = `// ${newFileName}\n// Start coding here!\n`
    
    // Add to file contents
    onFileContentChange(fullPath, defaultContent)
    
    // Add to file tree
    const newNode: FileNode = {
      name: newFileName,
      type: "file",
      path: fullPath,
      content: defaultContent
    }
    
    if (creatingInPath) {
      // Add to existing folder
      const updateTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === creatingInPath && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), newNode]
            }
          }
          if (node.children) {
            return { ...node, children: updateTree(node.children) }
          }
          return node
        })
      }
      setFileTree(updateTree(fileTree))
    } else {
      // Add to root
      setFileTree([...fileTree, newNode])
    }
    
    setShowNewFileInput(false)
    setNewFileName("")
    setCreatingInPath("")
    onFileSelect(fullPath)
  }

  const confirmCreateFolder = () => {
    if (!newFolderName.trim()) return
    
    const fullPath = creatingInPath ? `${creatingInPath}/${newFolderName}` : newFolderName
    
    const newNode: FileNode = {
      name: newFolderName,
      type: "folder",
      path: fullPath,
      children: [],
      expanded: false
    }
    
    if (creatingInPath) {
      // Add to existing folder
      const updateTree = (nodes: FileNode[]): FileNode[] => {
        return nodes.map(node => {
          if (node.path === creatingInPath && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), newNode]
            }
          }
          if (node.children) {
            return { ...node, children: updateTree(node.children) }
          }
          return node
        })
      }
      setFileTree(updateTree(fileTree))
    } else {
      // Add to root
      setFileTree([...fileTree, newNode])
    }
    
    setShowNewFolderInput(false)
    setNewFolderName("")
    setCreatingInPath("")
  }

  const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, node })
  }

  const handleCloseContextMenu = () => {
    setContextMenu(null)
  }

  const renderFileTree = (nodes: FileNode[], depth = 0) => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 text-sm cursor-pointer hover:bg-accent/20 smooth-transition rounded-sm",
            currentFile === node.path && "bg-accent/30 text-accent-foreground",
            "group",
          )}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            if (node.type === "folder") {
              toggleFolder(node.path)
            } else {
              onFileSelect(node.path)
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
        >
          {node.type === "folder" && (
            <div className="flex items-center">
              {node.expanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          )}
          {node.type === "file" && <div className="w-3" />}
          {getFileIcon(node.name, node.type === "folder", node.expanded)}
          <span className="flex-1 truncate">{node.name}</span>
          <div className="opacity-0 group-hover:opacity-100 smooth-transition">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    const newName = prompt("Enter new name:", node.name)
                    if (newName && newName !== node.name) {
                      renameNode(node.path, newName)
                    }
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    duplicateNode(node.path)
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    if (confirm(`Are you sure you want to delete ${node.name}?`)) {
                      deleteNode(node.path)
                    }
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {node.type === "folder" && node.expanded && node.children && (
          <div>{renderFileTree(node.children, depth + 1)}</div>
        )}
      </div>
    ))
  }

  return (
    <div className="h-full flex flex-col bg-sidebar text-sidebar-foreground" onClick={handleCloseContextMenu}>
      <div className="p-3 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-primary">Explorer</h2>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCreateFile()} title="New File">
              <FilePlus className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleCreateFolder()} title="New Folder">
              <FolderPlus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Files"
            >
              <Upload className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => folderInputRef.current?.click()}
              title="Upload Folder"
            >
              <FolderOpen className="h-3 w-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={clearAllFiles}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Files
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          style={{ display: "none" }}
          accept=".js,.jsx,.ts,.tsx,.py,.css,.html,.json,.md,.txt,.sql,.php,.java,.cpp,.c,.go,.rs,.rb"
        />

        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory=""
          onChange={handleFolderUpload}
          style={{ display: "none" }}
        />

        {/* Inline File Creation */}
        {showNewFileInput && (
          <div className="p-2 border-b border-sidebar-border">
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter filename (e.g., script.js)"
                className="text-xs h-7"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmCreateFile()
                  } else if (e.key === 'Escape') {
                    setShowNewFileInput(false)
                    setNewFileName("")
                    setCreatingInPath("")
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={confirmCreateFile} className="h-7 px-2 text-xs">
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setShowNewFileInput(false)
                setNewFileName("")
                setCreatingInPath("")
              }} className="h-7 px-2 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {showNewFolderInput && (
          <div className="p-2 border-b border-sidebar-border">
            <div className="flex gap-2">
              <Input
                ref={folderInputRef}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                className="text-xs h-7"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    confirmCreateFolder()
                  } else if (e.key === 'Escape') {
                    setShowNewFolderInput(false)
                    setNewFolderName("")
                    setCreatingInPath("")
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={confirmCreateFolder} className="h-7 px-2 text-xs">
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => {
                setShowNewFolderInput(false)
                setNewFolderName("")
                setCreatingInPath("")
              }} className="h-7 px-2 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-7 h-7 text-xs bg-input border-border"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto editor-scrollbar p-2">
        <div className="space-y-1">{renderFileTree(filteredTree)}</div>
        {filteredTree.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            <p>No files yet</p>
            <p className="text-xs mt-1">Create a new file to get started</p>
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-popover border border-border rounded-md shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-3 py-1 text-left text-sm hover:bg-accent flex items-center gap-2"
            onClick={() => {
              const newName = prompt("Enter new name:", contextMenu.node.name)
              if (newName && newName !== contextMenu.node.name) {
                renameNode(contextMenu.node.path, newName)
              }
              setContextMenu(null)
            }}
          >
            <Edit className="h-4 w-4" />
            Rename
          </button>
          <button
            className="w-full px-3 py-1 text-left text-sm hover:bg-accent flex items-center gap-2"
            onClick={() => {
              duplicateNode(contextMenu.node.path)
              setContextMenu(null)
            }}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </button>
          <hr className="my-1 border-border" />
          <button
            className="w-full px-3 py-1 text-left text-sm hover:bg-accent text-destructive flex items-center gap-2"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${contextMenu.node.name}?`)) {
                deleteNode(contextMenu.node.path)
              }
              setContextMenu(null)
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      )}

      <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>My Project</span>
          <span>{filteredTree.length} items</span>
        </div>
      </div>
    </div>
  )
}
