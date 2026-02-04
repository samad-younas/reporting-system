import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

const kpiData = [
  {
    title: "Revenue YTD",
    value: "$6.24M",
    subtext: "$159M Revenue YTD",
    change: "+$6.24M",
    color: "text-emerald-600", // Keep Icon/Text color
  },
  {
    title: "Expenses YTD",
    value: "$15.3K",
    subtext: "$30.6M Expenses YTD",
    change: "+$15.3K",
    color: "text-rose-600",
  },
  {
    title: "Profit YTD",
    value: "$6.23M",
    subtext: "$129M Profit YTD",
    change: "+$6.23M",
    color: "text-blue-600",
  },
  {
    title: "Avg Order Size",
    value: "$114K",
    subtext: "$955K Avg Order Size",
    change: "+$114K",
    color: "text-amber-600",
  },
  {
    title: "New Customers",
    value: "15.8K",
    subtext: "207K New Customers",
    change: "+15.8K",
    color: "text-violet-600",
  },
  {
    title: "Market Share",
    value: "23%",
    subtext: "Market Share",
    change: "",
    color: "text-cyan-600",
  },
];

const KpiCards: React.FC = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {kpiData.map((kpi, index) => (
        <Card
          key={index}
          className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow py-3 gap-0"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 px-4 pb-0">
            <CardTitle className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {kpi.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className={`text-xl font-bold ${kpi.color} flex items-center`}>
              {kpi.change && <ArrowUpRight className="mr-1 h-3 w-3" />}
              {/* Logic to prepend $ if missing, unless it's a percentage */}
              {kpi.value.startsWith("$") || kpi.value.endsWith("%")
                ? kpi.value
                : `$${kpi.value}`}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0 opacity-80 font-medium truncate">
              {kpi.subtext}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;
