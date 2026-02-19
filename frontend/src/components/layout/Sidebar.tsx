import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  LayoutGrid,
  FileText,
  Building2,
  Users,
  ScrollText,
  Heart,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { reportCategories } from "@/utils/exports";
import { checkPermission } from "@/utils/permissions";
import {
  setSelectedCategoryId,
  setSelectedReportId,
  setSelectedSubCategory,
} from "@/store/slices/reportSlice";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

const Hr = () => <div className="h-px w-full bg-border" />;

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { selectedCategoryId, searchTerm } = useSelector(
    (state: any) => state.report,
  );
  const { userdata } = useSelector((state: any) => state.auth);

  const categoryList = React.useMemo(() => {
    return reportCategories
      .filter((cat: any) => checkPermission(cat, userdata))
      .filter(
        (cat: any) =>
          searchTerm === "" ||
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [userdata, searchTerm]);

  const handleCategoryClick = (id: number) => {
    dispatch(setSelectedCategoryId(id));
    dispatch(setSelectedSubCategory(null));
    navigate("/all-reports");
  };

  const handleHomeClick = () => {
    dispatch(setSelectedCategoryId(null));
    dispatch(setSelectedSubCategory(null));
    dispatch(setSelectedReportId(null));
    navigate("/all-reports");
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleSimpleNavigation = (path: string) => {
    dispatch(setSelectedCategoryId(null));
    dispatch(setSelectedSubCategory(null));
    dispatch(setSelectedReportId(null));
    navigate(path);
    if (window.innerWidth < 768 && onClose) onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "bg-white border-r h-full flex flex-col transition-all duration-300",
          "fixed md:static inset-y-0 left-0 z-50 w-72 shadow-xl md:shadow-none font-sans",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none tracking-tight">
                Company Logo
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                slogan of company logo
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden -mr-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="h-px bg-border/60 mb-2 mt-4" />

        {/* Dashboard */}
        <div className="px-4 pb-2">
          <button
            onClick={() => handleSimpleNavigation("/dashboard")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group mb-1",
              location.pathname === "/dashboard"
                ? "bg-secondary text-foreground font-semibold"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <LayoutGrid
              className={cn(
                "w-4 h-4 transition-colors",
                location.pathname === "/dashboard"
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground",
              )}
            />
            Dashboard
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div>
            {/* All Reports */}
            <button
              onClick={handleHomeClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group mb-1",
                location.pathname === "/all-reports" &&
                  selectedCategoryId === null
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <LayoutGrid
                className={cn(
                  "w-4 h-4 transition-colors",
                  location.pathname === "/all-reports" &&
                    selectedCategoryId === null
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              All Reports
            </button>

            <Hr />

            {/* Categories */}
            <div className="space-y-1">
              {categoryList.map((cat: any) => {
                const isSelected =
                  location.pathname === "/all-reports" &&
                  selectedCategoryId === cat.id;

                const CatIcon = cat.icon || FileText;

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                      isSelected
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <CatIcon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isSelected
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    {cat.name}
                  </button>
                );
              })}
            </div>
            {/* ✅ NEW NAV ITEMS */}
            <div className="space-y-1 mt-2">
              <button
                onClick={() => handleSimpleNavigation("/favourites")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                  location.pathname === "/favourites"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    location.pathname === "/favourites"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                Favourites
              </button>

              <button
                onClick={() => handleSimpleNavigation("/recent-reports")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                  location.pathname === "/recent-reports"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <Clock
                  className={cn(
                    "w-4 h-4 transition-colors",
                    location.pathname === "/recent-reports"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                Recent Reports
              </button>
            </div>
            <Hr />
            <div>
              <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider my-2 px-2">
                System
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    navigate("/ssrs-reports");
                    if (window.innerWidth < 768 && onClose) onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                    location.pathname === "/ssrs-reports"
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <ScrollText
                    className={cn(
                      "w-4 h-4 transition-colors",
                      location.pathname === "/ssrs-reports"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  SSRS Reports
                </button>
              </div>
            </div>

            {/* Admin Section */}
            {["admin", "super-admin"].includes(userdata?.user_type) && (
              <div>
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider my-2 px-2 mt-4">
                  Admin
                </h3>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      navigate("/user-management");
                      if (window.innerWidth < 768 && onClose) onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                      location.pathname === "/user-management"
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <Users
                      className={cn(
                        "w-4 h-4 transition-colors",
                        location.pathname === "/user-management"
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    User Management
                  </button>
                  <button
                    onClick={() => {
                      navigate("/report-management");
                      if (window.innerWidth < 768 && onClose) onClose();
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                      location.pathname === "/report-management"
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                    )}
                  >
                    <FileText
                      className={cn(
                        "w-4 h-4 transition-colors",
                        location.pathname === "/report-management"
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    Report Management
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-2 border-t bg-card">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-secondary/30 border border-border/50">
            <div className="h-8 w-8 rounded-full bg-linear-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold">
              {userdata?.profile?.full_name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {userdata?.profile?.full_name || "User"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {userdata?.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
