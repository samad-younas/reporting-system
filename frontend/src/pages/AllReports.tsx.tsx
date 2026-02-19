import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reports, reportCategories, type Report } from "@/utils/exports";
import { checkPermission } from "@/utils/permissions";
import DynamicForm from "@/components/reports/DynamicForm";
import { setSelectedReportId } from "@/store/slices/reportSlice";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileBarChart,
  Layers,
  Plus,
} from "lucide-react";
import { Crystal } from "crystis-react";

const Hr = () => <div className="h-px w-full bg-border my-4" />;

const AllReports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userdata } = useSelector((state: any) => state.auth);
  const { selectedReportId, selectedCategoryId, selectedSubCategory } =
    useSelector((state: any) => state.report);

  const [params, setParams] = useState<Record<string, any>>({});

  const activeReport = useMemo(() => {
    const report = reports.find((r) => r.id === selectedReportId);
    return report && checkPermission(report, userdata) ? report : null;
  }, [selectedReportId, userdata]);

  useEffect(() => {
    setParams({});
  }, [selectedReportId]);

  const handleRunReport = async () => {
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

    try {
      const crystal = new Crystal();
      crystal.tcode = "CF9269";
      crystal.tucode = "20AD";
      crystal.tjsonstring = JSON.stringify(data);

      // Custom report generation implementation to bypass file requirement
      // Use the active report ID to reference the report template that presumably already exists on the server.
      // This avoids uploading a local .rpt file which does not exist in the project.
      const tname = activeReport.id.toString();

      // Upload JSON only (skipping .rpt file upload)
      await crystal.uploadString(
        crystal.tjsonstring,
        crystal.tcode,
        tname,
        "json",
      );

      const query = crystal.buildQueryString(
        tname,
        crystal.tcode,
        crystal.tucode,
      );
      const encrypted = await crystal.encrypt(query);

      if (encrypted.tekst1 === "Ok") {
        const reportUrl = `https://www.pro.siteknower.com/CrystalReportB.aspx?enc=${encrypted.tekst3}`;
        window.open(reportUrl, "_blank");
      } else {
        throw new Error(encrypted.tekst2);
      }
    } catch (error) {
      console.error("Failed to load report", error);
      alert("Failed to load report.");
    }
  };

  // Show all reports grouped by category if no category is selected (All Reports)
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (!checkPermission(r, userdata)) return false;
      // If a specific category is selected, filter by it. Otherwise, show all reports (All Reports)
      if (selectedCategoryId !== null) {
        if (r.categoryId !== selectedCategoryId) return false;
        if (selectedSubCategory) {
          return (
            r.subCategories && r.subCategories.length > 0
              ? r.subCategories
              : ["General Reports"]
          ).includes(selectedSubCategory);
        }
      }
      return true;
    });
  }, [selectedCategoryId, selectedSubCategory, userdata]);

  const reportsByCategory = useMemo(() => {
    const groups: Record<number, Report[]> = {};
    filteredReports.forEach((r) => {
      if (!groups[r.categoryId]) groups[r.categoryId] = [];
      groups[r.categoryId].push(r);
    });
    return groups;
  }, [filteredReports]);

  const handleReportSelect = (id: number) => {
    dispatch(setSelectedReportId(id));
  };

  if (activeReport) {
    const CategoryIcon =
      reportCategories.find((c) => c.id === activeReport.categoryId)?.icon ||
      FileBarChart;

    return (
      <div className="h-full flex flex-col gap-6 overflow-y-auto p-4 sm:p-6 bg-background">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              {/* Could allow dynamic icons per report in future */}
              <CategoryIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                  {activeReport.name}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                {activeReport.description}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => dispatch(setSelectedReportId(null))}
            className="md:self-start"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Overview & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Who is this for */}
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold mb-2">
                Who is this report for?
              </h3>
              <p className="text-muted-foreground">
                {(activeReport.allowedRoles || ["Analysts", "Managers"]).join(
                  ", ",
                )}
              </p>
            </div>

            <Hr />
            {/* Overview / Preview */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Overview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {activeReport.details || activeReport.description}
              </p>
            </div>
            <Hr />
            {/* Included in App */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-card-foreground">
                  Included in the report
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Data
                  Source
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Dashboard
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Exportable
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Drilldown
                </div>
              </CardContent>
            </Card>

            {/* Report Results rendering removed handled by Crystal */}
          </div>

          {/* RIGHT COLUMN: Action & Metadata */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Card / Parameter Form - Enhanced Design */}
            <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
              <div className="relative">
                <CardHeader className="relative pb-4 border-b border-border/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                        Run Report
                      </CardTitle>
                      <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
                        Configure Parameters
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                </CardHeader>
              </div>

              <CardContent className="pt-6 space-y-8">
                <div className="space-y-4">
                  {/* Form Container */}
                  <div className="p-1">
                    <DynamicForm
                      parameters={activeReport.parameters}
                      values={params}
                      onChange={(k, v) =>
                        setParams((prev) => ({ ...prev, [k]: v }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRunReport}
                  className="w-full h-12 text-base rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    Generate Report{" "}
                    <ArrowRight className="h-4 w-4 stroke-[3px]" />
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background relative isolate">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 pb-4">
        <div className="flex items-center gap-5 self-start md:self-auto">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              {selectedCategoryId === null
                ? "All Reports"
                : reportCategories.find((c) => c.id === selectedCategoryId)
                    ?.name || "Reports"}
            </h1>
            <p className="text-base text-muted-foreground font-medium">
              {selectedCategoryId === null
                ? "Browse all available reports by category and subcategory."
                : "Overview & Reports"}
            </p>
          </div>
        </div>

        <div>
          {["admin", "super-admin"].includes(userdata?.user_type) && (
            <Button
              onClick={() =>
                navigate("/report-management", { state: { openCreate: true } })
              }
              className="h-12 px-6 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all hover:shadow-md active:scale-95"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Report
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 sm:px-8 pb-8">
        {Object.keys(reportsByCategory).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(reportsByCategory).map(([catIdStr, reports]) => {
              const catId = parseInt(catIdStr);
              const category = reportCategories.find((c) => c.id === catId);
              const CatIcon = category?.icon || Layers;

              return (
                <div key={catId} className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xl font-bold text-foreground">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CatIcon className="w-5 h-5 text-primary" />
                      </div>
                      {category?.name || "Unknown Category"}
                    </div>
                    <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {reports.map((report) => {
                      const CatIcon = category?.icon || Layers;
                      return (
                        <Card
                          key={report.id}
                          className={`cursor-pointer group relative border border-slate-200 shadow-lg rounded-2xl h-44 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/60 ${report.isNew ? "ring-2 ring-primary/30 ring-offset-2 bg-gradient-to-br from-primary/5 to-white" : "bg-white"}`}
                          onClick={() => handleReportSelect(report.id)}
                        >
                          {/* New badge - professional, subtle */}
                          {report.isNew && (
                            <span className="absolute top-3 right-3 z-20 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20 tracking-wide uppercase shadow-sm">
                              New
                            </span>
                          )}
                          <div className="flex items-center gap-3 p-4 pb-2">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <CatIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-foreground truncate mb-1">
                                {report.name}
                              </h3>
                              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                {report.subCategories
                                  ?.map((s) => s.replace(/^\d+\.\s*/, ""))
                                  .join(", ") || "General"}
                              </span>
                            </div>
                          </div>
                          <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                              {report.description}
                            </p>
                          </div>
                          <div className="absolute inset-0 rounded-2xl border-2 border-primary opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-200" />
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-muted-foreground opacity-60">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Search className="h-10 w-10" />
            </div>
            <p className="text-2xl font-light text-foreground">
              No reports available
            </p>
            <p className="text-base mt-2 max-w-sm text-center">
              There are no reports in this category. Please select a different
              category from the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;
