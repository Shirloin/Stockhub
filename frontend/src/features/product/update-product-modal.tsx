import { useState } from "react";
import { useUpdateProduct } from "@/hooks/use-product";
import { useGetCategories } from "@/hooks/use-category";
import { useGetSuppliers } from "@/hooks/use-supplier";
import { useProductStore } from "@/stores/product-store";
import type Product from "@/types/product";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function UpdateProductForm({ productToUpdate }: { productToUpdate: Product }) {
  const updateProduct = useUpdateProduct();
  const { clearSelectedProduct } = useProductStore();
  const { data: categories } = useGetCategories();
  const { data: suppliers } = useGetSuppliers();

  const [formData, setFormData] = useState({
    title: productToUpdate.title || "",
    description: productToUpdate.description || "",
    price: productToUpdate.price
      ? (productToUpdate.price / 100).toFixed(2)
      : "0.00",
    stock: productToUpdate.stock?.toString() || "0",
    lowStockThreshold: productToUpdate.lowStockThreshold?.toString() || "10",
    sku: productToUpdate.sku || "",
    barcode: productToUpdate.barcode || "",
    imageUrl: productToUpdate.imageUrl || "",
    categoryUuid:
      productToUpdate.categoryUuid || productToUpdate.category?.uuid || "",
    supplierUuid:
      productToUpdate.supplierUuid || productToUpdate.supplier?.uuid || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProduct.mutateAsync({
        uuid: productToUpdate.uuid!,
        product: {
          title: formData.title,
          description: formData.description,
          price: Math.round(parseFloat(formData.price) * 100), // Convert to cents
          stock: parseInt(formData.stock) || 0,
          lowStockThreshold: parseInt(formData.lowStockThreshold) || 10,
          sku: formData.sku,
          barcode: formData.barcode || "",
          categoryUuid: formData.categoryUuid || undefined,
          supplierUuid: formData.supplierUuid || undefined,
        },
      });
      clearSelectedProduct();
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="update-title">Title</Label>
          <Input
            id="update-title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Enter product title"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-description">Description</Label>
          <Textarea
            id="update-description"
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
          <Label htmlFor="update-price">Price ($)</Label>
          <Input
            id="update-price"
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
            <Label htmlFor="update-stock">Catalog Stock (Master Data) *</Label>
            <Input
              id="update-stock"
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
            <Label htmlFor="update-threshold">Low Stock Threshold</Label>
            <Input
              id="update-threshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={(e) =>
                setFormData({ ...formData, lowStockThreshold: e.target.value })
              }
              placeholder="10"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="update-sku">SKU *</Label>
            <Input
              id="update-sku"
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
            <Label htmlFor="update-barcode">Barcode (Optional)</Label>
            <Input
              id="update-barcode"
              value={formData.barcode}
              onChange={(e) =>
                setFormData({ ...formData, barcode: e.target.value })
              }
              placeholder="1234567890123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-image">Image URL (Optional)</Label>
            <Input
              id="update-image"
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
            <Label htmlFor="update-category">Category</Label>
            <Select
              value={formData.categoryUuid || undefined}
              onValueChange={(value) => {
                if (value === "no-categories") return;
                setFormData({ ...formData, categoryUuid: value });
              }}
            >
              <SelectTrigger id="update-category">
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
            <Label htmlFor="update-supplier">Supplier</Label>
            <Select
              value={formData.supplierUuid || undefined}
              onValueChange={(value) => {
                if (value === "no-suppliers") return;
                setFormData({ ...formData, supplierUuid: value });
              }}
            >
              <SelectTrigger id="update-supplier">
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
          type="button"
          variant="outline"
          onClick={() => clearSelectedProduct()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          className="bg-black text-white hover:bg-black/90"
          disabled={updateProduct.isPending}
        >
          {updateProduct.isPending ? "Updating..." : "Update Product"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function UpdateProductModal() {
  const { selectedProduct, clearSelectedProduct } = useProductStore();
  const productToUpdate =
    selectedProduct?.action === "update" ? selectedProduct.product : null;
  const open = productToUpdate !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedProduct();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Product</DialogTitle>
          <DialogDescription>
            Update the product information below.
          </DialogDescription>
        </DialogHeader>
        {productToUpdate && (
          <UpdateProductForm
            key={productToUpdate.uuid}
            productToUpdate={productToUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
