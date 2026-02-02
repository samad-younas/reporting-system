import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { logOut } from "@/store/slices/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { useSubmit } from "@/hooks/useSubmit";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { isPending, mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/logout",
    isAuth: true,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await mutateAsync({});
    dispatch(logOut());
    toast.success(result.message || "Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="border-b px-3 md:px-4 lg:px-6 py-5 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-card/95">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="shrink-0 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer shrink-0"
          >
            <User className="w-5 h-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate("/profile")}>
            View Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? "Logging out..." : "Log Out"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
