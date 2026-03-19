import React, { useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { reports } from "@/utils/exports";

const GridReports: React.FC = () => {
  const gridReports = useMemo(
    () =>
      reports.filter(
        (report) => report.type === "table" || report.type === "chart",
      ),
    [],
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutGrid className="h-6 w-6 text-primary" /> Grid Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Reports optimized for analytical grid output.
        </p>
      </div>

      {gridReports.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No grid reports available.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {gridReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{report.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {report.description}
                </p>
                <Badge variant="secondary">{report.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GridReports;
