import {
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Code2,
  Zap,
  Star,
  Calendar,
  MapPin,
  Link2,
  AtSign,
  Edit2,
  Award,
  TrendingUp,
  GitBranch,
  CreditCard,
} from "lucide-react"
const recentActivity = [
  {
    action: "Created artifact",
    detail: "FastAPI Server Blueprint",
    time: "2 minutes ago",
    icon: Code2,
  },
  {
    action: "Completed chat",
    detail: "Transformer Architecture Explained",
    time: "1 hour ago",
    icon: MessageSquare,
  },
  {
    action: "Generated slides",
    detail: "Q3 Product Roadmap.pptx",
    time: "3 hours ago",
    icon: Award,
  },
  {
    action: "Analyzed image",
    detail: "Competitor landing page review",
    time: "Yesterday",
    icon: TrendingUp,
  },
  {
    action: "Started chat",
    detail: "SQL migration script generation",
    time: "3 days ago",
    icon: MessageSquare,
  },
]

export default function ProfileScreen({ navigate, account }) {
  const avatar = account?.avatar || account?.avtar
  const initials = (account?.name || "User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const expiry = account?.planExpiresAt
    ? new Date(account.planExpiresAt).toLocaleDateString()
    : "Not set"
  const joined = account?.createdAt
    ? new Date(account.createdAt).toLocaleDateString()
    : "Not available"
  const profileStats = [
    {
      label: "Current Plan",
      value: account?.plan || "Free",
      icon: CreditCard,
      color: "#6C5CE7",
    },
    {
      label: "Remaining Credits",
      value: account?.credits ?? 0,
      icon: Zap,
      color: "#F59E0B",
    },
    {
      label: "Total Credits",
      value: account?.totalCredits ?? 0,
      icon: TrendingUp,
      color: "#22C55E",
    },
    { label: "Plan Expiry", value: expiry, icon: Calendar, color: "#EC4899" },
  ]
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center gap-4 px-8 py-4 sticky top-0 z-10"
        style={{
          background: "var(--nav-bg)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border-faint)",
        }}
      >
        <button
          onClick={() => navigate("workspace")}
          className="p-2 rounded-[10px] transition-all hover:bg-[var(--overlay-light)]"
        >
          <ArrowLeft size={16} color="var(--text-muted)" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[9px] flex items-center justify-center gradient-primary">
            <Sparkles size={12} color="var(--text-on-accent)" />
          </div>
          <span
            className="text-sm font-bold"
            style={{ letterSpacing: "-0.02em" }}
          >
            Cotext<span className="text-gradient-primary">AI</span>
          </span>
        </div>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Profile
        </span>
      </nav>

      <div className="max-w-[860px] mx-auto px-8 py-10">
        {/* Profile hero */}
        <div
          className="rounded-[24px] overflow-hidden mb-6 animate-fade-in-up"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          {/* Banner */}
          <div
            className="h-32 relative"
            style={{
              background:
                "linear-gradient(135deg, #1a1045 0%, #0f0a2e 40%, #0a0a15 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at 30% 50%, #6C5CE7 0%, transparent 60%)",
              }}
            />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse at 80% 30%, #7C3AED 0%, transparent 50%)",
              }}
            />
          </div>

          {/* Profile info */}
          <div className="px-8 pb-6">
            <div className="flex items-end justify-between -mt-8 mb-4">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold gradient-primary"
                style={{
                  border: "3px solid var(--bg-primary)",
                  boxShadow: "0 0 20px rgba(108,92,231,0.4)",
                }}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt=""
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  initials
                )}
              </div>
              <button
                onClick={() => navigate("settings")}
                className="flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: "var(--border-color)",
                  border: "1px solid var(--white-overlay-08)",
                  color: "var(--text-secondary)",
                }}
              >
                <Edit2 size={14} />
                Edit profile
              </button>
            </div>

            <h1
              className="text-2xl font-bold text-[var(--text-primary)] mb-1"
              style={{ letterSpacing: "-0.02em" }}
            >
              {account?.name || "User"}
            </h1>
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              {account?.email || "Email unavailable"}
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} color="var(--text-faint)" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Current account
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Link2 size={13} color="var(--text-faint)" />
                <span className="text-xs" style={{ color: "#6C5CE7" }}>
                  {account?.credits ?? 0} credits
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={13} color="var(--text-faint)" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Member since {joined}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <AtSign size={13} color="var(--text-faint)" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Plan expires {expiry}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitBranch size={13} color="var(--text-faint)" />
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Last login unavailable
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(108,92,231,0.15)",
                  color: "#A78BFA",
                  border: "1px solid rgba(108,92,231,0.25)",
                }}
              >
                {account?.plan || "Free"} Plan
              </span>
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(245,158,11,0.1)",
                  color: "#F59E0B",
                  border: "1px solid rgba(245,158,11,0.2)",
                }}
              >
                Power User
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6 animate-fade-in-up delay-100">
          {profileStats.map((stat) => (
            <div
              key={stat.label}
              className="p-5 rounded-[20px]"
              style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border-color)",
              }}
            >
              <stat.icon size={16} color={stat.color} className="mb-3" />
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

        {/* Activity */}
        <div
          className="rounded-[20px] overflow-hidden animate-fade-in-up delay-200"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: "1px solid var(--border-faint)" }}
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Recent Activity
            </h2>
          </div>
          <div>
            {recentActivity.map((item, i) => (
              <div
                key={item.detail}
                className="flex items-center gap-4 px-6 py-4"
                style={{
                  borderBottom:
                    i < recentActivity.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: "rgba(108,92,231,0.1)" }}
                >
                  <item.icon size={15} color="#6C5CE7" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    {item.action}
                  </p>
                  <p
                    className="text-xs truncate mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {item.detail}
                  </p>
                </div>
                <span className="text-xs shrink-0" style={{ color: "var(--text-faint)" }}>
                  {item.time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
