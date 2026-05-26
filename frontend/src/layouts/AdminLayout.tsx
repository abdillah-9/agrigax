import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { adminMenu } from "./components/menu/adminMenu";
import "./styles/layout.css";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-full">
      <div className="layout-bg-overlay" />

      <Sidebar 
        menu={adminMenu} 
        userType="admin"
        userName="Admin User"
        userRole="Administrator"
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-col w-full" style={{ position: 'relative', zIndex: 1 }}>
        <TopNav 
          userType="admin"
          userName="Admin User"
          userRole="Administrator"
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