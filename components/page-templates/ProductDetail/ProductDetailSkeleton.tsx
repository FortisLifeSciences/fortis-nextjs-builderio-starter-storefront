import React from 'react'

import { Skeleton } from '@mui/material'

import styles from './Pdp.module.css'

const SkeletonLine = ({ width, height = 14 }: { width: string | number; height?: number }) => (
  <Skeleton variant="rectangular" width={width} height={height} className={styles.skeletonLine} />
)

function ProductDetailSkeleton() {
  return (
    <div className={styles.page} data-testid="product-detail-skeleton">
      <div className={styles.container}>
        <nav className={styles.breadcrumbs} aria-hidden="true">
          <SkeletonLine width={70} height={12} />
          <SkeletonLine width={90} height={12} />
          <SkeletonLine width={140} height={12} />
        </nav>

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <SkeletonLine width={120} height={12} />
            </div>

            <div className={styles.titleLine}>
              <SkeletonLine width="min(560px, 90%)" height={34} />
            </div>

            <div className={styles.chips}>
              <SkeletonLine width={96} height={26} />
              <SkeletonLine width={130} height={26} />
              <SkeletonLine width={110} height={26} />
            </div>

            <div className={styles.heroFacts}>
              {Array.from({ length: 6 }).map((_, index) => (
                <div className={styles.heroFact} key={index}>
                  <SkeletonLine width="60%" height={11} />
                  <SkeletonLine width="85%" height={16} />
                </div>
              ))}
            </div>

            <section className={styles.description}>
              <div className={styles.heading}>
                <SkeletonLine width={220} height={20} />
              </div>
              <SkeletonLine width="100%" />
              <SkeletonLine width="100%" />
              <SkeletonLine width="78%" />
            </section>

            <section className={styles.section}>
              <div className={styles.heading}>
                <SkeletonLine width={180} height={20} />
              </div>
              <div className={styles.specTable}>
                {Array.from({ length: 6 }).map((_, index) => (
                  <div className={styles.specRow} key={index}>
                    <SkeletonLine width="70%" height={13} />
                    <SkeletonLine width="90%" height={13} />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={styles.rail}>
            <div className={styles.mediaCard}>
              <div className={styles.mediaTop}>
                <div className={styles.mediaMain}>
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                </div>
                <div className={styles.thumbRow}>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <SkeletonLine width={64} height={64} key={index} />
                  ))}
                </div>
                <div className={styles.mediaCodeRow}>
                  <SkeletonLine width={120} height={14} />
                  <SkeletonLine width={56} height={24} />
                </div>
              </div>

              <div className={`${styles.buyPanel} ${styles.skeletonBuyPanel}`}>
                <SkeletonLine width="100%" height={44} />
                <SkeletonLine width="100%" height={48} />
                <SkeletonLine width="100%" height={44} />
              </div>

              <div className={styles.supportPanel}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div className={styles.supportRow} key={index}>
                    <SkeletonLine width={28} height={28} />
                    <SkeletonLine width="70%" height={14} />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailSkeleton
