import { useState, useRef, useEffect } from "react";
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
  userName = 'John Doe',
  userRole = 'User'
}: Props) {

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const notifications = [
    { id: 1, title: 'New booking request', time: '2 min ago', type: 'booking', read: false },
    { id: 2, title: 'Payment received', time: '1 hour ago', type: 'payment', read: false },
    { id: 3, title: 'System update completed', time: '3 hours ago', type: 'system', read: true },
  ];

  console.log(showNotifications);
  console.log(userRole);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="topnav-premium flex items-center px-xl">

      {/* MOBILE SEARCH OVERLAY */}
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

        {/* LEFT SIDE */}
        <div className="flex items-center gap-md left-side">

          {/* Sidebar Toggle */}
          <button
            className="icon-btn-premium"
            onClick={onToggleSidebar}
          >
            {isSidebarCollapsed ? <HiMenu /> : <HiMenuAlt2 />}
          </button>

          {/* Title */}
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

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-sm topnav-actions">

          {/* DESKTOP SEARCH */}
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

          {/* MOBILE SEARCH BUTTON */}
          <button
            className="icon-btn-premium mobile-only mobile-allowed-icon"
            onClick={() => setShowMobileSearch(true)}
          >
            <HiSearch />
          </button>

          {/* DESKTOP ACTIONS */}
          <div className="flex items-center gap-sm">

            {/* Bell */}
            <button className="icon-btn-premium desktop-only mobile-un-allowed-icon">
              <HiBell />
            </button>

            <button
              className="icon-btn-premium desktop-only mobile-un-allowed-icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
            >
              {isDarkMode ? <HiSun /> : <HiMoon />}
            </button>

          </div>
          {/* MORE MENU (⋯) */}
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
                    setShowNotifications(v => !v);
                    setShowMoreMenu(false);
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

          {/* PROFILE */}
          <div ref={profileRef}>
            <button
              className="profile-btn-premium"
              onClick={() => setShowProfileMenu(v => !v)}
            >
              <div className="profile-avatar-sm">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>

              <span className="profile-info-text">
                {userName}
              </span>

              <HiChevronDown />
            </button>

            {showProfileMenu && (
              <div className="dropdown-menu-premium">

                <button className="dropdown-item-premium">
                  <HiUser /> Profile
                </button>

                <button className="dropdown-item-premium">
                  <HiCog /> Settings
                </button>

                <button className="dropdown-item-premium text-red">
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