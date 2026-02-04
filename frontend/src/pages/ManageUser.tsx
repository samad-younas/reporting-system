import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import UserManageForm, {
  type UserFormData,
} from "@/components/public/UserManageForm";
import UserTable, { type User } from "@/components/public/UserTable";
import { useFetch } from "@/hooks/useFetch";
import { LoadingSpinner } from "@/components/public/LoadingSpinner";
import { useSubmit } from "@/hooks/useSubmit";
import { toast } from "react-toastify";

const ManageUser: React.FC = () => {
  const { isPending, data: INITIAL_USERS } = useFetch({
    endpoint: "api/user/all",
    isAuth: true,
  });
  const { isPending: isSubmitting, mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/user/store",
    isAuth: true,
  });

  const { isPending: isUpdating, mutateAsync: updateMutate } = useSubmit({
    method: "POST",
    endpoint: (data: any) => `api/user/update/${data.id}`,
    isAuth: true,
  });

  const { isPending: isDeleting, mutateAsync: deleteMutate } = useSubmit({
    method: "DELETE",
    endpoint: (data: any) => `api/user/delete/${data.id}`,
    isAuth: true,
  });

  const { isPending: isStatusToggling, mutateAsync: toggleStatusMutate } =
    useSubmit({
      method: "POST",
      endpoint: (data: any) => `api/user/${data.id}/status`,
      isAuth: true,
    });

  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (INITIAL_USERS) {
      const usersData = Array.isArray(INITIAL_USERS)
        ? INITIAL_USERS
        : INITIAL_USERS.data || [];
      setUsers(usersData);
    }
  }, [INITIAL_USERS]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

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
    await deleteMutate({ id: userToDelete.id });
    setUsers(users.filter((u) => u.id !== userToDelete.id));
    toast.success("User deleted successfully!");
    setDeleteConfirmationOpen(false);
    setUserToDelete(null);
  };

  const handleToggleStatus = async (user: User) => {
    if (!user.profile) return;

    const newStatus = !user.profile.is_inactive;
    const response = await toggleStatusMutate({
      id: user.id,
      is_inactive: newStatus,
    });

    if (response) {
      setUsers(
        users.map((u) =>
          u.id === user.id
            ? {
                ...u,
                profile: { ...u.profile!, is_inactive: newStatus },
              }
            : u,
        ),
      );
      toast.success(response.message || "User status updated successfully!");
    }
  };

  const handleSubmitUser = async (formData: UserFormData) => {
    if (editingUser) {
      const dataToSubmit = { ...formData, id: editingUser.id };
      const data = await updateMutate(dataToSubmit);
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
      toast.success(data?.message || "User updated successfully!");
      setIsModalOpen(false);
    } else {
      const data = await mutateAsync(formData);
      if (data) {
        const newUser: User = data.data;
        setUsers([...users, newUser]);
        toast.success(data.message || "User created successfully!");
        setIsModalOpen(false);
      }
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

    return {
      email: editingUser.email,
      user_type: editingUser.user_type,
      role_id:
        typeof editingUser.role_id === "string"
          ? parseInt(editingUser.role_id)
          : editingUser.role_id,
      profile: editingUser.profile
        ? { ...defaultProfile, ...editingUser.profile }
        : defaultProfile,
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">
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
