import { useState, useEffect, type JSX } from "react";
import { NavLink, useLocation } from "react-router-dom";
import type { MenuItem } from "./menu/types";
import { 
  HiHome, 
  HiChartBar, 
  HiUsers, 
  HiCog, 
  HiChevronDown,
  HiSparkles,
  HiCube,
  HiClipboardList,
  HiCurrencyDollar,
  HiHeart,
  HiBriefcase,
  HiCollection,
  HiCash,
  HiTrendingUp,
  HiCalendar,
  HiUser
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
  const [isHovered, setIsHovered] = useState(false);
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
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const getIcon = (label: string) => {
    const icons: Record<string, JSX.Element> = {
      'Dashboard': <HiHome className="text-lg" />,
      'Analytics': <HiChartBar className="text-lg" />,
      'Users': <HiUsers className="text-lg" />,
      'Settings': <HiCog className="text-lg" />,
      'Profile': <HiUser className="text-lg" />,
      'Services': <HiCollection className="text-lg" />,
      'Bookings': <HiClipboardList className="text-lg" />,
      'Payments': <HiCurrencyDollar className="text-lg" />,
      'Favorites': <HiHeart className="text-lg" />,
      'Providers': <HiBriefcase className="text-lg" />,
      'My Services': <HiCube className="text-lg" />,
      'Earnings': <HiCash className="text-lg" />,
      'Reports': <HiTrendingUp className="text-lg" />,
      'Account': <HiUser className="text-lg" />,
      'Overview': <HiChartBar className="text-lg" />,
      'Availability': <HiCalendar className="text-lg" />,
    };
    return icons[label] || <HiSparkles className="text-lg" />;
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const sidebarWidth = isCollapsed ? 'sidebar-width-collapsed' : (isHovered ? 'sidebar-width-expanded' : 'sidebar-width-normal');

  return (
    <aside className={`sidebar-premium ${sidebarWidth} text-white`}>
      {/* Brand Section */}
      <div className="p-xl" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''} gap-md`}>
          <div className="brand-logo-premium">
            <div className="brand-logo-shimmer" />
            <HiSparkles className="text-xl" style={{ position: 'relative', zIndex: 1 }} />
          </div>
          
          {!isCollapsed && (
            <div>
              <h2 className="text-xl fw-bold brand-text-premium">
                AgriGax
              </h2>
              <p className="text-xs user-type-badge fw-medium mt-xs">
                {userType}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-xs p-md" style={{ flex: 1, overflowY: 'auto' }}>
        {menu.map((item, index) => (
          <div key={index}>
            {/* Single item without children */}
            {item.path && !item.children && (
              <NavLink
                to={item.path}
                className={`nav-item-premium ${isActive(item.path) ? 'nav-item-active' : 'nav-item-hover'} ${isCollapsed ? 'nav-collapsed-center' : ''}`}
              >
                <span style={{ opacity: isActive(item.path) ? 1 : 0.5 }}>
                  {getIcon(item.label)}
                </span>
                {!isCollapsed && (
                  <>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {isActive(item.path) && <div className="nav-active-dot" />}
                  </>
                )}
              </NavLink>
            )}

            {/* Menu item with children */}
            {item.children && (
              <div>
                <div 
                  className={`nav-item-premium nav-item-hover pointer ${isCollapsed ? 'nav-collapsed-center' : 'justify-between'}`}
                  onClick={() => toggleExpand(item.label)}
                >
                  <div className="flex items-center gap-md">
                    <span style={{ opacity: 0.5 }}>
                      {getIcon(item.label)}
                    </span>
                    {!isCollapsed && (
                      <span className="text-sm fw-semibold">{item.label}</span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <HiChevronDown 
                      className="text-sm"
                      style={{
                        transform: expandedItems.includes(item.label) ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        opacity: 0.5
                      }}
                    />
                  )}
                </div>

                <div className={`submenu-container ${expandedItems.includes(item.label) ? 'submenu-expanded' : ''}`}>
                  {!isCollapsed && (
                    <div style={{ paddingLeft: 44 }}>
                      <div className="flex flex-col gap-xs">
                        {item.children.map((child, i) => (
                          <NavLink 
                            key={i} 
                            to={child.path || "#"} 
                            className={`text-sm submenu-item ${isActive(child.path) ? 'submenu-item-active' : ''}`}
                          >
                            <div className="flex items-center gap-md">
                              <div className={`submenu-dot ${isActive(child.path) ? 'submenu-dot-active' : ''}`} />
                              {child.label}
                            </div>
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="user-footer-premium p-lg">
        {!isCollapsed ? (
          <div className="flex items-center gap-sm">
            <div className={`avatar-premium avatar-${userType}`}>
              {getInitials(userName)}
              <div className="avatar-online-dot" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="text-sm fw-medium user-name-premium">
                {userName}
              </div>
              <div className="text-xs user-role-premium">
                {userRole}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className={`avatar-premium avatar-${userType}`}>
              {getInitials(userName)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}