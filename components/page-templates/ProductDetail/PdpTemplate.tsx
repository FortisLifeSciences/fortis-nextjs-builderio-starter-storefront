import React, { useEffect, useState } from 'react'

import { BuilderComponent } from '@builder.io/react'
import Link from 'next/link'
import router from 'next/router'
import { useTranslation } from 'next-i18next'

import CitationWidget from './CitationWidget'
import styles from './Pdp.module.css'
import { getPdpBrandConfig } from './pdpBrandConfig'
import { getPdpBrandContent } from './pdpBrandContent'
import PdpGallery from './PdpGallery'
import { findProperty, getPropertyText, getPropertyValues } from './pdpProperties'
import { DEFAULT_SPEC_GROUPS } from './pdpSpecGroups'
import PdpVariantPicker from './PdpVariantPicker'
import ProductInventoryMessages from './ProductInventoryMessages'
import { usePdpViewModel } from './usePdpViewModel'
import { AddToCartDialog } from '@/components/dialogs'
import PDPValidationModal from '@/components/product/PDPValidationModal'
import { useAuthContext, useModalContext } from '@/context'
import { brandImages, brandImagesWhite } from '@/lib/constants/brandLogos'
import { productGetters } from '@/lib/getters'
import type { ProductCustom, BreadCrumb } from '@/lib/types'
import { addToCartGTMPDP } from '@/lib/utils/google-tag-manager'
import GetThemeSettings from '@/src/pages/api/getThemeSettings'

import type { SpecRowConfig } from './pdpSpecGroups'
import type { PdpVariantOption } from './PdpVariantPicker'
import type { ProductImage, Product, FilteredProduct } from '@/lib/gql/types'

type queryIdArr = {
  ProductCode: string | undefined
  queryId: string
}

const Arrow = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M6 3.5 10.5 8 6 12.5" />
  </svg>
)

const CheckIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <path d="M3.5 8.5 6.5 11.5 12.5 5" />
  </svg>
)

const DocIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </svg>
)

interface PdpTemplateProps {
  product: ProductCustom
  sliceValue?: string
  selectedUrlVariant?: string
  productVariations?: Product[] | FilteredProduct[]
  breadcrumbs?: BreadCrumb[]
  children?: any
  isB2B?: boolean
  relatedProducts?: []
  getCurrentProduct?: (
    addToCartPayload: any,
    currentProduct: ProductCustom,
    isValidateAddToCart: boolean,
    isValidateAddToWishlist: boolean
  ) => void
  PDPCustomAndBulkDisplayContentSection?: any
  PDPCustomAndBulkDisplaySectionKey?: string
  digitalAssets?: any[]
}

