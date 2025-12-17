import { useGetWarehouses } from "@/hooks/use-warehouse";
import type Warehouse from "@/types/warehouse";
import CreateWarehouseModal from "./create-warehouse-modal";
import UpdateWarehouseModal from "./update-warehouse-modal";
import DeleteWarehouseModal from "./delete-warehouse-modal";
import WarehouseStockModal from "./warehouse-stock-modal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useWarehouseStore } from "@/stores/warehouse-store";
import { Package } from "lucide-react";

export default function WarehouseList() {
  const { data: warehouses, isLoading, error } = useGetWarehouses(true); // Request metrics
  const { setSelectedWarehouse } = useWarehouseStore();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">
          Loading warehouses...
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Warehouses</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage warehouse locations and inventory
          </p>
        </div>
        <CreateWarehouseModal />
      </div>

      {warehouses && warehouses.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warehouses.map((warehouse: Warehouse) => (
                <TableRow key={warehouse.uuid}>
                  <TableCell className="font-medium">
                    {warehouse.name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {warehouse.address && <div>{warehouse.address}</div>}
                      {(warehouse.city || warehouse.state) && (
                        <div className="text-muted-foreground">
                          {[
                            warehouse.city,
                            warehouse.state,
                            warehouse.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {warehouse.managerName ? (
                      <div className="text-sm">
                        <div className="font-medium">
                          {warehouse.managerName}
                        </div>
                        {warehouse.managerEmail && (
                          <div className="text-muted-foreground text-xs">
                            {warehouse.managerEmail}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {warehouse.capacity ? (
                      <div className="text-sm space-y-1">
                        <div>{warehouse.capacity.toLocaleString()} units</div>
                        {warehouse.totalStock !== undefined && (
                          <div className="text-xs text-muted-foreground">
                            Used: {warehouse.totalStock.toLocaleString()} units
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {warehouse.utilization !== undefined ? (
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {Math.round(warehouse.utilization)}%
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              warehouse.utilization > 80
                                ? "bg-red-500"
                                : warehouse.utilization > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(warehouse.utilization, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={warehouse.isActive ? "default" : "secondary"}
                    >
                      {warehouse.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWarehouse(warehouse, "stock")}
                      >
                        <Package className="h-4 w-4 mr-1" />
                        Stock
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedWarehouse(warehouse, "update")
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedWarehouse(warehouse, "delete")
                        }
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
      ) : (
        <div className="text-center py-12 text-muted-foreground border rounded-lg">
          <p className="text-lg">No warehouses found.</p>
          <p className="text-sm mt-2">
            Create your first warehouse to get started.
          </p>
        </div>
      )}

      <UpdateWarehouseModal />
      <DeleteWarehouseModal />
      <WarehouseStockModal />
    </div>
  );
}
