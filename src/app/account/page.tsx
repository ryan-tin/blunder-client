import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import AccountForm from './account-form'

export default async function Account() {
  const supabase = createServerComponentClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '90vh',
      justifyContent: 'center',
      alignItems: 'center'
    }}
    >
      <h1> Welcome! Tell us a little more about yourself. </h1>
      <div style={{
        height: "60vh",
        width: "30vw",
      }}>
        <AccountForm session={session} />
      </div>
    </div>
  )
}
