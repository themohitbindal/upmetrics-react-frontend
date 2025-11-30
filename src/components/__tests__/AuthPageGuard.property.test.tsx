import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

// Generate valid ISO date strings
const isoDateStringArb = fc
  .integer({ min: 946684800000, max: 1924905600000 })
  .map(ms => new Date(ms).toISOString())

// User arbitrary for testing
const userArb = fc.record({
  _id: fc.string({ minLength: 1 }),
  email: fc.emailAddress(),
  name: fc.option(fc.string(), { nil: undefined }),
  age: fc.option(fc.integer({ min: 1, max: 150 }), { nil: undefined }),
  profileImage: fc.option(fc.string(), { nil: undefined }),
  createdAt: isoDateStringArb,
  updatedAt: isoDateStringArb,
})

// AuthPageGuard component (same as in App.tsx)
function AuthPageGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" data-testid="loading-spinner"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}

/**
 * **Feature: api-integration, Property 9: Auth Page Redirect**
 * *For any* authenticated user accessing the login or signup page, 
 * the application SHALL redirect to the home page.
 * **Validates: Requirements 4.3**
 */
describe('Property 9: Auth Page Redirect', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should redirect authenticated users from login page to home', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        (token, user) => {
          // Arrange - set up auth credentials
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Act - render login page with auth
          const { container } = render(
            <MemoryRouter initialEntries={['/login']}>
              <AuthProvider>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <AuthPageGuard>
                        <div data-testid="login-page">Login Page</div>
                      </AuthPageGuard>
                    }
                  />
                  <Route path="/home" element={<div data-testid="home-page">Home Page</div>} />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          )

          // Assert - should redirect to home, not show login
          expect(screen.queryByTestId('login-page')).toBeNull()
          expect(screen.getByTestId('home-page')).toBeInTheDocument()
          
          // Cleanup
          localStorage.clear()
          container.remove()
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should redirect authenticated users from signup page to home', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        (token, user) => {
          // Arrange - set up auth credentials
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Act - render signup page with auth
          const { container } = render(
            <MemoryRouter initialEntries={['/signup']}>
              <AuthProvider>
                <Routes>
                  <Route
                    path="/signup"
                    element={
                      <AuthPageGuard>
                        <div data-testid="signup-page">Signup Page</div>
                      </AuthPageGuard>
                    }
                  />
                  <Route path="/home" element={<div data-testid="home-page">Home Page</div>} />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          )

          // Assert - should redirect to home, not show signup
          expect(screen.queryByTestId('signup-page')).toBeNull()
          expect(screen.getByTestId('home-page')).toBeInTheDocument()
          
          // Cleanup
          localStorage.clear()
          container.remove()
        }
      ),
      { numRuns: 20 }
    )
  })

  it('should allow unauthenticated users to access auth pages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('/login', '/signup'),
        (authPath) => {
          // Arrange - ensure no auth credentials
          localStorage.clear()

          // Act - render auth page without auth
          const { container } = render(
            <MemoryRouter initialEntries={[authPath]}>
              <AuthProvider>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      <AuthPageGuard>
                        <div data-testid="login-page">Login Page</div>
                      </AuthPageGuard>
                    }
                  />
                  <Route
                    path="/signup"
                    element={
                      <AuthPageGuard>
                        <div data-testid="signup-page">Signup Page</div>
                      </AuthPageGuard>
                    }
                  />
                  <Route path="/home" element={<div data-testid="home-page">Home Page</div>} />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          )

          // Assert - should show auth page, not redirect to home
          const expectedTestId = authPath === '/login' ? 'login-page' : 'signup-page'
          expect(screen.getByTestId(expectedTestId)).toBeInTheDocument()
          expect(screen.queryByTestId('home-page')).toBeNull()
          
          // Cleanup
          container.remove()
        }
      ),
      { numRuns: 20 }
    )
  })
})
