/* eslint-disable testing-library/no-node-access */
import { builder } from '@builder.io/react'
import { render, cleanup } from '@testing-library/react'

import ConsentGatedScripts from '../ConsentGatedScripts'

jest.mock('@builder.io/react', () => ({ builder: { canTrack: true } }))

const seedConsent = (entries: Array<{ ComplianceType: string; ConsentGiven: boolean }>) =>
  window.localStorage.setItem('sp_consent', JSON.stringify(entries))

const clarityScript = () => document.querySelector('script[src*="clarity.ms"]')
const hubspotScript = () => document.getElementById('hs-script-loader')

describe('ConsentGatedScripts', () => {
  beforeEach(() => {
    document.head.appendChild(document.createElement('script'))
  })

  afterEach(() => {
    cleanup()
    window.localStorage.clear()
    delete (window as Window & { clarity?: unknown }).clarity
    clarityScript()?.remove()
    hubspotScript()?.remove()
  })

  it('loads nothing and disables Builder tracking without consent', () => {
    render(<ConsentGatedScripts />)
    expect(clarityScript()).toBeNull()
    expect(hubspotScript()).toBeNull()
    expect(builder.canTrack).toBe(false)
  })

  it('enables Clarity + Builder with Analytics consent but not HubSpot without Advertising consent', () => {
    seedConsent([{ ComplianceType: 'Analytics', ConsentGiven: true }])
    render(<ConsentGatedScripts />)
    expect(clarityScript()).not.toBeNull()
    expect(builder.canTrack).toBe(true)
    expect(hubspotScript()).toBeNull()
  })

  it('loads HubSpot only when both Analytics and Advertising consent are present', () => {
    seedConsent([
      { ComplianceType: 'Analytics', ConsentGiven: true },
      { ComplianceType: 'Advertising', ConsentGiven: true },
    ])
    render(<ConsentGatedScripts />)
    expect(clarityScript()).not.toBeNull()
    expect(hubspotScript()).not.toBeNull()
  })
})
