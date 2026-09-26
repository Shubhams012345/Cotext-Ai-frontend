import { useEffect, useRef, useState } from "react"
import {
  Sparkles,
  ArrowLeft,
  User,
  Key,
  Bell,
  Shield,
  Palette,
  Cpu,
  CreditCard,
  Check,
  LogOut,
  HelpCircle,
  ExternalLink,
} from "lucide-react"
import { logout } from "../lib/auth"
import { preferenceKey, useTheme } from "../context/ThemeContext"
const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "api", label: "API Keys", icon: Key },
  { id: "models", label: "Models & AI", icon: Cpu },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "about", label: "About & Help", icon: HelpCircle },
]

const modelOptions = [
  { id: "auto", label: "Auto", badge: "Recommended" },
  { id: "chat", label: "Chat", badge: "" },
  { id: "coding", label: "Coding", badge: "" },
  { id: "search", label: "Search", badge: "" },
  { id: "vision", label: "Vision", badge: "" },
  { id: "pdf", label: "PDF", badge: "" },
  { id: "ppt", label: "PPT", badge: "" },
]

const defaultPreferences = {
  defaultModel: "auto",
  autoScroll: true,
  enterToSend: true,
  codeWrapping: false,
  syntaxHighlighting: true,
  appearance: "dark",
  notifications: {
    email: false,
    productUpdates: false,
    billingAlerts: true,
  },
}

