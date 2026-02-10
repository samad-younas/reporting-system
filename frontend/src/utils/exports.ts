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
  details?: string;
  categoryId: number;
  subCategory?: string;
  type: "table" | "pdf";
  parameters: ReportParameter[];
  result: Record<string, any>[];
  allowedRoles?: string[];
  allowedLocations?: string[]; // Generic allow list
  // Detailed Geographic Restrictions
  allowedCountries?: string[];
  allowedRegions?: string[];
  allowedStates?: string[];
  allowedCities?: string[];
  allowedCostCenters?: string[];

  // Extended fields for UI
  benefits?: string[];
  tags?: string[];
  version?: string;
  previewImage?: string;
}

export interface ReportCategory {
  id: number;
  name: string;
  image?: string;
  description?: string;
  allowedRoles?: string[];
  // Detailed Geographic Restrictions
  allowedCountries?: string[];
  allowedRegions?: string[];
  allowedStates?: string[];
  allowedCities?: string[];
  allowedCostCenters?: string[];
  allowedLocations?: string[];
}

export const reportCategories: ReportCategory[] = [
  {
    id: 0,
    name: "Dashboards",
    image: "https://placehold.co/600x400?text=Executive+Dashboards",
    description: "High-level visual overviews of business performance.",
    allowedRoles: ["admin", "manager", "super-admin"],
  },
  {
    id: 1,
    name: "Customer Sales",
    image: "https://placehold.co/600x400?text=Customer+Sales",
    description: "Analyze customer purchasing patterns and sales performance.",
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
  },
  {
    id: 2,
    name: "Product Sales",
    image: "https://placehold.co/600x400?text=Product+Sales",
    description: "Detailed insights into product performance and inventory.",
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
  },
  {
    id: 3,
    name: "Market Segment Sales",
    image: "https://placehold.co/600x400?text=Market+Segment",
    description: "Sales breakdown by market segments and demographics.",
    allowedRoles: ["admin", "manager", "user"],
  },
  {
    id: 4,
    name: "Therapist Sales",
    image: "https://placehold.co/600x400?text=Therapist+Sales",
    description: "Track therapist performance and transaction history.",
    allowedLocations: ["New York"],
  },
  {
    id: 5,
    name: "Financial Reports",
    image: "https://placehold.co/600x400?text=Finance",
    description: "P&L, Balance Sheets, and financial statements.",
    allowedRoles: ["admin", "super-admin"],
  },
];

