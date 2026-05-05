import type { Metadata } from 'next'
import { Space_Mono } from 'next/font/google'

const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400', '700'] })

export const metadata: Metadata = { title: 'Snyco Universe', description: 'Autonomous Project Intelligence Agent' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={spaceMono.className} style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}