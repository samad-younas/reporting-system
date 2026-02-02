import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import CountrySelector from "./CountrySelector";

interface UserFormData {
  email: string;
  role: string;
  region: string;
  country: string;
  state: string;
  city: string;
  password?: string;
  canExport: boolean;
  canCopy: boolean;
  isCostVisible: boolean;
  isInactive: boolean;
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
    role: "user",
    region: "",
    country: "",
    state: "",
    city: "",
    canExport: false,
    canCopy: false,
    isCostVisible: false,
    isInactive: false,
    email: "",
    password: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        role: "user",
        region: "",
        country: "",
        state: "",
        city: "",
        email: "",
        password: "",
        canExport: false,
        canCopy: false,
        isCostVisible: false,
        isInactive: false,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    // Handle checkbox separately for type safety
    const checked = (e.target as HTMLInputElement).checked;

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
      <div className="space-y-2 mt-4">
        <label htmlFor="role" className="text-sm font-medium leading-none">
          Role
        </label>
        <select
          id="role"
          name="role"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="sales">Sales</option>
          <option value="user">User</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="region" className="text-sm font-medium leading-none">
            Region
          </label>
          <select
            id="region"
            name="region"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={formData.region}
            onChange={handleChange}
          >
            <option value="">Select Region</option>
            <option value="North America">North America</option>
            <option value="South America">South America</option>
            <option value="Europe">Europe</option>
            <option value="Asia">Asia</option>
            <option value="Africa">Africa</option>
            <option value="Oceania">Oceania</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium leading-none">
            Country
          </label>
          <CountrySelector
            value={formData.country}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, country: value }))
            }
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="text-sm font-medium leading-none">
            State / Province
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter State"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium leading-none">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter City"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Email
        </label>
        <input
          type="text"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter Email"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password || ""}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter Password"
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
            id="canCopy"
            name="canCopy"
            checked={formData.canCopy}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label
            htmlFor="canCopy"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Can Copy
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isCostVisible"
            name="isCostVisible"
            checked={formData.isCostVisible}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
          />
          <label
            htmlFor="isCostVisible"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Is Cost Visible
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
