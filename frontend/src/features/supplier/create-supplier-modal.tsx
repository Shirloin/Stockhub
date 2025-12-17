import { useState } from "react";
import { useCreateSupplier } from "@/hooks/use-supplier";
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

export default function CreateSupplierModal() {
  const [open, setOpen] = useState(false);
  const { mutate: createSupplier, isPending } = useCreateSupplier();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    contactName: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      contactName: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      createSupplier(
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          contactName: formData.contactName,
        },
        {
          onSuccess: () => {
            resetForm();
            setOpen(false);
          },
        }
      );
    } catch (error) {
      console.error("Failed to create supplier:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="bg-black text-white hover:bg-black/90">
          Create Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Supplier</DialogTitle>
          <DialogDescription>
            Add a new supplier to your vendor list.
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
                placeholder="Enter supplier name"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-contact">Contact Name</Label>
                <Input
                  id="create-contact"
                  value={formData.contactName}
                  onChange={(e) =>
                    setFormData({ ...formData, contactName: e.target.value })
                  }
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="supplier@example.com"
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
                placeholder="Enter supplier address"
                rows={3}
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
              {isPending ? "Creating..." : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

