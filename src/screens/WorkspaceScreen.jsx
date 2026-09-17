import { useState, useRef, useEffect } from "react"
import hljs from "highlight.js/lib/common"
import {
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Settings,
  LogOut,
  User,
  Paperclip,
  Mic,
  Send,
  Copy,
  Play,
  MoreHorizontal,
  ChevronDown,
  Code2,
  Eye,
  Download,
  X,
  Maximize2,
  Zap,
  MessageSquare,
  Hash,
  FileText,
  Image as ImageIcon,
  Presentation,
  BookOpen,
  Brain,
  WifiHigh,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Share2,
  CreditCard,
} from "lucide-react"
import {
  createConversation,
  deleteConversation,
  fetchConversations,
  fetchMessages,
  renameConversation,
} from "../lib/conversationApi"
import api from "../lib/api"

const models = [
  { id: "auto", label: "Auto" },
  { id: "chat", label: "Chat" },
  { id: "coding", label: "Coding" },
  { id: "search", label: "Search" },
  { id: "vision", label: "Vision" },
  { id: "ppt", label: "PPT" },
  { id: "pdf", label: "PDF" },
]

const creditCosts = {
  auto: 1,
  chat: 1,
  coding: 10,
  search: 5,
  vision: 10,
  pdf: 10,
  ppt: 10,
}

const backendAgents = {
  auto: "auto",
  chat: "chat",
  coding: "coding",
  search: "search",
  vision: "imageGen",
  pdf: "pdf",
  ppt: "ppt",
}

const agentLabels = {
  chat: "Chat",
  coding: "Coding",
  search: "Search",
  vision: "Vision",
  imageGen: "Vision",
  pdf: "PDF",
  ppt: "PPT",
  pdfRag: "PDF",
  imageAnalyzer: "Vision",
}

function renderInlineMarkdown(value, keyPrefix) {
  const tokens = value.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g)
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={key} style={{ color: "#A78BFA" }}>
          {token.slice(1, -1)}
        </code>
      )
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return <strong key={key}>{token.slice(2, -2)}</strong>
    }
    const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
    if (link) {
      return (
        <a
          key={key}
          href={link[2]}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#A78BFA" }}
        >
          {link[1]}
        </a>
      )
    }
    return token
  })
}

