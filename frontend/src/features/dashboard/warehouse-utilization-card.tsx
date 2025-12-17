import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useWarehouseStream } from "@/hooks/use-warehouse-stream";
import { useMemo } from "react";

export function WarehouseUtilizationCard() {
  const { warehouses: warehousesStream, isConnected } = useWarehouseStream(
    true,
    5
  ); // Real-time warehouse stream with metrics, top 5

  // Use warehouse metrics from stream - Already sorted desc and limited by backend
  const warehouses = useMemo(() => {
    if (!warehousesStream) return [];

    return warehousesStream.map((warehouse) => {
      const totalStock = warehouse.totalStock || 0;
      const utilization = warehouse.utilization || 0;

      return {
        ...warehouse,
        totalStock,
        utilization: Math.round(utilization),
      };
    });
  }, [warehousesStream]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top 5 Warehouse Utilization</CardTitle>
            <CardDescription>
              Highest capacity usage warehouses (sorted by utilization) - Live
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {warehouses.length > 0 ? (
          <div className="space-y-4">
            {warehouses.map((warehouse) => {
              const utilization = Math.round(warehouse.utilization || 0);
              return (
                <div key={warehouse.uuid} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{warehouse.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {utilization}% utilized
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        utilization > 80
                          ? "bg-red-500"
                          : utilization > 60
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(utilization, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {warehouse.totalStock || 0} / {warehouse.capacity || "N/A"}{" "}
                    units
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No warehouses found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
