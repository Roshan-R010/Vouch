import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import GmailSyncProgress from '@/components/GmailSyncProgress'
import { prisma } from '@/lib/db/prisma'

export default async function SyncPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { gmailAccessToken: true, gmailRefreshToken: true },
  })

  if (!user?.gmailAccessToken && !user?.gmailRefreshToken) {
    redirect('/api/gmail/connect')
  }

  const initial = (session.user.name ?? session.user.email ?? 'V')
    .charAt(0)
    .toUpperCase()

  return <GmailSyncProgress userInitial={initial} />
}
