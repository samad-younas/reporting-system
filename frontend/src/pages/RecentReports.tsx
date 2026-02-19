import React from "react";

const RecentReports: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Reports</h1>
      <p className="text-muted-foreground mb-2">
        This page will display a list of reports you have recently viewed or
        accessed.
      </p>
      {/* TODO: Implement recent reports list */}
      <div className="bg-card p-4 rounded shadow text-center text-muted-foreground">
        No recent reports to display.
      </div>
    </div>
  );
};

export default RecentReports;
