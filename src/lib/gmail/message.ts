import { gmail_v1 } from 'googleapis'

export type GmailMessageContent = {
  html: string
  text: string
}

function decodeBody(data: string | null | undefined) {
  if (!data) return ''

  return Buffer.from(data, 'base64url').toString('utf8')
}

function collectParts(
  part: gmail_v1.Schema$MessagePart | undefined,
  content: GmailMessageContent,
) {
  if (!part) return

  if (!part.filename) {
    const decoded = decodeBody(part.body?.data)

    if (part.mimeType === 'text/html' && decoded) {
      content.html += decoded
    } else if (part.mimeType === 'text/plain' && decoded) {
      content.text += `${decoded}\n`
    }
  }

  for (const child of part.parts ?? []) {
    collectParts(child, content)
  }
}

export function extractGmailMessageContent(
  payload: gmail_v1.Schema$MessagePart | undefined,
) {
  const content: GmailMessageContent = { html: '', text: '' }
  collectParts(payload, content)
  return content
}
