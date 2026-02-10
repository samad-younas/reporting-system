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
import { useSelector } from "react-redux";
import { useEffect } from "react";

interface Props {
  parameters: ReportParameter[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
}

export default function DynamicForm({ parameters, values, onChange }: Props) {
  const { userdata } = useSelector((state: any) => state.auth);

  // Auto-fill Logic for Location/Role based parameters
  useEffect(() => {
    if (!userdata || !userdata.profile) return;

    parameters.forEach((p) => {
      // Check if parameter name matches profile fields for auto-selection
      // This addresses the requirement: "parameter field should load the value" based on user info
      const lowerName = p.name.toLowerCase();
      if (!values[p.name]) {
        if (lowerName === "region" && userdata.profile.region) {
          onChange(p.name, userdata.profile.region);
        }
        if (lowerName === "state" && userdata.profile.state) {
          onChange(p.name, userdata.profile.state);
        }
        if (lowerName === "city" && userdata.profile.city) {
          onChange(p.name, userdata.profile.city);
        }
      }
    });
  }, [parameters, userdata]);

  return (
    <div className="grid grid-cols-1 gap-4">
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
