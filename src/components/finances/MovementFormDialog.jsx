import * as React from "react"
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
      const matchingCat =
        categories.find((cat) => cat.default_type === defaultType) ||
        categories[0]

      setForm({
        ...INITIAL_FORM,
        movement_type: matchingCat?.default_type || defaultType,
        currency_id: activeCurr ? String(activeCurr.id) : "",
        category_id: matchingCat ? String(matchingCat.id) : "",
      })
    }
  }, [initialData, defaultType, currencies, categories, open])

  const handleCategoryChange = (categoryId) => {
    const selected = categories.find(
      (cat) => String(cat.id) === String(categoryId)
    )
    setForm((prev) => ({
      ...prev,
      category_id: categoryId,
      movement_type: selected?.default_type || prev.movement_type,
    }))
  }

  const selectedCategory = React.useMemo(
    () =>
      categories.find((cat) => String(cat.id) === String(form.category_id)) ||
      null,
    [categories, form.category_id]
  )

  const isLotExpenseCategory = React.useMemo(() => {
    const catName = selectedCategory?.name?.toUpperCase() || ""
    return (
      catName === "SUPPLIER_PAYMENT" ||
      catName === "LOGISTICS" ||
      form.movement_type === "EXPENSE"
    )
  }, [selectedCategory, form.movement_type])

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
    const payload = {
      amount: amountNum,
      currency_id: Number(form.currency_id),
      category_id: Number(form.category_id),
      movement_type: form.movement_type,
      source_id: form.source_id ? Number(form.source_id) : null,
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.default_type})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mov-type">Tipo de Movimiento *</Label>
              <select
                id="mov-type"
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={form.movement_type}
                onChange={(e) =>
                  setForm({ ...form, movement_type: e.target.value })
                }
              >
                <option value="INCOME">INCOME (Ingreso)</option>
                <option value="EXPENSE">EXPENSE (Egreso)</option>
              </select>
            </div>
          </div>

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

          {/* Solo se muestra si la moneda seleccionada es diferente de USD */}
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

          <div className="grid gap-2">
            <Label htmlFor="mov-source">
              {isLotExpenseCategory
                ? "Lote / Orden a Proveedor Asociado (Opcional — source_id)"
                : "Orden de Cliente Asociada (Opcional — source_id)"}
            </Label>
            <select
              id="mov-source"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
              value={form.source_id}
              onChange={(e) => setForm({ ...form, source_id: e.target.value })}
            >
              <option value="">
                {isLotExpenseCategory
                  ? "Sin vincular a un lote específico"
                  : "Sin vincular a una orden específica"}
              </option>
              {isLotExpenseCategory
                ? supplierOrders.map((lot) => (
                    <option key={lot.id} value={lot.id}>
                      Lote {lot.code} (ID #{lot.id} • {lot.status})
                    </option>
                  ))
                : orders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      Orden #{ord.id} —{" "}
                      {ord.customer_name || `Cliente #${ord.customer_id}`} (Venta:{" "}
                      {formatUsd(ord.total_sale_price_usd)} • {ord.payment_status})
                    </option>
                  ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mov-desc">Detalle del Gasto / Concepto</Label>
            <Input
              id="mov-desc"
              placeholder={
                isLotExpenseCategory
                  ? "Ej. Pago real proveedor con rebaja / Traída de paquetes desde Colombia"
                  : "Ej. Abono transferencia Bancolombia"
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
