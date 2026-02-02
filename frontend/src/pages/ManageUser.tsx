import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import UserManageForm from "@/components/public/UserManageForm";
import UserTable, { type User } from "@/components/public/UserTable";

const INITIAL_USERS: User[] = [
  {
    email: "abc@example.com",
    role: "admin",
    region: "North America",
    country: "United States",
    state: "NY",
    city: "New York",
    canExport: true,
    canCopy: true,
    isCostVisible: true,
    isInactive: false,
  },
  {
    email: "def@example.com",
    role: "manager",
    region: "Europe",
    country: "United Kingdom",
    state: "London",
    city: "London",
    canExport: true,
    canCopy: false,
    isCostVisible: false,
    isInactive: true,
  },
  {
    email: "ghi@example.com",
    role: "sales",
    region: "Europe",
    country: "France",
    state: "Île-de-France",
    city: "Paris",
    canExport: true,
    canCopy: true,
    isCostVisible: false,
    isInactive: false,
  },
  {
    email: "jkl@example.com",
    role: "user",
    region: "North America",
    country: "United States",
    state: "NY",
    city: "New York",
    canExport: true,
    canCopy: true,
    isCostVisible: false,
    isInactive: true,
  },
];

const ManageUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.region.toLowerCase().includes(searchQuery.toLowerCase());
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
        u.email === user.email ? { ...u, isInactive: !u.isInactive } : u,
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
                  role: editingUser.role,
                  region: editingUser.region,
                  country: editingUser.country,
                  state: editingUser.state,
                  city: editingUser.city,
                  email: editingUser.email,
                  canExport: editingUser.canExport,
                  canCopy: editingUser.canCopy,
                  isCostVisible: editingUser.isCostVisible,
                  isInactive: editingUser.isInactive,
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
