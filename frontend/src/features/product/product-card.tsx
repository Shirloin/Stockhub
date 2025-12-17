import type Product from "@/types/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProductStore } from "@/stores/product-store";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { setSelectedProduct } = useProductStore();

  return (
    <Card key={product.uuid} className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl">{product.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {product.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold">
              ${product.price ? (product.price / 100).toFixed(2) : "0.00"}
            </div>
            <div className={`text-sm font-semibold px-2 py-1 rounded ${
              (product.stock || 0) === 0
                ? "bg-red-100 text-red-800"
                : (product.stock || 0) <= (product.lowStockThreshold || 10)
                ? "bg-yellow-100 text-yellow-800"
                : "bg-green-100 text-green-800"
            }`}>
              Catalog Stock: {product.stock || 0}
            </div>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {product.sku && (
              <div className="flex items-center gap-2">
                <span className="font-medium">SKU:</span>
                <span>{product.sku}</span>
              </div>
            )}
            {product.barcode && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Barcode:</span>
                <span className="font-mono">{product.barcode}</span>
              </div>
            )}
            {product.category && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Category:</span>
                <span>{product.category.name}</span>
              </div>
            )}
            {product.supplier && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Supplier:</span>
                <span>{product.supplier.name}</span>
              </div>
            )}
            {product.createdAt && (
              <div>
                Created: {new Date(product.createdAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSelectedProduct(product, "update")}
        >
          Update
        </Button>

        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setSelectedProduct(product, "delete")}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
