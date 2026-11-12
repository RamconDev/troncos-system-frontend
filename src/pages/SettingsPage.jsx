import { Coins, Tags } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrenciesSection } from "@/components/settings/currencies/CurrenciesSection"
import { CategoriesSection } from "@/components/settings/categories/CategoriesSection"

export function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
        <p className="text-sm text-muted-foreground">
          Administra los catálogos maestros de monedas, tasas de cambio y categorías financieras.
        </p>
      </div>

      <Tabs defaultValue="currencies">
        <TabsList>
          <TabsTrigger value="currencies">
            <Coins className="size-4" />
            Monedas y Tasas
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Tags className="size-4" />
            Categorías de Movimiento
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

