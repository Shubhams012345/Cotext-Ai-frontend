import { useState } from "react";
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
  ChevronRight,
  Check,
  Globe,
  Moon,
  Zap,
  Volume2,
  Eye,
} from "lucide-react";
const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "api", label: "API Keys", icon: Key },
  { id: "models", label: "Models & AI", icon: Cpu },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "billing", label: "Billing", icon: CreditCard },
];

const modelOptions = [
  { id: "gpt4", label: "GPT-4o", badge: "Latest" },
  { id: "claude", label: "Claude 3.5 Sonnet", badge: "Fast" },
  { id: "gemini", label: "Gemini 1.5 Pro", badge: "" },
  { id: "llama", label: "Llama 3.1 70B", badge: "Open" },
];

const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
];

export default function SettingsScreen({ navigate }) {
  const [activeSection, setActiveSection] = useState("account");
  const [defaultModel, setDefaultModel] = useState("claude");
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weekly: true,
  });
  const [language, setLanguage] = useState("English");
  const [streamingEnabled, setStreamingEnabled] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  const save = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#09090B", fontFamily: "Inter, sans-serif" }}
    >
      {/* Nav */}
      <nav
        className="flex items-center gap-4 px-8 py-4 sticky top-0 z-10"
        style={{
          background: "rgba(9,9,11,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <button
          onClick={() => navigate("workspace")}
          className="p-2 rounded-[10px] transition-all hover:bg-white/5"
        >
          <ArrowLeft size={16} color="#71717A" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[9px] flex items-center justify-center gradient-primary">
            <Sparkles size={12} color="#fff" />
          </div>
          <span
            className="text-sm font-bold"
            style={{ letterSpacing: "-0.02em" }}
          >
            Cotext<span className="text-gradient-primary">AI</span>
          </span>
        </div>
        <span style={{ color: "#3F3F46" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#A1A1AA" }}>
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

      <div className="max-w-[900px] mx-auto px-8 py-10 flex gap-8">
        {/* Sidebar nav */}
        <div className="w-52 shrink-0">
          <nav className="flex flex-col gap-1 sticky top-20">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() =>
                  s.id === "billing"
                    ? navigate("billing")
                    : setActiveSection(s.id)
                }
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all text-left ${
                  activeSection === s.id
                    ? "bg-white/[0.06] text-white"
                    : "text-[#71717A] hover:text-white hover:bg-white/[0.03]"
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
                  className="text-xl font-bold text-white mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Account
                </h2>
                <p className="text-sm" style={{ color: "#71717A" }}>
                  Manage your personal information
                </p>
              </div>
              <div
                className="flex items-center gap-5 p-6 rounded-[20px]"
                style={{
                  background: "#111317",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold gradient-primary shrink-0">
                  AJ
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-white">
                    Alex Johnson
                  </p>
                  <p className="text-sm" style={{ color: "#71717A" }}>
                    alex@company.com
                  </p>
                  <span
                    className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(108,92,231,0.15)",
                      color: "#A78BFA",
                      border: "1px solid rgba(108,92,231,0.25)",
                    }}
                  >
                    Pro Plan
                  </span>
                </div>
                <button
                  className="px-4 py-2 rounded-[12px] text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    color: "#A1A1AA",
                  }}
                >
                  Change photo
                </button>
              </div>
              <div
                className="flex flex-col gap-4 p-6 rounded-[20px]"
                style={{
                  background: "#111317",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {[
                  { label: "Full Name", value: "Alex Johnson" },
                  { label: "Email", value: "alex@company.com" },
                  { label: "Username", value: "@alexj" },
                  { label: "Job Title", value: "Senior Engineer" },
                ].map((field) => (
                  <div key={field.label}>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "#A1A1AA" }}
                    >
                      {field.label}
                    </label>
                    <input
                      defaultValue={field.value}
                      className="w-full px-4 py-2.5 rounded-[12px] text-sm text-white outline-none transition-all"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = "rgba(108,92,231,0.4)";
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = "rgba(255,255,255,0.08)";
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
                    color: "#fff",
                    boxShadow: "0 4px 14px rgba(108,92,231,0.3)",
                  }}
                >
                  Save changes
                </button>
              </div>
            </div>
          )}

          {activeSection === "models" && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-white mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Models & AI
                </h2>
                <p className="text-sm" style={{ color: "#71717A" }}>
                  Configure default AI models and behavior
                </p>
              </div>
              <div
                className="flex flex-col gap-3 p-6 rounded-[20px]"
                style={{
                  background: "#111317",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-sm font-semibold text-white mb-2">
                  Default Model
                </p>
                {modelOptions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setDefaultModel(m.id)}
                    className="flex items-center justify-between px-4 py-3 rounded-[14px] transition-all text-left"
                    style={{
                      background:
                        defaultModel === m.id
                          ? "rgba(108,92,231,0.1)"
                          : "rgba(255,255,255,0.03)",
                      border:
                        defaultModel === m.id
                          ? "1px solid rgba(108,92,231,0.3)"
                          : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0"
                        style={{
                          borderColor:
                            defaultModel === m.id ? "#6C5CE7" : "#3F3F46",
                          background:
                            defaultModel === m.id ? "#6C5CE7" : "transparent",
                        }}
                      >
                        {defaultModel === m.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-white">
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
                  background: "#111317",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <p className="text-sm font-semibold text-white">Behavior</p>
                {[
                  {
                    label: "Streaming responses",
                    desc: "Show tokens as they're generated",
                    state: streamingEnabled,
                    toggle: () => setStreamingEnabled(!streamingEnabled),
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#71717A" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={item.toggle}
                      className="relative w-11 h-6 rounded-full transition-all duration-200"
                      style={{
                        background: item.state
                          ? "#6C5CE7"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                        style={{
                          left: item.state ? "calc(100% - 20px)" : "4px",
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
                  className="text-xl font-bold text-white mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  Notifications
                </h2>
                <p className="text-sm" style={{ color: "#71717A" }}>
                  Control how and when you receive alerts
                </p>
              </div>
              <div
                className="flex flex-col gap-5 p-6 rounded-[20px]"
                style={{
                  background: "#111317",
                  border: "1px solid rgba(255,255,255,0.06)",
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
                    label: "Push notifications",
                    desc: "Browser push alerts",
                  },
                  {
                    key: "weekly",
                    label: "Weekly digest",
                    desc: "Summary of your activity",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {item.label}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#71717A" }}
                      >
                        {item.desc}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setNotifications((n) => ({
                          ...n,
                          [item.key]: !n[item.key],
                        }))
                      }
                      className="relative w-11 h-6 rounded-full transition-all duration-200"
                      style={{
                        background: notifications[item.key]
                          ? "#6C5CE7"
                          : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200"
                        style={{
                          left: notifications[item.key]
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

          {!["account", "models", "notifications"].includes(activeSection) && (
            <div className="flex flex-col gap-6">
              <div>
                <h2
                  className="text-xl font-bold text-white mb-1"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {sections.find((s) => s.id === activeSection)?.label}
                </h2>
                <p className="text-sm" style={{ color: "#71717A" }}>
                  Configuration for this section
                </p>
              </div>
              <div
                className="flex flex-col items-center justify-center py-16 rounded-[20px]"
                style={{
                  background: "#111317",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
                  style={{ background: "rgba(108,92,231,0.1)" }}
                >
                  {(() => {
                    const S = sections.find((s) => s.id === activeSection);
                    return S ? <S.icon size={22} color="#6C5CE7" /> : null;
                  })()}
                </div>
                <p className="text-sm font-medium text-white mb-1">
                  Coming soon
                </p>
                <p className="text-xs" style={{ color: "#52525B" }}>
                  This section is under development
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
