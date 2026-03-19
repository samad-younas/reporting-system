import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search, UserCog } from "lucide-react";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import UserManageForm from "@/components/public/UserManageForm";
import type { UserFormData, User } from "@/types/user";
import UserTable from "@/components/public/UserTable";
import { useFetch } from "@/hooks/useFetch";
import { LoadingSpinner } from "@/components/public/LoadingSpinner";
import { useSubmit } from "@/hooks/useSubmit";
import { toast } from "react-toastify";

type SecurityOption = { id: number; name: string };

const normalizeOptionList = (raw: any): SecurityOption[] => {
  const list = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
      ? raw.data
      : [];

  return list
    .map((item: any) => ({
      id: Number(item?.id),
      name:
        item?.name ||
        item?.region_name ||
        item?.product_group_name ||
        item?.customer_group_name ||
        item?.label ||
        `ID ${item?.id}`,
    }))
    .filter((item: SecurityOption) => Number.isFinite(item.id));
};

const normalizeSecurityMappings = (raw: any) => {
  const payload = raw?.data || raw || {};

  if (payload?.regions || payload?.product_groups || payload?.customer_groups) {
    return {
      region_ids: (payload.regions || []).map((r: any) => Number(r?.id || r)),
      product_group_ids: (payload.product_groups || []).map((p: any) =>
        Number(p?.id || p),
      ),
      customer_group_ids: (payload.customer_groups || []).map((c: any) =>
        Number(c?.id || c),
      ),
    };
  }

  const mappings = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.mappings)
      ? payload.mappings
      : [];

  const out = {
    region_ids: [] as number[],
    product_group_ids: [] as number[],
    customer_group_ids: [] as number[],
  };

  mappings.forEach((mapping: any) => {
    const type = String(
      mapping?.mapping_type || mapping?.dimension_type || "",
    ).toLowerCase();
    const id = Number(
      mapping?.dimension_id ||
        mapping?.region_id ||
        mapping?.product_group_id ||
        mapping?.customer_group_id ||
        mapping?.id,
    );
    if (!Number.isFinite(id)) return;

    if (type.includes("region") || mapping?.region_id) {
      out.region_ids.push(id);
    }
    if (type.includes("product") || mapping?.product_group_id) {
      out.product_group_ids.push(id);
    }
    if (type.includes("customer") || mapping?.customer_group_id) {
      out.customer_group_ids.push(id);
    }
  });

  out.region_ids = Array.from(new Set(out.region_ids));
  out.product_group_ids = Array.from(new Set(out.product_group_ids));
  out.customer_group_ids = Array.from(new Set(out.customer_group_ids));

  return out;
};

const mapApiUserToUi = (raw: any): User => {
  const visibility = raw?.visibility_flags || {};
  const roles = Array.isArray(raw?.roles) ? raw.roles : [];
  const primaryRole = roles[0] || null;
  const roleIds = roles
    .map((role: any) => Number(role?.id))
    .filter((id: number) => Number.isFinite(id));
  const roleLabel = roles
    .map((role: any) => role?.role_name || role?.name || "")
    .filter(Boolean)
    .join(", ");
  const fullName =
    raw?.display_name || raw?.profile?.full_name || raw?.username || "";

  return {
    id: raw?.id,
    email: raw?.email || "",
    user_type:
      roleLabel ||
      raw?.user_type ||
      primaryRole?.role_name ||
      primaryRole?.name ||
      "",
    role_id: raw?.role_id || primaryRole?.id || "",
    role_ids:
      roleIds.length > 0
        ? roleIds
        : Array.isArray(raw?.role_ids)
          ? raw.role_ids
              .map((id: any) => Number(id))
              .filter((id: number) => Number.isFinite(id))
          : [],
    profile: {
      full_name: fullName,
      region: raw?.profile?.region || "",
      country: raw?.profile?.country || "",
      state: raw?.profile?.state || "",
      city: raw?.profile?.city || "",
      can_export: Boolean(raw?.profile?.can_export),
      can_copy: Boolean(raw?.profile?.can_copy),
      is_cost_visible: Boolean(
        raw?.profile?.is_cost_visible ?? visibility?.see_cost,
      ),
      is_inactive: raw?.profile
        ? Boolean(raw?.profile?.is_inactive)
        : !Boolean(raw?.is_active ?? true),
    },
  };
};

