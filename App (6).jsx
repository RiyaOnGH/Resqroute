import React from "react";
import { useApp } from "./context/AppContext";
import { ConnectionStatus } from "./components/common/ConnectionStatus";
import { ToastContainer } from "./components/common/ToastContainer";

// Pages
import { DashboardPage } from "./pages/DashboardPage";
import { AlertsPage } from "./pages/AlertsPage";
import { CreateAlertPage } from "./pages/CreateAlertPage";
import { MapPage } from "./pages/MapPage";
import { DevicesPage } from "./pages/DevicesPage";
import { SheltersPage } from "./pages/SheltersPage";
import { QueuePage } from "./pages/QueuePage";
import { ActivityLogPage } from "./pages/ActivityLogPage";
import { DemoStudioPage } from "./pages/DemoStudioPage";
import { SettingsPage } from "./pages/SettingsPage";

// Icons
import {
  LifeBuoy,
  AlertTriangle,
  Map,
  Radio,
  Home,
  Send,
  Activity,
  Sparkles,
  Settings,
  PlusCircle,
  ShieldAlert
} from "lucide-react";

export function App() {
  const { activeTab, alerts, outgoingQueue, dispatch } = useApp();

  const pendingQueueCount = outgoingQueue.filter(q => q.status === "PENDING" || q.status === "RETRY").length;

  const renderActivePage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "alerts":
        return <AlertsPage />;
      case "create-alert":
        return <CreateAlertPage />;
      case "map":
        return <MapPage />;
      case "devices":
        return <DevicesPage />;
      case "shelters":
        return <SheltersPage />;
      case "queue":
        return <QueuePage />;
      case "activity":
        return <ActivityLogPage />;
      case "demo":
        return <DemoStudioPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-container">
      {/* 1. Global Connection Status Bar */}
      <ConnectionStatus />

      {/* 2. Top Header */}
      <header className="app-header" role="banner">
        <div
          className="brand-section"
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "dashboard" })}
        >
          <ShieldAlert size={28} className="brand-logo-icon" />
          <div>
            <h1 className="brand-title">
              ResQ<span>Route</span>
            </h1>
            <div className="brand-sub">Offline Emergency P2P Mesh</div>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-emergency btn-sm"
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "create-alert" })}
            title="Broadcast emergency hazard report"
          >
            <PlusCircle size={15} />
            <span>Create Alert</span>
          </button>
        </div>
      </header>

      {/* 3. Navigation Bar / Tabs */}
      <nav className="nav-bar" role="navigation" aria-label="Main Navigation">
        <button
          className={`nav-tab ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "dashboard" })}
        >
          <LifeBuoy size={16} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "alerts" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "alerts" })}
        >
          <AlertTriangle size={16} />
          <span>Alerts</span>
          {alerts.length > 0 && <span className="tab-badge">{alerts.length}</span>}
        </button>

        <button
          className={`nav-tab ${activeTab === "map" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "map" })}
        >
          <Map size={16} />
          <span>District Map</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "devices" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "devices" })}
        >
          <Radio size={16} />
          <span>P2P Devices</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "shelters" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "shelters" })}
        >
          <Home size={16} />
          <span>Shelters</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "queue" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "queue" })}
        >
          <Send size={16} />
          <span>Outbox Queue</span>
          {pendingQueueCount > 0 && (
            <span className="tab-badge" style={{ backgroundColor: "var(--status-warning)" }}>
              {pendingQueueCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "activity" })}
        >
          <Activity size={16} />
          <span>Activity Log</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "demo" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "demo" })}
        >
          <Sparkles size={16} style={{ color: "var(--status-accent)" }} />
          <span style={{ color: "var(--status-accent)" }}>Demo Studio</span>
        </button>

        <button
          className={`nav-tab ${activeTab === "settings" ? "active" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "settings" })}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </nav>

      {/* 4. Active Page Content */}
      <main className="main-content" role="main">
        {renderActivePage()}
      </main>

      {/* 5. Floating Toast Notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
