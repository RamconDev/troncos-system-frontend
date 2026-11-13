import * as React from "react"
import { Users, UserPlus, Check, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export function OrderCustomerFields({
  customers = [],
  selectedCustomerId,
  customerForm,
  onSelectExisting,
  onClearExisting,
  onChangeForm,
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const isExistingSelected = Boolean(selectedCustomerId)

  const uniqueReferences = React.useMemo(
    () =>
      Array.from(
        new Set(customers.map((c) => c.reference).filter(Boolean))
      ).sort(),
    [customers]
  )

  const filteredCustomers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.reference?.toLowerCase().includes(q)
    )
  }, [customers, searchQuery])

  return (
    <div className="grid gap-3 rounded-lg border bg-muted/15 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold">Datos del Cliente</Label>
          {isExistingSelected ? (
            <Badge variant="default" className="text-[11px]">
              Cliente Existente #{selectedCustomerId}
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px]">
              Nuevo Cliente
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isExistingSelected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                onClearExisting()
                setPickerOpen(false)
              }}
            >
              <UserPlus className="size-3.5" />
              Crear Nuevo Cliente
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setPickerOpen((prev) => !prev)}
          >
            <Users className="size-3.5" />
            {pickerOpen
              ? "Cerrar Lista"
              : `Elegir Cliente Existente (${customers.length})`}
          </Button>
        </div>
      </div>

      {/* Buscador desplegable de clientes registrados */}
      {pickerOpen && (
        <div className="grid gap-2 rounded-md border bg-background p-2.5 shadow-xs">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar cliente por nombre, teléfono o referencia..."
              className="h-8 pl-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="max-h-40 overflow-y-auto divide-y rounded border">
            {filteredCustomers.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No se encontraron clientes registrados.
              </div>
            ) : (
              filteredCustomers.map((c) => {
                const isSelected = String(c.id) === String(selectedCustomerId)
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectExisting(c)
                      setPickerOpen(false)
                      setSearchQuery("")
                    }}
                    className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-foreground">
                        {c.name}
                      </span>
                      {c.phone && (
                        <span className="ml-2 font-mono text-muted-foreground">
                          • {c.phone}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {c.reference && (
                        <Badge variant="secondary" className="text-[10px]">
                          {c.reference}
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="size-3.5 text-emerald-600" />
                      )}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* Campos del cliente (se autocompletan y deshabilitan si es existente) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="grid gap-1.5">
          <Label htmlFor="order-cust-name" className="text-xs">
            Nombre Completo *
          </Label>
          <Input
            id="order-cust-name"
            placeholder="Ej. Angel Chacon"
            required
            disabled={isExistingSelected}
            value={customerForm.name}
            onChange={(e) =>
              onChangeForm({ ...customerForm, name: e.target.value })
            }
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="order-cust-phone" className="text-xs">
            Teléfono / WhatsApp
          </Label>
          <Input
            id="order-cust-phone"
            type="tel"
            placeholder="Ej. 5804147440064"
            disabled={isExistingSelected}
            value={customerForm.phone}
            onChange={(e) =>
              onChangeForm({ ...customerForm, phone: e.target.value })
            }
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="order-cust-ref" className="text-xs">
            Referencia / Grupo
          </Label>
          <Input
            id="order-cust-ref"
            list="order-cust-refs-list"
            placeholder="Ej. Mario, Viniles..."
            disabled={isExistingSelected}
            value={customerForm.reference}
            onChange={(e) =>
              onChangeForm({ ...customerForm, reference: e.target.value })
            }
          />
          {uniqueReferences.length > 0 && (
            <datalist id="order-cust-refs-list">
              {uniqueReferences.map((ref) => (
                <option key={ref} value={ref} />
              ))}
            </datalist>
          )}
        </div>
      </div>
    </div>
  )
}

