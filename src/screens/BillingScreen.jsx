import { useState } from "react"

import api from "../lib/api"

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
} from "lucide-react"

const plans = [
  { id: "free", name: "Free", price: "₹0", amount: 0, credits: 100, days: 30 },

  {
    id: "starter",
    name: "Starter",
    price: "₹199",
    amount: 199,
    credits: 500,
    days: 30,
  },

  {
    id: "pro",
    name: "Pro",
    price: "₹499",
    amount: 499,
    credits: 1000,
    days: 30,
  },
]

const costs = [
  ["Chat", "1 Credit"],

  ["Search", "5 Credits"],

  ["Coding", "10 Credits"],

  ["Vision", "10 Credits"],

  ["PDF", "10 Credits"],

  ["PPT", "10 Credits"],
]

const usage = [
  ["Today's Credits Used", null, "", Zap, "#F59E0B"],

  ["Weekly Usage", null, "", TrendingUp, "#6C5CE7"],

  ["Monthly Usage", null, "", Calendar, "#EC4899"],

  ["Remaining Credits", null, "", CreditCard, "#22C55E"],
]

async function createPayment(order) {
  const { data } = await api.post("/billing/create-order", order)

  return data
}

async function verifyPayment(payload) {
  const { data } = await api.post("/billing/verify-payment", payload)

  return data
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement("script")

    script.src = "https://checkout.razorpay.com/v1/checkout.js"

    script.onload = resolve

    script.onerror = () => reject(new Error("Razorpay is unavailable"))

    document.body.appendChild(script)
  })
}

