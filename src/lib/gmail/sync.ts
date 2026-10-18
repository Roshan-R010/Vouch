import { gmail_v1, google } from 'googleapis'

import { prisma } from '@/lib/db/prisma'
import { extractGmailMessageContent } from '@/lib/gmail/message'
import { getGmailOAuthClient } from '@/lib/gmail/oauth'
import { parseAmazonEmail } from '@/lib/parsers/amazon'
import { ParsedPurchaseResult, PurchaseStatus } from '@/lib/parsers/types'

const PURCHASE_QUERY =
  'newer_than:2y from:amazon {subject:ordered subject:order subject:shipped subject:delivered subject:cancelled subject:"out for delivery"}'

const MAX_EMAILS_PER_SYNC = 100
const IMPORT_BATCH_SIZE = 6
const STATUS_RANK: Record<PurchaseStatus, number> = {
  ordered: 1,
  shipped: 2,
  out_for_delivery: 3,
  delivered: 4,
  cancelled: 5,
}

function getHeader(
  headers: gmail_v1.Schema$MessagePartHeader[] | undefined,
  name: string,
) {
  return headers?.find((header) => header.name?.toLowerCase() === name)?.value ?? ''
}

function isGenericTitle(title: string) {
  return title === 'Amazon order' || /^\d+\s+[\w &-]+\s+items?$/i.test(title)
}

async function updateSyncStatus(
  userId: string,
  syncStatus: string,
  data: { totalEmails?: number; parsedEmails?: number; lastError?: string | null } = {},
) {
  await prisma.gmailSync.upsert({
    where: { userId },
    create: {
      userId,
      syncStatus,
      totalEmails: data.totalEmails ?? 0,
      parsedEmails: data.parsedEmails ?? 0,
      lastError: data.lastError,
    },
    update: { syncStatus, ...data },
  })
}

function mergeAmazonMessages(messages: ParsedPurchaseResult[]) {
  const sorted = [...messages].sort(
    (left, right) => left.orderDate.getTime() - right.orderDate.getTime(),
  )
  const latestStatus = [...sorted].sort(
    (left, right) => STATUS_RANK[right.orderStatus] - STATUS_RANK[left.orderStatus],
  )[0]
  const specificTitle = sorted
    .filter((message) => !message.titleIsGeneric)
    .sort((left, right) => right.productTitle.length - left.productTitle.length)[0]
  const amount = sorted
    .filter((message) => message.amount !== null)
    .sort((left, right) => (right.amount ?? 0) - (left.amount ?? 0))[0]
  const latestMessage = sorted[sorted.length - 1]

  return {
    ...latestMessage,
    productTitle: specificTitle?.productTitle ?? latestMessage.productTitle,
    titleIsGeneric: !specificTitle,
    amount: amount?.amount ?? null,
    currency: amount?.currency ?? latestMessage.currency,
    orderDate: sorted[0].orderDate,
    quantity: Math.max(...sorted.map((message) => message.quantity)),
    orderStatus: latestStatus.orderStatus,
    productImage:
      sorted.find((message) => message.productImage)?.productImage ?? null,
    productUrl: sorted.find((message) => message.productUrl)?.productUrl ?? null,
    estimatedDelivery:
      [...sorted].reverse().find((message) => message.estimatedDelivery)
        ?.estimatedDelivery ?? null,
    deliveryDate:
      [...sorted].reverse().find((message) => message.deliveryDate)?.deliveryDate ??
      null,
    emailSubject: latestStatus.emailSubject,
    emailFrom: latestStatus.emailFrom,
    messageId: latestStatus.messageId,
  }
}

