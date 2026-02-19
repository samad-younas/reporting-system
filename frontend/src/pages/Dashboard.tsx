"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import {
  Plus,
  FileText,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ================= MOCK DATA ================= */

const revenueTrend = [
  { name: "Week 1", value: 2000 },
  { name: "Week 2", value: 2400 },
  { name: "Week 3", value: 2600 },
  { name: "Week 4", value: 3000 },
  { name: "Week 5", value: 3300 },
  { name: "Week 6", value: 3600 },
];

const miniBars = [
  { value: 20 },
  { value: 35 },
  { value: 30 },
  { value: 45 },
  { value: 60 },
  { value: 50 },
];

/* ================= COMPONENT ================= */

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f4f6f9] p-8">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of available reports
          </p>
        </div>

        <div className="flex gap-4 items-center">
          <Button
            className="gap-2 shadow-md"
            onClick={() =>
              navigate("/report-management", { state: { openCreate: true } })
            }
          >
            <Plus size={16} />
            Add New Report
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <StatCard title="Monthly Revenue" value="$450,320" color="#3b82f6" />
        <StatCard title="Reports Run This Month" value="32" color="#f59e0b" />
        <StatCard title="Active Users" value="18" color="#10b981" />
        <StatCard title="Compliance Alerts" value="2 Alerts" color="#ef4444" />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT SECTION */}
        <div className="xl:col-span-2 space-y-6">
          {/* Quick Actions */}
          <SectionCard title="Quick Actions">
            <div className="grid md:grid-cols-3 gap-4">
              <ActionTile
                icon={<FileText size={18} />}
                title="Sales Summary"
                subtitle="Last run 3 days ago"
              />
              <ActionTile
                icon={<BarChart3 size={18} />}
                title="Regional Performance"
                subtitle="Last run 2 days ago"
              />
              <ActionTile
                icon={<Users size={18} />}
                title="Staff Productivity"
                subtitle="Last run 1 week ago"
              />
            </div>
          </SectionCard>

          {/* Favorite Reports */}
          <SectionCard title="Favorite Reports">
            <div className="grid md:grid-cols-2 gap-4">
              <ActionTile
                icon={<FileText size={18} />}
                title="Product Sales Drilldown"
                subtitle="Last run 3 days ago"
              />
              <ActionTile
                icon={<BarChart3 size={18} />}
                title="Inventory Analysis"
                subtitle="Last run 1 week ago"
              />
            </div>
          </SectionCard>

          {/* Revenue Trend */}
          <SectionCard title="Revenue Trend">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>

        {/* RIGHT SECTION */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <SectionCard title="Recent Activity">
            <div className="space-y-4">
              <ActivityRow
                icon={<CheckCircle2 size={18} className="text-blue-500" />}
                text="You ran 'Sales Summary - NSW'"
                time="1 hour ago"
              />
              <ActivityRow
                icon={<FileText size={18} className="text-indigo-500" />}
                text="You exported 'Inventory Analysis'"
                time="Yesterday"
              />
              <ActivityRow
                icon={<FileText size={18} className="text-amber-500" />}
                text="New report assigned 'Quarterly Compliance'"
                time=""
              />
            </div>
          </SectionCard>

          {/* System Alerts */}
          <SectionCard title="System Alerts">
            <div className="space-y-4">
              <AlertRow
                icon={<AlertTriangle size={18} />}
                text="Revenue dropped 9% vs last week"
                color="red"
              />
              <AlertRow
                icon={<AlertTriangle size={18} />}
                text="3 failed report exports"
                color="orange"
              />
            </div>
          </SectionCard>

          {/* Reference Trend */}
          <SectionCard title="Reference Trend">
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

/* ================= REUSABLE COMPONENTS ================= */

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-gray-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ActionTile({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white border border-gray-100 rounded-lg hover:shadow-md transition">
      <div className="p-2 bg-gray-100 rounded-md text-gray-600">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function ActivityRow({
  icon,
  text,
  time,
}: {
  icon: React.ReactNode;
  text: string;
  time?: string;
}) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b last:border-0">
      <div className="mt-1">{icon}</div>
      <div className="text-sm text-gray-700">
        <div>{text}</div>
        {time && <div className="text-xs text-gray-400 mt-1">{time}</div>}
      </div>
    </div>
  );
}

function AlertRow({
  icon,
  text,
  color,
}: {
  icon: React.ReactNode;
  text: string;
  color: "red" | "orange";
}) {
  const colorMap = {
    red: "bg-red-50 text-red-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
      <div className={`p-2 rounded-md ${colorMap[color]}`}>{icon}</div>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-5">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold mt-4">{value}</p>

        <div className="h-14 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={miniBars}>
              <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default Dashboard;
