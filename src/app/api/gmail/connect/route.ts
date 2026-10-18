import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { auth } from '@/auth'
import { getGmailOAuthClient, gmailScopes } from '@/lib/gmail/oauth'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  try {
    const state = randomBytes(32).toString('hex')
    const client = getGmailOAuthClient()
    const authorizationUrl = client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: gmailScopes,
      state,
      include_granted_scopes: true,
    })

    cookies().set('gmail_oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 10 * 60,
      path: '/',
    })

    return NextResponse.redirect(authorizationUrl)
  } catch {
    return NextResponse.redirect(
      new URL('/dashboard?gmail=configuration-error', request.url),
    )
  }
}
