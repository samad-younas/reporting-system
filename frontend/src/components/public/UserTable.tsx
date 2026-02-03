import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontalIcon } from "lucide-react";

export interface User {
  id: string;
  email: string;
  password?: string;
  user_type: string;
  role_id: number;
  profile: {
    full_name: string;
    region: string;
    country: string;
    state: string;
    city: string;
    can_export: boolean;
    can_copy: boolean;
    is_cost_visible: boolean;
    is_inactive: boolean;
  };
}

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (user: User) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Users List</CardTitle>
        <CardDescription>
          Manage system users and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold text-lg">Email</TableHead>
              <TableHead className="font-bold text-lg">Full Name</TableHead>
              <TableHead className="font-bold text-lg">Role ID</TableHead>
              <TableHead className="font-bold text-lg">Location</TableHead>
              <TableHead className="font-bold text-lg">Exports</TableHead>
              <TableHead className="font-bold text-lg">Status</TableHead>
              <TableHead className="text-right font-bold text-lg">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.profile.full_name}</TableCell>
                  <TableCell>{user.role_id}</TableCell>
                  <TableCell>
                    {user.profile.region} - {user.profile.country} -
                    {user.profile.state} - {user.profile.city}
                  </TableCell>
                  <TableCell>
                    {user.profile.can_export ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${user.profile.is_inactive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                    >
                      {user.profile.is_inactive ? "Inactive" : "Active"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleStatus(user)}>
                          {user.profile.is_inactive ? "Activate" : "Deactivate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete(user.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default UserTable;
