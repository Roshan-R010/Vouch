export type PurchaseStatus =
  | 'ordered'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PurchaseEmailInput = {
  messageId: string
  from: string
  subject: string
  sentDate: Date
  html: string
  text: string
}

export type ParsedPurchaseResult = {
  messageId: string
  retailer: 'Amazon'
  orderId: string
  productTitle: string
  amount: number | null
  currency: string
  orderDate: Date
  quantity: number
  orderStatus: PurchaseStatus
  productImage: string | null
  productUrl: string | null
  estimatedDelivery: Date | null
  deliveryDate: Date | null
  emailSubject: string
  emailFrom: string
  titleIsGeneric: boolean
}

export type PurchaseParseOutcome =
  | { ok: true; purchase: ParsedPurchaseResult }
  | { ok: false; error: string }
