import {
  LayoutDashboard,
  UserCog,
  TrendingUp,
  Headphones,
  Gauge,
  ClipboardList,
  PieChart,
  Zap,
  Users,
  Trophy,
  Banknote,
  Lightbulb,
  Factory,
  Globe,
  Euro,
  Calendar,
  Filter,
  Database,
  Image,
  Box,
} from "lucide-react";

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
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
  },
  {
    id: 2,
    name: "Product Sales",
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
  },
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
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
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
    allowedRoles: ["sales", "manager", "admin", "super-admin"],
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
    allowedRoles: ["admin", "manager", "user", "super-admin"],
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

export const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/user-management",
    icon: UserCog,
    label: "User Management",
  },
  {
    to: "/ssrs-reports",
    icon: TrendingUp,
    label: "Sales Overview",
  },
  {
    to: "/product-and-custom-sales",
    icon: Headphones,
    label: "Customer Support",
  },
  {
    to: "/v-t-and-target-customer-list",
    icon: Gauge,
    label: "Sales Performance",
  },
  {
    to: "/management",
    icon: ClipboardList,
    label: "Sales Details",
  },
  {
    to: "/dynamic-reports",
    icon: PieChart,
    label: "Financial Dashboard",
  },
  {
    to: "/b2b-reports",
    icon: Zap,
    label: "Energy Statistics",
  },
  {
    to: "/b2b-reports",
    icon: Users,
    label: "Human Resources",
  },
  {
    to: "/b2b-reports",
    icon: Trophy,
    label: "Champion League Statistics",
  },
  {
    to: "/b2b-reports",
    icon: Banknote,
    label: "Revenue Analysis",
  },
  {
    to: "/b2b-reports",
    icon: Lightbulb,
    label: "Energy Consumption",
  },
  {
    to: "/b2b-reports",
    icon: Banknote,
    label: "Revenue Analysis",
  },
  {
    to: "/b2b-reports",
    icon: Factory,
    label: "Revenue By Industry",
  },
  {
    to: "/b2b-reports",
    icon: Lightbulb,
    label: "Energy Consumption",
  },
  {
    to: "/b2b-reports",
    icon: Globe,
    label: "Website Statistics",
  },
  {
    to: "/b2b-reports",
    icon: Euro,
    label: "EU Trade Overview 2015",
  },
  {
    to: "/b2b-reports",
    icon: Calendar,
    label: "YTD Performance",
  },
  {
    to: "/b2b-reports",
    icon: Filter,
    label: "Data Filter - Technical Demo",
  },
  {
    to: "/b2b-reports",
    icon: Database,
    label: "Data Fedration - Technical Demo",
  },
  {
    to: "/b2b-reports",
    icon: Image,
    label: "Bound Image & Text - Technical Demo",
  },
  {
    to: "/b2b-reports",
    icon: Box,
    label: "Custom Items - Technical Demo",
  },
];
