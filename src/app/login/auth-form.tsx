'use client'

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect } from 'react';

export default function AuthForm() {
  const supabase = createClientComponentClient();

  // runs after every render
  useEffect(() => {
    // HACK: redirect after sign in with email+pass does not work,
    // handle it manually
    const signInButton = document.querySelector('button:nth-child(2)')
    signInButton?.addEventListener('click', async () => {
      console.log('signin clicked!!')
      const email = (document.getElementById('email') as HTMLInputElement).value;
      const password = (document.getElementById('password') as HTMLInputElement).value;
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        console.log('data', data);

        if (error) {
          throw error
        }

        // redirect to home page when button is clicked and credentials are valid
        window.location.assign("http://localhost:3000/");

      } catch (error) {
        console.log(error);
      }
    })
  })


  return (
    <Auth
      supabaseClient={supabase}
      appearance={{
        theme: ThemeSupa,
        style: {
          input: { color: 'white' },
          message: { color: 'white' }
        }
      }}
      theme="dark"
      providers={['google']}
      redirectTo={`http://${window.location.host}/`}
    />
  )
}
