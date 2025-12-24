import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SidebarProvider } from './contexts/SidebarContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ModalProvider } from './contexts/ModalContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { ToastProvider } from './contexts/ToastContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import GlobalSearch from './components/ui/GlobalSearch'
import AdminLayout from './layout/AdminLayout'
import HomePage from './pages/HomePage'
import LearningModulesPage from './pages/LearningModulesPage'
import ModuleDetailPage from './pages/ModuleDetailPage'
import FinanceToolsPage from './pages/FinanceToolsPage'
import FinanceToolsDashboard from './pages/FinanceToolsDashboard'
import FinanceToolsTransactions from './pages/FinanceToolsTransactions'
import FinanceToolsBudgets from './pages/FinanceToolsBudgets'
import FinanceToolsReports from './pages/FinanceToolsReports'
import FinanceToolsCategories from './pages/FinanceToolsCategories'
import FinanceToolsLayout from './layout/FinanceToolsLayout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminModules from './pages/admin/AdminModules'
import AdminModuleContents from './pages/admin/AdminModuleContents'
import AdminQuiz from './pages/admin/AdminQuiz'
import AdminPayments from './pages/admin/AdminPayments'
import AdminUsers from './pages/admin/AdminUsers'
import PaymentPage from './pages/PaymentPage'
import QuizPage from './pages/QuizPage'
import QuizHistoryPage from './pages/QuizHistoryPage'
import CertificatePage from './pages/CertificatePage'
import PublicCertificatePage from './pages/PublicCertificatePage'
import BookmarksPage from './pages/BookmarksPage'
import ProfilePage from './pages/ProfilePage'
import PublicProfilePage from './pages/PublicProfilePage'
import UserGuidePage from './pages/UserGuidePage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function AppRoutes() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')
  const isFinanceToolsDashboardRoute = location.pathname.startsWith('/finance-tools/') && location.pathname !== '/finance-tools'
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register'
  const isProtectedPage = location.pathname.startsWith('/payment') || 
                          location.pathname.includes('/quiz') || 
                          (location.pathname.includes('/certificate') && !location.pathname.includes('/certificate/public'))
  const showNavbarAndFooter = !isAdminRoute && !isFinanceToolsDashboardRoute && !isAuthRoute && !isProtectedPage

  return (
    <>
      <ScrollToTop />
      <GlobalSearch />
      {showNavbarAndFooter && <Navbar />}
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/learning-modules" element={<LearningModulesPage />} />
      <Route path="/learning-modules/:id" element={<ModuleDetailPage />} />
      <Route path="/finance-tools" element={<FinanceToolsPage />} />
      <Route
        path="/finance-tools/dashboard"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <FinanceToolsLayout>
                <FinanceToolsDashboard />
              </FinanceToolsLayout>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-tools/transactions"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <FinanceToolsLayout>
                <FinanceToolsTransactions />
              </FinanceToolsLayout>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-tools/budgets"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <FinanceToolsLayout>
                <FinanceToolsBudgets />
              </FinanceToolsLayout>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-tools/reports"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <FinanceToolsLayout>
                <FinanceToolsReports />
              </FinanceToolsLayout>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-tools/categories"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <FinanceToolsLayout>
                <FinanceToolsCategories />
              </FinanceToolsLayout>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route
        path="/payment"
        element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/modules/:id/quiz"
        element={
          <ProtectedRoute>
            <QuizPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/quiz/history"
        element={
          <ProtectedRoute>
            <QuizHistoryPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/modules/:id/certificate"
        element={
          <ProtectedRoute>
            <CertificatePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/certificate/public/:token"
        element={<PublicCertificatePage />}
      />
      
      <Route
        path="/bookmarks"
        element={
          <ProtectedRoute>
            <BookmarksPage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile/:slug"
        element={<PublicProfilePage />}
      />
      
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/modules"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <AdminModules />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/modules/:id/contents"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <AdminModuleContents />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/modules/:id/quiz"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <AdminQuiz />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <AdminPayments />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/guide"
        element={
          <AdminRoute>
            <SidebarProvider>
              <AdminLayout>
                <UserGuidePage />
              </AdminLayout>
            </SidebarProvider>
          </AdminRoute>
        }
      />
      <Route
        path="/finance-tools/guide"
        element={
          <ProtectedRoute>
            <SidebarProvider>
              <FinanceToolsLayout>
                <UserGuidePage />
              </FinanceToolsLayout>
            </SidebarProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {showNavbarAndFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <ModalProvider>
              <ToastProvider>
                <AppRoutes />
              </ToastProvider>
            </ModalProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App

