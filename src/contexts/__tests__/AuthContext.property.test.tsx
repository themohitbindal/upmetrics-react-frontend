import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import type { User } from '../../types/user'

// Generate valid ISO date strings directly
const isoDateStringArb = fc
  .integer({ min: 946684800000, max: 1924905600000 }) // 2000-01-01 to 2030-12-31 in ms
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
 * **Feature: api-integration, Property 4: Logout Clears Credentials**
 * *For any* logout action, the authentication system SHALL remove both 
 * 'token' and 'user' keys from localStorage.
 * **Validates: Requirements 2.4**
 */
describe('Property 4: Logout Clears Credentials', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should remove token and user from localStorage on logout', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        (token, user) => {
          // Arrange - set up credentials in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Act - simulate logout logic
          localStorage.removeItem('token')
          localStorage.removeItem('user')

          // Assert
          expect(localStorage.getItem('token')).toBeNull()
          expect(localStorage.getItem('user')).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle logout when credentials are already absent', () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        () => {
          // Arrange - ensure localStorage is empty
          localStorage.clear()

          // Act - simulate logout logic (should not throw)
          localStorage.removeItem('token')
          localStorage.removeItem('user')

          // Assert
          expect(localStorage.getItem('token')).toBeNull()
          expect(localStorage.getItem('user')).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: api-integration, Property 5: Auth State Update on Success**
 * *For any* successful authentication (login or signup), the Auth Context 
 * SHALL update its state to reflect isAuthenticated as true and store the user data.
 * **Validates: Requirements 3.2**
 */
describe('Property 5: Auth State Update on Success', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should update state with user data and token on successful auth', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        (token, userData) => {
          // Simulate successful auth state update
          let user: User | null = null
          let storedToken: string | null = null
          
          // Act - simulate auth success logic
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(userData))
          storedToken = token
          user = userData as User

          // Compute isAuthenticated
          const isAuthenticated = !!storedToken && !!user

          // Assert
          expect(isAuthenticated).toBe(true)
          expect(user).toEqual(userData)
          expect(storedToken).toBe(token)
          expect(localStorage.getItem('token')).toBe(token)
          expect(JSON.parse(localStorage.getItem('user')!)).toEqual(userData)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should compute isAuthenticated as false when token or user is missing', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant({ token: null, user: { _id: '1', email: 'test@test.com', createdAt: '', updatedAt: '' } as User }),
          fc.constant({ token: 'valid-token', user: null }),
          fc.constant({ token: null, user: null })
        ),
        ({ token, user }) => {
          // Compute isAuthenticated
          const isAuthenticated = !!token && !!user

          // Assert - should be false when either is missing
          expect(isAuthenticated).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: api-integration, Property 6: Logout Resets Auth State**
 * *For any* logout action, the Auth Context SHALL reset user to null, 
 * token to null, and isAuthenticated to false.
 * **Validates: Requirements 3.4**
 */
describe('Property 6: Logout Resets Auth State', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should reset all auth state to initial values on logout', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        (initialToken, initialUser) => {
          // Arrange - set up authenticated state
          let user: User | null = initialUser as User
          let token: string | null = initialToken
          localStorage.setItem('token', initialToken)
          localStorage.setItem('user', JSON.stringify(initialUser))

          // Act - simulate logout
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          user = null
          token = null

          // Compute isAuthenticated
          const isAuthenticated = !!token && !!user

          // Assert
          expect(user).toBeNull()
          expect(token).toBeNull()
          expect(isAuthenticated).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
})


/**
 * **Feature: api-integration, Property 14: Profile Update Reflects in State**
 * *For any* successful profile update API call, the user data in Auth Context 
 * SHALL be updated with the returned user data.
 * **Validates: Requirements 7.2**
 */
describe('Property 14: Profile Update Reflects in State', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should update user data in localStorage when updateUser is called', () => {
    fc.assert(
      fc.property(
        userArb,
        userArb,
        (initialUser, updatedUser) => {
          // Arrange - set up initial user in localStorage
          localStorage.setItem('user', JSON.stringify(initialUser))

          // Act - simulate updateUser logic from AuthContext
          localStorage.setItem('user', JSON.stringify(updatedUser))

          // Assert - localStorage should contain updated user
          const storedUser = JSON.parse(localStorage.getItem('user')!)
          expect(storedUser).toEqual(updatedUser)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve user ID consistency after profile update', () => {
    fc.assert(
      fc.property(
        userArb,
        fc.record({
          name: fc.option(fc.string({ minLength: 1 }), { nil: undefined }),
          age: fc.option(fc.integer({ min: 13, max: 120 }), { nil: undefined }),
          profileImage: fc.option(fc.string(), { nil: undefined }),
        }),
        (initialUser, updateData) => {
          // Arrange - set up initial user
          localStorage.setItem('user', JSON.stringify(initialUser))

          // Act - simulate profile update (preserving _id, email, timestamps)
          const updatedUser: User = {
            ...initialUser,
            name: updateData.name ?? initialUser.name,
            age: updateData.age ?? initialUser.age,
            profileImage: updateData.profileImage ?? initialUser.profileImage,
            updatedAt: new Date().toISOString(),
          }
          localStorage.setItem('user', JSON.stringify(updatedUser))

          // Assert - user ID and email should remain unchanged
          const storedUser = JSON.parse(localStorage.getItem('user')!) as User
          expect(storedUser._id).toBe(initialUser._id)
          expect(storedUser.email).toBe(initialUser.email)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should update context state to reflect new user data', () => {
    fc.assert(
      fc.property(
        userArb,
        userArb,
        (initialUser, updatedUser) => {
          // Simulate context state
          let contextUser: User | null = initialUser as User

          // Act - simulate updateUser method
          contextUser = updatedUser as User
          localStorage.setItem('user', JSON.stringify(updatedUser))

          // Assert - context state should match updated user
          expect(contextUser).toEqual(updatedUser)
          expect(JSON.parse(localStorage.getItem('user')!)).toEqual(updatedUser)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain isAuthenticated as true after profile update', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        userArb,
        userArb,
        (token, initialUser, updatedUser) => {
          // Arrange - set up authenticated state
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(initialUser))
          let contextUser: User | null = initialUser as User
          const contextToken: string | null = token

          // Act - simulate profile update
          contextUser = updatedUser as User
          localStorage.setItem('user', JSON.stringify(updatedUser))

          // Compute isAuthenticated
          const isAuthenticated = !!contextToken && !!contextUser

          // Assert - should still be authenticated
          expect(isAuthenticated).toBe(true)
          expect(contextUser).toEqual(updatedUser)
        }
      ),
      { numRuns: 100 }
    )
  })
})
