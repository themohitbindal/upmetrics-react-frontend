import { useState, useEffect, useRef } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import { useAuth } from '../contexts/AuthContext'
import { userService } from '../lib/api/services/userService'

function UserProfile() {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    profileImage: '',
  })
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
          profileImage: response.data.profileImage || '',
        })
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
      if (formData.profileImage) updateData.profileImage = formData.profileImage

      const response = await userService.updateProfile(user._id, updateData)
      if (response.success) {
        // Update auth context user data without reloading
        updateUser({
          name: response.data.name,
          age: response.data.age,
          profileImage: response.data.profileImage,
        })
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

  const profileIcon = (
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

          <Input
            id="profileImage"
            name="profileImage"
            label="Profile Image URL"
            type="url"
            value={formData.profileImage}
            onChange={handleChange}
            placeholder="Enter profile image URL (optional)"
            disabled={saving}
          />

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

