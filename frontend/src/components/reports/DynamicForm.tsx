import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportParameter } from "@/utils/exports";

interface Props {
  parameters: ReportParameter[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export default function DynamicForm({ parameters, values, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {parameters.map((p) => (
        <div key={p.id} className="space-y-1">
          <Label>{p.label}</Label>

          {p.type === "text" && (
            <Input
              value={values[p.name] ?? ""}
              onChange={(e) => onChange(p.name, e.target.value)}
            />
          )}

          {p.type === "date" && (
            <Input
              type="date"
              value={values[p.name] ?? ""}
              onChange={(e) => onChange(p.name, e.target.value)}
            />
          )}

          {p.type === "select" && (
            <Select
              value={values[p.name] ?? ""}
              onValueChange={(v) => onChange(p.name, v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {p.options?.map((o) => (
                  <SelectItem key={o.id} value={String(o.id)}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {p.type === "multiselect" && (
            <select
              multiple
              className="w-full border rounded-md p-2 text-sm"
              value={values[p.name] ?? []}
              onChange={(e) =>
                onChange(
                  p.name,
                  Array.from(e.target.selectedOptions).map((o) => o.value),
                )
              }
            >
              {p.options?.map((o) => (
                <option key={o.id} value={String(o.id)}>
                  {o.name}
                </option>
              ))}
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
