import '@/styles/globals.css'

export const metadata = {
  title: 'Packlite - Smart Hiking Packing Lists',
  description: 'Plan, optimize, and share your hiking gear with Packlite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
