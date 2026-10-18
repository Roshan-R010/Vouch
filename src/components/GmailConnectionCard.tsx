import Link from 'next/link'

type GmailConnectionCardProps = {
  connected: boolean
  status?: string
}

export default function GmailConnectionCard({
  connected,
  status,
}: GmailConnectionCardProps) {
  const message =
    status === 'connected'
      ? 'Gmail connected successfully.'
      : status === 'cancelled'
        ? 'Gmail connection was cancelled.'
        : status === 'configuration-error'
          ? 'Gmail is not configured yet. Add the Gmail OAuth credentials first.'
          : status === 'invalid-state'
            ? 'The Gmail connection expired. Please try again.'
            : status === 'connection-error'
              ? 'Gmail could not be connected. Please try again.'
              : null

  return (
    <section className="mt-8 rounded-2xl border border-[#eadfd7] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ff5961]">
            Gmail
          </p>
          <h2 className="mt-2 text-xl font-semibold text-[#111827]">
            {connected ? 'Gmail is connected' : 'Connect your Gmail'}
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#6b7280]">
            {connected
              ? 'Vouch can now read purchase-related emails when syncing is enabled.'
              : 'Give Vouch read-only access so it can find your purchase emails.'}
          </p>
        </div>

        <Link
          href={connected ? '/sync' : '/api/gmail/connect'}
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#111827] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#374151]"
        >
          {connected ? 'Scan Gmail' : 'Connect Gmail'}
        </Link>
      </div>

      {message ? (
        <p className="mt-5 rounded-lg bg-[#fff5f5] px-4 py-3 text-sm text-[#9f1239]">
          {message}
        </p>
      ) : null}
    </section>
  )
}
