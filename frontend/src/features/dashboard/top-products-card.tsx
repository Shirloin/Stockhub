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
import { useTopProductsStream } from "@/hooks/use-top-products-stream";

export function TopProductsCard() {
  const { products: topProductsByPrice, isConnected, isLoading, error } =
    useTopProductsStream(5); // Real-time top 5 products by price from backend

  const products = topProductsByPrice || [];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Top 5 Products by Price</CardTitle>
            <CardDescription>
              Real-time products with highest prices
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>Error loading products: {error.message}</p>
          </div>
        ) : products.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const stock = product.stock || 0;
                  const threshold = product.lowStockThreshold || 0;
                  const isLowStock = threshold > 0 && stock <= threshold;
                  const isOutOfStock = stock === 0;

                  return (
                    <TableRow key={product.uuid}>
                      <TableCell className="font-medium">
                        {product.title || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {product.sku || "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            isOutOfStock
                              ? "destructive"
                              : isLowStock
                              ? "secondary"
                              : "default"
                          }
                        >
                          {stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        ${product.price ? (product.price / 100).toFixed(2) : "0.00"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            isOutOfStock
                              ? "destructive"
                              : isLowStock
                              ? "secondary"
                              : "default"
                          }
                        >
                          {isOutOfStock
                            ? "Out of Stock"
                            : isLowStock
                            ? "Low Stock"
                            : "In Stock"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No products available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

