import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router'
import NotFoundPage from './pages/NotFoundPage'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Transactions from './pages/Transactions'
import Categories from './pages/Categories'
import FinancialAccounts from './pages/FinancialAccounts'
import Profile from './pages/Profile'
import Budgets from './pages/Budgets'
import { DropdownProvider } from './context/DropdownProvider'
import Login from './pages/Login'
import Register from './pages/Register'
import { NeonAuthUIProvider } from '@neondatabase/neon-js/auth/react'
import { authClient } from './lib/auth'
import { AuthProvider } from './context/AuthProvider'
import { SideBarProvider } from './context/SideBarProvider'
import { MonthProvider } from './context/MonthProvider'
import { ResetPassword } from './pages/ResetPassword'
import { ForgotPassword } from './pages/ForgotPassword'
import { AccountSetup } from './pages/AccountSetup'

function App() {

  const routes = [{
    path: '/',
    element: <Outlet />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: '/',
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: '/dashboard',
        element:
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
      },
      {
        path: '/categories',
        element:
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
      },
      {
        path: '/budgets',
        element:
          <ProtectedRoute>
            <Budgets />
          </ProtectedRoute>
      },
      {
        path: '/financial-accounts',
        element:
          <ProtectedRoute>
            <FinancialAccounts />
          </ProtectedRoute>
      },
      {
        path: '/profile',
        element:
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
      },
      {
        path: '/transactions',
        element:
          <ProtectedRoute>
            <Transactions />
          </ProtectedRoute>
      },
      {
        path: '/auth/sign-in',
        element:
          <Login />
      },
      {
        path: '/auth/register',
        element:
          <Register />
      },
      {
        path: '/reset-password',
        element:
          <ResetPassword />
      },
      {
        path: '/forgot-password',
        element:
          <ForgotPassword />
      },
      {
        path: '/account-setup',
        element:
          <ProtectedRoute>
            <AccountSetup />
          </ProtectedRoute>
      }
    ]
  }]

  const router = createBrowserRouter(routes);

  return (
    <>
      <NeonAuthUIProvider emailOTP authClient={authClient}>
        <AuthProvider>
          <MonthProvider>
            <DropdownProvider>
              <SideBarProvider>
                <RouterProvider router={router} />
              </SideBarProvider>
            </DropdownProvider>
          </MonthProvider>
        </AuthProvider>
      </NeonAuthUIProvider>
    </>
  )
}

export default App;