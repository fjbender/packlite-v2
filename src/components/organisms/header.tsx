'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Header() {
  const { data: session, status } = useSession()

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              Packlite
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {status === 'authenticated' && (
              <div className="flex items-center gap-6 mr-4">
                <Link
                  href="/gear"
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                >
                  Gear
                </Link>
                <Link
                  href="/pantry"
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                >
                  Pantry
                </Link>
                <Link
                  href="/trips"
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                >
                  Trips
                </Link>
              </div>
            )}

            {status === 'loading' && <div className="text-sm text-gray-600">Loading...</div>}

            {status === 'unauthenticated' && (
              <>
                <Link
                  href="/auth/signin"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}

            {status === 'authenticated' && session?.user && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Hello, {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
