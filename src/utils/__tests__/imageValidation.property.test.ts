import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  validateImageFile,
  MAX_IMAGE_SIZE,
  ALLOWED_IMAGE_TYPES,
} from '../imageValidation'

/**
 * Helper to create a mock File object for testing
 * Uses a minimal approach - creates a File with specified size via the size property
 */
function createMockFile(type: string, size: number, name = 'test-file'): File {
  // Create a minimal blob and override size for performance
  const blob = new Blob(['x'], { type })
  const file = new File([blob], name, { type })
  // Override size property for testing without creating large content
  Object.defineProperty(file, 'size', { value: size, writable: false })
  return file
}

/**
 * **Feature: api-integration, Property 15: Image Upload Validation**
 * *For any* file selected for profile image upload, the system SHALL reject 
 * files that are not images or exceed 5MB in size.
 * **Validates: Requirements 7.3**
 */
describe('Property 15: Image Upload Validation', () => {
  describe('File type validation', () => {
    it('should accept all valid image types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALLOWED_IMAGE_TYPES),
          fc.integer({ min: 1, max: MAX_IMAGE_SIZE }),
          (mimeType, size) => {
            // Arrange
            const file = createMockFile(mimeType, size)

            // Act
            const result = validateImageFile(file)

            // Assert
            expect(result.valid).toBe(true)
            expect(result.error).toBeUndefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject non-image file types', () => {
      const invalidTypes = [
        'application/pdf',
        'application/json',
        'text/plain',
        'text/html',
        'application/javascript',
        'application/xml',
        'video/mp4',
        'audio/mpeg',
        'application/zip',
        'application/octet-stream',
      ]

      fc.assert(
        fc.property(
          fc.constantFrom(...invalidTypes),
          fc.integer({ min: 1, max: MAX_IMAGE_SIZE }),
          (mimeType, size) => {
            // Arrange
            const file = createMockFile(mimeType, size)

            // Act
            const result = validateImageFile(file)

            // Assert
            expect(result.valid).toBe(false)
            expect(result.error).toBeDefined()
            expect(result.error).toContain('valid image file')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('File size validation', () => {
    it('should accept files at or below 5MB', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALLOWED_IMAGE_TYPES),
          fc.integer({ min: 1, max: MAX_IMAGE_SIZE }),
          (mimeType, size) => {
            // Arrange
            const file = createMockFile(mimeType, size)

            // Act
            const result = validateImageFile(file)

            // Assert
            expect(result.valid).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should reject files exceeding 5MB', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...ALLOWED_IMAGE_TYPES),
          fc.integer({ min: MAX_IMAGE_SIZE + 1, max: MAX_IMAGE_SIZE + 10000000 }),
          (mimeType, size) => {
            // Arrange
            const file = createMockFile(mimeType, size)

            // Act
            const result = validateImageFile(file)

            // Assert
            expect(result.valid).toBe(false)
            expect(result.error).toBeDefined()
            expect(result.error).toContain('5MB')
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Combined validation', () => {
    it('should reject files that are both invalid type AND too large', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('application/pdf', 'text/plain', 'video/mp4'),
          fc.integer({ min: MAX_IMAGE_SIZE + 1, max: MAX_IMAGE_SIZE + 10000000 }),
          (mimeType, size) => {
            // Arrange
            const file = createMockFile(mimeType, size)

            // Act
            const result = validateImageFile(file)

            // Assert - should fail on type check first
            expect(result.valid).toBe(false)
            expect(result.error).toBeDefined()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should validate boundary case: exactly 5MB file', () => {
      // Test exact boundary
      ALLOWED_IMAGE_TYPES.forEach((mimeType) => {
        const file = createMockFile(mimeType, MAX_IMAGE_SIZE)
        const result = validateImageFile(file)
        expect(result.valid).toBe(true)
      })
    })

    it('should validate boundary case: 1 byte over 5MB', () => {
      // Test just over boundary
      ALLOWED_IMAGE_TYPES.forEach((mimeType) => {
        const file = createMockFile(mimeType, MAX_IMAGE_SIZE + 1)
        const result = validateImageFile(file)
        expect(result.valid).toBe(false)
        expect(result.error).toContain('5MB')
      })
    })
  })
})
