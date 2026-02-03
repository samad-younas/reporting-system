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
import { useDispatch } from "react-redux";
import { logOut } from "@/store/slices/authSlice";
import { useSubmit } from "@/hooks/useSubmit";
import { toast } from "react-toastify";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/logout",
    isAuth: true,
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await mutateAsync({});
    dispatch(logOut());
    toast.success("Logged out successfully");
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
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
