export interface ReportCategory {
  id: number;
  name: string;
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
  categoryId: number;
  type: string;
  parameters: ReportParameter[];
  result: any[];
}
