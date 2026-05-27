import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import { adminMenu } from "./components/menu/adminMenu";
import "./styles/layout.css";

export default function AdminLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="flex h-full">
      <div className="layout-bg-overlay" />
      
      {/* Mobile overlay */}
      {isMobile && (
        <div 
          className={`sidebar-mobile-overlay ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar 
        menu={adminMenu} 
        userType="admin"
        userName="Admin User"
        userRole="Administrator"
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex flex-col w-full" style={{ position: 'relative', zIndex: 1 }}>
        <TopNav 
          userType="admin"
          userName="Admin User"
          userRole="Administrator"
          onToggleSidebar={() => {
            if (isMobile) {
              setMobileSidebarOpen(!mobileSidebarOpen);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
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