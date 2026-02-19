import React, { useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { reports, reportCategories } from "@/utils/exports";
import { checkPermission } from "@/utils/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { setSelectedReportId } from "@/store/slices/reportSlice";

const summaryData = [
  {
    label: "Monthly Revenue",
    value: "$450,320",
    color: "bg-blue-100",
    text: "text-blue-700",
  },
  {
    label: "Reports Run This Month",
    value: 32,
    color: "bg-yellow-100",
    text: "text-yellow-700",
  },
  {
    label: "Active Users",
    value: 18,
    color: "bg-green-100",
    text: "text-green-700",
  },
  {
    label: "Compliance Alerts",
    value: "2 Alerts",
    color: "bg-red-100",
    text: "text-red-700",
  },
];

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { userdata } = useSelector((state: any) => state.auth);
  const { selectedCategoryId } = useSelector((state: any) => state.report);

  // Get selected category and its subcategories
  const selectedCategory = useMemo(
    () => reportCategories.find((cat) => cat.id === selectedCategoryId),
    [selectedCategoryId],
  );

  // Get all subcategories for the selected category
  const subCategories = useMemo(() => {
    if (!selectedCategory) return [];
    const catReports = reports.filter(
      (r) =>
        r.categoryId === selectedCategory.id && checkPermission(r, userdata),
    );
    const subs = Array.from(
      new Set(
        catReports.flatMap((r) =>
          r.subCategories && r.subCategories.length > 0
            ? r.subCategories
            : ["General Reports"],
        ),
      ),
    ).sort();
    return subs;
  }, [selectedCategory, userdata]);

  // Get reports for a subcategory
  const getReportsForSub = (sub: string) => {
    if (!selectedCategory) return [];
    return reports.filter(
      (r) =>
        r.categoryId === selectedCategory.id &&
        checkPermission(r, userdata) &&
        ((r.subCategories && r.subCategories.includes(sub)) ||
          !r.subCategories ||
          (r.subCategories.length === 0 && sub === "General Reports")),
    );
  };

  // Quick Actions and Favorite Reports (mocked for now)
  const quickActions = [
    { name: "Sales Summary", lastRun: "6 days ago" },
    { name: "Regional Performance", lastRun: "13 days ago" },
    { name: "Staff Productivity", lastRun: "3 days ago" },
  ];
  const favoriteReports = [
    { name: "Product Sales Drilldown", lastRun: "3 days ago" },
    { name: "Inventory Analysis", lastRun: "Yesterday" },
  ];

  return (
    <div className="p-6 bg-background min-h-screen">
      {/* Header and Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All Reports</h1>
          <p className="text-muted-foreground text-sm">
            Overview of available reports
          </p>
        </div>
        <input
          type="text"
          placeholder="Search reports..."
          className="border rounded px-3 py-2 w-full md:w-80"
        />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summaryData.map((item) => (
          <Card key={item.label} className={item.color + " " + item.text}>
            <CardContent className="py-4 flex flex-col items-center">
              <span className="text-2xl font-bold">{item.value}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions, Favorites, Trends, Activity, Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((a) => (
                <div key={a.name} className="border rounded p-3 flex flex-col">
                  <span className="font-medium">{a.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Last run {a.lastRun}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Favorite Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Favorite Reports</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteReports.map((f) => (
                <div key={f.name} className="border rounded p-3 flex flex-col">
                  <span className="font-medium">{f.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    Last run {f.lastRun}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Revenue Trend (Mocked) */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-linear-to-r from-blue-200 to-blue-400 rounded" />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Activity, Alerts, Reference Trend */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>
                  You ran <b>Sales Summary - NSW</b>. 1 hour ago
                </li>
                <li>
                  You exported <b>Inventory Analysis</b>. Yesterday
                </li>
                <li>
                  New report assigned <b>Quarterly Compliance</b>
                </li>
              </ul>
            </CardContent>
          </Card>
          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-2">
                <li>Revenue dropped 9% vs last week</li>
                <li>3 failed report exports</li>
              </ul>
            </CardContent>
          </Card>
          {/* Reference Trend (Mocked) */}
          <Card>
            <CardHeader>
              <CardTitle>Reference Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-linear-to-r from-blue-100 to-blue-300 rounded" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* If a category is selected, show all subcategories and their reports */}
      {selectedCategory && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">
            {selectedCategory.name} - Subcategories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subCategories.map((sub) => (
              <Card key={sub} className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{sub}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getReportsForSub(sub).map((r) => (
                    <div
                      key={r.id}
                      className="border rounded p-3 cursor-pointer hover:bg-muted transition"
                      onClick={() => dispatch(setSelectedReportId(r.id))}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.name}</span>
                        <Badge variant="secondary">{r.type}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.description}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