export default function SettingsScreen({ navigate, account, setAccount }) {
  const [activeSection, setActiveSection] = useState("account")
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(preferenceKey))
      return {
        ...defaultPreferences,
        ...stored,
        notifications: {
          ...defaultPreferences.notifications,
          ...stored?.notifications,
        },
      }
    } catch {
      return defaultPreferences
    }
  })
  const [displayName, setDisplayName] = useState(account?.name || "")
  const [savedBanner, setSavedBanner] = useState(false)
  const [error, setError] = useState("")
  const savedTimerRef = useRef(null)
  const { setTheme } = useTheme()

  useEffect(() => {
    localStorage.setItem(preferenceKey, JSON.stringify(preferences))
  }, [preferences])

  const save = () => {
    setError("")
    setSavedBanner(true)
    if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    savedTimerRef.current = window.setTimeout(() => setSavedBanner(false), 2000)
  }

  useEffect(
    () => () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
    },
    [],
  )

  const updatePreference = (key, value) => {
    setPreferences((current) => ({ ...current, [key]: value }))
    if (key === "appearance") setTheme(value)
    save()
  }

  const handleLogout = async () => {
    try {
      await logout()
      setAccount({})
      navigate("login")
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log out right now.")
    }
  }

  const plan = account?.plan || "Free"
  const avatar = account?.avatar || account?.avtar
  const initials = (account?.name || "User")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center gap-4 px-4 sm:px-8 py-4 sticky top-0 z-10"
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
          Settings
        </span>

        {savedBanner && (
          <div
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium animate-fade-in"
            style={{
              background: "rgba(34,197,94,0.1)",
              border: "1px solid rgba(34,197,94,0.2)",
              color: "#22C55E",
            }}
          >
            <Check size={12} />
            Saved
          </div>
        )}
      </nav>

      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar nav */}
        <div className="w-full md:w-52 shrink-0">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none sticky top-16 md:top-20 z-[5]">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  s.id === "billing"
                    ? navigate("billing")
                    : setActiveSection(s.id)
                }
                className={`flex items-center gap-2.5 sm:gap-3 px-3.5 py-2.5 rounded-[12px] text-sm font-medium transition-all whitespace-nowrap shrink-0 md:shrink md:w-full text-left ${
                  activeSection === s.id
                    ? "bg-[var(--border-color)] text-[var(--text-primary)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--overlay-light)]"
                }`}
              >
                <s.icon size={15} />
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 animate-fade-in">
          {activeSection === "account" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-[var(--text-primary)] mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Account
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Manage your personal information
                </p>
              </div>
              <div
                className="flex flex-col sm:flex-row sm:items-center gap-5 p-5 sm:p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold gradient-primary shrink-0 overflow-hidden">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-[var(--text-primary)]">
                    {account?.name || "User"}
                  </p>
                  <p className="text-sm truncate" style={{ color: "var(--text-muted)" }}>
                    {account?.email || "Email unavailable"}
                  </p>
                  <span
                    className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(108,92,231,0.15)",
                      color: "#A78BFA",
                      border: "1px solid rgba(108,92,231,0.25)",
                    }}
                  >
                    {plan} Plan
                  </span>
                </div>
                <button
                  className="px-4 py-2 rounded-[12px] text-sm font-medium transition-all hover:opacity-80 self-start sm:self-auto shrink-0"
                  style={{
                    background: "var(--border-color)",
                    border: "1px solid var(--white-overlay-08)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Avatar updates unavailable
                </button>
              </div>
              <div
                className="flex flex-col gap-4 p-5 sm:p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {[
                  { label: "Full Name", value: displayName, editable: false },
                  {
                    label: "Email",
                    value: account?.email || "",
                    editable: false,
                  },
                ].map((field) => (
                  <div key={field.label}>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {field.label}
                    </label>
                    <input
                      value={field.value}
                      readOnly={!field.editable}
                      className="w-full px-4 py-2.5 rounded-[12px] text-sm text-[var(--text-primary)] outline-none transition-all"
                      style={{
                        background: "var(--border-subtle)",
                        border: "1px solid var(--white-overlay-08)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(108,92,231,0.4)"
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "var(--white-overlay-08)"
                      }}
                    />
                  </div>
                ))}
                <button
                  onClick={save}
                  className="self-start mt-2 px-5 py-2.5 rounded-[12px] text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    background:
                      "linear-gradient(135deg, #6C5CE7 0%, #7C3AED 100%)",
                    color: "var(--text-on-accent)",
                    boxShadow: "0 4px 14px rgba(108,92,231,0.3)",
                  }}
                >
                  Save changes
                </button>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Name and avatar changes require a backend profile endpoint.
                </p>
                <button
                  onClick={() =>
                    setError("Account deletion is not available yet.")
                  }
                  className="self-start text-xs font-medium"
                  style={{ color: "#F87171" }}
                >
                  Delete account
                </button>
              </div>
              {error && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {activeSection === "models" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-[var(--text-primary)] mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Models & AI
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Configure default AI models and behavior
                </p>
              </div>
              <div
                className="flex flex-col gap-3 p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Default Model
                </p>
                {modelOptions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updatePreference("defaultModel", m.id)}
                    className="flex items-center justify-between px-4 py-3 rounded-[14px] transition-all text-left"
                    style={{
                      background:
                        preferences.defaultModel === m.id
                          ? "rgba(108,92,231,0.1)"
                          : "var(--overlay-light)",
                      border:
                        preferences.defaultModel === m.id
                          ? "1px solid rgba(108,92,231,0.3)"
                          : "1px solid var(--border-color)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0"
                        style={{
                          borderColor:
                            preferences.defaultModel === m.id
                              ? "#6C5CE7"
                              : "var(--text-faint)",
                          background:
                            preferences.defaultModel === m.id
                              ? "#6C5CE7"
                              : "transparent",
                        }}
                      >
                        {preferences.defaultModel === m.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--text-on-accent)]" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {m.label}
                      </span>
                    </div>
                    {m.badge && (
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{
                          background: "rgba(108,92,231,0.15)",
                          color: "#A78BFA",
                        }}
                      >
                        {m.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div
                className="flex flex-col gap-4 p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">Behavior</p>
                {[
                  [
                    "autoScroll",
                    "Auto-scroll",
                    "Keep the newest message visible",
                  ],
                  [
                    "enterToSend",
                    "Enter to send",
                    "Use Enter to send and Shift+Enter for a new line",
                  ],
                  [
                    "codeWrapping",
                    "Code wrapping",
                    "Wrap long lines in code blocks",
                  ],
                  [
                    "syntaxHighlighting",
                    "Syntax highlighting",
                    "Highlight code block syntax",
                  ],
                ].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {desc}
                      </p>
                    </div>
                    <button
                      onClick={() => updatePreference(key, !preferences[key])}
                      className="relative w-11 h-6 rounded-full transition-all duration-200"
                      style={{
                        background: preferences[key]
                          ? "#6C5CE7"
                          : "var(--border-medium)",
                      }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-[var(--text-on-accent)] transition-all duration-200"
                        style={{
                          left: preferences[key] ? "calc(100% - 20px)" : "4px",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-[var(--text-primary)] mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Notifications
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Control how and when you receive alerts
                </p>
              </div>
              <div
                className="flex flex-col gap-5 p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {[
                  {
                    key: "email",
                    label: "Email notifications",
                    desc: "Receive updates via email",
                  },
                  {
                    key: "push",
                    label: "Product updates",
                    desc: "Receive product news and updates",
                  },
                  {
                    key: "billingAlerts",
                    label: "Billing alerts",
                    desc: "Receive payment and credit alerts",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {item.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        updatePreference("notifications", {
                          ...preferences.notifications,
                          [item.key]: !preferences.notifications[item.key],
                        })
                      }
                      className="relative w-11 h-6 rounded-full transition-all duration-200"
                      style={{
                        background: preferences.notifications[item.key]
                          ? "#6C5CE7"
                          : "var(--border-medium)",
                      }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-[var(--text-on-accent)] transition-all duration-200"
                        style={{
                          left: preferences.notifications[item.key]
                            ? "calc(100% - 20px)"
                            : "4px",
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Appearance
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Choose how CotextAI looks
                </p>
              </div>
              <div
                className="flex flex-col gap-3 p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                {["dark", "light", "system"].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updatePreference("appearance", theme)}
                    className="flex items-center justify-between px-4 py-3 rounded-[14px] text-left"
                    style={{
                      background:
                        preferences.appearance === theme
                          ? "rgba(108,92,231,0.1)"
                          : "var(--overlay-light)",
                      border:
                        preferences.appearance === theme
                          ? "1px solid rgba(108,92,231,0.3)"
                          : "1px solid var(--border-color)",
                    }}
                  >
                    <span className="text-sm font-medium text-[var(--text-primary)] capitalize">
                      {theme}
                    </span>
                    {preferences.appearance === theme && (
                      <Check size={15} color="#A78BFA" />
                    )}
                  </button>
                ))}
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Theme changes are saved and applied immediately.
                </p>
              </div>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  Privacy & Security
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Manage your active session
                </p>
              </div>
              <div
                className="flex flex-col gap-4 p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">
                    Current session
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Authenticated browser session
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="self-start flex items-center gap-2 px-4 py-2 rounded-[12px] text-sm font-medium"
                  style={{
                    background: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <LogOut size={14} /> Log out
                </button>
                <button
                  onClick={() =>
                    setError("Logout all devices is not available yet.")
                  }
                  className="self-start text-xs"
                  style={{ color: "var(--text-muted)" }}
                >
                  Logout all devices
                </button>
              </div>
              {error && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {activeSection === "about" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                  About & Help
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Application information and support
                </p>
              </div>
              <div
                className="flex flex-col gap-4 p-6 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <p className="text-sm text-[var(--text-primary)]">
                  Application version{" "}
                  <span style={{ color: "var(--text-muted)" }}>1.0.0</span>
                </p>
                <p className="text-sm text-[var(--text-primary)]">
                  Frontend version{" "}
                  <span style={{ color: "var(--text-muted)" }}>1.0.0</span>
                </p>
                {[
                  "Privacy Policy",
                  "Terms of Service",
                  "Contact Support",
                  "GitHub Repository",
                ].map((label) => (
                  <button
                    key={label}
                    onClick={() =>
                      setError(`${label} link is not configured yet.`)
                    }
                    className="flex items-center justify-between text-left text-sm"
                    style={{ color: "#A78BFA" }}
                  >
                    {label}
                    <ExternalLink size={13} />
                  </button>
                ))}
              </div>
              {error && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {![
            "account",
            "models",
            "notifications",
            "appearance",
            "privacy",
            "about",
          ].includes(activeSection) && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-[var(--text-primary)] mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Configuration for this section
                </p>
              </div>
              <div
                className="flex flex-col items-center justify-center py-16 rounded-[20px]"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                  style={{ background: "rgba(108,92,231,0.1)" }}
                >
                  {(() => {
                    const S = sections.find((s) => s.id === activeSection)
                    return S ? <S.icon size={22} color="#6C5CE7" /> : null
                  })()}
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  API keys are not supported by the current backend
                </p>
                <p className="text-xs" style={{ color: "var(--text-faint)" }}>
                  No API key is required for the authenticated application.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
