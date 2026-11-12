export const DELIVERY_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendiente" },
  { value: "IN_TRANSIT", label: "En Tránsito" },
  { value: "DELIVERED", label: "Entregado" },
]

export const PAYMENT_STATUS_OPTIONS = [
  { value: "UNPAID", label: "Sin Pagar" },
  { value: "PARTIAL", label: "Abono Parcial" },
  { value: "PAID", label: "Pagado" },
]

export const COMMON_SIZES = ["S", "M", "L", "XL", "2XL", "3XL", "4XL"]

export function formatUsd(amount) {
  const num = Number(amount || 0)
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

