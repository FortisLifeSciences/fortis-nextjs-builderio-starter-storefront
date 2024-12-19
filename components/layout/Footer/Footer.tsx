import { useEffect, useState } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import { useRouter } from 'next/router'

import CheckoutFooter from '@/components/checkout/CheckoutFooter/CheckoutFooter'

const FooterSection = () => {
  const [footerContent, setFooterContent] = useState(null)
  const router = useRouter()
  const isCheckout = router.pathname === '/checkout/[checkoutId]' ? true : false
  useEffect(() => {
    async function fetchFooterContent() {
      const content = await builder.get('footer').toPromise()
      setFooterContent(content)
    }

    fetchFooterContent()
  }, [])

  return (
    <footer>
      {footerContent ? (
        isCheckout ? (
          <CheckoutFooter />
        ) : (
          <BuilderComponent model="footer" content={footerContent} />
        )
      ) : (
        <p></p>
      )}
    </footer>
  )
}

export default FooterSection
