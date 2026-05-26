import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { customerMenu } from "./components/menu/customerMenu";
import "./styles/layout.css";

export default function CustomerLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-full">
      {/* Background overlay - fixed position so it doesn't affect layout */}
      <div className="layout-bg-overlay" />

      <Sidebar 
        menu={customerMenu} 
        userType="customer"
        userName="John Doe"
        userRole="Customer"
        isCollapsed={sidebarCollapsed}
      />

      <div className="flex flex-col w-full" style={{ position: 'relative', zIndex: 1 }}>
        <TopNav 
          userType="customer"
          userName="John Doe"
          userRole="Customer"
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