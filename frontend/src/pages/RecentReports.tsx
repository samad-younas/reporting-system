import React from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Clock3, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { reports } from "@/utils/exports";
import { getRecentReports } from "@/utils/favourites";
import {
  setSelectedCategoryId,
  setSelectedReportId,
  setSelectedSubcategoryId,
} from "@/store/slices/reportSlice";

const RecentReports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recentReports = useMemo(() => getRecentReports(reports), []);

  const openReport = (
    reportId: number,
    categoryId: number,
    subcategoryId: number,
  ) => {
    dispatch(setSelectedCategoryId(categoryId));
    dispatch(setSelectedSubcategoryId(subcategoryId));
    dispatch(setSelectedReportId(reportId));
    navigate("/all-reports");
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Clock3 className="h-6 w-6 text-primary" /> Recent Reports
        </h1>
        <p className="text-muted-foreground text-sm">
          Reports you recently opened are listed here.
        </p>
      </div>

      {recentReports.length === 0 ? (
        <div className="bg-card p-6 rounded-md shadow text-center text-muted-foreground">
          No recent reports to display.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recentReports.map((report) => (
            <Card key={report.id} className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{report.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
                <Button
                  size="sm"
                  onClick={() =>
                    openReport(
                      report.id,
                      report.categoryId,
                      report.subcategoryId,
                    )
                  }
                >
                  Open Report <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentReports;