const scrollToSection = (id: string) => {
  const element = document.getElementById(id)
  if (!element) return
  const headerHeight = document.getElementById('fixed-header-wrapper')?.offsetHeight || 125
  element.style.scrollMarginTop = `${headerHeight}px`
  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const PdpTemplate = (props: PdpTemplateProps) => {
  const {
    product,
    sliceValue,
    selectedUrlVariant,
    productVariations,
    breadcrumbs = [],
    children,
    isB2B = false,
    relatedProducts,
    PDPCustomAndBulkDisplayContentSection,
    PDPCustomAndBulkDisplaySectionKey,
    digitalAssets,
    getCurrentProduct,
  } = props

  const { t } = useTranslation('common')
  const { showModal } = useModalContext()
  const { user } = useAuthContext()
  const siteUrl = process.env.NEXT_PUBLIC_URL

  const [descExpanded, setDescExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAllDocs, setShowAllDocs] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [validationOpen, setValidationOpen] = useState(false)
  const [themeCodeMapping, setThemeCodeMapping] = useState<any[]>([])

  const {
    updatedProduct,
    currentProduct,
    sectionTargetUrl,
    variationProductCode,
    description,
    shortDescription,
    productGallery,
    factoredProductData,
    productPrice,
    brand,
    brandName,
    variantProductName,
    quantity,
    setQuantity,
    minQuantity,
    maxQuantity,
    stockAvailable,
    minimumStock,
    stockBehaviour,
    skuStatusText,
    showPrices,
    availabilityMessageArr,
    selectProductOption,
    customCTALabel,
    handleCustomCTATarget,
    handleLinkTarget,
    countryCode,
    ousShowDistributorBtn,
    ousShowPrices,
    citationCountVariant,
    citeabProductCode,
    citationApiKey,
    digitalDocumentData,
    addToCartPayload,
    addToCart,
    setProductsQueryIdArr,
    algoliaQueryId,
    algoliaObjectData,
    addtocartvalue,
    keyVal,
    variationCodeDynamic,
    currentlocationInventory,
    brandKey,
    catalogNumber,
    heroTitle,
    heroFacts,
  } = usePdpViewModel({
    product,
    sliceValue,
    selectedUrlVariant,
    productVariations,
    isB2B,
    digitalAssets,
    PDPCustomAndBulkDisplayContentSection,
    getCurrentProduct,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await GetThemeSettings()
        setThemeCodeMapping(settings?.data?.themeCodeMapping || [])
      } catch (error) {
        console.error('Error fetching theme settings:', error)
      }
    }
    fetchSettings()
  }, [])

  const handleAddToCart = async () => {
    try {
      const storedQueryId = localStorage.getItem('algoliaQueryId')

      if (storedQueryId) {
        const newProductQuery: queryIdArr = {
          ProductCode: variationProductCode || undefined,
          queryId: storedQueryId,
        }

        setProductsQueryIdArr((prevProducts) => {
          const existingIndex = prevProducts.findIndex(
            (p) => p.ProductCode === newProductQuery.ProductCode
          )

          if (existingIndex !== -1) {
            const updatedProducts = [...prevProducts]
            updatedProducts[existingIndex] = {
              ...updatedProducts[existingIndex],
              queryId: storedQueryId,
            }
            return updatedProducts
          }

          return [...prevProducts, newProductQuery]
        })
      }
      const cartResponse = await addToCart.mutateAsync(addToCartPayload)
      if (cartResponse.id && !isB2B) {
        showModal({
          Component: AddToCartDialog,
          props: {
            cartItem: cartResponse,
          },
        })
      }

      if (product?.productCode && cartResponse && product?.categories?.[0]?.content?.name) {
        addToCartGTMPDP(
          cartResponse?.total,
          user?.userId,
          product?.productCode,
          productGetters.getName(product).replace(/[^a-zA-Z0-9 -]/g, ''),
          product?.categories?.[0]?.content?.name,
          brandName,
          variationProductCode,
          cartResponse?.product?.price?.price,
          quantity
        )
      }
    } catch (err) {
      console.log(err)
    }
  }

  const minQty = Number(minQuantity) > 0 ? Number(minQuantity) : 1
  const shownQty = Number(quantity) > 0 ? Number(quantity) : minQty

  const isUsVisitor =
    (countryCode && countryCode === 'US') ||
    !countryCode ||
    (typeof countryCode === 'string' && countryCode.trim() === '')

  const showAddToCart =
    skuStatusText === 'Active' &&
    stockBehaviour &&
    (stockBehaviour !== 'DenyBackorder' ||
      (stockBehaviour === 'DenyBackorder' && stockAvailable >= minimumStock))

  const priceVisible = isUsVisitor
    ? skuStatusText === 'CustomCTA'
      ? Boolean(showPrices)
      : true
    : Boolean(ousShowPrices)

  const discountPercent =
    productPrice?.special && productPrice?.regular && productPrice.special < productPrice.regular
      ? Math.round(((productPrice.regular - productPrice.special) / productPrice.regular) * 100)
      : null

  const brandContent = getPdpBrandContent(brandKey)
  const brandConfig = getPdpBrandConfig(brandKey)
  const validatedApplications =
    getPropertyText(updatedProduct, 'tenant~applications-variant', ' · ') ||
    getPropertyText(updatedProduct, 'tenant~applications', ' · ')

  const validationText = getPropertyValues(
    findProperty(updatedProduct, 'tenant~validation-text')
  )[0]

  const documents = (digitalDocumentData ?? []).filter((doc: any) => {
    const type = doc?.properties?.assettype
    if (!type || type === 'ProductImage') return false
    return showAllDocs || doc?.properties?.displayonpdp === 'True'
  })
  const hasHiddenDocs = (digitalDocumentData ?? []).some(
    (doc: any) =>
      doc?.properties?.assettype &&
      doc?.properties?.assettype !== 'ProductImage' &&
      doc?.properties?.displayonpdp !== 'True'
  )
  const hasDocuments = documents.length > 0 || hasHiddenDocs
  const currentLot = getPropertyValues(
    findProperty(currentProduct, 'tenant~current-lot-variant')
  )[0]

  const chips: { label: string; variant: 'primary' | 'outline'; onClick?: () => void }[] = []
  if (validationText) {
    chips.push({ label: 'Validated', variant: 'primary', onClick: () => setValidationOpen(true) })
  }
  const categoryLabel = getPropertyValues(
    findProperty(updatedProduct, 'tenant~web-category-list')
  )[0]
  if (categoryLabel) chips.push({ label: categoryLabel, variant: 'outline' })

  const selectOption = factoredProductData?.selectOptions?.[0]
  const variantOptions: PdpVariantOption[] = (selectOption?.values ?? []).map((value: any) => ({
    value: value?.value,
    label: value?.stringValue || value?.value,
    sku: value?.variationProductCode,
    price: value?.price?.price != null ? `$${value.price.price.toFixed(2)}` : null,
    disabled: !value?.isEnabled,
  }))
  const selectedVariant = productGetters.getOptionSelectedValue(selectOption as any)

  const variantDescription = getPropertyValues(
    findProperty(currentProduct, 'tenant~description-variant')
  )[0]

  const handleCopy = async () => {
    if (!catalogNumber) return
    try {
      await navigator.clipboard.writeText(catalogNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      console.error('Unable to copy catalog number', error)
    }
  }

  const hasContentsVariant =
    getPropertyValues(findProperty(updatedProduct, 'tenant~contents-variant')).length > 0
  const seenSpecLabels = new Set<string>()
  const specGroups = DEFAULT_SPEC_GROUPS.map((group) => {
    const rows: { key: string; label: string; value: string; config: SpecRowConfig }[] = []
    for (const config of group.rows) {
      if (config.fqn === 'tenant~contents' && hasContentsVariant) continue
      const property = findProperty(updatedProduct, config.fqn)
      const value = getPropertyValues(property).join(', ')
      if (!value) continue
      const label = config.labelOverride || property?.attributeDetail?.name || ''
      if (!label || seenSpecLabels.has(label)) continue
      seenSpecLabels.add(label)
      rows.push({ key: config.fqn, label, value, config })
    }
    return { ...group, resolvedRows: rows }
  })
  const hasSpecs = specGroups.some((group) => group.resolvedRows.length > 0)

  const applicationText = getPropertyValues(
    findProperty(updatedProduct, 'tenant~application-text')
  )[0]
  const applicationTextVariant = getPropertyValues(
    findProperty(currentProduct, 'tenant~application-text-variant')
  )[0]
  let dilutionRows: { Application: string; ApplicationDilutionRange: string }[] = []
  try {
    dilutionRows = JSON.parse(
      getPropertyValues(findProperty(currentProduct, 'tenant~application-dilution-range'))[0] ||
        '[]'
    )
  } catch (error) {
    dilutionRows = []
  }
  dilutionRows = dilutionRows.map((row) => {
    const matched = themeCodeMapping.find(
      (item: any) => row?.Application?.toLowerCase() === item?.applId?.toLowerCase()
    )
    return matched
      ? { Application: matched.longName, ApplicationDilutionRange: row.ApplicationDilutionRange }
      : row
  })
  const hasApplications =
    Boolean(applicationText) || Boolean(applicationTextVariant) || dilutionRows.length > 0

  const productionText = getPropertyValues(
    findProperty(updatedProduct, 'tenant~production-epitope')
  )[0]

  const distributorNote = ousShowDistributorBtn
    ? t('distributorMessage')
    : t('nonDistributorMessage')

  const supportRows = (
    <>
      {validatedApplications ? (
        <div className={styles.supportRow} style={{ cursor: 'default' }}>
          <span className={styles.supportIcon}>
            <CheckIcon />
          </span>
          <span>
            <span className={styles.supportTitle}>Validated applications</span>
            <span className={styles.supportSub}>{validatedApplications}</span>
          </span>
          <span />
        </div>
      ) : null}
      {brandContent.supportRows.map((row) => (
        <button
          type="button"
          className={styles.supportRow}
          key={row.id}
          onClick={() => row.href && router.push(row.href)}
        >
          <span className={styles.supportIcon}>
            <DocIcon />
          </span>
          <span>
            <span className={styles.supportTitle}>{row.title}</span>
            <span className={styles.supportSub}>{row.subtitle}</span>
          </span>
          <span className={styles.supportArrow}>
            <Arrow />
          </span>
        </button>
      ))}
    </>
  )

  const buyPanel = (
    <div className={styles.buyPanel}>
      <PdpVariantPicker
        options={variantOptions}
        selected={selectedVariant}
        showPrices={priceVisible}
        onChange={async (value) => {
          await selectProductOption(
            selectOption?.attributeFQN as string,
            value,
            undefined,
            selectOption?.values?.find((v: any) => v?.value === value)?.isEnabled as boolean
          )
        }}
      />

      {variantDescription ? (
        <p
          className={styles.buyNote}
          style={{ marginTop: '12px' }}
          dangerouslySetInnerHTML={{ __html: variantDescription }}
        />
      ) : null}

      {isUsVisitor ? (
        <>
          <div style={{ marginTop: '14px' }}>
            <ProductInventoryMessages
              product={currentProduct}
              inventoryInfo={currentlocationInventory}
              stockAvailable={stockAvailable}
              availabilityMessageArr={availabilityMessageArr}
              countryCode={'US'}
            />
          </div>

          {skuStatusText === 'CustomCTA' ? (
            <button
              type="button"
              className={`${styles.buyBtn} ${
                algoliaQueryId ? 'custom-CTA-button-search' : 'custom-CTA-button'
              }`}
              style={{ marginTop: '12px', width: '100%' }}
              onClick={() => (ousShowDistributorBtn ? handleLinkTarget() : handleCustomCTATarget())}
              {...(algoliaQueryId && { 'data-insights-query-id': algoliaQueryId })}
              data-insights-object-id={variationProductCode}
              data-insights-index="products"
            >
              {ousShowDistributorBtn ? t('distributors') : customCTALabel}
            </button>
          ) : null}

          {showAddToCart ? (
            <div className={`${styles.buyRow} ${styles.buyRowActive}`}>
              <button
                type="button"
                className={`${styles.buyBtn} ${
                  algoliaQueryId ? 'add-to-cart-button-search' : 'add-to-cart-button'
                }`}
                onClick={() => handleAddToCart()}
                disabled={addToCart.isPending}
                data-insights-object-id={variationProductCode}
                data-insights-query-id={algoliaQueryId ? algoliaQueryId : undefined}
                data-insights-object-data={
                  algoliaObjectData ? JSON.stringify(algoliaObjectData) : undefined
                }
                data-insights-product-price={JSON.stringify(addtocartvalue)}
                data-insights-currency={JSON.stringify('USD')}
                data-insights-index="products"
              >
                {t('add-to-cart')}
              </button>
              <div className={styles.qty}>
                <button
                  type="button"
                  onClick={() => setQuantity(() => Math.max(minQty, shownQty - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{shownQty}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(() =>
                      maxQuantity ? Math.min(maxQuantity, shownQty + 1) : shownQty + 1
                    )
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <p className={styles.buyNote} style={{ marginTop: '14px' }}>
            {distributorNote}
          </p>
          {!(skuStatusText !== 'CustomCTA' && !ousShowDistributorBtn) ? (
            <button
              type="button"
              className={`${styles.buyBtn} ${
                algoliaQueryId ? 'custom-CTA-button-search' : 'custom-CTA-button'
              }`}
              style={{ marginTop: '12px', width: '100%' }}
              onClick={() => (ousShowDistributorBtn ? handleLinkTarget() : handleCustomCTATarget())}
              data-insights-object-id={variationProductCode}
              data-insights-query-id={algoliaQueryId ? algoliaQueryId : undefined}
              data-insights-index="products"
            >
              {ousShowDistributorBtn && t('distributors')}
              {!ousShowDistributorBtn && skuStatusText === 'CustomCTA' && customCTALabel}
            </button>
          ) : null}
        </>
      )}

      {!PDPCustomAndBulkDisplayContentSection &&
        brandContent.secondaryCtas.map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            className={cta.variant === 'filled' ? styles.sampleBtn : styles.bulkBtn}
          >
            {cta.label}
          </Link>
        ))}

      {PDPCustomAndBulkDisplayContentSection &&
        PDPCustomAndBulkDisplaySectionKey &&
        variationCodeDynamic && (
          <div className={styles.builderSlot}>
            <BuilderComponent
              key={variationCodeDynamic}
              model={PDPCustomAndBulkDisplaySectionKey}
              content={PDPCustomAndBulkDisplayContentSection}
              data={{
                objectId: variationProductCode,
                queryId: algoliaQueryId || undefined,
              }}
              context={{
                className: algoliaQueryId
                  ? 'bulk-and-custom-button-search'
                  : 'bulk-and-custom-button',
                bulkRedirect: () => {
                  window.location.href = `${siteUrl}${sectionTargetUrl}?Catalog_Num=${variationCodeDynamic}`
                },
              }}
            />
          </div>
        )}
    </div>
  )

  const mediaCardInner = (
    <>
      <div className={styles.mediaTop}>
        <PdpGallery
          digitalAssets={digitalDocumentData}
          kiboImages={productGallery as ProductImage[]}
          brandImage={brand && typeof brand === 'string' ? brandImages[brand.toLowerCase()] : null}
          title={heroTitle}
        />

        {catalogNumber ? (
          <div className={styles.mediaCodeRow}>
            <span className={styles.mediaSku}>{catalogNumber}</span>
            <button type="button" className={styles.copyChip} onClick={handleCopy}>
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        ) : null}

        {hasDocuments || citationCountVariant > 0 ? (
          <div className={styles.mediaLinkRow}>
            {hasDocuments ? (
              <button type="button" onClick={() => scrollToSection('document-section')}>
                <DocIcon />
                <span>Product Documents</span>
              </button>
            ) : null}
            {citationCountVariant > 0 ? (
              <button type="button" onClick={() => scrollToSection('citation-document-section')}>
                <DocIcon />
                <span>Citations ({citationCountVariant})</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
      {buyPanel}
      <div className={styles.supportPanel}>{supportRows}</div>
    </>
  )

  const brandLogoSrc = brand ? brandImagesWhite[brand.toLowerCase()] : undefined

  const brandCard = brandContent.brandCard ? (
    <div className={styles.brandCard}>
      {brandContent.brandCard.stars ? <p className={styles.stars}>★★★★★</p> : null}
      {brandLogoSrc && brandConfig.brandCardLogoVariant === 'fortisPlusBrand' ? (
        <div className={styles.brandLogosRow}>
          <img className={styles.brandLogoFortis} src={brandImagesWhite.fortis} alt="Fortis" />
          <img className={styles.brandLogoBrand} src={brandLogoSrc} alt={brandName ?? ''} />
        </div>
      ) : null}
      {brandLogoSrc && brandConfig.brandCardLogoVariant === 'brandOnly' ? (
        <img className={styles.brandLogoSolo} src={brandLogoSrc} alt={brandName ?? ''} />
      ) : null}
      {brandContent.brandCard.benefits.map((benefit) => (
        <div className={styles.benefit} key={benefit}>
          <span className={styles.check}>
            <CheckIcon />
          </span>
          <span>{benefit}</span>
        </div>
      ))}
    </div>
  ) : null

  return (
    <div className={styles.page} data-brand={brandKey}>
      <div className={styles.container}>
        {breadcrumbs.length > 0 ? (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb?.link}-${index}`}>
                {crumb?.link ? <Link href={crumb.link}>{crumb.text}</Link> : crumb?.text}
                <span aria-hidden="true"> / </span>
              </span>
            ))}
            <span aria-current="page">{heroTitle}</span>
          </nav>
        ) : null}

        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            {brandName ? <div className={styles.eyebrow}>{brandName}</div> : null}
            <div className={styles.titleLine}>
              <h1 className={styles.title}>
                {heroTitle}
                {discountPercent ? (
                  <span className={styles.titleDiscount}>−{discountPercent}%</span>
                ) : null}
              </h1>
            </div>

            {chips.length > 0 ? (
              <div className={styles.chips}>
                {chips.map((chip) =>
                  chip.onClick ? (
                    <button
                      type="button"
                      key={chip.label}
                      onClick={chip.onClick}
                      className={`${styles.chip} ${
                        chip.variant === 'primary' ? styles.chipPrimary : styles.chipOutline
                      }`}
                    >
                      {chip.label}
                    </button>
                  ) : (
                    <span
                      key={chip.label}
                      className={`${styles.chip} ${
                        chip.variant === 'primary' ? styles.chipPrimary : styles.chipOutline
                      }`}
                    >
                      {chip.label}
                    </span>
                  )
                )}
              </div>
            ) : null}

            {heroFacts.length > 0 || catalogNumber ? (
              <div className={styles.heroFacts}>
                {catalogNumber ? (
                  <div className={styles.heroFact}>
                    <span>Catalog #</span>
                    <strong>{catalogNumber}</strong>
                  </div>
                ) : null}
                {heroFacts.map((fact) => (
                  <div className={styles.heroFact} key={fact.fqn}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}

            <div className={styles.mobileGalleryMount}>
              <div className={styles.mediaCard}>{mediaCardInner}</div>
            </div>

            {shortDescription ? (
              <section className={styles.description}>
                <h2 className={styles.heading}>Product Description</h2>
                <div
                  className={`${styles.clamp} ${descExpanded ? styles.clampExpanded : ''}`}
                  dangerouslySetInnerHTML={{ __html: shortDescription }}
                />
                <button
                  type="button"
                  className={`${styles.seeMore} ${descExpanded ? styles.seeMoreExpanded : ''}`}
                  onClick={() => setDescExpanded(!descExpanded)}
                >
                  <span>{descExpanded ? 'See less' : 'See more'}</span>
                  <Arrow />
                </button>
              </section>
            ) : null}

            {description ? (
              <section className={styles.section}>
                <h2 className={styles.heading}>{t('product-details')}</h2>
                <div className={styles.copy} dangerouslySetInnerHTML={{ __html: description }} />
              </section>
            ) : null}

            {children}

            {hasSpecs ? (
              <section className={styles.section}>
                <h2 className={styles.heading}>Specifications</h2>
                <div className={styles.specTable}>
                  {specGroups.map((group) =>
                    group.resolvedRows.length === 0 ? null : (
                      <div key={group.id}>
                        {group.label ? <div className={styles.specGroup}>{group.label}</div> : null}
                        {group.resolvedRows.map((row) => (
                          <div className={styles.specRow} key={row.key}>
                            <span className={styles.specLabel}>{row.label}</span>
                            {row.config.render === 'link' && row.config.href ? (
                              <a
                                className={styles.specLink}
                                href={row.config.href(row.value)}
                                target="_blank"
                                rel="noreferrer"
                              >
                                <span>{row.value}</span>
                                <Arrow />
                              </a>
                            ) : row.config.render === 'html' ? (
                              <div
                                className={`${styles.specValue} ${styles.specRowAlt}`}
                                dangerouslySetInnerHTML={{ __html: row.value }}
                              />
                            ) : (
                              <div className={styles.specValue}>{row.value}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </section>
            ) : null}

            {productionText ? (
              <section className={styles.section}>
                <h2 className={styles.heading}>Production &amp; Epitope</h2>
                <p className={styles.copy} dangerouslySetInnerHTML={{ __html: productionText }} />
              </section>
            ) : null}

            {hasApplications ? (
              <section className={styles.section}>
                <h2 className={styles.heading}>Applications</h2>
                {applicationText ? (
                  <p
                    className={styles.copy}
                    dangerouslySetInnerHTML={{ __html: applicationText }}
                  />
                ) : null}
                {applicationTextVariant ? (
                  <p
                    className={styles.copy}
                    dangerouslySetInnerHTML={{ __html: applicationTextVariant }}
                  />
                ) : null}
                {dilutionRows.length > 0 ? (
                  <div className={styles.applicationTable}>
                    {dilutionRows.map((row) => (
                      <div className={styles.applicationRow} key={row.Application}>
                        <span className={styles.applicationLabel}>{row.Application}</span>
                        <span className={styles.applicationValue}>
                          {row.ApplicationDilutionRange}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {hasDocuments ? (
              <section className={styles.documents} id="document-section">
                <h2 className={styles.heading}>Documents</h2>
                {documents.map((doc: any) => {
                  const lot = doc?.properties?.assetlotnumber
                  const lotLabel = lot
                    ? `${lot}${lot === currentLot ? ' (current lot)' : ''}`
                    : null
                  return (
                    <a
                      className={styles.documentLink}
                      key={doc.id}
                      href={`/cms/files/${doc.properties.salsifyname}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <div className={styles.documentRow}>
                        <span className={styles.docIcon}>
                          <DocIcon />
                        </span>
                        <span>
                          <span className={styles.docTitle}>
                            {doc?.properties?.assettype === 'Datasheet'
                              ? 'Product Datasheet'
                              : 'Safety Data Sheet'}
                          </span>
                          <span className={styles.docSub}>
                            PDF{catalogNumber ? ` · ${catalogNumber}` : ''}
                            {lotLabel ? ` · Lot ${lotLabel}` : ''}
                          </span>
                        </span>
                        <span className={styles.docAction}>
                          <span>Open</span>
                          <Arrow />
                        </span>
                      </div>
                    </a>
                  )
                })}
                {hasHiddenDocs ? (
                  <button
                    type="button"
                    className={styles.seeMore}
                    onClick={() => setShowAllDocs(!showAllDocs)}
                  >
                    <span>{showAllDocs ? 'Show fewer documents' : 'Show all documents'}</span>
                    <Arrow />
                  </button>
                ) : null}
              </section>
            ) : null}
          </div>

          <aside className={styles.rail}>
            <div className={styles.mediaCard}>{mediaCardInner}</div>
            {brandCard}
          </aside>
        </div>

        {citationCountVariant && product?.productType === 'Antibody-Configurable' ? (
          <section className={styles.citations} id="citation-document-section" key={keyVal}>
            <h2 className={styles.heading}>Citations / Publications</h2>
            <div className={styles.citationTrack}>
              <CitationWidget
                citeabProductCode={citeabProductCode}
                variantProductName={variantProductName}
                citationApiKey={citationApiKey}
              />
            </div>
          </section>
        ) : null}

        {brandContent.publicationCta ? (
          <section className={styles.publicationCta}>
            <span className={styles.ctaCopy}>
              <strong>{brandContent.publicationCta.title}</strong>
              <span>{brandContent.publicationCta.copy}</span>
            </span>
            <Link className={styles.ctaLink} href={brandContent.publicationCta.href}>
              <span>{brandContent.publicationCta.ctaLabel}</span>
              <Arrow />
            </Link>
          </section>
        ) : null}

        {relatedProducts && relatedProducts.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.heading}>Related Products</h2>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((data: any, index: number) => {
                const formattedCategoryCode =
                  data?.categoryCode === 'antisera_igg_fractions'
                    ? data.categoryCode.replace(/_/g, '-')
                    : data?.categoryCode
                const url =
                  data?.categoryCode !== undefined && data?.seoFriendlyUrl
                    ? `/products/${formattedCategoryCode}/${data.seoFriendlyUrl}/${data.productCode}`
                    : `/product/${data?.productCode}`
                const href = url.includes('libraries') ? url.toLowerCase() : url

                return (
                  <article className={styles.relatedCard} key={data?.productCode ?? index}>
                    <div>
                      {data?.brand?.stringValue ? (
                        <div className={styles.relatedBrand}>{data.brand.stringValue}</div>
                      ) : null}
                      <h3>{data?.title}</h3>
                      <div className={styles.relatedSku}>
                        {data?.plpCatalogNumber ||
                          String(data?.productCode ?? '').replace(/^[A-Z]+-/, '')}
                      </div>
                    </div>
                    <Link href={href} data-testid="product-card-link">
                      <span>See Product Details</span>
                      <Arrow />
                    </Link>
                  </article>
                )
              })}
            </div>
          </section>
        ) : null}

        {brandContent.services.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.heading}>Services</h2>
            <div className={styles.servicesGrid}>
              {brandContent.services.map((service) => (
                <Link className={styles.serviceCard} href={service.href} key={service.id}>
                  <div className={styles.formatTitle}>{service.title}</div>
                  <p>{service.copy}</p>
                  <span className={styles.formatLink}>
                    <span>{service.ctaLabel}</span>
                    <Arrow />
                  </span>
                  {service.art ? (
                    <span className={styles.antibodyArt} aria-hidden="true">
                      <img src={service.art} alt="" />
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {brandContent.resources.length > 0 ? (
          <section className={styles.section}>
            <h2 className={styles.heading}>Resources</h2>
            <div className={styles.resourcesGrid}>
              {brandContent.resources.map((resource) => (
                <article className={styles.resourceCard} key={resource.id}>
                  <img className={styles.resourceIcon} src={resource.icon} alt="" />
                  <h3>{resource.title}</h3>
                  <Link href={resource.href}>
                    <span>{resource.ctaLabel}</span>
                    <Arrow />
                  </Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className={`${styles.mobilePurchase} ${drawerOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileDrawerScroll}>
            <div className={styles.mobileSupportWrap}>
              <div className={styles.supportPanel}>{supportRows}</div>
            </div>
            <div className={styles.mobileBrandWrap}>{brandCard}</div>
          </div>
        </div>
        <div className={`${styles.mobileBar} ${styles.mobileBarActive}`}>
          <button
            type="button"
            className={styles.mobileDrawerToggle}
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-expanded={drawerOpen}
          >
            <span className={styles.mobileSupportLabel}>
              {drawerOpen ? 'Hide support options' : 'More support options'}
            </span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 15l6-6 6 6" />
            </svg>
          </button>

          {isUsVisitor && showAddToCart ? (
            <>
              <button
                type="button"
                className={styles.mobileCartBtn}
                onClick={() => handleAddToCart()}
                disabled={addToCart.isPending}
              >
                {t('add-to-cart')}
              </button>
              <div className={styles.mobileFixedQty}>
                <button
                  type="button"
                  onClick={() => setQuantity(() => Math.max(minQty, shownQty - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <span>{shownQty}</span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity(() =>
                      maxQuantity ? Math.min(maxQuantity, shownQty + 1) : shownQty + 1
                    )
                  }
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </>
          ) : skuStatusText === 'CustomCTA' || ousShowDistributorBtn ? (
            <button
              type="button"
              className={styles.mobileCartBtn}
              onClick={() => (ousShowDistributorBtn ? handleLinkTarget() : handleCustomCTATarget())}
            >
              {ousShowDistributorBtn ? t('distributors') : customCTALabel}
            </button>
          ) : null}
        </div>
      </div>

      {validationOpen ? (
        <PDPValidationModal product={updatedProduct} onClose={() => setValidationOpen(false)} />
      ) : null}
    </div>
  )
}

export default PdpTemplate
