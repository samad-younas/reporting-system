import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import type { Report } from "@/utils/exports";
import { Badge } from "@/components/ui/badge";

interface ReportTableProps {
  reports: Report[];
  onEdit: (report: Report) => void;
  onDelete: (id: number) => void;
}

const ReportTable: React.FC<ReportTableProps> = ({
  reports,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Sub Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="w-25">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No reports found.
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.id}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{report.name}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-50">
                      {report.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{report.categoryId}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {report.subCategories?.map((sub, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[10px] px-1 h-5"
                      >
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{report.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(report)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(report.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReportTable;
