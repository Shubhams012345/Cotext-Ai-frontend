import { useState } from "react";
import { Sparkles, Shield, Zap, Lock } from "lucide-react";

// Google "G" logo as inline SVG — no icon library dependency
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}

// Slot for future providers — renders nothing when providers list is empty
function ProviderButton({ icon, label, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 py-3.5 rounded-[14px] text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#D4D4D8",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "rgba(255,255,255,0.07)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      // Firebase Google Sign-In → POST /auth/login with { token }
      // Simulated for demo; replace with:
      //   const provider = new GoogleAuthProvider();
      //   const result = await signInWithPopup(auth, provider);
      //   const token = await result.user.getIdToken();
      //   await fetch('/auth/login', { method: 'POST', credentials: 'include',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ token }) });
      await new Promise((r) => setTimeout(r, 1400));
      onLogin();
    } catch {
      setError("Sign-in failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#09090B" }}
    >
      {/* Background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #6C5CE7 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #7C3AED 0%, transparent 70%)", filter: "blur(80px)" }}
        />
        <div
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #A855F7 0%, transparent 70%)", filter: "blur(60px)" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md px-6 animate-fade-in-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center gradient-primary glow-primary">
            <Sparkles size={18} color="#fff" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            Cotext<span className="text-gradient-primary">AI</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-[22px] p-8"
          style={{
            background: "#111317",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.02)",
          }}
        >
          <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.02em" }}>
            Welcome back
          </h1>
          <p className="text-sm mb-8" style={{ color: "#A1A1AA" }}>
            Sign in to your CotextAI workspace
          </p>

          {/* Primary sign-in action */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-[16px] text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: loading
                  ? "rgba(255,255,255,0.05)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.04) 100%)",
                border: loading
                  ? "1px solid rgba(255,255,255,0.06)"
                  : "1px solid rgba(255,255,255,0.1)",
                color: loading ? "#52525B" : "#fff",
                boxShadow: loading ? "none" : "0 4px 20px rgba(0,0,0,0.3)",
              }}
            >
              {/* Subtle shimmer on hover */}
              {!loading && (
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
                  }}
                />
              )}

              {loading ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 shrink-0"
                    style={{
                      borderColor: "rgba(255,255,255,0.15)",
                      borderTopColor: "#6C5CE7",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  <span style={{ color: "#71717A" }}>Signing in…</span>
                </>
              ) : (
                <>
                  <GoogleLogo />
                  Continue with Google
                </>
              )}
            </button>

            {/* Future providers slot — add ProviderButton entries here */}
            {/* Example:
            <ProviderButton icon={<GitHubLogo />} label="Continue with GitHub" onClick={handleGitHubSignIn} />
            <ProviderButton icon={<MicrosoftLogo />} label="Continue with Microsoft" onClick={handleMicrosoftSignIn} />
            <ProviderButton icon={<AppleLogo />} label="Continue with Apple" onClick={handleAppleSignIn} />
            */}
          </div>

          {/* Error message */}
          {error && (
            <div
              className="flex items-center gap-2 mt-4 px-4 py-3 rounded-[12px] text-sm animate-fade-in"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#FCA5A5",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#EF4444" }} />
              {error}
            </div>
          )}

          {/* Trust signals */}
          <div
            className="flex items-center gap-6 mt-8 pt-6"
            style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              <Shield size={13} color="#52525B" />
              <span className="text-[11px]" style={{ color: "#52525B" }}>SOC 2 Type II</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock size={13} color="#52525B" />
              <span className="text-[11px]" style={{ color: "#52525B" }}>End-to-end encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={13} color="#52525B" />
              <span className="text-[11px]" style={{ color: "#52525B" }}>Zero data retention</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: "#3F3F46" }}>
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-[#71717A] transition-colors">Terms of Service</span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-[#71717A] transition-colors">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
