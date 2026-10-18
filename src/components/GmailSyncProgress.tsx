'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

type SyncStatus = {
  syncStatus: string
  totalEmails: number
  parsedEmails: number
  lastError: string | null
}

const initialStatus: SyncStatus = {
  syncStatus: 'connecting',
  totalEmails: 0,
  parsedEmails: 0,
  lastError: null,
}

const stages = [
  { key: 'connecting', label: 'Connecting to Gmail' },
  { key: 'scanning', label: 'Scanning your emails' },
  { key: 'finding', label: 'Finding purchase emails' },
  { key: 'importing', label: 'Importing order details' },
]

function BoxIllustration() {
  return (
    <div className="relative mx-auto h-28 w-44" aria-hidden="true">
      <div className="absolute left-1/2 top-8 h-20 w-20 -translate-x-1/2 rotate-6 rounded-[28px] bg-[#fff1ec]" />
      <svg
        viewBox="0 0 120 90"
        className="absolute left-1/2 top-3 h-24 w-32 -translate-x-1/2"
        fill="none"
      >
        <path d="M35 32 61 21l27 12-27 13-26-14Z" stroke="#F24B42" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M35 32v28l26 14 27-15V33M61 46v28" stroke="#F24B42" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="m48 27 27 12" stroke="#F24B42" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="m25 25-4-5m72 0 5-5M22 49l-7 2m86-4 6 2M34 75l-4 6m61-8 4 5" stroke="#FF726A" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="absolute left-4 top-3 rotate-[-18deg] text-sm font-bold text-[#ff4f47]">Q</span>
      <span className="absolute right-5 top-8 rotate-12 text-base font-black text-[#ff5961]">M</span>
      <span className="absolute left-[72px] top-0 rounded bg-white px-1 text-lg font-black text-black shadow-sm">a</span>
      <span className="absolute right-[48px] top-1 rotate-12 rounded bg-[#ffd735] px-1 text-sm font-bold text-[#2878d0] shadow-sm">F</span>
      <span className="absolute left-[38px] top-9 -rotate-12 rounded bg-white px-1 text-xs font-bold text-[#ff4f47] shadow-sm">S</span>
    </div>
  )
}

export default function GmailSyncProgress({ userInitial }: { userInitial: string }) {
  const [status, setStatus] = useState<SyncStatus>(initialStatus)

  useEffect(() => {
    let stopped = false
    let pollTimer: ReturnType<typeof setTimeout>

    const readStatus = async () => {
      try {
        const response = await fetch('/api/gmail/sync', { cache: 'no-store' })
        if (!response.ok) throw new Error('Could not read sync status')

        const nextStatus = (await response.json()) as SyncStatus
        if (!stopped) setStatus(nextStatus)

        if (!['complete', 'error'].includes(nextStatus.syncStatus) && !stopped) {
          pollTimer = setTimeout(readStatus, 700)
        }
      } catch {
        if (!stopped) {
          setStatus((current) => ({
            ...current,
            syncStatus: 'error',
            lastError: 'The scan status could not be loaded. Please try again.',
          }))
        }
      }
    }

    const start = async () => {
      const syncRequest = fetch('/api/gmail/sync', { method: 'POST' })
      pollTimer = setTimeout(readStatus, 200)

      try {
        await syncRequest
      } finally {
        if (!stopped) void readStatus()
      }
    }

    void start()

    return () => {
      stopped = true
      clearTimeout(pollTimer)
    }
  }, [])

  const activeIndex = stages.findIndex((stage) => stage.key === status.syncStatus)
  const completed = status.syncStatus === 'complete'
  const failed = status.syncStatus === 'error'

  const progress = useMemo(() => {
    if (completed) return 100
    if (failed) return 0
    if (status.syncStatus === 'connecting') return 14
    if (status.syncStatus === 'scanning') return 34
    if (status.syncStatus === 'finding') return 58
    if (status.syncStatus === 'importing') {
      const ratio = status.totalEmails
        ? status.parsedEmails / status.totalEmails
        : 1
      return Math.min(96, Math.round(68 + ratio * 28))
    }
    return 8
  }, [completed, failed, status])

  return (
    <main className="flex min-h-screen justify-center bg-[#f5f1eb] p-3 sm:p-6">
      <section className="min-h-[calc(100vh-24px)] w-full max-w-md overflow-hidden rounded-[22px] border border-[#e9e1d8] bg-[#fffaf4] px-7 py-7 shadow-[0_20px_60px_rgba(84,66,48,0.08)] sm:min-h-[720px] sm:px-10">
        <header className="flex items-center justify-between">
          <Link href="/" className="text-sm font-extrabold tracking-tight text-[#ff5961]">
            vouch.
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6b63] text-xs font-bold text-white">
            {userInitial}
          </div>
        </header>

        <div className="mt-10 text-center">
          <BoxIllustration />
          <h1 className="mt-4 text-[22px] font-bold tracking-[-0.03em] text-[#111827]">
            {completed
              ? 'Your email scan is complete'
              : failed
                ? 'We hit a snag'
                : 'Finding your purchases...'}
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-5 text-[#6b7280]">
            {completed
              ? `We found ${status.parsedEmails} purchase-related emails ready for parsing.`
              : failed
                ? status.lastError ?? 'Gmail could not be scanned. Please try again.'
                : "We're scanning your emails and importing order details. This might take a minute."}
          </p>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#ffe5df]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${failed ? 'bg-[#ef4444]' : 'bg-[#ff746d]'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="w-9 text-right text-xs font-medium text-[#4b5563]">
            {progress}%
          </span>
        </div>

        <div className="mt-5 rounded-2xl border border-[#e7ded5] bg-white/55 px-5 py-4">
          <ol className="space-y-4">
            {stages.map((stage, index) => {
              const isDone = completed || (!failed && activeIndex > index)
              const isActive = !failed && activeIndex === index

              return (
                <li key={stage.key} className="flex items-center gap-3 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                      isDone
                        ? 'bg-[#20b77a] text-white'
                        : isActive
                          ? 'border-2 border-[#ff655d] border-r-transparent text-transparent'
                          : 'border border-[#cfc8c1] bg-white text-transparent'
                    }`}
                  >
                    {isDone ? '✓' : '•'}
                  </span>
                  <span className={isActive ? 'font-semibold text-[#111827]' : 'text-[#667085]'}>
                    {stage.label}
                    {stage.key === 'importing' && status.totalEmails > 0
                      ? ` (${status.parsedEmails}/${status.totalEmails})`
                      : ''}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>

        {completed || failed ? (
          <div className="mt-5 flex gap-3">
            {failed ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
              >
                Try again
              </button>
            ) : null}
            <Link
              href="/dashboard"
              className="flex flex-1 items-center justify-center rounded-xl bg-[#ff6b63] px-5 py-3 text-sm font-semibold text-white"
            >
              Back to dashboard
            </Link>
          </div>
        ) : (
          <div className="mt-5 flex items-center gap-4 rounded-2xl bg-[#f9f5ef] px-5 py-4">
            <span className="text-3xl" aria-hidden="true">💡</span>
            <p className="text-xs leading-5 text-[#667085]">
              You can switch tabs. We&apos;ll update this page when the scan is ready.
            </p>
          </div>
        )}
      </section>
    </main>
  )
}
