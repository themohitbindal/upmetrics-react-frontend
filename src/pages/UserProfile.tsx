import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'

function UserProfile() {
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

  return (
    <AuthLayout gradient="blue">
      <FormCard>
        <PageHeader
          title="User Profile"
          subtitle="Manage your account settings"
          icon={profileIcon}
        />

        <div className="space-y-6">
          <Input
            id="name"
            label="Full Name"
            type="text"
            defaultValue="John Doe"
            placeholder="Enter your full name"
          />

          <Input
            id="email"
            label="Email Address"
            type="email"
            defaultValue="john.doe@example.com"
            placeholder="Enter your email"
          />

          <Input
            id="age"
            label="Age"
            type="number"
            min="13"
            max="120"
            defaultValue="25"
            placeholder="Enter your age"
          />

          <Button type="button" fullWidth color="indigo">
            Update Profile
          </Button>
        </div>

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

