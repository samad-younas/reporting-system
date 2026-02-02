import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Report } from "@/utils/exports";
import clsx from "clsx";

interface Props {
  reports: Report[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export default function ReportList({ reports, activeId, onSelect }: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Reports</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {reports.map((r) => (
          <div
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={clsx(
              "border rounded-lg p-3 cursor-pointer transition",
              activeId === r.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted",
            )}
          >
            <div className="font-medium flex items-center justify-between">
              {r.name}
              <Badge variant="secondary">{r.type}</Badge>
            </div>
            <div
              className={clsx(
                "text-xs mt-1",
                activeId === r.id
                  ? "text-primary-foreground/70"
                  : "text-muted-foreground",
              )}
            >
              {r.description}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
