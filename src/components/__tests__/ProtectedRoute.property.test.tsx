import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { AuthProvider } from '../../contexts/AuthContext'

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

/**
 * **Feature: api-integration, Property 7: Unauthenticated Route Protection**
 * *For any* attempt to render a protected route when isAuthenticated is false, 
 * the ProtectedRoute component SHALL redirect to the login page.
 * **Validates: Requirements 4.1**
 */
describe('Property 7: Unauthenticated Route Protection', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should redirect to login when not authenticated', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        (childContent) => {
          // Cleanup first to ensure clean state
          cleanup()
          localStorage.clear()

          // Act - render protected route without auth
          render(
            <MemoryRouter initialEntries={['/protected']}>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
                  <Route
                    path="/protected"
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{childContent}</div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          )

          // Assert - should redirect to login, not show protected content
          expect(screen.queryByTestId('protected-content')).toBeNull()
          expect(screen.getByTestId('login-page')).toBeInTheDocument()
        }
      ),
      { numRuns: 20 } // Reduced runs for React component tests
    )
  })
})

/**
 * **Feature: api-integration, Property 8: Authenticated Route Access**
 * *For any* attempt to render a protected route when isAuthenticated is true, 
 * the ProtectedRoute component SHALL render its children.
 * **Validates: Requirements 4.2**
 */
describe('Property 8: Authenticated Route Access', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('should render children when authenticated', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        (token, childContent, user) => {
          // Cleanup first to ensure clean state
          cleanup()
          localStorage.clear()
          
          // Arrange - set up auth credentials
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Act - render protected route with auth
          render(
            <MemoryRouter initialEntries={['/protected']}>
              <AuthProvider>
                <Routes>
                  <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
                  <Route
                    path="/protected"
                    element={
                      <ProtectedRoute>
                        <div data-testid="protected-content">{childContent}</div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </AuthProvider>
            </MemoryRouter>
          )

          // Assert - should show protected content, not login
          const protectedContent = screen.getByTestId('protected-content')
          expect(protectedContent).toBeInTheDocument()
          // Verify the text content is present (using textContent for exact match)
          expect(protectedContent.textContent).toBe(childContent)
          expect(screen.queryByTestId('login-page')).toBeNull()
        }
      ),
      { numRuns: 20 } // Reduced runs for React component tests
    )
  })
})
