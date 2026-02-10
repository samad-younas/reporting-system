import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  FileText,
  Building2,
  Users,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { reportCategories, reports } from "@/utils/exports";
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

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { selectedCategoryId, selectedSubCategory, searchTerm } = useSelector(
    (state: any) => state.report,
  );
  const { userdata } = useSelector((state: any) => state.auth);

  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  // Toggle category expansion
  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // Build the tree structure dynamically based on permissions and search
  const categoryTree = useMemo(() => {
    return reportCategories
      .filter((cat) => checkPermission(cat, userdata))
      .map((cat) => {
        // Find reports in this category that user has access to
        const catReports = reports.filter(
          (r) =>
            r.categoryId === cat.id &&
            checkPermission(r, userdata) &&
            (searchTerm === "" ||
              r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              cat.name.toLowerCase().includes(searchTerm.toLowerCase())),
        );

        if (catReports.length === 0) return null;

        // Get unique sub-categories
        const subCategories = Array.from(
          new Set(catReports.map((r) => r.subCategory || "General Reports")),
        ).sort();

        // Auto-expand if search active
        if (searchTerm && !expandedCategories.includes(cat.id)) {
          // This is a side-effect in useMemo, strictly speaking bad practice
          // but harmless for this simple logic or handle via useEffect elsewhere.
          // Ignoring for now to keep simple.
        }

        return {
          ...cat,
          subCategories,
          hasMatches: catReports.length > 0,
        };
      })
      .filter((c) => c !== null && c.hasMatches);
  }, [userdata, searchTerm]);

  const handleCategoryClick = (id: number) => {
    dispatch(setSelectedCategoryId(id)); // Set Category
    dispatch(setSelectedSubCategory(null)); // Clear specific sub-category
    toggleCategory(id);
    navigate("/dashboard");
    if (window.innerWidth < 768 && onClose) {
      // Don't close immediately allow tree nav
    }
  };

  const handleSubCategoryClick = (
    e: React.MouseEvent,
    catId: number,
    subCat: string,
  ) => {
    e.stopPropagation();
    dispatch(setSelectedCategoryId(catId));
    dispatch(setSelectedSubCategory(subCat));
    navigate("/dashboard");
    if (window.innerWidth < 768 && onClose) onClose();
  };

  const handleHomeClick = () => {
    dispatch(setSelectedCategoryId(null));
    dispatch(setSelectedSubCategory(null));
    dispatch(setSelectedReportId(null));
    navigate("/dashboard");
    if (window.innerWidth < 768 && onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
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
        {/* Company Header */}
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-none tracking-tight">
                Enterprise
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                Reporting
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

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          <div>
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              Reports
            </h3>
            <button
              onClick={handleHomeClick}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group mb-1",
                selectedCategoryId === null
                  ? "bg-secondary text-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
            >
              <LayoutGrid
                className={cn(
                  "w-4 h-4 transition-colors",
                  selectedCategoryId === null
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              />
              All Reports
            </button>
            <div className="space-y-1">
              {categoryTree.map((cat) => {
                if (!cat) return null;
                const isExpanded =
                  expandedCategories.includes(cat.id) ||
                  (selectedCategoryId === cat.id && !selectedSubCategory);
                const isSelectedCtx =
                  selectedCategoryId === cat.id && !selectedSubCategory;

                return (
                  <div key={cat.id} className="space-y-1">
                    <button
                      onClick={() => handleCategoryClick(cat.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                        isSelectedCtx
                          ? "bg-secondary text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {cat.icon ? (
                          <cat.icon
                            className={cn(
                              "w-4 h-4 transition-colors",
                              isSelectedCtx
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                        ) : (
                          <FileText
                            className={cn(
                              "w-4 h-4 transition-colors",
                              isSelectedCtx
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                        )}
                        {cat.name}
                      </span>
                      {cat.subCategories.length > 0 && (
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCategory(cat.id);
                          }}
                          className={cn(
                            "p-0.5 rounded transition-colors",
                            isSelectedCtx
                              ? "bg-background shadow-sm"
                              : "group-hover:bg-background",
                          )}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3 text-current opactiy-70" />
                          ) : (
                            <ChevronRight className="w-3 h-3 text-current opacity-70" />
                          )}
                        </div>
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-4 pl-3 border-l-2 border-border/50 space-y-1 mt-1 mb-2 animate-in slide-in-from-left-1 duration-200">
                        {cat.subCategories.map((sub) => {
                          const isSelectedSub =
                            selectedSubCategory === sub &&
                            selectedCategoryId === cat.id;
                          return (
                            <button
                              key={sub}
                              onClick={(e) =>
                                handleSubCategoryClick(e, cat.id, sub)
                              }
                              className={cn(
                                "w-full flex items-center px-3 py-1.5 text-[13px] rounded-md transition-colors text-left relative",
                                isSelectedSub
                                  ? "text-primary font-semibold bg-primary/5"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                              )}
                            >
                              {isSelectedSub && (
                                <div className="absolute left-0 w-0.5 h-3 bg-primary rounded-r-full" />
                              )}
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

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
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t bg-background">
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