export default function BillingScreen({ navigate, account, setAccount }) {
  const [loading, setLoading] = useState(null)

  const [modal, setModal] = useState(null)

  const [refreshing, setRefreshing] = useState(false)

  const currentPlan =
    plans.find(
      (plan) => plan.id === String(account.plan || "").toLowerCase(),
    ) ||
    plans.find(
      (plan) =>
        plan.name.toLowerCase() === String(account.plan || "").toLowerCase(),
    )

  const remainingCredits = Number(account.credits || 0)

  const totalCredits = Number(account.totalCredits || currentPlan?.credits || 0)

  const expiryDate = account.planExpiresAt
    ? new Date(account.planExpiresAt).toLocaleDateString()
    : account.expiry || "Not set"

  const creditPercent = totalCredits
    ? Math.min(100, (remainingCredits / totalCredits) * 100)
    : 0

  const refreshAccount = async () => {
    setRefreshing(true)

    try {
      const { data } = await api.get("/me")

      setAccount((current) => ({ ...current, ...data }))
    } catch (error) {
      setModal({
        type: "failure",

        title: "Unable to Refresh Billing",

        message: error.response?.data?.message || "Please try again.",
      })
    } finally {
      setRefreshing(false)
    }
  }

  const completePayment = async (payment, plan, kind) => {
    const refreshed = await verifyPayment(payment)

    await refreshAccount()

    setModal({
      type: "success",

      title: "Payment Successful",

      message: `${plan.name} is now active. Your credits have been refreshed.`,
    })
  }

  const pay = async (plan, kind = "plan") => {
    setLoading(`${kind}-${plan.name}`)

    try {
      const order = await createPayment({
        plan: plan.id || "starter",

        purchaseType: kind,
      })

      await loadRazorpay()

      const checkout = new window.Razorpay({
        key: order.keyId,

        amount: order.order.amount,

        currency: order.order.currency || "INR",

        name: "CotextAI",

        description: `${plan.name} ${
          kind === "credits" ? "credit top-up" : "plan"
        }`,

        order_id: order.order.id,

        handler: (response) =>
          completePayment(response, plan, kind).catch((error) =>
            setModal({
              type: "failure",
              title: "Verification Failed",
              message: error.message,
            }),
          ),

        modal: {
          ondismiss: () => {
            setLoading(null)

            setModal({
              type: "cancelled",

              title: "Payment Cancelled",

              message: "The payment was cancelled. No changes were made.",
            })
          },
        },
      })

      checkout.open()
    } catch (error) {
      setModal({
        type: "failure",

        title: "Payment Failed",

        message: error.message || "Please try again.",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg-primary)", fontFamily: "Inter, sans-serif" }}
    >
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
          <span className="text-sm font-bold">
            Cotext<span className="text-gradient-primary">AI</span>
          </span>
        </div>
        <span style={{ color: "var(--text-faint)" }}>/</span>
        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Billing
        </span>
        <button
          onClick={refreshAccount}
          className="ml-auto p-2 rounded-[10px] hover:bg-[var(--overlay-light)]"
          title="Refresh billing"
        >
          <RefreshCw size={15} color={refreshing ? "#A78BFA" : "var(--text-muted)"} />
        </button>
      </nav>

      <main className="max-w-[1100px] mx-auto px-8 py-10">
        <div className="mb-8">
          <p className="text-sm font-medium mb-1" style={{ color: "#6C5CE7" }}>
            Workspace billing
          </p>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Manage your plan
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Keep your agents running with flexible credits.
          </p>
        </div>
        {totalCredits > 0 && creditPercent < 20 && (
          <div
            className="mb-8 rounded-[14px] px-4 py-3 text-sm"
            style={{
              background: "rgba(245,158,11,0.08)",

              border: "1px solid rgba(245,158,11,0.2)",

              color: "#FCD34D",
            }}
          >
            Your credit balance is running low. Upgrade your plan to keep using
            AI features.
          </div>
        )}
        {remainingCredits === 0 && (
          <div
            className="mb-8 flex items-center justify-between gap-4 rounded-[14px] px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",

              border: "1px solid rgba(239,68,68,0.2)",

              color: "#FCA5A5",
            }}
          >
            <span>You've run out of credits.</span>
            <button
              onClick={() =>
                document
                  .getElementById("available-plans")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="font-semibold"
              style={{ color: "#A78BFA" }}
            >
              Upgrade Plan
            </button>
          </div>
        )}

        <section className="grid grid-cols-3 gap-4 mb-8">
          <div
            className="col-span-2 p-6 rounded-[20px]"
            style={{
              background: "var(--bg-secondary)",

              border: "1px solid rgba(108,92,231,0.35)",

              boxShadow: "0 0 30px rgba(108,92,231,0.08)",
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Current Plan
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                    {currentPlan?.name || account.plan || "Free"}
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
                ["Remaining Credits", remainingCredits],

                ["Total Credits", totalCredits],

                [
                  "Days Remaining",
                  account.planExpiresAt
                    ? Math.max(
                        0,
                        Math.ceil(
                          (new Date(account.planExpiresAt) - Date.now()) /
                            86400000,
                        ),
                      )
                    : account.daysRemaining || 0,
                ],

                ["Renewal Date", expiryDate],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="text-[11px] mb-1" style={{ color: "var(--text-faint)" }}>
                    {label}
                  </p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="p-6 rounded-[20px]"
            style={{
              background: "var(--bg-secondary)",

              border: "1px solid var(--border-color)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Credits Remaining
            </p>
            <p className="text-3xl font-bold text-[var(--text-primary)] mt-3">
              {remainingCredits}
            </p>
            <div
              className="h-1.5 rounded-full mt-5"
              style={{ background: "var(--border-color)" }}
            >
              <div
                className="h-full rounded-full gradient-primary"
                style={{
                  width: `${creditPercent}%`,
                }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--text-faint)" }}>
              {Math.max(0, totalCredits - remainingCredits)} credits used
            </p>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-4 mb-10">
          {usage.map(([label, value, change, Icon, color]) => {
            const values = {
              "Today's Credits Used": Math.max(
                0,
                totalCredits - remainingCredits,
              ),

              "Weekly Usage": Math.max(0, totalCredits - remainingCredits),

              "Monthly Usage": Math.max(0, totalCredits - remainingCredits),

              "Remaining Credits": remainingCredits,
            }

            return (
              <div
                key={label}
                className="p-5 rounded-[18px]"
                style={{
                  background: "var(--bg-secondary)",

                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="flex justify-between mb-4">
                  <Icon size={16} color={color} />
                  <span className="text-[10px]" style={{ color: "#22C55E" }}>
                    {change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {values[label] ?? value ?? "-"}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            )
          })}
        </section>

        <section className="mb-10">
          <div className="mb-4" id="available-plans">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Available Plans
            </h2>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Choose the plan that fits your workflow.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {plans.map((plan) => {
              const active = currentPlan?.id === plan.id

              return (
                <div
                  key={plan.name}
                  className="p-5 rounded-[18px] relative"
                  style={{
                    background: active ? "rgba(108,92,231,0.09)" : "var(--bg-secondary)",

                    border: active
                      ? "1px solid rgba(108,92,231,0.45)"
                      : "1px solid var(--border-color)",
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
                  <p className="text-sm font-semibold text-[var(--text-primary)]">
                    {plan.name}
                  </p>
                  <p className="text-2xl font-bold text-[var(--text-primary)] mt-4">
                    {plan.price}
                    <span
                      className="text-xs font-normal"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {" "}
                      / month
                    </span>
                  </p>
                  <div
                    className="flex flex-col gap-2 mt-5 mb-5 text-xs"
                    style={{ color: "var(--text-secondary)" }}
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
                        ? "var(--border-color)"
                        : "linear-gradient(135deg, #6C5CE7, #7C3AED)",

                      color: "var(--text-on-accent)",
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
              )
            })}
          </div>
        </section>

        <section className="grid grid-cols-2 gap-6">
          <div
            className="rounded-[20px] overflow-hidden"
            style={{
              background: "var(--bg-secondary)",

              border: "1px solid var(--border-color)",
            }}
          >
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--border-faint)" }}
            >
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Credit Costs</h2>
            </div>
            {costs.map(([name, cost], index) => (
              <div
                key={name}
                className="flex justify-between px-5 py-3 text-xs"
                style={{
                  borderBottom:
                    index < costs.length - 1
                      ? "1px solid var(--border-subtle)"
                      : "none",
                }}
              >
                <span style={{ color: "var(--text-secondary)" }}>{name}</span>
                <span className="font-medium text-[var(--text-primary)]">{cost}</span>
              </div>
            ))}
          </div>
          <div
            className="rounded-[20px] p-5"
            style={{
              background: "var(--bg-secondary)",

              border: "1px solid var(--border-color)",
            }}
          >
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">Buy Credits</h2>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Top up your workspace without changing your current plan.
            </p>
            <button
              onClick={() =>
                pay(
                  {
                    id: "credits",
                    name: "Credit top-up",
                    price: "₹99",
                    credits: 250,
                  },

                  "credits",
                )
              }
              disabled={Boolean(loading)}
              className="mt-6 w-full py-2.5 rounded-[11px] text-xs font-semibold text-[var(--text-primary)] gradient-primary disabled:opacity-50"
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
              background: "var(--bg-secondary)",

              border: "1px solid var(--border-medium)",
            }}
          >
            <div className="flex justify-between">
              <div>
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  {modal.title}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {modal.message}
                </p>
              </div>
              <button onClick={() => setModal(null)}>
                <X size={15} color="var(--text-muted)" />
              </button>
            </div>
            <button
              onClick={() => {
                setModal(null)

                refreshAccount()
              }}
              className="w-full mt-6 py-2.5 rounded-[12px] text-sm font-semibold text-[var(--text-primary)] gradient-primary"
            >
              {modal.type === "success" ? "Continue" : "Try again"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
