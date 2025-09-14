"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  File,
  Edit,
  Search,
  Settings,
  HelpCircle,
  Zap,
  Download,
  Upload,
  Save,
  FolderOpen,
  Plus,
  Copy,
  Castle as Paste,
  Cat as Cut,
  Undo,
  Redo,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MenuBarProps {
  onNewFile?: () => void
  onNewFolder?: () => void
  onSave?: () => void
  onUpload?: () => void
  onDownload?: () => void
}

export function MenuBar({ onNewFile, onNewFolder, onSave, onUpload, onDownload }: MenuBarProps) {
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleNewFile = () => {
    onNewFile?.()
  }

  const handleNewFolder = () => {
    onNewFolder?.()
  }

  const handleSave = () => {
    onSave?.()
  }

  const handleUpload = () => {
    onUpload?.()
  }

  const handleDownload = () => {
    onDownload?.()
  }

  const handleSearch = () => {
    // Focus search input in file explorer
    const searchInput = document.querySelector('input[placeholder="Search files..."]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const showAbout = () => {
    console.log(`Pointer IDE v1.0.0

AI-powered development environment built with Next.js and React.

Features:
• AI-powered code completion
• File explorer with upload support
• Integrated terminal
• Syntax highlighting
• Project management tools

Built with ❤️ by the Pointer team`)
  }

  const showKeyboardShortcuts = () => {
    setShowShortcuts(true)
    console.log(`Keyboard Shortcuts:

File Operations:
• Ctrl+N - New File
• Ctrl+Shift+N - New Folder
• Ctrl+S - Save File
• Ctrl+O - Upload Files

Editor:
• Ctrl+Z - Undo
• Ctrl+Y - Redo
• Ctrl+C - Copy
• Ctrl+V - Paste
• Ctrl+X - Cut

Navigation:
• Ctrl+F - Search Files
• Ctrl+\` - Toggle Terminal
• Ctrl+B - Toggle File Explorer`)
  }

  const handleUndo = () => {
    // Focus on the code editor and trigger undo
    const editor = document.querySelector('.cm-editor') as HTMLElement
    if (editor) {
      editor.focus()
      document.execCommand('undo')
    }
  }

  const handleRedo = () => {
    // Focus on the code editor and trigger redo
    const editor = document.querySelector('.cm-editor') as HTMLElement
    if (editor) {
      editor.focus()
      document.execCommand('redo')
    }
  }

  const handleCut = () => {
    // Focus on the code editor and trigger cut
    const editor = document.querySelector('.cm-editor') as HTMLElement
    if (editor) {
      editor.focus()
      document.execCommand('cut')
    }
  }

  const handleCopy = () => {
    // Focus on the code editor and trigger copy
    const editor = document.querySelector('.cm-editor') as HTMLElement
    if (editor) {
      editor.focus()
      document.execCommand('copy')
    }
  }

  const handlePaste = () => {
    // Focus on the code editor and trigger paste
    const editor = document.querySelector('.cm-editor') as HTMLElement
    if (editor) {
      editor.focus()
      document.execCommand('paste')
    }
  }

  const showPreferences = () => {
    console.log(`Preferences

Theme: Dark Mode (Default)
Font Size: 14px
Tab Size: 2 spaces
Auto Save: Enabled
AI Model: Gemini 1.5 Flash

To change these settings, please modify the configuration in your project settings.`)
  }

  return (
    <div className="h-8 bg-card border-b border-border glass flex items-center px-2 text-xs">
      <div className="flex items-center gap-1 mr-4">
        <Zap className="h-4 w-4 text-primary" />
        <span className="font-semibold text-primary">Pointer</span>
      </div>

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <File className="h-3 w-3 mr-1" />
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={handleNewFile}>
              <Plus className="h-3 w-3 mr-2" />
              New File
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+N</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNewFolder}>
              <FolderOpen className="h-3 w-3 mr-2" />
              New Folder
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+Shift+N</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleUpload}>
              <Upload className="h-3 w-3 mr-2" />
              Upload Files
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+O</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSave}>
              <Save className="h-3 w-3 mr-2" />
              Save File
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+S</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="h-3 w-3 mr-2" />
              Download Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={handleUndo}>
              <Undo className="h-3 w-3 mr-2" />
              Undo
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleRedo}>
              <Redo className="h-3 w-3 mr-2" />
              Redo
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+Y</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleCut}>
              <Cut className="h-3 w-3 mr-2" />
              Cut
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+X</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
              <Copy className="h-3 w-3 mr-2" />
              Copy
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+C</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handlePaste}>
              <Paste className="h-3 w-3 mr-2" />
              Paste
              <span className="ml-auto text-xs text-muted-foreground">Ctrl+V</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={handleSearch}>
          <Search className="h-3 w-3 mr-1" />
          Search
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={showPreferences}>
              <Settings className="h-3 w-3 mr-2" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem onClick={showKeyboardShortcuts}>
              <HelpCircle className="h-3 w-3 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
              <HelpCircle className="h-3 w-3 mr-1" />
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={showKeyboardShortcuts}>
              <HelpCircle className="h-3 w-3 mr-2" />
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={showAbout}>
              <Zap className="h-3 w-3 mr-2" />
              About Pointer IDE
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
