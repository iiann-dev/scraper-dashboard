import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { springs, motionTokens } from '../lib/motion-tokens'
import { Copy, Globe, MapPin, Phone, PhoneOff, Share2, Check, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { isHot, hasWebsite, whatsappUrl, telUrl, timeAgo } from '../lib/helpers'
import { STATUS_ORDER, prettyCategory, type Lead, type LeadStatus } from '../lib/types'
import { STATUS_META } from './StatusPill'

const cleanAddress = (addr: string): string => {
  if (!addr) return ''
  let clean = addr
  // Strip the "Business NameAddress" scraper artifact
  clean = clean.replace(/^.*?(?=[\d]|St|St\.|Street|Ave|Avenue|Rd|Road|Blvd|Ln|Lane|Pl|Place|Sq|Square)\s*/, '')
  // Collapse common scraping noise markers
  clean = clean
    .replace(/([a-zA-Z])\1{5,}/g, '$1')
    .replace(/\n\s*\n/g, ' ')
    .replace(/Closed\s*$/i, '')
    .replace(/Open.*?$/i, '')
    .replace(/(.+?)\1+$/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  // Strip trailing repeated chars
  if (clean && clean.length > 5 && /(.)\1{4,}$/.test(clean)) {
    clean = clean.replace(/(.)\1+$/, '')
  }
  return clean
}

export default function ProspectDrawer({
  lead,
  onClose,
  onUpdateStatus,
  onSaveNotes,
  onPrevLead,
  onNextLead,
  hasPrev = false,
  hasNext = false,
}: {
  lead: Lead | null
  onClose: () => void
  onUpdateStatus: (id: number, s: LeadStatus) => void
  onSaveNotes: (id: number, notes: string) => Promise<void>
  onPrevLead?: () => void
  onNextLead?: () => void
  hasPrev?: boolean
  hasNext?: boolean
}) {
  // Hooks must be called unconditionally — even when lead is null
  const [notesDraft, setNotesDraft] = useState<string>(lead?.notes ?? '')
  const [savingNotes, setSavingNotes] = useState(false)
  const [notesSuccess, setNotesSuccess] = useState(false)
  const [copiedId, setCopiedId] = useState(false)
  const [copiedAddress, setCopiedAddress] = useState(false)

  useEffect(() => {
    if (lead) {
      setNotesDraft(lead.notes ?? '')
      setNotesSuccess(false)
    }
  }, [lead])

  if (!lead) return null

  const hot = isHot(lead)
  const withWeb = hasWebsite(lead)
  const wa = whatsappUrl(lead.phone)
  const tel = telUrl(lead.phone)
  const statusMeta = STATUS_META[lead.status]

  const copyId = () => {
    navigator.clipboard.writeText(`#PLC-${lead.id}`)
    setCopiedId(true)
    setTimeout(() => setCopiedId(false), 1500)
  }

  const copyAddress = (addr: string) => {
    const clean = cleanAddress(addr || '')
    navigator.clipboard.writeText(clean)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 1500)
  }

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/70 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={springs.release}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-surface-elevated border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              className="p-5 bg-surface-elevated border-b border-border flex items-start justify-between gap-3"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: motionTokens.duration.normal }}
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[12px] font-bold text-accent flex items-center gap-1">
                    #PLC-{lead.id}
                    <button
                      type="button"
                      onClick={copyId}
                      className="text-text-tertiary hover:text-text-primary"
                      title="Copy ID"
                    >
                      {copiedId ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold flex items-center gap-1.5 ${statusMeta.bg} ${statusMeta.border} ${statusMeta.text}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                    {statusMeta.label}
                  </span>
                  {hot && (
                    <span className="px-2 py-0.5 rounded-full bg-orange-400/10 text-orange-300 border border-orange-400/30 text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">
                        local_fire_department
                      </span>
                      Hot Pitch
                    </span>
                  )}
                </div>

                <h2 className="font-display text-lg font-bold text-text-primary mt-1.5 leading-snug">
                  {lead.name}
                </h2>
                <div className="flex items-center gap-2 text-[12px] text-text-tertiary mt-0.5">
                  <span>{prettyCategory(lead.category)}</span>
                  {lead.rating && (
                    <>
                      <span>.</span>
                      <span className="text-amber-400 font-bold flex items-center gap-0.5">
                        ★ {lead.rating}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-surface-elevated hover:bg-surface-pop flex items-center justify-center text-text-tertiary hover:text-text-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4.5">
              {/* Location & Maps Card */}
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: motionTokens.duration.normal }}
                className="rounded-xl overflow-hidden bg-surface-elevated border border-border p-3.5 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent" />
                    Location & Google Maps
                  </span>
                  {lead.place_url && (
                    <a
                      href={lead.place_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>Open Maps</span>
                      <Share2 className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>

                {/* Clean address text */}
                {lead.address ? (
                  <div className="flex flex-col gap-1.5">
                    <p className="text-[13.5px] text-text-secondary leading-relaxed font-mono">
                      {cleanAddress(lead.address)}
                    </p>
                    <button
                      type="button"
                      onClick={() => copyAddress(lead.address ?? '')}
                      className="self-start inline-flex items-center gap-1 text-[11px] text-text-tertiary hover:text-text-primary transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress ? (
                        <>
                          <Check className="h-4 w-4 text-success" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          <span>Copy Address</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 py-2">
                    <p className="text-[12px] text-text-tertiary italic">
                      Address not available in scraper data.
                    </p>
                    <p className="text-[11.5px] text-text-tertiary">
                      Open Google Maps to see the exact location.
                    </p>
                  </div>
                )}

                {/* Mini Map Thumbnail */}
                {lead.address && (
                  <div
                    className="w-full h-28 rounded-lg bg-cover bg-center flex items-end p-2 bg-gray-800"
                    style={{
                      backgroundImage: `url('https://maps.googleapis.com/maps/api/staticmap?size=600x160&maptype=roadmap&markers=color:blue|size:mid|label:A|${encodeURIComponent(lead.address)})')`,
                    }}
                  >
                    <div className="bg-surface-elevated px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span
                        className="text-[11.5px] text-text-secondary truncate max-w-[220px] leading-tight"
                        title={lead.address}
                      >
                        {cleanAddress(lead.address).split(',').slice(0, 3).join(',')}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Quick Outreach Action Dial Pad */}
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: motionTokens.duration.normal }}
                className="bg-surface-elevated p-4 rounded-xl border border-border flex flex-col gap-3"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  Contact & Quick Outreach
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {wa ? (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-[12.5px] flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chat
                      </span>
                      <span>WhatsApp Lead</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="h-10 px-3 rounded-xl bg-surface-pop text-text-tertiary text-[12px] font-medium flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        chat
                      </span>
                      <span>No WhatsApp</span>
                    </button>
                  )}

                  {tel ? (
                    <a
                      href={tel}
                      className="h-10 px-3 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground font-semibold text-[12.5px] flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Phone className="h-4 w-4" />
                      <span>Call Directly</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="h-10 px-3 rounded-xl bg-surface-pop text-text-tertiary text-[12px] font-medium flex items-center justify-center gap-1.5 opacity-50 cursor-not-allowed"
                    >
                      <PhoneOff className="h-4 w-4" />
                      <span>No Phone</span>
                    </button>
                  )}
                </div>

                {lead.phone && (
                  <div className="flex items-center justify-between text-[12px] px-3 py-2 rounded-lg bg-surface-pop text-text-secondary">
                    <span className="text-text-tertiary">Phone Number:</span>
                    <span className="font-mono font-bold text-text-primary tnum">
                      {lead.phone}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Website Status & Opportunity Pitch Card */}
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: motionTokens.duration.normal }}
                className={`p-4 rounded-xl border flex flex-col gap-2 ${
                  withWeb
                    ? 'bg-surface-elevated border-border'
                    : 'bg-surface-elevated border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1.5">
                    <Globe className="h-4 w-4 text-accent" />
                    Business Website Status
                  </span>
                  {withWeb ? (
                    <span className="text-[11px] font-bold text-success bg-success-bg px-2 py-0.5 rounded-full border border-success-border">
                      Website Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                      High Potential
                    </span>
                  )}
                </div>

                {withWeb ? (
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <a
                      href={
                        /^https?:\/\//i.test(lead.website!)
                          ? lead.website!
                          : `https://${lead.website}`
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] font-semibold text-accent hover:underline truncate"
                    >
                      {lead.website}
                    </a>
                    <Share2 className="h-4 w-4 text-text-tertiary shrink-0" />
                  </div>
                ) : (
                  <div className="mt-1 flex flex-col gap-1.5">
                    <p className="text-[12.5px] font-bold text-amber-300 leading-snug">
                      This business has no website yet!
                    </p>
                    <p className="text-[12px] text-text-secondary leading-relaxed">
                      High rating ({lead.rating ?? 'excellent'}) on Google Maps but
                      no portfolio website. Great opportunity for landing page &
                      digital branding services.
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Pipeline Stage Quick Changer */}
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: motionTokens.duration.normal }}
                className="bg-surface-elevated p-4 rounded-xl border border-border flex flex-col gap-2.5"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                  Update Pipeline Stage
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {STATUS_ORDER.map((st) => {
                    const active = lead.status === st
                    const meta = STATUS_META[st]
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onUpdateStatus(lead.id, st)}
                        className={`px-3 py-2 rounded-xl text-[12px] font-semibold flex items-center justify-between border transition-all ${
                          active
                            ? 'bg-accent text-accent-foreground border-accent shadow-md shadow-accent/20'
                            : 'bg-surface-pop hover:bg-surface-pop text-text-secondary border-border'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : meta.dot}`} />
                          <span className="capitalize">{meta.label}</span>
                        </div>
                        {active && <Check className="h-4 w-4" />}
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Sales Notes Editor */}
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: motionTokens.duration.normal }}
                className="bg-surface-elevated p-4 rounded-xl border border-border flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px] text-violet-400">
                      sticky_note_2
                    </span>
                    Sales Notes
                  </span>
                  {notesSuccess && (
                    <span className="text-[11px] font-bold text-success flex items-center gap-0.5">
                      <Check className="h-3.5 w-3.5" /> Saved!
                    </span>
                  )}
                </div>

                <textarea
                  rows={3}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  placeholder="Owner asked for a price quote — follow up next Friday..."
                  className="w-full p-2.5 rounded-xl bg-surface-pop text-text-primary placeholder:text-text-tertiary text-[12.5px] border border-border focus:border-accent focus:outline-none resize-none"
                />

                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    disabled={savingNotes}
                    onClick={() => {
                      setSavingNotes(true)
                      onSaveNotes(lead.id, notesDraft.trim())
                        .then(() => {
                          setNotesSuccess(true)
                          setTimeout(() => setNotesSuccess(false), 2000)
                        })
                        .finally(() => setSavingNotes(false))
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-accent text-accent-foreground text-[12px] font-semibold flex items-center gap-1 transition-colors disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      save
                    </span>
                    <span>{savingNotes ? 'Saving...' : 'Save Notes'}</span>
                  </button>
                </div>
              </motion.div>

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: motionTokens.distance.sm }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: motionTokens.duration.normal }}
                className="text-[11.5px] text-text-tertiary flex flex-col gap-1 px-1"
              >
                <div className="flex justify-between">
                  <span>Last Touched:</span>
                  <span className="text-text-secondary font-medium">
                    {lead.last_touched_at ? timeAgo(lead.last_touched_at) : 'Never'}
                  </span>
                </div>
                {lead.tags && lead.tags.length > 0 && (
                  <div className="flex justify-between">
                    <span>Tags:</span>
                    <span className="text-text-secondary font-medium">
                      {lead.tags.join(', ')}
                    </span>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Footer Navigation */}
            <motion.div
              className="p-3.5 bg-surface-elevated border-t border-border flex items-center justify-between gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: motionTokens.duration.normal }}
            >
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={onPrevLead}
                  className="h-8 px-3 rounded-lg bg-surface-pop hover:bg-surface-elevated text-text-secondary text-[12px] font-medium border border-border disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={onNextLead}
                  className="h-8 px-3 rounded-lg bg-surface-pop hover:bg-surface-elevated text-text-secondary text-[12px] font-medium border border-border disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-8 px-4 rounded-lg bg-surface-pop hover:bg-surface-elevated text-text-primary text-[12px] font-semibold border border-border transition-colors"
              >
                Close
              </button>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

