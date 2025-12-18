import { useState } from "react";
import { useUpdateSupplier } from "@/hooks/use-supplier";
import { useSupplierStore } from "@/stores/supplier-store";
import type Supplier from "@/types/supplier";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function UpdateSupplierForm({
  supplierToUpdate,
}: {
  supplierToUpdate: Supplier;
}) {
  const updateSupplier = useUpdateSupplier();
  const { clearSelectedSupplier } = useSupplierStore();

  const [formData, setFormData] = useState({
    name: supplierToUpdate.name || "",
    email: supplierToUpdate.email || "",
    phone: supplierToUpdate.phone || "",
    address: supplierToUpdate.address || "",
    contactName: supplierToUpdate.contactName || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSupplier.mutateAsync({
        uuid: supplierToUpdate.uuid!,
        supplier: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          contactName: formData.contactName,
        },
      });
      clearSelectedSupplier();
    } catch (error) {
      console.error("Failed to update supplier:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="update-name">Name *</Label>
          <Input
            id="update-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter supplier name"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="update-contact">Contact Name</Label>
            <Input
              id="update-contact"
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-phone">Phone</Label>
            <Input
              id="update-phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-email">Email</Label>
          <Input
            id="update-email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="supplier@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-address">Address</Label>
          <Textarea
            id="update-address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            placeholder="Enter supplier address"
            rows={3}
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => clearSelectedSupplier()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          className="bg-black text-white hover:bg-black/90"
          disabled={updateSupplier.isPending}
        >
          {updateSupplier.isPending ? "Updating..." : "Update Supplier"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function UpdateSupplierModal() {
  const { selectedSupplier, clearSelectedSupplier } = useSupplierStore();
  const supplierToUpdate =
    selectedSupplier?.action === "update" ? selectedSupplier.supplier : null;
  const open = supplierToUpdate !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedSupplier();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Update Supplier</DialogTitle>
          <DialogDescription>
            Update the supplier information below.
          </DialogDescription>
        </DialogHeader>
        {supplierToUpdate && (
          <div className="overflow-y-auto thin-scrollbar flex-1 min-h-0">
            <UpdateSupplierForm
              key={supplierToUpdate.uuid}
              supplierToUpdate={supplierToUpdate}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
