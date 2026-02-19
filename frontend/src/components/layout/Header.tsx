import React from "react";
import { Menu, Search, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const { userdata } = useSelector((state: any) => state.auth);

  const { mutateAsync } = useSubmit({
    method: "POST",
    endpoint: "api/logout",
    isAuth: true,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await mutateAsync({});
      dispatch(logOut());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  return (
    <header className="w-full border-b bg-white px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="pl-10 h-10 bg-gray-50 border border-gray-200 focus:bg-white focus:border-gray-300 rounded-lg transition-all"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-all">
              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>

              <div className="hidden sm:flex flex-col items-start text-sm leading-tight">
                <span className="font-medium text-gray-800">
                  {userdata?.profile?.full_name || "Stephen R"}
                </span>
                <span className="text-gray-500 text-xs">
                  {userdata?.user_type || "Regional Manager"}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              View Profile
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
