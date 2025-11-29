import { useState } from 'react'
import AuthLayout from '../components/layouts/AuthLayout'
import FormCard from '../components/ui/FormCard'
import PageHeader from '../components/ui/PageHeader'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import LinkText from '../components/ui/LinkText'

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle signup logic here
    console.log('Signup:', formData)
  }

  return (
    <AuthLayout gradient="purple">
      <FormCard>
        <PageHeader title="Create Account" subtitle="Sign up to get started" />

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Enter your full name"
            className="focus:ring-purple-500"
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
            required
            placeholder="Enter your age"
            className="focus:ring-purple-500"
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
          />

          <Button type="submit" fullWidth color="purple">
            Sign Up
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



