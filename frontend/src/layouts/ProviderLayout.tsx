import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { providerMenu } from "./components/menu/providerMenu";
import "./styles/layout.css";

export default function ProviderLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-full">
      <div className="layout-bg-overlay" />

      <Sidebar 
        menu={providerMenu} 
        userType="provider"
        userName="Provider User"
        userRole="Service Provider"
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-col w-full" style={{ position: 'relative', zIndex: 1 }}>
        <TopNav 
          userType="provider"
          userName="Provider User"
          userRole="Service Provider"
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          isSidebarCollapsed={sidebarCollapsed}
        />

        <main className="main-content-premium p-lg h-full" style={{height:'80vh', overflow:'auto'}}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}