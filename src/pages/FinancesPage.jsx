import { MovementsSection } from "@/components/finances/MovementsSection"

export function FinancesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Finanzas & Caja
        </h1>
        <p className="text-sm text-muted-foreground">
          Balance general en físico/digital, cuentas por cobrar, saldos por moneda e historial de pagos.
        </p>
      </div>

      <MovementsSection
        title="Todos los Pagos y Movimientos"
        description="Consulta y registra abonos de pedidos, ingresos y salidas en cualquier divisa."
        newButtonLabel="Registrar Pago / Movimiento"
      />
    </div>
  )
}

