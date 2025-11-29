import { useState } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'
import SuccessMessage from '../components/ui/SuccessMessage'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    console.log('Forgot Password:', { email })
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <AuthLayout gradient="green">
        <FormCard className="text-center">
          <SuccessMessage
            title="Check Your Email"
            message={`We've sent a password reset link to ${email}`}
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
          title="Forgot Password?"
          subtitle="No worries, we'll send you reset instructions."
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            className="focus:ring-green-500"
          />

          <Button type="submit" fullWidth color="green">
            Reset Password
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



