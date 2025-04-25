import { caller } from '@/app/trpc/server';
import { SignUpView } from '@/modules/auth/ui/views/sign-up-view'
import { redirect } from 'next/navigation';
import React from 'react'

const Page = async() => {

  const session = await caller.auth.session();  // Obtenemos el objeto de sesión desde el server

  if (session.user) {
    redirect("/")
  }

  return (
    <SignUpView />
  )
}

export default Page