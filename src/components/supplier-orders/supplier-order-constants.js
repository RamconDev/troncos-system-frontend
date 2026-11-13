export const SUPPLIER_ORDER_STATUS_OPTIONS = [
  { value: "OPEN", label: "Abierto (Armando)" },
  { value: "ORDERED", label: "Pedido a Proveedor" },
  { value: "IN_TRANSIT", label: "En Tránsito" },
  { value: "DELIVERED", label: "Entregado (En Colombia / Por buscar)" },
  { value: "RECEIVED", label: "Recibido (En mis manos)" },
]

/**
 * Convierte el string `tracking_code` (ej. "CODE1, CODE2") o arreglo en una lista limpia de códigos
 */
export function parseTrackingCodes(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) {
    return raw.map((c) => String(c).trim()).filter(Boolean)
  }
  return String(raw)
    .split(/[,;\n]+/)
    .map((c) => c.trim())
    .filter(Boolean)
}

/**
 * Serializa un arreglo de códigos en un string separado por comas para guardar en `tracking_code`
 */
export function serializeTrackingCodes(codes = []) {
  const clean = codes.map((c) => String(c).trim()).filter(Boolean)
  return clean.length > 0 ? clean.join(", ") : null
}

/**
 * Genera la URL de 17track soportando uno o múltiples códigos de rastreo
 */
export function build17TrackUrl(codesOrString = "") {
  const list = Array.isArray(codesOrString)
    ? parseTrackingCodes(codesOrString)
    : parseTrackingCodes(codesOrString)
  if (list.length === 0) return null
  return `https://m.17track.net/es/track-details?nums=${encodeURIComponent(list.join(","))}`
}

export const formatShortDate = (isoString) => {
  if (!isoString) return "—"
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  return date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export const SUPPLIER_ORDER_COLUMNS_CONFIG = [
  { id: "code", label: "Código de Lote" },
  { id: "status", label: "Estado" },
  { id: "tracking", label: "Guías de Rastreo" },
  { id: "realProfit", label: "Ganancia Real" },
  { id: "notes", label: "Notas" },
  { id: "date", label: "Fecha" },
]

export const DEFAULT_SUPPLIER_ORDER_VISIBLE_COLUMNS = {
  code: true,
  status: true,
  tracking: true,
  realProfit: true,
  notes: true,
  date: true,
}
