import { useState } from "react";
import {
  useGetStockMovements,
  useGetStockMovementsByType,
} from "@/hooks/use-stock-movement";
import type { StockMovementType } from "@/types/stock-movement";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateStockInModal from "@/features/stock-movement/create-stock-in-modal";
import CreateStockOutModal from "@/features/stock-movement/create-stock-out-modal";
import CreateStockAdjustmentModal from "@/features/stock-movement/create-stock-adjustment-modal";

const MOVEMENT_TYPES: { value: StockMovementType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All Movements" },
  { value: "STOCK_IN", label: "Stock IN" },
  { value: "STOCK_OUT", label: "Stock OUT" },
  { value: "TRANSFER", label: "Transfer" },
  { value: "ADJUSTMENT", label: "Adjustment" },
];

export default function StockMovementsPage() {
  const [filterType, setFilterType] = useState<StockMovementType | "ALL">(
    "ALL"
  );
  const { data: allMovements, isLoading: isLoadingAll } =
    useGetStockMovements();
  const { data: filteredMovements, isLoading: isLoadingFiltered } =
    useGetStockMovementsByType(filterType as StockMovementType, 100);

  const movements = filterType === "ALL" ? allMovements : filteredMovements;
  const isLoading = filterType === "ALL" ? isLoadingAll : isLoadingFiltered;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return dateString;
    }
  };

  const getMovementTypeBadge = (type?: StockMovementType) => {
    switch (type) {
      case "STOCK_IN":
        return <Badge className="bg-green-500">Stock IN</Badge>;
      case "STOCK_OUT":
        return <Badge className="bg-red-500">Stock OUT</Badge>;
      case "TRANSFER":
        return <Badge className="bg-blue-500">Transfer</Badge>;
      case "ADJUSTMENT":
        return <Badge className="bg-yellow-500">Adjustment</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Loading movements...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Movements</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete audit trail of all inventory movements
          </p>
        </div>
        <div className="flex gap-2">
          <CreateStockInModal />
          <CreateStockOutModal />
          <CreateStockAdjustmentModal />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>
                All stock movements across warehouses
              </CardDescription>
            </div>
            <Select
              value={filterType}
              onValueChange={(value) =>
                setFilterType(value as StockMovementType | "ALL")
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {MOVEMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {movements && movements.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Warehouse</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Previous</TableHead>
                    <TableHead className="text-right">New</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead>By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((movement) => (
                    <TableRow key={movement.uuid}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(movement.movementDate)}
                      </TableCell>
                      <TableCell>
                        {getMovementTypeBadge(movement.movementType)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {movement.product?.title || "Unknown"}
                      </TableCell>
                      <TableCell>{movement.warehouse?.name || "-"}</TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          (movement.quantity || 0) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {(movement.quantity || 0) >= 0 ? "+" : ""}
                        {movement.quantity}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {movement.previousQty || 0}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {movement.newQty || 0}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.referenceNumber || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {movement.createdBy || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No movements found.</p>
              <p className="text-sm mt-2">
                Start by receiving or shipping stock.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
