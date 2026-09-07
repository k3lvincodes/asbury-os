// In-memory store for booking holds (Node.js compatible)
// For production, consider using Redis or database-based caching

const holdsStore = new Map<string, { value: string; expiresAt: number }>();

function getHoldKey(trailerId: string, startDate: string, endDate: string): string {
  return `hold:${trailerId}:${startDate}:${endDate}`;
}

// Helper functions for booking holds (in-memory implementation)
export async function getBookingHold(
  trailerId: string,
  startDate: string,
  endDate: string
): Promise<string | null> {
  const key = getHoldKey(trailerId, startDate, endDate);
  const entry = holdsStore.get(key);
  
  if (!entry) return null;
  
  if (Date.now() > entry.expiresAt) {
    holdsStore.delete(key);
    return null;
  }
  
  return entry.value;
}

export async function setBookingHold(
  trailerId: string,
  startDate: string,
  endDate: string,
  reservationId: string,
  ttlSeconds: number = 900 // 15 minutes
): Promise<void> {
  const key = getHoldKey(trailerId, startDate, endDate);
  holdsStore.set(key, {
    value: reservationId,
    expiresAt: Date.now() + (ttlSeconds * 1000),
  });
}

export async function deleteBookingHold(
  trailerId: string,
  startDate: string,
  endDate: string
): Promise<void> {
  const key = getHoldKey(trailerId, startDate, endDate);
  holdsStore.delete(key);
}
