import { useState } from "react";
import { useCreateStockIn } from "@/hooks/use-stock-movement";
import { useGetProducts } from "@/hooks/use-product";
import { useGetWarehouses } from "@/hooks/use-warehouse";
import { useGetSuppliers } from "@/hooks/use-supplier";
import { Button } from "@/components/ui/button";
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

export default function CreateStockInModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createStockIn, isPending } = useCreateStockIn();
  const { data: products } = useGetProducts();
  const { data: warehouses } = useGetWarehouses();
  const { data: suppliers } = useGetSuppliers();
  const [formData, setFormData] = useState({
    productUuid: "",
    warehouseUuid: "",
    quantity: "",
    purchaseOrderNo: "",
    supplierUuid: "",
    receivedBy: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      productUuid: "",
      warehouseUuid: "",
      quantity: "",
      purchaseOrderNo: "",
      supplierUuid: "",
      receivedBy: "",
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
      createStockIn(
        {
          productUuid: formData.productUuid,
          warehouseUuid: formData.warehouseUuid,
          quantity: parseInt(formData.quantity),
          purchaseOrderNo: formData.purchaseOrderNo || undefined,
          supplierUuid: formData.supplierUuid || undefined,
          receivedBy: formData.receivedBy || undefined,
          notes: formData.notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Stock received successfully!");
            resetForm();
            setOpen(false);
          },
          onError: (error) => {
            toast.error("Failed to receive stock", {
              description: error.message || "An error occurred",
            });
          },
        }
      );
    } catch (error) {
      console.error("Failed to create stock in:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-black text-white hover:bg-black/90"
        >
          Receive Stock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Receive Stock (Stock IN)</DialogTitle>
          <DialogDescription>
            Record incoming inventory to a warehouse
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stockin-product">Product *</Label>
              <Select
                value={formData.productUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, productUuid: value })
                }
              >
                <SelectTrigger id="stockin-product">
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
              <Label htmlFor="stockin-warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouseUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, warehouseUuid: value })
                }
              >
                <SelectTrigger id="stockin-warehouse">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stockin-quantity">Quantity *</Label>
                <Input
                  id="stockin-quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stockin-po">PO Number</Label>
                <Input
                  id="stockin-po"
                  value={formData.purchaseOrderNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchaseOrderNo: e.target.value,
                    })
                  }
                  placeholder="PO-12345"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockin-supplier">Supplier</Label>
              <Select
                value={formData.supplierUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, supplierUuid: value })
                }
              >
                <SelectTrigger id="stockin-supplier">
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers && suppliers.length > 0 ? (
                    suppliers.map((supplier) => (
                      <SelectItem key={supplier.uuid} value={supplier.uuid!}>
                        {supplier.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-suppliers" disabled>
                      No suppliers available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockin-received-by">Received By</Label>
              <Input
                id="stockin-received-by"
                value={formData.receivedBy}
                onChange={(e) =>
                  setFormData({ ...formData, receivedBy: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockin-notes">Notes</Label>
              <Input
                id="stockin-notes"
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
              {isPending ? "Receiving..." : "Receive Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
