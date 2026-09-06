"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

interface CategoryChartProps {
  consBreakdown: CategoryBreakdown[];
  prosBreakdown: CategoryBreakdown[];
}

const CON_COLORS = [
  "#fb7185",
  "#f472b6",
  "#e879f9",
  "#c084fc",
  "#a78bfa",
  "#818cf8",
  "#fb923c",
  "#fbbf24",
];

const PRO_COLORS = [
  "#34d399",
  "#2dd4bf",
  "#22d3ee",
  "#38bdf8",
  "#60a5fa",
  "#818cf8",
  "#a3e635",
  "#4ade80",
];

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryBreakdown; value: number }>;
}) {
  if (!active || !payload?.[0]) return null;
  const data = payload[0].payload;

  return (
    <div className="glass rounded-xl p-3 shadow-2xl border border-white/10">
      <p className="text-sm font-medium text-white mb-1">{data.category}</p>
      <p className="text-xs text-slate-400">
        {data.count} reports ({data.percentage}%)
      </p>
    </div>
  );
}


export function CategoryChart({
  consBreakdown,
  prosBreakdown,
}: CategoryChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const gridStroke = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
  const axisStroke = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)";
  const tickFill = isLight ? "#475569" : "#94a3b8";
  const cursorFill = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Praise Bar Chart */}
      <div className="chart-container">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">
            Praise Categories
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={prosBreakdown}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridStroke}
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke={axisStroke}
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke={axisStroke}
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: cursorFill }} />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              barSize={24}
            >
              {prosBreakdown.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PRO_COLORS[index % PRO_COLORS.length]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Complaints Bar Chart */}
      <div className="chart-container">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-rose-400" />
          <h3 className="text-base font-semibold text-white">
            Complaint Categories
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={consBreakdown}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridStroke}
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke={axisStroke}
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="category"
              stroke={axisStroke}
              tick={{ fill: tickFill, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
            <Tooltip content={<BarTooltip />} cursor={{ fill: cursorFill }} />
            <Bar
              dataKey="count"
              radius={[0, 6, 6, 0]}
              barSize={24}
            >
              {consBreakdown.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CON_COLORS[index % CON_COLORS.length]}
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
