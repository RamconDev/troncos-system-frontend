export const MONTH_NAMES_SHORT = [
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

export const MONTH_NAMES_FULL = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

/**
 * Extrae la clave YYYY-MM de un ISO string
 */
export function extractMonthKey(isoString) {
  if (!isoString) return null
  const d = new Date(isoString)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

/**
 * Genera la lista de buckets mensuales según la cantidad solicitada (3, 6, 12 o YTD)
 */
export function getMonthBuckets(orders = [], movements = [], timeframe = 6) {
  let maxTime = Date.now()

  // Buscar la fecha más reciente con datos reales
  orders.forEach((o) => {
    if (!o.created_at) return
    const t = new Date(o.created_at).getTime()
    if (!Number.isNaN(t) && t > maxTime) maxTime = t
  })
  movements.forEach((m) => {
    if (!m.created_at) return
    const t = new Date(m.created_at).getTime()
    if (!Number.isNaN(t) && t > maxTime) maxTime = t
  })

  const anchor = new Date(maxTime)
  let count = typeof timeframe === "number" ? timeframe : 6

  // Si timeframe es "ytd", calcular los meses transcurridos desde enero del año más reciente
  if (timeframe === "ytd") {
    count = anchor.getMonth() + 1
  }

  const buckets = []
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const shortLabel = `${MONTH_NAMES_SHORT[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`
    const fullLabel = `${MONTH_NAMES_FULL[d.getMonth()]} ${d.getFullYear()}`

    buckets.push({
      key,
      label: shortLabel,
      fullLabel,
      year: d.getFullYear(),
      month: d.getMonth(),
    })
  }

  return buckets
}

/**
 * Procesa y agrupa las métricas estadísticas mensuales y globales
 */
export function processAnalyticsData({
  orders = [],
  movements = [],
  timeframe = 6,
  selectedMonthKey = "ALL", // "ALL" o "YYYY-MM"
}) {
  const buckets = getMonthBuckets(orders, movements, timeframe)
  const validKeys = new Set(buckets.map((b) => b.key))

  // Mapas por mes para métricas
  const monthlyDataMap = new Map()
  buckets.forEach((b) => {
    monthlyDataMap.set(b.key, {
      ...b,
      // Dinero
      grossSalesUsd: 0, // Total valor de venta de pedidos creados en el mes
      collectedIncomeUsd: 0, // Total cobrado en caja (movimientos INCOME) en el mes
      expensesUsd: 0, // Gastos (movimientos EXPENSE) en el mes
      supplierExpensesUsd: 0, // Pagos a proveedor
      logisticsExpensesUsd: 0, // Fletes y logística
      netMarginUsd: 0, // grossSalesUsd - expensesUsd
      // Prendas y Pedidos
      garmentsCount: 0, // Total prendas creadas en el mes
      ordersCount: 0, // Total órdenes creadas en el mes
      paidGarmentsCount: 0, // Prendas con pago 100% completado
      activeGarmentsCount: 0, // Prendas en lotes activos
      // Tallas
      sizesMap: new Map(),
      // Top productos
      productsMap: new Map(),
    })
  })

  // 1. Procesar Movimientos Financieros (Ingresos y Egresos reales del mes)
  movements.forEach((mov) => {
    const key = extractMonthKey(mov.created_at)
    if (!key || !monthlyDataMap.has(key)) return
    const month = monthlyDataMap.get(key)
    const val = Number(mov.amount_usd || 0)
    const cat = String(mov.category_name || "").toUpperCase()

    if (mov.movement_type === "EXPENSE") {
      month.expensesUsd = Number((month.expensesUsd + val).toFixed(2))
      if (cat === "SUPPLIER_PAYMENT") {
        month.supplierExpensesUsd = Number(
          (month.supplierExpensesUsd + val).toFixed(2)
        )
      } else if (cat === "LOGISTICS") {
        month.logisticsExpensesUsd = Number(
          (month.logisticsExpensesUsd + val).toFixed(2)
        )
      }
    } else if (mov.movement_type === "INCOME") {
      month.collectedIncomeUsd = Number(
        (month.collectedIncomeUsd + val).toFixed(2)
      )
    }
  })

  // 2. Procesar Órdenes y Prendas
  orders.forEach((ord) => {
    const key = extractMonthKey(ord.created_at)
    if (!key || !monthlyDataMap.has(key)) return
    const month = monthlyDataMap.get(key)

    const salePrice = Number(ord.total_sale_price_usd || 0)
    const prods = Array.isArray(ord.products) ? ord.products : []
    const isPaid = ord.payment_status === "PAID"
    const hasLot = Boolean(ord.supplier_order_id)

    month.ordersCount += 1
    month.grossSalesUsd = Number((month.grossSalesUsd + salePrice).toFixed(2))

    prods.forEach((prod) => {
      month.garmentsCount += 1
      if (isPaid) {
        month.paidGarmentsCount += 1
      }
      if (hasLot) {
        month.activeGarmentsCount += 1
      }

      // Conteo de tallas por mes
      const rawSize = (prod.size || "Sin Talla").trim().toUpperCase()
      month.sizesMap.set(rawSize, (month.sizesMap.get(rawSize) || 0) + 1)

      // Conteo de productos por mes
      if (prod.name) {
        const pName = prod.name.trim()
        const pKey = pName.toLowerCase()
        const pCurrent = month.productsMap.get(pKey) || {
          name: pName,
          count: 0,
          grossRevenueUsd: 0,
          baseCostUsd: 0,
        }
        pCurrent.count += 1
        pCurrent.grossRevenueUsd += Number(prod.sale_price || 0)
        pCurrent.baseCostUsd += Number(prod.base_cost || 0)
        month.productsMap.set(pKey, pCurrent)
      }
    })
  })

  // Calcular márgenes por mes
  const monthlySeries = Array.from(monthlyDataMap.values()).map((m) => {
    m.netMarginUsd = Number((m.grossSalesUsd - m.expensesUsd).toFixed(2))
    m.profitMarginPercent =
      m.grossSalesUsd > 0
        ? Math.round((m.netMarginUsd / m.grossSalesUsd) * 100)
        : 0
    return m
  })

  // 3. Filtrar o consolidar según selectedMonthKey ("ALL" vs mes específico)
  const targetMonths =
    selectedMonthKey === "ALL"
      ? monthlySeries
      : monthlySeries.filter((m) => m.key === selectedMonthKey)

  // Totales acumulados para KPIs ejecutivos
  let periodGrossSalesUsd = 0
  let periodExpensesUsd = 0
  let periodCollectedIncomeUsd = 0
  let periodGarmentsCount = 0
  let periodPaidGarmentsCount = 0
  let periodActiveGarmentsCount = 0
  let periodOrdersCount = 0

  const consolidatedProductsMap = new Map()
  const consolidatedSizesMap = new Map()

  targetMonths.forEach((m) => {
    periodGrossSalesUsd += m.grossSalesUsd
    periodExpensesUsd += m.expensesUsd
    periodCollectedIncomeUsd += m.collectedIncomeUsd
    periodGarmentsCount += m.garmentsCount
    periodPaidGarmentsCount += m.paidGarmentsCount
    periodActiveGarmentsCount += m.activeGarmentsCount
    periodOrdersCount += m.ordersCount

    // Consolidar productos
    m.productsMap.forEach((val, key) => {
      const cur = consolidatedProductsMap.get(key) || {
        name: val.name,
        count: 0,
        grossRevenueUsd: 0,
        baseCostUsd: 0,
      }
      cur.count += val.count
      cur.grossRevenueUsd += val.grossRevenueUsd
      cur.baseCostUsd += val.baseCostUsd
      consolidatedProductsMap.set(key, cur)
    })

    // Consolidar tallas
    m.sizesMap.forEach((count, size) => {
      consolidatedSizesMap.set(
        size,
        (consolidatedSizesMap.get(size) || 0) + count
      )
    })
  })

  const periodNetMarginUsd = Number(
    (periodGrossSalesUsd - periodExpensesUsd).toFixed(2)
  )
  const periodProfitMarginPercent =
    periodGrossSalesUsd > 0
      ? Math.round((periodNetMarginUsd / periodGrossSalesUsd) * 100)
      : 0

  // Ticket promedio por orden (AOV)
  const averageOrderValueUsd =
    periodOrdersCount > 0
      ? Number((periodGrossSalesUsd / periodOrdersCount).toFixed(2))
      : 0

  // Promedio de prendas por orden
  const averageItemsPerOrder =
    periodOrdersCount > 0
      ? Number((periodGarmentsCount / periodOrdersCount).toFixed(1))
      : 0

  // Lista ordenada de Top Productos
  const topProducts = Array.from(consolidatedProductsMap.values())
    .map((p) => ({
      ...p,
      grossRevenueUsd: Number(p.grossRevenueUsd.toFixed(2)),
      estimatedProfitUsd: Number((p.grossRevenueUsd - p.baseCostUsd).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count || b.grossRevenueUsd - a.grossRevenueUsd)

  // Lista ordenada de Tallas con porcentaje
  const sizeDistribution = Array.from(consolidatedSizesMap.entries())
    .map(([size, count]) => ({
      size,
      count,
      percentage:
        periodGarmentsCount > 0
          ? Math.round((count / periodGarmentsCount) * 100)
          : 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Matriz de tallas mes a mes (para visualizar la tabla evolutiva de tallas)
  const allUniqueSizes = Array.from(
    new Set(monthlySeries.flatMap((m) => Array.from(m.sizesMap.keys())))
  ).sort()

  const monthlySizesMatrix = monthlySeries.map((m) => {
    const row = { key: m.key, label: m.label, total: m.garmentsCount }
    allUniqueSizes.forEach((s) => {
      row[s] = m.sizesMap.get(s) || 0
    })
    return row
  })

  return {
    monthlySeries,
    targetMonths,
    kpis: {
      periodGrossSalesUsd: Number(periodGrossSalesUsd.toFixed(2)),
      periodExpensesUsd: Number(periodExpensesUsd.toFixed(2)),
      periodCollectedIncomeUsd: Number(periodCollectedIncomeUsd.toFixed(2)),
      periodNetMarginUsd,
      periodProfitMarginPercent,
      periodGarmentsCount,
      periodPaidGarmentsCount,
      periodActiveGarmentsCount,
      periodOrdersCount,
      averageOrderValueUsd,
      averageItemsPerOrder,
    },
    topProducts,
    sizeDistribution,
    allUniqueSizes,
    monthlySizesMatrix,
  }
}

