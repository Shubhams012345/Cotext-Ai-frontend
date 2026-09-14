import { useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import WorkspaceScreen from "./screens/WorkspaceScreen";
import DashboardScreen from "./screens/DashboardScreen";
import SettingsScreen from "./screens/SettingsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import BillingScreen from "./screens/BillingScreen";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [account, setAccount] = useState({
    name: "Alex Johnson",
    email: "alex@company.com",
    plan: "Starter",
    credits: 350,
    totalCredits: 500,
    expiry: "October 14, 2026",
    daysRemaining: 30,
  });

  const navigate = (s) => setScreen(s);

  if (screen === "login")
    return <LoginScreen onLogin={() => navigate("workspace")} />;
  if (screen === "dashboard") return <DashboardScreen navigate={navigate} />;
  if (screen === "settings") return <SettingsScreen navigate={navigate} />;
  if (screen === "profile") return <ProfileScreen navigate={navigate} />;
  if (screen === "billing")
    return (
      <BillingScreen
        navigate={navigate}
        account={account}
        setAccount={setAccount}
      />
    );
  return <WorkspaceScreen navigate={navigate} account={account} />;
}
