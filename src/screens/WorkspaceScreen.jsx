import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { conversations, models, messages, artifacts } from "../data/mockData";

const creditCosts = {
  auto: 1,
  chat: 1,
  coding: 10,
  search: 5,
  vision: 10,
  pdf: 10,
  ppt: 10,
};

export default function WorkspaceScreen({ navigate, account, setAccount }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [artifactPanelOpen, setArtifactPanelOpen] = useState(true);
  const [activeConv, setActiveConv] = useState("1");
  const [activeModel, setActiveModel] = useState("coding");
  const [input, setInput] = useState("");
  const [chatMessages, setChatMessages] = useState(messages);
  const [isTyping, setIsTyping] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState("1");
  const [artifactView, setArtifactView] = useState("code");
  const [copied, setCopied] = useState(null);
  const [rateLimit, setRateLimit] = useState(false);
  const messagesEndRef = useRef(null);

  const convGroups = ["Today", "Yesterday", "Previous 7 Days", "Older"];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const cost = creditCosts[activeModel] || 1;
    if (account.credits < cost) {
      setRateLimit(true);
      return;
    }
    const requestText = input.toLowerCase();
    const responseAgent =
      activeModel === "auto"
        ? requestText.includes("image") || requestText.includes("visual")
          ? "Vision"
          : requestText.includes("search") || requestText.includes("research")
            ? "Search"
            : "Coding"
        : models.find((model) => model.id === activeModel)?.label;
    setAccount((current) => ({ ...current, credits: current.credits - cost }));
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setChatMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I've analyzed your request and here's my detailed response. The implementation follows best practices and is production-ready with proper error handling, type safety, and documentation.",
          selectedAgent: activeModel === "auto" ? responseAgent : null,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 2200);
  };

  const handleCopy = (id) => {
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const modelIcons = {
    auto: <Zap size={12} />,
    chat: <MessageSquare size={12} />,
    coding: <Code2 size={12} />,
    search: <Search size={12} />,
    vision: <ImageIcon size={12} />,
    ppt: <Presentation size={12} />,
    pdf: <FileText size={12} />,
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#09090B", fontFamily: "Inter, sans-serif" }}
    >
      {/* LEFT SIDEBAR */}
      <aside
        className="sidebar-transition flex flex-col shrink-0 relative"
        style={{
          width: sidebarCollapsed ? "0px" : "280px",
          opacity: sidebarCollapsed ? 0 : 1,
          overflow: "hidden",
          background: "#0F1115",
          borderRight: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex flex-col h-full min-w-[280px]">
          {/* Sidebar Top */}
          <div
            className="p-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            {/* Logo row */}
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 gradient-primary"
                style={{ boxShadow: "0 0 14px rgba(108,92,231,0.35)" }}
              >
                <Sparkles size={14} color="#fff" />
              </div>
              <span
                className="text-base font-bold tracking-tight flex-1"
                style={{ letterSpacing: "-0.02em" }}
              >
                Cotext<span className="text-gradient-primary">AI</span>
              </span>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1.5 rounded-lg transition-all hover:bg-white/5 shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft size={15} color="#71717A" />
              </button>
            </div>

            {/* Search */}
            <div
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Search size={14} color="#52525B" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="flex-1 bg-transparent text-sm text-white placeholder-[#52525B] outline-none"
              />
            </div>
          </div>

          {/* New Chat */}
          <div className="px-4 pt-4 pb-2 shrink-0">
            <button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97]"
              style={{
                background: "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)",
                boxShadow: "0 6px 20px rgba(108,92,231,0.3)",
                color: "#fff",
              }}
            >
              <Plus size={16} />
              New Chat
            </button>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {convGroups.map((group) => {
              const groupConvs = conversations.filter((c) => c.group === group);
              if (!groupConvs.length) return null;
              return (
                <div key={group} className="mb-4">
                  <p
                    className="text-[10px] font-semibold uppercase tracking-widest px-2 mb-2"
                    style={{ color: "#3F3F46" }}
                  >
                    {group}
                  </p>
                  <div className="flex flex-col gap-1">
                    {groupConvs.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => setActiveConv(conv.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-[12px] transition-all duration-200 group ${
                          activeConv === conv.id
                            ? "conv-active"
                            : "hover:bg-white/[0.03]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className="text-[13px] font-medium truncate leading-tight"
                            style={{
                              color:
                                activeConv === conv.id ? "#fff" : "#D4D4D8",
                            }}
                          >
                            {conv.title}
                          </p>
                          <span
                            className="text-[10px] shrink-0 mt-0.5"
                            style={{ color: "#52525B" }}
                          >
                            {conv.time}
                          </span>
                        </div>
                        <p
                          className="text-[11px] truncate mt-0.5 leading-tight"
                          style={{ color: "#52525B" }}
                        >
                          {conv.preview}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Profile */}
          <div
            className="p-3 shrink-0"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all hover:bg-white/[0.03]"
              style={{ border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <div
                className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold"
                style={{
                  background: "linear-gradient(135deg, #6C5CE7, #7C3AED)",
                  color: "#fff",
                }}
              >
                AJ
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">
                  Alex Johnson
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: "#A78BFA" }}
                  >
                    {account.plan}
                  </span>
                  <span className="text-[10px]" style={{ color: "#71717A" }}>
                    {account.credits} credits
                  </span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => navigate("settings")}
                  className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                  title="Settings"
                >
                  <Settings size={14} color="#71717A" />
                </button>
                <button
                  onClick={() => navigate("login")}
                  className="p-1.5 rounded-lg transition-all hover:bg-white/10"
                  title="Logout"
                >
                  <LogOut size={14} color="#71717A" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Expand sidebar button when collapsed */}
      {sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(false)}
          className="absolute left-3 top-4 z-20 p-2 rounded-[10px] transition-all hover:bg-white/10 animate-fade-in"
          style={{
            background: "rgba(15,17,21,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <ChevronRight size={15} color="#A1A1AA" />
        </button>
      )}

      {/* CENTER CHAT */}
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden">
        {/* Chat header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[11px]" style={{ color: "#3F3F46" }}>
                Workspace
              </span>
              <span style={{ color: "#3F3F46" }}>/</span>
              <span className="text-[11px]" style={{ color: "#52525B" }}>
                Build a REST API with FastAPI
              </span>
            </div>
            <h2
              className="text-[15px] font-semibold text-white"
              style={{ letterSpacing: "-0.01em" }}
            >
              Build a REST API with FastAPI
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              title="Open billing"
            >
              <span style={{ color: "#F59E0B" }}>⭐</span>
              <span className="text-[11px] font-semibold text-white">
                {account.plan}
              </span>
              <span className="text-[11px]" style={{ color: "#71717A" }}>
                {account.credits} / {account.totalCredits}
              </span>
              <CreditCard size={12} color="#71717A" />
            </button>
            {/* Connection */}
            <div className="flex items-center gap-1.5">
              <div className="status-online" />
              <span className="text-xs" style={{ color: "#71717A" }}>
                Connected
              </span>
            </div>
            {/* Toggle artifact panel */}
            <button
              onClick={() => setArtifactPanelOpen(!artifactPanelOpen)}
              className="p-2 rounded-[10px] transition-all hover:bg-white/5"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
              title="Toggle artifact panel"
            >
              {artifactPanelOpen ? (
                <PanelRightClose size={16} color="#71717A" />
              ) : (
                <PanelRightOpen size={16} color="#71717A" />
              )}
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-[720px] mx-auto flex flex-col gap-8">
            {chatMessages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex message-enter ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {msg.role === "assistant" && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 gradient-primary"
                    style={{ boxShadow: "0 0 12px rgba(108,92,231,0.3)" }}
                  >
                    <Sparkles size={13} color="#fff" />
                  </div>
                )}
                <div
                  className={`flex flex-col gap-3 ${msg.role === "user" ? "items-end" : "items-start"} max-w-[85%]`}
                >
                  <div
                    className={`px-5 py-3.5 rounded-[20px] text-sm leading-relaxed`}
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)",
                            color: "#fff",
                            borderBottomRightRadius: "6px",
                            boxShadow: "0 4px 16px rgba(108,92,231,0.25)",
                          }
                        : {
                            background: "#111317",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "#D4D4D8",
                            borderBottomLeftRadius: "6px",
                          }
                    }
                  >
                    {msg.content}
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
                      Selected Agent <strong>{msg.selectedAgent}</strong>
                    </span>
                  )}
                  {msg.code && (
                    <div
                      className="w-full rounded-[16px] overflow-hidden"
                      style={{
                        background: "#0D0D0F",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      {/* Code header */}
                      <div
                        className="flex items-center justify-between px-4 py-2.5"
                        style={{
                          borderBottom: "1px solid rgba(255,255,255,0.06)",
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
                              color: "#52525B",
                              fontFamily: "JetBrains Mono, monospace",
                            }}
                          >
                            {msg.code.lang}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-all hover:bg-white/5"
                            style={{ color: "#71717A" }}
                          >
                            {copied === msg.id ? (
                              <>
                                <Check size={12} color="#22C55E" />
                                <span style={{ color: "#22C55E" }}>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                          <button
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium transition-all hover:bg-white/5"
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
                          color: "#A8B5C8",
                          margin: 0,
                        }}
                      >
                        <code>{msg.code.content}</code>
                      </pre>
                    </div>
                  )}
                  <span
                    className="text-[10px] px-1"
                    style={{ color: "#3F3F46" }}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start message-enter">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mr-3 mt-0.5 shrink-0 gradient-primary"
                  style={{ boxShadow: "0 0 12px rgba(108,92,231,0.3)" }}
                >
                  <Sparkles size={13} color="#fff" />
                </div>
                <div
                  className="px-5 py-4 rounded-[20px]"
                  style={{
                    background: "#111317",
                    border: "1px solid rgba(255,255,255,0.07)",
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
        <div className="px-6 pb-6 shrink-0">
          <div className="max-w-[720px] mx-auto">
            {/* Model selector */}
            <div className="flex items-center gap-1 mb-3 overflow-x-auto pb-1">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveModel(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                    activeModel === m.id ? "segment-active" : "hover:bg-white/5"
                  }`}
                  style={{
                    color: activeModel === m.id ? "#A78BFA" : "#71717A",
                  }}
                >
                  {modelIcons[m.id]}
                  {m.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className="text-[10px]" style={{ color: "#52525B" }}>
                {activeModel === "auto"
                  ? "Auto automatically selects the best AI agent for your request."
                  : activeModel === "vision"
                    ? "Vision: Image Generation + Image Analysis · 10 Credits/request"
                    : activeModel === "pdf"
                      ? "PDF: Chat + RAG + Summary + Extraction · 10 Credits/request"
                      : `${models.find((model) => model.id === activeModel)?.label} uses ${creditCosts[activeModel]} Credit${creditCosts[activeModel] === 1 ? "" : "s"}/request`}
              </span>
            </div>

            {/* Input container */}
            <div
              className="flex flex-col rounded-[28px] transition-all duration-200"
              style={{
                background: "#111317",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.02)",
              }}
              onFocus={() => {}}
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask anything... (⌘↵ to send)"
                rows={1}
                className="flex-1 bg-transparent px-6 pt-5 pb-2 text-sm text-white placeholder-[#3F3F46] outline-none resize-none leading-relaxed"
                style={{ minHeight: "52px", maxHeight: "200px" }}
              />
              <div className="flex items-center justify-between px-4 pb-4">
                <div className="flex items-center gap-1">
                  <button
                    className="p-2 rounded-[10px] transition-all hover:bg-white/5"
                    title="Attach file"
                  >
                    <Paperclip size={16} color="#52525B" />
                  </button>
                  <button
                    className="p-2 rounded-[10px] transition-all hover:bg-white/5"
                    title="Voice input"
                  >
                    <Mic size={16} color="#52525B" />
                  </button>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-[14px] text-sm font-semibold transition-all duration-200 active:scale-95"
                  style={{
                    background: input.trim()
                      ? "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)"
                      : "rgba(255,255,255,0.05)",
                    color: input.trim() ? "#fff" : "#3F3F46",
                    boxShadow: input.trim()
                      ? "0 4px 14px rgba(108,92,231,0.3)"
                      : "none",
                  }}
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>

            <p
              className="text-center text-[10px] mt-3"
              style={{ color: "#27272A" }}
            >
              CotextAI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </main>

      {/* RIGHT ARTIFACT PANEL */}
      <div
        className="sidebar-transition shrink-0 flex flex-col"
        style={{
          width: artifactPanelOpen ? "360px" : "0px",
          opacity: artifactPanelOpen ? 1 : 0,
          overflow: "hidden",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          background: "#0F1115",
        }}
      >
        <div className="flex flex-col h-full min-w-[360px]">
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
          >
            <h3 className="text-sm font-semibold text-white">Artifacts</h3>
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1 p-1 rounded-[10px]"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <button
                  onClick={() => setArtifactView("code")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                    artifactView === "code"
                      ? "bg-white/10 text-white"
                      : "text-[#71717A]"
                  }`}
                >
                  <Code2 size={12} />
                  Code
                </button>
                <button
                  onClick={() => setArtifactView("preview")}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                    artifactView === "preview"
                      ? "bg-white/10 text-white"
                      : "text-[#71717A]"
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
            {artifacts.map((art) => (
              <button
                key={art.id}
                onClick={() => setActiveArtifact(art.id)}
                className={`w-full text-left px-4 py-3.5 rounded-[16px] transition-all duration-200 ${
                  activeArtifact === art.id
                    ? "conv-active"
                    : "hover:bg-white/[0.03]"
                }`}
                style={{
                  background:
                    activeArtifact === art.id
                      ? undefined
                      : "rgba(255,255,255,0.02)",
                  border:
                    activeArtifact === art.id
                      ? undefined
                      : "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText
                        size={13}
                        color={
                          activeArtifact === art.id ? "#6C5CE7" : "#52525B"
                        }
                      />
                      <span className="text-[13px] font-medium text-white truncate">
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
                        style={{ color: "#52525B" }}
                      >
                        {art.type}
                      </span>
                    </div>
                    <p
                      className="text-[11px] mt-1.5 line-clamp-2 leading-relaxed"
                      style={{ color: "#52525B" }}
                    >
                      {art.preview}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-2.5">
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-white/10"
                    style={{ color: "#6C5CE7" }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Maximize2 size={10} />
                    Open
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-white/10"
                    style={{ color: "#71717A" }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Download size={10} />
                    Download
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-white/10"
                    style={{ color: "#71717A" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(art.id + "art");
                    }}
                  >
                    {copied === art.id + "art" ? (
                      <Check size={10} color="#22C55E" />
                    ) : (
                      <Copy size={10} />
                    )}
                    {copied === art.id + "art" ? "Copied" : "Copy"}
                  </button>
                  <button
                    className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-medium transition-all hover:bg-white/10"
                    style={{ color: "#71717A" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard?.writeText(art.preview);
                    }}
                  >
                    <Share2 size={10} />
                    Share
                  </button>
                </div>
              </button>
            ))}
          </div>

          {/* Code/preview view */}
          <div
            className="flex-1 overflow-hidden mx-4 mb-4 rounded-[16px]"
            style={{
              background: "#0D0D0F",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {artifactView === "code" ? (
              <div className="h-full overflow-y-auto">
                <div
                  className="flex items-center gap-2 px-4 py-2.5"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
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
                      color: "#3F3F46",
                      fontFamily: "JetBrains Mono, monospace",
                    }}
                  >
                    main.py
                  </span>
                </div>
                <pre
                  className="p-4 text-[11.5px] leading-[1.8] overflow-x-auto"
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    color: "#A8B5C8",
                    margin: 0,
                  }}
                >
                  <code>{`from fastapi import FastAPI
from slowapi import Limiter
import aioredis

app = FastAPI(title="CotextAI API")
limiter = Limiter(key_func=get_remote_address)

@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}

@app.get("/posts/{post_id}")
@limiter.limit("60/minute")
async def get_post(post_id: str):
    cached = await redis.get(f"post:{post_id}")
    if cached:
        return json.loads(cached)
    return await db.posts.find_unique(
        where={"id": post_id}
    )`}</code>
                </pre>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <Eye size={32} color="#27272A" className="mx-auto mb-3" />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "#3F3F46" }}
                  >
                    Preview
                  </p>
                  <p className="text-xs mt-1" style={{ color: "#27272A" }}>
                    Python files render as code
                  </p>
                </div>
              </div>
            )}
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
              background: "#111317",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.55)",
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-base font-semibold text-white">
                  Rate Limit Reached
                </p>
                <p className="text-xs mt-1" style={{ color: "#71717A" }}>
                  Your current credit balance cannot cover this request.
                </p>
              </div>
              <button
                onClick={() => setRateLimit(false)}
                className="p-1 rounded-lg hover:bg-white/5"
              >
                <X size={15} color="#71717A" />
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
                  <span style={{ color: "#71717A" }}>{label}</span>
                  <span className="font-medium text-white">{value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setRateLimit(false)}
              className="w-full py-2.5 rounded-[12px] text-sm font-semibold text-white gradient-primary"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
