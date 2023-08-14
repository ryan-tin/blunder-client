import NavBar from '@/components/NavBar'
import './globals.css'
import type { Metadata } from 'next'
import styles from '@/styles/App.module.css';
// import { Inter } from 'next/font/google'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'blunder',
  description: 'prove your worth at the colleseum of gladiators.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
      <div>
        <NavBar />
      </div>
        {children}
      </body>
    </html>
  )
}
// <body className={inter.className}>{children}</body>
