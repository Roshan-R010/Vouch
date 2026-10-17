'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">vouch.</div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-gray-700 hover:text-primary transition">How it works</a>
            <a href="#why" className="text-gray-700 hover:text-primary transition">Why vouch</a>
            <a href="#signin" className="text-gray-700 hover:text-primary transition">Sign in</a>
          </div>
          <Link
            href="/auth/login"
            className="bg-gray-900 text-white px-6 py-2 rounded-full hover:bg-gray-800 transition flex items-center gap-2"
          >
            Get started <span>→</span>
          </Link>
        </div>
      </nav>

      {/* Main Hero Section */}
      <div className="pt-20 grid md:grid-cols-2 gap-0 min-h-screen">
        {/* Left Side - Red Background */}
        <div className="bg-primary relative overflow-hidden flex flex-col justify-center items-center px-8">
          {/* Decorative Elements - Left Side */}
          <div className="absolute top-20 left-10 transform -rotate-12 drop-shadow-lg">
            <Image
              src="/bill.png"
              alt="Receipt"
              width={120}
              height={140}
              className="w-32"
            />
          </div>

          <div className="absolute top-40 right-20 transform rotate-12">
            <Image
              src="/shopify-logo.png"
              alt="Shopify"
              width={100}
              height={80}
              className="w-24"
            />
          </div>

          <div className="absolute bottom-20 right-10 drop-shadow-lg">
            <Image
              src="/amazon-box.png"
              alt="Amazon Box"
              width={150}
              height={120}
              className="w-40"
            />
          </div>

          <div className="absolute bottom-32 left-20 transform -rotate-6">
            <Image
              src="/shoes.png"
              alt="Running Shoes"
              width={120}
              height={80}
              className="w-28"
            />
          </div>

          {/* Center Content */}
          <div className="relative z-10 text-center max-w-md">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Your purchases deserve a place of their own.
            </h1>
            <p className="text-gray-800 text-lg mb-8">
              Your orders are already sitting in your inbox. Vouch finds supported purchases and brings them together.
            </p>
          </div>

          {/* Decorative text - top right */}
          <div className="absolute top-40 right-4 text-gray-800 text-sm font-semibold tracking-wide rotate-12">
            <div>FROM</div>
            <div>INBOX</div>
            <div>TO HERE.</div>
            <div className="text-2xl mt-2">✓</div>
          </div>
        </div>

        {/* Right Side - White Background */}
        <div className="bg-white relative overflow-hidden flex flex-col justify-center items-center px-8 py-12">
          {/* Top Logo and Text */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">vouch.</h2>
            <p className="text-gray-600">Everything you bought. All together.</p>
          </div>

          {/* Purchase Cards Grid */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-md">
            {/* Card 1 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              <div className="mb-3 h-24 flex items-center justify-center bg-gray-50 rounded">
                <Image
                  src="/headphones.png"
                  alt="Sony Headphones"
                  width={80}
                  height={80}
                  className="max-h-20 w-auto"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Sony Headphones</h3>
              <p className="text-primary font-bold mb-2">₹2,499</p>
              <div className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                In warranty
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              <div className="mb-3 h-24 flex items-center justify-center bg-gray-50 rounded">
                <Image
                  src="/watch.png"
                  alt="Smart Watch"
                  width={80}
                  height={80}
                  className="max-h-20 w-auto"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Smart Watch</h3>
              <p className="text-primary font-bold mb-2">₹3,999</p>
              <div className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                Warranty expired
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              <div className="mb-3 h-24 flex items-center justify-center bg-gray-50 rounded">
                <Image
                  src="/shoes.png"
                  alt="Running Shoes"
                  width={80}
                  height={80}
                  className="max-h-20 w-auto"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">Running Shoes</h3>
              <p className="text-primary font-bold mb-2">₹2,999</p>
              <div className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                Delivered
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition">
              <div className="mb-3 h-24 flex items-center justify-center bg-gray-50 rounded">
                <Image
                  src="/backpack.png"
                  alt="The North Face Backpack"
                  width={80}
                  height={80}
                  className="max-h-20 w-auto"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-sm mb-1">The North Face Backpack</h3>
              <p className="text-primary font-bold mb-2">₹4,499</p>
              <div className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                In warranty
              </div>
            </div>
          </div>

          {/* Logo Badges - Bottom Right */}
          <div className="absolute bottom-20 right-8 flex flex-col gap-4">
            <div className="w-24">
              <Image
                src="/ebay-logo.png"
                alt="eBay"
                width={100}
                height={40}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
