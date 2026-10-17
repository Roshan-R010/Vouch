// User type
export interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  createdAt: Date
}

// Purchase type
export interface Purchase {
  id: string
  userId: string
  orderId: string
  retailer: string // Amazon, Flipkart, etc.
  productTitle: string
  amount: number
  currency: string
  orderDate: Date
  productImage?: string
  emailSubject?: string
  emailId?: string
  createdAt: Date
  updatedAt: Date
}

// Gmail raw email message
export interface GmailMessage {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  internalDate: string
  payload?: {
    headers: Array<{
      name: string
      value: string
    }>
    parts?: any[]
    body?: {
      data: string
    }
  }
}

// Parsed email result
export interface ParsedEmail {
  messageId: string
  from: string
  subject: string
  date: string
  retailer: string
  orderId: string
  productTitle: string
  amount: number
  currency: string
  productImage?: string
}
