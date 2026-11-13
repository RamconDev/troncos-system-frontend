import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
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
import { OrderCustomerFields } from "@/components/orders/OrderCustomerFields"
import { COMMON_SIZES, formatUsd } from "@/components/orders/order-constants"

const createEmptyProduct = () => ({
  name: "",
  size: "M",
  base_cost: "",
  sale_price: "",
  reference_url: "",
  notes: "",
})

const EMPTY_CUSTOMER_FORM = {
  name: "",
  phone: "",
  reference: "",
}

export function OrderCreateDialog({
  open,
  onOpenChange,
  customers = [],
  supplierOrders = [],
  defaultCustomerId = "",
  onSubmit,
  saving = false,
  error = null,
}) {
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("")
  const [customerForm, setCustomerForm] = React.useState(EMPTY_CUSTOMER_FORM)
  const [supplierOrderId, setSupplierOrderId] = React.useState("")
  const [products, setProducts] = React.useState([createEmptyProduct()])

  React.useEffect(() => {
    if (!open) return

    if (defaultCustomerId) {
      const found = customers.find(
        (c) => String(c.id) === String(defaultCustomerId)
      )
      if (found) {
        setSelectedCustomerId(String(found.id))
        setCustomerForm({
          name: found.name || "",
          phone: found.phone || "",
          reference: found.reference || "",
        })
      } else {
        setSelectedCustomerId("")
        setCustomerForm(EMPTY_CUSTOMER_FORM)
      }
    } else {
      setSelectedCustomerId("")
      setCustomerForm(EMPTY_CUSTOMER_FORM)
    }

    setSupplierOrderId("")
    setProducts([createEmptyProduct()])
  }, [open, defaultCustomerId, customers])

  const handleSelectExistingCustomer = (customer) => {
    setSelectedCustomerId(String(customer.id))
    setCustomerForm({
      name: customer.name || "",
      phone: customer.phone || "",
      reference: customer.reference || "",
    })
  }

  const handleClearExistingCustomer = () => {
    setSelectedCustomerId("")
    setCustomerForm(EMPTY_CUSTOMER_FORM)
  }

  const updateProductRow = (index, field, value) => {
    setProducts((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item
      )
    )
  }

  const addProductRow = () => {
    setProducts((prev) => [...prev, createEmptyProduct()])
  }

  const removeProductRow = (index) => {
    setProducts((prev) => prev.filter((_, idx) => idx !== index))
  }

  const totals = products.reduce(
    (acc, prod) => {
      if (!prod.name.trim()) return acc
      const cost = Number(prod.base_cost) || 0
      const sale = Number(prod.sale_price) || 0
      acc.cost += cost
      acc.sale += sale
      acc.profit += sale - cost
      return acc
    },
    { cost: 0, sale: 0, profit: 0 }
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    const validProducts = products
      .filter((p) => p.name.trim() !== "")
      .map((p) => ({
        name: p.name.trim(),
        size: p.size.trim() || null,
        base_cost: Number(p.base_cost) || 0,
        sale_price: Number(p.sale_price) || 0,
        reference_url: p.reference_url.trim() || null,
        notes: p.notes.trim() || null,
      }))

    onSubmit({
      selectedCustomerId: selectedCustomerId ? Number(selectedCustomerId) : null,
      newCustomerData: selectedCustomerId
        ? null
        : {
            name: customerForm.name.trim(),
            phone: customerForm.phone.trim() || null,
            reference: customerForm.reference.trim() || null,
          },
      orderPayload: {
        supplier_order_id: supplierOrderId ? Number(supplierOrderId) : null,
        delivery_status: "PENDING",
        payment_status: "UNPAID",
        products: validProducts,
      },
    })
  }

  const isCustomerValid = Boolean(
    selectedCustomerId || customerForm.name.trim()
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Orden de Cliente</DialogTitle>
          <DialogDescription>
            Ingresa los datos de un cliente nuevo o elige uno existente, y agrega las prendas del pedido.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-5">
          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          {/* 1. Datos del Cliente (Nuevo o Existente bloqueado) */}
          <OrderCustomerFields
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            customerForm={customerForm}
            onSelectExisting={handleSelectExistingCustomer}
            onClearExisting={handleClearExistingCustomer}
            onChangeForm={setCustomerForm}
          />

          {/* 2. Lote a Proveedor Opcional */}
          <div className="grid gap-1.5">
            <Label htmlFor="order-lot">Lote a Proveedor (Opcional)</Label>
            <select
              id="order-lot"
              className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none"
              value={supplierOrderId}
              onChange={(e) => setSupplierOrderId(e.target.value)}
            >
              <option value="">Sin lote asignado (Pendiente de armar lote)</option>
              {supplierOrders.map((lot) => (
                <option key={lot.id} value={lot.id}>
                  Lote {lot.code} ({lot.status})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Lista Dinámica de Productos Anidados */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Prendas del Pedido ({products.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addProductRow}
              >
                <Plus className="size-3.5" />
                Añadir Prenda
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {products.map((prod, idx) => (
                <div
                  key={idx}
                  className="grid gap-3 rounded-lg border bg-muted/20 p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Prenda #{idx + 1}
                    </span>
                    {products.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-destructive hover:text-destructive"
                        onClick={() => removeProductRow(idx)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                    <div className="sm:col-span-6">
                      <Input
                        placeholder="Nombre de la prenda (ej. Real Madrid 26/27 Home)"
                        value={prod.name}
                        onChange={(e) =>
                          updateProductRow(idx, "name", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        list="order-sizes-list"
                        placeholder="Talla"
                        value={prod.size}
                        onChange={(e) =>
                          updateProductRow(idx, "size", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Costo $"
                        value={prod.base_cost}
                        onChange={(e) =>
                          updateProductRow(idx, "base_cost", e.target.value)
                        }
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Venta $"
                        value={prod.sale_price}
                        onChange={(e) =>
                          updateProductRow(idx, "sale_price", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <Input
                      type="url"
                      placeholder="URL Yupoo (https://...)"
                      value={prod.reference_url}
                      onChange={(e) =>
                        updateProductRow(idx, "reference_url", e.target.value)
                      }
                    />
                    <Input
                      placeholder="Notas (ej. Player Adidas | Estampado: Messi, 10)"
                      value={prod.notes}
                      onChange={(e) =>
                        updateProductRow(idx, "notes", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
              <datalist id="order-sizes-list">
                {COMMON_SIZES.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Resumen de Totales Calculados */}
          <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/40 p-3 text-center text-xs sm:text-sm">
            <div>
              <span className="block text-xs text-muted-foreground">
                Costo Total
              </span>
              <strong className="font-semibold">{formatUsd(totals.cost)}</strong>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">
                Venta Total
              </span>
              <strong className="font-semibold">{formatUsd(totals.sale)}</strong>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground">
                Ganancia Estimada
              </span>
              <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatUsd(totals.profit)}
              </strong>
            </div>
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
            <Button type="submit" disabled={saving || !isCustomerValid}>
              {saving ? "Creando Orden..." : "Crear Orden"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
