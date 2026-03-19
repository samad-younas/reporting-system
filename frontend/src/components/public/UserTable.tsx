import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontalIcon, UserRoundX } from "lucide-react";
import type { User } from "@/types/user";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string | number) => void;
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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">ID</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Full Name</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Location</TableHead>
                <TableHead className="font-semibold">Access</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UserRoundX className="h-8 w-8" />
                      <p className="font-medium">No users found</p>
                      <p className="text-xs">
                        Try adjusting your filters or create a new user.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.profile?.full_name || "N/A"}</TableCell>
                    <TableCell className="font-medium">
                      {user.user_type || "N/A"}
                    </TableCell>
                    <TableCell>
                      {user.profile
                        ? [
                            user.profile.region,
                            user.profile.country,
                            user.profile.state,
                            user.profile.city,
                          ]
                            .filter(Boolean)
                            .join(" - ") || "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            user.profile?.can_export ? "secondary" : "outline"
                          }
                        >
                          Export: {user.profile?.can_export ? "Yes" : "No"}
                        </Badge>
                        <Badge
                          variant={
                            user.profile?.is_cost_visible
                              ? "secondary"
                              : "outline"
                          }
                        >
                          Cost: {user.profile?.is_cost_visible ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.profile?.is_inactive
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {user.profile?.is_inactive ? "Inactive" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontalIcon />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onToggleStatus(user)}
                          >
                            {user.profile?.is_inactive
                              ? "Activate"
                              : "Deactivate"}
                          </DropdownMenuItem>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default UserTable;
