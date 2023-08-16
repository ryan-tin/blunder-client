'use client'

import AuthForm from './auth-form';

export default function LogIn() {

  return (
    <main
      style={{
        height: '80vh',
        display: "flex",
        justifyContent: "center",
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: '30vw'
        }}
      >
        <AuthForm />
      </div>
    </main>
  );
}
