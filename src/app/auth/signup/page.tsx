import SignUpForm from '@/features/auth/components/signup-form'

export const metadata = {
  title: 'Sign Up - Packlite',
  description: 'Create a new Packlite account',
}

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignUpForm />
    </div>
  )
}
