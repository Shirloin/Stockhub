import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMovementStream } from "@/hooks/use-movement-stream";
import { format } from "date-fns";

function getMovementTypeBadge(type?: string) {
  switch (type) {
    case "STOCK_IN":
      return <Badge className="bg-green-500">IN</Badge>;
    case "STOCK_OUT":
      return <Badge className="bg-red-500">OUT</Badge>;
    case "ADJUSTMENT":
      return <Badge className="bg-yellow-500">ADJ</Badge>;
    case "TRANSFER":
      return <Badge className="bg-blue-500">XFER</Badge>;
    default:
      return <Badge variant="outline">{type || "UNK"}</Badge>;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return "-";
  try {
    return format(new Date(dateString), "MMM dd, HH:mm");
  } catch {
    return dateString;
  }
}

export function RecentMovementsCard() {
  const {
    movements: movementsStream,
    isConnected,
    isLoading,
    error,
  } = useMovementStream(5); // Real-time movement stream, top 5

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Movements</CardTitle>
            <CardDescription>
              5 newest stock movements across all warehouses (sorted by date) -
              Live
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
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Loading movements...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>Error loading movements: {error.message}</p>
          </div>
        ) : movementsStream.length > 0 ? (
          <div className="space-y-2">
            {movementsStream.map((movement) => (
              <div
                key={movement.uuid}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <div className="flex items-center gap-2">
                  {getMovementTypeBadge(movement.movementType)}
                  <div>
                    <div className="font-medium text-sm">
                      {movement.product?.title || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {movement.warehouse?.name || "-"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${
                      (movement.quantity || 0) >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {(movement.quantity || 0) >= 0 ? "+" : ""}
                    {movement.quantity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(movement.movementDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No movements found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
