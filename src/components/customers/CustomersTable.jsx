import { Link } from "react-router-dom"
import {
  Pencil,
  Trash2,
  Phone,
  MessageCircle,
  ShoppingBag,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function getInitials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CL"
}

function cleanWhatsAppPhone(phone = "") {
  return String(phone).replace(/\D/g, "")
}

export function CustomersTable({
  customers,
  loading,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="p-8 text-center text-sm text-muted-foreground">
        Cargando directorio de clientes...
      </div>
    )
  }

  if (!customers.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-10 text-center text-sm text-muted-foreground">
        <Users className="size-8 text-muted-foreground/50" />
        <p>No se encontraron clientes con los filtros seleccionados.</p>
      </div>
    )
  }

  return (
    <>
      {/* Vista Móvil: Tarjetas apiladas (< md) */}
      <div className="divide-y md:hidden">
        {customers.map((customer) => {
          const waPhone = cleanWhatsAppPhone(customer.phone)
          return (
            <div key={customer.id} className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar className="size-9 rounded-lg shrink-0">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {customer.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      ID #{customer.id}
                    </p>
                  </div>
                </div>

                {customer.reference && (
                  <Badge variant="secondary" className="shrink-0">
                    {customer.reference}
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {customer.phone ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="size-3.5" />
                    <span className="font-mono">{customer.phone}</span>
                    {waPhone && (
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <MessageCircle className="size-3" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Sin teléfono
                  </span>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    asChild
                    title="Ver pedidos del cliente"
                  >
                    <Link to={`/pedidos?customer_id=${customer.id}`}>
                      <ShoppingBag className="size-3.5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    title="Editar cliente"
                    onClick={() => onEdit(customer)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    title="Eliminar cliente"
                    onClick={() => onDelete(customer)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Vista Tablet y Desktop: Tabla completa (>= md) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">ID</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Teléfono / WhatsApp</TableHead>
              <TableHead>Referencia / Grupo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => {
              const waPhone = cleanWhatsAppPhone(customer.phone)
              return (
                <TableRow key={customer.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{customer.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                          {getInitials(customer.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground">
                        {customer.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {customer.phone ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">
                          {customer.phone}
                        </span>
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Abrir chat en WhatsApp"
                            className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                          >
                            <MessageCircle className="size-3" />
                            Chat
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {customer.reference ? (
                      <Badge variant="secondary">{customer.reference}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        title="Ver pedidos del cliente"
                      >
                        <Link to={`/pedidos?customer_id=${customer.id}`}>
                          <ShoppingBag className="size-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Editar cliente"
                        onClick={() => onEdit(customer)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        title="Eliminar cliente"
                        onClick={() => onDelete(customer)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

