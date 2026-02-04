import React, { useMemo } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { X, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { navItems, reports } from "@/utils/exports";
import { checkPermission } from "@/utils/permissions";
import { setSelectedReportId, setSelectedCategoryId } from "@/store/slices/reportSlice";

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { selectedCategoryId, selectedReportId } = useSelector((state: any) => state.report);
  const { userdata } = useSelector((state: any) => state.auth);

  const sidebarTitle = useMemo(() => {
    if (selectedCategoryId) return "Reports";
    return "Menu";
  }, [selectedCategoryId]);

  const categoryReports = useMemo(() => {
    if (!selectedCategoryId) return [];
    return reports.filter(
      (r) => r.categoryId === selectedCategoryId && checkPermission(r, userdata)
    );
  }, [selectedCategoryId, userdata]);

  const handleReportClick = (reportId: number) => {
    dispatch(setSelectedReportId(reportId));
    navigate("/dashboard");
    if (onClose) onClose();
  };

  const handleBackToMenu = () => {
    dispatch(setSelectedCategoryId(null));
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
          "bg-card border-r transition-all duration-300 ease-in-out",
          "fixed md:static inset-y-0 left-0 z-50",
          "md:translate-x-0 md:w-64",
          isOpen ? "translate-x-0 w-64" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 md:p-6 border-b flex items-center justify-between">
            <h1 className="font-bold text-lg md:text-xl">{sidebarTitle}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
            {selectedCategoryId ? (
              <>
                <Button
                  variant="ghost"
                  className="w-full justify-start mb-2 pl-2"
                  onClick={handleBackToMenu}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Menu
                </Button>
                {categoryReports.length === 0 && (
                  <div className="p-2 text-muted-foreground text-sm">
                    No reports available.
                  </div>
                )}

                {categoryReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleReportClick(report.id)}
                    className={cn(
                      "flex w-full items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                      "hover:bg-accent hover:text-accent-foreground text-sm",
                      selectedReportId === report.id &&
                        location.pathname === "/dashboard" &&
                        "bg-primary text-primary-foreground font-medium"
                    )}
                  >
                    <FileText className="w-5 h-5 shrink-0" />
                    <span className="line-clamp-2">{report.name}</span>
                  </button>
                ))}
              </>
            ) : (
              navItems.map((item, index) => (
                <NavLink
                  key={`${item.to}-${index}`}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground text-sm",
                      isActive &&
                        "bg-primary text-primary-foreground font-medium"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              ))
            )}
          </nav>
        </div>
      </aside>
    </>
  );
};
