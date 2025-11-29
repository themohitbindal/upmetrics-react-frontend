import Cookies from 'js-cookie'

/**
 * Cookie utility functions for token management
 */

const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const cookieUtils = {
  /**
   * Set authentication token in cookie
   */
  setToken: (token: string): void => {
    // Set cookie with 7 days expiration
    // secure: false for localhost, set to true in production with HTTPS
    Cookies.set(TOKEN_KEY, token, { 
      expires: 7, 
      secure: window.location.protocol === 'https:',
      sameSite: 'strict' 
    })
  },

  /**
   * Get authentication token from cookie
   */
  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_KEY)
  },

  /**
   * Remove authentication token from cookie
   */
  removeToken: (): void => {
    Cookies.remove(TOKEN_KEY)
  },

  /**
   * Set user data in cookie
   */
  setUser: (user: any): void => {
    // secure: false for localhost, set to true in production with HTTPS
    Cookies.set(USER_KEY, JSON.stringify(user), { 
      expires: 7, 
      secure: window.location.protocol === 'https:',
      sameSite: 'strict' 
    })
  },

  /**
   * Get user data from cookie
   */
  getUser: (): any | null => {
    const user = Cookies.get(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  /**
   * Remove user data from cookie
   */
  removeUser: (): void => {
    Cookies.remove(USER_KEY)
  },

  /**
   * Clear all auth-related cookies
   */
  clearAuth: (): void => {
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(USER_KEY)
  },
}
