import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package } from "lucide-react";
import { format } from "date-fns";
import { useStockAlerts } from "@/hooks/use-stock-alerts";
import { useMemo } from "react";
export function StockAlertsCard() {
  const { alerts, isConnected, isLoading, error } = useStockAlerts(); // Real-time stock alerts

  // Separate out of stock and low stock from real-time alerts
  const outOfStockAlerts = useMemo(
    () => alerts.filter((a) => a.alertType === "out_of_stock"),
    [alerts]
  );

  const lowStockAlerts = useMemo(
    () => alerts.filter((a) => a.alertType === "low_stock"),
    [alerts]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products requiring attention</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading stock alerts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products requiring attention</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p>Error loading stock alerts: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (outOfStockAlerts.length === 0 && lowStockAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products requiring attention</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert>
            <Package className="h-4 w-4" />
            <AlertTitle>No Stock Alerts</AlertTitle>
            <AlertDescription>
              All products are currently in stock above their thresholds.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Out of Stock Products */}
      {outOfStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-red-600">
                  Out of Stock Products
                </CardTitle>
                <CardDescription>
                  Products that are completely out of stock
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="text-xs text-muted-foreground">
                  {isConnected ? "Live" : "Offline"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {outOfStockAlerts.map((product) => (
                <Alert key={product.productUuid} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{product.productTitle}</AlertTitle>
                  <AlertDescription className="flex items-center justify-between">
                    <span>Stock: {product.currentStock || 0} units</span>
                    {product.timestamp && (
                      <span className="text-xs">
                        {format(
                          new Date(product.timestamp),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Products */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Low Stock Products</CardTitle>
              <CardDescription>
                Products requiring attention - below threshold
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-muted-foreground">
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Threshold</TableHead>
                  <TableHead className="text-right">Remaining %</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockAlerts.length > 0 ? (
                  lowStockAlerts.map((product) => {
                    const stock = product.currentStock || 0;
                    const threshold = product.threshold ?? 0;
                    const remainingPercent =
                      threshold > 0 ? Math.round((stock / threshold) * 100) : 0;

                    return (
                      <TableRow key={product.productUuid}>
                        <TableCell className="font-medium">
                          {product.productTitle}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{stock}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {threshold}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={
                              remainingPercent < 50
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {remainingPercent}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Low Stock</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-8"
                    >
                      No low stock products (excluding out of stock)
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
