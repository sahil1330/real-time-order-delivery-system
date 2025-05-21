import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { User } from "next-auth";
import { useState, useEffect } from "react";

import { Loader2, CheckCircle2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function SheetModel({ user }: { user: User }) {
  const { data: session, update } = useSession();
  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Update form data when session or user prop changes
  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        phone: session.user.phone || "",
        address: session.user.address || "",
      });
    }
  }, [session?.user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));

    // Hide success message when editing
    if (isSuccess) {
      setIsSuccess(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    try {
      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        // Show success message
        toast.success(result.message || "Profile updated successfully");
        setIsSuccess(true);
        // Update the session data without page reload
        await update({
          name: formData.name,
          phone: formData?.phone,
          address: formData?.address,
        });
        // Close the sheet after a brief delay
        setTimeout(() => {
          setIsOpen(false);
        }, 1500);
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Edit Profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>

          {isSuccess && (
            <div className="my-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center text-green-700">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span>Profile updated successfully!</span>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={user.email || ""}
                className="col-span-3"
                disabled
                title="Email cannot be changed"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Enter your phone number"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className="col-span-3 min-h-[100px]"
                placeholder="Enter your delivery address"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Input
                id="role"
                value={user.role || ""}
                className="col-span-3"
                disabled
                title="Role cannot be changed"
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