export const reports: Report[] = [
  // --- Category: Dashboards (ID 0) ---
  {
    id: 1001,
    name: "Executive Summary",
    description: "High-level KPI overview for executives",
    details:
      "Real-time dashboard showing core business metrics including Revenue, EBITDA, and Customer Acquisition.",
    benefits: ["Instant business health check", "Trend analysis"],
    tags: ["Executive", "KPI", "Visual"],
    version: "1.0",
    previewImage:
      "https://placehold.co/600x300/1e293b/ffffff?text=Executive+Dashboard",
    categoryId: 0,
    subCategory: "1. Strategic Overview",
    type: "table",
    allowedRoles: ["admin", "super-admin"],
    parameters: [
      {
        id: 1,
        name: "fiscalYear",
        label: "Fiscal Year",
        type: "select",
        options: [
          { id: "2024", name: "2024" },
          { id: "2023", name: "2023" },
        ],
      },
    ],
    result: [],
  },
  {
    id: 1002,
    name: "Operational Real-time",
    description: "Live operational metrics",
    details: "Warehouse status, order backlog, and shipping performance.",
    benefits: ["Identify bottlenecks", "Resource allocation"],
    tags: ["Ops", "Real-time"],
    version: "1.1",
    previewImage:
      "https://placehold.co/600x300/1e293b/ffffff?text=Ops+Dashboard",
    categoryId: 0,
    subCategory: "2. Operations",
    type: "table",
    allowedRoles: ["manager", "admin"],
    parameters: [],
    result: [],
  },

  // --- Category: Customer Sales (ID 1) ---
  {
    id: 101,
    name: "Daily Sales Register",
    description: "Daily sales performance summary",
    details:
      "This report provides a comprehensive list of all sales transactions for the selected day, including customer details, amounts, and regions.",
    benefits: [
      "Track daily revenue in real-time",
      "Identify top performing regions",
      "Monitor sales rep performance",
    ],
    tags: ["Sales", "Daily", "Revenue"],
    version: "2.1.0",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Daily+Sales+Report",
    categoryId: 1,
    subCategory: "1. Daily Tracking",
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
    result: [],
  },
  {
    id: 102,
    name: "Sales, Quotes & Backorders",
    description: "Summary of sales quotes and backorders",
    details:
      "Overview of all pending quotes and backorders, grouped by customer status.",
    benefits: ["Track open quotes", "Manage backorders efficiently"],
    tags: ["Sales", "Quotes", "Inventory"],
    version: "1.0.5",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Quotes+Report",
    categoryId: 1,
    subCategory: "2. Order Management",
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
    id: 105,
    name: "Regional Sales Performance",
    description: "Sales analysis by geographic region",
    details:
      "Comparative analysis of sales performance across different territories.",
    categoryId: 1,
    subCategory: "3. Regional Analysis",
    type: "table",
    allowedRoles: ["admin", "manager"],
    parameters: [{ id: 1, name: "year", label: "Year", type: "text" }],
    result: [],
  },

  // --- Category: Product Sales (ID 2) ---
  {
    id: 103,
    name: "Product Sales Drilldown",
    description: "Detailed product sales report",
    details:
      "Drill down into product sales by category, region, and time period.",
    benefits: ["Detailed product analysis", "Inventory planning"],
    tags: ["Product", "Sales", "Drilldown"],
    version: "3.0.0",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Product+Drilldown",
    categoryId: 2,
    subCategory: "1. Performance",
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
    id: 106,
    name: "Inventory Valuation",
    description: "Current value of stock on hand",
    details: "FIFO valuation of current inventory assets.",
    categoryId: 2,
    subCategory: "2. Inventory",
    type: "table",
    allowedRoles: ["admin"],
    parameters: [],
    result: [],
  },
  {
    id: 107,
    name: "Slow Moving Items",
    description: "Items with low turnover",
    details: "Identifies stock that has not moved in X days.",
    categoryId: 2,
    subCategory: "2. Inventory",
    type: "table",
    allowedRoles: ["manager", "admin"],
    parameters: [{ id: 1, name: "days", label: "Days Inactive", type: "text" }],
    result: [],
  },

  // --- Category: Market Segment (ID 3) ---
  {
    id: 108,
    name: "Demographic Breakdown",
    description: "Customer age and gender distribution",
    categoryId: 3,
    subCategory: "1. Demographics",
    type: "table",
    parameters: [],
    result: [],
  },
  {
    id: 109,
    name: "Sales by Interest",
    description: "Revenue based on customer interest tags",
    categoryId: 3,
    subCategory: "2. Psychographics",
    type: "table",
    parameters: [],
    result: [],
  },

  // --- Category: Therapist Sales (ID 4) ---
  {
    id: 104,
    name: "Therapist Monthly Transaction",
    description: "Monthly transaction history for therapists",
    details:
      "Detailed history of transactions per therapist for the selected month.",
    benefits: ["Performance tracking", "Monthly reconciliation"],
    tags: ["Therapist", "Transactions", "Monthly"],
    version: "1.2.0",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Therapist+Report",
    categoryId: 4,
    subCategory: "1. Transactions",
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
  {
    to: "/ssrs-reports",
    icon: TrendingUp,
    label: "Sales Overview",
  },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  {
    to: "/user-management",
    icon: UserCog,
    label: "User Management",
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
