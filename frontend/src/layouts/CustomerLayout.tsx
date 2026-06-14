import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import VerifyAccountBanner from "../components/VerifyAccountBanner";
import { useAuthContext } from "../contexts/AuthContext";
import { customerMenu } from "./components/menu/customerMenu";
import { displayName, roleLabel } from "../utils/userDisplay";
import "./styles/layout.css";

export default function CustomerLayout() {
  const { user } = useAuthContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const userName = displayName(user);
  const userRole = user ? roleLabel(user.role) : "Customer";

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
      
      {isMobile && (
        <div 
          className={`sidebar-mobile-overlay ${mobileSidebarOpen ? 'active' : ''}`}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar 
        menu={customerMenu} 
        userType="customer"
        userName={userName}
        userRole={userRole}
        isVerified={user?.isVerified ?? false}
        userPhone={user?.phone || ""}
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex flex-col w-full" style={{ position: 'relative', zIndex: 1 }}>
        <TopNav 
          userType="customer"
          userName={userName}
          userRole={userRole}
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
            {user && <VerifyAccountBanner user={user} />}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
