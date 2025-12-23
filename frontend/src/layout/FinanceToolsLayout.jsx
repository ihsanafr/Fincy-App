import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSidebar } from '../contexts/SidebarContext'
import { useTheme } from '../contexts/ThemeContext'
import { useModal } from '../contexts/ModalContext'
import Badge from '../components/ui/Badge'

function FinanceToolsLayout({ children }) {
  const { user, logout } = useAuth()
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar, isHovered, setIsHovered } = useSidebar()
  const { isDark, toggleTheme } = useTheme()
  const { showConfirm, showAlert } = useModal()
  const location = useLocation()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobileOpen && window.innerWidth < 1024) {
      toggleMobileSidebar()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showDropdown])

  const handleLogout = async () => {
    setShowDropdown(false)
    showConfirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      confirmText: 'Logout',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          await logout()
          navigate('/')
          showAlert({
            type: 'success',
            title: 'Logged Out',
            message: 'You have been successfully logged out.',
          })
        } catch (error) {
          showAlert({
            type: 'error',
            title: 'Error',
            message: 'Failed to logout. Please try again.',
          })
        }
      },
    })
  }

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/finance-tools/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      name: 'Transactions',
      path: '/finance-tools/transactions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      name: 'Budgets',
      path: '/finance-tools/budgets',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Reports',
      path: '/finance-tools/reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      name: 'Categories',
      path: '/finance-tools/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => {
          if (isDesktop && !isExpanded) {
            setIsHovered(true)
          }
        }}
        onMouseLeave={() => {
          if (isDesktop) {
            setIsHovered(false)
          }
        }}
        className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          isDesktop
            ? (isExpanded || (isHovered && !isExpanded)) ? 'w-64' : 'w-20'
            : isMobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {(isDesktop && (isExpanded || (isHovered && !isExpanded))) || (!isDesktop && isMobileOpen) ? (
              <Link 
                to="/finance-tools/dashboard" 
                className="text-xl font-bold text-purple-600"
                onClick={() => {
                  if (!isDesktop) {
                    toggleMobileSidebar()
                  }
                }}
              >
                Finance Tools
              </Link>
            ) : (
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">F</span>
              </div>
            )}
            {!isDesktop && (
              <button
                onClick={toggleMobileSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Menu */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => {
                      // Close mobile sidebar when clicking a menu item
                      if (!isDesktop) {
                        toggleMobileSidebar()
                      }
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ease-out transform ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 scale-105'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 hover:scale-105'
                    }`}
                  >
                    <span className={isActive(item.path) ? 'text-purple-600 dark:text-purple-400' : ''}>{item.icon}</span>
                    {((isDesktop && (isExpanded || (isHovered && !isExpanded))) || (!isDesktop && isMobileOpen)) && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Backdrop */}
      {isMobileOpen && !isDesktop && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isDesktop
            ? (isExpanded || (isHovered && !isExpanded)) ? 'ml-64' : 'ml-20'
            : 'ml-0'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  if (isDesktop) {
                    toggleSidebar()
                  } else {
                    toggleMobileSidebar()
                  }
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={isMobileOpen ? 'Close menu' : 'Open menu'}
              >
                <svg className="w-5 h-5 text-gray-700 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="block">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {location.pathname === '/finance-tools/dashboard' && 'Dashboard'}
                  {location.pathname === '/finance-tools/transactions' && 'Transactions'}
                  {location.pathname === '/finance-tools/budgets' && 'Budgets'}
                  {location.pathname === '/finance-tools/reports' && 'Reports'}
                  {location.pathname === '/finance-tools/categories' && 'Categories'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 transform hover:scale-110 active:scale-95"
                title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? (
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* User Avatar Dropdown */}
              {user && (
                <div className="relative" ref={dropdownRef}>
                  {/* User Avatar Button */}
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-purple-600 dark:bg-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                      {user.profile_photo ? (
                        <img
                          src={user.profile_photo}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${
                        showDropdown ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50 animate-fadeInDown">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <Link
                          to="/"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Back to Site
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default FinanceToolsLayout

