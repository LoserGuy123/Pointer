"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  FolderOpen,
  GitBranch,
  Package,
  Settings,
  Plus,
  Search,
  Clock,
  Users,
  Star,
  ExternalLink,
  Download,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { JSX } from "react/jsx-runtime"

interface Project {
  id: string
  name: string
  path: string
  type: "react" | "next" | "vue" | "node" | "python" | "other"
  lastOpened: Date
  gitBranch?: string
  dependencies: number
  collaborators: number
  starred: boolean
  description?: string
}

interface RecentFile {
  id: string
  name: string
  path: string
  lastModified: Date
  project: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Pointer IDE",
    path: "/workspace/pointer-ide",
    type: "next",
    lastOpened: new Date(),
    gitBranch: "main",
    dependencies: 47,
    collaborators: 3,
    starred: true,
    description: "AI-powered code editor and development environment",
  },
  {
    id: "2",
    name: "E-commerce Dashboard",
    path: "/workspace/ecommerce-dashboard",
    type: "react",
    lastOpened: new Date(Date.now() - 86400000),
    gitBranch: "feature/analytics",
    dependencies: 32,
    collaborators: 5,
    starred: false,
    description: "Modern admin dashboard for e-commerce platform",
  },
  {
    id: "3",
    name: "API Gateway",
    path: "/workspace/api-gateway",
    type: "node",
    lastOpened: new Date(Date.now() - 172800000),
    gitBranch: "develop",
    dependencies: 18,
    collaborators: 2,
    starred: true,
    description: "Microservices API gateway with authentication",
  },
]

const mockRecentFiles: RecentFile[] = [
  {
    id: "1",
    name: "code-editor.tsx",
    path: "components/code-editor.tsx",
    lastModified: new Date(),
    project: "Pointer IDE",
  },
  {
    id: "2",
    name: "dashboard.tsx",
    path: "pages/dashboard.tsx",
    lastModified: new Date(Date.now() - 3600000),
    project: "E-commerce Dashboard",
  },
  {
    id: "3",
    name: "auth.middleware.ts",
    path: "src/middleware/auth.middleware.ts",
    lastModified: new Date(Date.now() - 7200000),
    project: "API Gateway",
  },
]

export function ProjectManager() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(mockRecentFiles)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"projects" | "recent" | "templates">("projects")

  const getProjectIcon = (type: Project["type"]) => {
    const iconClass = "h-5 w-5"
    switch (type) {
      case "react":
        return <div className={cn(iconClass, "bg-blue-500 rounded")} />
      case "next":
        return <div className={cn(iconClass, "bg-black rounded")} />
      case "vue":
        return <div className={cn(iconClass, "bg-green-500 rounded")} />
      case "node":
        return <div className={cn(iconClass, "bg-green-600 rounded")} />
      case "python":
        return <div className={cn(iconClass, "bg-yellow-500 rounded")} />
      default:
        return <div className={cn(iconClass, "bg-gray-500 rounded")} />
    }
  }

  const toggleStar = (projectId: string) => {
    setProjects((prev) =>
      prev.map((project) => (project.id === projectId ? { ...project, starred: !project.starred } : project)),
    )
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Project Manager</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects, files, or templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {[
          { id: "projects", label: "Projects", count: projects.length },
          { id: "recent", label: "Recent Files", count: recentFiles.length },
          { id: "templates", label: "Templates", count: 12 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={cn(
              "px-6 py-3 text-sm font-medium border-b-2 smooth-transition",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
            <Badge variant="secondary" className="ml-2 text-xs">
              {tab.count}
            </Badge>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto editor-scrollbar p-6">
        {activeTab === "projects" && (
          <div className="space-y-4">
            {/* Starred Projects */}
            {projects.some((p) => p.starred) && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Star className="h-5 w-5 text-accent" />
                  Starred Projects
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {projects
                    .filter((p) => p.starred)
                    .map((project) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        onToggleStar={toggleStar}
                        getProjectIcon={getProjectIcon}
                        formatTimeAgo={formatTimeAgo}
                      />
                    ))}
                </div>
              </div>
            )}

            {/* All Projects */}
            <div>
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                All Projects
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onToggleStar={toggleStar}
                    getProjectIcon={getProjectIcon}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "recent" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Files
            </h2>
            <div className="space-y-2">
              {recentFiles.map((file) => (
                <Card key={file.id} className="p-4 hover:bg-accent/5 cursor-pointer smooth-transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs font-mono">{file.name.split(".").pop()}</span>
                      </div>
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-muted-foreground">{file.path}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">{file.project}</div>
                      <div className="text-xs text-muted-foreground">{formatTimeAgo(file.lastModified)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold mb-3">Project Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Next.js App", description: "Full-stack React framework", type: "next" },
                { name: "React SPA", description: "Single page application", type: "react" },
                { name: "Node.js API", description: "RESTful API server", type: "node" },
                { name: "Vue.js App", description: "Progressive web app", type: "vue" },
                { name: "Python Flask", description: "Lightweight web framework", type: "python" },
                { name: "Express Server", description: "Fast Node.js server", type: "node" },
              ].map((template, index) => (
                <Card key={index} className="p-4 hover:bg-accent/5 cursor-pointer smooth-transition">
                  <div className="flex items-start gap-3">
                    {getProjectIcon(template.type as Project["type"])}
                    <div className="flex-1">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">{template.description}</div>
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ProjectCardProps {
  project: Project
  onToggleStar: (id: string) => void
  getProjectIcon: (type: Project["type"]) => JSX.Element
  formatTimeAgo: (date: Date) => string
}

function ProjectCard({ project, onToggleStar, getProjectIcon, formatTimeAgo }: ProjectCardProps) {
  return (
    <Card className="p-4 hover:bg-accent/5 cursor-pointer smooth-transition group">
      <CardHeader className="p-0 mb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getProjectIcon(project.type)}
            <div>
              <CardTitle className="text-base">{project.name}</CardTitle>
              <div className="text-sm text-muted-foreground">{project.path}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 smooth-transition"
            onClick={(e) => {
              e.stopPropagation()
              onToggleStar(project.id)
            }}
          >
            <Star className={cn("h-4 w-4", project.starred && "fill-accent text-accent")} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{project.description}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          {project.gitBranch && (
            <div className="flex items-center gap-1">
              <GitBranch className="h-3 w-3" />
              <span>{project.gitBranch}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Package className="h-3 w-3" />
            <span>{project.dependencies}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{project.collaborators}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{formatTimeAgo(project.lastOpened)}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 smooth-transition">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ExternalLink className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
