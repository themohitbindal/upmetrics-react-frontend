import { useState, useEffect, useRef } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../lib/api/services/userService'
import { getImageUrl, validateImageFile } from '../utils/imageUtils'

function UserProfile() {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const hasLoadedRef = useRef(false) // Track if we've loaded the profile initially

  useEffect(() => {
    // Only load profile once on initial mount when user is available
    // Don't reload if we've already loaded or if we're currently saving
    if (user?._id && !hasLoadedRef.current && !saving) {
      loadProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]) // Only depend on user._id, not the whole user object

  const loadProfile = async () => {
    if (!user?._id || saving || hasLoadedRef.current) return // Don't load if already loaded or currently saving

    try {
      setLoading(true)
      setError(null) // Clear previous errors when loading
      const response = await userService.getProfile(user._id)
      if (response.success) {
        setFormData({
          name: response.data.name || '',
          age: response.data.age?.toString() || '',
        })
        // Set current image URL for display
        if (response.data.profileImage) {
          const fullImageUrl = getImageUrl(response.data.profileImage)
          setCurrentImageUrl(fullImageUrl)
          setImagePreview(fullImageUrl)
          setImageError(false) // Reset error state
        }
        hasLoadedRef.current = true // Mark as loaded
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setSuccess(false)
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      const validationError = validateImageFile(file)
      if (validationError) {
        setError(validationError)
        return
      }

      setImageFile(file)
      setError(null)
      setSuccess(false)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?._id || saving) return

    setError(null)
    setSaving(true)
    setSuccess(false)

    try {
      const updateData: any = {}
      if (formData.name) updateData.name = formData.name
      if (formData.age) updateData.age = parseInt(formData.age)
      // Add image file if selected
      if (imageFile) {
        updateData.profileImage = imageFile
      }

      const response = await userService.updateProfile(user._id, updateData)
      if (response.success) {
        // Update auth context user data without reloading
        updateUser({
          name: response.data.name,
          age: response.data.age,
          profileImage: response.data.profileImage,
        })

        // Update image preview with new image URL from server
        if (response.data.profileImage) {
          const fullImageUrl = getImageUrl(response.data.profileImage)
          setCurrentImageUrl(fullImageUrl)
          setImagePreview(fullImageUrl)
          setImageError(false) // Reset error state
        }

        // Clear the file input (reset to allow selecting the same file again)
        setImageFile(null)

        setSuccess(true)
        // Keep success message visible - no reload
      } else {
        throw new Error(response.message || 'Failed to update profile')
      }
    } catch (err: any) {
      // Keep form data and show error - don't clear inputs
      // Form data persists automatically since we're not resetting it
      setError(err.message || 'Failed to update profile. Please check your input and try again.')
    } finally {
      setSaving(false) // Always set saving to false in finally
    }
  }

  // Profile icon - show image if available, otherwise show default icon
  const profileIcon = imagePreview && !imageError ? (
    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full overflow-hidden border-4 border-indigo-100">
      <img
        src={imagePreview}
        alt="Profile"
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
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

  if (loading) {
    return (
      <AuthLayout gradient="blue">
        <FormCard>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
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
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={user?.email || ''}
            disabled
            placeholder="Email (cannot be changed)"
            className="bg-gray-50"
          />

          <Input
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            disabled={saving}
          />

          <Input
            id="age"
            name="age"
            label="Age"
            type="number"
            min="13"
            max="120"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            disabled={saving}
          />

          {/* Profile Image Upload */}
          <div>
            <label htmlFor="profileImage" className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="space-y-3">
              {/* Current Image Display */}
              {currentImageUrl && !imageFile && (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={currentImageUrl}
                      alt="Current profile"
                      className="h-24 w-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Current profile image</p>
                  </div>
                </div>
              )}

              {/* Image Preview (when new file selected) */}
              {imagePreview && imageFile && (
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-24 w-24 rounded-full object-cover border-2 border-indigo-300"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">New image preview</p>
                    <p className="text-xs text-gray-500 mt-1">{imageFile.name}</p>
                  </div>
                </div>
              )}

              {/* File Input */}
              <div>
                <input
                  id="profileImage"
                  name="profileImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  disabled={saving}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Maximum file size: 1MB. Allowed formats: JPEG, PNG, GIF, WebP
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" fullWidth color="indigo" disabled={saving}>
            {saving ? 'Updating...' : 'Update Profile'}
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

