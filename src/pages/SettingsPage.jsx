import { Coins, Tags } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrenciesSection } from "@/components/settings/currencies/CurrenciesSection"
import { CategoriesSection } from "@/components/settings/categories/CategoriesSection"

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Configuración
        </h1>
        <p className="text-sm text-muted-foreground">
          Administra los catálogos maestros de monedas, tasas de cambio y categorías financieras.
        </p>
      </div>

      <Tabs defaultValue="currencies">
        <TabsList className="grid w-full grid-cols-2 sm:inline-flex sm:w-fit">
          <TabsTrigger value="currencies" className="text-xs sm:text-sm">
            <Coins className="size-4 shrink-0" />
            <span className="truncate">Monedas y Tasas</span>
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-xs sm:text-sm">
            <Tags className="size-4 shrink-0" />
            <span className="truncate">Categorías</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="currencies">
          <CurrenciesSection />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesSection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
