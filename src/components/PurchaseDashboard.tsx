'use client'

import Image from 'next/image'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'

export type DashboardPurchase = {
  id: string
  orderId: string
  retailer: string
  productTitle: string
  amount: number | null
  currency: string
  orderDate: string
  quantity: number
  orderStatus: string | null
  productImage: string | null
  productUrl: string | null
  estimatedDelivery: string | null
  deliveryDate: string | null
  emailSubject: string | null
}

type PurchaseDashboardProps = {
  userName: string
  userEmail: string
  gmailConnected: boolean
  purchases: DashboardPurchase[]
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function ProductPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#f4efe9] text-[#ff6b63]">
      <svg viewBox="0 0 48 48" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="m9 16 15-7 15 7-15 8-15-8Z" />
        <path d="M9 16v17l15 7 15-8V16M24 24v16" />
      </svg>
    </div>
  )
}

function formatMoney(amount: number | null, currency: string) {
  if (amount === null) return 'Amount unavailable'

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`
  }
}

function formatDate(value: string | null) {
  if (!value) return null
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function statusLabel(status: string | null) {
  if (!status) return 'Order found'
  return status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function statusClasses(status: string | null) {
  if (status === 'delivered') return 'bg-[#e6f7ee] text-[#16845b]'
  if (status === 'cancelled') return 'bg-[#feeceb] text-[#c53b35]'
  if (status === 'shipped' || status === 'out_for_delivery') {
    return 'bg-[#fff3d9] text-[#966312]'
  }
  return 'bg-[#f0efed] text-[#62605d]'
}

function PurchaseModal({
  purchase,
  onClose,
}: {
  purchase: DashboardPurchase
  onClose: () => void
}) {
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [onClose])

  const deliveryDate = formatDate(purchase.deliveryDate ?? purchase.estimatedDelivery)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#251f1a]/45 p-4 backdrop-blur-[3px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose()
      }}
    >
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-title"
        className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/70 bg-[#fffaf4] p-6 shadow-[0_28px_90px_rgba(33,24,18,0.28)] sm:p-8"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close purchase details"
          className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5ddd5] bg-white text-xl text-[#4b5563] transition hover:bg-[#f7f2ed]"
        >
          ×
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff625b]">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff0ec] text-base font-black normal-case tracking-normal text-black">a</span>
          Amazon purchase
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-[150px_1fr]">
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-[#ece4dc] bg-white">
            {purchase.productImage ? (
              <Image
                src={purchase.productImage}
                alt=""
                fill
                unoptimized
                className="object-contain p-4"
              />
            ) : (
              <ProductPlaceholder />
            )}
          </div>

          <div className="min-w-0 pr-5">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(purchase.orderStatus)}`}>
              {statusLabel(purchase.orderStatus)}
            </span>
            <h2 id="purchase-title" className="mt-3 text-2xl font-bold leading-tight tracking-[-0.03em] text-[#161616]">
              {purchase.productTitle}
            </h2>
            <p className="mt-3 text-2xl font-bold text-[#161616]">
              {formatMoney(purchase.amount, purchase.currency)}
            </p>
          </div>
        </div>

        <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 rounded-2xl border border-[#eadfd6] bg-white/70 p-5 text-sm">
          <div>
            <dt className="text-[#8a817a]">Order number</dt>
            <dd className="mt-1 font-semibold text-[#27231f]">{purchase.orderId}</dd>
          </div>
          <div>
            <dt className="text-[#8a817a]">Ordered on</dt>
            <dd className="mt-1 font-semibold text-[#27231f]">{formatDate(purchase.orderDate)}</dd>
          </div>
          <div>
            <dt className="text-[#8a817a]">Quantity</dt>
            <dd className="mt-1 font-semibold text-[#27231f]">{purchase.quantity}</dd>
          </div>
          <div>
            <dt className="text-[#8a817a]">
              {purchase.deliveryDate ? 'Delivered on' : 'Expected delivery'}
            </dt>
            <dd className="mt-1 font-semibold text-[#27231f]">{deliveryDate ?? 'Not available'}</dd>
          </div>
        </dl>

        {purchase.emailSubject ? (
          <div className="mt-5 rounded-2xl bg-[#f6f0e9] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#9b8f84]">Source email</p>
            <p className="mt-2 text-sm leading-5 text-[#514b45]">{purchase.emailSubject}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {purchase.productUrl ? (
            <a
              href={purchase.productUrl}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center rounded-xl bg-[#ff645d] px-5 py-3 text-sm font-semibold text-white"
            >
              View item on Amazon
            </a>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-[#dcd3ca] bg-white px-5 py-3 text-sm font-semibold text-[#3f3a35]"
          >
            Close
          </button>
        </div>
      </article>
    </div>
  )
}

export default function PurchaseDashboard({
  userName,
  userEmail,
  gmailConnected,
  purchases,
}: PurchaseDashboardProps) {
  const [search, setSearch] = useState('')
  const [retailer, setRetailer] = useState('All')
  const [selected, setSelected] = useState<DashboardPurchase | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return purchases.filter((purchase) => {
      const matchesRetailer = retailer === 'All' || purchase.retailer === retailer
      const matchesQuery =
        !query ||
        purchase.productTitle.toLowerCase().includes(query) ||
        purchase.orderId.toLowerCase().includes(query) ||
        purchase.retailer.toLowerCase().includes(query)
      return matchesRetailer && matchesQuery
    })
  }, [purchases, retailer, search])

  const initial = (userName || userEmail || 'V').charAt(0).toUpperCase()

  return (
    <main className="min-h-screen bg-[#f3efe9] p-3 sm:p-5">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-[24px] border border-[#e6ddd4] bg-[#fffaf4] shadow-[0_18px_60px_rgba(71,57,45,0.08)] sm:min-h-[calc(100vh-40px)]">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-[#eee5dc] p-5 md:flex">
          <Link href="/" className="text-xl font-extrabold tracking-[-0.04em] text-[#ff625b]">vouch.</Link>

          <nav className="mt-10 space-y-2 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-[#fff0eb] px-4 py-3 font-semibold text-[#f14e47]">
              <span aria-hidden="true">▣</span> Purchases
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#605a55]">
              <SearchIcon /> Search
            </div>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-[#605a55]">
              <span aria-hidden="true">⚙</span> Settings
            </div>
          </nav>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-auto flex items-center gap-3 rounded-xl p-2 text-left transition hover:bg-[#f6efe8]"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ab8f7d] text-sm font-semibold text-white">{initial}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-[#292622]">{userName}</span>
              <span className="block max-w-32 truncate text-xs text-[#847b74]">{userEmail}</span>
            </span>
          </button>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center justify-between md:block">
                <Link href="/" className="text-lg font-extrabold text-[#ff625b] md:hidden">vouch.</Link>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#ff6b63] text-sm font-semibold text-white md:hidden">{initial}</span>
              </div>
              <h1 className="mt-6 text-3xl font-bold tracking-[-0.04em] text-[#171717] md:mt-0">Your purchases</h1>
              <p className="mt-2 text-sm text-[#746d67]">Everything Vouch found from your connected inbox.</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <label className="flex min-w-0 items-center gap-2 rounded-xl border border-[#e0d8d0] bg-white px-4 py-3 text-[#8b837c] sm:w-80">
                <SearchIcon />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search products, orders, or stores..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-[#24211f] outline-none placeholder:text-[#aaa19a]"
                />
              </label>
              <Link
                href={gmailConnected ? '/sync' : '/api/gmail/connect'}
                className="inline-flex items-center justify-center rounded-xl border border-[#e0d8d0] bg-white px-4 py-3 text-sm font-semibold text-[#4a4540]"
              >
                {gmailConnected ? 'Scan inbox' : 'Connect Gmail'}
              </Link>
            </div>
          </header>

          <div className="mt-7 flex flex-wrap gap-2">
            {['All', 'Amazon', 'Flipkart', 'Myntra', 'Meesho', 'Others'].map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setRetailer(name)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition ${
                  retailer === name
                    ? 'bg-[#ff645d] text-white shadow-sm'
                    : 'bg-[#f5efe9] text-[#645e58] hover:bg-[#eee5dd]'
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-[#e9e0d7] bg-white/55">
            {filtered.length ? (
              <div className="divide-y divide-[#eee6df]">
                {filtered.map((purchase) => (
                  <button
                    key={purchase.id}
                    type="button"
                    onClick={() => setSelected(purchase)}
                    className="grid w-full grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 text-left transition hover:bg-white sm:grid-cols-[64px_minmax(0,1fr)_120px_130px_24px] sm:px-5"
                  >
                    <span className="relative h-14 w-14 overflow-hidden rounded-xl border border-[#ece4dc] bg-white">
                      {purchase.productImage ? (
                        <Image src={purchase.productImage} alt="" fill unoptimized className="object-contain p-2" />
                      ) : (
                        <ProductPlaceholder />
                      )}
                    </span>

                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[#24211f]">{purchase.productTitle}</span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-[#817971]">
                        <span className="font-black text-black">a</span> Amazon · {formatDate(purchase.orderDate)}
                      </span>
                    </span>

                    <span className="text-right text-sm font-bold text-[#22201d] sm:text-left">
                      {formatMoney(purchase.amount, purchase.currency)}
                    </span>

                    <span className={`hidden w-fit rounded-lg px-3 py-2 text-[11px] font-semibold sm:inline-flex ${statusClasses(purchase.orderStatus)}`}>
                      {statusLabel(purchase.orderStatus)}
                    </span>

                    <span className="hidden text-xl text-[#918981] sm:block" aria-hidden="true">›</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto h-16 w-16 overflow-hidden rounded-2xl"><ProductPlaceholder /></div>
                <h2 className="mt-5 text-lg font-semibold text-[#292622]">
                  {purchases.length ? 'No matching purchases' : 'No Amazon purchases yet'}
                </h2>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#7b736c]">
                  {purchases.length
                    ? 'Try another search or retailer filter.'
                    : 'Scan Gmail to find and parse your Amazon order emails.'}
                </p>
                {!purchases.length ? (
                  <Link href={gmailConnected ? '/sync' : '/api/gmail/connect'} className="mt-5 inline-flex rounded-xl bg-[#ff645d] px-5 py-3 text-sm font-semibold text-white">
                    {gmailConnected ? 'Scan Gmail' : 'Connect Gmail'}
                  </Link>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>

      {selected ? <PurchaseModal purchase={selected} onClose={() => setSelected(null)} /> : null}
    </main>
  )
}
