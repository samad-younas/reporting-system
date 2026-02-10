import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  reportCategories,
  type Report,
  type ReportParameter,
} from "@/utils/exports";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Mock Textarea if not exists, but usually simple-dialog implies some UI lib.
// checking workspace, ui/textarea not listed in initial file list but assuming standard shadcn.
// If not, I will use <textarea className="..." />

interface ReportManageFormProps {
  initialData?: Partial<Report> | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const ReportManageForm: React.FC<ReportManageFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState<Partial<Report>>({
    name: "",
    description: "",
    details: "",
    categoryId: 1,
    subCategory: "",
    type: "table",
    allowedRoles: ["admin", "manager"], // Default
    parameters: [],
    result: [], // Placeholder
  });

  const [parameters, setParameters] = useState<ReportParameter[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        allowedRoles: initialData.allowedRoles || [],
      });
      setParameters(initialData.parameters || []);
    }
  }, [initialData]);

  const handleChange = (field: keyof Report, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Parameter Management
  const addParameter = () => {
    const newId =
      parameters.length > 0 ? Math.max(...parameters.map((p) => p.id)) + 1 : 1;
    setParameters([
      ...parameters,
      {
        id: newId,
        name: "",
        label: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const removeParameter = (index: number) => {
    const newParams = [...parameters];
    newParams.splice(index, 1);
    setParameters(newParams);
  };

  const updateParameter = (
    index: number,
    field: keyof ReportParameter,
    value: any,
  ) => {
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], [field]: value };
    setParameters(newParams);
  };

  const handleOptionsChange = (index: number, value: string) => {
    // Parse comma separated options
    const options = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s)
      .map((s) => ({
        id: s,
        name: s,
      }));
    const newParams = [...parameters];
    newParams[index] = { ...newParams[index], options: options };
    setParameters(newParams);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      parameters: parameters,
    };
    await onSubmit(submissionData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-h-[80vh] overflow-y-auto px-1"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Report Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
            placeholder="e.g. Daily Sales"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.categoryId?.toString()}
            onValueChange={(val) => handleChange("categoryId", parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {reportCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subCategory">Sub Category</Label>
          <Input
            id="subCategory"
            value={formData.subCategory || ""}
            onChange={(e) => handleChange("subCategory", e.target.value)}
            placeholder="e.g. Financials"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Report Type</Label>
          <Select
            value={formData.type}
            onValueChange={(val) => handleChange("type", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="table">Table</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="chart">Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Short description..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Details (Overview)</Label>
        <textarea
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          id="details"
          value={formData.details || ""}
          onChange={(e) => handleChange("details", e.target.value)}
          placeholder="Detailed explanation of the report..."
        />
      </div>

      <div className="space-y-2">
        <Label>Allowed Roles</Label>
        <div className="flex flex-wrap gap-4 pt-1">
          {["admin", "manager", "sales", "user", "super-admin"].map((role) => (
            <label
              key={role}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                checked={formData.allowedRoles?.includes(role)}
                onChange={() => {
                  const current = formData.allowedRoles || [];
                  const newValue = current.includes(role)
                    ? current.filter((r) => r !== role)
                    : [...current, role];
                  handleChange("allowedRoles", newValue);
                }}
              />
              <span className="text-sm capitalize">{role}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Parameters / Filters</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addParameter}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Parameter
          </Button>
        </div>

        <div className="space-y-3">
          {parameters.map((param, idx) => (
            <Card key={idx} className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 hover:text-destructive"
                onClick={() => removeParameter(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Identifier (Key)</Label>
                  <Input
                    value={param.name}
                    onChange={(e) =>
                      updateParameter(idx, "name", e.target.value)
                    }
                    placeholder="fromDate"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Display Label</Label>
                  <Input
                    value={param.label}
                    onChange={(e) =>
                      updateParameter(idx, "label", e.target.value)
                    }
                    placeholder="From Date"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={param.type}
                    onValueChange={(val: any) =>
                      updateParameter(idx, "type", val)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="select">Select (Dropdown)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {param.type === "select" && (
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-xs">Options (Comma separated)</Label>
                    <Input
                      defaultValue={param.options
                        ?.map((o) => o.name)
                        .join(", ")}
                      onBlur={(e) => handleOptionsChange(idx, e.target.value)}
                      placeholder="Option 1, Option 2, Option 3"
                      className="h-8 text-xs"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {parameters.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
              No parameters defined. The report will run without inputs.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : initialData
              ? "Update Report"
              : "Create Report"}
        </Button>
      </div>
    </form>
  );
};

export default ReportManageForm;
