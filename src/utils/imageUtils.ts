import { API_BASE_URL } from '../lib/api/constants'

/**
 * Get full image URL from backend path
 * @param imagePath - Image path from backend (e.g., "/uploads/filename.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string | null => {
  if (!imagePath) {
    return null
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Otherwise, prepend the backend URL
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${API_BASE_URL}${cleanPath}`
}

/**
 * Validate image file
 * @param file - File to validate
 * @returns Error message if invalid, null if valid
 */
export const validateImageFile = (file: File): string | null => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return 'Please select a valid image file (JPEG, PNG, GIF, or WebP)'
  }
  
  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024 // 5MB in bytes
  if (file.size > maxSize) {
    return 'Image size must be less than 5MB'
  }
  
  return null
}

