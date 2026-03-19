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
  reportSubcategories,
  type Report,
  type ReportParameter,
} from "@/utils/exports";
import { Plus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFetch } from "@/hooks/useFetch";

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
  const { data: metadata } = useFetch({
    endpoint: "api/reports/meta",
    isAuth: true,
  });

  const dynamicCategories = Array.isArray(metadata?.categories)
    ? metadata.categories
    : reportCategories;
  const dynamicSubcategories = Array.isArray(metadata?.subcategories)
    ? metadata.subcategories
    : reportSubcategories;

  const [formData, setFormData] = useState<Partial<Report>>({
    name: "",
    prefix: "",
    description: "",
    details: "",
    mainCategory: "",
    categoryId: 1,
    subcategoryId: 1,
    reportType: "Operational",
    type: "table",
    outputMode: "new_tab",
    engine: "crystal",
    engineConfig: {},
    reportImage: "",
    requiredPermissions: ["reports.view"],
    parameters: [],
    result: [],
  });

  const [parameters, setParameters] = useState<ReportParameter[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        requiredPermissions: initialData.requiredPermissions || [
          "reports.view",
        ],
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
          <Label htmlFor="prefix">Report Prefix</Label>
          <Input
            id="prefix"
            value={formData.prefix || ""}
            onChange={(e) => handleChange("prefix", e.target.value)}
            placeholder="e.g. #01, #02a"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.categoryId?.toString()}
            onValueChange={(val) => {
              const catId = parseInt(val);
              handleChange("categoryId", catId);
              // auto-select first subcategory of new category
              const firstSub = dynamicSubcategories.find(
                (s: any) => s.categoryId === catId,
              );
              if (firstSub) handleChange("subcategoryId", firstSub.id);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {dynamicCategories.map((cat: any) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subcategory">Subcategory</Label>
          <Select
            value={formData.subcategoryId?.toString()}
            onValueChange={(val) =>
              handleChange("subcategoryId", parseInt(val))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Subcategory" />
            </SelectTrigger>
            <SelectContent>
              {dynamicSubcategories
                .filter((s: any) => s.categoryId === (formData.categoryId ?? 1))
                .map((sub: any) => (
                  <SelectItem key={sub.id} value={sub.id.toString()}>
                    {sub.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mainCategory">Main Category</Label>
          <Input
            id="mainCategory"
            value={formData.mainCategory || ""}
            onChange={(e) => handleChange("mainCategory", e.target.value)}
            placeholder="e.g. Financial"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reportType">Report Classification</Label>
          <Input
            id="reportType"
            value={formData.reportType || ""}
            onChange={(e) => handleChange("reportType", e.target.value)}
            placeholder="e.g. Transactional / Summary / Audit"
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

        <div className="space-y-2">
          <Label htmlFor="outputMode">Report Output Mode</Label>
          <Select
            value={formData.outputMode || "new_tab"}
            onValueChange={(val: "embed" | "new_tab") =>
              handleChange("outputMode", val)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_tab">Open in New Tab</SelectItem>
              <SelectItem value="embed">Embed in View</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="engine">Report Engine</Label>
          <Select
            value={formData.engine || "crystal"}
            onValueChange={(val: any) => handleChange("engine", val)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="crystal">Crystal Reports</SelectItem>
              <SelectItem value="powerbi">Power BI</SelectItem>
              <SelectItem value="devexpress">DevExpress</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
        <Label htmlFor="requiredPermissions">
          Required Permissions (comma separated)
        </Label>
        <Input
          id="requiredPermissions"
          value={(formData.requiredPermissions || []).join(",")}
          onChange={(e) =>
            handleChange(
              "requiredPermissions",
              e.target.value
                .split(",")
                .map((value) => value.trim())
                .filter(Boolean),
            )
          }
          placeholder="reports.view,reports.export"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reportImage">Report Image / Preview URL</Label>
        <Input
          id="reportImage"
          value={formData.reportImage || ""}
          onChange={(e) => handleChange("reportImage", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="engineConfig">Engine Config (JSON)</Label>
        <textarea
          className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          id="engineConfig"
          value={JSON.stringify(formData.engineConfig || {}, null, 2)}
          onChange={(e) => {
            try {
              const value = e.target.value.trim();
              handleChange("engineConfig", value ? JSON.parse(value) : {});
            } catch {
              // Keep typing friendly while JSON is incomplete.
            }
          }}
          placeholder='{"reportPath":"/reports/sales"}'
        />
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
