export interface ReportCategory {
  id: number;
  name: string;
  allowedRoles?: string[];
  allowedLocations?: string[];
}

export interface ReportParameterOption {
  id: string | number;
  name: string;
}

export interface ReportParameter {
  id: number;
  name: string;
  label: string;
  type: "text" | "date" | "select" | "multiselect";
  required?: boolean;
  options?: ReportParameterOption[];
}

export interface Report {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  type: "table" | "pdf";
  parameters: ReportParameter[];
  result: Record<string, any>[];
  rptFile?: string;
  allowedRoles?: string[];
  allowedLocations?: string[];
}
