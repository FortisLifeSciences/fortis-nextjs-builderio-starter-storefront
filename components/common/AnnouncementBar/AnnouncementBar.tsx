import { useEffect, useState } from 'react'

import { BuilderComponent, builder } from '@builder.io/react'
import getConfig from 'next/config'
import { useRouter } from 'next/router'

import type { BuilderContent } from '@builder.io/sdk'

const { publicRuntimeConfig } = getConfig()

const announcementBars = publicRuntimeConfig?.builderIO?.modelKeys?.announcementBar || ''

const AnnouncementBar = () => {
  const [announcements, setAnnouncements] = useState<BuilderContent[] | null>(null)
  const router = useRouter()
  const isCheckout = router.pathname === '/checkout/[checkoutId]'

  useEffect(() => {
    async function fetchContent() {
      const content = await builder.getAll(announcementBars)
      const sorted = content.sort((a, b) => {
        const orderA = a.data?.displayOrder ?? 0
        const orderB = b.data?.displayOrder ?? 0
        return orderA - orderB
      })
      setAnnouncements(sorted)
    }
    fetchContent()
  }, [router.pathname])

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
