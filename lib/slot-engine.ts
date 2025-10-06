import type { Center, Slot } from "./types";

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(h));
  return R * c;
}

export function rankSlots(slots: Slot[], centers: Center[]): Slot[] {
  // Try to get user geolocation; fallback to city centroid (approx using first center)
  let userGeo = null as { lat: number; lng: number } | null;
  if (typeof window !== "undefined") {
    // Note: geolocation is async; for ranking now we use null; next improvements can re-sort when available
    // We can attempt a synchronous last-known from sessionStorage if saved
    const cache = sessionStorage.getItem("__geo");
    if (cache) {
      try {
        userGeo = JSON.parse(cache);
      } catch {}
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const g = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          sessionStorage.setItem("__geo", JSON.stringify(g));
        },
        () => {},
        { maximumAge: 300000, timeout: 1000 },
      );
    }
  }
  const centerMap = new Map(centers.map((c) => [c.id, c]));
  return [...slots].sort((a, b) => {
    // Sooner first
    const timeDiff = a.start_ts - b.start_ts;
    if (timeDiff !== 0) return timeDiff;
    // Distance if we have geo or fallback to first center distance 0
    const ca = centerMap.get(a.center_id)!;
    const cb = centerMap.get(b.center_id)!;
    const ua = userGeo ? haversineKm(userGeo, ca.geo) : 0;
    const ub = userGeo ? haversineKm(userGeo, cb.geo) : 0;
    if (ua !== ub) return ua - ub;
    // Higher rating first
    if (ca.rating !== cb.rating) return cb.rating - ca.rating;
    // Lower price first
    return a.price - b.price;
  });
}
