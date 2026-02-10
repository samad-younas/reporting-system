import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportCategory } from "@/utils/exports";
import clsx from "clsx";

interface Props {
  categories: ReportCategory[];
  activeId: number | null;
  onSelect: (id: number) => void;
}

export default function SidebarCategories({
  categories,
  activeId,
  onSelect,
}: Props) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm">Report Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map((c) => (
          <Button
            key={c.id}
            variant={activeId === c.id ? "default" : "outline"}
            className={clsx("w-full justify-start")}
            onClick={() => onSelect(c.id)}
          >
            {c.icon && <c.icon className="mr-2 h-4 w-4" />}
            {c.name}
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
