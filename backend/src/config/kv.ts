// For Cloudflare Workers, KV is accessed via environment bindings
// See wrangler.toml for KV namespace configuration

export interface KVEnv {
  BOOKING_HOLDS: KVNamespace;
}

// Helper functions for KV operations
export async function getBookingHold(
  kv: KVNamespace,
  trailerId: string,
  startDate: string,
  endDate: string
): Promise<string | null> {
  const key = `hold:${trailerId}:${startDate}:${endDate}`;
  return kv.get(key);
}

export async function setBookingHold(
  kv: KVNamespace,
  trailerId: string,
  startDate: string,
  endDate: string,
  reservationId: string,
  ttlSeconds: number = 900 // 15 minutes
): Promise<void> {
  const key = `hold:${trailerId}:${startDate}:${endDate}`;
  await kv.put(key, reservationId, { expirationTtl: ttlSeconds });
}

export async function deleteBookingHold(
  kv: KVNamespace,
  trailerId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const key = `hold:${trailerId}:${startDate}:${endDate}`;
  await kv.delete(key);
}
