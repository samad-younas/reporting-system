import React from "react";
import { Menu, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logOut } from "@/store/slices/authSlice";
import { setSearchTerm } from "@/store/slices/reportSlice";
import { useSubmit } from "@/hooks/useSubmit";
import { toast } from "react-toastify";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { searchTerm } = useSelector((state: any) => state.report);
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
    <header className="border-b px-3 md:px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-sm bg-card/95 gap-4">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="shrink-0 cursor-pointer md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reports..."
            className="pl-9 h-9 bg-background/50 focus:bg-background transition-all w-full"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
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
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