async function saveAmazonPurchases(
  userId: string,
  parsedMessages: ParsedPurchaseResult[],
) {
  const grouped = new Map<string, ParsedPurchaseResult[]>()

  for (const message of parsedMessages) {
    const existing = grouped.get(message.orderId) ?? []
    existing.push(message)
    grouped.set(message.orderId, existing)
  }

  for (const [orderId, messages] of Array.from(grouped.entries())) {
    const parsed = mergeAmazonMessages(messages)
    const existing = await prisma.purchase.findUnique({
      where: {
        userId_retailer_orderId: { userId, retailer: 'Amazon', orderId },
      },
    })
    const existingStatus = existing?.orderStatus as PurchaseStatus | null | undefined
    const keepExistingStatus = Boolean(
      existingStatus && STATUS_RANK[existingStatus] > STATUS_RANK[parsed.orderStatus],
    )
    const keepExistingTitle = Boolean(
      existing && !isGenericTitle(existing.productTitle) && parsed.titleIsGeneric,
    )

    await prisma.purchase.upsert({
      where: {
        userId_retailer_orderId: { userId, retailer: 'Amazon', orderId },
      },
      create: {
        userId,
        retailer: 'Amazon',
        orderId,
        productTitle: parsed.productTitle,
        amount: parsed.amount,
        currency: parsed.currency,
        orderDate: parsed.orderDate,
        quantity: parsed.quantity,
        orderStatus: parsed.orderStatus,
        productImage: parsed.productImage,
        productUrl: parsed.productUrl,
        estimatedDelivery: parsed.estimatedDelivery,
        deliveryDate: parsed.deliveryDate,
        emailId: parsed.messageId,
        emailSubject: parsed.emailSubject,
        emailFrom: parsed.emailFrom,
      },
      update: {
        productTitle: keepExistingTitle ? existing!.productTitle : parsed.productTitle,
        amount: parsed.amount ?? existing?.amount,
        currency: parsed.amount !== null ? parsed.currency : existing?.currency,
        orderDate:
          existing && existing.orderDate < parsed.orderDate
            ? existing.orderDate
            : parsed.orderDate,
        quantity: Math.max(existing?.quantity ?? 1, parsed.quantity),
        orderStatus: keepExistingStatus ? existingStatus : parsed.orderStatus,
        productImage: parsed.productImage ?? existing?.productImage,
        productUrl: parsed.productUrl ?? existing?.productUrl,
        estimatedDelivery:
          parsed.estimatedDelivery ?? existing?.estimatedDelivery,
        deliveryDate: parsed.deliveryDate ?? existing?.deliveryDate,
        emailId: parsed.messageId,
        emailSubject: parsed.emailSubject,
        emailFrom: parsed.emailFrom,
      },
    })

    await prisma.parsedEmail.updateMany({
      where: {
        userId,
        gmailMessageId: { in: messages.map((message) => message.messageId) },
      },
      data: { purchased: true },
    })
  }
}

