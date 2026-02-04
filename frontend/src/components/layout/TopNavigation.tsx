import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { reportCategories } from "@/utils/exports";
import { checkPermission } from "@/utils/permissions";
import { setSelectedCategoryId } from "@/store/slices/reportSlice";
import { TrendingUp, BarChart3, PieChart, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/utils";

const getCategoryStyle = (id: number) => {
  switch (id) {
    case 1:
      return { color: "bg-orange-500 hover:bg-orange-600", icon: TrendingUp };
    case 2:
      return { color: "bg-blue-500 hover:bg-blue-600", icon: BarChart3 };
    case 3:
      return { color: "bg-green-500 hover:bg-green-600", icon: PieChart };
    case 4:
      return {
        color: "bg-purple-500 hover:bg-purple-600",
        icon: FileSpreadsheet,
      };
    default:
      return { color: "bg-primary hover:bg-primary/90", icon: FileSpreadsheet };
  }
};

export const TopNavigation: React.FC = () => {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state: any) => state.auth);
  const { selectedCategoryId } = useSelector((state: any) => state.report);

  const allowedCategories = useMemo(() => {
    return reportCategories.filter((c) => checkPermission(c, userdata));
  }, [userdata]);

  const handleCategoryClick = (id: number) => {
    // If clicking same category, maybe deselect?
    // The user requirement says "clicking that top boxes... show specific items".
    // I'll toggle it.
    if (selectedCategoryId === id) {
      dispatch(setSelectedCategoryId(null));
    } else {
      dispatch(setSelectedCategoryId(id));
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0 p-4 border-b bg-background">
      {allowedCategories.map((category) => {
        const style = getCategoryStyle(category.id);
        const Icon = style.icon;
        const isSelected = selectedCategoryId === category.id;

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "relative flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 shadow-sm border",
              isSelected
                ? `${style.color} text-white ring-2 ring-offset-2 ring-offset-background ring-primary`
                : "bg-card hover:bg-accent hover:text-accent-foreground border-border",
            )}
          >
            <Icon
              className={cn(
                "w-5 h-5 mb-1",
                isSelected ? "text-white" : "text-primary",
              )}
            />
            <span className="font-medium text-xs text-center">
              {category.name}
            </span>
            {isSelected && (
              <div className="absolute -bottom-2 w-3 h-3 bg-inherit rotate-45 transform translate-y-1/2 border-r border-b border-inherit" />
            )}
          </button>
        );
      })}
    </div>
  );
};
