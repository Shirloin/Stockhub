import { useState } from "react";
import { useCreateStockAdjustment } from "@/hooks/use-stock-movement";
import { useGetProducts } from "@/hooks/use-product";
import { useGetWarehouses } from "@/hooks/use-warehouse";
import type { AdjustmentReason } from "@/types/stock-movement";
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

const ADJUSTMENT_REASONS: { value: AdjustmentReason; label: string }[] = [
  { value: "DAMAGE", label: "Damage" },
  { value: "LOSS", label: "Loss" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CORRECTION", label: "Correction" },
  { value: "THEFT", label: "Theft" },
  { value: "OTHER", label: "Other" },
];

export default function CreateStockAdjustmentModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createAdjustment, isPending } = useCreateStockAdjustment();
  const { data: products } = useGetProducts();
  const { data: warehouses } = useGetWarehouses();
  const [formData, setFormData] = useState({
    productUuid: "",
    warehouseUuid: "",
    quantity: "",
    reason: "" as AdjustmentReason | "",
    adjustedBy: "",
    notes: "",
  });

  const resetForm = () => {
    setFormData({
      productUuid: "",
      warehouseUuid: "",
      quantity: "",
      reason: "",
      adjustedBy: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.productUuid ||
      !formData.warehouseUuid ||
      !formData.quantity ||
      !formData.reason
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (quantity === 0) {
      toast.error("Quantity cannot be 0");
      return;
    }

    try {
      createAdjustment(
        {
          productUuid: formData.productUuid,
          warehouseUuid: formData.warehouseUuid,
          quantity: quantity,
          reason: formData.reason as AdjustmentReason,
          adjustedBy: formData.adjustedBy || undefined,
          notes: formData.notes || undefined,
        },
        {
          onSuccess: () => {
            toast.success("Stock adjustment recorded successfully!");
            resetForm();
            setOpen(false);
          },
          onError: (error: any) => {
            toast.error("Failed to record adjustment", {
              description: error.message || "An error occurred",
            });
          },
        }
      );
    } catch (error) {
      console.error("Failed to create adjustment:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adjust Stock</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Stock Adjustment</DialogTitle>
          <DialogDescription>
            Record stock adjustments (damage, loss, corrections, etc.)
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adjust-product">Product *</Label>
              <Select
                value={formData.productUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, productUuid: value })
                }
              >
                <SelectTrigger id="adjust-product">
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
              <Label htmlFor="adjust-warehouse">Warehouse *</Label>
              <Select
                value={formData.warehouseUuid || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, warehouseUuid: value })
                }
              >
                <SelectTrigger id="adjust-warehouse">
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
                <Label htmlFor="adjust-quantity">Quantity *</Label>
                <Input
                  id="adjust-quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                  placeholder="0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Positive to add, negative to subtract
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adjust-reason">Reason *</Label>
                <Select
                  value={formData.reason || undefined}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      reason: value as AdjustmentReason,
                    })
                  }
                >
                  <SelectTrigger id="adjust-reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {ADJUSTMENT_REASONS.map((reason) => (
                      <SelectItem key={reason.value} value={reason.value}>
                        {reason.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjust-by">Adjusted By</Label>
              <Input
                id="adjust-by"
                value={formData.adjustedBy}
                onChange={(e) =>
                  setFormData({ ...formData, adjustedBy: e.target.value })
                }
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adjust-notes">Notes</Label>
              <Input
                id="adjust-notes"
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
              {isPending ? "Adjusting..." : "Record Adjustment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