function MarkdownContent({ content }) {
  const lines = String(content || "").split("\n")
  const blocks = []
  let list = []
  let table = []

  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={`list-${blocks.length}`} className="list-disc pl-5">
          {list.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item, `list-${index}`)}</li>
          ))}
        </ul>,
      )
      list = []
    }
  }
  const flushTable = () => {
    if (table.length) {
      blocks.push(
        <table
          key={`table-${blocks.length}`}
          className="w-full text-left border-collapse"
        >
          <tbody>
            {table.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-[var(--border-medium)] px-2 py-1"
                  >
                    {renderInlineMarkdown(
                      cell.trim(),
                      `table-${index}-${cellIndex}`,
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>,
      )
      table = []
    }
  }

  lines.forEach((line, index) => {
    if (!line.trim()) {
      flushList()
      flushTable()
      return
    }
    if (/^\s*\|.*\|\s*$/.test(line)) {
      flushList()
      if (!/^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)+\|?\s*$/.test(line)) {
        table.push(
          line
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|"),
        )
      }
      return
    }
    flushTable()
    const listItem = line.match(/^\s*[-*]\s+(.+)/)
    if (listItem) {
      list.push(listItem[1])
      return
    }
    flushList()
    const heading = line.match(/^#{1,3}\s+(.+)/)
    if (heading) {
      blocks.push(
        <strong key={`heading-${index}`} className="block">
          {renderInlineMarkdown(heading[1], `heading-${index}`)}
        </strong>,
      )
      return
    }
    if (line.startsWith(">")) {
      blocks.push(
        <blockquote
          key={`quote-${index}`}
          className="border-l-2 border-[var(--border-soft)] pl-3"
        >
          {renderInlineMarkdown(line.replace(/^>\s?/, ""), `quote-${index}`)}
        </blockquote>,
      )
      return
    }
    blocks.push(
      <p key={`paragraph-${index}`} className="whitespace-pre-wrap">
        {renderInlineMarkdown(line, `paragraph-${index}`)}
      </p>,
    )
  })
  flushList()
  flushTable()
  return <div className="flex flex-col gap-2">{blocks}</div>
}

function getCodeBlock(content) {
  const match = String(content || "").match(/```([\w+-]*)\n?([\s\S]*?)```/)
  return match ? { lang: match[1] || "text", content: match[2].trim() } : null
}

function formatFileSize(size) {
  if (!size) return ""
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function highlightCodeLine(line, language) {
  const normalizedLanguage = language === "jsx" ? "javascript" : language
  if (!normalizedLanguage || !hljs.getLanguage(normalizedLanguage)) {
    return { __html: line.replace(/</g, "&lt;").replace(/>/g, "&gt;") }
  }

  const html = hljs.highlight(line, {
    language: normalizedLanguage,
    ignoreIllegals: true,
  }).value

  return {
    __html: html,
  }
}

function normalizeMessage(message) {
  const code = message.code || getCodeBlock(message.content)
  return {
    ...message,
    id: message._id || message.id,
    content: String(message.content || "")
      .replace(/```[\w+-]*\n?[\s\S]*?```/g, "")
      .trim(),
    code,
    timestamp:
      message.timestamp ||
      new Date(message.createdAt || Date.now()).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
  }
}

function normalizeArtifact(artifact, message) {
  const files = artifact.files || []
  const firstFile = files[0]
  const type = artifact.type || "Code"
  return {
    ...artifact,
    id: String(artifact.id || `${message.id}-${type}`),
    title:
      artifact.title ||
      firstFile?.name ||
      artifact.filename ||
      "Generated artifact",
    type,
    filename:
      artifact.filename || firstFile?.name || `${type.toLowerCase()}.txt`,
    content: artifact.content || firstFile?.content || "",
    language: artifact.language || firstFile?.language || "text",
    status: artifact.status || "ready",
    createdAt:
      artifact.createdAt || message.createdAt || new Date().toISOString(),
  }
}

export default function WorkspaceScreen({ navigate, account, setAccount }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(true)
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(
    () => localStorage.getItem("cotext-active-conversation") || "",
  )
  const [activeModel, setActiveModel] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("cotext-settings"))?.defaultModel ||
        "coding"
      )
    } catch {
      return "coding"
    }
  })
  const [input, setInput] = useState("")
  const [chatMessages, setChatMessages] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [conversationError, setConversationError] = useState(null)
  const [renamingConversation, setRenamingConversation] = useState(null)
  const [renameValue, setRenameValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [activeArtifact, setActiveArtifact] = useState("")
  const [artifactView, setArtifactView] = useState("code")
  const [copied, setCopied] = useState(null)
  const [rateLimit, setRateLimit] = useState(false)
  const [mobileView, setMobileView] = useState("chat")
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false
    return window.innerWidth < 768
  })
  const [attachedFile, setAttachedFile] = useState(null)
  const [uploadState, setUploadState] = useState("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState(null)
  const [expandedCode, setExpandedCode] = useState({})
  const [artifactExpanded, setArtifactExpanded] = useState(false)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const errorTimerRef = useRef(null)
  const copyTimerRef = useRef(null)
  const artifacts = chatMessages.flatMap((message) =>
    (message.artifacts || []).map((artifact) =>
      normalizeArtifact(artifact, message),
    ),
  )

  const convGroups = ["Today", "Yesterday", "Previous 7 Days", "Older"]

  const showError = (error, fallback) => {
    const status = error.response?.status
    const message =
      status === 429
        ? "Too many requests. Please try again shortly."
        : status === 500
          ? "The AI service is unavailable. Please try again."
          : error.code === "ECONNABORTED"
            ? "The AI request timed out. Please try again."
            : error.response?.data?.message || fallback
    setConversationError(message)
    if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current)
    errorTimerRef.current = window.setTimeout(
      () => setConversationError(null),
      4000,
    )
  }

  const allowedFileTypes = {
    vision: {
      extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
      mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
      label: "JPG, JPEG, PNG, WEBP, or GIF",
    },
    pdf: {
      extensions: [".pdf"],
      mimeTypes: ["application/pdf"],
      label: "PDF",
    },
    ppt: {
      extensions: [".ppt", ".pptx"],
      mimeTypes: [
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/octet-stream",
      ],
      label: "PPT or PPTX",
    },
  }

  const validateUploadedFile = async (file) => {
    const rules = allowedFileTypes[activeModel]
    if (!rules)
      throw new Error(
        "Attachments are available for Vision, PDF, and PPT only.",
      )
    if (!file || file.size === 0) throw new Error("The selected file is empty.")
    if (file.size > 20 * 1024 * 1024)
      throw new Error("Files must be 20 MB or smaller.")
    const extension = `.${file.name.split(".").pop().toLowerCase()}`
    if (
      !rules.extensions.includes(extension) ||
      (file.type && !rules.mimeTypes.includes(file.type))
    ) {
      throw new Error(`Unsupported file. Please choose a ${rules.label} file.`)
    }
    if (activeModel === "vision") {
      const objectUrl = URL.createObjectURL(file)
      await new Promise((resolve, reject) => {
        const image = new Image()
        image.onload = resolve
        image.onerror = () =>
          reject(new Error("The image appears to be corrupted."))
        image.src = objectUrl
      }).finally(() => URL.revokeObjectURL(objectUrl))
    } else if (activeModel === "pdf") {
      const header = await file.slice(0, 5).text()
      if (header !== "%PDF-")
        throw new Error("The PDF appears to be corrupted.")
    } else if (activeModel === "ppt") {
      const header = new Uint8Array(await file.slice(0, 8).arrayBuffer())
      const isPptx = header[0] === 80 && header[1] === 75
      const isPpt =
        header[0] === 208 &&
        header[1] === 207 &&
        header[2] === 17 &&
        header[3] === 224
      if (!isPptx && !isPpt) {
        throw new Error("The PPTX appears to be corrupted.")
      }
    }
  }

  const handleFileSelection = async (file) => {
    setUploadError(null)
    try {
      await validateUploadedFile(file)
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
      setAttachedFile(file)
      setUploadProgress(100)
      setUploadState("uploaded")
      setFilePreviewUrl(
        file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      )
    } catch (error) {
      setAttachedFile(null)
      setUploadProgress(0)
      setUploadState("failed")
      setUploadError(error.message)
    }
  }

  const getConversationGroup = (conversation) => {
    const date = new Date(conversation.updatedAt || conversation.createdAt)
    const now = new Date()
    const days = Math.floor(
      (new Date(now.getFullYear(), now.getMonth(), now.getDate()) -
        new Date(date.getFullYear(), date.getMonth(), date.getDate())) /
        86400000,
    )
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days <= 7) return "Previous 7 Days"
    return "Older"
  }

  const formatConversationTime = (value) => {
    const timestamp = value ? new Date(value).getTime() : 0
    if (!timestamp) return "Just now"

    const diffMs = Date.now() - timestamp
    const minuteMs = 60 * 1000
    const hourMs = 60 * minuteMs
    const dayMs = 24 * hourMs

    if (diffMs < minuteMs) return "Just now"
    if (diffMs < hourMs) return `${Math.max(1, Math.floor(diffMs / minuteMs))}m ago`
    if (diffMs < dayMs) return `${Math.max(1, Math.floor(diffMs / hourMs))}h ago`
    if (diffMs < dayMs * 7) return `${Math.max(1, Math.floor(diffMs / dayMs))}d ago`

    return new Date(timestamp).toLocaleDateString()
  }

  const formatConversation = (conversation) => {
    const latestMessage =
      conversation.latestMessage ??
      conversation.preview ??
      conversation.lastMessage ??
      conversation.lastMessageContent ??
      ""

    const normalizedMessage =
      latestMessage && String(latestMessage).trim()
        ? String(latestMessage).replace(/\s+/g, " ").trim()
        : ""

    return {
      ...conversation,
      id: conversation._id || conversation.id,
      title: conversation.title || conversation.name || "New chat",
      group: getConversationGroup(conversation),
      time: formatConversationTime(conversation.updatedAt || conversation.createdAt),
      preview:
        normalizedMessage.length > 180
          ? `${normalizedMessage.substring(0, 177)}...`
          : normalizedMessage || "No messages yet",
      latestModel: conversation.latestModel || conversation.model || "chat",
    }
  }

  useEffect(() => {
    let mounted = true
    setConversationsLoading(true)
    fetchConversations()
      .then((items) => {
        if (!mounted) return
        const formatted = items.map(formatConversation)
        setConversations(formatted)
        const storedId = localStorage.getItem("cotext-active-conversation")
        const selected = formatted.find((item) => item.id === storedId)
        setActiveConv(selected?.id || formatted[0]?.id || "")
      })
      .catch((error) => {
        if (mounted) showError(error, "Unable to load conversations.")
      })
      .finally(() => {
        if (mounted) setConversationsLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!activeConv) {
      setChatMessages([])
      return
    }
    localStorage.setItem("cotext-active-conversation", activeConv)
    let mounted = true
    setMessagesLoading(true)
    fetchMessages(activeConv)
      .then((items) => {
        if (mounted) setChatMessages(items.map(normalizeMessage))
      })
      .catch((error) => {
        if (mounted) showError(error, "Unable to load messages.")
      })
      .finally(() => {
        if (mounted) setMessagesLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [activeConv])

  useEffect(() => {
    if (!artifacts.length) {
      setActiveArtifact("")
      return
    }
    const newest = artifacts[artifacts.length - 1]
    setActiveArtifact(newest.id)
    setArtifactView("preview")
  }, [activeConv, chatMessages.length])

  useEffect(() => {
    const handleResize = () => {
      const nextIsMobile = window.innerWidth < 768
      setIsMobile(nextIsMobile)
      if (!nextIsMobile) {
        setMobileView("chat")
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleNewChat = async () => {
    try {
      const conversation = formatConversation(await createConversation())
      setConversations((current) => [conversation, ...current])
      setActiveConv(conversation.id)
      setChatMessages([])
    } catch (error) {
      showError(error, "Unable to create a conversation.")
    }
  }

  const handleRename = async (conversation) => {
    if (!renameValue.trim()) return
    try {
      const updated = formatConversation(
        await renameConversation(conversation.id, renameValue),
      )
      setConversations((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      )
      setRenamingConversation(null)
    } catch (error) {
      showError(error, "Unable to rename the conversation.")
    }
  }

  const handleDelete = async (conversation) => {
    try {
      await deleteConversation(conversation.id)
      const remaining = conversations.filter(
        (item) => item.id !== conversation.id,
      )
      setConversations(remaining)
      if (activeConv === conversation.id) {
        setActiveConv(remaining[0]?.id || "")
        setChatMessages([])
        if (!remaining.length) {
          localStorage.removeItem("cotext-active-conversation")
        }
      }
    } catch (error) {
      showError(error, "Unable to delete the conversation.")
    }
  }

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) window.clearTimeout(errorTimerRef.current)
      if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isTyping])

  useEffect(() => {
    if (attachedFile && !allowedFileTypes[activeModel]) {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
      setAttachedFile(null)
      setFilePreviewUrl(null)
      setUploadState("idle")
      setUploadProgress(0)
    }
  }, [activeModel])

  useEffect(() => {
    if (!attachedFile) return undefined
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
    }
  }, [filePreviewUrl])

  const handleSend = async () => {
    if (!input.trim()) return
    const cost = creditCosts[activeModel] || 1
    if (account.credits < cost) {
      setRateLimit(true)
      return
    }
    try {
      setIsTyping(true)
      let conversationId = activeConv
      if (!conversationId) {
        const conversation = formatConversation(await createConversation())
        conversationId = conversation.id
        setConversations((current) => [conversation, ...current])
        setActiveConv(conversationId)
      }
      const prompt = input
      const formData = new FormData()
      formData.append("prompt", prompt)
      formData.append("conversationId", conversationId)
      formData.append("agent", backendAgents[activeModel])
      if (attachedFile) formData.append("file", attachedFile)

      if (attachedFile) setUploadState("uploading")
      const { data } = await api.post("/agent/chat", formData, {
        timeout: 120000,
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded / event.total) * 100))
          }
        },
      })
      if (attachedFile) setUploadState("processing")
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
      const code = getCodeBlock(data.answer)
      const assistantContent = String(data.answer || "")
        .replace(/```[\w+-]*\n?[\s\S]*?```/g, "")
        .trim()
      setChatMessages((current) => [
        ...current,
        {
          id: `user-${Date.now()}`,
          role: "user",
          content: prompt,
          attachments: attachedFile
            ? [
                {
                  name: attachedFile.name,
                  type: attachedFile.type,
                  size: attachedFile.size,
                  status: "completed",
                },
              ]
            : [],
          timestamp,
        },
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
          code,
          images: data.images,
          artifacts: data.artifacts,
          selectedAgent: data.agent,
          timestamp,
        },
      ])
      const userResponse = await api.get("/me")
      if (userResponse.data) {
        setAccount((current) => ({ ...current, ...userResponse.data }))
      } else {
        setAccount((current) => ({
          ...current,
          credits: current.credits - cost,
        }))
      }
      setInput("")
      setAttachedFile(null)
      setUploadState(attachedFile ? "completed" : "idle")
      setUploadProgress(attachedFile ? 100 : 0)
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
      setFilePreviewUrl(null)
    } catch (error) {
      if (attachedFile)
        setUploadState(error.code === "ECONNABORTED" ? "cancelled" : "failed")
      showError(error, "Unable to complete the AI request.")
    } finally {
      setIsTyping(false)
    }
  }

  const handleCopy = async (id, value) => {
    if (value !== undefined) {
      try {
        await navigator.clipboard.writeText(value)
      } catch (error) {
        showError(error, "Unable to copy this code.")
        return
      }
    }
    setCopied(id)
    if (copyTimerRef.current) window.clearTimeout(copyTimerRef.current)
    copyTimerRef.current = window.setTimeout(() => setCopied(null), 1800)
  }

  const getArtifactText = (artifact) => {
    if (artifact.content) return artifact.content
    return (artifact.files || []).map((file) => file.content || "").join("\n")
  }

  const handleArtifactCopy = async (artifact) => {
    const value = getArtifactText(artifact) || artifact.url
    if (!value) {
      showError(new Error(), "This artifact has no copyable content.")
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      handleCopy(`${artifact.id}-artifact`)
    } catch (error) {
      showError(error, "Unable to copy this artifact.")
    }
  }

  const handleArtifactDownload = async (artifact) => {
    try {
      if (!artifact.url && !getArtifactText(artifact)) {
        throw new Error("Artifact content is unavailable")
      }
      const response = artifact.url
        ? await fetch(artifact.url)
        : new Response(getArtifactText(artifact), {
            headers: { "Content-Type": "text/plain" },
          })
      if (!response.ok) throw new Error("Artifact download failed")
      const blob = await response.blob()
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = artifact.filename || artifact.title
      link.click()
      window.setTimeout(() => URL.revokeObjectURL(link.href), 0)
    } catch (error) {
      showError(error, "Unable to download this artifact.")
    }
  }

  const handleArtifactShare = async (artifact) => {
    try {
      await navigator.clipboard.writeText(
        artifact.url || getArtifactText(artifact),
      )
      handleCopy(`${artifact.id}-share`)
    } catch (error) {
      showError(error, "Sharing is not available for this artifact.")
    }
  }

  const modelIcons = {
    auto: <Zap size={12} />,
    chat: <MessageSquare size={12} />,
    coding: <Code2 size={12} />,
    search: <Search size={12} />,
    vision: <ImageIcon size={12} />,
    ppt: <Presentation size={12} />,
    pdf: <FileText size={12} />,
  }

  const shouldShowSidebar = !isMobile || mobileView === "sidebar"
  const shouldShowChat = !isMobile || mobileView === "chat"
  const shouldShowArtifacts = !isMobile || mobileView === "artifacts"

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: "var(--bg-primary)", fontFamily: "Inter, sans-serif" }}
    >
      {conversationError && (
        <div
          className="fixed right-6 top-6 z-50 rounded-[12px] px-4 py-3 text-sm"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5",
          }}
        >
          {conversationError}
        </div>
      )}
      {!isMobile && (
        <aside
          className="workspace-sidebar sidebar-transition flex flex-col shrink-0 relative"
          style={{
            width: sidebarCollapsed ? "0px" : "280px",
            opacity: sidebarCollapsed ? 0 : 1,
            overflow: "hidden",
            background: "var(--bg-sidebar)",
            borderRight: "1px solid var(--border-faint)",
          }}
        >
          <div className="flex flex-col h-full min-w-[280px] w-full max-w-full">
          {/* Sidebar Top */}
          <div
            className="p-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            {/* Logo row */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 gradient-primary"
                style={{ boxShadow: "0 0 14px rgba(108,92,231,0.35)" }}
              >
                <Sparkles size={14} color="var(--text-on-accent)" />
              </div>
              <span
                className="text-base font-bold tracking-tight flex-1"
                style={{ letterSpacing: "-0.02em" }}
              >
                Cotext<span className="text-gradient-primary">AI</span>
              </span>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg transition-all hover:bg-[var(--overlay-light)] shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft size={15} color="var(--text-muted)" />
              </button>
            </div>

            {/* Search */}
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] transition-all"
              style={{
                background: "var(--border-subtle)",
                border: "1px solid var(--border-color)",
              }}
            >
              <Search size={14} color="var(--text-faint)" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none"
              />
            </div>
          </div>

          {/* New Chat */}
          <div className="px-4 pt-4 pb-2 shrink-0">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)",
                boxShadow: "0 6px 20px rgba(108,92,231,0.3)",
                color: "var(--text-on-accent)",
              }}
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {conversationsLoading ? (
              <div className="flex flex-col gap-3 px-2">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-12 rounded-[12px] animate-pulse bg-[var(--border-subtle)]"
                  />
                ))}
              </div>
            ) : conversations.length ? (
              convGroups.map((group) => {
                const groupConvs = conversations.filter(
                  (c) => c.group === group,
                )
                if (!groupConvs.length) return null
                return (
                  <div key={group} className="mb-4">
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {group}
                    </p>
                    <div className="flex flex-col gap-1">
                      {groupConvs.map((conv) => (
                        <div
                          key={conv.id}
                          className={`w-full text-left px-3 py-2.5 rounded-[12px] transition-all duration-200 group ${
                            activeConv === conv.id
                              ? "conv-active"
                              : "hover:bg-[var(--overlay-light)]"
                          }`}
                        >
                          {renamingConversation === conv.id ? (
                            <input
                              autoFocus
                              value={renameValue}
                              onChange={(event) =>
                                setRenameValue(event.target.value)
                              }
                              onBlur={() => handleRename(conv)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") handleRename(conv)
                                if (event.key === "Escape")
                                  setRenamingConversation(null)
                              }}
                              className="w-full bg-transparent text-[13px] text-[var(--text-primary)] outline-none"
                            />
                          ) : (
                            <button
                              onClick={() => setActiveConv(conv.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p
                                  className="text-[13px] font-medium truncate leading-tight"
                                  style={{
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {conv.title || "New chat"}
                                </p>
                                <span
                                  className="text-[10px] shrink-0 mt-0.5"
                                  style={{ color: "var(--text-faint)" }}
                                >
                                  {conv.time}
                                </span>
                              </div>
                              <p
                                className="text-[11px] truncate mt-0.5 leading-tight"
                                style={{ color: "var(--text-faint)" }}
                              >
                                {conv.preview}
                              </p>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setRenamingConversation(conv.id)
                              setRenameValue(conv.title)
                            }}
                            className="hidden group-hover:block float-right -mt-5 p-1"
                            title="Rename conversation"
                          >
                            <MoreHorizontal size={13} color="var(--text-muted)" />
                          </button>
                          <button
                            onClick={() => handleDelete(conv)}
                            className="hidden group-hover:block float-right -mt-5 mr-6 p-1"
                            title="Delete conversation"
                          >
                            <X size={12} color="var(--text-muted)" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-2 py-8 text-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Start your first conversation.
                </p>
                <button
                  onClick={handleNewChat}
                  className="mt-3 text-xs font-medium"
                  style={{ color: "#A78BFA" }}
                >
                  New Chat
                </button>
              </div>
            )}
          </div>

          {/* Profile */}
          <div
            className="p-3 shrink-0"
            style={{ borderTop: "1px solid var(--border-faint)" }}
          >
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all hover:bg-[var(--overlay-light)]"
              style={{ border: "1px solid var(--border-faint)" }}
            >
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #6C5CE7, #7C3AED)",
                  color: "var(--text-on-accent)",
                }}
              >
                {account?.name
  ?.split(" ")
  .map((word) => word[0])
  .join("")
  .substring(0, 2)
  .toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                 {account?.name || "User"}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "#A78BFA" }}
                  >
                    {account.plan?.charAt(0).toUpperCase() + account.plan?.slice(1)}
                  </span>
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    {account.credits} credits
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => navigate("settings")}
                  className="p-1.5 rounded-lg transition-all hover:bg-[var(--border-medium)]"
                  title="Settings"
                >
                  <Settings size={14} color="var(--text-muted)" />
                </button>
                <button
                  onClick={() => navigate("login")}
                  className="p-1.5 rounded-lg transition-all hover:bg-[var(--border-medium)]"
                  title="Logout"
                >
                  <LogOut size={14} color="var(--text-muted)" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
      )}

      {!isMobile && sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="absolute left-3 top-4 z-20 p-2 rounded-[10px] transition-all hover:bg-[var(--border-medium)] animate-fade-in"
          style={{
            background: "rgba(15,17,21,0.9)",
            border: "1px solid var(--white-overlay-08)",
          }}
        >
          <ChevronRight size={15} color="var(--text-secondary)" />
        </button>
      )}

      {isMobile && mobileView === "sidebar" && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setMobileView("chat")} />
      )}

      {isMobile && mobileView === "sidebar" && (
        <aside
          className="fixed inset-y-0 left-0 z-50 flex w-[82%] max-w-[280px] flex-col overflow-hidden border-r bg-[var(--bg-sidebar)] md:hidden"
          style={{ borderRight: "1px solid var(--border-faint)" }}
        >
          <div className="flex h-full min-w-0 w-full max-w-full flex-col">
            <div className="flex items-center gap-2.5 border-b p-4" style={{ borderBottom: "1px solid var(--border-faint)" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] gradient-primary">
                <Sparkles size={14} color="var(--text-on-accent)" />
              </div>
              <span className="flex-1 text-base font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
                Cotext<span className="text-gradient-primary">AI</span>
              </span>
              <button onClick={() => setMobileView("chat")} className="p-1.5 rounded-lg hover:bg-[var(--overlay-light)]" title="Close sidebar">
                <ChevronLeft size={15} color="var(--text-muted)" />
              </button>
            </div>
            <div className="px-4 pb-3 pt-4" style={{ borderBottom: "1px solid var(--border-faint)" }}>
              <div className="flex items-center gap-2.5 rounded-[12px] px-3 py-2.5" style={{ background: "var(--border-subtle)", border: "1px solid var(--border-color)" }}>
                <Search size={14} color="var(--text-faint)" />
                <input type="text" placeholder="Search conversations..." className="w-full bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {conversationsLoading ? (
                <div className="flex flex-col gap-3 px-2">
                  {[1,2,3,4].map((item) => (
                    <div key={item} className="h-12 rounded-[12px] animate-pulse bg-[var(--border-subtle)]" />
                  ))}
                </div>
              ) : conversations.length ? (
                convGroups.map((group) => {
                  const groupConvs = conversations.filter((c) => c.group === group)
                  if (!groupConvs.length) return null
                  return (
                    <div key={group} className="mb-4">
                      <p className="px-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-faint)" }}>{group}</p>
                      <div className="mt-2 flex flex-col gap-1">
                        {groupConvs.map((conv) => (
                          <button
                            key={conv.id}
                            onClick={() => {
                              setActiveConv(conv.id)
                              setMobileView("chat")
                            }}
                            className={`w-full rounded-[12px] px-3 py-2.5 text-left transition-all ${activeConv === conv.id ? "conv-active" : "hover:bg-[var(--overlay-light)]"}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="min-w-0 flex-1 truncate text-[13px] font-medium leading-tight" style={{ color: "var(--text-primary)" }}>{conv.title || "New chat"}</p>
                              <span className="shrink-0 text-[10px]" style={{ color: "var(--text-faint)" }}>{conv.time}</span>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] leading-tight" style={{ color: "var(--text-faint)" }}>{conv.preview}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="px-2 py-8 text-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>Start your first conversation.</p>
                </div>
              )}
            </div>
            <div className="shrink-0 border-t p-3" style={{ borderTop: "1px solid var(--border-faint)" }}>
              <div className="flex items-center gap-3 rounded-[14px] px-3 py-2.5" style={{ border: "1px solid var(--border-faint)" }}>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold gradient-primary">
                  {account?.name?.split(" ").map((word) => word[0]).join("").substring(0, 2).toUpperCase() || "U"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>{account?.name || "User"}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-[10px] font-semibold" style={{ color: "#A78BFA" }}>{account.plan?.charAt(0).toUpperCase() + account.plan?.slice(1)}</span>
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{account.credits} credits</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}

      {shouldShowChat && (
      <main className="workspace-main flex-1 flex flex-col min-w-0 relative overflow-hidden w-full max-w-full">
        {/* Chat header */}
        <div
          className="workspace-header flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid var(--border-faint)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                Workspace
              </span>
              <span style={{ color: "var(--text-faint)" }}>/</span>
              <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>
                {conversations.find(
                  (conversation) => conversation.id === activeConv,
                )?.title || "New conversation"}
              </span>
            </div>
            <h2
              className="text-[15px] font-semibold text-[var(--text-primary)]"
              style={{ letterSpacing: "-0.01em" }}
            >
              {conversations.find(
                (conversation) => conversation.id === activeConv,
              )?.title || "New conversation"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {/* Model badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(108,92,231,0.12)",
                border: "1px solid rgba(108,92,231,0.25)",
              }}
            >
              {modelIcons[activeModel]}
              <span
                className="text-xs font-medium"
                style={{ color: "#6C5CE7" }}
              >
                {models.find((model) => model.id === activeModel)?.label}
              </span>
            </div>
            <button
              onClick={() => navigate("billing")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-[var(--overlay-light)]"
              style={{ border: "1px solid var(--border-color)" }}
              title="Open billing"
            >
              <span style={{ color: "#F59E0B" }}>⭐</span>
              <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                {account.plan?.charAt(0).toUpperCase() + account.plan?.slice(1)}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                {account.credits} / {account.totalCredits}
              </span>
              <CreditCard size={12} color="var(--text-muted)" />
            </button>
            {/* Connection */}
            <div className="flex items-center gap-1.5">
              <div className="status-online" />
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                Connected
              </span>
            </div>
            {/* Toggle artifact panel */}
            <button
              onClick={() => setArtifactPanelOpen(!artifactPanelOpen)}
              className="p-2 rounded-[10px] transition-all hover:bg-[var(--overlay-light)]"
              style={{ border: "1px solid var(--border-color)" }}
              title="Toggle artifact panel"
            >
              {artifactPanelOpen ? (
                <PanelRightClose size={16} color="var(--text-muted)" />
              ) : (
                <PanelRightOpen size={16} color="var(--text-muted)" />
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="workspace-messages flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-[720px] mx-auto flex flex-col gap-8">
            {messagesLoading ? (
              <div className="flex flex-col gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className={`h-16 w-3/4 rounded-[20px] animate-pulse bg-[var(--border-subtle)] ${
                      item % 2 ? "self-end" : ""
                    }`}
                  />
                ))}
              </div>
            ) : !chatMessages.length ? (
              <div
                className="flex flex-1 items-center justify-center py-24 text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {activeConv
                  ? "Start a conversation by sending a message."
                  : "Start your first conversation."}
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex message-enter ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {msg.role === "assistant" && (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 gradient-primary"
                      style={{ boxShadow: "0 0 12px rgba(108,92,231,0.3)" }}
                    >
                      <Sparkles size={13} color="var(--text-on-accent)" />
                    </div>
                  )}
                  <div
                    className={`flex flex-col gap-3 ${
                      msg.role === "user" ? "items-end" : "items-start"
                    } max-w-[85%]`}
                  >
                    <div
                      className={`px-5 py-3.5 rounded-[20px] text-sm leading-relaxed`}
                      style={
                        msg.role === "user"
                          ? {
                              background:
                                "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)",
                              color: "var(--text-on-accent)",
                              borderBottomRightRadius: "6px",
                              boxShadow: "0 4px 16px rgba(108,92,231,0.25)",
                            }
                          : {
                              background: "var(--bg-secondary)",
                              border: "1px solid var(--border-color)",
                              color: "var(--text-primary)",
                              borderBottomLeftRadius: "6px",
                            }
                      }
                    >
                      <MarkdownContent content={msg.content} />
                    </div>
                    {msg.selectedAgent && (
                      <span
                        className="flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full"
                        style={{
                          background: "rgba(108,92,231,0.12)",
                          border: "1px solid rgba(108,92,231,0.25)",
                          color: "#A78BFA",
                        }}
                      >
                        Selected Agent{" "}
                        <strong>
                          {agentLabels[msg.selectedAgent] || msg.selectedAgent}
                        </strong>
                      </span>
                    )}
                    {msg.code && (
                      <div
                        className="w-full rounded-[16px] overflow-hidden"
                        style={{
                          background: "var(--surface-tertiary)",
                          border: "1px solid var(--white-overlay-07)",
                        }}
                      >
                        {/* Code header */}
                        <div
                          className="flex items-center justify-between px-4 py-2.5"
                          style={{
                            borderBottom: "1px solid var(--border-color)",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: "#EF4444" }}
                              />
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: "#F59E0B" }}
                              />
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ background: "#22C55E" }}
                              />
                            </div>
                            <span
                              className="text-[11px] font-medium ml-1"
                              style={{
                                color: "var(--text-faint)",
                                fontFamily: "JetBrains Mono, monospace",
                              }}
                            >
                              {msg.code.lang}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                handleCopy(msg.id, msg.code.content)
                              }
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-all hover:bg-[var(--overlay-light)]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {copied === msg.id ? (
                                <>
                                  <Check size={12} color="#22C55E" />
                                  <span style={{ color: "#22C55E" }}>
                                    Copied
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy size={12} />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setExpandedCode((current) => ({
                                  ...current,
                                  [msg.id]: !current[msg.id],
                                }))
                              }
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-all hover:bg-[var(--overlay-light)]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {expandedCode[msg.id] ? "Collapse" : "Expand"}
                              <ChevronDown
                                size={12}
                                className={
                                  expandedCode[msg.id] ? "rotate-180" : ""
                                }
                              />
                            </button>
                            <button
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-all hover:bg-[var(--overlay-light)]"
                              style={{ color: "#22C55E" }}
                            >
                              <Play size={12} />
                              Run
                            </button>
                          </div>
                        </div>
                        {/* Code content */}
                        <pre
                          className="p-4 text-[12.5px] leading-[1.8] overflow-x-auto"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "var(--code-text)",
                            background: "var(--code-bg)",
                            margin: 0,
                          }}
                        >
                          <code>
                            {(expandedCode[msg.id]
                              ? msg.code.content
                              : msg.code.content
                                  .split("\n")
                                  .slice(0, 12)
                                  .join("\n")
                            )
                              .split("\n")
                              .map((line, index) => (
                                <span key={index} className="block">
                                  <span
                                    className="mr-4 inline-block w-5 select-none text-right"
                                    style={{ color: "var(--text-faint)" }}
                                  >
                                    {index + 1}
                                  </span>
                                  <span
                                    dangerouslySetInnerHTML={highlightCodeLine(
                                      line,
                                      msg.code.lang,
                                    )}
                                  />
                                </span>
                              ))}
                          </code>
                        </pre>
                      </div>
                    )}
                    {msg.images?.map((image) => (
                      <img
                        key={image}
                        src={image}
                        alt="Generated result"
                        className="max-w-full rounded-[16px]"
                      />
                    ))}
                    {msg.attachments?.map((attachment) => (
                      <div
                        key={attachment.id || attachment.name}
                        className="text-xs"
                        style={{ color: "#A78BFA" }}
                      >
                        {attachment.name}
                        {attachment.size
                          ? ` · ${formatFileSize(attachment.size)}`
                          : ""}
                        {attachment.pages ? ` · ${attachment.pages} pages` : ""}
                        {attachment.status ? ` · ${attachment.status}` : ""}
                      </div>
                    ))}
                    <span
                      className="text-[10px] px-1"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start message-enter">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 gradient-primary"
                  style={{ boxShadow: "0 0 12px rgba(108,92,231,0.3)" }}
                >
                  <Sparkles size={13} color="var(--text-on-accent)" />
                </div>
                <div
                  className="px-5 py-4 rounded-[20px]"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--white-overlay-07)",
                    borderBottomLeftRadius: "6px",
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="workspace-input-wrap px-6 pb-6 shrink-0">
          <div className="max-w-[720px] mx-auto">
            {/* Model selector */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                    activeModel === m.id ? "segment-active" : "hover:bg-[var(--overlay-light)]"
                  }`}
                  style={{
                    color: activeModel === m.id ? "#A78BFA" : "var(--text-muted)",
                  }}
                >
                  {modelIcons[m.id]}
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>
                {activeModel === "auto"
                  ? "Auto automatically selects the best AI agent for your request."
                  : activeModel === "vision"
                    ? "Vision: Image Generation + Image Analysis · 10 Credits/request"
                    : activeModel === "pdf"
                      ? "PDF: Chat + RAG + Summary + Extraction · 10 Credits/request"
                      : `${models.find((model) => model.id === activeModel)?.label} uses ${creditCosts[activeModel]} Credit${
                          creditCosts[activeModel] === 1 ? "" : "s"
                        }/request`}
              </span>
            </div>

            {/* Input container */}
            <div
              className="flex flex-col rounded-[28px] transition-all duration-200"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--white-overlay-08)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px var(--overlay-faint)",
              }}
              onFocus={() => {}}
              onDragOver={(event) => {
                if (allowedFileTypes[activeModel]) event.preventDefault()
              }}
              onDrop={(event) => {
                event.preventDefault()
                if (allowedFileTypes[activeModel]) {
                  handleFileSelection(event.dataTransfer.files?.[0])
                }
              }}
            >
              {attachedFile && (
                <div className="px-6 pt-4">
                  <div
                    className="flex items-center gap-3 rounded-[12px] px-3 py-2"
                    style={{ background: "var(--overlay-light)" }}
                  >
                    {filePreviewUrl ? (
                      <img
                        src={filePreviewUrl}
                        alt={attachedFile.name}
                        className="h-10 w-10 rounded-[8px] object-cover"
                      />
                    ) : (
                      <FileText size={16} color="#A78BFA" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs text-[var(--text-primary)]">
                        {attachedFile.name}
                      </p>
                      <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {uploadState === "uploading"
                          ? `Uploading ${uploadProgress}%`
                          : uploadState}
                      </p>
                      {(uploadState === "uploading" ||
                        uploadState === "processing") && (
                        <div
                          className="mt-1 h-1 rounded-full"
                          style={{ background: "var(--white-overlay-08)" }}
                        >
                          <div
                            className="h-full rounded-full gradient-primary"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl)
                        setAttachedFile(null)
                        setFilePreviewUrl(null)
                        setUploadState("cancelled")
                        setUploadProgress(0)
                      }}
                      className="p-1"
                      title="Remove attachment"
                    >
                      <X size={13} color="var(--text-muted)" />
                    </button>
                  </div>
                </div>
              )}
              {uploadError && (
                <div className="px-6 pt-3 text-xs" style={{ color: "#FCA5A5" }}>
                  {uploadError}
                </div>
              )}
              <textarea
                value={input}
                disabled={isTyping}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask anything... (⌘↵ to send)"
                rows={1}
                className="flex-1 bg-transparent px-6 pt-5 pb-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] outline-none resize-none leading-relaxed"
                style={{ minHeight: "52px", maxHeight: "200px" }}
              />
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept={
                      activeModel === "vision"
                        ? "image/*"
                        : activeModel === "pdf"
                          ? "application/pdf"
                          : activeModel === "ppt"
                            ? ".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                            : ""
                    }
                    onChange={(event) =>
                      setAttachedFile(event.target.files?.[0] || null)
                    }
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={
                      isTyping ||
                      !["vision", "pdf", "ppt"].includes(activeModel)
                    }
                    className="p-2 rounded-[10px] transition-all hover:bg-[var(--overlay-light)]"
                    title="Attach file"
                  >
                    <Paperclip size={16} color="var(--text-faint)" />
                  </button>
                  <button
                    className="p-2 rounded-[10px] transition-all hover:bg-[var(--overlay-light)]"
                    title="Voice input"
                  >
                    <Mic size={16} color="var(--text-faint)" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || account.credits <= 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)"
                      : "var(--border-faint)",
                    color: input.trim()
                      ? "var(--text-primary)"
                      : "var(--text-faint)",
                    boxShadow: input.trim()
                      ? "0 4px 14px rgba(108,92,231,0.3)"
                      : "none",
                  }}
                >
                  {isTyping ? (
                    "Thinking..."
                  ) : (
                    <>
                      <Send size={14} /> Send
                    </>
                  )}
                </button>
              </div>
            </div>

            <p
              className="text-center text-[10px] mt-3"
              style={{ color: "var(--border-strong)" }}
            >
              CotextAI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>
      )}

      {/* RIGHT ARTIFACT PANEL */}
      <div
        className="workspace-artifact-panel sidebar-transition shrink-0 flex flex-col"
        style={{
          width: artifactPanelOpen ? "360px" : "0px",
          opacity: artifactPanelOpen ? 1 : 0,
          overflow: "hidden",
          borderLeft: "1px solid var(--border-faint)",
          background: "var(--bg-sidebar)",
        }}
      >
        <div className="flex flex-col h-full min-w-[360px]">
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Artifacts</h3>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 p-1 rounded-[10px]"
                style={{
                  background: "var(--border-subtle)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <button
                  onClick={() => setArtifactView("code")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                    artifactView === "code"
                      ? "bg-[var(--border-medium)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  <Code2 size={12} />
                  Code
                </button>
                <button
                  onClick={() => setArtifactView("preview")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                    artifactView === "preview"
                      ? "bg-[var(--border-medium)] text-[var(--text-primary)]"
                      : "text-[var(--text-muted)]"
                  }`}
                >
                  <Eye size={12} />
                  Preview
                </button>
              </div>
            </div>
          </div>

          {/* Artifact cards */}
          <div className="flex flex-col gap-3 px-4 py-4 shrink-0">
            {isTyping && (
              <div
                className="h-24 rounded-[16px] animate-pulse"
                style={{
                  background: "var(--overlay-light)",
                  border: "1px solid var(--border-faint)",
                }}
              >
                <div className="px-4 py-3">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Generating artifact...
                  </p>
                </div>
              </div>
            )}
            {artifacts.length ? (
              artifacts.map((art) => (
                <button
                  key={art.id}
                  onClick={() => setActiveArtifact(art.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-[16px] transition-all duration-200 ${
                    activeArtifact === art.id
                      ? "conv-active"
                      : "hover:bg-[var(--overlay-light)]"
                  }`}
                  style={{
                    background:
                      activeArtifact === art.id
                        ? undefined
                        : "var(--overlay-faint)",
                    border:
                      activeArtifact === art.id
                        ? undefined
                        : "1px solid var(--border-faint)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText
                          size={13}
                          color={
                            activeArtifact === art.id ? "#6C5CE7" : "var(--text-faint)"
                          }
                        />
                        <span className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                          {art.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: "rgba(34,197,94,0.1)",
                            color: "#22C55E",
                            border: "1px solid rgba(34,197,94,0.2)",
                          }}
                        >
                          {art.status}
                        </span>
                        <span
                          className="text-[11px]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {art.type}
                        </span>
                        <span
                          className="text-[10px]"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {new Date(art.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p
                        className="text-[11px] mt-1.5 line-clamp-2 leading-relaxed"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {art.preview}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-2.5">
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-[var(--border-medium)]"
                      style={{ color: "#6C5CE7" }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveArtifact(art.id)
                        setArtifactView("preview")
                      }}
                    >
                      <Maximize2 size={10} />
                      Open
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-[var(--border-medium)]"
                      style={{ color: "var(--text-muted)" }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArtifactDownload(art)
                      }}
                    >
                      <Download size={10} />
                      Download
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-[var(--border-medium)]"
                      style={{ color: "var(--text-muted)" }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArtifactCopy(art)
                      }}
                    >
                      {copied === `${art.id}-artifact` ? (
                        <Check size={10} color="#22C55E" />
                      ) : (
                        <Copy size={10} />
                      )}
                      {copied === `${art.id}-artifact` ? "Copied" : "Copy"}
                    </button>
                    <button
                      className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-[var(--border-medium)]"
                      style={{ color: "var(--text-muted)" }}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleArtifactShare(art)
                      }}
                    >
                      <Share2 size={10} />
                      {copied === `${art.id}-share` ? "Copied" : "Share"}
                    </button>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-2 py-10 text-center">
                <FileText size={28} color="var(--border-strong)" className="mx-auto mb-3" />
                <p className="text-sm font-medium" style={{ color: "var(--text-faint)" }}>
                  No artifacts generated yet.
                </p>
              </div>
            )}
          </div>

          {/* Code/preview view */}
          <div
            className="flex-1 overflow-hidden mx-4 mb-4 rounded-[16px]"
            style={{
              background: "var(--surface-tertiary)",
              border: "1px solid var(--white-overlay-07)",
            }}
          >
            {(() => {
              const artifact = artifacts.find(
                (item) => item.id === activeArtifact,
              )
              if (!artifact) {
                return (
                  <div className="h-full flex items-center justify-center p-6 text-center">
                    <div>
                      <Eye size={32} color="var(--border-strong)" className="mx-auto mb-3" />
                      <p
                        className="text-sm font-medium"
                        style={{ color: "var(--text-faint)" }}
                      >
                        No artifact selected
                      </p>
                    </div>
                  </div>
                )
              }
              const artifactText = getArtifactText(artifact)
              
              const isImage =
                artifact.type.toLowerCase().includes("image") ||
                artifact.filename.match(/\.(png|jpe?g|gif|webp)$/i)
              const isHtml =
                artifact.type.toLowerCase().includes("html") ||
                artifact.filename.endsWith(".html")
              const isMarkdown =
                artifact.type.toLowerCase().includes("markdown") ||
                artifact.filename.endsWith(".md")
              const isDocument = ["pdf", "ppt"].includes(
                artifact.type.toLowerCase(),
              )
              if (artifactView === "preview") {
                return (
                  <div className="h-full overflow-y-auto p-4">
                    {isImage && artifact.url ? (
                      <img
                        src={artifact.url}
                        alt={artifact.title}
                        className="max-w-full rounded-[12px] mx-auto"
                      />
                    ) : isHtml ? (
                      <iframe
                        title={artifact.title}
                        srcDoc={artifactText}
                        className="w-full h-full rounded-[12px] bg-[var(--text-on-accent)]"
                      />
                    ) : isDocument && artifact.url ? (
                      <iframe
                        title={artifact.title}
                        src={artifact.url}
                        className="w-full h-full rounded-[12px]"
                      />
                    ) : isMarkdown ? (
                      <MarkdownContent content={artifactText} />
                    )  : (
  artifact.type.toLowerCase() === "code" ||
  [
    "java",
    "javascript",
    "js",
    "ts",
    "typescript",
    "cpp",
    "c",
    "python",
    "py",
    "go",
    "php",
    "cs",
  ].includes((artifact.language || "").toLowerCase())
) ? (
  <pre
    className="text-xs whitespace-pre-wrap overflow-auto"
    style={{
      color: "#A8B5C8",
      fontFamily: "JetBrains Mono, monospace",
    }}
  >
    <code>{artifactText}</code>
  </pre>
) : artifact.type.toLowerCase().includes("react") ? (
  <pre
    className="text-xs whitespace-pre-wrap"
    style={{ color: "#A8B5C8" }}
  >
    {artifactText}
  </pre>
) : (
                      <div className="h-full flex items-center justify-center text-center">
                        <div>
                          <Eye
                            size={32}
                            color="var(--border-strong)"
                            className="mx-auto mb-3"
                          />
                          <p
                            className="text-sm font-medium"
                            style={{ color: "var(--text-faint)" }}
                          >
                            Preview unavailable
                          </p>
                          <p
                            className="text-xs mt-1"
                            style={{ color: "var(--border-strong)" }}
                          >
                            Download this artifact to view it.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              }
              const codeLines = artifactText.split("\n")
              return (
                <div className="h-full overflow-y-auto">
                  <div
                    className="flex items-center gap-2 px-4 py-2.5"
                    style={{ borderBottom: "1px solid var(--border-color)" }}
                  >
                    <div className="flex gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: "#EF4444" }}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: "#F59E0B" }}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: "#22C55E" }}
                      />
                    </div>
                    <span
                      className="text-[11px] font-medium"
                      style={{
                        color: "var(--text-faint)",
                        fontFamily: "JetBrains Mono, monospace",
                      }}
                    >
                      {artifact.filename}
                    </span>
                    <span
                      className="text-[10px] ml-auto"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {artifact.language}
                    </span>
                    <button
                      onClick={() => handleArtifactCopy(artifact)}
                      className="text-[10px] ml-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {copied === `${artifact.id}-artifact` ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleArtifactDownload(artifact)}
                      className="text-[10px] ml-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setArtifactExpanded((current) => !current)}
                      className="text-[10px] ml-2"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {artifactExpanded ? "Collapse" : "Expand"}
                    </button>
                  </div>
                  <pre
                    className="p-4 text-[11.5px] leading-[1.8] overflow-x-auto"
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      color: "var(--code-text)",
                      background: "var(--code-bg)",
                      margin: 0,
                    }}
                  >
                    {(artifactExpanded
                      ? codeLines
                      : codeLines.slice(0, 16)
                    ).map((line, index) => (
                      <span key={index} className="block">
                        <span
                          className="mr-4 inline-block w-5 select-none text-right"
                          style={{ color: "var(--text-faint)" }}
                        >
                          {index + 1}
                        </span>
                        <span
                          dangerouslySetInnerHTML={highlightCodeLine(
                            line,
                            artifact.language,
                          )}
                        />
                      </span>
                    ))}
                  </pre>
                </div>
              )
            })()}
          </div>
        </div>
      </div>
      {rateLimit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          style={{
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="w-full max-w-sm rounded-[22px] p-6 animate-fade-in-up"
            style={{
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-medium)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {account.credits <= 0
                    ? "You've run out of credits."
                    : "Insufficient Credits"}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Your current credit balance cannot cover this request.
                </p>
              </div>
              <button
                onClick={() => setRateLimit(false)}
                className="p-1 rounded-lg hover:bg-[var(--overlay-light)]"
              >
                <X size={15} color="var(--text-muted)" />
              </button>
            </div>
            <div className="flex flex-col gap-3 mb-6">
              {[
                [
                  "Agent Name",
                  models.find((model) => model.id === activeModel)?.label,
                ],
                ["Allowed Requests", `${account.credits} credits remaining`],
                ["Retry After", "After your next top-up"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >
                  <span style={{ color: "var(--text-muted)" }}>{label}</span>
                  <span className="font-medium text-[var(--text-primary)]">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setRateLimit(false)
                if (account.credits <= 0) navigate("billing")
              }}
              className="w-full py-2.5 rounded-[12px] text-sm font-semibold text-[var(--text-primary)] gradient-primary"
            >
              {account.credits <= 0 ? "Upgrade Plan" : "OK"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
