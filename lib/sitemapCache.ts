// In-memory last-known-good cache for sitemaps.

const memoryStore = new Map<string, string>()

export async function getCachedSitemap(key: string): Promise<string | null> {
  return memoryStore.get(key) ?? null
}

export async function setCachedSitemap(key: string, value: string): Promise<void> {
  memoryStore.set(key, value)
}