const buildUserPayload = (formData: UserFormData, isUpdate = false) => {
  const usernameFromEmail = formData.email.split("@")[0] || "user";
  const selectedRoleIds = Array.isArray(formData.role_ids)
    ? formData.role_ids
    : formData.role_id
      ? [formData.role_id]
      : [];

  return {
    username: usernameFromEmail,
    email: formData.email,
    display_name: formData.profile.full_name,
    ...(formData.password ? { password: formData.password } : {}),
    ...(formData.password && !isUpdate
      ? { password_confirmation: formData.password }
      : {}),
    auth_type: "internal",
    role_ids: selectedRoleIds,
    is_active: !formData.profile.is_inactive,
    visibility_flags: {
      see_cost: formData.profile.is_cost_visible,
      see_gp: false,
      see_margin: false,
    },
    region_ids: formData.access_mappings?.region_ids || [],
    product_group_ids: formData.access_mappings?.product_group_ids || [],
    customer_group_ids: formData.access_mappings?.customer_group_ids || [],
  };
};

const ManageUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { isPending, data: INITIAL_USERS } = useFetch({
    endpoint: "api/users",
    isAuth: true,
  });
  const { isPending: isSubmitting, mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/users",
    isAuth: true,
  });

  const { isPending: isUpdating, mutateAsync: updateMutate } = useSubmit({
    method: "PUT",
    endpoint: (data: any) => `api/users/${data.id}`,
    isAuth: true,
  });

  const { isPending: isDeleting, mutateAsync: deleteMutate } = useSubmit({
    method: "DELETE",
    endpoint: (data: any) => `api/users/${data.id}`,
    isAuth: true,
  });

  const { mutateAsync: toggleStatusMutate } = useSubmit({
    method: "POST",
    endpoint: (data: any) => `api/users/${data.id}/toggle-status`,
    isAuth: true,
  });

  const { mutateAsync: saveSecurityMappings } = useSubmit({
    method: "POST",
    endpoint: "api/security/mappings/bulk",
    isAuth: true,
  });

  const { mutateAsync: assignUserRole } = useSubmit({
    method: "POST",
    endpoint: "api/roles/assign-user",
    isAuth: true,
  });

  const { data: regionsData, isPending: regionsLoading } = useFetch({
    endpoint: "api/security/regions/flat",
    isAuth: true,
  });

  const { data: productGroupsData, isPending: productGroupsLoading } = useFetch(
    {
      endpoint: "api/security/product-groups",
      isAuth: true,
    },
  );

  const { data: customerGroupsData, isPending: customerGroupsLoading } =
    useFetch({
      endpoint: "api/security/customer-groups",
      isAuth: true,
    });

  const { data: userSecurityData, isPending: userSecurityLoading } = useFetch({
    endpoint: editingUser ? `api/users/${editingUser.id}/security` : undefined,
    isAuth: true,
  });

  const { data: userMappingsData, isPending: userMappingsLoading } = useFetch({
    endpoint: editingUser
      ? `api/security/mappings?user_id=${editingUser.id}`
      : undefined,
    isAuth: true,
  });

  useEffect(() => {
    if (INITIAL_USERS) {
      const usersData = Array.isArray(INITIAL_USERS)
        ? INITIAL_USERS
        : Array.isArray(INITIAL_USERS?.data)
          ? INITIAL_USERS.data
          : Array.isArray(INITIAL_USERS?.data?.data)
            ? INITIAL_USERS.data.data
            : [];
      setUsers(usersData.map((user: any) => mapApiUserToUi(user)));
    }
  }, [INITIAL_USERS]);

  const securityOptions = {
    regions: normalizeOptionList(regionsData),
    productGroups: normalizeOptionList(productGroupsData),
    customerGroups: normalizeOptionList(customerGroupsData),
  };

  const syncSecurityMappings = async (
    userId: string | number,
    formData: UserFormData,
  ) => {
    await saveSecurityMappings({
      user_id: userId,
      region_ids: formData.access_mappings?.region_ids || [],
      product_group_ids: formData.access_mappings?.product_group_ids || [],
      customer_group_ids: formData.access_mappings?.customer_group_ids || [],
    });
  };

  const syncRoleAssignment = async (
    userId: string | number,
    formData: UserFormData,
  ) => {
    const selectedRoleIds = Array.isArray(formData.role_ids)
      ? formData.role_ids
      : formData.role_id
        ? [formData.role_id]
        : [];

    if (selectedRoleIds.length === 0) return;

    await assignUserRole({
      user_id: userId,
      role_ids: selectedRoleIds,
    });
  };

  const filteredUsers = users.filter((user) => {
    const fullName = user.profile?.full_name || "";
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const isInactive = user.profile?.is_inactive || false;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? !isInactive
          : isInactive;

    return matchesSearch && matchesStatus;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (id: string | number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setUserToDelete(user);
      setDeleteConfirmationOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await deleteMutate({ id: userToDelete.id });
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      toast.success("User deleted successfully!");
      setDeleteConfirmationOpen(false);
      setUserToDelete(null);
    } catch {
      toast.error("Failed to delete user.");
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.profile) return;

    const newStatus = !user.profile.is_inactive;
    try {
      const response = await toggleStatusMutate({
        id: user.id,
        is_active: newStatus,
      });

      if (response) {
        setUsers(
          users.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  profile: { ...u.profile!, is_inactive: !newStatus },
                }
              : u,
          ),
        );
        toast.success(response.message || "User status updated successfully!");
      }
    } catch {
      toast.error("Failed to update user status.");
    }
  };

  const handleSubmitUser = async (formData: UserFormData) => {
    try {
      if (editingUser) {
        const dataToSubmit = {
          ...buildUserPayload(formData, true),
          id: editingUser.id,
        };
        const data = await updateMutate(dataToSubmit);
        const updatedRaw = data?.data || data;
        await syncRoleAssignment(editingUser.id, formData);
        await syncSecurityMappings(editingUser.id, formData);
        setUsers(
          users.map((u) =>
            u.id === editingUser.id ? mapApiUserToUi(updatedRaw) : u,
          ),
        );
        toast.success(data?.message || "User updated successfully!");
        setIsModalOpen(false);
      } else {
        const data = await mutateAsync(buildUserPayload(formData));
        if (data) {
          const newUserRaw = data.data || data;
          const userId = newUserRaw?.id;
          if (userId) {
            await syncRoleAssignment(userId, formData);
            await syncSecurityMappings(userId, formData);
          }

          const newUser: User = mapApiUserToUi(newUserRaw);
          setUsers([...users, newUser]);
          toast.success(data.message || "User created successfully!");
          setIsModalOpen(false);
        }
      }
    } catch {
      // Toast is already handled by useSubmit, no-op here for UX consistency.
    }
  };

  if (isPending) {
    return <LoadingSpinner />;
  }

  const getInitialFormData = (): UserFormData | null => {
    if (!editingUser) return null;

    const defaultProfile = {
      full_name: "",
      region: "",
      country: "",
      state: "",
      city: "",
      can_export: false,
      can_copy: false,
      is_cost_visible: false,
      is_inactive: false,
    };

    const mapping = normalizeSecurityMappings(
      userSecurityData || userMappingsData,
    );

    return {
      email: editingUser.email,
      user_type: editingUser.user_type,
      role_id:
        typeof editingUser.role_id === "string"
          ? parseInt(editingUser.role_id)
          : editingUser.role_id,
      role_ids: Array.isArray(editingUser.role_ids)
        ? editingUser.role_ids
        : typeof editingUser.role_id === "number"
          ? [editingUser.role_id]
          : typeof editingUser.role_id === "string" && editingUser.role_id
            ? [parseInt(editingUser.role_id)]
            : [],
      profile: editingUser.profile
        ? { ...defaultProfile, ...editingUser.profile }
        : defaultProfile,
      access_mappings: mapping,
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <UserCog className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage user access and permissions.
          </p>
        </div>
        <Button onClick={handleCreateUser} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New User
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
        <div className="relative w-full sm:w-75">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search users by name or email..."
            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
      />

      <SimpleDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit User" : "Create New User"}
      >
        <UserManageForm
          initialData={getInitialFormData()}
          onSubmit={handleSubmitUser}
          onCancel={() => setIsModalOpen(false)}
          isSubmitting={isSubmitting || isUpdating}
          securityOptions={securityOptions}
          isSecurityLoading={
            regionsLoading ||
            productGroupsLoading ||
            customerGroupsLoading ||
            (Boolean(editingUser) &&
              (userSecurityLoading || userMappingsLoading))
          }
        />
      </SimpleDialog>

      <SimpleDialog
        isOpen={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p>
            Are you sure you want to delete user{" "}
            <strong>
              {userToDelete?.profile?.full_name || userToDelete?.email}
            </strong>
            ? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmationOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete user"}
            </Button>
          </div>
        </div>
      </SimpleDialog>
    </div>
  );
};

export default ManageUser;
