import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  reports,
  reportCategories,
  reportSubcategories,
  reportGroups,
  type Report,
} from "@/utils/exports";
import { checkPermission, hasPermission } from "@/utils/permissions";
import DynamicForm from "@/components/reports/DynamicForm";
import {
  setSelectedReportId,
  setViewMode,
  setSortBy,
  type ViewMode,
  type SortBy,
} from "@/store/slices/reportSlice";
import {
  Search,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  FileBarChart,
  Layers,
  Plus,
  LayoutGrid,
  List,
  AlignJustify,
  ChevronRight,
  Tag,
  SortAsc,
  X,
  Loader2,
  Monitor,
  Server,
  Globe,
  RefreshCw,
  Heart,
  ExternalLink,
} from "lucide-react";
import { Crystal } from "crystis-react";
import { cn } from "@/lib/utils";
import {
  addRecentReport,
  getFavouriteReportIds,
  toggleFavouriteReport,
} from "@/utils/favourites";

const Hr = () => <div className="h-px w-full bg-border my-4" />;

// --- View mode toggle ---
interface ViewToggleProps {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}
const ViewToggle: React.FC<ViewToggleProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/30">
    {(
      [
        { mode: "cards" as ViewMode, icon: LayoutGrid, label: "Cards" },
        { mode: "list" as ViewMode, icon: List, label: "List" },
        { mode: "details" as ViewMode, icon: AlignJustify, label: "Details" },
      ] as const
    ).map(({ mode, icon: Icon, label }) => (
      <button
        key={mode}
        title={label}
        onClick={() => onChange(mode)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
          value === mode
            ? "bg-background shadow-sm text-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{label}</span>
      </button>
    ))}
  </div>
);

// --- Sort select ---
interface SortSelectProps {
  value: SortBy;
  onChange: (s: SortBy) => void;
}
const SortSelect: React.FC<SortSelectProps> = ({ value, onChange }) => (
  <div className="flex items-center gap-1.5">
    <SortAsc className="h-4 w-4 text-muted-foreground shrink-0" />
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortBy)}
      className="text-xs border rounded-lg px-2 py-1.5 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
    >
      <option value="prefix">Sort: Report Prefix</option>
      <option value="name">Sort: Name</option>
      <option value="category">Sort: Category</option>
      <option value="subcategory">Sort: Subcategory</option>
    </select>
  </div>
);

// --- Report card (cards view) ---
const ReportCard: React.FC<{
  report: Report;
  onSelect: (id: number) => void;
}> = ({ report, onSelect }) => {
  const subcat = reportSubcategories.find((s) => s.id === report.subcategoryId);
  const cat = reportCategories.find((c) => c.id === report.categoryId);
  const Icon = cat?.icon || FileBarChart;
  return (
    <Card
      onClick={() => onSelect(report.id)}
      className={cn(
        "cursor-pointer group relative border border-slate-200 shadow-sm rounded-2xl h-44 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/60",
        report.isNew
          ? "ring-2 ring-primary/30 ring-offset-1 bg-linear-to-br from-primary/5 to-white"
          : "bg-white",
      )}
    >
      {report.isNew && (
        <span className="absolute top-3 right-3 z-20 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full border border-primary/20 tracking-wide uppercase shadow-sm">
          New
        </span>
      )}
      <div className="flex items-start gap-3 p-4 pb-2">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {report.prefix && (
              <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
                {report.prefix}
              </span>
            )}
          </div>
          <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-2">
            {report.name}
          </h3>
          <span className="text-[10px] font-medium text-muted-foreground">
            {subcat?.name || "General"}
          </span>
        </div>
      </div>
      <div className="px-4 pb-4">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {report.description}
        </p>
      </div>
      <div className="absolute inset-0 rounded-2xl border-2 border-primary opacity-0 group-hover:opacity-20 pointer-events-none transition-opacity duration-200" />
    </Card>
  );
};

