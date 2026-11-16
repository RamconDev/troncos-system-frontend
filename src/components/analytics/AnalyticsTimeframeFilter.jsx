import * as React from "react"
import { Calendar, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AnalyticsTimeframeFilter({
  timeframe = 6,
  onTimeframeChange,
  monthlySeries = [],
  selectedMonthKey = "ALL",
  onSelectMonthKey,
  loading = false,
  onRefresh,
}) {
  const options = [
    { value: 3, label: "3 Meses" },
    { value: 6, label: "6 Meses" },
    { value: 12, label: "12 Meses" },
    { value: "ytd", label: "Año Actual" },
  ]

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-3 shadow-2xs">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1">
          <Calendar className="size-3.5" />
          Rango temporal:
        </span>

        {/* Botonera de Opciones Rápidas */}
        <div className="inline-flex rounded-md border bg-muted p-0.5 text-xs">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => {
                onTimeframeChange?.(opt.value)
                onSelectMonthKey?.("ALL")
              }}
              className={`rounded px-2.5 py-1 font-medium transition-colors ${
                timeframe === opt.value
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Selector de Mes Específico */}
        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Mes enfocado:
          </span>
          <select
            value={selectedMonthKey}
            onChange={(e) => onSelectMonthKey?.(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="ALL">Todo el rango seleccionado</option>
            {monthlySeries.map((m) => (
              <option key={m.key} value={m.key}>
                {m.fullLabel}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={onRefresh}
          className="h-8 text-xs"
        >
          <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </Button>
      </div>
    </div>
  )
}

