import { useEffect, useState } from "react"
import LoginScreen from "./screens/LoginScreen"
import WorkspaceScreen from "./screens/WorkspaceScreen"
import DashboardScreen from "./screens/DashboardScreen"
import SettingsScreen from "./screens/SettingsScreen"
import ProfileScreen from "./screens/ProfileScreen"
import BillingScreen from "./screens/BillingScreen"
import { getCurrentUser } from "./lib/auth"

export default function App() {
  const [screen, setScreen] = useState("login")
  const [account, setAccount] = useState({
    name: "Alex Johnson",
    email: "alex@company.com",
    plan: "Starter",
    credits: 350,
    totalCredits: 500,
    expiry: "October 14, 2026",
    daysRemaining: 30,
  })

  useEffect(() => {
    let mounted = true

    getCurrentUser()
      .then((user) => {
        if (!mounted) return
        setAccount((current) => ({ ...current, ...user }))
        setScreen("dashboard")
      })
      .catch((err) => {
        if (err.response?.status !== 400 && err.response?.status !== 401) {
          console.error("Unable to restore the authenticated session", err)
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  const navigate = (s) => setScreen(s)

  if (screen === "login")
    return (
      <LoginScreen
        onLogin={(user) => {
          setAccount((current) => ({ ...current, ...user }))
          navigate("dashboard")
        }}
      />
    )
 if (screen === "dashboard")
  return (
    <DashboardScreen
      navigate={navigate}
      account={account}
    />
  );
  if (screen === "settings")
    return (
      <SettingsScreen
        navigate={navigate}
        account={account}
        setAccount={setAccount}
      />
    )
  if (screen === "profile")
    return <ProfileScreen navigate={navigate} account={account} />
  if (screen === "billing")
    return (
      <BillingScreen
        navigate={navigate}
        account={account}
        setAccount={setAccount}
      />
    )
  return (
    <WorkspaceScreen
      navigate={navigate}
      account={account}
      setAccount={setAccount}
    />
  )
}
