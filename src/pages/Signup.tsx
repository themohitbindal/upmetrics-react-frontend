import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import { useAuth } from '../contexts/AuthContext'
import { validateImageFile } from '../utils/imageValidation'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
  })
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { signup } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    setProfileImage(file)
    setError(null)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      await signup(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
        },
        profileImage || undefined
      )
      navigate('/home')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout gradient="purple">
      <FormCard>
        <PageHeader title="Create Account" subtitle="Sign up to get started" />

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image (optional)
            </label>
            <div className="flex items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className="text-gray-400 text-2xl">👤</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                disabled={isLoading}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">Max 5MB, images only</p>
          </div>

          <Input
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className="focus:ring-purple-500"
            disabled={isLoading}
          />

          <Input
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="focus:ring-purple-500"
            disabled={isLoading}
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
            className="focus:ring-purple-500"
            disabled={isLoading}
          />

          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            placeholder="Create a password"
            className="focus:ring-purple-500"
            disabled={isLoading}
          />

          <Button type="submit" fullWidth color="purple" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <LinkText to="/login" color="purple">Sign in</LinkText>
          </p>
        </div>
      </FormCard>
    </AuthLayout>
  )
}

export default Signup
