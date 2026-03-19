import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/utils/exports";
import { getFavouriteReports, toggleFavouriteReport } from "@/utils/favourites";
import {
  setSelectedCategoryId,
  setSelectedReportId,
  setSelectedSubcategoryId,
} from "@/store/slices/reportSlice";

const FavouriteReports: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [favouriteReports, setFavouriteReports] = useState(() =>
    getFavouriteReports(reports),
  );

  useEffect(() => {
    setFavouriteReports(getFavouriteReports(reports));
  }, []);

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

  const removeFavourite = (reportId: number) => {
    toggleFavouriteReport(reportId);
    setFavouriteReports(getFavouriteReports(reports));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" /> My Favourite Reports
        </h1>
        <p className="text-muted-foreground text-sm">
          Your starred reports are shown here for quick access.
        </p>
      </div>

      {favouriteReports.length === 0 ? (
        <div className="bg-card p-6 rounded-md shadow text-center text-muted-foreground">
          No favourite reports yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {favouriteReports.map((report) => (
            <Card key={report.id} className="border-border/70">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{report.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
                <div className="flex gap-2">
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeFavourite(report.id)}
                  >
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavouriteReports;
