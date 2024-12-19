import React, { useEffect } from 'react'

interface CitationWidgetProps {
  citeabProductCode: string | null
  variantProductName: string
  citationApiKey: string | null
}

const loadCiteAbScript = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://widget.citeab.com/assets/citation_v2.js'
    script.async = true
    script.onload = () => {
      resolve()
    }
    script.onerror = (error) => {
      reject(error)
    }
    document.body.appendChild(script)
  })
}

const CitationWidget: React.FC<CitationWidgetProps> = ({
  citeabProductCode,
  variantProductName,
  citationApiKey,
}) => {
  useEffect(() => {
    if (citeabProductCode && citationApiKey) {
      loadCiteAbScript()
        .then(() => {
          if (window.CiteAbWidget) {
            window.CiteAbWidget.init({
              apiKey: citationApiKey, // Replace with API key
              companySlug: 'fortis-life-sciences', // Replace with company slug
              productId: citeabProductCode,
            })
          }
        })
        .catch((error) => {
          console.error('Error loading CiteAb script:', error)
        })
    }
  }, [citeabProductCode])

  // Return nothing if the script hasn't loaded or required props are not provided
  if (!citeabProductCode || !citationApiKey) {
    return null
  }

  return (
    <div
      id="data-citeab-citations-v2-widget"
      data-citeab-citations-v2-widget
      data-api-key={citationApiKey}
      data-company="fortis-life-sciences"
      data-product-id={citeabProductCode}
      style={{ width: '100%' }}
    >
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
