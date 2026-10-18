import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import PurchaseDashboard, {
  DashboardPurchase,
} from '@/components/PurchaseDashboard'
import { prisma } from '@/lib/db/prisma'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/login')
  }

  const [user, purchases] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { gmailRefreshToken: true, gmailAccessToken: true },
    }),
    prisma.purchase.findMany({
      where: { userId: session.user.id },
      orderBy: { orderDate: 'desc' },
    }),
  ])

  const dashboardPurchases: DashboardPurchase[] = purchases.map((purchase) => ({
    id: purchase.id,
    orderId: purchase.orderId,
    retailer: purchase.retailer,
    productTitle: purchase.productTitle,
    amount: purchase.amount === null ? null : Number(purchase.amount),
    currency: purchase.currency,
    orderDate: purchase.orderDate.toISOString(),
    quantity: purchase.quantity,
    orderStatus: purchase.orderStatus,
    productImage: purchase.productImage,
    productUrl: purchase.productUrl,
    estimatedDelivery: purchase.estimatedDelivery?.toISOString() ?? null,
    deliveryDate: purchase.deliveryDate?.toISOString() ?? null,
    emailSubject: purchase.emailSubject,
  }))

  return (
    <PurchaseDashboard
      userName={session.user.name ?? 'Vouch user'}
      userEmail={session.user.email ?? ''}
      gmailConnected={Boolean(user?.gmailRefreshToken || user?.gmailAccessToken)}
      purchases={dashboardPurchases}
    />
  )
}
