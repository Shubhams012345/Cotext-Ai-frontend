import { useEffect, useState } from "react";
import { fetchConversations } from "../lib/conversationApi";
import {
  Sparkles,
  Plus,
  ArrowRight,
  Code2,
  MessageSquare,
  FileText,
  Image as ImageIcon,
  TrendingUp,
  Clock,
  Zap,
  Settings,
  User,
  ChevronRight,
  BarChart2,
  Star,
  BookOpen,
} from "lucide-react";
const stats = [
  {
    label: "Total Chats",
    value: "2,847",
    change: "+12%",
    icon: MessageSquare,
    color: "#6C5CE7",
  },
  {
    label: "Tokens Used",
    value: "1.2M",
    change: "+8%",
    icon: Zap,
    color: "#F59E0B",
  },
  {
    label: "Artifacts",
    value: "143",
    change: "+24%",
    icon: Code2,
    color: "#22C55E",
  },
  {
    label: "Saved Hours",
    value: "68h",
    change: "+18%",
    icon: Clock,
    color: "#EC4899",
  },
];

const recentChats = [
  {
    title: "Build a REST API with FastAPI",
    model: "Coding",
    time: "2m ago",
    icon: Code2,
  },
  {
    title: "Explain transformer architecture",
    model: "Chat",
    time: "1h ago",
    icon: MessageSquare,
  },
  {
    title: "Generate pitch deck slides",
    model: "PPT",
    time: "3h ago",
    icon: FileText,
  },
  {
    title: "Analyze competitor screenshots",
    model: "Image Analyzer",
    time: "Yesterday",
    icon: ImageIcon,
  },
  {
    title: "Research quantum computing",
    model: "Search",
    time: "Yesterday",
    icon: BookOpen,
  },
];

const quickActions = [
  {
    label: "New Chat",
    desc: "Start a conversation",
    icon: MessageSquare,
    color: "#6C5CE7",
    bg: "rgba(108,92,231,0.1)",
  },
  {
    label: "Write Code",
    desc: "Generate or debug code",
    icon: Code2,
    color: "#22C55E",
    bg: "rgba(34,197,94,0.1)",
  },
  {
    label: "Analyze Image",
    desc: "Understand visuals",
    icon: ImageIcon,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.1)",
  },
  {
    label: "Research Topic",
    desc: "Deep search & summary",
    icon: BookOpen,
    color: "#A855F7",
    bg: "rgba(168,85,247,0.1)",
  },
];

export default function DashboardScreen({ navigate ,account}) {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadConversations();
  }, []);
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Top nav */}
      <nav
        className="flex items-center justify-between px-8 py-4 sticky top-0 z-10"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-[10px] flex items-center justify-center gradient-primary"
            style={{ boxShadow: "0 0 14px rgba(108,92,231,0.35)" }}
          >
            <Sparkles size={14} color="var(--text-on-accent)" />
          </div>
          <span
            className="text-base font-bold"
            style={{ letterSpacing: "-0.02em" }}
          >
            Cotext<span className="text-gradient-primary">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("settings")}
            className="p-2 rounded-[10px] transition-all hover:bg-[var(--overlay-light)]"
          >
            <Settings size={16} color="var(--text-muted)" />
          </button>
          <button
            onClick={() => navigate("profile")}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold gradient-primary"
          >
        {account?.name
  ?.split(" ")
  .map((word) => word[0])
  .join("")
  .substring(0, 2)
  .toUpperCase() || "U"}
          </button>
        </div>
      </nav>

      <div className="max-w-[1100px] mx-auto px-8 py-10">
        {/* Welcome */}
        <div className="mb-10 animate-fade-in-up">
          <p className="text-sm font-medium mb-1" style={{ color: "#6C5CE7" }}>
            Good morning
          </p>
          <h1
            className="text-4xl font-bold text-[var(--text-primary)] mb-3"
            style={{ letterSpacing: "-0.03em" }}
          >
            Welcome back, {account?.name?.split(" ")[0] || "User"}
          </h1>
          <p style={{ color: "var(--text-muted)" }}>
            What would you like to build today?
          </p>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-100">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate("workspace")}
              className="flex flex-col gap-3 p-5 rounded-[20px] text-left transition-all duration-200 hover-lift group"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div
                className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                style={{ background: action.bg }}
              >
                <action.icon size={18} color={action.color} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">
                  {action.label}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {action.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-10 animate-fade-in-up delay-200">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-[20px]"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <stat.icon size={16} color={stat.color} />
                <span
                  className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    color: "#22C55E",
                  }}
                >
                  {stat.change}
                </span>
              </div>
              <p
                className="text-2xl font-bold text-[var(--text-primary)] mb-1"
                style={{ letterSpacing: "-0.02em" }}
              >
                {stat.value}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Recent chats */}
        <div
          className="rounded-[20px] overflow-hidden animate-fade-in-up delay-300"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Recent Conversations
            </h2>
            <button
              className="text-xs font-medium transition-opacity hover:opacity-100 opacity-60"
              style={{ color: "#6C5CE7" }}
              onClick={() => navigate("workspace")}
            >
              View all
            </button>
          </div>
          <div>
            {conversations.map((chat, i) => (
              <button
                key={chat._id}
                onClick={() => navigate("workspace")}
                className="w-full flex items-center gap-4 px-6 py-4 text-left transition-all hover:bg-[var(--overlay-faint)] group"
                style={{
                  borderBottom:
                    i < conversations.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(108,92,231,0.1)" }}
                >
                  <MessageSquare size={16} color="#6C5CE7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-faint)" }}>
                   <p
  className="text-xs mt-0.5"
  style={{ color: "var(--text-faint)" }}
>
  Conversation
</p>
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                    {new Date(chat.updatedAt).toLocaleString()}
                  </span>
                  <ChevronRight
                    size={14}
                    color="var(--text-faint)"
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* New chat CTA */}
        <button
          onClick={() => navigate("workspace")}
          className="mt-6 w-full flex items-center justify-center gap-2.5 py-4 rounded-[18px] text-sm font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98] animate-fade-in-up delay-400"
          style={{
            background: "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)",
            boxShadow: "0 8px 30px rgba(108,92,231,0.3)",
            color: "var(--text-on-accent)",
          }}
        >
          <Plus size={16} />
          Start New Chat
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
