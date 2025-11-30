import { useState } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import SuccessMessage from '../components/ui/SuccessMessage'
import { useAuth } from '../contexts/AuthContext'
import { ROUTES } from '../config/routes'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await resetPassword(email, newPassword)
      setIsSubmitted(true)
    } catch (err: unknown) {
      // Keep form data and show error - don't clear inputs
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Password reset failed. Please check your email and try again.')
      }
      setLoading(false) // Set loading to false in catch to keep form enabled
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout gradient="green">
        <FormCard className="text-center">
          <SuccessMessage
            title="Password Updated"
            message="Password updated successfully. You can now sign in with your new password."
            linkTo={ROUTES.LOGIN}
            linkText="Back to Sign In"
            linkColor="green"
          />
        </FormCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout gradient="green">
      <FormCard>
        <PageHeader
          title="Forgot Password?"
          subtitle="No worries, we'll send you reset instructions."
        />

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
            className="focus:ring-green-500"
            disabled={loading}
          />

          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value)
              // Clear error when user starts typing
              if (error) setError(null)
            }}
            required
            minLength={6}
            placeholder="Enter new password"
            className="focus:ring-green-500"
            disabled={loading}
          />

          <Button type="submit" fullWidth color="green" disabled={loading}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <LinkText to={ROUTES.LOGIN} color="green">
            ← Back to Sign In
          </LinkText>
        </div>
      </FormCard>
    </AuthLayout>
  )
}

export default ForgotPassword



