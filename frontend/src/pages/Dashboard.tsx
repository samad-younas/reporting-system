import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reports } from "@/utils/exports";
import { checkPermission } from "@/utils/permissions";
import DynamicForm from "@/components/reports/DynamicForm";
import ReportViewer from "@/components/reports/ReportViewer";

const Dashboard: React.FC = () => {
  const { userdata } = useSelector((state: any) => state.auth);
  const { selectedReportId } = useSelector((state: any) => state.report);

  const [params, setParams] = useState<Record<string, any>>({});
  const [reportResult, setReportResult] = useState<Record<string, any>[]>([]);

  const activeReport = useMemo(() => {
    const report = reports.find((r) => r.id === selectedReportId);
    return report && checkPermission(report, userdata) ? report : null;
  }, [selectedReportId, userdata]);

  useEffect(() => {
    setParams({});
    setReportResult([]);
  }, [selectedReportId]);

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
    <div className="flex flex-col h-full gap-4">
      {/* Top Header & User Info - Optional, keeping for context if needed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {activeReport ? "Report View" : "Dashboard"}
          </h1>
        </div>
        {userdata && (
          <div className="text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full">
            <span className="font-semibold">{userdata.profile.full_name}</span>{" "}
            ({userdata.email} {"->"} {userdata.user_type})
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {!activeReport ? (
          <div className="h-full flex flex-col items-center justify-center border rounded-lg border-dashed bg-muted/20 text-center p-4">
            <h3 className="text-lg font-semibold">Welcome to the Dashboard</h3>
            <p className="text-muted-foreground mt-2">
              Select a category from the top menu, then choose a report from the
              sidebar.
            </p>
          </div>
        ) : (
          <Card className="h-full flex flex-col border-none shadow-none bg-transparent sm:bg-card sm:border sm:shadow-sm">
            <CardHeader className="px-0 sm:px-6 shrink-0">
              <CardTitle>{activeReport.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {activeReport.description}
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-0 sm:px-6 space-y-6 overflow-auto">
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
        )}
      </div>
    </div>
  );
};

export default Dashboard;