export async function syncPurchaseEmails(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      gmailAccessToken: true,
      gmailRefreshToken: true,
      gmailExpiresAt: true,
    },
  })

  if (!user?.gmailAccessToken && !user?.gmailRefreshToken) {
    throw new Error('Gmail is not connected')
  }

  await updateSyncStatus(userId, 'connecting', {
    totalEmails: 0,
    parsedEmails: 0,
    lastError: null,
  })

  const client = getGmailOAuthClient()
  client.setCredentials({
    access_token: user.gmailAccessToken,
    refresh_token: user.gmailRefreshToken,
    expiry_date: user.gmailExpiresAt?.getTime(),
  })

  await client.getAccessToken()

  if (client.credentials.access_token) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        gmailAccessToken: client.credentials.access_token,
        gmailRefreshToken:
          client.credentials.refresh_token ?? user.gmailRefreshToken ?? undefined,
        gmailExpiresAt: client.credentials.expiry_date
          ? new Date(client.credentials.expiry_date)
          : undefined,
      },
    })
  }

  const gmail = google.gmail({ version: 'v1', auth: client })

  await updateSyncStatus(userId, 'scanning')
  const list = await gmail.users.messages.list({
    userId: 'me',
    q: PURCHASE_QUERY,
    maxResults: MAX_EMAILS_PER_SYNC,
  })

  const messages = list.data.messages ?? []
  await updateSyncStatus(userId, 'finding', {
    totalEmails: messages.length,
    parsedEmails: 0,
  })
  await updateSyncStatus(userId, 'importing')

  let imported = 0
  const parsedPurchases: ParsedPurchaseResult[] = []

  for (let index = 0; index < messages.length; index += IMPORT_BATCH_SIZE) {
    const batch = messages.slice(index, index + IMPORT_BATCH_SIZE)
    const details = await Promise.all(
      batch.map(({ id }) =>
        id
          ? gmail.users.messages.get({ userId: 'me', id, format: 'full' })
          : null,
      ),
    )

    for (const response of details) {
      const message = response?.data
      if (!message?.id) continue

      const headers = message.payload?.headers
      const from = getHeader(headers, 'from') || 'Unknown sender'
      const subject = getHeader(headers, 'subject') || 'Amazon order email'
      const headerDate = getHeader(headers, 'date')
      const internalDate = Number(message.internalDate)
      const sentDate =
        Number.isFinite(internalDate) && internalDate > 0
          ? new Date(internalDate)
          : new Date(headerDate)
      const safeSentDate = Number.isNaN(sentDate.getTime()) ? new Date() : sentDate
      const content = extractGmailMessageContent(message.payload)
      const outcome = parseAmazonEmail({
        messageId: message.id,
        from,
        subject,
        sentDate: safeSentDate,
        html: content.html,
        text: content.text,
      })

      await prisma.parsedEmail.upsert({
        where: {
          userId_gmailMessageId: { userId, gmailMessageId: message.id },
        },
        create: {
          gmailMessageId: message.id,
          userId,
          from,
          subject,
          sentDate: safeSentDate,
          retailer: 'Amazon',
          orderId: outcome.ok ? outcome.purchase.orderId : null,
          productTitle: outcome.ok ? outcome.purchase.productTitle : null,
          amount: outcome.ok ? outcome.purchase.amount : null,
          currency: outcome.ok ? outcome.purchase.currency : null,
          productImage: outcome.ok ? outcome.purchase.productImage : null,
          rawContent: null,
          parseError: outcome.ok ? null : outcome.error,
          processed: true,
          purchased: false,
        },
        update: {
          from,
          subject,
          sentDate: safeSentDate,
          retailer: 'Amazon',
          orderId: outcome.ok ? outcome.purchase.orderId : null,
          productTitle: outcome.ok ? outcome.purchase.productTitle : null,
          amount: outcome.ok ? outcome.purchase.amount : null,
          currency: outcome.ok ? outcome.purchase.currency : null,
          productImage: outcome.ok ? outcome.purchase.productImage : null,
          rawContent: null,
          parseError: outcome.ok ? null : outcome.error,
          processed: true,
          purchased: false,
        },
      })

      if (outcome.ok) parsedPurchases.push(outcome.purchase)
      imported += 1
    }

    await updateSyncStatus(userId, 'importing', { parsedEmails: imported })
  }

  await saveAmazonPurchases(userId, parsedPurchases)

  await prisma.gmailSync.update({
    where: { userId },
    data: {
      syncStatus: 'complete',
      parsedEmails: imported,
      lastSyncTime: new Date(),
      lastError: null,
    },
  })

  return {
    totalEmails: messages.length,
    parsedEmails: imported,
    purchases: new Set(parsedPurchases.map((purchase) => purchase.orderId)).size,
  }
}

export function getSafeSyncError(error: unknown) {
  if (!(error instanceof Error)) return 'Gmail sync failed'

  console.error('Gmail sync failed:', error)

  if (error.message.includes('invalid_grant')) {
    return 'Gmail access expired. Please reconnect Gmail.'
  }

  if (error.message === 'Gmail is not connected') return error.message

  return 'Gmail could not be scanned. Please try again.'
}
