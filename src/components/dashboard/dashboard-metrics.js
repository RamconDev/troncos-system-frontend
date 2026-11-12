const MONTH_NAMES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
]

/**
 * Genera los últimos N meses (incluyendo el mes actual o el mes más reciente con datos)
 */
export function getRecentMonthBuckets(referenceDates = [], count = 6) {
  let maxTime = Date.now()
  referenceDates.forEach((iso) => {
    if (!iso) return
    const t = new Date(iso).getTime()
    if (!Number.isNaN(t) && t > maxTime) maxTime = t
  })

  const anchor = new Date(maxTime)
  const buckets = []

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = `${MONTH_NAMES[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
    buckets.push({ key, label, year: d.getFullYear(), month: d.getMonth() })
  }

  return buckets
}

export function extractMonthKey(isoString) {
  if (!isoString) return null
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/**
 * 1. Serie mensual de prendas pedidas y órdenes creadas
 */
export function buildMonthlyProductsSeries(orders = [], monthCount = 6) {
  const buckets = getRecentMonthBuckets(
    orders.map((o) => o.created_at),
    monthCount
  )
  const map = new Map(
    buckets.map((b) => [b.key, { ...b, garments: 0, ordersCount: 0, saleUsd: 0 }])
  )

  orders.forEach((ord) => {
    const key = extractMonthKey(ord.created_at)
    if (!key || !map.has(key)) return
    const entry = map.get(key)
    const garmentsCount = ord.products?.length ?? 0
    entry.garments += garmentsCount
    entry.ordersCount += 1
    entry.saleUsd += Number(ord.total_sale_price_usd || 0)
  })

  return Array.from(map.values())
}

/**
 * 2. Serie mensual de Ingresos vs Egresos en USD
 */
export function buildMonthlyCashflowSeries(movements = [], monthCount = 6) {
  const buckets = getRecentMonthBuckets(
    movements.map((m) => m.created_at),
    monthCount
  )
  const map = new Map(
    buckets.map((b) => [b.key, { ...b, incomeUsd: 0, expenseUsd: 0 }])
  )

  movements.forEach((mov) => {
    const key = extractMonthKey(mov.created_at)
    if (!key || !map.has(key)) return
    const entry = map.get(key)
    const usd = Number(mov.amount_usd || 0)
    if (mov.movement_type === "INCOME") {
      entry.incomeUsd = Number((entry.incomeUsd + usd).toFixed(2))
    } else {
      entry.expenseUsd = Number((entry.expenseUsd + usd).toFixed(2))
    }
  })

  return Array.from(map.values())
}

/**
 * 3. Productos y órdenes pendientes por cobrar (UNPAID / PARTIAL)
 */
export function buildUnpaidProductsData(orders = [], movements = []) {
  const paidByOrderId = new Map()
  movements.forEach((mov) => {
    if (mov.movement_type === "INCOME" && mov.source_id) {
      const prev = paidByOrderId.get(mov.source_id) || 0
      paidByOrderId.set(mov.source_id, prev + Number(mov.amount_usd || 0))
    }
  })

  const unpaidProducts = []
  let totalPendingUsd = 0
  let unpaidOrdersCount = 0

  orders.forEach((ord) => {
    if (ord.payment_status === "PAID") return
    const saleUsd = Number(ord.total_sale_price_usd || 0)
    const paidUsd = paidByOrderId.get(ord.id) || 0
    const remainingUsd = Math.max(0, Number((saleUsd - paidUsd).toFixed(2)))
    if (remainingUsd <= 0 && saleUsd > 0) return

    unpaidOrdersCount += 1
    totalPendingUsd += remainingUsd

    const prods = Array.isArray(ord.products) ? ord.products : []
    prods.forEach((prod) => {
      unpaidProducts.push({
        ...prod,
        orderId: ord.id,
        customerName: ord.customer_name || `Cliente #${ord.customer_id}`,
        paymentStatus: ord.payment_status,
        deliveryStatus: ord.delivery_status,
        orderRemainingUsd: remainingUsd,
      })
    })
  })

  return {
    unpaidProducts,
    unpaidProductsCount: unpaidProducts.length,
    unpaidOrdersCount,
    totalPendingUsd,
  }
}

/**
 * 4. Top productos más vendidos en los últimos 3 meses y distribución de tallas
 */
export function buildProductInsights(orders = []) {
  // Referencia de fecha: última orden o fecha actual
  let maxTime = Date.now()
  orders.forEach((o) => {
    const t = new Date(o.created_at || 0).getTime()
    if (!Number.isNaN(t) && t > maxTime) maxTime = t
  })
  const threeMonthsAgo = maxTime - 90 * 24 * 60 * 60 * 1000

  const productCountMap = new Map()
  const sizeCountMap = new Map()
  let totalGarments = 0

  orders.forEach((ord) => {
    const ordTime = new Date(ord.created_at || 0).getTime()
    const isWithin3Months = Number.isNaN(ordTime) || ordTime >= threeMonthsAgo

    const prods = Array.isArray(ord.products) ? ord.products : []
    prods.forEach((prod) => {
      totalGarments += 1

      // Conteo de tallas global
      const sizeKey = (prod.size || "Sin talla").trim().toUpperCase()
      sizeCountMap.set(sizeKey, (sizeCountMap.get(sizeKey) || 0) + 1)

      // Top productos en últimos 3 meses
      if (isWithin3Months && prod.name) {
        const cleanName = prod.name.trim()
        const key = cleanName.toLowerCase()
        const current = productCountMap.get(key) || {
          name: cleanName,
          count: 0,
          revenueUsd: 0,
        }
        current.count += 1
        current.revenueUsd += Number(prod.sale_price || 0)
        productCountMap.set(key, current)
      }
    })
  })

  const topProducts = Array.from(productCountMap.values())
    .sort((a, b) => b.count - a.count || b.revenueUsd - a.revenueUsd)
    .slice(0, 5)

  const sizeDistribution = Array.from(sizeCountMap.entries())
    .map(([size, count]) => ({
      size,
      count,
      percentage: totalGarments > 0 ? Math.round((count / totalGarments) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    topProducts,
    sizeDistribution,
    totalGarments,
  }
}

