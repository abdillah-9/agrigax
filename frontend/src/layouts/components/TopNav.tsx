import { useState, useRef, useEffect } from "react";
import { 
  HiBell, 
  HiSearch, 
  HiSun, 
  HiMoon,
  HiMenu,
  HiMenuAlt2,
  HiChevronDown,
  HiCog,
  HiLogout,
  HiUser
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
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const notifications = [
    { id: 1, title: 'New booking request', time: '2 min ago', type: 'booking', read: false },
    { id: 2, title: 'Payment received', time: '1 hour ago', type: 'payment', read: false },
    { id: 3, title: 'System update completed', time: '3 hours ago', type: 'system', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      booking: 'var(--info-base, #3A7BD5)',
      payment: 'var(--success-base, #2E7D4F)',
      system: 'var(--secondary-base, #AF9A5A)'
    };
    return colors[type] || 'var(--primary-base, #4B815B)';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarClass = () => {
    const classes: Record<string, string> = {
      admin: 'avatar-admin',
      customer: 'avatar-customer',
      provider: 'avatar-provider'
    };
    return classes[userType] || 'avatar-customer';
  };

  return (
    <header className="topnav-premium flex items-center px-xl">
      <div className="flex justify-between items-center w-full">
        {/* Left Section */}
        <div className="flex items-center gap-lg">
          {/* Sidebar Toggle Button - Now in TopNav */}
          <button 
            className="icon-btn-premium"
            onClick={onToggleSidebar}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsed ? (
              <HiMenu className="text-xl" />
            ) : (
              <HiMenuAlt2 className="text-xl" />
            )}
          </button>

          <div>
            <h3 className="text-xl fw-bold page-title-premium">
              Dashboard
            </h3>
            <div className="flex items-center gap-sm mt-xs">
              <p className="text-xs fw-medium portal-subtitle">
                {userType.charAt(0).toUpperCase() + userType.slice(1)} Portal
              </p>
              <div className="separator-dot" />
              <p className="text-xs date-display">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex gap-md items-center">
          {/* Search Bar */}
          <div style={{ position: 'relative' }}>
            <HiSearch style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: isSearchFocused ? 'var(--primary-base, #4B815B)' : 'var(--secondary-dark, #8C7A48)',
              zIndex: 1
            }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-sm search-input-premium"
              style={{ width: isSearchFocused ? 320 : 240 }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </div>

          {/* Mode Switch */}
          <button 
            className={`mode-switch-premium text-sm ${isDarkMode ? 'mode-switch-dark' : ''}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <HiMoon className="text-lg" /> : <HiSun className="text-lg" />}
            <span className="fw-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
          </button>

          {/* Notifications */}
          <div ref={notificationRef} style={{ position: 'relative' }}>
            <button 
              className="icon-btn-premium"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
            >
              <HiBell className="text-xl" />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="p-md" style={{ borderBottom: '1px solid rgba(75, 129, 91, 0.08)' }}>
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm fw-semibold" style={{ color: 'var(--primary-darkest, #254036)' }}>
                      Notifications
                    </h4>
                    <span className="text-xs" style={{ color: 'var(--secondary-base, #AF9A5A)' }}>
                      {unreadCount} new
                    </span>
                  </div>
                </div>
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'notification-item-unread' : ''}`}
                    >
                      <div className="flex items-start gap-sm">
                        <div 
                          className="notification-dot-indicator mt-xs"
                          style={{ backgroundColor: getBadgeColor(notification.type) }}
                        />
                        <div style={{ flex: 1 }}>
                          <p className="text-sm fw-medium" style={{ color: 'var(--primary-darkest, #254036)' }}>
                            {notification.title}
                          </p>
                          <p className="text-xs mt-xs" style={{ color: 'var(--secondary-dark, #8C7A48)' }}>
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button 
              className="profile-btn-premium"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
            >
              <div className={`profile-avatar-sm ${getAvatarClass()}`}>
                {getInitials(userName)}
              </div>
              <div style={{ textAlign: 'left' }}>
                <div className="text-sm fw-semibold">{userName}</div>
                <div className="text-xs" style={{ color: 'var(--secondary-dark, #8C7A48)' }}>
                  {userRole}
                </div>
              </div>
              <HiChevronDown className="text-sm" style={{
                transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }} />
            </button>

            {showProfileMenu && (
              <div className="dropdown-menu-premium">
                <button className="dropdown-item-premium text-sm">
                  <HiUser className="text-md" /> Profile
                </button>
                <button className="dropdown-item-premium text-sm">
                  <HiCog className="text-md" /> Settings
                </button>
                <div style={{ height: 1, background: 'rgba(75, 129, 91, 0.08)', margin: '4px 0' }} />
                <button className="dropdown-item-premium dropdown-item-danger text-sm">
                  <HiLogout className="text-md" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}