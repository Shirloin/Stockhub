import { useDeleteWarehouse } from "@/hooks/use-warehouse";
import { useWarehouseStore } from "@/stores/warehouse-store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DeleteWarehouseModal() {
  const { selectedWarehouse, clearSelectedWarehouse } = useWarehouseStore();
  const deleteWarehouse = useDeleteWarehouse();
  const warehouseToDelete =
    selectedWarehouse?.action === "delete" ? selectedWarehouse.warehouse : null;
  const open = warehouseToDelete !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedWarehouse();
    }
  };

  const handleDelete = async () => {
    if (!warehouseToDelete?.uuid) return;
    try {
      await deleteWarehouse.mutateAsync(warehouseToDelete.uuid);
      clearSelectedWarehouse();
    } catch (error) {
      console.error("Failed to delete warehouse:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Delete Warehouse</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{warehouseToDelete?.name}"? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => clearSelectedWarehouse()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteWarehouse.isPending}
          >
            {deleteWarehouse.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
