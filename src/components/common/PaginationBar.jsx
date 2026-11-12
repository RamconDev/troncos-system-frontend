import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PaginationBar({ meta, onPageChange }) {
  if (!meta || meta.total_pages <= 1) return null

  return (
    <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
      <span>
        Página <strong className="text-foreground">{meta.page}</strong> de{" "}
        <strong className="text-foreground">{meta.total_pages}</strong> ({meta.total} registros)
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.has_prev}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft className="size-4" />
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!meta.has_next}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Siguiente
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

