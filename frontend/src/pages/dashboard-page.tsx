import { WarehouseUtilizationCard } from "@/features/dashboard/warehouse-utilization-card";
import { RecentMovementsCard } from "@/features/dashboard/recent-movements-card";
import { TopProductsCard } from "@/features/dashboard/top-products-card";
import { StockAlertsCard } from "@/features/dashboard/stock-alerts-card";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time overview of warehouse operations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WarehouseUtilizationCard />
        <RecentMovementsCard />
      </div>

      <TopProductsCard />

      <StockAlertsCard />
    </div>
  );
}
