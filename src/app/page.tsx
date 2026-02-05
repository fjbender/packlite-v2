'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">
          {status === 'authenticated'
            ? `Welcome back, ${session?.user?.name}!`
            : 'Welcome to Packlite'}
        </h1>
        <p className="text-xl text-gray-600 mb-8">Your smart hiking packing list companion</p>
        <div className="flex gap-4 justify-center">
          {status === 'authenticated' ? (
            <>
              <Link
                href="/gear"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                My Gear
              </Link>
              <Link
                href="/trips"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                My Trips
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/auth/signup"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/auth/signin"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
