import { useDeleteProduct } from "@/hooks/use-product";
import { useProductStore } from "@/stores/product-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeleteProductModal() {
  const { mutate: deleteProduct, isPending } = useDeleteProduct();
  const { selectedProduct, clearSelectedProduct } = useProductStore();
  const productToDelete =
    selectedProduct?.action === "delete" ? selectedProduct.product : null;
  const open = productToDelete !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedProduct();
    }
  };

  const handleDelete = () => {
    if (!productToDelete?.uuid) return;
    try {
      deleteProduct(productToDelete.uuid);
      clearSelectedProduct();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            product
            <strong className="block mt-2">"{productToDelete?.title}"</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => clearSelectedProduct()}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-black text-white hover:bg-black/90"
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
