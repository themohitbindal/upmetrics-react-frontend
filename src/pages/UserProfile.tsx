import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import { useAuth } from '../contexts/AuthContext'
import { usersApi } from '../api/users'
import { validateImageFile } from '../utils/imageValidation'
import type { User } from '../types/user'

function UserProfile() {
  const { user: authUser, updateUser } = useAuth()
  
  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined)
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Fetch user profile on mount
  useEffect(() => {
    async function fetchUserProfile() {
      if (!authUser?._id) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const response = await usersApi.getById(authUser._id)
        const userData: User = response.data
        
        // Populate form fields
        setName(userData.name || '')
        setEmail(userData.email || '')
        setAge(userData.age?.toString() || '')
        setProfileImage(userData.profileImage)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [authUser?._id])

  // Handle image file selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate image
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid image file')
      return
    }

    setSelectedImage(file)
    setError(null)

    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!authUser?._id) {
      setError('User not authenticated')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      setSuccessMessage(null)

      const updateData = {
        name: name || undefined,
        age: age ? parseInt(age, 10) : undefined,
      }

      const response = await usersApi.update(authUser._id, updateData, selectedImage || undefined)
      
      // Update Auth Context with new user data
      updateUser(response.data)
      
      // Update local state with response
      setProfileImage(response.data.profileImage)
      setSelectedImage(null)
      setImagePreview(null)
      
      setSuccessMessage('Profile updated successfully!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const displayImage = imagePreview || profileImage

  const profileIcon = displayImage ? (
    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full overflow-hidden">
      <img 
        src={displayImage} 
        alt="Profile" 
        className="h-full w-full object-cover"
      />
    </div>
  ) : (
    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-indigo-100">
      <svg className="h-12 w-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        />
      </svg>
    </div>
  )

  if (isLoading) {
    return (
      <AuthLayout gradient="blue">
        <FormCard>
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </FormCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout gradient="blue">
      <FormCard>
        <PageHeader
          title="User Profile"
          subtitle="Manage your account settings"
          icon={profileIcon}
        />

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
              onChange={handleImageChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {selectedImage ? selectedImage.name : 'Choose Image'}
            </button>
            <p className="mt-1 text-xs text-gray-500">
              JPEG, PNG, GIF, WebP, or SVG. Max 5MB.
            </p>
          </div>

          <Input
            id="name"
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            placeholder="Enter your email"
            disabled
          />

          <Input
            id="age"
            label="Age"
            type="number"
            min="13"
            max="120"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
          />

          <Button 
            type="submit" 
            fullWidth 
            color="indigo"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Profile'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <LinkText to="/home" color="indigo">
            ← Back to Home
          </LinkText>
        </div>
      </FormCard>
    </AuthLayout>
  )
}

export default UserProfile

