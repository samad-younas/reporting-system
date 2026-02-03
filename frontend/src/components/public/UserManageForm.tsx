import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface UserFormData {
  userId: string;
  userName: string;
  canExport: boolean;
  isInactive: boolean;
  isAdmin: boolean;
}

interface UserManageFormProps {
  initialData?: UserFormData | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
}

const UserManageForm: React.FC<UserManageFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<UserFormData>({
    userId: "",
    userName: "",
    canExport: false,
    isInactive: false,
    isAdmin: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        userId: "",
        userName: "",
        canExport: false,
        isInactive: false,
        isAdmin: false,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="userId"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          User ID
        </label>
        <input
          type="text"
          id="userId"
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          required
          disabled={!!initialData}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter User ID"
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="userName"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          User Name
        </label>
        <input
          type="text"
          id="userName"
          name="userName"
          value={formData.userName}
          onChange={handleChange}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter User Name"
        />
      </div>

      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="canExport"
            name="canExport"
            checked={formData.canExport}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label
            htmlFor="canExport"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Can Export
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isInactive"
            name="isInactive"
            checked={formData.isInactive}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label
            htmlFor="isInactive"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Is Inactive
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAdmin"
            name="isAdmin"
            checked={formData.isAdmin}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label
            htmlFor="isAdmin"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Is Admin
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
};

export default UserManageForm;
