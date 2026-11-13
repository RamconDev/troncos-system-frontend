import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatUsd } from "@/components/orders/order-constants"
import { movementsService } from "@/services/movements.service"
import { currenciesService } from "@/services/currencies.service"
import { movementCategoriesService } from "@/services/movement-categories.service"

/**
 * Diálogo unificado para registrar o editar egresos de lote según SPEC 4.2:
 * - Modo SUPPLIER_PAYMENT: Live diff Delta = estimated_base_cost_usd - (amount / exchange_rate)
 * - Modo LOGISTICS: Multi-registro de fletes/traslados con moneda y tasa
 */
export function LotExpenseDialog({
  open,
  onOpenChange,
  lot,
  categoryType = "SUPPLIER_PAYMENT", // 'SUPPLIER_PAYMENT' | 'LOGISTICS'
  initialExpense = null, // Si se pasa, edita el movimiento existente
  estimatedBaseCostUsd = 0,
  onExpenseSuccess,
}) {
  const isEditing = Boolean(initialExpense?.id)
  const isSupplierPayment =
    (initialExpense?.category_name || categoryType) === "SUPPLIER_PAYMENT"

  const [currencies, setCurrencies] = React.useState([])
  const [categories, setCategories] = React.useState([])
  const [currencyId, setCurrencyId] = React.useState("")
  const [exchangeRate, setExchangeRate] = React.useState("1")
  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [loadingCatalogs, setLoadingCatalogs] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(null)

  // Cargar monedas y categorías
  React.useEffect(() => {
    if (!open) return

    let active = true
    setLoadingCatalogs(true)
    setError(null)

    Promise.all([
      currenciesService.getAll({ is_active: "true" }),
      movementCategoriesService.getAll(),
    ])
      .then(([currRes, catRes]) => {
        if (!active) return
        const currList = Array.isArray(currRes.data) ? currRes.data : []
        const catList = Array.isArray(catRes.data) ? catRes.data : []
        setCurrencies(currList)
        setCategories(catList)

        if (initialExpense) {
          setAmount(String(initialExpense.amount ?? ""))
          setCurrencyId(String(initialExpense.currency_id ?? ""))
          setExchangeRate(String(initialExpense.applied_exchange_rate ?? 1))
          setDescription(initialExpense.description || "")
        } else {
          // Defaults para creación
          const defaultCurrency =
            currList.find(
              (c) => c.code?.toUpperCase() === "USDT" || c.code?.toUpperCase() === "USD"
            ) || currList[0]

          const initCurrId = defaultCurrency ? String(defaultCurrency.id) : ""
          setCurrencyId(initCurrId)
          setExchangeRate(String(defaultCurrency?.usd_rate || 1))

          if (isSupplierPayment) {
            setAmount(estimatedBaseCostUsd > 0 ? String(estimatedBaseCostUsd) : "")
            setDescription(`Pago real a proveedor — Lote ${lot?.code || ""}`)
          } else {
            setAmount("")
            setDescription(`Gasto logística — Lote ${lot?.code || ""}`)
          }
        }
      })
      .catch((err) => {
        if (!active) return
        setError(err.friendlyMessage || err.message)
      })
      .finally(() => {
        if (active) setLoadingCatalogs(false)
      })

    return () => {
      active = false
    }
  }, [open, initialExpense, isSupplierPayment, estimatedBaseCostUsd, lot?.code])

  // Al cambiar la moneda en el selector, sincronizar automáticamente la tasa
  const handleCurrencyChange = (newCurrId) => {
    setCurrencyId(newCurrId)
    const found = currencies.find((c) => String(c.id) === String(newCurrId))
    if (found) {
      setExchangeRate(String(found.usd_rate || 1))
    }
  }

  const selectedCurrency = React.useMemo(
    () => currencies.find((c) => String(c.id) === String(currencyId)) || null,
    [currencies, currencyId]
  )

  const isForeignCurrency = Boolean(
    selectedCurrency &&
      selectedCurrency.code?.toUpperCase() !== "USD" &&
      selectedCurrency.code?.toUpperCase() !== "USDT"
  )

  // Cálculo en vivo del monto convertido a USD y el ahorro/diferencia (SPEC 4.2)
  const currentAmount = parseFloat(amount) || 0
  const currentRate = parseFloat(exchangeRate) || 1
  const calculatedUsd = currentRate > 0 ? currentAmount / currentRate : 0
  const discountUsd = Number((estimatedBaseCostUsd - calculatedUsd).toFixed(2))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!lot) return

    if (currentAmount <= 0) {
      setError("El monto debe ser mayor a 0.")
      return
    }

    const targetCategory =
      categories.find(
        (c) =>
          c.name?.toUpperCase() ===
          (isSupplierPayment ? "SUPPLIER_PAYMENT" : "LOGISTICS")
      ) ||
      categories.find((c) => c.default_type === "EXPENSE")

    if (!targetCategory) {
      setError(
        `Categoría ${isSupplierPayment ? "SUPPLIER_PAYMENT" : "LOGISTICS"} no encontrada en el sistema.`
      )
      return
    }

    const payload = {
      movement_type: "EXPENSE",
      category_id: Number(targetCategory.id),
      currency_id: Number(currencyId),
      amount: currentAmount,
      applied_exchange_rate: currentRate,
      source_id: lot.id,
      description: description.trim() || undefined,
    }

    setSaving(true)
    setError(null)
    try {
      if (isEditing) {
        await movementsService.update(initialExpense.id, payload)
      } else {
        await movementsService.create(payload)
      }

      onOpenChange(false)
      onExpenseSuccess?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!lot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Editar Gasto — Lote ${lot.code}`
              : isSupplierPayment
                ? `Registrar Pago al Proveedor — Lote ${lot.code}`
                : `Registrar Gasto de Logística — Lote ${lot.code}`}
          </DialogTitle>
          <DialogDescription>
            {isSupplierPayment
              ? "Registra el monto efectivamente pagado al proveedor por la mercancía de este lote."
              : "Registra traslados, fletes, encomiendas o comisiones asociadas a este lote."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* Resumen en vivo de costo base y ahorro para SUPPLIER_PAYMENT (SPEC 4.2) */}
          {isSupplierPayment && (
            <div className="rounded-lg border bg-muted/30 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Costo Estimado Base (prendas):
                </span>
                <span className="font-mono font-semibold">
                  {formatUsd(estimatedBaseCostUsd)} USD
                </span>
              </div>

              {currentAmount > 0 && (
                <div className="flex items-center justify-between border-t pt-1.5">
                  <span className="text-muted-foreground">
                    Diferencia / Ahorro en vivo:
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      discountUsd >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    {discountUsd >= 0
                      ? `+${formatUsd(discountUsd)} de ahorro`
                      : `-${formatUsd(Math.abs(discountUsd))} de sobrecosto`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Selector de Moneda y Monto */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="lot-expense-currency">Moneda *</Label>
              <select
                id="lot-expense-currency"
                required
                disabled={loadingCatalogs || saving}
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={currencyId}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="">Selecciona moneda...</option>
                {currencies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lot-expense-amount">
                Monto {selectedCurrency ? `(${selectedCurrency.symbol})` : ""} *
              </Label>
              <Input
                id="lot-expense-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                required
                disabled={saving}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Tasa de Cambio */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="lot-expense-rate">Tasa de Cambio (1 USD =)</Label>
              {isForeignCurrency && (
                <span className="font-mono text-[11px] text-muted-foreground">
                  Equivalente:{" "}
                  <strong className="text-rose-600 dark:text-rose-400">
                    {formatUsd(calculatedUsd)} USD
                  </strong>
                </span>
              )}
            </div>
            <Input
              id="lot-expense-rate"
              type="number"
              step="any"
              min="0.0001"
              required
              disabled={saving}
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
          </div>

          {/* Descripción / Concepto */}
          <div className="grid gap-2">
            <Label htmlFor="lot-expense-desc">Concepto / Descripción</Label>
            <Input
              id="lot-expense-desc"
              disabled={saving}
              placeholder={
                isSupplierPayment
                  ? "Ej. Pago real al proveedor por lote completo"
                  : "Ej. Pago a motorizado por traer paquetes Cúcuta - San Cristóbal"
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            <Button type="submit" disabled={saving || loadingCatalogs}>
              {saving
                ? "Guardando..."
                : isEditing
                  ? "Guardar Cambios"
                  : "Guardar Gasto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
