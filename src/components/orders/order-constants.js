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

export const ORDER_COLUMNS_CONFIG = [
  { id: "orderId", label: "N° Orden" },
  { id: "customer", label: "Cliente" },
  { id: "supplierOrder", label: "Lote Proveedor" },
  { id: "itemCount", label: "Prendas" },
  { id: "baseCost", label: "Costo Base" },
  { id: "salePrice", label: "Total Venta" },
  { id: "profit", label: "Ganancia" },
  { id: "deliveryStatus", label: "Estado Entrega" },
  { id: "paymentStatus", label: "Estado Pago" },
]

export const DEFAULT_ORDER_VISIBLE_COLUMNS = {
  orderId: true,
  customer: true,
  supplierOrder: true,
  itemCount: true,
  baseCost: true,
  salePrice: true,
  profit: true,
  deliveryStatus: true,
  paymentStatus: true,
}

export const ORDER_PRODUCTS_COLUMNS_CONFIG = [
  { id: "size", label: "Talla" },
  { id: "notes", label: "Notas" },
  { id: "referenceUrl", label: "Enlace Yupoo" },
  { id: "baseCost", label: "Costo Base" },
  { id: "salePrice", label: "Precio Venta" },
]

export const DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS = {
  size: true,
  notes: true,
  referenceUrl: true,
  baseCost: true,
  salePrice: true,
}

export function formatUsd(amount) {
  const num = Number(amount || 0)
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

