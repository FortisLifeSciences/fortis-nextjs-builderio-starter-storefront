import { useEffect, useState } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import { useRouter } from 'next/router'

import type { BuilderContent } from '@builder.io/sdk'

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState<BuilderContent[] | null>(null)
  const router = useRouter()
  const isCheckout = router.pathname === '/checkout/[checkoutId]'

  useEffect(() => {
    async function fetchContent() {
      const content = await builder.getAll('announcement-bar')
      const sorted = content.sort((a, b) => {
        const orderA = a.data?.displayOrder ?? 0
        const orderB = b.data?.displayOrder ?? 0
        return orderA - orderB
      })
      setAnnouncements(sorted)
    }
    fetchContent()
  }, [])

  return (
    <>
      {!isCheckout ? (
        announcements?.length ? (
          <>
            {announcements.map((item) => (
              <BuilderComponent key={item.id} model="announcement-bar" content={item} />
            ))}
          </>
        ) : (
          ''
        )
      ) : (
        ''
      )}
    </>
  )
}

export default AnnouncementBar
