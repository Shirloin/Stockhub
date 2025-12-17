import { useState } from "react";
import { useUpdateWarehouse } from "@/hooks/use-warehouse";
import { useWarehouseStore } from "@/stores/warehouse-store";
import type Warehouse from "@/types/warehouse";
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

function UpdateWarehouseForm({
  warehouseToUpdate,
}: {
  warehouseToUpdate: Warehouse;
}) {
  const updateWarehouse = useUpdateWarehouse();
  const { clearSelectedWarehouse } = useWarehouseStore();

  const [formData, setFormData] = useState({
    name: warehouseToUpdate.name || "",
    address: warehouseToUpdate.address || "",
    city: warehouseToUpdate.city || "",
    state: warehouseToUpdate.state || "",
    country: warehouseToUpdate.country || "",
    postalCode: warehouseToUpdate.postalCode || "",
    managerName: warehouseToUpdate.managerName || "",
    managerEmail: warehouseToUpdate.managerEmail || "",
    managerPhone: warehouseToUpdate.managerPhone || "",
    capacity: warehouseToUpdate.capacity?.toString() || "",
    isActive: warehouseToUpdate.isActive ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateWarehouse.mutateAsync({
        uuid: warehouseToUpdate.uuid!,
        warehouse: {
          ...formData,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        },
      });
      clearSelectedWarehouse();
    } catch (error) {
      console.error("Failed to update warehouse:", error);
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
            placeholder="Main Warehouse"
            required
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
            placeholder="123 Main Street"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="update-city">City</Label>
            <Input
              id="update-city"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              placeholder="New York"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-state">State</Label>
            <Input
              id="update-state"
              value={formData.state}
              onChange={(e) =>
                setFormData({ ...formData, state: e.target.value })
              }
              placeholder="NY"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="update-country">Country</Label>
            <Input
              id="update-country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              placeholder="USA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-postal">Postal Code</Label>
            <Input
              id="update-postal"
              value={formData.postalCode}
              onChange={(e) =>
                setFormData({ ...formData, postalCode: e.target.value })
              }
              placeholder="10001"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-manager-name">Manager Name</Label>
          <Input
            id="update-manager-name"
            value={formData.managerName}
            onChange={(e) =>
              setFormData({ ...formData, managerName: e.target.value })
            }
            placeholder="John Doe"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="update-manager-email">Manager Email</Label>
            <Input
              id="update-manager-email"
              type="email"
              value={formData.managerEmail}
              onChange={(e) =>
                setFormData({ ...formData, managerEmail: e.target.value })
              }
              placeholder="manager@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="update-manager-phone">Manager Phone</Label>
            <Input
              id="update-manager-phone"
              value={formData.managerPhone}
              onChange={(e) =>
                setFormData({ ...formData, managerPhone: e.target.value })
              }
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="update-capacity">Capacity (units)</Label>
          <Input
            id="update-capacity"
            type="number"
            min="0"
            value={formData.capacity}
            onChange={(e) =>
              setFormData({ ...formData, capacity: e.target.value })
            }
            placeholder="10000"
          />
        </div>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => clearSelectedWarehouse()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          className="bg-black text-white hover:bg-black/90"
          disabled={updateWarehouse.isPending}
        >
          {updateWarehouse.isPending ? "Updating..." : "Update Warehouse"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function UpdateWarehouseModal() {
  const { selectedWarehouse, clearSelectedWarehouse } = useWarehouseStore();
  const warehouseToUpdate =
    selectedWarehouse?.action === "update" ? selectedWarehouse.warehouse : null;
  const open = warehouseToUpdate !== null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      clearSelectedWarehouse();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Warehouse</DialogTitle>
          <DialogDescription>
            Update the warehouse information below.
          </DialogDescription>
        </DialogHeader>
        {warehouseToUpdate && (
          <UpdateWarehouseForm
            key={warehouseToUpdate.uuid}
            warehouseToUpdate={warehouseToUpdate}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
