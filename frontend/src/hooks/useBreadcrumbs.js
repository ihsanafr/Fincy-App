/**
 * @fincy-doc
 * Ringkasan: File ini berisi kode aplikasi.
 * Manfaat: Membantu memisahkan tanggung jawab dan memudahkan perawatan.
 */
import { useLocation } from 'react-router-dom'

export function useBreadcrumbs() {
  const location = useLocation()
  const pathname = location.pathname

  const breadcrumbs = []

  // Home
  if (pathname !== '/') {
    breadcrumbs.push({ path: '/', label: 'Home' })
  }

  // Parse path segments
  const segments = pathname.split('/').filter(Boolean)

  segments.forEach((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    
    // Format label (capitalize, replace dashes with spaces)
    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    // Special cases
    if (segment === 'admin') {
      label = 'Admin Dashboard'
    } else if (segment === 'finance-tools') {
      label = 'Finance Tools'
    } else if (segment === 'learning-modules') {
      label = 'Learning Modules'
    } else if (segment === 'modules') {
      label = 'Module'
    } else if (segment === 'quiz') {
      label = 'Quiz'
    } else if (segment === 'certificate') {
      label = 'Certificate'
    } else if (segment === 'profile') {
      label = 'Profile'
    } else if (segment === 'dashboard') {
      label = 'Dashboard'
    } else if (segment === 'transactions') {
      label = 'Transactions'
    } else if (segment === 'budgets') {
      label = 'Budgets'
    } else if (segment === 'reports') {
      label = 'Reports'
    } else if (segment === 'categories') {
      label = 'Categories'
    } else if (segment === 'payments') {
      label = 'Payments'
    } else if (segment === 'users') {
      label = 'Users'
    } else if (segment === 'contents') {
      label = 'Contents'
    } else if (segment === 'guide') {
      label = 'User Guide'
    }

    breadcrumbs.push({ path, label })
  })

  return breadcrumbs
}

