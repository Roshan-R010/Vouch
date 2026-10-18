import * as cheerio from 'cheerio'

import {
  ParsedPurchaseResult,
  PurchaseEmailInput,
  PurchaseParseOutcome,
  PurchaseStatus,
} from '@/lib/parsers/types'

const ORDER_ID_PATTERN = /\b\d{3}-\d{7}-\d{7}\b/
const AMAZON_SENDER_PATTERN = /@(?:[a-z0-9-]+\.)*amazon\.(?:com|in|co\.[a-z]{2}|[a-z]{2})\b/i
const GENERIC_TITLE_PATTERN = /^\d+\s+[\w &-]+\s+items?$/i

function normalize(value: string) {
  return value
    .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim()
}

function htmlToText(html: string) {
  if (!html) return ''

  const $ = cheerio.load(html)
  $('script, style, head').remove()
  $('br').replaceWith('\n')
  $('p, div, tr, li, h1, h2, h3').append('\n')
  return normalize($.root().text())
}

function isUsefulTitle(value: string) {
  const title = normalize(value).replace(/^['"“]|['"”]$/g, '')
  const blocked = [
    'view order',
    'view or edit order',
    'your orders',
    'your account',
    'buy again',
    'thanks for your order',
    'order confirmed',
    'amazon.in',
    'amazon.com',
  ]

  return (
    title.length >= 6 &&
    title.length <= 300 &&
    !blocked.some((item) => title.toLowerCase() === item) &&
    !/^order\s*#?/i.test(title)
  )
}

function subjectTitle(subject: string) {
  const match = subject.match(/^(?:ordered|order confirmed|your order of)\s*:\s*["“]?(.+?)["”]?\s*$/i)
  return match && isUsefulTitle(match[1]) ? normalize(match[1]) : null
}

function findProductDetails(html: string, text: string, subject: string) {
  const candidates: Array<{ title: string; url: string | null }> = []
  let productImage: string | null = null

  if (html) {
    const $ = cheerio.load(html)

    $('a[href]').each((_, element) => {
      const href = $(element).attr('href') ?? ''
      const title = normalize($(element).text())
      const looksLikeProduct = /\/(?:dp|gp\/product)\//i.test(href)

      if (looksLikeProduct && isUsefulTitle(title)) {
        candidates.push({ title, url: href })
      }
    })

    const image = $('img[src*="/images/I/"], img[src*="m.media-amazon.com/images/I/"]')
      .filter((_, element) => {
        const src = $(element).attr('src') ?? ''
        return !/logo|pixel|spacer|transparent/i.test(src)
      })
      .first()

    productImage = image.attr('src') ?? null

    if (!candidates.length) {
      $('img[alt]').each((_, element) => {
        const title = normalize($(element).attr('alt') ?? '')
        if (isUsefulTitle(title) && !/amazon|logo/i.test(title)) {
          candidates.push({ title, url: null })
        }
      })
    }
  }

  const lines = text.split('\n').map(normalize).filter(Boolean)
  for (let index = 1; index < lines.length; index += 1) {
    if (/^quantity\s*:\s*\d+/i.test(lines[index]) && isUsefulTitle(lines[index - 1])) {
      candidates.push({ title: lines[index - 1], url: null })
    }
  }

  const fromSubject = subjectTitle(subject)
  if (fromSubject) candidates.unshift({ title: fromSubject, url: null })

  const unique = candidates.filter(
    (candidate, index) =>
      candidates.findIndex(
        (item) => item.title.toLowerCase() === candidate.title.toLowerCase(),
      ) === index,
  )

  const specific = unique.filter((candidate) => !GENERIC_TITLE_PATTERN.test(candidate.title))
  const selected = specific[0] ?? unique[0]
  const title = selected?.title ?? 'Amazon order'

  return {
    productTitle:
      specific.length > 1 ? `${specific[0].title} + ${specific.length - 1} more` : title,
    productUrl: selected?.url ?? null,
    productImage,
    titleIsGeneric: title === 'Amazon order' || GENERIC_TITLE_PATTERN.test(title),
  }
}

function currencyFromSymbol(symbol: string) {
  const normalized = symbol.toLowerCase().replace('.', '')
  if (symbol === '₹' || normalized === 'rs' || normalized === 'inr') return 'INR'
  if (symbol === '$' || normalized === 'usd') return 'USD'
  if (symbol === '£' || normalized === 'gbp') return 'GBP'
  if (symbol === '€' || normalized === 'eur') return 'EUR'
  return 'INR'
}

function findAmount(text: string) {
  const symbol = '(₹|Rs\\.?|INR|\\$|USD|£|GBP|€|EUR)'
  const number = '([0-9][0-9,]*(?:\\.[0-9]{1,2})?)'
  const labelled = new RegExp(
    `(?:grand\\s+total|order\\s+total|total)\\s*:?\\s*${symbol}\\s*${number}`,
    'gi',
  )
  const reversed = new RegExp(
    `(?:grand\\s+total|order\\s+total|total)\\s*:?\\s*${number}\\s*${symbol}`,
    'gi',
  )
  const allAmounts = new RegExp(`${symbol}\\s*${number}`, 'gi')

  const labelledMatch = labelled.exec(text)
  if (labelledMatch) {
    return {
      amount: Number(labelledMatch[2].replace(/,/g, '')),
      currency: currencyFromSymbol(labelledMatch[1]),
    }
  }

  const reversedMatch = reversed.exec(text)
  if (reversedMatch) {
    return {
      amount: Number(reversedMatch[1].replace(/,/g, '')),
      currency: currencyFromSymbol(reversedMatch[2]),
    }
  }

  const matches = Array.from(text.matchAll(allAmounts))
    .map((match) => ({
      amount: Number(match[2].replace(/,/g, '')),
      currency: currencyFromSymbol(match[1]),
    }))
    .filter((match) => Number.isFinite(match.amount))
    .sort((left, right) => right.amount - left.amount)

  return matches[0] ?? { amount: null, currency: 'INR' }
}

function findQuantity(text: string) {
  const quantities = Array.from(text.matchAll(/quantity\s*:\s*(\d+)/gi)).map(
    (match) => Number(match[1]),
  )

  if (quantities.length) {
    return Math.max(1, quantities.reduce((total, quantity) => total + quantity, 0))
  }

  const itemCount = text.match(/\b(\d+)\s+items?\b/i)
  return itemCount ? Math.max(1, Number(itemCount[1])) : 1
}

function findStatus(subject: string, text: string): PurchaseStatus {
  const value = `${subject}\n${text}`.toLowerCase()

  if (/cancelled|canceled|cancellation/.test(value)) return 'cancelled'
  if (/delivered(?:\s|$)/.test(value)) return 'delivered'
  if (/out for delivery/.test(value)) return 'out_for_delivery'
  if (/has shipped|was shipped|shipped(?:\s|$)/.test(value)) return 'shipped'
  return 'ordered'
}

function parseRelativeDate(value: string, sentDate: Date) {
  const normalized = normalize(value).replace(/\s+(?:by\s+)?\d{1,2}(?::\d{2})?\s*(?:am|pm).*$/i, '')
  const result = new Date(sentDate)
  result.setHours(0, 0, 0, 0)

  if (/^today$/i.test(normalized)) return result
  if (/^tomorrow$/i.test(normalized)) {
    result.setDate(result.getDate() + 1)
    return result
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const weekday = weekdays.findIndex((day) => normalized.toLowerCase() === day)
  if (weekday >= 0) {
    const daysAhead = (weekday - result.getDay() + 7) % 7 || 7
    result.setDate(result.getDate() + daysAhead)
    return result
  }

  const withYear = /\b\d{4}\b/.test(normalized)
    ? normalized
    : `${normalized}, ${sentDate.getFullYear()}`
  const parsed = new Date(withYear)

  if (Number.isNaN(parsed.getTime())) return null
  if (parsed.getTime() < sentDate.getTime() - 30 * 24 * 60 * 60 * 1000) {
    parsed.setFullYear(parsed.getFullYear() + 1)
  }

  return parsed
}

function findDeliveryDate(text: string, sentDate: Date, status: PurchaseStatus) {
  const delivered = text.match(/delivered\s+(?:on\s+)?([^\n]+)/i)
  const arriving = text.match(/arriving\s+(?:on\s+)?([^\n]+)/i)
  const expected = text.match(/(?:estimated delivery|expected by)\s*:?\s*([^\n]+)/i)
  const raw = delivered?.[1] ?? arriving?.[1] ?? expected?.[1]
  if (!raw) return { estimatedDelivery: null, deliveryDate: null }

  const date = parseRelativeDate(raw, sentDate)
  return status === 'delivered'
    ? { deliveryDate: date, estimatedDelivery: null }
    : { estimatedDelivery: date, deliveryDate: null }
}

export function parseAmazonEmail(input: PurchaseEmailInput): PurchaseParseOutcome {
  if (!AMAZON_SENDER_PATTERN.test(input.from)) {
    return { ok: false, error: 'Sender is not a verified Amazon domain' }
  }

  const htmlText = htmlToText(input.html)
  const text = normalize(`${input.text}\n${htmlText}`)
  const orderId = text.match(ORDER_ID_PATTERN)?.[0] ?? input.subject.match(ORDER_ID_PATTERN)?.[0]

  if (!orderId) {
    return { ok: false, error: 'Amazon order number was not found' }
  }

  const product = findProductDetails(input.html, text, input.subject)
  const amount = findAmount(text)
  const status = findStatus(input.subject, text)
  const delivery = findDeliveryDate(text, input.sentDate, status)

  const purchase: ParsedPurchaseResult = {
    messageId: input.messageId,
    retailer: 'Amazon',
    orderId,
    productTitle: product.productTitle,
    amount: amount.amount,
    currency: amount.currency,
    orderDate: input.sentDate,
    quantity: findQuantity(text),
    orderStatus: status,
    productImage: product.productImage,
    productUrl: product.productUrl,
    estimatedDelivery: delivery.estimatedDelivery,
    deliveryDate: delivery.deliveryDate,
    emailSubject: input.subject,
    emailFrom: input.from,
    titleIsGeneric: product.titleIsGeneric,
  }

  return { ok: true, purchase }
}
