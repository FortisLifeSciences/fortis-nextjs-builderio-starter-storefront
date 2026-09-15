const LD_JSON_SCRIPT_REGEX =
  /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi

interface BuilderBlock {
  component?: {
    name?: string
    options?: Record<string, any>
  }
  children?: BuilderBlock[]
}

interface BuilderContent {
  data?: {
    blocks?: BuilderBlock[]
  }
}

export interface ExtractBuilderSchemaResult<T> {
  content: T
  schemaJson: string
}

function collectFromBlock(block: BuilderBlock, payloads: Record<string, any>[]) {
  const options = block?.component?.options

  if (block?.component?.name === 'Custom Code' && typeof options?.code === 'string') {
    const code: string = options.code
    const kept: string[] = []
    let lastIndex = 0

    LD_JSON_SCRIPT_REGEX.lastIndex = 0
    let match = LD_JSON_SCRIPT_REGEX.exec(code)

    while (match !== null) {
      let parsed: Record<string, any> | null = null

      try {
        parsed = JSON.parse(match[1])
      } catch (error) {
        console.warn('Skipping malformed JSON-LD in Builder Custom Code block:', error)
      }

      if (parsed) {
        payloads.push(parsed)
        kept.push(code.slice(lastIndex, match.index))
        lastIndex = match.index + match[0].length
      }

      match = LD_JSON_SCRIPT_REGEX.exec(code)
    }

    if (lastIndex > 0) {
      kept.push(code.slice(lastIndex))
      options.code = kept.join('')
    }
  }

  block?.children?.forEach((child) => collectFromBlock(child, payloads))
  options?.columns?.forEach((column: { blocks?: BuilderBlock[] }) =>
    column?.blocks?.forEach((child) => collectFromBlock(child, payloads))
  )
}

function escapeClosingTags(json: string): string {
  return json.replace(/</g, '\u003c')
}

function mergePayloads(payloads: Record<string, any>[]): string {
  if (payloads.length === 0) return ''
  if (payloads.length === 1) return escapeClosingTags(JSON.stringify(payloads[0], null, 2))

  const graph = payloads.flatMap((payload) => {
    if (Array.isArray(payload['@graph'])) return payload['@graph']
    const node = { ...payload }
    delete node['@context']
    return [node]
  })

  return escapeClosingTags(
    JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
  )
}

export function extractBuilderSchema<T extends BuilderContent | null | undefined>(
  content: T
): ExtractBuilderSchemaResult<T> {
  const payloads: Record<string, any>[] = []

  content?.data?.blocks?.forEach((block) => collectFromBlock(block, payloads))

  return { content, schemaJson: mergePayloads(payloads) }
}

export function combineSchemaJson(...schemaJsonList: string[]): string {
  const payloads: Record<string, any>[] = []

  schemaJsonList.forEach((schemaJson) => {
    if (!schemaJson) return
    try {
      payloads.push(JSON.parse(schemaJson))
    } catch (error) {
      console.warn('Skipping malformed JSON-LD when combining Builder schema:', error)
    }
  })

  return mergePayloads(payloads)
}
