/**
 * Maximum allowed file size for image uploads (5MB)
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB in bytes

/**
 * Allowed image MIME types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export interface ImageValidationResult {
  valid: boolean
  error?: string
}

/**
 * Validates an image file for upload
 * @param file - The file to validate
 * @returns Validation result with valid flag and optional error message
 * 
 * **Feature: api-integration, Property 15: Image Upload Validation**
 * **Validates: Requirements 7.3**
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check if file is an image
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, WebP, or SVG)',
    }
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: 'Image must be less than 5MB',
    }
  }

  return { valid: true }
}
