import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  LayoutGrid,
  FileText,
  Building2,
  Users,
  Shield,
  KeyRound,
  Heart,
  Clock,
  ChevronRight,
  Library,
  Folder,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  reportGroups,
  reportCategories,
  reportSubcategories,
} from "@/utils/exports";
import { checkPermission, hasPermission } from "@/utils/permissions";
import {
  setSelectedGroupId,
  setSelectedCategoryId,
  setSelectedSubcategoryId,
  setSelectedReportId,
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

  const { selectedGroupId, selectedCategoryId, selectedSubcategoryId } =
    useSelector((state: any) => state.report);
  const { userdata } = useSelector((state: any) => state.auth);

  const [expandedCategories, setExpandedCategories] = useState<number[]>([1]);

  const toggleCategory = (catId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(catId)
        ? prev.filter((id) => id !== catId)
        : [...prev, catId],
    );
  };

  const handleGroupClick = () => {
    dispatch(setSelectedGroupId(1));
    dispatch(setSelectedCategoryId(null));
    dispatch(setSelectedSubcategoryId(null));
    dispatch(setSelectedReportId(null));
    navigate("/all-reports");
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleCategoryClick = (catId: number) => {
    dispatch(setSelectedGroupId(1));
    dispatch(setSelectedCategoryId(catId));
    dispatch(setSelectedSubcategoryId(null));
    dispatch(setSelectedReportId(null));
    navigate("/all-reports");
    // also expand the category
    if (!expandedCategories.includes(catId)) {
      setExpandedCategories((prev) => [...prev, catId]);
    }
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleSubcategoryClick = (catId: number, subId: number) => {
    dispatch(setSelectedGroupId(1));
    dispatch(setSelectedCategoryId(catId));
    dispatch(setSelectedSubcategoryId(subId));
    dispatch(setSelectedReportId(null));
    navigate("/all-reports");
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleSimpleNavigation = (path: string) => {
    dispatch(setSelectedGroupId(null));
    dispatch(setSelectedCategoryId(null));
    dispatch(setSelectedSubcategoryId(null));
    dispatch(setSelectedReportId(null));
    navigate(path);
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const allowedCategories = reportCategories.filter((cat) =>
    checkPermission(cat, userdata),
  );
  const canManageUsers = hasPermission(userdata, "users.manage");
  const canManageRoles = hasPermission(userdata, "roles.manage");
  const canManageSecurity = hasPermission(userdata, "security.manage");
  const canManageReports = hasPermission(userdata, "reports.manage");
  const canSeeEnquiries = hasPermission(userdata, "dashboard.enquiries");
  const canSeeGridReports = hasPermission(userdata, "dashboard.grid");

  const isOnReports = location.pathname === "/all-reports";

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
          "bg-white border-r h-full flex flex-col overflow-hidden",
          "transition-[width,transform] duration-300 ease-in-out",
          "fixed md:relative inset-y-0 left-0 z-50 shadow-xl md:shadow-none font-sans",
          isOpen
            ? "w-72 translate-x-0"
            : "w-72 -translate-x-full md:w-0 md:translate-x-0",
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

        {/* Dashboard shortcut */}
        <div className="px-4">
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

        <div className="flex-1 overflow-y-auto px-4 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent pb-4">
          {/* ── Report Library (Main Group) ── */}
          {reportGroups.map((group) => {
            const GroupIcon = group.icon || Library;
            const isGroupActive =
              isOnReports &&
              selectedCategoryId === null &&
              selectedGroupId === group.id;

            return (
              <div key={group.id}>
                <button
                  onClick={handleGroupClick}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200 group mt-1",
                    isGroupActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <GroupIcon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isGroupActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  {group.name}
                </button>

                {/* ── Report Categories ── */}
                <div className="ml-2 space-y-0.5 mt-0.5">
                  {allowedCategories
                    .filter((cat) => cat.groupId === group.id)
                    .map((cat) => {
                      const isCatActive =
                        isOnReports &&
                        selectedCategoryId === cat.id &&
                        selectedSubcategoryId === null;
                      const isExpanded = expandedCategories.includes(cat.id);
                      const subcats = reportSubcategories.filter(
                        (s) => s.categoryId === cat.id,
                      );

                      return (
                        <div key={cat.id}>
                          {/* Category row */}
                          <div className="flex items-center group">
                            <button
                              onClick={() => handleCategoryClick(cat.id)}
                              className={cn(
                                "flex-1 flex items-center gap-2.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200 text-left",
                                isCatActive
                                  ? "bg-secondary text-foreground font-semibold"
                                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                              )}
                            >
                              <Folder
                                className={cn(
                                  "w-3.5 h-3.5 shrink-0",
                                  isCatActive
                                    ? "text-primary"
                                    : "text-muted-foreground",
                                )}
                              />
                              <span className="truncate">{cat.name}</span>
                            </button>
                            {/* Expand/collapse toggle */}
                            {subcats.length > 0 && (
                              <button
                                onClick={() => toggleCategory(cat.id)}
                                className="p-1 rounded hover:bg-muted/60"
                              >
                                <ChevronRight
                                  className={cn(
                                    "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
                                    isExpanded && "rotate-90",
                                  )}
                                />
                              </button>
                            )}
                          </div>

                          {/* ── Subcategories ── */}
                          {isExpanded && subcats.length > 0 && (
                            <div className="ml-5 space-y-0.5 mt-0.5">
                              {subcats.map((sub) => {
                                const isSubActive =
                                  isOnReports &&
                                  selectedCategoryId === cat.id &&
                                  selectedSubcategoryId === sub.id;

                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() =>
                                      handleSubcategoryClick(cat.id, sub.id)
                                    }
                                    className={cn(
                                      "w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200",
                                      isSubActive
                                        ? "bg-primary/10 text-primary font-semibold"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                                    )}
                                  >
                                    <Folder className="w-3 h-3 shrink-0" />
                                    <span className="truncate">{sub.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}

          <Hr />

          {/* Quick links */}
          <div className="space-y-0.5 pt-1">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
              Quick Access
            </p>
            {canSeeEnquiries && (
              <button
                onClick={() => handleSimpleNavigation("/enquiries")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                  location.pathname === "/enquiries"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <FileText
                  className={cn(
                    "w-4 h-4",
                    location.pathname === "/enquiries"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                Enquiries
              </button>
            )}

            {canSeeGridReports && (
              <button
                onClick={() => handleSimpleNavigation("/grid-reports")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                  location.pathname === "/grid-reports"
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                <LayoutGrid
                  className={cn(
                    "w-4 h-4",
                    location.pathname === "/grid-reports"
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                Grid Reports
              </button>
            )}

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
                  "w-4 h-4",
                  location.pathname === "/favourites"
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              My Favourite Reports
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
                  "w-4 h-4",
                  location.pathname === "/recent-reports"
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              Recent Reports
            </button>
          </div>

          <Hr />

          {/* Admin */}
          {(canManageUsers ||
            canManageRoles ||
            canManageSecurity ||
            canManageReports) && (
            <div className="space-y-0.5 pt-1">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2 mb-1">
                Admin
              </p>
              {canManageUsers && (
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
                      "w-4 h-4",
                      location.pathname === "/user-management"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  User Management
                </button>
              )}

              {canManageRoles && (
                <button
                  onClick={() => {
                    navigate("/role-management");
                    if (window.innerWidth < 768 && onClose) onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                    location.pathname === "/role-management"
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <KeyRound
                    className={cn(
                      "w-4 h-4",
                      location.pathname === "/role-management"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  Role Management
                </button>
              )}

              {canManageSecurity && (
                <button
                  onClick={() => {
                    navigate("/security-management");
                    if (window.innerWidth < 768 && onClose) onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                    location.pathname === "/security-management"
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                >
                  <Shield
                    className={cn(
                      "w-4 h-4",
                      location.pathname === "/security-management"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  Security Management
                </button>
              )}

              {canManageReports && (
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
                      "w-4 h-4",
                      location.pathname === "/report-management"
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground",
                    )}
                  />
                  Report Management
                </button>
              )}
            </div>
          )}
        </div>

        {/* User footer */}
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
