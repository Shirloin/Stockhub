import type Warehouse from "@/types/warehouse";

interface WarehouseInfoCardProps {
  warehouse: Warehouse;
  productStock: number | null;
  totalStock: number;
  title?: string;
  afterOperationStock?: number | null;
  afterOperationCapacity?: number | null;
  wouldExceedCapacity?: boolean;
  showAfterOperation?: boolean;
  afterOperationLabel?: string;
}

export default function WarehouseInfoCard({
  warehouse,
  productStock,
  totalStock,
  title = "Warehouse Information",
  afterOperationStock,
  afterOperationCapacity,
  wouldExceedCapacity = false,
  showAfterOperation = false,
  afterOperationLabel = "After Operation",
}: WarehouseInfoCardProps) {
  // Calculate used capacity percentage
  const usedCapacityPercentage =
    warehouse.capacity && warehouse.capacity > 0
      ? Math.min((totalStock / warehouse.capacity) * 100, 100)
      : null;

  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
      <div className="text-sm font-semibold text-foreground">{title}</div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Product Stock
          </div>
          <div className="text-lg font-bold">
            {productStock !== null ? productStock : "Loading..."}
          </div>
        </div>

        <div>
          <div className="text-xs text-muted-foreground mb-1">Capacity</div>
          <div className="text-lg font-bold">
            {warehouse.capacity && warehouse.capacity > 0
              ? warehouse.capacity.toLocaleString()
              : "Unlimited"}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Used Capacity</span>
          <span className="font-medium">
            {totalStock.toLocaleString()}
            {warehouse.capacity && warehouse.capacity > 0 && (
              <span className="text-muted-foreground">
                {" / "}
                {warehouse.capacity.toLocaleString()}
              </span>
            )}
          </span>
        </div>

        {usedCapacityPercentage !== null && (
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                usedCapacityPercentage >= 90
                  ? "bg-red-500"
                  : usedCapacityPercentage >= 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${usedCapacityPercentage}%` }}
            />
          </div>
        )}

        {usedCapacityPercentage !== null && (
          <div className="text-xs text-muted-foreground text-right">
            {usedCapacityPercentage.toFixed(1)}% utilized
          </div>
        )}
      </div>

      {showAfterOperation && (
        <div className="pt-2 border-t space-y-2">
          <div className="text-xs text-muted-foreground mb-1">
            {afterOperationLabel}
          </div>
          <div className="space-y-1">
            {afterOperationStock !== null &&
              afterOperationStock !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Product Stock:
                  </span>
                  <span className="text-sm font-medium">
                    {afterOperationStock.toLocaleString()}
                  </span>
                </div>
              )}
            {afterOperationCapacity !== null &&
              afterOperationCapacity !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    Used Capacity:
                  </span>
                  <span className="text-sm font-medium">
                    {afterOperationCapacity.toLocaleString()}
                    {warehouse.capacity && warehouse.capacity > 0 && (
                      <span className="text-muted-foreground">
                        {" / "}
                        {warehouse.capacity.toLocaleString()}
                      </span>
                    )}
                  </span>
                </div>
              )}
            {wouldExceedCapacity && (
              <div className="text-xs text-red-600 font-medium mt-1">
                ⚠️ Operation would exceed warehouse capacity
              </div>
            )}
            {afterOperationStock !== null &&
             afterOperationStock !== undefined &&
             afterOperationStock < 0 && (
              <div className="text-xs text-yellow-600 font-medium mt-1">
                ⚠️ Product stock cannot go below 0
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
