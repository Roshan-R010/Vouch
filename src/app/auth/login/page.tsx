import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import LoginPage from '@/components/LoginPage'

export default async function LoginRoute() {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return <LoginPage />
}
