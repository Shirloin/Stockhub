import { useState, useMemo } from "react";
import { useCreateStockOut } from "@/hooks/use-stock-movement";
import { useGetProducts } from "@/hooks/use-product";
import { useGetWarehouses, useGetWarehouseStock } from "@/hooks/use-warehouse";
import { Button } from "@/components/ui/button";
import WarehouseInfoCard from "@/components/warehouse/warehouse-info-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function CreateStockOutModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createStockOut, isPending } = useCreateStockOut();
  const { data: products } = useGetProducts();
  const { data: warehouses } = useGetWarehouses();
  const [formData, setFormData] = useState({
    productUuid: "",
    warehouseUuid: "",
    quantity: "",
    salesOrderNo: "",
    customerName: "",
    shippedBy: "",
    notes: "",
  });

  // Fetch warehouse stock when warehouse is selected
  const { data: warehouseStock } = useGetWarehouseStock(formData.warehouseUuid);

  // Get selected warehouse details
  const selectedWarehouse = useMemo(() => {
    if (!formData.warehouseUuid || !warehouses) return null;
    return warehouses.find((w) => w.uuid === formData.warehouseUuid);
  }, [formData.warehouseUuid, warehouses]);

  // Find current stock for selected product and warehouse
  const currentStock = useMemo(() => {
    if (!formData.productUuid || !formData.warehouseUuid || !warehouseStock) {
      return null;
    }
    const stock = warehouseStock.find(
      (s) => s.productUuid === formData.productUuid
    );
    return stock?.quantity ?? 0;
  }, [formData.productUuid, formData.warehouseUuid, warehouseStock]);

  // Calculate total stock in warehouse
  const totalStock = useMemo(() => {
    if (!warehouseStock) return 0;
    return warehouseStock.reduce(
      (sum, stock) => sum + (stock.quantity || 0),
      0
    );
  }, [warehouseStock]);

  // Calculate capacity after shipping stock
  const capacityAfterShip = useMemo(() => {
    if (
      !selectedWarehouse ||
      !selectedWarehouse.capacity ||
      selectedWarehouse.capacity === 0
    ) {
      return null;
    }
    const shipQty = parseInt(formData.quantity) || 0;
    return totalStock - shipQty;
  }, [selectedWarehouse, totalStock, formData.quantity]);

  // Calculate product stock after shipping
  const stockAfterShip = useMemo(() => {
    if (currentStock === null) return null;
    const shipQty = parseInt(formData.quantity) || 0;
    return Math.max(0, currentStock - shipQty);
  }, [currentStock, formData.quantity]);

  const resetForm = () => {
    setFormData({
      productUuid: "",
      warehouseUuid: "",
      quantity: "",
      salesOrderNo: "",
      customerName: "",
      shippedBy: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.productUuid ||
      !formData.warehouseUuid ||
      !formData.quantity
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      createStockOut(
        {
          productUuid: formData.productUuid,
          warehouseUuid: formData.warehouseUuid,
          quantity: parseInt(formData.quantity),
          salesOrderNo: formData.salesOrderNo || undefined,
          customerName: formData.customerName || undefined,
          shippedBy: formData.shippedBy || undefined,
          notes: formData.notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Stock shipped successfully!");
            resetForm();
            setOpen(false);
          },
          onError: (error: any) => {
            toast.error("Failed to ship stock", {
              description: error.message || "An error occurred",
            });
          },
        }
      );
    } catch (error) {
      console.error("Failed to create stock out:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Ship Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Ship Stock (Stock OUT)</DialogTitle>
          <DialogDescription>
            Record outgoing inventory from a warehouse
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="space-y-4 py-4 overflow-y-auto thin-scrollbar flex-1">
            <div className="space-y-2">
              <Label htmlFor="stockout-product">Product *</Label>
              <Select
                value={formData.productUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, productUuid: value })
                }
              >
                <SelectTrigger id="stockout-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.uuid} value={product.uuid!}>
                        {product.title} ({product.sku})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-products" disabled>
                      No products available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockout-warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouseUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, warehouseUuid: value })
                }
              >
                <SelectTrigger id="stockout-warehouse">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses && warehouses.length > 0 ? (
                    warehouses
                      .filter((w) => w.isActive)
                      .map((warehouse) => (
                        <SelectItem
                          key={warehouse.uuid}
                          value={warehouse.uuid!}
                        >
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

            {formData.productUuid &&
              formData.warehouseUuid &&
              selectedWarehouse && (
                <WarehouseInfoCard
                  warehouse={selectedWarehouse}
                  productStock={currentStock}
                  totalStock={totalStock}
                  showAfterOperation={
                    formData.quantity && parseInt(formData.quantity) > 0
                  }
                  afterOperationStock={stockAfterShip}
                  afterOperationCapacity={capacityAfterShip}
                  afterOperationLabel="After Shipping"
                />
              )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockout-quantity">Quantity *</Label>
                <Input
                  id="stockout-quantity"
                  type="number"
                  min="1"
                  max={currentStock !== null ? currentStock : undefined}
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockout-so">Sales Order #</Label>
                <Input
                  id="stockout-so"
                  value={formData.salesOrderNo}
                  onChange={(e) =>
                    setFormData({ ...formData, salesOrderNo: e.target.value })
                  }
                  placeholder="SO-12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockout-customer">Customer Name</Label>
              <Input
                id="stockout-customer"
                value={formData.customerName}
                onChange={(e) =>
                  setFormData({ ...formData, customerName: e.target.value })
                }
                placeholder="Customer name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockout-shipped-by">Shipped By</Label>
              <Input
                id="stockout-shipped-by"
                value={formData.shippedBy}
                onChange={(e) =>
                  setFormData({ ...formData, shippedBy: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockout-notes">Notes</Label>
              <Input
                id="stockout-notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              className="bg-black text-white hover:bg-black/90"
              disabled={isPending}
            >
              {isPending ? "Shipping..." : "Ship Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
