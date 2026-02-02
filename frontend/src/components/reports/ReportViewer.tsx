import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  data: Record<string, any>[];
}

export default function ReportViewer({ data }: Props) {
  if (!data.length) {
    return <p className="text-muted-foreground text-sm mt-4">No data found.</p>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className="border rounded-lg mt-4 overflow-auto max-h-100">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, i) => (
            <TableRow key={i}>
              {columns.map((c) => (
                <TableCell key={c}>{row[c]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
