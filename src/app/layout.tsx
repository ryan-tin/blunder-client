import NavBar from '@/components/NavBar'
import './globals.css'
import type { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'blunder',
  description: 'prove your worth at the colleseum of gladiators.',
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()
  return (
    <html lang="en">
      <body>
        <div>
          <NavBar session={session} />
        </div>
        {children}
      </body>
    </html>
  )
}
