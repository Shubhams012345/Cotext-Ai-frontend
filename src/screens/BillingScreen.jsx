import { useState } from "react";
import {
  Sparkles,
  ArrowLeft,
  CreditCard,
  TrendingUp,
  Calendar,
  Zap,
  Check,
  LoaderCircle,
  X,
  RefreshCw,
} from "lucide-react";

const plans = [
  { name: "Free", price: "₹0", credits: 100, days: 30 },
  { name: "Starter", price: "₹199", credits: 500, days: 30 },
  { name: "Pro", price: "₹499", credits: 1000, days: 30 },
];

const costs = [
  ["Chat", "1 Credit"],
  ["Search", "5 Credits"],
  ["Coding", "10 Credits"],
  ["Vision", "10 Credits"],
  ["PDF", "10 Credits"],
  ["PPT", "10 Credits"],
];

const usage = [
  ["Today's Credits Used", "12", "-8%", Zap, "#F59E0B"],
  ["Weekly Usage", "86", "+14%", TrendingUp, "#6C5CE7"],
  ["Monthly Usage", "150", "+22%", Calendar, "#EC4899"],
  ["Remaining Credits", "350", "70% left", CreditCard, "#22C55E"],
];

async function createPayment(order) {
  const response = await fetch("/api/billing/create-order", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });
  if (!response.ok) throw new Error("Unable to create payment order");
  return response.json();
}

async function verifyPayment(payload) {
  const response = await fetch("/api/billing/verify-payment", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Payment verification failed");
  return response.json();
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Razorpay is unavailable"));
    document.body.appendChild(script);
  });
}

