interface PropertyValue {
  value?: any
  stringValue?: string | null
}

interface ProductProperty {
  attributeFQN?: string | null
  attributeDetail?: { name?: string | null } | null
  values?: (PropertyValue | null)[] | null
}

interface WithProperties {
  properties?: (ProductProperty | null)[] | null
}

export const findProperty = (
  product: WithProperties | null | undefined,
  fqn: string
): ProductProperty | undefined =>
  product?.properties?.find((property) => property?.attributeFQN === fqn) ?? undefined

export const getPropertyLabel = (property: ProductProperty | undefined): string =>
  property?.attributeDetail?.name ?? ''

export const getPropertyValues = (property: ProductProperty | undefined): string[] => {
  if (!property?.values) return []
  return property.values
    .map((entry) => {
      const raw = entry?.stringValue ?? entry?.value
      return raw === null || raw === undefined ? '' : String(raw)
    })
    .filter((value) => value.trim() !== '')
}

export const getPropertyText = (
  product: WithProperties | null | undefined,
  fqn: string,
  separator = ', '
): string => getPropertyValues(findProperty(product, fqn)).join(separator)

export const hasProperty = (product: WithProperties | null | undefined, fqn: string): boolean =>
  getPropertyValues(findProperty(product, fqn)).length > 0

export interface PdpFact {
  fqn: string
  label: string
  value: string
}

export const buildFacts = (
  product: WithProperties | null | undefined,
  fqns: string[],
  limit?: number
): PdpFact[] => {
  const facts: PdpFact[] = []
  const seenLabels = new Set<string>()

  for (const fqn of fqns) {
    if (limit !== undefined && facts.length >= limit) break

    const property = findProperty(product, fqn)
    const value = getPropertyValues(property).join(', ')
    if (!value) continue

    const label = getPropertyLabel(property)
    if (!label || seenLabels.has(label)) continue

    seenLabels.add(label)
    facts.push({ fqn, label, value })
  }

  return facts
}
