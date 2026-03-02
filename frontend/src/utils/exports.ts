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
  ShoppingCart,
  Package,
  Wallet,
  Settings,
  Library,
  Tag,
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

// 1st level: Main Group (e.g. "Report Library")
export interface ReportGroup {
  id: number;
  name: string;
  icon?: React.ElementType;
  description?: string;
}

// 2nd level: Report Category (e.g. "Sales", "Purchase", "Finance")
export interface ReportCategory {
  id: number;
  name: string;
  groupId: number;
  icon?: React.ElementType;
  description?: string;
  allowedRoles?: string[];
  allowedLocations?: string[];
  allowedCountries?: string[];
  allowedRegions?: string[];
  allowedStates?: string[];
  allowedCities?: string[];
  allowedCostCenters?: string[];
  image?: string;
}

// 3rd level: Subcategory (e.g. "Customer", "Product", "Profit and Loss")
export interface ReportSubcategory {
  id: number;
  name: string;
  categoryId: number;
  icon?: React.ElementType;
  description?: string;
}

export interface Report {
  id: number;
  prefix?: string; // e.g. "#01", "#02a"
  name: string;
  description: string;
  details?: string;
  subcategoryId: number; // links to ReportSubcategory
  categoryId: number; // links to ReportCategory (derived / kept for convenience)
  type: "table" | "pdf";
  parameters: ReportParameter[];
  result: Record<string, any>[];
  allowedRoles?: string[];
  allowedLocations?: string[];
  allowedCountries?: string[];
  allowedRegions?: string[];
  allowedStates?: string[];
  allowedCities?: string[];
  allowedCostCenters?: string[];
  benefits?: string[];
  tags?: string[];
  version?: string;
  previewImage?: string;
  isNew?: boolean;
}

// ─── Main Groups ───────────────────────────────────────────────────────────────
export const reportGroups: ReportGroup[] = [
  {
    id: 1,
    name: "Report Library",
    icon: Library,
    description: "All company reports organised by category.",
  },
];

// ─── Report Categories ─────────────────────────────────────────────────────────
export const reportCategories: ReportCategory[] = [
  {
    id: 1,
    name: "Sales",
    groupId: 1,
    icon: TrendingUp,
    description: "Customer, product and market segment sales reports.",
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
  },
  {
    id: 2,
    name: "Purchase",
    groupId: 1,
    icon: ShoppingCart,
    description: "Supplier and purchase order reports.",
    allowedRoles: ["admin", "manager", "super-admin"],
  },
  {
    id: 3,
    name: "Finance",
    groupId: 1,
    icon: Banknote,
    description: "P&L, balance sheets and financial statements.",
    allowedRoles: ["admin", "super-admin"],
  },
  {
    id: 4,
    name: "Operations",
    groupId: 1,
    icon: Settings,
    description: "Operational and service reports.",
    allowedRoles: ["admin", "manager", "super-admin"],
  },
];

// ─── Subcategories ──────────────────────────────────────────────────────────────
export const reportSubcategories: ReportSubcategory[] = [
  // Sales
  { id: 1, name: "Customer", categoryId: 1, icon: Users },
  { id: 2, name: "Product", categoryId: 1, icon: Box },
  { id: 3, name: "Market Segment", categoryId: 1, icon: PieChart },
  { id: 4, name: "Therapist Sales", categoryId: 1, icon: UserCog },
  // Purchase
  { id: 5, name: "Suppliers", categoryId: 2, icon: Package },
  { id: 6, name: "Purchase Orders", categoryId: 2, icon: ClipboardList },
  // Finance
  { id: 7, name: "Profit and Loss", categoryId: 3, icon: Wallet },
  { id: 8, name: "Expenses", categoryId: 3, icon: Tag },
  // Operations
  { id: 9, name: "Scheduling", categoryId: 4, icon: Calendar },
];

