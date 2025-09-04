import React, { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Home,
  Package,
  Factory,
  Users,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useAuth, usePermissions } from '../../hooks/useAuth';
import styles from './Layout.module.css';
import globals from '../../styles/globals.module.css';

interface LayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: () => boolean;
}

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const permissions = usePermissions();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: Home,
    },
    {
      label: 'Inventory',
      path: '/inventory',
      icon: Package,
      permission: permissions.canViewInventory,
    },
    {
      label: 'Production',
      path: '/production',
      icon: Factory,
      permission: permissions.canViewProduction,
    },
    {
      label: 'Users',
      path: '/users',
      icon: Users,
      permission: permissions.canManageUsers,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      permission: permissions.canManageUsers,
    },
  ];

  const filteredNavItems = navItems.filter(item => !item.permission || item.permission());

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const closeSidebar = () => setSidebarOpen(false);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className={styles.layout}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap3}`}>
            {/* Mobile menu button */}
            <button
              className={styles.menuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <Link to="/dashboard" className={styles.logo}>
              <div className={styles.logoIcon}>SS</div>
              <span className={globals.hiddenSm}>Sweet Swirls</span>
            </Link>
          </div>

          <div className={styles.headerActions}>
            {/* Location selector - desktop only */}
            <div className={styles.locationSelector}>
              <MapPin size={16} />
              <span>Main Shop</span>
            </div>

            {/* User menu */}
            <div className={styles.userMenu}>
              <button
                className={styles.userButton}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="User menu"
              >
                <div className={styles.userAvatar}>
                  {user.firstName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{user.firstName} {user.lastName}</div>
                  <div className={styles.userRole}>
                    {user.role.replace('_', ' ').toLowerCase()}
                  </div>
                </div>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className={styles.userDropdown}>
                  <button className={styles.dropdownItem} onClick={() => setUserMenuOpen(false)}>
                    <Settings size={16} />
                    Profile Settings
                  </button>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {/* Sidebar - Desktop */}
        <aside className={styles.sidebar}>
          <Navigation items={filteredNavItems} currentPath={location.pathname} onItemClick={() => {}} />
        </aside>

        {/* Sidebar - Mobile */}
        <aside className={`${styles.sidebarMobile} ${sidebarOpen ? styles.open : ''}`}>
          <Navigation items={filteredNavItems} currentPath={location.pathname} onItemClick={closeSidebar} />
        </aside>

        {/* Mobile overlay */}
        <div
          className={`${styles.overlay} ${sidebarOpen ? styles.show : ''}`}
          onClick={closeSidebar}
        />

        {/* Main content */}
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

interface NavigationProps {
  items: NavItem[];
  currentPath: string;
  onItemClick: () => void;
}

function Navigation({ items, currentPath, onItemClick }: NavigationProps) {
  return (
    <nav className={styles.nav}>
      <div className={styles.navSection}>
        <div className={styles.navSectionTitle}>Main</div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={onItemClick}
            >
              <Icon className={styles.navIcon} size={20} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}