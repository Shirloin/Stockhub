import { useGetSuppliers } from "@/hooks/use-supplier";
import type Supplier from "@/types/supplier";
import CreateSupplierModal from "./create-supplier-modal";
import UpdateSupplierModal from "./update-supplier-modal";
import DeleteSupplierModal from "./delete-supplier-modal";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupplierStore } from "@/stores/supplier-store";

export default function SupplierList() {
  const { data: suppliers, isLoading, error } = useGetSuppliers();
  const { setSelectedSupplier } = useSupplierStore();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-muted-foreground">Loading suppliers...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-destructive">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your suppliers and vendors
          </p>
        </div>
        <CreateSupplierModal />
      </div>

      {suppliers && suppliers.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier: Supplier) => (
                <TableRow key={supplier.uuid}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contactName || "-"}</TableCell>
                  <TableCell>{supplier.email || "-"}</TableCell>
                  <TableCell>{supplier.phone || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSupplier(supplier, "update")}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSupplier(supplier, "delete")}
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
          <p className="text-lg">No suppliers found.</p>
          <p className="text-sm mt-2">Create your first supplier to get started.</p>
        </div>
      )}

      <UpdateSupplierModal />
      <DeleteSupplierModal />
    </div>
  );
}

