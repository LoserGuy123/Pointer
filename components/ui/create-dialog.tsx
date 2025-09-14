"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Folder } from "lucide-react"

interface CreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (name: string, type: 'file' | 'folder', extension?: string) => void
  type: 'file' | 'folder'
}

export function CreateDialog({ open, onOpenChange, onCreate, type }: CreateDialogProps) {
  const [name, setName] = useState("")
  const [extension, setExtension] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    const fullName = type === 'file' && extension ? `${name}.${extension}` : name
    onCreate(fullName, type, extension)
    setName("")
    setExtension("")
    onOpenChange(false)
  }

  const fileExtensions = [
    { value: "js", label: "JavaScript (.js)" },
    { value: "ts", label: "TypeScript (.ts)" },
    { value: "jsx", label: "React JSX (.jsx)" },
    { value: "tsx", label: "React TSX (.tsx)" },
    { value: "py", label: "Python (.py)" },
    { value: "cpp", label: "C++ (.cpp)" },
    { value: "c", label: "C (.c)" },
    { value: "cs", label: "C# (.cs)" },
    { value: "java", label: "Java (.java)" },
    { value: "lua", label: "Lua (.lua)" },
    { value: "go", label: "Go (.go)" },
    { value: "rs", label: "Rust (.rs)" },
    { value: "php", label: "PHP (.php)" },
    { value: "rb", label: "Ruby (.rb)" },
    { value: "html", label: "HTML (.html)" },
    { value: "css", label: "CSS (.css)" },
    { value: "json", label: "JSON (.json)" },
    { value: "md", label: "Markdown (.md)" },
    { value: "sql", label: "SQL (.sql)" },
    { value: "sh", label: "Shell Script (.sh)" },
    { value: "txt", label: "Text (.txt)" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === 'file' ? <FileText className="h-5 w-5" /> : <Folder className="h-5 w-5" />}
            Create New {type === 'file' ? 'File' : 'Folder'}
          </DialogTitle>
          <DialogDescription>
            {type === 'file' 
              ? 'Enter a name for your new file and select the file type.'
              : 'Enter a name for your new folder.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder={type === 'file' ? "filename" : "folder name"}
                autoFocus
              />
            </div>
            {type === 'file' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="extension" className="text-right">
                  Type
                </Label>
                <Select value={extension} onValueChange={setExtension}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    {fileExtensions.map((ext) => (
                      <SelectItem key={ext.value} value={ext.value}>
                        {ext.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create {type === 'file' ? 'File' : 'Folder'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
