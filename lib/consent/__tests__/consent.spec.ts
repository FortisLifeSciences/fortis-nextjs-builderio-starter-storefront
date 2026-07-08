import { getConsent, hasAnalyticsConsent, hasAdvertisingConsent, onConsentChange } from '../consent'

describe('consent module', () => {
  afterEach(() => {
    window.localStorage.clear()
  })

  const seed = (value: unknown) => window.localStorage.setItem('sp_consent', JSON.stringify(value))

  describe('getConsent (fail-closed)', () => {
    it('returns false when sp_consent is missing', () => {
      expect(getConsent('Analytics')).toBe(false)
      expect(hasAnalyticsConsent()).toBe(false)
    })

    it('returns false when sp_consent is malformed JSON', () => {
      window.localStorage.setItem('sp_consent', '{not valid json')
      expect(getConsent('Analytics')).toBe(false)
    })

    it('returns false when sp_consent is not an array', () => {
      seed({ ComplianceType: 'Analytics', ConsentGiven: true })
      expect(getConsent('Analytics')).toBe(false)
    })

    it('returns false when the matching category is denied', () => {
      seed([{ ComplianceType: 'Analytics', ConsentGiven: false }])
      expect(getConsent('Analytics')).toBe(false)
    })

    it('returns false when the category is absent', () => {
      seed([{ ComplianceType: 'Advertising', ConsentGiven: true }])
      expect(getConsent('Analytics')).toBe(false)
    })

    it('returns true only when the matching category is explicitly granted', () => {
      seed([
        { ComplianceType: 'Analytics', ConsentGiven: true },
        { ComplianceType: 'Advertising', ConsentGiven: false },
      ])
      expect(hasAnalyticsConsent()).toBe(true)
      expect(hasAdvertisingConsent()).toBe(false)
    })

    it('matches category names case-insensitively and via synonyms', () => {
      seed([
        { ComplianceType: 'STATISTICS', ConsentGiven: true },
        { ComplianceType: 'Marketing', ConsentGiven: true },
      ])
      expect(hasAnalyticsConsent()).toBe(true)
      expect(hasAdvertisingConsent()).toBe(true)
    })
  })

  describe('onConsentChange', () => {
    it('fires the callback when Secure Privacy saves a banner choice', () => {
      const cb = jest.fn()
      const off = onConsentChange(cb)

      window.dispatchEvent(new Event('sp_cookie_banner_save'))
      window.dispatchEvent(new Event('sp_privacy_banner_save'))

      expect(cb).toHaveBeenCalledTimes(2)
      off()
    })

    it('stops firing after unsubscribe', () => {
      const cb = jest.fn()
      const off = onConsentChange(cb)
      off()

      window.dispatchEvent(new Event('sp_cookie_banner_save'))

      expect(cb).not.toHaveBeenCalled()
    })
  })
})
