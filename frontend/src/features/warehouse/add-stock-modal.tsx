import { useState, useMemo } from "react";
import { useAddStock } from "@/hooks/use-warehouse";
import { useGetProducts } from "@/hooks/use-product";
import type Warehouse from "@/types/warehouse";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

interface AddStockModalProps {
  warehouse: Warehouse;
  onClose: () => void;
}

export default function AddStockModal({
  warehouse,
  onClose,
}: AddStockModalProps) {
  const addStock = useAddStock();
  const { data: products } = useGetProducts();
  const [formData, setFormData] = useState({
    productUuid: "",
    quantity: "",
  });

  // Get selected product to show available catalog stock
  const selectedProduct = useMemo(() => {
    if (!formData.productUuid || !products) return null;
    return products.find((p) => p.uuid === formData.productUuid);
  }, [formData.productUuid, products]);

  const availableStock = selectedProduct?.stock || 0;
  const requestedQuantity = parseInt(formData.quantity) || 0;
  const exceedsAvailable = requestedQuantity > availableStock;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productUuid || !formData.quantity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (requestedQuantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (exceedsAvailable) {
      toast.error(
        `Insufficient catalog stock. Available: ${availableStock}, Requested: ${requestedQuantity}`
      );
      return;
    }

    try {
      await addStock.mutateAsync({
        productUuid: formData.productUuid,
        warehouseUuid: warehouse.uuid!,
        quantity: requestedQuantity,
      });
      toast.success(
        `Successfully added ${requestedQuantity} units to ${warehouse.name}. Catalog stock reduced.`
      );
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to add stock";
      toast.error(errorMessage);
      console.error("Failed to add stock:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Stock to {warehouse.name}</DialogTitle>
          <DialogDescription>
            Move inventory from product catalog to this warehouse. This will reduce the catalog stock (master data).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-product">Product *</Label>
              <Select
                value={formData.productUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, productUuid: value, quantity: "" })
                }
              >
                <SelectTrigger id="add-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products && products.length > 0 ? (
                    products.map((product) => (
                      <SelectItem key={product.uuid} value={product.uuid!}>
                        {product.title} ({product.sku}) - Stock: {product.stock || 0}
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

            {selectedProduct && (
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">
                      Available Catalog Stock: {availableStock} units
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Adding stock to warehouse will reduce the catalog stock (master data).
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="add-quantity">Quantity to Move *</Label>
              <Input
                id="add-quantity"
                type="number"
                min="1"
                max={availableStock}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder="0"
                required
                className={exceedsAvailable ? "border-red-500" : ""}
              />
              {exceedsAvailable && (
                <p className="text-xs text-red-500">
                  Quantity exceeds available catalog stock ({availableStock} units)
                </p>
              )}
              {selectedProduct && !exceedsAvailable && requestedQuantity > 0 && (
                <p className="text-xs text-muted-foreground">
                  After adding: Catalog stock will be {availableStock - requestedQuantity} units
                </p>
              )}
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
                addStock.isPending ||
                !formData.productUuid ||
                !formData.quantity
              }
            >
              {addStock.isPending ? "Adding..." : "Add Stock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
