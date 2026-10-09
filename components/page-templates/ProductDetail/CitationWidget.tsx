import React, { useEffect, useRef, useState } from 'react'

interface CitationWidgetProps {
  citeabProductCode: string | null
  variantProductName: string
  citationApiKey: string | null
}

let citeAbScriptPromise: Promise<void> | null = null

const loadCiteAbScript = () => {
  if (citeAbScriptPromise) return citeAbScriptPromise

  citeAbScriptPromise = new Promise<void>((resolve, reject) => {
    if (customElements.get('citeab-widget')) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://widget-v3.citeab.com/widget.js'
    script.onload = () => resolve()
    script.onerror = (error) => reject(error)
    document.body.appendChild(script)
  })

  return citeAbScriptPromise
}

const CitationWidget: React.FC<CitationWidgetProps> = ({
  citeabProductCode,
  variantProductName,
  citationApiKey,
}) => {
  const widgetRef = useRef<HTMLElement>(null)
  const [citationCount, setCitationCount] = useState<string | null>(null)

  useEffect(() => {
    if (citeabProductCode && citationApiKey) {
      loadCiteAbScript().catch((error) => {
        console.error('Error loading CiteAb widget script:', error)
      })
    }
  }, [citeabProductCode, citationApiKey])

  useEffect(() => {
    if (window.location.hash === '#citations') {
      const section = document.getElementById('citation-document-section')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [])

  useEffect(() => {
    if (!citeabProductCode || !citationApiKey) return

    let attempts = 0
    const maxAttempts = 40
    const interval = window.setInterval(() => {
      attempts += 1
      const count = widgetRef.current?.dataset.citationCount
      if (count !== undefined) {
        setCitationCount(count)
        window.clearInterval(interval)
      } else if (attempts >= maxAttempts) {
        window.clearInterval(interval)
      }
    }, 500)

    return () => window.clearInterval(interval)
  }, [citeabProductCode, citationApiKey])

  if (!citeabProductCode || !citationApiKey) {
    return null
  }

  return (
    <div id="citation-document-section" style={{ width: '100%' }}>
      {React.createElement('citeab-widget', {
        ref: widgetRef,
        'api-key': citationApiKey,
        code: citeabProductCode,
        company: 'fortis-life-sciences',
      } as any)}
      {citationCount !== null && (
        <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
          {citationCount} citations found for {variantProductName}
        </p>
      )}
      <a
        href={`https://www.citeab.com/reagents/fortis-life-sciences/${citeabProductCode}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        View citations for {variantProductName} on CiteAb.
      </a>
    </div>
  )
}

export default CitationWidget
