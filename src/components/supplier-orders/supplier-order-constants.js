export const SUPPLIER_ORDER_STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierto (Armando)" },
  { value: "ORDERED", label: "Pedido a Proveedor" },
  { value: "IN_TRANSIT", label: "En Tránsito" },
  { value: "RECEIVED", label: "Recibido" },
]

export function build17TrackUrl(trackingCode = "") {
  const clean = trackingCode.trim()
  if (!clean) return ""
  return `https://m.17track.net/es/track-details?nums=${encodeURIComponent(clean)}`
}

export function formatShortDate(isoString) {
  if (!isoString) return "—"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

