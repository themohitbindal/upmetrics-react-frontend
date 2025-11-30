import { useState } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import SuccessMessage from '../components/ui/SuccessMessage'
import { resetPassword } from '../api/auth'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await resetPassword(email, newPassword)
      setIsSubmitted(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed. Please try again.'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <AuthLayout gradient="green">
        <FormCard className="text-center">
          <SuccessMessage
            title="Password Reset Successful"
            message="Your password has been updated. You can now sign in with your new password."
            linkTo="/login"
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
          title="Reset Password"
          subtitle="Enter your email and new password"
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="focus:ring-green-500"
            disabled={isLoading}
          />

          <Input
            id="newPassword"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Enter new password"
            className="focus:ring-green-500"
            disabled={isLoading}
          />

          <Input
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Confirm new password"
            className="focus:ring-green-500"
            disabled={isLoading}
          />

          <Button type="submit" fullWidth color="green" disabled={isLoading}>
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <LinkText to="/login" color="green">
            ← Back to Sign In
          </LinkText>
        </div>
      </FormCard>
    </AuthLayout>
  )
}

export default ForgotPassword
