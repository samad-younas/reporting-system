export const apiURL = "https://apis-reporting.cupsandcurves.com.au/";

export type ReportParameterType = "text" | "date" | "select" | "multiselect";

export interface ReportParameterOption {
  id: string | number;
  name: string;
}

export interface ReportParameter {
  id: number;
  name: string;
  label: string;
  type: ReportParameterType;
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

export interface ReportCategory {
  id: number;
  name: string;
  allowedRoles?: string[];
  allowedLocations?: string[];
}

export const reportCategories: ReportCategory[] = [
  {
    id: 1,
    name: "Customer Sales",
    allowedRoles: ["admin", "manager", "sales"],
  },
  { id: 2, name: "Product Sales", allowedRoles: ["admin", "manager", "sales"] },
  {
    id: 3,
    name: "Market Segment Sales",
    allowedRoles: ["admin", "manager", "user"],
  },
  { id: 4, name: "Therapist Sales", allowedLocations: ["New York"] },
];

export const reports: Report[] = [
  {
    id: 101,
    name: "Daily Sales Register",
    description: "Daily sales performance summary",
    categoryId: 1,
    type: "table",
    rptFile: "/reports/CustomerReport1.rpt",
    allowedRoles: ["admin", "manager", "sales"],
    allowedLocations: ["New York", "London"],
    parameters: [
      {
        id: 1,
        name: "fromDate",
        label: "From Date",
        type: "date",
        required: true,
      },
      {
        id: 2,
        name: "toDate",
        label: "To Date",
        type: "date",
        required: true,
      },
      {
        id: 3,
        name: "region",
        label: "Region",
        type: "select",
        required: true,
        options: [
          { id: "North", name: "North" },
          { id: "South", name: "South" },
          { id: "East", name: "East" },
          { id: "West", name: "West" },
        ],
      },
    ],
    result: [
      {
        orderNo: "SO-1001",
        customer: "ABC Traders",
        amount: 1200,
        region: "North",
      },
      {
        orderNo: "SO-1002",
        customer: "XYZ Corp",
        amount: 1800,
        region: "South",
      },
      {
        orderNo: "SO-1003",
        customer: "Prime Ltd",
        amount: 950,
        region: "North",
      },
    ],
  },
  {
    id: 102,
    name: "Sales, Quotes & Backorders Summary",
    description: "Summary of sales quotes and backorders",
    categoryId: 1,
    type: "table",
    allowedRoles: ["sales", "manager", "admin"],
    parameters: [
      {
        id: 1,
        name: "customer",
        label: "Customer",
        type: "select",
        required: true,
        options: [
          { id: "ABC Traders", name: "ABC Traders" },
          { id: "XYZ Corp", name: "XYZ Corp" },
          { id: "Prime Ltd", name: "Prime Ltd" },
        ],
      },
    ],
    result: [],
  },
  {
    id: 103,
    name: "Product Sales Drilldown",
    description: "Detailed product sales report",
    categoryId: 2,
    type: "table",
    allowedRoles: ["admin", "manager", "user"],
    parameters: [
      {
        id: 1,
        name: "product",
        label: "Product",
        type: "select",
        required: true,
        options: [
          { id: "Keyboard", name: "Keyboard" },
          { id: "Mouse", name: "Mouse" },
        ],
      },
    ],
    result: [],
  },
  {
    id: 104,
    name: "Therapist Monthly Transaction History",
    description: "Monthly transaction history for therapists",
    categoryId: 4,
    type: "table",
    allowedLocations: ["New York"],
    parameters: [
      {
        id: 1,
        name: "date",
        label: "Date",
        type: "date",
        required: true,
      },
    ],
    result: [],
  },
];
