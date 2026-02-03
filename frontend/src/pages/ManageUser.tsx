import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import UserManageForm from "@/components/public/UserManageForm";
import UserTable, { type User } from "@/components/public/UserTable";

const INITIAL_USERS: User[] = [
  { id: "1", name: "ABC", canExport: true, isInactive: false, isAdmin: true },
  { id: "2", name: "DEF", canExport: true, isInactive: true, isAdmin: true },
  { id: "3", name: "GHI", canExport: true, isInactive: false, isAdmin: true },
];

const ManageUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? !user.isInactive
          : user.isInactive;

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

  const handleDeleteUser = (id: string) => {
    alert("User deleted successfully!");
    console.log("Deleted User ID:", id);
  };

  const handleToggleStatus = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, isInactive: !u.isInactive } : u,
      ),
    );
  };

  const handleSubmitUser = (formData: any) => {
    alert("User saved successfully!");
    console.log("Submitted User Data:", formData);
    setIsModalOpen(false);
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
            placeholder="Search users by name or ID..."
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
          initialData={
            editingUser
              ? {
                  userId: editingUser.id,
                  userName: editingUser.name,
                  canExport: editingUser.canExport,
                  isInactive: editingUser.isInactive,
                  isAdmin: editingUser.isAdmin,
                }
              : null
          }
          onSubmit={handleSubmitUser}
          onCancel={() => setIsModalOpen(false)}
        />
      </SimpleDialog>
    </div>
  );
};

export default ManageUser;
