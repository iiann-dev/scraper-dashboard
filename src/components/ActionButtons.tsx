import { Globe, MapPin, Phone, PhoneOff } from 'lucide-react'
import { guessRegion, hasPhone, hasWebsite, telUrl, whatsappUrl } from '../lib/helpers'
import type { Lead } from '../lib/types'

function WhatsAppGlyph({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2a9.87 9.87 0 0 0-8.5 14.75L2 22l5.4-1.5A9.87 9.87 0 1 0 12.04 2Zm0 1.8a8.07 8.07 0 1 1-4.1 14.98l-.3-.18-3.2.88.9-3.1-.2-.32a8.07 8.07 0 0 1 6.9-12.26Zm-3.5 4.02c-.2 0-.5.07-.75.35-.26.28-1 1-1 2.4s1.02 2.78 1.17 2.97c.14.2 2 3.1 4.85 4.3.9.35 1.6.56 2.15.72.9.26 1.72.22 2.37.13.72-.1 2.22-.9 2.53-1.78.3-.87.3-1.62.2-1.78-.09-.15-.35-.23-.73-.4l-.02-.01c-1.12-.55-2.63-1.3-2.63-1.3-.2-.08-.41-.11-.6-.11-.2 0-.63.06-.95.47-.3.4-1.18 1.44-1.44 1.74-.26.29-.52.32-.72.18l-.06-.04c-.76-.44-1.42-.83-1.98-1.4-.54-.55-.86-1.24-1.16-1.94-.2-.4 0-.61.15-.8.13-.16.3-.38.44-.57.15-.2.2-.32.29-.52.1-.2.05-.38-.02-.53l-.05-.1c-.26-.6-.58-1.47-.88-2.34-.1-.42-.4-.6-.73-.6h-.64Z" />
    </svg>
  )
}

const BTN =
  'inline-flex h-7 items-center gap-1.5 rounded-md border px-2 text-[12px] font-medium transition'

export default function ActionButtons({ lead }: { lead: Lead }) {
  const web = hasWebsite(lead)
  const phone = hasPhone(lead)
  const region = guessRegion(lead.phone)
  const showWa = region === 'id' || region === 'au'
  const tel = telUrl(lead.phone)
  const wa = showWa ? whatsappUrl(lead.phone) : null
  const rawWeb = (lead.website ?? '').trim()
  const webHref = /^https?:\/\//i.test(rawWeb) ? rawWeb : `https://${rawWeb}`
  const webLabel = rawWeb.replace(/^https?:\/\//i, '').replace(/\/$/, '')

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {lead.place_url ? (
        <a
          href={lead.place_url}
          target="_blank"
          rel="noreferrer"
          title="Open in Google Maps"
          className={`${BTN} border-border bg-surface-elevated text-text-secondary hover:border-accent/50 hover:text-accent`}
        >
          <MapPin className="h-3.5 w-3.5" />
          Maps
        </a>
      ) : null}

      {web ? (
        <a
          href={webHref}
          target="_blank"
          rel="noreferrer"
          title={rawWeb}
          className={`${BTN} max-w-44 truncate border-border bg-surface-elevated text-accent hover:border-accent/50 hover:bg-surface-pop`}
        >
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{webLabel}</span>
        </a>
      ) : (
        <span
          title="This business has no website yet — your pitch"
          className="inline-flex h-7 items-center rounded-md border border-orange-400/30 bg-orange-400/5 px-2 text-[12px] text-orange-300/90"
        >
          No website yet
        </span>
      )}

      {phone && tel ? (
        <>
          <a
            href={tel}
            title={`Call ${lead.phone}`}
            className={`${BTN} border-border bg-surface-elevated text-text-secondary hover:border-accent/50 hover:text-accent`}
          >
            <Phone className="h-3.5 w-3.5" />
            <span className="tnum">{lead.phone}</span>
          </a>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              title={`Chat on WhatsApp: ${lead.phone}`}
              className="inline-flex h-7 items-center gap-1 rounded-md bg-emerald-500 px-2 text-[12px] font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              <WhatsAppGlyph className="h-3.5 w-3.5" />
              Chat
            </a>
          ) : null}
        </>
      ) : (
        <span
          title="No phone number on record"
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-surface-elevated px-2 text-[12px] text-text-tertiary"
        >
          <PhoneOff className="h-3.5 w-3.5" />
          No phone
        </span>
      )}
    </div>
  )
}