// ─── Reports ────────────────────────────────────────────────────────────────────
export const reports: Report[] = [
  // ── Customer (subcategoryId: 1, categoryId: 1 Sales) ──────────────────────
  {
    id: 101,
    prefix: "#01",
    isNew: true,
    name: "Sales by Customer Summary",
    description: "Summary report of customer purchase data.",
    details:
      "This report provides a comprehensive list of all sales transactions for the selected day, including customer details, amounts, and regions.",
    benefits: [
      "Track daily revenue in real-time",
      "Identify top performing regions",
      "Monitor sales rep performance",
    ],
    tags: ["Sales", "Daily", "Revenue", "Customer"],
    version: "2.1.0",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Daily+Sales+Report",
    subcategoryId: 1,
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
      { id: 2, name: "toDate", label: "To Date", type: "date", required: true },
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
    prefix: "#02a",
    name: "Sales by Customer Detail",
    description: "Detailed report of customer purchase data.",
    details:
      "Overview of all pending quotes and backorders, grouped by customer status.",
    benefits: ["Track open quotes", "Manage backorders efficiently"],
    tags: ["Sales", "Quotes", "Inventory", "Customer"],
    version: "1.0.5",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Quotes+Report",
    subcategoryId: 1,
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
    id: 110,
    prefix: "#02b",
    name: "Customer Lifetime Value",
    description: "Analysis of customer patterns lifetime value.",
    details: "Comparative analysis of lifetime revenue per customer.",
    tags: ["Customer", "Lifetime", "Revenue"],
    subcategoryId: 1,
    categoryId: 1,
    type: "table",
    allowedRoles: ["admin", "manager"],
    parameters: [],
    result: [],
  },
  {
    id: 111,
    prefix: "#03",
    name: "Customer Purchase Trends",
    description: "Customer purchasing patterns over time.",
    tags: ["Customer", "Trends"],
    subcategoryId: 1,
    categoryId: 1,
    type: "table",
    allowedRoles: ["admin", "manager"],
    parameters: [{ id: 1, name: "year", label: "Year", type: "text" }],
    result: [],
  },
  {
    id: 112,
    prefix: "#04",
    name: "Top Customers by Revenue",
    description: "Rank top customers based on revenue.",
    tags: ["Customer", "Revenue", "Ranking"],
    subcategoryId: 1,
    categoryId: 1,
    type: "table",
    allowedRoles: ["admin", "manager", "sales", "super-admin"],
    parameters: [],
    result: [],
  },
  {
    id: 113,
    prefix: "#05",
    name: "Inactive Customers Report",
    description: "Identify customers who have not made recent purchases.",
    tags: ["Customer", "Inactive"],
    subcategoryId: 1,
    categoryId: 1,
    type: "table",
    allowedRoles: ["admin", "manager"],
    parameters: [],
    result: [],
  },

  // ── Product (subcategoryId: 2, categoryId: 1 Sales) ───────────────────────
  {
    id: 103,
    prefix: "#01",
    name: "Product Sales Drilldown",
    description: "Detailed product sales report.",
    details:
      "Drill down into product sales by category, region, and time period.",
    benefits: ["Detailed product analysis", "Inventory planning"],
    tags: ["Product", "Sales", "Drilldown"],
    version: "3.0.0",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Product+Drilldown",
    subcategoryId: 2,
    categoryId: 1,
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
    prefix: "#02",
    name: "Inventory Valuation",
    description: "Current value of stock on hand.",
    details: "FIFO valuation of current inventory assets.",
    tags: ["Product", "Inventory"],
    subcategoryId: 2,
    categoryId: 1,
    type: "table",
    allowedRoles: ["admin"],
    parameters: [],
    result: [],
  },
  {
    id: 107,
    prefix: "#03",
    isNew: true,
    name: "Slow Moving Items",
    description: "Items with low turnover.",
    details: "Identifies stock that has not moved in X days.",
    tags: ["Product", "Inventory"],
    subcategoryId: 2,
    categoryId: 1,
    type: "table",
    allowedRoles: ["manager", "admin"],
    parameters: [{ id: 1, name: "days", label: "Days Inactive", type: "text" }],
    result: [],
  },

  // ── Market Segment (subcategoryId: 3, categoryId: 1 Sales) ───────────────
  {
    id: 108,
    prefix: "#01",
    name: "Demographic Breakdown",
    description: "Customer age and gender distribution.",
    tags: ["Market Segment", "Demographics"],
    subcategoryId: 3,
    categoryId: 1,
    type: "table",
    parameters: [],
    result: [],
  },
  {
    id: 109,
    prefix: "#02",
    name: "Sales by Interest",
    description: "Revenue based on customer interest tags.",
    tags: ["Market Segment", "Psychographics"],
    subcategoryId: 3,
    categoryId: 1,
    type: "table",
    parameters: [],
    result: [],
  },
  {
    id: 105,
    prefix: "#03",
    name: "Regional Sales Performance",
    description: "Sales analysis by geographic region.",
    details:
      "Comparative analysis of sales performance across different territories.",
    tags: ["Market Segment", "Regional"],
    subcategoryId: 3,
    categoryId: 1,
    type: "table",
    allowedRoles: ["admin", "manager"],
    parameters: [{ id: 1, name: "year", label: "Year", type: "text" }],
    result: [],
  },

  // ── Therapist Sales (subcategoryId: 4, categoryId: 1 Sales) ─────────────
  {
    id: 104,
    prefix: "#01",
    name: "Therapist Monthly Transaction",
    description: "Monthly transaction history for therapists.",
    details:
      "Detailed history of transactions per therapist for the selected month.",
    benefits: ["Performance tracking", "Monthly reconciliation"],
    tags: ["Therapist", "Transactions", "Monthly"],
    version: "1.2.0",
    previewImage:
      "https://placehold.co/600x300/e2e8f0/1e293b?text=Therapist+Report",
    subcategoryId: 4,
    categoryId: 1,
    type: "table",
    allowedLocations: ["New York"],
    parameters: [
      { id: 1, name: "date", label: "Date", type: "date", required: true },
    ],
    result: [],
  },

  // ── Suppliers (subcategoryId: 5, categoryId: 2 Purchase) ─────────────────
  {
    id: 201,
    prefix: "#01",
    name: "Supplier Performance Summary",
    description: "Overview of supplier delivery and quality metrics.",
    tags: ["Purchase", "Suppliers"],
    subcategoryId: 5,
    categoryId: 2,
    type: "table",
    allowedRoles: ["admin", "manager", "super-admin"],
    parameters: [],
    result: [],
  },
  {
    id: 202,
    prefix: "#02",
    name: "Supplier Price Comparison",
    description: "Compare pricing across active suppliers.",
    tags: ["Purchase", "Suppliers", "Pricing"],
    subcategoryId: 5,
    categoryId: 2,
    type: "table",
    allowedRoles: ["admin", "super-admin"],
    parameters: [],
    result: [],
  },

  // ── Purchase Orders (subcategoryId: 6, categoryId: 2 Purchase) ───────────
  {
    id: 203,
    prefix: "#01",
    name: "Open Purchase Orders",
    description: "List of all open purchase orders awaiting fulfilment.",
    tags: ["Purchase", "Orders"],
    subcategoryId: 6,
    categoryId: 2,
    type: "table",
    allowedRoles: ["admin", "manager", "super-admin"],
    parameters: [],
    result: [],
  },
  {
    id: 204,
    prefix: "#02",
    name: "Purchase Order History",
    description: "Historical view of completed purchase orders.",
    tags: ["Purchase", "Orders", "History"],
    subcategoryId: 6,
    categoryId: 2,
    type: "table",
    allowedRoles: ["admin", "manager", "super-admin"],
    parameters: [
      { id: 1, name: "fromDate", label: "From Date", type: "date" },
      { id: 2, name: "toDate", label: "To Date", type: "date" },
    ],
    result: [],
  },

  // ── Profit and Loss (subcategoryId: 7, categoryId: 3 Finance) ────────────
  {
    id: 301,
    prefix: "#01",
    name: "Monthly P&L Statement",
    description: "Profit and loss statement for the selected month.",
    tags: ["Finance", "P&L"],
    subcategoryId: 7,
    categoryId: 3,
    type: "table",
    allowedRoles: ["admin", "super-admin"],
    parameters: [
      { id: 1, name: "month", label: "Month", type: "text", required: true },
      { id: 2, name: "year", label: "Year", type: "text", required: true },
    ],
    result: [],
  },
  {
    id: 302,
    prefix: "#02",
    name: "Year to Date P&L",
    description: "Cumulative profit and loss from start of financial year.",
    tags: ["Finance", "P&L", "YTD"],
    subcategoryId: 7,
    categoryId: 3,
    type: "table",
    allowedRoles: ["admin", "super-admin"],
    parameters: [],
    result: [],
  },

  // ── Expenses (subcategoryId: 8, categoryId: 3 Finance) ───────────────────
  {
    id: 303,
    prefix: "#01",
    name: "Expense Summary by Category",
    description: "Break down of all business expenses by category.",
    tags: ["Finance", "Expenses"],
    subcategoryId: 8,
    categoryId: 3,
    type: "table",
    allowedRoles: ["admin", "super-admin"],
    parameters: [],
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
