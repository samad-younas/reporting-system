import React, { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import { useFetch } from "@/hooks/useFetch";
import { useSubmit } from "@/hooks/useSubmit";
import { LoadingSpinner } from "@/components/public/LoadingSpinner";
import {
  KeyRound,
  PlusCircle,
  Pencil,
  Trash2,
  Search,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-toastify";

type RoleRecord = {
  id: number;
  role_name: string;
  description?: string;
  is_active?: boolean;
  is_system_role?: boolean;
  permissions?: string[];
  user_count?: number;
};

type UserOption = {
  id: number;
  name: string;
};

const normalizePermissions = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => (typeof item === "string" ? item : ""))
    .map((value) => value.trim())
    .filter(Boolean);
};

const toTitleCase = (value: string): string => {
  return value
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getPermissionMeta = (permissionKey: string) => {
  const normalized = permissionKey.trim();
  const segments = normalized.split(".").filter(Boolean);
  const groupToken = segments[0] || "general";
  const actionToken = segments.slice(1).join(" ") || segments[0] || "access";

  return {
    raw: normalized,
    group: toTitleCase(groupToken),
    label: toTitleCase(actionToken),
  };
};

const ManageRoles: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [deleteRole, setDeleteRole] = useState<RoleRecord | null>(null);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoleIds, setAssignRoleIds] = useState<string[]>([]);
  const [assignStartDate, setAssignStartDate] = useState("");
  const [assignEndDate, setAssignEndDate] = useState("");

  const [formData, setFormData] = useState({
    role_name: "",
    description: "",
    is_active: true,
    is_system_role: false,
    permissions: [] as string[],
  });

  const {
    data: rolesData,
    isPending: rolesLoading,
    refetch: refetchRoles,
  } = useFetch({
    endpoint: "api/roles",
    isAuth: true,
  });

  const {
    data: permissionKeysData,
    isPending: permissionsLoading,
    isError: permissionKeysError,
    refetch: refetchPermissionKeys,
  } = useFetch({
    endpoint: "api/roles/permissions/available",
    isAuth: true,
  });

  const { data: usersData, isPending: usersLoading } = useFetch({
    endpoint: "api/users",
    isAuth: true,
  });

  const { isPending: creating, mutateAsync: createRole } = useSubmit({
    method: "POST",
    endpoint: "api/roles",
    isAuth: true,
  });

  const { isPending: updating, mutateAsync: updateRole } = useSubmit({
    method: "PUT",
    endpoint: (data: any) => `api/roles/${data.id}`,
    isAuth: true,
  });

  const { isPending: deleting, mutateAsync: removeRole } = useSubmit({
    method: "DELETE",
    endpoint: (data: any) => `api/roles/${data.id}`,
    isAuth: true,
  });

  const { isPending: assigning, mutateAsync: assignUserRoles } = useSubmit({
    method: "POST",
    endpoint: "api/roles/assign-user",
    isAuth: true,
  });

  const roles = useMemo(() => {
    const list = Array.isArray(rolesData?.data)
      ? rolesData.data
      : Array.isArray(rolesData)
        ? rolesData
        : [];

    return list.map((role: any) => ({
      id: Number(role.id),
      role_name: role.role_name || role.name || "",
      description: role.description || "",
      is_active: Boolean(role.is_active ?? true),
      is_system_role: Boolean(role.is_system_role ?? false),
      permissions: normalizePermissions(role.permissions),
      user_count: Number(role.user_count || 0),
    })) as RoleRecord[];
  }, [rolesData]);

  const users = useMemo(() => {
    const list = Array.isArray(usersData?.data)
      ? usersData.data
      : Array.isArray(usersData)
        ? usersData
        : [];

    return list
      .map((user: any) => ({
        id: Number(user?.id),
        name:
          user?.name ||
          user?.display_name ||
          user?.username ||
          user?.email ||
          `User ${user?.id}`,
      }))
      .filter((user: UserOption) => Number.isFinite(user.id)) as UserOption[];
  }, [usersData]);

  const permissionKeys = useMemo(() => {
    const list = Array.isArray(permissionKeysData?.data)
      ? permissionKeysData.data
      : Array.isArray(permissionKeysData)
        ? permissionKeysData
        : [];

    return list
      .map((item: any) => (typeof item === "string" ? item : ""))
      .map((value: string) => value.trim())
      .filter(Boolean);
  }, [permissionKeysData]);

  const rolePermissionsFallback = useMemo(() => {
    return Array.from(
      new Set(roles.flatMap((role) => normalizePermissions(role.permissions))),
    );
  }, [roles]);

  const selectablePermissionKeys = useMemo(() => {
    return Array.from(
      new Set([
        ...permissionKeys,
        ...rolePermissionsFallback,
        ...formData.permissions,
      ]),
    ).sort();
  }, [permissionKeys, rolePermissionsFallback, formData.permissions]);

  const filteredSelectablePermissionKeys = useMemo(() => {
    const query = permissionSearch.trim().toLowerCase();
    if (!query) return selectablePermissionKeys;

    return selectablePermissionKeys.filter((permissionKey) => {
      const meta = getPermissionMeta(permissionKey);
      return (
        permissionKey.toLowerCase().includes(query) ||
        meta.group.toLowerCase().includes(query) ||
        meta.label.toLowerCase().includes(query)
      );
    });
  }, [selectablePermissionKeys, permissionSearch]);

  const openCreate = () => {
    setEditingRole(null);
    setPermissionSearch("");
    setFormData({
      role_name: "",
      description: "",
      is_active: true,
      is_system_role: false,
      permissions: [],
    });
    setIsModalOpen(true);
  };

  const openEdit = (role: RoleRecord) => {
    setEditingRole(role);
    setPermissionSearch("");
    setFormData({
      role_name: role.role_name,
      description: role.description || "",
      is_active: Boolean(role.is_active),
      is_system_role: Boolean(role.is_system_role),
      permissions: role.permissions || [],
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permissionKey: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter((key) => key !== permissionKey)
        : [...prev.permissions, permissionKey],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const roleName = formData.role_name.trim();
    if (!roleName) {
      toast.error("Role name is required.");
      return;
    }

    const payload = {
      role_name: roleName,
      description: formData.description.trim(),
      is_active: formData.is_active,
      is_system_role: formData.is_system_role,
      permissions: Array.from(new Set(formData.permissions)),
    };

    try {
      if (editingRole) {
        await updateRole({ ...payload, id: editingRole.id });
        toast.success("Role updated successfully.");
      } else {
        await createRole(payload);
        toast.success("Role created successfully.");
      }
      setIsModalOpen(false);
      await refetchRoles();
      await refetchPermissionKeys();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleAssignRoles = async (e: React.FormEvent) => {
    e.preventDefault();

    const userIdNum = Number(assignUserId);
    if (!Number.isFinite(userIdNum)) {
      toast.error("Please select a user.");
      return;
    }

    const roleIds = Array.from(
      new Set(
        assignRoleIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id)),
      ),
    );

    if (roleIds.length === 0) {
      toast.error("Please select at least one role.");
      return;
    }

    if (assignStartDate && assignEndDate && assignEndDate < assignStartDate) {
      toast.error("End date cannot be earlier than start date.");
      return;
    }

    try {
      await assignUserRoles({
        user_id: userIdNum,
        role_ids: roleIds,
        ...(assignStartDate ? { start_date: assignStartDate } : {}),
        ...(assignEndDate ? { end_date: assignEndDate } : {}),
      });
      toast.success("Roles assigned successfully.");
      setAssignRoleIds([]);
      setAssignStartDate("");
      setAssignEndDate("");
      await refetchRoles();
    } catch {
      // useSubmit handles error toast.
    }
  };

  const handleDelete = async () => {
    if (!deleteRole) return;
    try {
      await removeRole({ id: deleteRole.id });
      toast.success("Role deleted successfully.");
      setDeleteRole(null);
      await refetchRoles();
      await refetchPermissionKeys();
    } catch {
      // useSubmit handles error toast.
    }
  };

  if (rolesLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
            <KeyRound className="h-8 w-8" />
            Role Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, update, and remove roles with permission sets.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      <Card className="shadow-sm border border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Roles</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage who can access each part of the system.
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3 pr-4">Users</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Permissions</th>
                  <th className="py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{role.role_name}</td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {role.description || "-"}
                    </td>
                    <td className="py-3 pr-4">{role.user_count || 0}</td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant={role.is_active ? "secondary" : "outline"}
                        className={
                          role.is_active
                            ? "text-emerald-700 bg-emerald-100 border-emerald-200"
                            : "text-muted-foreground"
                        }
                      >
                        {role.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(role.permissions || [])
                          .slice(0, 2)
                          .map((permission) => {
                            const meta = getPermissionMeta(permission);
                            return (
                              <Badge
                                key={permission}
                                variant="outline"
                                className="font-normal"
                                title={permission}
                              >
                                {meta.group}: {meta.label}
                              </Badge>
                            );
                          })}
                        {(role.permissions || []).length > 2 && (
                          <Badge variant="secondary" className="font-normal">
                            +{(role.permissions || []).length - 2} more
                          </Badge>
                        )}
                        {(role.permissions || []).length === 0 && (
                          <span className="text-muted-foreground text-xs">
                            None
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteRole(role)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td
                      className="py-6 text-center text-muted-foreground"
                      colSpan={6}
                    >
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-border/70">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">Assign Roles To User</CardTitle>
          <p className="text-sm text-muted-foreground">
            This syncs roles and replaces all current roles for the selected
            user.
          </p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleAssignRoles}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assign_user">User</Label>
              <select
                id="assign_user"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={assignUserId}
                onChange={(e) => setAssignUserId(e.target.value)}
                required
                disabled={usersLoading || assigning}
              >
                <option value="">Select user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="assign_roles">Roles</Label>
              <select
                id="assign_roles"
                className="flex min-h-36 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={assignRoleIds}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map(
                    (option) => option.value,
                  );
                  setAssignRoleIds(selected);
                }}
                multiple
                disabled={assigning}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.role_name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Hold Command on macOS or Ctrl on Windows to select multiple
                roles.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign_start_date">Start Date (optional)</Label>
              <Input
                id="assign_start_date"
                type="date"
                value={assignStartDate}
                onChange={(e) => setAssignStartDate(e.target.value)}
                disabled={assigning}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign_end_date">End Date (optional)</Label>
              <Input
                id="assign_end_date"
                type="date"
                value={assignEndDate}
                onChange={(e) => setAssignEndDate(e.target.value)}
                disabled={assigning}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button
                type="submit"
                disabled={
                  assigning ||
                  usersLoading ||
                  !assignUserId ||
                  assignRoleIds.length === 0
                }
              >
                {assigning ? "Saving..." : "Assign Roles"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <SimpleDialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? "Edit Role" : "Create Role"}
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[75vh] overflow-y-auto pr-1"
        >
          <div className="space-y-2">
            <Label htmlFor="role_name">Role Name</Label>
            <Input
              id="role_name"
              value={formData.role_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role_name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="h-4 w-4"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              id="is_system_role"
              type="checkbox"
              checked={formData.is_system_role}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_system_role: e.target.checked,
                }))
              }
              className="h-4 w-4"
            />
            <Label htmlFor="is_system_role">System Role</Label>
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            <div className="rounded-md border bg-muted/20 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Selected Permissions ({formData.permissions.length})
              </div>
              {formData.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.permissions.map((permissionKey) => {
                    const meta = getPermissionMeta(permissionKey);
                    return (
                      <Badge
                        key={permissionKey}
                        variant="secondary"
                        className="px-2 py-1 bg-primary/10 text-primary border-primary/20"
                        title={permissionKey}
                      >
                        {meta.group}: {meta.label}
                      </Badge>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No permissions selected yet.
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Permission names are read-only. Select or deselect using the
                list below.
              </p>
            </div>

            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                placeholder="Search permissions"
                className="pl-9"
              />
            </div>

            {permissionsLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading permissions...
              </p>
            ) : selectablePermissionKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No predefined permission keys found.
              </p>
            ) : filteredSelectablePermissionKeys.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No permissions match your search.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-3 max-h-64 overflow-y-auto bg-background">
                {filteredSelectablePermissionKeys.map(
                  (permissionKey: string) => {
                    const meta = getPermissionMeta(permissionKey);
                    const isSelected =
                      formData.permissions.includes(permissionKey);

                    return (
                      <button
                        type="button"
                        key={permissionKey}
                        onClick={() => togglePermission(permissionKey)}
                        className={`text-left rounded-md border p-3 transition-colors ${
                          isSelected
                            ? "bg-primary/10 border-primary/30"
                            : "hover:bg-muted/50"
                        }`}
                        title={permissionKey}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">
                              {meta.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {meta.group}
                            </p>
                          </div>
                          {isSelected ? (
                            <Badge variant="secondary" className="shrink-0">
                              Selected
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="shrink-0 font-normal"
                            >
                              Add
                            </Badge>
                          )}
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}

            {permissionKeysError && (
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  Could not load predefined permission keys.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => refetchPermissionKeys()}
                >
                  Retry
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || updating}>
              {creating || updating ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </SimpleDialog>

      <SimpleDialog
        isOpen={Boolean(deleteRole)}
        onClose={() => setDeleteRole(null)}
        title="Delete Role"
      >
        <div className="space-y-4">
          <p>
            Delete role <strong>{deleteRole?.role_name}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteRole(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </SimpleDialog>
    </div>
  );
};

export default ManageRoles;
