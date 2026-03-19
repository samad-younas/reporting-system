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
  permissions?: string[];
  user_count?: number;
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

  const [formData, setFormData] = useState({
    role_name: "",
    description: "",
    is_active: true,
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
      permissions: normalizePermissions(role.permissions),
      user_count: Number(role.user_count || 0),
    })) as RoleRecord[];
  }, [rolesData]);

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

    const payload = {
      role_name: formData.role_name,
      description: formData.description,
      is_active: formData.is_active,
      permissions: formData.permissions,
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
