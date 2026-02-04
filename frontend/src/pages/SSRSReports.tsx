import React from "react";
import SalesByRegion from "@/components/reports/SalesByRegion";
import KpiCards from "@/components/reports/KpiCards";

const SSRSReports: React.FC = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <h1 className="text-xl font-bold tracking-tight">
          SSRS Reports Dashboard
        </h1>
      </div>

      <KpiCards />

      <div className="grid gap-4 md:grid-cols-1">
        <SalesByRegion />
      </div>
    </div>
  );
};

export default SSRSReports;
