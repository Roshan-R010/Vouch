'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Arvo, Cherry_Swash, DM_Sans } from 'next/font/google'

import GoogleSignInButton from '@/components/GoogleSignInButton'

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

const showcaseProducts = [
  { image: '/shoes.png', alt: 'Running shoes', rotate: '-rotate-6', offset: 'translate-x-0' },
  { image: '/watch.png', alt: 'Smart watch', rotate: 'rotate-0', offset: '-translate-y-2' },
  { image: '/backpack.png', alt: 'Backpack', rotate: 'rotate-6', offset: 'translate-x-0' },
]

export default function LoginPage() {
  return (
    <div
      className={`${dmSans.className} flex min-h-screen flex-col lg:flex-row`}
    >
      {/* Left panel */}
      <section className="relative flex flex-1 flex-col overflow-hidden bg-[#ff5961] px-8 py-10 text-white sm:px-12 lg:px-16 lg:py-14">
        <Link
          href="/"
          className={`${cherrySwash.className} text-3xl text-white`}
        >
          vouch<span className="text-white">.</span>
        </Link>

        <div className="relative z-10 mt-16 max-w-md lg:mt-24">
          <h1
            className={`${arvo.className} text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.65rem] lg:leading-[1.15]`}
          >
            Welcome back.
            <br />
            Your purchases are right where you left them.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/95 sm:text-base">
            One place for the things you&apos;ve bought. Find them again
            whenever you need.
          </p>
        </div>

        <div className="pointer-events-none absolute right-6 top-28 z-0 sm:right-10 lg:right-14 lg:top-32">
          <Image
            src="/headphones.png"
            alt=""
            width={220}
            height={220}
            className="h-auto w-[140px] rotate-[-18deg] object-contain sm:w-[180px] lg:w-[220px]"
            priority
          />
        </div>

        <div className="relative z-10 mt-auto pt-16 lg:pt-20">
          <div className="flex items-end justify-center gap-3 sm:gap-4">
            {showcaseProducts.map((product) => (
              <div
                key={product.alt}
                className={`flex h-28 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/30 bg-[#fffaf4] p-3 shadow-lg sm:h-32 sm:w-28 ${product.rotate} ${product.offset}`}
              >
                <Image
                  src={product.image}
                  alt={product.alt}
                  width={80}
                  height={80}
                  className="h-auto max-h-full w-auto max-w-full object-contain"
                />
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm font-semibold sm:text-base">
            Everything you bought. All together.
          </p>
        </div>
      </section>

      {/* Right panel */}
      <section className="flex flex-1 flex-col bg-[#fffaf4] px-6 py-10 sm:px-10 lg:px-16">
        <div className="flex justify-end text-sm text-[#374151]">
          <span>New to Vouch? </span>
          <Link
            href="/auth/login"
            className="ml-1 font-semibold text-[#ff5961] hover:underline"
          >
            Sign up
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <h2
            className={`${arvo.className} text-center text-3xl font-bold text-[#111827] sm:text-4xl`}
          >
            Welcome back{' '}
            <span className="text-[#ff5961]">to Vouch</span>
          </h2>
          <p className="mt-3 text-center text-sm text-[#6b7280] sm:text-base">
            Sign in to see all your purchases in one place.
          </p>

          <div className="mt-10">
            <GoogleSignInButton />
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e5e7eb]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wide text-[#9ca3af]">
              <span className="bg-[#fffaf4] px-3">or</span>
            </div>
          </div>

          <p className="text-center text-xs leading-relaxed text-[#9ca3af]">
            By continuing, you agree to our{' '}
            <Link href="/" className="underline hover:text-[#6b7280]">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/" className="underline hover:text-[#6b7280]">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
