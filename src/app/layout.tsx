import '@/styles/globals.css'
import SessionProvider from '@/components/providers/session-provider'
import Header from '@/components/organisms/header'

export const metadata = {
  title: 'Packlite - Smart Hiking Packing Lists',
  description: 'Plan, optimize, and share your hiking gear with Packlite',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Header />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
