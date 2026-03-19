import React, { useMemo, useState } from "react";
import { Search, MessageSquareText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reports } from "@/utils/exports";

const Enquiries: React.FC = () => {
  const [query, setQuery] = useState("");

  const enquiryReports = useMemo(() => {
    const q = query.toLowerCase().trim();
    return reports
      .filter((report) =>
        (report.tags || []).some((tag) =>
          ["enquiries", "enquiry", "customer", "sales"].includes(
            tag.toLowerCase(),
          ),
        ),
      )
      .filter((report) => {
        if (!q) return true;
        return (
          report.name.toLowerCase().includes(q) ||
          report.description.toLowerCase().includes(q) ||
          (report.tags || []).some((tag) => tag.toLowerCase().includes(q))
        );
      });
  }, [query]);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquareText className="h-6 w-6 text-primary" /> Enquiries
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search and access enquiry-focused reporting assets.
        </p>
      </div>

      <div className="relative max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search enquiries reports..."
          className="pl-9"
        />
      </div>

      {enquiryReports.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No enquiry reports found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {enquiryReports.map((report) => (
            <Card key={report.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{report.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {report.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Enquiries;
