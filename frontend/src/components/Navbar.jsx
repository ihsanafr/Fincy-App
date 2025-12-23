import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useModal } from '../contexts/ModalContext'
import Badge from './ui/Badge'

function Navbar() {
  const { user, logout, isLoggingOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showConfirm, showAlert } = useModal()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

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
    if (isLoggingOut) return
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
          // Redirect immediately to homepage
          navigate('/')
          // Show success alert (will be visible briefly before redirect)
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

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-all duration-200 transform hover:scale-105"
            >
              Fincy
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                to="/learning-modules"
                className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-all duration-200 relative group"
              >
                Learning Modules
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all duration-200 group-hover:w-full"></span>
              </Link>
              <Link
                to="/finance-tools"
                className="text-gray-700 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-all duration-200 relative group"
              >
                Finance Tools
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 dark:bg-brand-400 transition-all duration-200 group-hover:w-full"></span>
              </Link>
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

            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                >
                  <div className="w-9 h-9 bg-brand-600 dark:bg-brand-500 rounded-full flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={user.name}
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
                      {user.role === 'super_admin' && (
                        <Badge color="error" variant="light" size="sm" className="mt-2">
                          Admin
                        </Badge>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setShowDropdown(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      {user.role === 'super_admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                          isLoggingOut
                            ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed'
                            : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {isLoggingOut ? 'Logging out...' : 'Logout'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