// --- Report list row ---
const ReportListRow: React.FC<{
  report: Report;
  onSelect: (id: number) => void;
}> = ({ report, onSelect }) => {
  const subcat = reportSubcategories.find((s) => s.id === report.subcategoryId);
  const cat = reportCategories.find((c) => c.id === report.categoryId);
  const Icon = cat?.icon || FileBarChart;
  return (
    <button
      onClick={() => onSelect(report.id)}
      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-muted/50 transition-colors group text-left border border-transparent hover:border-border"
    >
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex items-center gap-2 w-16 shrink-0">
        {report.prefix && (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            {report.prefix}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
          {report.name}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {report.description}
        </p>
      </div>
      <div className="hidden md:flex items-center gap-2">
        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {subcat?.name || "General"}
        </span>
        {report.isNew && (
          <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            New
          </span>
        )}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
};

// --- Report details row ---
const ReportDetailsRow: React.FC<{
  report: Report;
  onSelect: (id: number) => void;
}> = ({ report, onSelect }) => {
  const subcat = reportSubcategories.find((s) => s.id === report.subcategoryId);
  const cat = reportCategories.find((c) => c.id === report.categoryId);
  const Icon = cat?.icon || FileBarChart;
  return (
    <tr
      onClick={() => onSelect(report.id)}
      className="cursor-pointer hover:bg-muted/40 transition-colors group border-b border-border/50 last:border-0"
    >
      <td className="py-2.5 pl-4 pr-3 w-8">
        <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
      </td>
      <td className="py-2.5 pr-4 w-16">
        {report.prefix && (
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            {report.prefix}
          </span>
        )}
      </td>
      <td className="py-2.5 pr-4">
        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {report.name}
          {report.isNew && (
            <span className="ml-2 text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full align-middle">
              New
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">{report.description}</p>
      </td>
      <td className="py-2.5 pr-4 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">{cat?.name}</span>
      </td>
      <td className="py-2.5 pr-4 hidden lg:table-cell">
        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">
          {subcat?.name}
        </span>
      </td>
      <td className="py-2.5 pr-4 hidden xl:table-cell">
        <div className="flex gap-1 flex-wrap">
          {report.tags?.slice(0, 3).map((t) => (
            <span
              key={t}
              className="text-[10px] border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </td>
      <td className="py-2.5 pr-4">
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </td>
    </tr>
  );
};

// --- Main component ---
const AllReports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userdata } = useSelector((state: any) => state.auth);
  const {
    selectedReportId,
    selectedCategoryId,
    selectedSubcategoryId,
    viewMode,
    sortBy,
  } = useSelector((state: any) => state.report);

  const [params, setParams] = useState<Record<string, any>>({});
  const [localSearch, setLocalSearch] = useState("");
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<number[]>([]);

  useEffect(() => {
    setFavouriteIds(getFavouriteReportIds());
  }, []);

  const activeReport = useMemo(() => {
    const report = reports.find((r) => r.id === selectedReportId);
    return report && checkPermission(report, userdata) ? report : null;
  }, [selectedReportId, userdata]);

  useEffect(() => {
    setParams({});
    setReportUrl(null);
    setIsRunning(false);
  }, [selectedReportId]);

  const handleRunReport = async () => {
    if (!activeReport) return;
    setIsRunning(true);
    setReportUrl(null);
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
      const tname = activeReport.id.toString();
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
        const generatedUrl = `https://www.pro.siteknower.com/CrystalReportB.aspx?enc=${encrypted.tekst3}`;
        setReportUrl(generatedUrl);

        if ((activeReport.outputMode || "new_tab") === "new_tab") {
          const opened = window.open(
            generatedUrl,
            "_blank",
            "noopener,noreferrer",
          );
          if (!opened) {
            alert(
              "Popup was blocked. The report will be shown below in this page.",
            );
          }
        }
      } else {
        throw new Error(encrypted.tekst2);
      }
    } catch (error) {
      console.error("Failed to load report", error);
      alert("Failed to load report.");
    } finally {
      setIsRunning(false);
    }
  };

  const filteredReports = useMemo(() => {
    const q = localSearch.toLowerCase();
    let list = reports.filter((r) => {
      if (!checkPermission(r, userdata)) return false;
      if (selectedCategoryId !== null && r.categoryId !== selectedCategoryId)
        return false;
      if (
        selectedSubcategoryId !== null &&
        r.subcategoryId !== selectedSubcategoryId
      )
        return false;
      if (q) {
        const subcat = reportSubcategories.find(
          (s) => s.id === r.subcategoryId,
        );
        const cat = reportCategories.find((c) => c.id === r.categoryId);
        return (
          r.name.toLowerCase().includes(q) ||
          (r.prefix || "").toLowerCase().includes(q) ||
          (cat?.name || "").toLowerCase().includes(q) ||
          (subcat?.name || "").toLowerCase().includes(q) ||
          (r.tags || []).some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "prefix")
        return (a.prefix || "").localeCompare(b.prefix || "", undefined, {
          numeric: true,
        });
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "category") {
        const ca =
          reportCategories.find((c) => c.id === a.categoryId)?.name || "";
        const cb =
          reportCategories.find((c) => c.id === b.categoryId)?.name || "";
        return ca.localeCompare(cb);
      }
      if (sortBy === "subcategory") {
        const sa =
          reportSubcategories.find((s) => s.id === a.subcategoryId)?.name || "";
        const sb =
          reportSubcategories.find((s) => s.id === b.subcategoryId)?.name || "";
        return sa.localeCompare(sb);
      }
      return 0;
    });
    return list;
  }, [
    selectedCategoryId,
    selectedSubcategoryId,
    userdata,
    localSearch,
    sortBy,
  ]);

  const grouped = useMemo(() => {
    const result: Record<number, Record<number, Report[]>> = {};
    filteredReports.forEach((r) => {
      if (!result[r.categoryId]) result[r.categoryId] = {};
      if (!result[r.categoryId][r.subcategoryId])
        result[r.categoryId][r.subcategoryId] = [];
      result[r.categoryId][r.subcategoryId].push(r);
    });
    return result;
  }, [filteredReports]);

  const handleReportSelect = (id: number) => dispatch(setSelectedReportId(id));

  const handleToggleFavourite = (id: number) => {
    const updated = toggleFavouriteReport(id);
    setFavouriteIds(updated);
  };

  const handleSelectReport = (id: number) => {
    addRecentReport(id);
    handleReportSelect(id);
  };

  const breadcrumb = useMemo(() => {
    const group = reportGroups[0];
    const cat = reportCategories.find((c) => c.id === selectedCategoryId);
    const sub = reportSubcategories.find((s) => s.id === selectedSubcategoryId);
    const parts: string[] = [group.name];
    if (cat) parts.push(cat.name);
    if (sub) parts.push(sub.name);
    return parts;
  }, [selectedCategoryId, selectedSubcategoryId]);

  // --- Report detail view ---
  if (activeReport) {
    const cat = reportCategories.find((c) => c.id === activeReport.categoryId);
    const sub = reportSubcategories.find(
      (s) => s.id === activeReport.subcategoryId,
    );
    const CategoryIcon = cat?.icon || FileBarChart;

    return (
      <div className="h-full flex flex-col gap-6 overflow-y-auto p-4 sm:p-6 bg-background">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {[reportGroups[0]?.name, cat?.name, sub?.name, activeReport.name]
            .filter(Boolean)
            .map((part, i, arr) => (
              <React.Fragment key={i}>
                <span
                  className={
                    i === arr.length - 1 ? "text-foreground font-medium" : ""
                  }
                >
                  {part}
                </span>
                {i < arr.length - 1 && <ChevronRight className="h-3 w-3" />}
              </React.Fragment>
            ))}
        </div>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b pb-6">
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <CategoryIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {activeReport.prefix && (
                  <span className="text-sm font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                    {activeReport.prefix}
                  </span>
                )}
                <h1 className="text-2xl font-bold tracking-tight text-primary">
                  {activeReport.name}
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                {activeReport.description}
              </p>
              {activeReport.tags && activeReport.tags.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {activeReport.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 md:self-start">
            <Button
              variant={
                favouriteIds.includes(activeReport.id) ? "default" : "outline"
              }
              onClick={() => handleToggleFavourite(activeReport.id)}
            >
              <Heart
                className={cn(
                  "mr-2 h-4 w-4",
                  favouriteIds.includes(activeReport.id) && "fill-current",
                )}
              />
              {favouriteIds.includes(activeReport.id)
                ? "Favourited"
                : "Add to Favourites"}
            </Button>
            {reportUrl && (
              <Button asChild variant="outline">
                <a href={reportUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" /> Open Full Page
                </a>
              </Button>
            )}
            <Button
              variant="ghost"
              onClick={() => dispatch(setSelectedReportId(null))}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </div>
        </div>

        {/* ── Architecture proof-of-concept banner ── */}
        <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
          <Monitor className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-medium text-primary">Browser</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-medium text-primary">App Server</span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <Server className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-medium text-primary">
            Crystal Reports Server
          </span>
          <ArrowRight className="h-3 w-3 shrink-0" />
          <Monitor className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-medium text-primary">Rendered in Browser</span>
          <span className="ml-auto text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
            No client install required
          </span>
        </div>

        <div
          className={cn(
            "grid grid-cols-1 gap-8",
            reportUrl ? "lg:grid-cols-3" : "lg:grid-cols-3",
          )}
        >
          {reportUrl ? (
            /* ── Embedded report viewer ── */
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  Report Output
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[11px] bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                  <CheckCircle2 className="h-3 w-3" /> Rendered server-side ·
                  displayed in browser
                </span>
              </div>
              <div
                className="relative rounded-xl overflow-hidden border border-border/60 shadow-sm bg-muted/20"
                style={{ height: "640px" }}
              >
                <iframe
                  src={reportUrl}
                  title={activeReport.name}
                  className="w-full h-full"
                  style={{ border: "none" }}
                  allow="fullscreen"
                />
              </div>
            </div>
          ) : (
            /* ── Overview (shown before generating) ── */
            <div className="lg:col-span-2 space-y-8">
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
              <div>
                <h3 className="text-lg font-semibold mb-4">Overview</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {activeReport.details || activeReport.description}
                </p>
              </div>
              <Hr />
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
                    <CheckCircle2 className="h-4 w-4 text-green-500" />{" "}
                    Dashboard
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />{" "}
                    Exportable
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />{" "}
                    Drilldown
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Params / Run card (always on the right) ── */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="relative pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                      {reportUrl ? "Re-run Report" : "Run Report"}
                    </CardTitle>
                    <p className="text-xs font-semibold text-muted-foreground mt-1 uppercase tracking-wider">
                      Configure Parameters
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                    {reportUrl ? (
                      <RefreshCw className="h-5 w-5" />
                    ) : (
                      <Layers className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-8">
                <div className="p-1">
                  <DynamicForm
                    parameters={activeReport.parameters}
                    values={params}
                    onChange={(k, v) =>
                      setParams((prev) => ({ ...prev, [k]: v }))
                    }
                  />
                </div>
                <Button
                  onClick={handleRunReport}
                  disabled={isRunning}
                  className="w-full h-12 text-base rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 bg-primary hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70"
                >
                  {isRunning ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {reportUrl ? "Re-generate Report" : "Generate Report"}{" "}
                      <ArrowRight className="h-4 w-4 stroke-[3px]" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- Report listing view ---
  return (
    <div className="flex flex-col h-full bg-background relative isolate">
      <div className="flex flex-col gap-4 p-5 sm:p-6 pb-3 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {breadcrumb.map((part, i) => (
                <React.Fragment key={i}>
                  <span>{part}</span>
                  {i < breadcrumb.length - 1 && (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              {breadcrumb[breadcrumb.length - 1]}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {filteredReports.length} report
              {filteredReports.length !== 1 ? "s" : ""} available
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {hasPermission(userdata, "reports.manage") && (
              <Button
                onClick={() =>
                  navigate("/report-management", {
                    state: { openCreate: true },
                  })
                }
                size="sm"
                className="h-9 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Report
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, prefix, category, subcategory or tag..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-sm"
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SortSelect
              value={sortBy}
              onChange={(s) => dispatch(setSortBy(s))}
            />
            <ViewToggle
              value={viewMode}
              onChange={(v) => dispatch(setViewMode(v))}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 sm:px-6 pb-8 pt-4">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 text-muted-foreground opacity-60">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-5">
              <Search className="h-9 w-9" />
            </div>
            <p className="text-xl font-light text-foreground">
              No reports found
            </p>
            <p className="text-sm mt-2 max-w-sm text-center">
              Try a different search term or select a different category from
              the sidebar.
            </p>
          </div>
        ) : selectedSubcategoryId !== null ? (
          <div className="space-y-1">
            {viewMode === "cards" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {filteredReports.map((r) => (
                  <ReportCard
                    key={r.id}
                    report={r}
                    onSelect={handleSelectReport}
                  />
                ))}
              </div>
            )}
            {viewMode === "list" && (
              <div className="space-y-0.5">
                {filteredReports.map((r) => (
                  <ReportListRow
                    key={r.id}
                    report={r}
                    onSelect={handleSelectReport}
                  />
                ))}
              </div>
            )}
            {viewMode === "details" && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="w-8 pl-4" />
                      <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground w-16">
                        Prefix
                      </th>
                      <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground">
                        Name
                      </th>
                      <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                        Category
                      </th>
                      <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                        Subcategory
                      </th>
                      <th className="py-2.5 pr-4 text-left text-xs font-semibold text-muted-foreground hidden xl:table-cell">
                        Tags
                      </th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((r) => (
                      <ReportDetailsRow
                        key={r.id}
                        report={r}
                        onSelect={handleSelectReport}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([catIdStr, subcatGroups]) => {
              const catId = parseInt(catIdStr);
              const cat = reportCategories.find((c) => c.id === catId);
              const CatIcon = cat?.icon || Layers;

              return (
                <div key={catId} className="space-y-6">
                  {selectedCategoryId === null && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-lg font-bold text-foreground">
                        <div className="p-1.5 bg-primary/10 rounded-lg">
                          <CatIcon className="w-4 h-4 text-primary" />
                        </div>
                        {cat?.name}
                      </div>
                      <div className="h-px flex-1 bg-linear-to-r from-border to-transparent" />
                    </div>
                  )}

                  {Object.entries(subcatGroups).map(
                    ([subIdStr, subcatReports]) => {
                      const subId = parseInt(subIdStr);
                      const sub = reportSubcategories.find(
                        (s) => s.id === subId,
                      );
                      const SubIcon = sub?.icon || FileBarChart;

                      return (
                        <div key={subId} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <SubIcon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-sm font-semibold text-foreground">
                              {sub?.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({subcatReports.length})
                            </span>
                            <div className="h-px flex-1 bg-border/60" />
                          </div>

                          {viewMode === "cards" && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                              {subcatReports.map((r) => (
                                <ReportCard
                                  key={r.id}
                                  report={r}
                                  onSelect={handleSelectReport}
                                />
                              ))}
                            </div>
                          )}
                          {viewMode === "list" && (
                            <div className="space-y-0.5">
                              {subcatReports.map((r) => (
                                <ReportListRow
                                  key={r.id}
                                  report={r}
                                  onSelect={handleSelectReport}
                                />
                              ))}
                            </div>
                          )}
                          {viewMode === "details" && (
                            <div className="border rounded-xl overflow-hidden">
                              <table className="w-full">
                                <thead className="bg-muted/50 border-b">
                                  <tr>
                                    <th className="w-8 pl-4" />
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground w-16">
                                      Prefix
                                    </th>
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground">
                                      Name
                                    </th>
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground hidden md:table-cell">
                                      Category
                                    </th>
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground hidden lg:table-cell">
                                      Subcategory
                                    </th>
                                    <th className="py-2 pr-4 text-left text-xs font-semibold text-muted-foreground hidden xl:table-cell">
                                      Tags
                                    </th>
                                    <th className="w-8" />
                                  </tr>
                                </thead>
                                <tbody>
                                  {subcatReports.map((r) => (
                                    <ReportDetailsRow
                                      key={r.id}
                                      report={r}
                                      onSelect={handleSelectReport}
                                    />
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllReports;
