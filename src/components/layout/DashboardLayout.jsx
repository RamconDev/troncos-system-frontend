import * as React from "react"
import { Outlet, useLocation, Link } from "react-router-dom"
import { Search, Plus } from "lucide-react"

import { AppSidebar } from "@/components/layout/AppSidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
import { Badge } from "@/components/ui/badge"

// Diccionario de títulos dinámicos según ruta
const routeTitles = {
  "/": "Vista General",
  "/pedidos": "Pedidos de Clientes",
  "/productos": "Catálogo de Productos",
  "/lotes": "Lotes a Proveedor",
  "/finanzas": "Finanzas & Caja",
  "/gastos": "Gastos y Costos",
  "/proveedores": "Proveedores",
  "/configuracion": "Configuración",
}

export function DashboardLayout() {
  const location = useLocation()
  const currentTitle = routeTitles[location.pathname] || "Dashboard"

  return (
    <SidebarProvider>
      {/* 1. BARRA DE MENÚ EN LA COLUMNA IZQUIERDA */}
      <AppSidebar />

      {/* 2. CONTENEDOR DERECHO */}
      <SidebarInset>
        {/* MENÚ DEL TOP (HEADER SUPERIOR) */}
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

            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1.5 py-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>En Línea</span>
            </Badge>

            <Button size="sm" asChild className="gap-1 shadow-xs">
              <Link to="/nuevo">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nuevo Registro</span>
              </Link>
            </Button>
          </div>
        </header>

        {/* CONTENEDOR PRINCIPAL DEL SITIO (DERECHA) */}
        <div className="flex-1 w-full min-w-0 bg-muted/15 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

