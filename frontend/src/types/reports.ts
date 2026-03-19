export interface ReportCategory {
  id: number;
  name: string;
  image?: string;
  description?: string;
  requiredPermissions?: string[];
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
  required: boolean;
  options?: ReportParameterOption[];
}

export interface Report {
  id: number;
  name: string;
  description: string;
  details?: string;
  categoryId: number;
  subcategoryId?: number;
  subCategories?: string[];
  type: string;
  parameters: ReportParameter[];
  result: any[];
  requiredPermissions?: string[];
  mainCategory?: string;
  reportType?: string;
  outputMode?: "embed" | "new_tab";
  engine?: "crystal" | "powerbi" | "devexpress" | "other";
  engineConfig?: Record<string, any>;
  reportImage?: string;
}
