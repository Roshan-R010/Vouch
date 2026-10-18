import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { getGmailOAuthClient } from '@/lib/gmail/oauth'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const session = await auth()
  const storedState = cookies().get('gmail_oauth_state')?.value
  const returnedState = url.searchParams.get('state')
  const code = url.searchParams.get('code')

  cookies().delete('gmail_oauth_state')

  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (url.searchParams.get('error')) {
    return NextResponse.redirect(new URL('/dashboard?gmail=cancelled', request.url))
  }

  if (!code || !storedState || storedState !== returnedState) {
    return NextResponse.redirect(new URL('/dashboard?gmail=invalid-state', request.url))
  }

  try {
    const client = getGmailOAuthClient()
    const { tokens } = await client.getToken(code)

    if (!tokens.access_token) {
      throw new Error('Google did not return a Gmail access token')
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        gmailAccessToken: tokens.access_token,
        gmailRefreshToken: tokens.refresh_token ?? undefined,
        gmailExpiresAt: tokens.expiry_date
          ? new Date(tokens.expiry_date)
          : undefined,
      },
    })

    await prisma.gmailSync.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        syncStatus: 'idle',
      },
      update: {
        syncStatus: 'idle',
        lastError: null,
      },
    })

    return NextResponse.redirect(new URL('/sync', request.url))
  } catch {
    return NextResponse.redirect(new URL('/dashboard?gmail=connection-error', request.url))
  }
}
