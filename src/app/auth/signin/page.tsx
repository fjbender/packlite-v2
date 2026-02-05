import SignInForm from '@/features/auth/components/signin-form'

export const metadata = {
  title: 'Sign In - Packlite',
  description: 'Sign in to your Packlite account',
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  )
}
