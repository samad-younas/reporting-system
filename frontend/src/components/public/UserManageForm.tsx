import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      return;
    }

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
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (Object.keys(formData).includes(name)) {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "number" ? parseInt(value, 10) : value,
      }));
    }
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRoleId = Number.parseInt(e.target.value, 10);
    const selectedIds = Number.isFinite(selectedRoleId) ? [selectedRoleId] : [];

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
    const ids = values
      .map((v) => Number.parseInt(v, 10))
      .filter((v) => !isNaN(v));
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
      className="space-y-5 max-h-[80vh] overflow-y-auto px-1"
    >
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">Account Details</h3>
          <Badge variant="outline">Required</Badge>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input
              type="text"
              name="full_name"
              value={formData.profile.full_name}
              onChange={handleProfileChange}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="John Doe"
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
              placeholder={
                initialData ? "Leave blank to keep current password" : "******"
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              name="role_id"
              value={
                formData.role_id
                  ? String(formData.role_id)
                  : formData.role_ids?.[0]
                    ? String(formData.role_ids[0])
                    : ""
              }
              onChange={handleRoleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!rolesData}
              required
            >
              <option value="" disabled>
                Select one role
              </option>
              {normalizedRoles.map((role: any) => (
                <option key={role.id} value={role.id}>
                  {role.role_name || role.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Each user can have one primary role.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Profile Details</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">User Permissions</h3>
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
            <input
              type="checkbox"
              name="can_export"
              checked={formData.profile.can_export}
              onChange={handleProfileChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
            <span className="text-sm font-medium">Can Export</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
            <input
              type="checkbox"
              name="can_copy"
              checked={formData.profile.can_copy}
              onChange={handleProfileChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
            <span className="text-sm font-medium">Can Copy</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
            <input
              type="checkbox"
              name="is_cost_visible"
              checked={formData.profile.is_cost_visible}
              onChange={handleProfileChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
            <span className="text-sm font-medium">Cost Visible</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2">
            <input
              type="checkbox"
              name="is_inactive"
              checked={formData.profile.is_inactive}
              onChange={handleProfileChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
            />
            <span className="text-sm font-medium">Mark as Inactive</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 text-sm font-semibold">Data Visibility Mapping</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Select allowed regions, product groups, and customer groups. Use
          Command/Ctrl for multi-select.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background/95 pb-1 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className={
            isSubmitting
              ? "cursor-not-allowed bg-gray-500 hover:bg-gray-600"
              : ""
          }
        >
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update User"
              : "Create User"}
        </Button>
      </div>
    </form>
  );
};

export default UserManageForm;
