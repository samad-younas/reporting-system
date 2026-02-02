import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  reportCategories,
  reports,
  type Report,
  type ReportCategory,
} from "@/utils/exports";
import ReportList from "@/components/reports/ReportList";
import DynamicForm from "@/components/reports/DynamicForm";
import ReportViewer from "@/components/reports/ReportViewer";
import { FileSpreadsheet, BarChart3, PieChart, TrendingUp } from "lucide-react";

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

const Dashboard: React.FC = () => {
  const user = useSelector((state: any) => state.auth.userdata);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [params, setParams] = useState<Record<string, any>>({});
  const [reportResult, setReportResult] = useState<Record<string, any>[]>([]);

  const checkPermission = (item: Report | ReportCategory) => {
    if (!user) return true;

    if (item.allowedRoles && item.allowedRoles.length > 0) {
      if (!item.allowedRoles.includes(user.role)) return false;
    }
    if (item.allowedLocations && item.allowedLocations.length > 0) {
      if (!item.allowedLocations.includes(user.location)) return false;
    }
    return true;
  };

  const allowedCategories = useMemo(() => {
    return reportCategories.filter(checkPermission);
  }, [user]);

  const allowedReports = useMemo(() => {
    return reports.filter((r) => checkPermission(r));
  }, [user]);

  const currentCategoryReports = useMemo(() => {
    if (!selectedCategoryId) return [];
    return allowedReports.filter((r) => r.categoryId === selectedCategoryId);
  }, [selectedCategoryId, allowedReports]);

  const activeReport = useMemo(() => {
    return allowedReports.find((r) => r.id === selectedReportId) || null;
  }, [selectedReportId, allowedReports]);

  const handleCategoryClick = (id: number) => {
    setSelectedCategoryId(id);
    setSelectedReportId(null);
    setParams({});
    setReportResult([]);
  };

  const handleReportSelect = (id: number) => {
    setSelectedReportId(id);
    setParams({});
    setReportResult([]);
  };

  const handleRunReport = () => {
    if (!activeReport) return;

    let data = [...activeReport.result];

    Object.entries(params).forEach(([key, value]) => {
      if (!value) return;
      data = data.filter((row) => {
        if (!(key in row)) return true;
        const rowValue = row[key];
        if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) {
          return String(rowValue) === String(value);
        }
        return String(rowValue).toLowerCase() === String(value).toLowerCase();
      });
    });

    setReportResult(data);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] gap-4 p-4 md:p-6 overflow-hidden">
      {/* Top Header & User Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a category to view available reports.
          </p>
        </div>
        {user && (
          <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            <span className="font-semibold">{user.name}</span> ({user.role} -{" "}
            {user.location})
          </div>
        )}
      </div>

      {/* Categories Menu - Top Bar Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
        {allowedCategories.map((category) => {
          const style = getCategoryStyle(category.id);
          const Icon = style.icon;
          const isSelected = selectedCategoryId === category.id;

          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`
                            relative flex flex-col items-center justify-center p-4 rounded-lg 
                            transition-all duration-200 shadow-sm border
                            ${
                              isSelected
                                ? `${style.color} text-white ring-2 ring-offset-2 ring-offset-background ring-primary`
                                : "bg-card hover:bg-accent hover:text-accent-foreground border-border"
                            }
                        `}
            >
              <Icon
                className={`w-6 h-6 mb-2 ${isSelected ? "text-white" : "text-primary"}`}
              />
              <span className="font-medium text-sm text-center">
                {category.name}
              </span>
              {isSelected && (
                <div className="absolute -bottom-2 w-4 h-4 bg-inherit rotate-45 transform translate-y-1/2 border-r border-b border-inherit" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 min-h-0">
        {!selectedCategoryId ? (
          <div className="flex-1 flex items-center justify-center border rounded-lg border-dashed bg-muted/20">
            <p className="text-muted-foreground">
              Select a report category from above to get started.
            </p>
          </div>
        ) : (
          <>
            {/* Left: Report List */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex flex-col gap-4">
              <ReportList
                reports={currentCategoryReports}
                activeId={selectedReportId}
                onSelect={handleReportSelect}
              />
            </div>

            {/* Right: Report Viewer/Form */}
            <div className="flex-1 overflow-auto">
              {activeReport ? (
                <Card className="h-full flex flex-col border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
                  <CardHeader className="px-0 sm:px-6">
                    <CardTitle>{activeReport.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {activeReport.description}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 px-0 sm:px-6 space-y-6">
                    <div className="max-w-xl">
                      <DynamicForm
                        parameters={activeReport.parameters}
                        values={params}
                        onChange={(k, v) =>
                          setParams((prev) => ({ ...prev, [k]: v }))
                        }
                      />
                      <div className="mt-4">
                        <Button
                          onClick={handleRunReport}
                          className="w-full sm:w-auto"
                        >
                          Generate Report
                        </Button>
                      </div>
                    </div>

                    {/* Results */}
                    <div className="border-t pt-6">
                      {reportResult.length > 0 ? (
                        <ReportViewer data={reportResult} />
                      ) : (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          {Object.keys(params).length > 0
                            ? "No records found matching your criteria."
                            : "Set parameters and click Generate to view data."}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex items-center justify-center border rounded-lg border-dashed bg-muted/20 text-muted-foreground">
                  Select a report from the list to view details.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