export default function BillingScreen({ navigate, account, setAccount }) {
  const [loading, setLoading] = useState(null);
  const [modal, setModal] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshAccount = async () => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/billing/me", {
        credentials: "include",
      });
      if (response.ok) {
        const refreshedAccount = await response.json();
        setAccount((current) => ({ ...current, ...refreshedAccount }));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const completePayment = async (payment, plan, kind) => {
    const refreshed = await verifyPayment(payment);
    setAccount((current) => ({
      ...current,
      ...(refreshed.account || {}),
      plan: refreshed.plan || (kind === "credits" ? current.plan : plan.name),
      credits:
        refreshed.credits ??
        (kind === "credits" ? current.credits + plan.credits : plan.credits),
      totalCredits:
        refreshed.totalCredits ??
        (kind === "credits" ? current.totalCredits : plan.credits),
    }));
    setModal({
      type: "success",
      title: "Payment Successful",
      message: `${plan.name} is now active. Your credits have been refreshed.`,
    });
  };

  const pay = async (plan, kind = "plan") => {
    setLoading(`${kind}-${plan.name}`);
    try {
      const order = await createPayment({
        plan: plan.name,
        amount: plan.price,
        purchaseType: kind,
      });
      await loadRazorpay();
      const checkout = new window.Razorpay({
        key: order.keyId || order.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "CotextAI",
        description: `${plan.name} ${kind === "credits" ? "credit top-up" : "plan"}`,
        order_id: order.orderId || order.id,
        handler: (response) =>
          completePayment(response, plan, kind).catch((error) =>
            setModal({
              type: "failure",
              title: "Payment Failed",
              message: error.message,
            }),
          ),
        modal: { ondismiss: () => setLoading(null) },
      });
      checkout.open();
    } catch (error) {
      setModal({
        type: "failure",
        title: "Payment Failed",
        message: error.message || "Please try again.",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "#09090B", fontFamily: "Inter, sans-serif" }}
    >
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
          <span className="text-sm font-bold">
            Cotext<span className="text-gradient-primary">AI</span>
          </span>
        </div>
        <span style={{ color: "#3F3F46" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "#A1A1AA" }}>
          Billing
        </span>
        <button
          onClick={refreshAccount}
          className="ml-auto p-2 rounded-[10px] hover:bg-white/5"
          title="Refresh billing"
        >
          <RefreshCw size={15} color={refreshing ? "#A78BFA" : "#71717A"} />
        </button>
      </nav>

      <main className="max-w-[1100px] mx-auto px-8 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium mb-1" style={{ color: "#6C5CE7" }}>
            Workspace billing
          </p>
          <h1 className="text-3xl font-bold text-white mb-2">
            Manage your plan
          </h1>
          <p className="text-sm" style={{ color: "#71717A" }}>
            Keep your agents running with flexible credits.
          </p>
        </div>

        <section className="grid grid-cols-3 gap-4 mb-8">
          <div
            className="col-span-2 p-6 rounded-[20px]"
            style={{
              background: "#111317",
              border: "1px solid rgba(108,92,231,0.35)",
              boxShadow: "0 0 30px rgba(108,92,231,0.08)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs" style={{ color: "#71717A" }}>
                  Current Plan
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <h2 className="text-2xl font-bold text-white">
                    {account.plan}
                  </h2>
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{
                      background: "rgba(108,92,231,0.15)",
                      color: "#A78BFA",
                      border: "1px solid rgba(108,92,231,0.25)",
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
              </div>
              <CreditCard size={20} color="#6C5CE7" />
            </div>
            <div className="grid grid-cols-4 gap-4 mt-8">
              {[
                ["Remaining Credits", account.credits],
                ["Total Credits", account.totalCredits],
                ["Days Remaining", account.daysRemaining],
                ["Renewal Date", account.expiry],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] mb-1" style={{ color: "#52525B" }}>
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="p-6 rounded-[20px]"
            style={{
              background: "#111317",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-xs" style={{ color: "#71717A" }}>
              Credits Remaining
            </p>
            <p className="text-3xl font-bold text-white mt-3">
              {account.credits}
            </p>
            <div
              className="h-1.5 rounded-full mt-5"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full gradient-primary"
                style={{
                  width: `${Math.min(100, (account.credits / account.totalCredits) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: "#52525B" }}>
              {account.totalCredits - account.credits} credits used
            </p>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-4 mb-10">
          {usage.map(([label, value, change, Icon, color]) => (
            <div
              key={label}
              className="p-5 rounded-[18px]"
              style={{
                background: "#111317",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex justify-between mb-4">
                <Icon size={16} color={color} />
                <span className="text-[10px]" style={{ color: "#22C55E" }}>
                  {change}
                </span>
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs mt-1" style={{ color: "#71717A" }}>
                {label}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-white">
              Available Plans
            </h2>
            <p className="text-xs mt-1" style={{ color: "#71717A" }}>
              Choose the plan that fits your workflow.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {plans.map((plan) => {
              const active = account.plan === plan.name;
              return (
                <div
                  key={plan.name}
                  className="p-5 rounded-[18px] relative"
                  style={{
                    background: active ? "rgba(108,92,231,0.09)" : "#111317",
                    border: active
                      ? "1px solid rgba(108,92,231,0.45)"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {active && (
                    <span
                      className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-1 rounded-full"
                      style={{
                        background: "rgba(108,92,231,0.18)",
                        color: "#A78BFA",
                      }}
                    >
                      CURRENT
                    </span>
                  )}
                  <p className="text-sm font-semibold text-white">
                    {plan.name}
                  </p>
                  <p className="text-2xl font-bold text-white mt-4">
                    {plan.price}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "#71717A" }}
                    >
                      {" "}
                      / month
                    </span>
                  </p>
                  <div
                    className="flex flex-col gap-2 mt-5 mb-5 text-xs"
                    style={{ color: "#A1A1AA" }}
                  >
                    <span className="flex items-center gap-2">
                      <Check size={13} color="#22C55E" />
                      {plan.credits} Credits
                    </span>
                    <span className="flex items-center gap-2">
                      <Check size={13} color="#22C55E" />
                      {plan.days} Days
                    </span>
                  </div>
                  <button
                    disabled={active || loading}
                    onClick={() => pay(plan)}
                    className="w-full py-2.5 rounded-[11px] text-xs font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: active
                        ? "rgba(255,255,255,0.06)"
                        : "linear-gradient(135deg, #6C5CE7, #7C3AED)",
                      color: "#fff",
                    }}
                  >
                    {loading === `plan-${plan.name}` ? (
                      <LoaderCircle size={14} className="mx-auto" />
                    ) : active ? (
                      "Active plan"
                    ) : (
                      "Upgrade plan"
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-6">
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              background: "#111317",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <h2 className="text-sm font-semibold text-white">Credit Costs</h2>
            </div>
            {costs.map(([name, cost], index) => (
              <div
                key={name}
                className="flex justify-between px-5 py-3 text-xs"
                style={{
                  borderBottom:
                    index < costs.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : "none",
                }}
              >
                <span style={{ color: "#A1A1AA" }}>{name}</span>
                <span className="font-medium text-white">{cost}</span>
              </div>
            ))}
          </div>
          <div
            className="rounded-[20px] p-5"
            style={{
              background: "#111317",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <h2 className="text-sm font-semibold text-white">Buy Credits</h2>
            <p className="text-xs mt-2" style={{ color: "#71717A" }}>
              Top up your workspace without changing your current plan.
            </p>
            <button
              onClick={() =>
                pay(
                  { name: "Credit top-up", price: "₹99", credits: 250 },
                  "credits",
                )
              }
              disabled={Boolean(loading)}
              className="mt-6 w-full py-2.5 rounded-[11px] text-xs font-semibold text-white gradient-primary disabled:opacity-50"
            >
              {loading === "credits-Credit top-up" ? (
                <LoaderCircle size={14} className="mx-auto" />
              ) : (
                "Buy 250 Credits · ₹99"
              )}
            </button>
          </div>
        </section>
      </main>

      {modal && (
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
            }}
          >
            <div className="flex justify-between">
              <div>
                <p className="text-base font-semibold text-white">
                  {modal.title}
                </p>
                <p className="text-xs mt-2" style={{ color: "#71717A" }}>
                  {modal.message}
                </p>
              </div>
              <button onClick={() => setModal(null)}>
                <X size={15} color="#71717A" />
              </button>
            </div>
            <button
              onClick={() => {
                setModal(null);
                refreshAccount();
              }}
              className="w-full mt-6 py-2.5 rounded-[12px] text-sm font-semibold text-white gradient-primary"
            >
              {modal.type === "success" ? "Continue" : "Try again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
