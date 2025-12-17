import { useDeleteSupplier } from "@/hooks/use-supplier";
import { useSupplierStore } from "@/stores/supplier-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteSupplierModal() {
  const { selectedSupplier, clearSelectedSupplier } = useSupplierStore();
  const deleteSupplier = useDeleteSupplier();
  const supplierToDelete =
    selectedSupplier?.action === "delete" ? selectedSupplier.supplier : null;
  const open = supplierToDelete !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedSupplier();
    }
  };

  const handleDelete = async () => {
    if (!supplierToDelete?.uuid) return;
    try {
      await deleteSupplier.mutateAsync(supplierToDelete.uuid);
      clearSelectedSupplier();
    } catch (error) {
      console.error("Failed to delete supplier:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Supplier</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{supplierToDelete?.name}"? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => clearSelectedSupplier()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteSupplier.isPending}
          >
            {deleteSupplier.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

