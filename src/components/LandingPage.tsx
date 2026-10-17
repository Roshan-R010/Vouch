'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Arvo, Cherry_Swash, DM_Sans } from 'next/font/google'

// Fonts
const arvo = Arvo({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const cherrySwash = Cherry_Swash({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Dashboard products
const products = [
  {
    name: 'Sony Headphones',
    price: '₹2,499',
    image: '/headphones.png',
    status: 'In warranty',
    statusStyle: 'bg-[#b8efc4] text-[#205832]',
  },
  {
    name: 'Smart Watch',
    price: '₹3,999',
    image: '/watch.png',
    status: 'Warranty expired',
    statusStyle: 'bg-[#f5c0ba] text-[#852f2a]',
  },
  {
    name: 'Running Shoes',
    price: '₹2,999',
    image: '/shoes.png',
    status: 'Delivered',
    statusStyle: 'bg-[#b8efc4] text-[#205832]',
  },
  {
    name: 'Backpack',
    price: '₹1,499',
    image: '/backpack.png',
    status: 'In warranty',
    statusStyle: 'bg-[#b8efc4] text-[#205832]',
  },
]

export default function LandingPage() {
  return (
    <div
      className={`${dmSans.className} min-h-screen overflow-x-clip bg-[#ff5961] text-[#111827]`}
    >
      {/* Floating Navbar */}
      <nav className="fixed left-4 right-4 top-4 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-3 text-black shadow-md md:px-8">
          {/* Brand */}
          <Link
            href="/"
            className={`${cherrySwash.className} shrink-0 text-2xl !text-black`}
          >
            vouch<span className="text-[#ff5961]">.</span>
          </Link>

          {/* Navigation Links */}
          <div
            className={`${arvo.className} hidden items-center gap-8 text-sm md:flex`}
          >
            <a
              href="#how"
              className="!text-black transition hover:opacity-60"
            >
              How it works
            </a>

            <a
              href="#why"
              className="!text-black transition hover:opacity-60"
            >
              Why vouch
            </a>

            <a
              href="#signin"
              className="!text-black transition hover:opacity-60"
            >
              Sign in
            </a>
          </div>

          {/* Get Started Button */}
          <Link
            href="/auth/login"
            className={`${arvo.className} flex shrink-0 items-center gap-3 rounded-xl border border-black bg-white px-4 py-2 text-sm !text-black transition hover:bg-gray-100 sm:px-5`}
          >
            Get started
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="relative isolate min-h-[1000px] overflow-hidden bg-[#ff5961] px-4 pb-10 pt-24 sm:px-6 md:px-10">
          {/* Main Heading */}
          <div className="relative z-20 mx-auto max-w-2xl pt-8 text-center sm:pt-10 md:pt-12">
            <h1
              className={`${arvo.className} mx-auto mb-5 max-w-[620px] text-2xl font-bold leading-tight text-[#111827] sm:text-3xl md:text-4xl`}
            >
              Your purchases deserve a
              <br />
              place of their own.
            </h1>

            <p className="mx-auto max-w-xl text-sm leading-relaxed text-[#111827] sm:text-base md:text-lg">
              Your orders are already sitting in your inbox. Vouch finds
              supported purchases and brings them together.
            </p>
          </div>

          {/* Shopify Logo */}
          {/* Above receipt, below dashboard */}
          <div className="absolute left-[7%] top-[38%] z-[15] -rotate-12 md:left-[7%]">
            <Image
              src="/shopify-logo.png"
              alt="Shopify"
              width={85}
              height={85}
              className="h-auto w-16 sm:w-20"
            />
          </div>

          {/* Receipt — behind dashboard */}
          <div className="absolute left-[10%] top-[430px] z-10 -rotate-[14deg]">
            <Image
              src="/bill.png"
              alt="Purchase receipt"
              width={250}
              height={350}
              className="h-auto w-[clamp(150px,16vw,250px)] drop-shadow-sm"
            />
          </div>

          {/* Inbox Annotation and Flipkart Logo */}
          <div className="absolute right-[4%] top-[27%] z-10 sm:right-[5%] md:right-[4%]">
            <div
              className={`${arvo.className} mb-2 rotate-[-5deg] text-center text-xs leading-6 text-black sm:text-sm`}
            >
              <div>FROM</div>
              <div>INBOX</div>
              <div>TO HERE.</div>
              <div className="text-xl">↙</div>
            </div>

            {/* Uploaded Flipkart logo: text and icon together */}
            <div className="flex rotate-[-8deg] items-center justify-center rounded-xl bg-white px-3 py-3 shadow-sm sm:px-4">
              <Image
                src="/flipkart-logo.png"
                alt="Flipkart"
                width={150}
                height={60}
                className="h-auto w-[120px] object-contain sm:w-[140px]"
              />
            </div>
          </div>

          {/* Amazon Box — behind dashboard */}
          <div className="absolute right-[12%] top-[52%] z-10">
            <Image
              src="/amazon-box.png"
              alt="Amazon package"
              width={300}
              height={252}
              className="h-auto w-[clamp(160px,18vw,300px)] object-contain"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>

          {/* Central Purchase Dashboard */}
          <div className="absolute left-1/2 top-[420px] z-20 w-[94%] -translate-x-1/2 sm:w-[88%] md:top-[46%] md:w-[46vw] md:max-w-[700px]">
            {/* Dashboard Background */}
            <div className="rounded-2xl border border-[#b9a999] bg-[#eee0cf] p-4 shadow-xl sm:p-5 md:p-6">
              {/* Dashboard Brand */}
              <h2
                className={`${cherrySwash.className} mb-5 text-center text-2xl font-normal text-[#171717] sm:mb-6 sm:text-[27px]`}
              >
                vouch.
              </h2>

              {/* Product Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {products.map((product) => (
                  <div
                    key={product.name}
                    className="flex min-h-[108px] min-w-0 items-center gap-2 rounded-xl border border-[#f0e8df] bg-[#fffaf4] p-3 transition hover:shadow-md sm:min-h-[120px] sm:gap-3 sm:p-4"
                  >
                    {/* Larger Product Image */}
                    <div className="flex h-14 w-12 shrink-0 items-center justify-center sm:h-[68px] sm:w-[60px]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={80}
                        height={80}
                        className="h-auto max-h-full w-auto max-w-full object-contain"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[11px] font-bold leading-snug text-[#171717] sm:text-sm">
                        {product.name}
                      </h3>

                      <p className="mt-1 text-xs font-bold text-[#171717] sm:text-sm">
                        {product.price}
                      </p>

                      {/* Warranty / Delivery Status */}
                      <span
                        className={`mt-2 inline-block max-w-full truncate rounded-full px-2 py-1 text-[8px] leading-tight sm:text-[10px] ${product.statusStyle}`}
                      >
                        <span aria-hidden="true">● </span>
                        {product.status}
                      </span>
                    </div>

                    {/* Arrow */}
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-sm font-bold text-black"
                    >
                      ›
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}