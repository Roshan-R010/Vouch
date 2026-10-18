import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db/prisma'
import { getSafeSyncError, syncPurchaseEmails } from '@/lib/gmail/sync'

export const runtime = 'nodejs'
export const maxDuration = 60

const activeStatuses = ['connecting', 'scanning', 'finding', 'importing']

export async function GET() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sync = await prisma.gmailSync.findUnique({
    where: { userId: session.user.id },
    select: {
      syncStatus: true,
      totalEmails: true,
      parsedEmails: true,
      lastError: true,
      lastSyncTime: true,
    },
  })

  return NextResponse.json(
    sync ?? {
      syncStatus: 'idle',
      totalEmails: 0,
      parsedEmails: 0,
      lastError: null,
      lastSyncTime: null,
    },
  )
}

export async function POST() {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.gmailSync.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, syncStatus: 'idle' },
    update: {},
  })

  const claim = await prisma.gmailSync.updateMany({
    where: {
      userId: session.user.id,
      syncStatus: { notIn: activeStatuses },
    },
    data: {
      syncStatus: 'connecting',
      totalEmails: 0,
      parsedEmails: 0,
      lastError: null,
    },
  })

  if (claim.count === 0) {
    return NextResponse.json({ started: false, alreadyRunning: true })
  }

  try {
    const result = await syncPurchaseEmails(session.user.id)
    return NextResponse.json({ started: true, ...result })
  } catch (error) {
    const message = getSafeSyncError(error)

    await prisma.gmailSync.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        syncStatus: 'error',
        lastError: message,
      },
      update: {
        syncStatus: 'error',
        lastError: message,
      },
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
