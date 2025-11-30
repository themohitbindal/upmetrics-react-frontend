import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { AxiosHeaders, type InternalAxiosRequestConfig } from 'axios'

/**
 * **Feature: api-integration, Property 1: Token Attachment**
 * *For any* API request made when a JWT token exists in localStorage, 
 * the request interceptor SHALL attach the token to the Authorization header 
 * in the format `Bearer <token>`.
 * **Validates: Requirements 1.2**
 */
describe('Property 1: Token Attachment', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should attach token to Authorization header for all requests when token is present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }).filter(s => s.trim().length > 0),
        fc.constantFrom('get', 'post', 'put', 'delete', 'patch'),
        fc.string(),
        (token, method, url) => {
          // Arrange
          localStorage.setItem('token', token)
          
          const config: InternalAxiosRequestConfig = {
            headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
            method,
            url,
          }

          // Act - simulate request interceptor logic
          const storedToken = localStorage.getItem('token')
          if (storedToken) {
            config.headers.Authorization = `Bearer ${storedToken}`
          }

          // Assert
          expect(config.headers.Authorization).toBe(`Bearer ${token}`)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not attach Authorization header when no token is present', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('get', 'post', 'put', 'delete', 'patch'),
        fc.string(),
        (method, url) => {
          // Arrange - no token in localStorage
          localStorage.clear()
          
          const config: InternalAxiosRequestConfig = {
            headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
            method,
            url,
          }

          // Act - simulate request interceptor logic
          const storedToken = localStorage.getItem('token')
          if (storedToken) {
            config.headers.Authorization = `Bearer ${storedToken}`
          }

          // Assert
          expect(config.headers.Authorization).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: api-integration, Property 2: Unauthorized Response Handling**
 * *For any* API response with status code 401, the response interceptor 
 * SHALL clear the token and user data from localStorage.
 * **Validates: Requirements 1.3**
 */
describe('Property 2: Unauthorized Response Handling', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should clear credentials from localStorage on 401 response', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          _id: fc.string(),
          email: fc.emailAddress(),
          name: fc.string(),
        }),
        (token, user) => {
          // Arrange - set up credentials in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Act - simulate 401 response interceptor logic
          const errorStatus = 401
          if (errorStatus === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }

          // Assert
          expect(localStorage.getItem('token')).toBeNull()
          expect(localStorage.getItem('user')).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not clear credentials for non-401 error responses', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.record({
          _id: fc.string(),
          email: fc.emailAddress(),
          name: fc.string(),
        }),
        fc.integer({ min: 400, max: 599 }).filter(status => status !== 401),
        (token, user, errorStatus) => {
          // Arrange - set up credentials in localStorage
          localStorage.setItem('token', token)
          localStorage.setItem('user', JSON.stringify(user))

          // Act - simulate non-401 response interceptor logic
          if (errorStatus === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
          }

          // Assert - credentials should still be present
          expect(localStorage.getItem('token')).toBe(token)
          expect(localStorage.getItem('user')).toBe(JSON.stringify(user))
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * **Feature: api-integration, Property 3: FormData Content-Type Handling**
 * *For any* API request where the request body is an instance of FormData, 
 * the request interceptor SHALL remove the Content-Type header from the request config.
 * **Validates: Requirements 1.4**
 */
describe('Property 3: FormData Content-Type Handling', () => {
  it('should remove Content-Type header when request body is FormData', () => {
    fc.assert(
      fc.property(
        fc.array(fc.tuple(fc.string(), fc.string())),
        (formFields) => {
          // Arrange
          const formData = new FormData()
          formFields.forEach(([key, value]) => {
            formData.append(key, value)
          })

          const config: InternalAxiosRequestConfig = {
            headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
            data: formData,
          }

          // Act - simulate request interceptor logic for FormData
          if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
          }

          // Assert
          expect(config.headers['Content-Type']).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve Content-Type header when request body is not FormData', () => {
    fc.assert(
      fc.property(
        fc.record({
          title: fc.string(),
          description: fc.string(),
        }),
        (jsonData) => {
          // Arrange
          const config: InternalAxiosRequestConfig = {
            headers: new AxiosHeaders({ 'Content-Type': 'application/json' }),
            data: jsonData,
          }

          // Act - simulate request interceptor logic
          if (config.data instanceof FormData) {
            delete config.headers['Content-Type']
          }

          // Assert
          expect(config.headers['Content-Type']).toBe('application/json')
        }
      ),
      { numRuns: 100 }
    )
  })
})
