import { useState, useMemo } from "react";
import { useTransferStock, useGetWarehouseStock } from "@/hooks/use-warehouse";
import { useGetWarehouses } from "@/hooks/use-warehouse";
import { Button } from "@/components/ui/button";
import WarehouseInfoCard from "@/components/warehouse/warehouse-info-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { WarehouseStock } from "@/types/warehouse";
import type Warehouse from "@/types/warehouse";

interface TransferStockModalProps {
  warehouseStock: WarehouseStock;
  fromWarehouse: Warehouse;
  onClose: () => void;
}

export default function TransferStockModal({
  warehouseStock,
  fromWarehouse,
  onClose,
}: TransferStockModalProps) {
  const transferStock = useTransferStock();
  const { data: warehouses } = useGetWarehouses();
  const [formData, setFormData] = useState({
    quantity: "",
    toWarehouseUuid: "",
    notes: "",
  });

  // Fetch destination warehouse stock when destination is selected
  const { data: destinationStock } = useGetWarehouseStock(
    formData.toWarehouseUuid
  );

  // Get destination warehouse details
  const destinationWarehouse = useMemo(() => {
    if (!formData.toWarehouseUuid || !warehouses) return null;
    return warehouses.find((w) => w.uuid === formData.toWarehouseUuid);
  }, [formData.toWarehouseUuid, warehouses]);

  // Find current stock for the product in destination warehouse
  const destinationProductStock = useMemo(() => {
    if (
      !formData.toWarehouseUuid ||
      !destinationStock ||
      !warehouseStock.productUuid
    ) {
      return null;
    }
    const stock = destinationStock.find(
      (s) => s.productUuid === warehouseStock.productUuid
    );
    return stock?.quantity ?? 0;
  }, [formData.toWarehouseUuid, destinationStock, warehouseStock.productUuid]);

  // Calculate total stock in destination warehouse
  const destinationTotalStock = useMemo(() => {
    if (!destinationStock) return 0;
    return destinationStock.reduce(
      (sum, stock) => sum + (stock.quantity || 0),
      0
    );
  }, [destinationStock]);

  // Calculate capacity after transfer
  const capacityAfterTransfer = useMemo(() => {
    if (
      !destinationWarehouse ||
      !destinationWarehouse.capacity ||
      destinationWarehouse.capacity === 0
    ) {
      return null;
    }
    const transferQty = parseInt(formData.quantity) || 0;
    return destinationTotalStock + transferQty;
  }, [destinationWarehouse, destinationTotalStock, formData.quantity]);

  // Check if transfer would exceed capacity
  const wouldExceedCapacity = useMemo(() => {
    if (
      !destinationWarehouse ||
      !destinationWarehouse.capacity ||
      destinationWarehouse.capacity === 0
    ) {
      return false;
    }
    return (
      capacityAfterTransfer !== null &&
      capacityAfterTransfer > destinationWarehouse.capacity
    );
  }, [destinationWarehouse, capacityAfterTransfer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.toWarehouseUuid || !formData.quantity) return;

    try {
      await transferStock.mutateAsync({
        productUuid: warehouseStock.productUuid!,
        fromWarehouseUuid: fromWarehouse.uuid!,
        toWarehouseUuid: formData.toWarehouseUuid,
        quantity: parseInt(formData.quantity),
        notes: formData.notes,
      });
      onClose();
    } catch (error) {
      console.error("Failed to transfer stock:", error);
    }
  };

  const availableWarehouses = warehouses?.filter(
    (w) => w.uuid !== fromWarehouse.uuid && w.isActive
  );

  const maxQuantity = warehouseStock.quantity || 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer {warehouseStock.product?.title || "product"} from{" "}
            {fromWarehouse.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto thin-scrollbar flex-1">
            <div className="space-y-2">
              <Label>Available Quantity</Label>
              <div className="text-2xl font-bold">{maxQuantity} units</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-to">To Warehouse *</Label>
              <Select
                value={formData.toWarehouseUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, toWarehouseUuid: value })
                }
              >
                <SelectTrigger id="transfer-to">
                  <SelectValue placeholder="Select destination warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {availableWarehouses && availableWarehouses.length > 0 ? (
                    availableWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.uuid} value={warehouse.uuid!}>
                        {warehouse.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-warehouses" disabled>
                      No warehouses available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {formData.toWarehouseUuid && destinationWarehouse && (
              <WarehouseInfoCard
                warehouse={destinationWarehouse}
                productStock={destinationProductStock}
                totalStock={destinationTotalStock}
                title="Destination Warehouse Info"
                showAfterOperation={
                  !!(formData.quantity && parseInt(formData.quantity) > 0)
                }
                afterOperationCapacity={capacityAfterTransfer}
                wouldExceedCapacity={wouldExceedCapacity}
                afterOperationLabel="After Transfer"
              />
            )}

            <div className="space-y-2">
              <Label htmlFor="transfer-quantity">Quantity *</Label>
              <Input
                id="transfer-quantity"
                type="number"
                min="1"
                max={maxQuantity}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum: {maxQuantity} units
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transfer-notes">Notes (Optional)</Label>
              <Textarea
                id="transfer-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Transfer notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-black text-white hover:bg-black/90"
              disabled={
                transferStock.isPending ||
                !formData.toWarehouseUuid ||
                !formData.quantity ||
                parseInt(formData.quantity) > maxQuantity ||
                parseInt(formData.quantity) <= 0 ||
                wouldExceedCapacity
              }
            >
              {transferStock.isPending ? "Transferring..." : "Transfer Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
