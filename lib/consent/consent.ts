'use client'

export type ConsentCategory = 'Analytics' | 'Advertising' | 'Functional'

type SpConsentEntry = { ComplianceType?: string; ConsentGiven?: boolean }

const SP_CONSENT_KEY = 'sp_consent'

const SP_CONSENT_EVENTS = ['sp_cookie_banner_save', 'sp_privacy_banner_save', 'sp_init']

const CATEGORY_ALIASES: Record<ConsentCategory, string[]> = {
  Analytics: ['analytics', 'statistics', 'performance'],
  Advertising: ['advertising', 'marketing', 'targeting', 'ads'],
  Functional: ['functional', 'functionality', 'preferences'],
}

function readEntries(): SpConsentEntry[] | null {
  try {
    const raw = window.localStorage.getItem(SP_CONSENT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function getConsent(category: ConsentCategory): boolean {
  if (typeof window === 'undefined') return false
  const entries = readEntries()
  if (!entries) return false
  const aliases = CATEGORY_ALIASES[category]
  return entries.some(
    (c) => c?.ConsentGiven === true && aliases.includes(String(c?.ComplianceType).toLowerCase())
  )
}

export const hasAnalyticsConsent = (): boolean => getConsent('Analytics')
export const hasAdvertisingConsent = (): boolean => getConsent('Advertising')

export function onConsentChange(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  const handler = () => cb()
  const storageHandler = (e: StorageEvent) => {
    if (e.key === SP_CONSENT_KEY) cb()
  }

  SP_CONSENT_EVENTS.forEach((evt) => window.addEventListener(evt, handler))
  window.addEventListener('storage', storageHandler)

  return () => {
    SP_CONSENT_EVENTS.forEach((evt) => window.removeEventListener(evt, handler))
    window.removeEventListener('storage', storageHandler)
  }
}
