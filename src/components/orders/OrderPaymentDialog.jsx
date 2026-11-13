import * as React from "react"
import { Banknote } from "lucide-react"
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
import { currenciesService } from "@/services/currencies.service"
import { movementCategoriesService } from "@/services/movement-categories.service"
import { movementsService } from "@/services/movements.service"
import { customerOrdersService } from "@/services/customer-orders.service"

export function OrderPaymentDialog({
  order,
  open,
  onOpenChange,
  onPaymentSuccess,
}) {
  const [currencies, setCurrencies] = React.useState([])
  const [paidSoFarUsd, setPaidSoFarUsd] = React.useState(0)
  const [currencyId, setCurrencyId] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [loadingInfo, setLoadingInfo] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    if (!open || !order?.id) return

    let active = true
    setError(null)
    setAmount("")
    setDescription("")
    setLoadingInfo(true)

    const loadPaymentContext = async () => {
      try {
        const [currRes, movRes] = await Promise.all([
          currenciesService.getAll({ is_active: "true" }),
          movementsService.getAll({
            source_id: order.id,
            movement_type: "INCOME",
          }),
        ])

        if (!active) return

        const currList = Array.isArray(currRes.data) ? currRes.data : []
        setCurrencies(currList)

        const defaultCurr =
          currList.find((c) => c.code?.toUpperCase() === "USD") || currList[0]
        if (defaultCurr) {
          setCurrencyId(String(defaultCurr.id))
        }

        const movList = Array.isArray(movRes.data) ? movRes.data : []
        const sumPaid = movList.reduce(
          (acc, m) => acc + Number(m.amount_usd || 0),
          0
        )
        setPaidSoFarUsd(Number(sumPaid.toFixed(2)))
      } catch (err) {
        if (active) setError(err.friendlyMessage || err.message)
      } finally {
        if (active) setLoadingInfo(false)
      }
    }

    loadPaymentContext()
    return () => {
      active = false
    }
  }, [open, order])

  const selectedCurrency = React.useMemo(
    () => currencies.find((c) => String(c.id) === String(currencyId)) || null,
    [currencies, currencyId]
  )

  const isForeignCurrency = Boolean(
    selectedCurrency &&
      selectedCurrency.code?.toUpperCase() !== "USD" &&
      Number(selectedCurrency.usd_rate || 1) !== 1
  )

  const rateNum = Number(selectedCurrency?.usd_rate || 1)
  const amountNum = Number(amount) || 0
  const equivalentUsd = rateNum > 0 ? amountNum / rateNum : 0

  const totalOrderUsd = Number(order?.total_sale_price_usd || 0)
  const remainingUsd = Math.max(
    0,
    Number((totalOrderUsd - paidSoFarUsd).toFixed(2))
  )

  const handleFillRemaining = () => {
    if (!selectedCurrency || remainingUsd <= 0) return
    const nativeRemaining = isForeignCurrency
      ? Math.ceil(remainingUsd * rateNum)
      : remainingUsd
    setAmount(String(nativeRemaining))
  }

  const resolveOrderPaymentCategoryId = async () => {
    const catRes = await movementCategoriesService.getAll({
      default_type: "INCOME",
    })
    const list = Array.isArray(catRes.data) ? catRes.data : []
    const existing =
      list.find((c) => c.name?.toUpperCase() === "ORDER_PAYMENT") || list[0]

    if (existing) return existing.id

    // Si aún no existe la categoría ORDER_PAYMENT en la base de datos, se crea automáticamente
    const created = await movementCategoriesService.create({
      name: "ORDER_PAYMENT",
      default_type: "INCOME",
      description: "Pagos y abonos recibidos de órdenes de clientes",
    })
    return created.data?.id
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!order?.id || !currencyId || amountNum <= 0) return

    setSaving(true)
    setError(null)
    try {
      const categoryId = await resolveOrderPaymentCategoryId()

      const movRes = await movementsService.create({
        amount: amountNum,
        currency_id: Number(currencyId),
        category_id: Number(categoryId),
        movement_type: "INCOME",
        source_id: Number(order.id),
        description:
          description.trim() ||
          `Pago de Orden #${order.id} (${order.customer_name || "Cliente"})`,
      })

      const createdUsd = Number(movRes.data?.amount_usd ?? equivalentUsd)
      const newTotalPaid = paidSoFarUsd + createdUsd
      const newPaymentStatus =
        totalOrderUsd > 0 && newTotalPaid + 0.05 >= totalOrderUsd
          ? "PAID"
          : "PARTIAL"

      if (order.payment_status !== newPaymentStatus) {
        await customerOrdersService.update(order.id, {
          payment_status: newPaymentStatus,
        })
      }

      onOpenChange(false)
      onPaymentSuccess?.()
    } catch (err) {
      setError(err.friendlyMessage || err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Banknote className="size-5 text-emerald-600 dark:text-emerald-400" />
            Realizar Pago — Orden #{order?.id}
          </DialogTitle>
          <DialogDescription>
            Cliente:{" "}
            <strong className="text-foreground">
              {order?.customer_name || `Cliente #${order?.customer_id}`}
            </strong>
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del saldo del pedido */}
        <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/30 p-3 text-center text-xs">
          <div>
            <span className="block text-muted-foreground">Total Pedido</span>
            <strong className="text-sm font-semibold">
              {formatUsd(totalOrderUsd)}
            </strong>
          </div>
          <div>
            <span className="block text-muted-foreground">Abonado</span>
            <strong className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {loadingInfo ? "..." : formatUsd(paidSoFarUsd)}
            </strong>
          </div>
          <div>
            <span className="block text-muted-foreground">Resta por Pagar</span>
            <strong className="text-sm font-semibold text-amber-600 dark:text-amber-400">
              {loadingInfo ? "..." : formatUsd(remainingUsd)}
            </strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="pay-currency">Moneda *</Label>
              <select
                id="pay-currency"
                required
                className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
                value={currencyId}
                onChange={(e) => setCurrencyId(e.target.value)}
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
              <div className="flex items-center justify-between">
                <Label htmlFor="pay-amount">
                  Monto {selectedCurrency ? `(${selectedCurrency.symbol})` : ""} *
                </Label>
                {remainingUsd > 0 && (
                  <button
                    type="button"
                    onClick={handleFillRemaining}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Pagar restante
                  </button>
                )}
              </div>
              <Input
                id="pay-amount"
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
                  {formatUsd(equivalentUsd)} USD
                </strong>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="pay-description">Descripción / Concepto</Label>
            <Input
              id="pay-description"
              placeholder="Ej. Abono transferencia Bancolombia / Pago móvil"
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
            <Button type="submit" disabled={saving || !currencyId || amountNum <= 0}>
              {saving ? "Registrando Pago..." : "Confirmar Pago"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

