import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiSearch,
  HiSun,
  HiMoon,
  HiMenu,
  HiMenuAlt2,
  HiChevronDown,
  HiUser,
  HiCog,
  HiLogout,
  HiX,
  HiDotsVertical
} from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { profilePath, settingsPath, userInitials } from "../../utils/userDisplay";

type Props = {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  userType?: 'admin' | 'customer' | 'provider';
  userName?: string;
  userRole?: string;
};

export default function TopNav({
  onToggleSidebar,
  isSidebarCollapsed = false,
  userType = 'customer',
  userName = 'User',
  userRole = 'User'
}: Props) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const notificationsPath =
    userType === "admin"
      ? "/admin/notifications"
      : userType === "provider"
        ? "/provider/notifications"
        : "/app/notifications";

  useEffect(() => {
    let active = true;

    async function loadUnreadCount() {
      const rows = await fetchNotifications();
      if (active) {
        setUnreadCount(rows.filter((n) => !n.isRead).length);
      }
    }

    loadUnreadCount();
    return () => {
      active = false;
    };
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToProfile = () => {
    setShowProfileMenu(false);
    navigate(profilePath(userType));
  };

  const goToSettings = () => {
    setShowProfileMenu(false);
    navigate(settingsPath(userType));
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
  };

  return (
    <header className="topnav-premium flex items-center px-xl">
      {showMobileSearch && (
        <div className="mobile-search-overlay">
          <div className="flex items-center gap-sm w-full" style={{ padding: '0 16px' }}>
            <HiSearch style={{ fontSize: 18 }} />
            <input
              ref={mobileSearchRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="mobile-search-input"
            />
            <button onClick={() => setShowMobileSearch(false)}>
              <HiX />
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center w-full">
        <div className="flex items-center gap-md left-side">
          <button className="icon-btn-premium" onClick={onToggleSidebar}>
            {isSidebarCollapsed ? <HiMenu /> : <HiMenuAlt2 />}
          </button>

          <div className="page-info-container">
            <h3 className="page-title-premium text-lg fw-bold agrigax-split">
              <span className="agri-part">
                Agri
                <span className="agri-underline" />
              </span>
              <span className="gax-part">
                Gax
                <span className="gax-underline" />
                <span className="gax-sparkle" />
              </span>
            </h3>

            <p className="text-xs portal-subtitle py-xs">
              {userType.charAt(0).toUpperCase() + userType.slice(1)} Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-sm topnav-actions">
          <div className="desktop-search">
            <HiSearch className="search-icon" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="search-input-premium"
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              style={{ width: isSearchFocused ? 260 : 200 }}
            />
          </div>

          <button
            className="icon-btn-premium mobile-only mobile-allowed-icon"
            onClick={() => setShowMobileSearch(true)}
          >
            <HiSearch />
          </button>

          <div className="flex items-center gap-sm">
            <button
              className="icon-btn-premium desktop-only mobile-un-allowed-icon relative"
              onClick={() => navigate(notificationsPath)}
            >
              <HiBell />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            <button
              className="icon-btn-premium desktop-only mobile-un-allowed-icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <HiSun /> : <HiMoon />}
            </button>
          </div>

          <div ref={moreRef} className="relative">
            <button
              className="icon-btn-premium mobile-allowed-icon"
              onClick={() => setShowMoreMenu(v => !v)}
            >
              <HiDotsVertical />
            </button>

            {showMoreMenu && (
              <div className="dropdown-menu-premium">
                <button
                  className="dropdown-item-premium"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                >
                  {isDarkMode ? <HiSun /> : <HiMoon />}
                  Theme
                </button>

                <button
                  className="dropdown-item-premium"
                  onClick={() => {
                    setShowMoreMenu(false);
                    navigate(notificationsPath);
                  }}
                >
                  <HiBell />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          <div ref={profileRef}>
            <button
              className="profile-btn-premium"
              onClick={() => setShowProfileMenu(v => !v)}
            >
              <div className="profile-avatar-sm">
                {userInitials(userName)}
              </div>

              <span className="profile-info-text">
                {userName}
              </span>

              <HiChevronDown />
            </button>

            {showProfileMenu && (
              <div className="dropdown-menu-premium">
                <div className="dropdown-item-premium" style={{ cursor: "default", opacity: 0.8 }}>
                  <HiUser /> {userRole}
                </div>

                <button className="dropdown-item-premium" onClick={goToProfile}>
                  <HiUser /> Profile
                </button>

                <button className="dropdown-item-premium" onClick={goToSettings}>
                  <HiCog /> Settings
                </button>

                <button className="dropdown-item-premium text-red" onClick={handleLogout}>
                  <HiLogout /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
