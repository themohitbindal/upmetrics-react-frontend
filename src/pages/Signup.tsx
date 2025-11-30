import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import { useAuth } from '../contexts/AuthContext'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signup, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (error) setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        name: formData.name || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
      })
      // Only navigate on success - form data persists on error
      navigate('/home', { replace: true })
    } catch (err: any) {
      // Keep form data and show error - don't clear inputs
      setError(err.message || 'Signup failed. Please check your information and try again.')
      setLoading(false) // Set loading to false in catch to keep form enabled
    }
  }

  return (
    <AuthLayout gradient="purple">
      <FormCard>
        <PageHeader title="Create Account" subtitle="Sign up to get started" />

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name (optional)"
            className="focus:ring-purple-500"
            disabled={loading}
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
            disabled={loading}
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
            placeholder="Enter your age (optional)"
            className="focus:ring-purple-500"
            disabled={loading}
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
            disabled={loading}
          />

          <Button type="submit" fullWidth color="purple" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
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



