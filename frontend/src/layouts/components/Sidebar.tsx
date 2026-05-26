import { useState, useEffect, type JSX } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { MenuItem } from "./menu/types";
import { 
  HiHome, HiChartBar, HiUsers, HiCog, HiChevronDown,
  HiSparkles, HiCube, HiClipboardList, HiCurrencyDollar,
  HiHeart, HiBriefcase, HiCollection, HiCash, HiTrendingUp,
  HiCalendar, HiUser, HiBell, HiPhotograph, HiShieldCheck,
  HiEye, HiDocumentText, HiExclamation, HiSpeakerphone,
  HiTag, HiStar, HiFlag, HiServer, HiKey, HiBan, HiTemplate,
  HiQuestionMarkCircle, HiChat
} from "react-icons/hi";

type Props = {
  menu: MenuItem[];
  userType?: 'admin' | 'customer' | 'provider';
  userName?: string;
  userRole?: string;
  isCollapsed?: boolean;
};

export default function Sidebar({ menu, userType = 'customer', userName = 'John Doe', userRole = 'User', isCollapsed = false }: Props) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const location = useLocation();

  useEffect(() => {
    menu.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(child => 
          child.path && location.pathname === child.path
        );
        if (hasActiveChild && !expandedItems.includes(item.label)) {
          setExpandedItems(prev => [...prev, item.label]);
        }
      }
    });
  }, [location.pathname]);

  const toggleExpand = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const getIcon = (label: string): JSX.Element => {
    const icons: Record<string, JSX.Element> = {
      'Dashboard': <HiHome className="text-base" />,
      'Analytics': <HiChartBar className="text-base" />,
      'Users': <HiUsers className="text-base" />,
      'Settings': <HiCog className="text-base" />,
      'Profile': <HiUser className="text-base" />,
      'Bookings': <HiClipboardList className="text-base" />,
      'Payments': <HiCurrencyDollar className="text-base" />,
      'Favorites': <HiHeart className="text-base" />,
      'Providers': <HiBriefcase className="text-base" />,
      'My Listings': <HiCube className="text-base" />,
      'Earnings': <HiCash className="text-base" />,
      'Account': <HiUser className="text-base" />,
      'Overview': <HiChartBar className="text-base" />,
      'Availability': <HiCalendar className="text-base" />,
      'User Management': <HiUsers className="text-base" />,
      'Listings': <HiCollection className="text-base" />,
      'Reviews': <HiStar className="text-base" />,
      'Notifications': <HiBell className="text-base" />,
      'Content Management': <HiPhotograph className="text-base" />,
      'Monitoring': <HiShieldCheck className="text-base" />,
      'System': <HiCog className="text-base" />,
      'Messages': <HiChat className="text-base" />,
      'Browse Listings': <HiCollection className="text-base" />,
      'Listings Approval': <HiEye className="text-base" />,
      'Categories': <HiTag className="text-base" />,
      'Featured Listings': <HiStar className="text-base" />,
      'Booking Disputes': <HiExclamation className="text-base" />,
      'Transactions': <HiCurrencyDollar className="text-base" />,
      'Commissions': <HiTrendingUp className="text-base" />,
      'Refunds': <HiCash className="text-base" />,
      'Reported Reviews': <HiFlag className="text-base" />,
      'Announcements': <HiSpeakerphone className="text-base" />,
      'Push Notifications': <HiBell className="text-base" />,
      'Banners': <HiPhotograph className="text-base" />,
      'Advertisements': <HiTemplate className="text-base" />,
      'FAQs': <HiQuestionMarkCircle className="text-base" />,
      'Audit Logs': <HiDocumentText className="text-base" />,
      'Fraud Monitoring': <HiShieldCheck className="text-base" />,
      'System Logs': <HiServer className="text-base" />,
      'Revenue Reports': <HiChartBar className="text-base" />,
      'User Analytics': <HiUsers className="text-base" />,
      'Performance Reports': <HiTrendingUp className="text-base" />,
      'Roles & Permissions': <HiKey className="text-base" />,
      'Suspended Accounts': <HiBan className="text-base" />,
      'All Bookings': <HiClipboardList className="text-base" />,
      'Ratings & Reviews': <HiStar className="text-base" />,
      'Wallet': <HiCash className="text-base" />,
    };
    return icons[label] || <HiSparkles className="text-base" />;
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path.endsWith('/admin') || path.endsWith('/app') || path.endsWith('/provider')) {
      return location.pathname === path;
    }
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => child.path && location.pathname === child.path);
    }
    return false;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sidebarClass = isCollapsed ? 'sidebar-width-collapsed' : 'sidebar-width-normal';

  return (
    <aside className={`sidebar-premium ${sidebarClass} text-white`}>
      {/* Brand Section */}
      <div className={`p-lg flex items-center gap-md ${isCollapsed ? 'justify-center' : ''}`} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className="brand-logo-premium">
          <div className="brand-logo-shimmer" />
          <HiSparkles className="text-lg" style={{ position: 'relative', zIndex: 1 }} />
        </div>
        {!isCollapsed && (
          <div>
            <h2 className="text-lg fw-bold brand-text-premium">AgriGax</h2>
            <p className="text-xs user-type-badge fw-medium mt-xs">{userType}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-xs p-sm" style={{ flex: 1, overflowY: 'auto' }}>
        {menu.map((item, index) => (
          <div key={index}>
            {/* Single item without children */}
            {item.path && !item.children && (
              <NavLink
                to={item.path}
                end
                className={({ isActive: active }) =>
                  `nav-item-premium ${isCollapsed ? 'justify-center' : ''} ${active ? 'nav-item-active' : 'nav-item-inactive'}`
                }
              >
                <span className={isActive(item.path) ? 'nav-icon-active' : 'nav-icon-default'}>
                  {getIcon(item.label)}
                </span>
                {!isCollapsed && (
                  <>
                    <span className="text-xs fw-medium nav-label">{item.label}</span>
                    {isActive(item.path) && <div className="nav-active-dot" />}
                  </>
                )}
              </NavLink>
            )}

            {/* Menu item with children */}
            {item.children && (
              <div>
                <div 
                  className={`nav-item-premium nav-item-inactive pointer ${isCollapsed ? 'justify-center' : 'justify-between'} ${isParentActive(item) ? 'nav-parent-active' : ''}`}
                  onClick={() => !isCollapsed && toggleExpand(item.label)}
                  title={isCollapsed ? item.label : undefined}
                >
                  <div className={`flex items-center ${!isCollapsed ? 'gap-md' : ''}`}>
                    <span className={isParentActive(item) ? 'nav-icon-active' : 'nav-icon-default'}>
                      {getIcon(item.label)}
                    </span>
                    {!isCollapsed && <span className="text-xs fw-medium nav-label">{item.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <HiChevronDown 
                      className="text-sm"
                      style={{
                        transform: expandedItems.includes(item.label) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        opacity: isParentActive(item) ? 0.8 : 0.35
                      }}
                    />
                  )}
                </div>

                {!isCollapsed && (
                  <div className={`submenu-container ${expandedItems.includes(item.label) ? 'submenu-expanded' : ''}`}>
                    <div style={{ paddingLeft: 36 }}>
                      <div className="flex flex-col gap-xs">
                        {item.children.map((child, i) => (
                          <NavLink 
                            key={i} 
                            to={child.path || "#"} 
                            end
                            className={({ isActive: active }) =>
                              `submenu-item ${active ? 'submenu-item-active' : ''}`
                            }
                          >
                            <div className="flex items-center gap-sm">
                              <div className={`submenu-dot ${isActive(child.path) ? 'submenu-dot-active' : ''}`} />
                              <span className="text-xs">{child.label}</span>
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="user-footer-premium p-md">
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className={`avatar-premium avatar-${userType}`}>
              {getInitials(userName)}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-sm">
            <div className={`avatar-premium avatar-${userType}`}>
              {getInitials(userName)}
              <div className="avatar-online-dot" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-xs fw-medium user-name-premium">{userName}</div>
              <div className="text-xs user-role-premium">{userRole}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
