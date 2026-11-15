import * as React from "react"
import { Landmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatUsd } from "@/components/orders/order-constants"
import { getMovementCategoryMeta } from "@/components/finances/movement-constants"

const INITIAL_FORM = {
  movement_type: "INCOME",
  amount: "",
  currency_id: "",
  category_id: "",
  source_id: "",
  description: "",
  update_order_payment_status: "",
}

export function MovementFormDialog({
  open,
  onOpenChange,
  initialData = null,
  defaultType = "INCOME",
  currencies = [],
  categories = [],
  orders = [],
  supplierOrders = [],
  onSubmit,
  saving = false,
  error = null,
}) {
  const isEditing = Boolean(initialData?.id)
  const [form, setForm] = React.useState(INITIAL_FORM)

  // Filtra categorías según el tipo de movimiento seleccionado (INCOME o EXPENSE)
  const filteredCategories = React.useMemo(() => {
    let list = categories.filter(
      (cat) => !cat.default_type || cat.default_type === form.movement_type
    )

    // Garantiza que para INCOME siempre estén disponibles ORDER_PAYMENT y CAPITAL_INJECTION
    if (form.movement_type === "INCOME") {
      const names = new Set(list.map((c) => c.name?.toUpperCase()))
      const enriched = [...list]
      if (!names.has("ORDER_PAYMENT")) {
        const existing = categories.find((c) => c.name?.toUpperCase() === "ORDER_PAYMENT")
        enriched.unshift({
          id: existing?.id || "ORDER_PAYMENT",
          name: "ORDER_PAYMENT",
          default_type: "INCOME",
          description: "Abono o pago de cliente por orden de compra",
        })
      }
      if (!names.has("CAPITAL_INJECTION")) {
        const existing = categories.find((c) => c.name?.toUpperCase() === "CAPITAL_INJECTION")
        enriched.push({
          id: existing?.id || "CAPITAL_INJECTION",
          name: "CAPITAL_INJECTION",
          default_type: "INCOME",
          description: "Aporte de capital propio, inversión o inyección de liquidez a la caja",
        })
      }
      return enriched
    }

    return list
  }, [categories, form.movement_type])

  React.useEffect(() => {
    if (!open) return

    if (initialData) {
      setForm({
        movement_type: initialData.movement_type || defaultType,
        amount: String(initialData.amount ?? ""),
        currency_id: String(initialData.currency_id ?? ""),
        category_id: String(initialData.category_id ?? ""),
        source_id: initialData.source_id ? String(initialData.source_id) : "",
        description: initialData.description || "",
        update_order_payment_status: "",
      })
    } else {
      const activeCurr =
        currencies.find((c) => c.code?.toUpperCase() === "USD" && c.is_active) ||
        currencies.find((c) => c.is_active) ||
        currencies[0]

      const initialCategories = categories.filter(
        (cat) => !cat.default_type || cat.default_type === defaultType
      )
      const matchingCat = initialCategories[0] || categories[0]

      setForm({
        ...INITIAL_FORM,
        movement_type: matchingCat?.default_type || defaultType,
        currency_id: activeCurr ? String(activeCurr.id) : "",
        category_id: matchingCat ? String(matchingCat.id) : "",
      })
    }
  }, [initialData, defaultType, currencies, categories, open])

  // Cambio dinámico de tipo de movimiento (INCOME <-> EXPENSE)
  const handleTypeChange = (newType) => {
    const matching = categories.filter(
      (c) => !c.default_type || c.default_type === newType
    )
    const firstCat = matching[0]

    setForm((prev) => ({
      ...prev,
      movement_type: newType,
      category_id: firstCat ? String(firstCat.id) : "",
      source_id: "",
    }))
  }

  // Cambio de categoría
  const handleCategoryChange = (categoryId) => {
    const selected =
      filteredCategories.find((cat) => String(cat.id) === String(categoryId)) ||
      categories.find((cat) => String(cat.id) === String(categoryId))

    const isCapInj = selected?.name?.toUpperCase() === "CAPITAL_INJECTION"

    setForm((prev) => ({
      ...prev,
      category_id: categoryId,
      movement_type: selected?.default_type || prev.movement_type,
      source_id: isCapInj ? "" : prev.source_id,
    }))
  }

  const selectedCategory = React.useMemo(() => {
    return (
      filteredCategories.find(
        (cat) => String(cat.id) === String(form.category_id)
      ) ||
      categories.find((cat) => String(cat.id) === String(form.category_id)) ||
      null
    )
  }, [filteredCategories, categories, form.category_id])

  const categoryName = (selectedCategory?.name || "").toUpperCase()
  const isCapitalInjection = categoryName === "CAPITAL_INJECTION"
  const isOrderPayment = categoryName === "ORDER_PAYMENT"
  const isExpense = form.movement_type === "EXPENSE"

  const selectedCurrency = React.useMemo(
    () =>
      currencies.find((c) => String(c.id) === String(form.currency_id)) || null,
    [currencies, form.currency_id]
  )

  const isForeignCurrency = Boolean(
    selectedCurrency &&
      selectedCurrency.code?.toUpperCase() !== "USD" &&
      Number(selectedCurrency.usd_rate || 1) !== 1
  )

  const amountNum = Number(form.amount) || 0
  const rateNum = Number(selectedCurrency?.usd_rate || 1)
  const estimatedUsd = rateNum > 0 ? amountNum / rateNum : 0

  const handleSubmit = (e) => {
    e.preventDefault()

    // Resolver category_id adecuado
    let resolvedCategoryId = Number(form.category_id)
    if (!resolvedCategoryId && selectedCategory) {
      resolvedCategoryId = Number(selectedCategory.id) || selectedCategory.id
    }

    const payload = {
      amount: amountNum,
      currency_id: Number(form.currency_id),
      category_id: resolvedCategoryId,
      movement_type: form.movement_type,
      // Si es CAPITAL_INJECTION, el source_id es estrictamente null
      source_id: isCapitalInjection ? null : (form.source_id ? Number(form.source_id) : null),
      description: form.description.trim() || null,
    }

    onSubmit(payload, form.update_order_payment_status || null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Movimiento Financiero" : "Registrar Movimiento"}
          </DialogTitle>
          <DialogDescription>
            Registra un ingreso o egreso en cualquier divisa; el equivalente en USD se calcula automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Tipo de Movimiento y Categoría con filtrado dinámico */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="mov-type">Tipo de Movimiento *</Label>
              <select
                id="mov-type"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.movement_type}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                <option value="INCOME">INCOME (Ingreso)</option>
                <option value="EXPENSE">EXPENSE (Egreso)</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mov-category">Categoría *</Label>
              <select
                id="mov-category"
                required
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.category_id}
                onChange={(e) => handleCategoryChange(e.target.value)}
              >
                <option value="">Selecciona categoría...</option>
                {filteredCategories.map((cat) => {
                  const meta = getMovementCategoryMeta(cat.name)
                  return (
                    <option key={cat.id} value={cat.id}>
                      {meta.label} ({cat.name})
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Moneda y Monto */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="mov-currency">Moneda *</Label>
              <select
                id="mov-currency"
                required
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.currency_id}
                onChange={(e) =>
                  setForm({ ...form, currency_id: e.target.value })
                }
              >
                <option value="">Moneda...</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mov-amount">
                Monto {selectedCurrency ? `(${selectedCurrency.symbol})` : ""} *
              </Label>
              <Input
                id="mov-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="Ej. 81400"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          {/* Conversión USD si la moneda es foránea */}
          {isForeignCurrency && (
            <div className="flex flex-col gap-1 rounded-md border bg-muted/40 px-3 py-2.5 text-xs">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Tasa de cambio aplicada:</span>
                <span className="font-mono font-medium text-foreground">
                  1 USD ={" "}
                  {rateNum.toLocaleString("es-CO", {
                    maximumFractionDigits: 4,
                  })}{" "}
                  {selectedCurrency.code}
                </span>
              </div>
              <div className="flex items-center justify-between border-t pt-1.5">
                <span className="text-muted-foreground">
                  Equivalente en dólares:
                </span>
                <strong className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                  {formatUsd(estimatedUsd)} USD
                </strong>
              </div>
            </div>
          )}

          {/* Vinculación condicional según categoría */}
          {isCapitalInjection ? (
            /* CAPITAL_INJECTION: source_id = null (selector oculto con banner explicativo) */
            <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-3 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
              <Landmark className="size-4 shrink-0 text-teal-600 dark:text-teal-400 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-teal-800 dark:text-teal-200">
                  Aporte de Capital Propio / Inyección de Liquidez
                </p>
                <p className="text-[11px] leading-relaxed text-teal-700 dark:text-teal-300">
                  Este ingreso incrementa el saldo disponible en caja sin vincularse
                  a pedidos de clientes (<code>source_id: null</code>). No se computa
                  como venta u orden comercial.
                </p>
              </div>
            </div>
          ) : isOrderPayment ? (
            /* ORDER_PAYMENT: Requiere orden de cliente */
            <div className="grid gap-2">
              <Label htmlFor="mov-source">
                Orden de Cliente Asociada * (source_id)
              </Label>
              <select
                id="mov-source"
                required
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.source_id}
                onChange={(e) =>
                  setForm({ ...form, source_id: e.target.value })
                }
              >
                <option value="">Selecciona el pedido a acreditar...</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    Orden #{ord.id} —{" "}
                    {ord.customer_name || `Cliente #${ord.customer_id}`} (Venta:{" "}
                    {formatUsd(ord.total_sale_price_usd)} • {ord.payment_status})
                  </option>
                ))}
              </select>
            </div>
          ) : isExpense ? (
            /* EXPENSE: Vinculación opcional a lote de compra */
            <div className="grid gap-2">
              <Label htmlFor="mov-source">
                Lote / Orden a Proveedor Asociado (Opcional — source_id)
              </Label>
              <select
                id="mov-source"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.source_id}
                onChange={(e) =>
                  setForm({ ...form, source_id: e.target.value })
                }
              >
                <option value="">Sin vincular a un lote específico</option>
                {supplierOrders.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    Lote {lot.code} (ID #{lot.id} • {lot.status})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            /* Otro ingreso sin restricción especial */
            <div className="grid gap-2">
              <Label htmlFor="mov-source">
                Orden de Cliente Asociada (Opcional — source_id)
              </Label>
              <select
                id="mov-source"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.source_id}
                onChange={(e) =>
                  setForm({ ...form, source_id: e.target.value })
                }
              >
                <option value="">Sin vincular a una orden específica</option>
                {orders.map((ord) => (
                  <option key={ord.id} value={ord.id}>
                    Orden #{ord.id} —{" "}
                    {ord.customer_name || `Cliente #${ord.customer_id}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Detalle o concepto */}
          <div className="grid gap-2">
            <Label htmlFor="mov-desc">Detalle del Movimiento / Concepto</Label>
            <Input
              id="mov-desc"
              placeholder={
                isCapitalInjection
                  ? "Ej. Inyección inicial de fondos para fletes y compras / Aporte propio a caja"
                  : isExpense
                    ? "Ej. Pago real proveedor con rebaja / Traída de paquetes desde Colombia"
                    : "Ej. Abono transferencia Bancolombia / Pago de pedido"
              }
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Registrar Movimiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
