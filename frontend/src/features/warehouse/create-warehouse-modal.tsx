import { useState } from "react";
import { useCreateWarehouse } from "@/hooks/use-warehouse";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateWarehouseModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createWarehouse, isPending } = useCreateWarehouse();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    managerName: "",
    managerEmail: "",
    managerPhone: "",
    capacity: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      managerName: "",
      managerEmail: "",
      managerPhone: "",
      capacity: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createWarehouse(
        {
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          postalCode: formData.postalCode,
          managerName: formData.managerName || undefined,
          managerEmail: formData.managerEmail || undefined,
          managerPhone: formData.managerPhone || undefined,
          capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
          isActive: true,
        },
        {
          onSuccess: () => {
            resetForm();
            setOpen(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to create warehouse:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="bg-black text-white hover:bg-black/90"
        >
          Create Warehouse
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Warehouse</DialogTitle>
          <DialogDescription>
            Add a new warehouse location to manage inventory.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Name *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Main Warehouse"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-address">Address</Label>
              <Textarea
                id="create-address"
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
                <Label htmlFor="create-city">City</Label>
                <Input
                  id="create-city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-state">State</Label>
                <Input
                  id="create-state"
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
                <Label htmlFor="create-country">Country</Label>
                <Input
                  id="create-country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="USA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-postal">Postal Code</Label>
                <Input
                  id="create-postal"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData({ ...formData, postalCode: e.target.value })
                  }
                  placeholder="10001"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-manager-name">Manager Name</Label>
              <Input
                id="create-manager-name"
                value={formData.managerName}
                onChange={(e) =>
                  setFormData({ ...formData, managerName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-manager-email">Manager Email</Label>
                <Input
                  id="create-manager-email"
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, managerEmail: e.target.value })
                  }
                  placeholder="manager@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-manager-phone">Manager Phone</Label>
                <Input
                  id="create-manager-phone"
                  value={formData.managerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, managerPhone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-capacity">Capacity (units)</Label>
              <Input
                id="create-capacity"
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
              type="submit"
              variant="default"
              className="bg-black text-white hover:bg-black/90"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Warehouse"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
