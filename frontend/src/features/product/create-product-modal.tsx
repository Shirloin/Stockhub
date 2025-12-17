import { useState } from "react";
import { useCreateProduct } from "@/hooks/use-product";
import { useGetCategories } from "@/hooks/use-category";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateProductModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createProduct, isPending } = useCreateProduct();
  const { data: categories } = useGetCategories();
  const { data: suppliers } = useGetSuppliers();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    lowStockThreshold: "10",
    sku: "",
    barcode: "",
    imageUrl: "",
    categoryUuid: "",
    supplierUuid: "",
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      lowStockThreshold: "10",
      sku: "",
      barcode: "",
      imageUrl: "",
      categoryUuid: "",
      supplierUuid: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createProduct(
        {
          title: formData.title,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
          stock: parseInt(formData.stock) || 0,
          lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
          sku: formData.sku,
          barcode: formData.barcode || "",
          imageUrl: formData.imageUrl || undefined,
          categoryUuid: formData.categoryUuid || undefined,
          supplierUuid: formData.supplierUuid || undefined,
        },
        {
          onSuccess: () => {
            resetForm();
            setOpen(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-black text-white hover:bg-black/90"
        >
          Create Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Product</DialogTitle>
          <DialogDescription>
            Add a new product to your inventory. Fill in all the required
            information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-title">Title</Label>
              <Input
                id="create-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter product title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-description">Description</Label>
              <Textarea
                id="create-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-price">Price ($)</Label>
              <Input
                id="create-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-stock">Catalog Stock (Master Data) *</Label>
                <Input
                  id="create-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  placeholder="0"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Total available stock in catalog. Adding stock to warehouses will reduce this value.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-threshold">Low Stock Threshold</Label>
                <Input
                  id="create-threshold"
                  type="number"
                  min="0"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lowStockThreshold: e.target.value,
                    })
                  }
                  placeholder="10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-sku">SKU *</Label>
                <Input
                  id="create-sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData({ ...formData, sku: e.target.value })
                  }
                  placeholder="SKU-001"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-barcode">Barcode (Optional)</Label>
                <Input
                  id="create-barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder="1234567890123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-image">Image URL (Optional)</Label>
                <Input
                  id="create-image"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-category">Category</Label>
                <Select
                  value={formData.categoryUuid || undefined}
                  onValueChange={(value) => {
                    if (value === "no-categories") return;
                    setFormData({ ...formData, categoryUuid: value });
                  }}
                >
                  <SelectTrigger id="create-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.uuid} value={category.uuid!}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No categories available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-supplier">Supplier</Label>
                <Select
                  value={formData.supplierUuid || undefined}
                  onValueChange={(value) => {
                    if (value === "no-suppliers") return;
                    setFormData({ ...formData, supplierUuid: value });
                  }}
                >
                  <SelectTrigger id="create-supplier">
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
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              variant="default"
              className="bg-black text-white hover:bg-black/90"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
