import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useFetch } from "@/hooks/useFetch";
import { LoadingSpinner } from "./LoadingSpinner";
import type { UserFormData } from "@/types/user";

interface SecurityOption {
  id: number;
  name: string;
}

interface UserManageFormProps {
  isSubmitting?: boolean;
  initialData?: UserFormData | null;
  onSubmit: (data: UserFormData) => void;
  onCancel: () => void;
  securityOptions?: {
    regions: SecurityOption[];
    productGroups: SecurityOption[];
    customerGroups: SecurityOption[];
  };
  isSecurityLoading?: boolean;
}

const UserManageForm: React.FC<UserManageFormProps> = ({
  isSubmitting,
  initialData,
  onSubmit,
  onCancel,
  securityOptions,
  isSecurityLoading = false,
}) => {
  const { isPending, data: rolesData } = useFetch({
    endpoint: "api/roles",
    isAuth: true,
  });

  const normalizedRoles = Array.isArray(rolesData)
    ? rolesData
    : Array.isArray(rolesData?.data)
      ? rolesData.data
      : [];

  const [formData, setFormData] = React.useState<UserFormData>({
    email: "",
    password: "",
    user_type: "",
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
    access_mappings: {
      region_ids: [],
      product_group_ids: [],
      customer_group_ids: [],
    },
    role_ids: [],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        email: "",
        password: "",
        user_type: "",
        role_id: undefined,
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
        access_mappings: {
          region_ids: [],
          product_group_ids: [],
          customer_group_ids: [],
        },
        role_ids: [],
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

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIds = Array.from(e.target.selectedOptions)
      .map((option) => parseInt(option.value, 10))
      .filter((id) => !isNaN(id));

    const selectedRoles = normalizedRoles.filter((role: any) =>
      selectedIds.includes(Number(role.id)),
    );

    const roleLabel = selectedRoles
      .map((role: any) => role.role_name || role.name || "")
      .filter(Boolean)
      .join(", ");

    setFormData((prev) => ({
      ...prev,
      user_type: roleLabel,
      role_id: selectedIds[0],
      role_ids: selectedIds,
      profile: {
        ...prev.profile,
        can_export: selectedRoles.some((role: any) =>
          Array.isArray(role?.permissions)
            ? role.permissions.includes("reports.export")
            : false,
        ),
      },
    }));
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

  const handleAccessMappingChange = (
    key: "region_ids" | "product_group_ids" | "customer_group_ids",
    values: string[],
  ) => {
    const ids = values.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v));
    setFormData((prev) => ({
      ...prev,
      access_mappings: {
        region_ids: prev.access_mappings?.region_ids || [],
        product_group_ids: prev.access_mappings?.product_group_ids || [],
        customer_group_ids: prev.access_mappings?.customer_group_ids || [],
        [key]: ids,
      },
    }));
  };

  if (isPending || isSecurityLoading) {
    return <LoadingSpinner />;
  }

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
          <label className="text-sm font-medium">Roles</label>
          <select
            name="role_ids"
            multiple
            value={(formData.role_ids && formData.role_ids.length > 0
              ? formData.role_ids
              : formData.role_id
                ? [formData.role_id]
                : []
            ).map(String)}
            onChange={handleRoleChange}
            className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!rolesData}
          >
            {normalizedRoles.map((role: any) => (
              <option key={role.id} value={role.id}>
                {role.role_name || role.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Hold Command (Mac) or Ctrl (Windows) to select multiple roles.
          </p>
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

      <div className="border-t pt-4 mt-2">
        <h3 className="text-sm font-bold mb-3">Data Visibility Mapping</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Map user access to security dimensions. Hold Command (Mac) or Ctrl
          (Windows) to select multiple entries.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Regions</label>
            <select
              multiple
              className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.access_mappings?.region_ids?.map(String) || []}
              onChange={(e) =>
                handleAccessMappingChange(
                  "region_ids",
                  Array.from(e.target.selectedOptions).map(
                    (option) => option.value,
                  ),
                )
              }
            >
              {(securityOptions?.regions || []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Groups</label>
            <select
              multiple
              className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={
                formData.access_mappings?.product_group_ids?.map(String) || []
              }
              onChange={(e) =>
                handleAccessMappingChange(
                  "product_group_ids",
                  Array.from(e.target.selectedOptions).map(
                    (option) => option.value,
                  ),
                )
              }
            >
              {(securityOptions?.productGroups || []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Customer Groups</label>
            <select
              multiple
              className="flex min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={
                formData.access_mappings?.customer_group_ids?.map(String) || []
              }
              onChange={(e) =>
                handleAccessMappingChange(
                  "customer_group_ids",
                  Array.from(e.target.selectedOptions).map(
                    (option) => option.value,
                  ),
                )
              }
            >
              {(securityOptions?.customerGroups || []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`${isSubmitting ? "cursor-not-allowed bg-gray-500 hover:bg-gray-600" : ""}`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default UserManageForm;
