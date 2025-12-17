import { useGetWarehouseStock } from "@/hooks/use-warehouse";
import { useWarehouseStore } from "@/stores/warehouse-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TransferStockModal from "./transfer-stock-modal";
import { useState } from "react";
import type { WarehouseStock } from "@/types/warehouse";

export default function WarehouseStockModal() {
  const { selectedWarehouse, clearSelectedWarehouse } = useWarehouseStore();
  const warehouse =
    selectedWarehouse?.action === "stock" ? selectedWarehouse.warehouse : null;
  const open = warehouse !== null;
  const [transferStockProduct, setTransferStockProduct] =
    useState<WarehouseStock | null>(null);

  const { data: stock, isLoading } = useGetWarehouseStock(
    warehouse?.uuid || ""
  );

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedWarehouse();
      setTransferStockProduct(null);
    }
  };

  if (!warehouse) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Warehouse Stock - {warehouse.name}</DialogTitle>
            <DialogDescription>
              Current inventory levels for this warehouse
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading stock...
            </div>
          ) : stock && stock.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Reserved</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stock.map((item: WarehouseStock) => (
                    <TableRow key={item.uuid}>
                      <TableCell className="font-medium">
                        {item.product?.title || "Unknown Product"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {item.product?.sku || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            (item.quantity || 0) === 0
                              ? "destructive"
                              : (item.quantity || 0) < 10
                              ? "secondary"
                              : "default"
                          }
                        >
                          {item.quantity || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {item.reservedQty || 0}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        {item.availableQty || item.quantity || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setTransferStockProduct(item)}
                        >
                          Transfer
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No stock records found for this warehouse.
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => clearSelectedWarehouse()}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {transferStockProduct && (
        <TransferStockModal
          warehouseStock={transferStockProduct}
          fromWarehouse={warehouse}
          onClose={() => setTransferStockProduct(null)}
        />
      )}
    </>
  );
}
