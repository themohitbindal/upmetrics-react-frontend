import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(email, password)
      // Only navigate on success - form data persists on error
      navigate('/home', { replace: true })
    } catch (err: any) {
      // Keep form data and show error - don't clear inputs
      setError(err.message || 'Login failed. Please check your credentials and try again.')
      setLoading(false) // Set loading to false in catch to keep form enabled
    }
  }

  return (
    <AuthLayout gradient="blue">
      <FormCard>
        <PageHeader title="Welcome Back" subtitle="Sign in to your account" />

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              // Clear error when user starts typing
              if (error) setError(null)
            }}
            required
            placeholder="Enter your email"
            disabled={loading}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              // Clear error when user starts typing
              if (error) setError(null)
            }}
            required
            placeholder="Enter your password"
            disabled={loading}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <LinkText to="/forgot-password" color="indigo">
              Forgot password?
            </LinkText>
          </div>

          <Button type="submit" fullWidth color="indigo" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? <LinkText to="/signup" color="indigo">Sign up</LinkText>
          </p>
        </div>
      </FormCard>
    </AuthLayout>
  )
}

export default Login



