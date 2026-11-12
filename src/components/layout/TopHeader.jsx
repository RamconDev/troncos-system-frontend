import { useLocation, Link } from "react-router-dom"
import { Search, Plus } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BackendStatusBadge } from "@/components/layout/BackendStatusBadge"
import { routeTitles } from "@/components/layout/nav-config"

export function TopHeader() {
  const location = useLocation()
  const currentTitle = routeTitles[location.pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear">
      {/* Lado Izquierdo: Trigger + Breadcrumbs */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden sm:inline-flex">
              <BreadcrumbLink asChild>
                <Link to="/" className="text-muted-foreground hover:text-foreground">
                  Inicio
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden sm:inline-flex" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold text-foreground">
                {currentTitle}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Lado Derecho: Buscador + Status + Botón de Acción */}
      <div className="flex items-center gap-3">
        <div className="relative hidden w-48 lg:w-64 md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar en el sistema..."
            className="w-full pl-8 bg-muted/40 h-9"
          />
        </div>

        <BackendStatusBadge />

        <Button size="sm" asChild className="gap-1 shadow-xs">
          <Link to="/nuevo">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Registro</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}

