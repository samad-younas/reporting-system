import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export interface UserFormData {
  email: string;
  password?: string;
  user_type: string;
  profile: {
    full_name: string;
    region: string;
    country: string;
    state: string;
    city: string;
    can_export: boolean;
    can_copy: boolean;
    is_cost_visible: boolean;
    is_inactive: boolean;
  };
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
    email: "",
    password: "",
    user_type: "user",
    profile: {
      full_name: "",
      region: "",
      country: "",
      state: "",
      city: "",
      can_export: false,
      can_copy: false,
      is_cost_visible: false,
      is_inactive: false,
    },
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        email: "",
        password: "",
        user_type: "user",
        profile: {
          full_name: "",
          region: "",
          country: "",
          state: "",
          city: "",
          can_export: false,
          can_copy: false,
          is_cost_visible: false,
          is_inactive: false,
        },
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (Object.keys(formData).includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseInt(value) : value,
      }));
    }
  };

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[80vh] overflow-y-auto px-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <input
            type="text"
            name="full_name"
            value={formData.profile.full_name}
            onChange={handleProfileChange}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!initialData}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="******"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">User Type</label>
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h3 className="text-sm font-bold mb-3">Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <input
              type="text"
              name="region"
              value={formData.profile.region}
              onChange={handleProfileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Country</label>
            <input
              type="text"
              name="country"
              value={formData.profile.country}
              onChange={handleProfileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <input
              type="text"
              name="state"
              value={formData.profile.state}
              onChange={handleProfileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <input
              type="text"
              name="city"
              value={formData.profile.city}
              onChange={handleProfileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="can_export"
            checked={formData.profile.can_export}
            onChange={handleProfileChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label className="text-sm font-medium cursor-pointer">
            Can Export
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="can_copy"
            checked={formData.profile.can_copy}
            onChange={handleProfileChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label className="text-sm font-medium cursor-pointer">Can Copy</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_cost_visible"
            checked={formData.profile.is_cost_visible}
            onChange={handleProfileChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label className="text-sm font-medium cursor-pointer">
            Is Cost Visible
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="is_inactive"
            checked={formData.profile.is_inactive}
            onChange={handleProfileChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label className="text-sm font-medium cursor-pointer">
            Is Inactive
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
