import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Search } from "lucide-react";
import { SimpleDialog } from "@/components/ui/simple-dialog";
import UserManageForm, {
  type UserFormData,
} from "@/components/public/UserManageForm";
import UserTable, { type User } from "@/components/public/UserTable";

const INITIAL_USERS: User[] = [
  {
    id: "1",
    email: "abc@example.com",
    user_type: "user",
    location: "New York",
    role_id: 1,
    profile: {
      full_name: "ABC User",
      region: "North",
      country: "USA",
      state: "NY",
      city: "NYC",
      can_export: true,
      can_copy: false,
      is_cost_visible: true,
      is_inactive: false,
    },
  },
  {
    id: "2",
    email: "def@example.com",
    user_type: "admin",
    location: "London",
    role_id: 2,
    profile: {
      full_name: "DEF User",
      region: "UK",
      country: "UK",
      state: "London",
      city: "London",
      can_export: true,
      can_copy: true,
      is_cost_visible: false,
      is_inactive: true,
    },
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
      user.profile.full_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? !user.profile.is_inactive
          : user.profile.is_inactive;

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
    setUsers(users.filter((u) => u.id !== id));
    console.log("Deleted User ID:", id);
  };

  const handleToggleStatus = (user: User) => {
    setUsers(
      users.map((u) =>
        u.id === user.id
          ? {
              ...u,
              profile: { ...u.profile, is_inactive: !u.profile.is_inactive },
            }
          : u,
      ),
    );
  };

  const handleSubmitUser = (formData: UserFormData) => {
    if (editingUser) {
      // Update existing user
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u)),
      );
    } else {
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
      };
      setUsers([...users, newUser]);
    }
    console.log("Submitted User Data Payload:", formData);
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
          initialData={
            editingUser
              ? {
                  email: editingUser.email,
                  // password field is typically not populated on edit for security, or left blank to indicate no change
                  user_type: editingUser.user_type,
                  location: editingUser.location,
                  role_id: editingUser.role_id,
                  profile: { ...editingUser.profile },
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
