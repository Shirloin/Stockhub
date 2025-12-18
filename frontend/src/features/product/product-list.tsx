import { useState } from "react";
import { useGetProductsPaginated } from "@/hooks/use-product";
import type Product from "@/types/product";
import CreateProductModal from "./create-product-modal";
import DeleteProductModal from "./delete-product-modal";
import UpdateProductModal from "./update-product-modal";
import ProductCard from "./product-card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List } from "lucide-react";
import { useProductStore } from "@/stores/product-store";
import { PaginationControls } from "@/components/pagination-controls";

type ViewMode = "grid" | "table";

export default function ProductList() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { data: paginatedData, isLoading, error } = useGetProductsPaginated(page, limit);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const { setSelectedProduct } = useProductStore();

  const products = paginatedData?.items || (Array.isArray(paginatedData) ? paginatedData : []);
  const totalPages = paginatedData?.totalPages || 1;
  const total = paginatedData?.total || (Array.isArray(paginatedData) ? paginatedData.length : 0);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Loading products...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-destructive">
          Error: {error.message}
        </div>
      </div>
    );
  }

  const getStockBadgeVariant = (stock: number) => {
    if (stock === 0) return "destructive";
    if (stock < 10) return "secondary";
    return "default";
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your inventory and track stock levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <CreateProductModal />
        </div>
      </div>

      {products && products.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: Product) => (
                <ProductCard key={product.uuid} product={product} />
              ))}
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Catalog Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product: Product) => (
                    <TableRow key={product.uuid}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.title}</div>
                          {product.description && (
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{product.sku || "-"}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold">
                          ${product.price ? (product.price / 100).toFixed(2) : "0.00"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{product.stock || 0}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStockBadgeVariant(product.stock || 0)}>
                          {product.stock === 0
                            ? "Out of Stock"
                            : product.stock! < 10
                            ? "Low Stock"
                            : "In Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProduct(product, "update")}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedProduct(product, "delete")}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
            itemName="products"
          />
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <p className="text-lg">No products found.</p>
          <p className="text-sm mt-2">
            Create your first product to get started.
          </p>
        </div>
      )}

      <UpdateProductModal />
      <DeleteProductModal />
    </div>
  );
}
