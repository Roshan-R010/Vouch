import { google } from 'googleapis'

export const gmailScopes = ['https://www.googleapis.com/auth/gmail.readonly']

export function getGmailRedirectUri() {
  return (
    process.env.GMAIL_REDIRECT_URI ??
    `${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/api/auth/gmail/callback`
  )
}

export function getGmailOAuthClient() {
  const configuredValue = (value: string | undefined) =>
    value && !value.startsWith('your_') ? value : undefined

  const clientId =
    configuredValue(process.env.GMAIL_CLIENT_ID) ??
    configuredValue(process.env.GOOGLE_CLIENT_ID)
  const clientSecret =
    configuredValue(process.env.GMAIL_CLIENT_SECRET) ??
    configuredValue(process.env.GOOGLE_CLIENT_SECRET)

  if (!clientId || !clientSecret) {
    throw new Error(
      'Google OAuth credentials are required for the Gmail connection',
    )
  }

  return new google.auth.OAuth2(clientId, clientSecret, getGmailRedirectUri())
}
