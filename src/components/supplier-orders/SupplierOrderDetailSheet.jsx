import * as React from "react"
import { Link } from "react-router-dom"
import {
  ExternalLink,
  Unlink,
  PlusCircle,
  ShoppingCart,
  Boxes,
  Wallet,
  Truck,
  Pencil,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { SupplierOrderStatusBadge } from "@/components/supplier-orders/SupplierOrderStatusBadge"
import { TrackingCodesStatusList } from "@/components/supplier-orders/TrackingCodesStatusList"
import { LotFinancialCards } from "@/components/supplier-orders/LotFinancialCards"
import {
  LotExpensesTable,
  LOT_EXPENSES_COLUMNS_CONFIG,
  DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS,
} from "@/components/supplier-orders/LotExpensesTable"
import { LotExpenseDialog } from "@/components/supplier-orders/LotExpenseDialog"
import { formatShortDate } from "@/components/supplier-orders/supplier-order-constants"
import {
  DeliveryStatusBadge,
  PaymentStatusBadge,
} from "@/components/orders/OrderStatusBadges"
import {
  formatUsd,
  ORDER_PRODUCTS_COLUMNS_CONFIG,
  DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS,
} from "@/components/orders/order-constants"
import { ColumnVisibilityDropdown } from "@/components/common/ColumnVisibilityDropdown"
import { supplierOrdersService } from "@/services/supplier-orders.service"
import { customerOrdersService } from "@/services/customer-orders.service"
import { movementsService } from "@/services/movements.service"

export function SupplierOrderDetailSheet({
  lotId,
  open,
  onOpenChange,
  onLotUpdated,
}) {
  const [lot, setLot] = React.useState(null)
  const [unassignedOrders, setUnassignedOrders] = React.useState([])
  const [lotMovements, setLotMovements] = React.useState([])
  const [selectedToLink, setSelectedToLink] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const [deletingMovId, setDeletingMovId] = React.useState(null)
  const [error, setError] = React.useState(null)

  const [expenseModalOpen, setExpenseModalOpen] = React.useState(false)
  const [expenseCategoryType, setExpenseCategoryType] =
    React.useState("SUPPLIER_PAYMENT")
  const [editingExpense, setEditingExpense] = React.useState(null)

  const [expenseVisibleColumns, setExpenseVisibleColumns] = React.useState(() => {
    try {
      const saved = localStorage.getItem("lot_expenses_columns_v1")
      if (saved) {
        return { ...DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS, ...JSON.parse(saved) }
      }
    } catch (_) {}
    return DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS
  })

  const handleToggleExpenseColumn = (columnId) => {
    setExpenseVisibleColumns((prev) => {
      const next = { ...prev, [columnId]: !prev[columnId] }
      try {
        localStorage.setItem("lot_expenses_columns_v1", JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  const handleResetExpenseColumns = () => {
    setExpenseVisibleColumns(DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS)
    try {
      localStorage.setItem(
        "lot_expenses_columns_v1",
        JSON.stringify(DEFAULT_LOT_EXPENSES_VISIBLE_COLUMNS)
      )
    } catch (_) {}
  }

  const [lotProductVisibleColumns, setLotProductVisibleColumns] = React.useState(() => {
    try {
      const saved = localStorage.getItem("order_products_columns_v1")
      if (saved) {
        return { ...DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS, ...JSON.parse(saved) }
      }
    } catch (_) {}
    return DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS
  })

  const handleToggleLotProductColumn = (columnId) => {
    setLotProductVisibleColumns((prev) => {
      const next = { ...prev, [columnId]: !prev[columnId] }
      try {
        localStorage.setItem("order_products_columns_v1", JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  const handleResetLotProductColumns = () => {
    setLotProductVisibleColumns(DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS)
    try {
      localStorage.setItem(
        "order_products_columns_v1",
        JSON.stringify(DEFAULT_ORDER_PRODUCTS_VISIBLE_COLUMNS)
      )
    } catch (_) {}
  }

  const loadDetail = React.useCallback(async () => {
    if (!lotId) return
    setLoading(true)
    setError(null)
    try {
      const [lotRes, unassignedRes, movRes] = await Promise.all([
        supplierOrdersService.getById(lotId),
        customerOrdersService.getAll({ unassigned_only: "true" }),
        movementsService.getAll({ source_id: lotId, movement_type: "EXPENSE" }),
      ])
      setLot(lotRes.data)
      setUnassignedOrders(
        Array.isArray(unassignedRes.data) ? unassignedRes.data : []
      )
      const allLotExpenses = Array.isArray(movRes.data) ? movRes.data : []
      setLotMovements(
        allLotExpenses.filter(
          (m) =>
            Number(m.source_id) === Number(lotId) &&
            m.movement_type === "EXPENSE"
        )
      )
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setLoading(false)
    }
  }, [lotId])

  React.useEffect(() => {
    if (open && lotId) {
      loadDetail()
    }
  }, [open, lotId, loadDetail])

  const handleLinkOrder = async () => {
    if (!selectedToLink || !lot) return
    setUpdating(true)
    setError(null)
    try {
      await customerOrdersService.update(Number(selectedToLink), {
        supplier_order_id: lot.id,
      })
      setSelectedToLink("")
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleUnlinkOrder = async (orderId) => {
    setUpdating(true)
    setError(null)
    try {
      await customerOrdersService.update(orderId, {
        supplier_order_id: null,
      })
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleAutoMarkLotDelivered = async () => {
    if (!lot || lot.status === "DELIVERED" || lot.status === "RECEIVED") return
    setUpdating(true)
    setError(null)
    try {
      await supplierOrdersService.update(lot.id, { status: "DELIVERED" })
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleMarkLotReceivedInHand = async () => {
    if (!lot || lot.status === "RECEIVED") return
    setUpdating(true)
    setError(null)
    try {
      await supplierOrdersService.update(lot.id, { status: "RECEIVED" })
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteLotMovement = async (movOrId) => {
    const id = typeof movOrId === "object" ? movOrId.id : movOrId
    setDeletingMovId(id)
    setError(null)
    try {
      await movementsService.remove(id)
      await loadDetail()
      onLotUpdated?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setDeletingMovId(null)
    }
  }

  const handleOpenSupplierPayment = (existingExpense = null) => {
    setExpenseCategoryType("SUPPLIER_PAYMENT")
    setEditingExpense(existingExpense || null)
    setExpenseModalOpen(true)
  }

  const handleOpenLogistics = (existingExpense = null) => {
    setExpenseCategoryType("LOGISTICS")
    setEditingExpense(existingExpense || null)
    setExpenseModalOpen(true)
  }

  const customerOrders = lot?.customer_orders || []

  // Consolidado financiero del lote según SPEC 1 & 3 (soporta respuesta del backend o cálculo fallback)
  const financialSummary = React.useMemo(() => {
    const ordersList = customerOrders
    const garmentsCount = ordersList.reduce(
      (sum, ord) => sum + (ord.products?.length ?? 0),
      0
    )
    const estimatedBaseCost = ordersList.reduce(
      (sum, ord) => sum + Number(ord.total_base_cost_usd || 0),
      0
    )
    const totalSalePrice = ordersList.reduce(
      (sum, ord) => sum + Number(ord.total_sale_price_usd || 0),
      0
    )

    // Si el backend ya devuelve financial_summary, lo usamos como fuente primaria
    if (lot?.financial_summary) {
      const bSummary = lot.financial_summary
      const expensesList =
        Array.isArray(bSummary.expenses) && bSummary.expenses.length > 0
          ? bSummary.expenses
          : lotMovements

      return {
        ...bSummary,
        estimated_base_cost_usd:
          Number(bSummary.estimated_base_cost_usd) || estimatedBaseCost,
        total_sale_price_usd:
          Number(bSummary.total_sale_price_usd) || totalSalePrice,
        garmentsCount,
        ordersCount: ordersList.length,
        expenses: expensesList,
      }
    }

    // Cálculo fallback local si el backend aún no provee el objeto consolidado
    const supplierExpenses = lotMovements.filter(
      (m) => m.category_name?.toUpperCase() === "SUPPLIER_PAYMENT"
    )
    const logisticsExpenses = lotMovements.filter(
      (m) => m.category_name?.toUpperCase() !== "SUPPLIER_PAYMENT"
    )

    const supplierPayment = supplierExpenses.reduce(
      (sum, m) => sum + Number(m.amount_usd || 0),
      0
    )
    const hasRealSupplierPayment = supplierExpenses.length > 0
    const supplierDiscount = hasRealSupplierPayment
      ? Number((estimatedBaseCost - supplierPayment).toFixed(2))
      : 0
    const logisticsExpense = logisticsExpenses.reduce(
      (sum, m) => sum + Number(m.amount_usd || 0),
      0
    )
    const effectiveMerchandiseCost = hasRealSupplierPayment
      ? supplierPayment
      : estimatedBaseCost
    const totalRealCost = Number(
      (effectiveMerchandiseCost + logisticsExpense).toFixed(2)
    )
    const realProfit = Number((totalSalePrice - totalRealCost).toFixed(2))

    return {
      estimated_base_cost_usd: Number(estimatedBaseCost.toFixed(2)),
      has_real_supplier_payment: hasRealSupplierPayment,
      supplier_payment_usd: Number(supplierPayment.toFixed(2)),
      supplier_discount_usd: supplierDiscount,
      logistics_expense_usd: Number(logisticsExpense.toFixed(2)),
      effective_merchandise_cost_usd: Number(
        effectiveMerchandiseCost.toFixed(2)
      ),
      total_real_cost_usd: totalRealCost,
      total_sale_price_usd: Number(totalSalePrice.toFixed(2)),
      estimated_profit_usd: Number((totalSalePrice - estimatedBaseCost).toFixed(2)),
      real_profit_usd: realProfit,
      garmentsCount,
      ordersCount: ordersList.length,
      expenses: lotMovements,
    }
  }, [lot, customerOrders, lotMovements])

  // Primer movimiento de pago a proveedor registrado para edición rápida
  const existingSupplierExpense = React.useMemo(() => {
    return (
      financialSummary.expenses?.find(
        (e) => e.category_name?.toUpperCase() === "SUPPLIER_PAYMENT"
      ) || null
    )
  }, [financialSummary.expenses])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl overflow-y-auto p-0"
      >
        <SheetHeader className="border-b p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pr-6">
            <SheetTitle className="font-mono text-lg">
              Lote {lot?.code || `#${lotId}`}
            </SheetTitle>
            {lot && <SupplierOrderStatusBadge status={lot.status} />}
          </div>
          <SheetDescription className="flex flex-col gap-1.5 pt-1 text-xs">
            <span>
              Creado: {formatShortDate(lot?.created_at)}{" "}
              {lot?.notes ? `• ${lot.notes}` : ""} •{" "}
              <strong>{financialSummary.garmentsCount}</strong> prendas en{" "}
              <strong>{financialSummary.ordersCount}</strong> pedido(s)
            </span>
          </SheetDescription>
        </SheetHeader>

        {error && (
          <div className="m-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Lista de Códigos de Rastreo con Indicador de Estado por Guía */}
        {lot && (
          <TrackingCodesStatusList
            trackingCode={lot.tracking_code}
            trackingItems={lot.trackings}
            lotStatus={lot.status}
            onAllPackagesDelivered={handleAutoMarkLotDelivered}
          />
        )}

        {/* Banner cuando todos los paquetes ya fueron entregados en Colombia y están listos para recoger */}
        {lot?.status === "DELIVERED" && (
          <div className="flex flex-col gap-2 border-b bg-purple-500/10 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="font-medium text-purple-800 dark:text-purple-300">
              Todos los paquetes de este lote figuran como{" "}
              <strong>Entregados en Colombia</strong>. Cuando ya los hayas retirado
              y estén en tus manos, márcalo como Recibido:
            </span>
            <Button
              size="sm"
              disabled={updating}
              onClick={handleMarkLotReceivedInHand}
              className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Marcar como Recibido (En mis manos)
            </Button>
          </div>
        )}

        {/* Tarjetas KPI Financieras del Lote (SPEC 4.1) */}
        <LotFinancialCards summary={financialSummary} />

        {/* Sección de Acciones de Egresos y Tabla de Gastos (SPEC 4.2 & 4.3) */}
        <div className="flex flex-col gap-3 border-b bg-muted/10 p-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                Egresos del Lote (Pago a Proveedor y Logística)
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Compara el costo base estimado contra lo efectivamente pagado y registra fletes o traslados.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Botón Pago Proveedor: Si ya se pagó cambia a "Editar Pago Proveedor" (SPEC 4.2) */}
              <Button
                type="button"
                size="sm"
                variant={financialSummary.has_real_supplier_payment ? "outline" : "default"}
                className="h-8 px-2.5 text-xs"
                onClick={() => handleOpenSupplierPayment(existingSupplierExpense)}
              >
                {financialSummary.has_real_supplier_payment ? (
                  <>
                    <Pencil className="size-3.5 text-primary" />
                    Editar Pago Proveedor
                  </>
                ) : (
                  <>
                    <Wallet className="size-3.5" />
                    Pago Proveedor
                  </>
                )}
              </Button>

              {/* Botón + Gasto Logística: Multi-entry siempre habilitado (SPEC 4.2) */}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs"
                onClick={() => handleOpenLogistics(null)}
              >
                <Truck className="size-3.5 text-rose-500" />
                + Gasto Logística
              </Button>

              {/* Selector de columnas de la tabla de egresos */}
              <ColumnVisibilityDropdown
                columns={LOT_EXPENSES_COLUMNS_CONFIG}
                visibleColumns={expenseVisibleColumns}
                onToggleColumn={handleToggleExpenseColumn}
                onResetColumns={handleResetExpenseColumns}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Tabla de Gastos del Lote (SPEC 4.3) */}
          <LotExpensesTable
            expenses={financialSummary.expenses}
            visibleColumns={expenseVisibleColumns}
            deletingId={deletingMovId}
            onEditExpense={(exp) => {
              if (exp.category_name === "SUPPLIER_PAYMENT") {
                handleOpenSupplierPayment(exp)
              } else {
                handleOpenLogistics(exp)
              }
            }}
            onDeleteExpense={handleDeleteLotMovement}
          />
        </div>

        {/* Barra Rápida para Agregar Orden Sin Lote */}
        <div className="flex flex-col gap-2 border-b bg-background px-4 py-3 sm:flex-row sm:items-center sm:px-6">
          <select
            className="border-input bg-background h-9 flex-1 rounded-md border px-3 text-xs shadow-xs outline-none"
            value={selectedToLink}
            onChange={(e) => setSelectedToLink(e.target.value)}
          >
            <option value="">
              + Agregar una orden pendiente a este lote ({unassignedOrders.length} disponibles)...
            </option>
            {unassignedOrders.map((ord) => (
              <option key={ord.id} value={ord.id}>
                Orden #{ord.id} — {ord.customer_name || `Cliente #${ord.customer_id}`} (
                {ord.products?.length ?? 0} prendas • Costo Base{" "}
                {formatUsd(ord.total_base_cost_usd)})
              </option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={!selectedToLink || updating}
            onClick={handleLinkOrder}
            className="w-full sm:w-auto"
          >
            <PlusCircle className="size-4" />
            Vincular al Lote
          </Button>
        </div>

        {/* Lista de Órdenes y Prendas dentro del Lote */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/15 px-4 py-2.5 sm:px-6">
          <span className="text-xs font-semibold text-foreground">
            Órdenes y Prendas Asignadas ({customerOrders.length})
          </span>
          {customerOrders.length > 0 && (
            <ColumnVisibilityDropdown
              columns={ORDER_PRODUCTS_COLUMNS_CONFIG.filter((c) => c.id !== "salePrice")}
              visibleColumns={lotProductVisibleColumns}
              onToggleColumn={handleToggleLotProductColumn}
              onResetColumns={handleResetLotProductColumns}
              className="h-7 text-xs"
            />
          )}
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Cargando órdenes del lote...
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
              <ShoppingCart className="size-8 text-muted-foreground/50" />
              <p>Este lote aún no tiene órdenes de clientes vinculadas.</p>
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div key={ord.id} className="flex flex-col gap-3 p-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/pedidos?order_id=${ord.id}`}
                      className="font-mono text-xs font-bold text-primary hover:underline"
                    >
                      Orden #{ord.id}
                    </Link>
                    <span className="font-semibold text-sm">
                      {ord.customer_name || `Cliente #${ord.customer_id}`}
                    </span>
                    <DeliveryStatusBadge status={ord.delivery_status} />
                    <PaymentStatusBadge status={ord.payment_status} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Costo Base:{" "}
                      <strong>{formatUsd(ord.total_base_cost_usd)}</strong>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={updating}
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      title="Desvincular orden de este lote"
                      onClick={() => handleUnlinkOrder(ord.id)}
                    >
                      <Unlink className="size-3.5" />
                      Quitar
                    </Button>
                  </div>
                </div>

                {/* Prendas de la orden */}
                {ord.products?.length > 0 ? (
                  <div className="grid gap-1.5 rounded-md border bg-muted/20 p-2.5 text-xs">
                    {ord.products.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex flex-wrap items-center justify-between gap-2 border-b last:border-b-0 pb-1.5 last:pb-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Boxes className="size-3.5 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">
                            {prod.name}
                          </span>
                          {lotProductVisibleColumns.size !== false && (
                            <Badge variant="secondary" className="font-mono text-[10px]">
                              {prod.size || "—"}
                            </Badge>
                          )}
                          {lotProductVisibleColumns.notes !== false && prod.notes && (
                            <span className="text-muted-foreground truncate">
                              ({prod.notes})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lotProductVisibleColumns.referenceUrl !== false && prod.reference_url && (
                            <a
                              href={prod.reference_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-primary hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              Yupoo
                            </a>
                          )}
                          {lotProductVisibleColumns.baseCost !== false && (
                            <span className="font-mono text-muted-foreground">
                              {formatUsd(prod.base_cost)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin prendas cargadas en esta orden.
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal de Registro y Edición de Gastos (SPEC 4.2) */}
        <LotExpenseDialog
          open={expenseModalOpen}
          onOpenChange={setExpenseModalOpen}
          lot={lot}
          categoryType={expenseCategoryType}
          initialExpense={editingExpense}
          estimatedBaseCostUsd={financialSummary.estimated_base_cost_usd}
          onExpenseSuccess={async () => {
            await loadDetail()
            onLotUpdated?.()
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
