"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

interface SentimentTrendPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
}

interface SentimentChartProps {
  data: SentimentTrendPoint[];
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload) return null;

  return (
    <div className="glass rounded-xl p-4 shadow-2xl border border-white/10 min-w-[180px]">
      <p className="text-xs text-slate-400 mb-2 font-medium">
        {label
          ? new Date(label).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : ""}
      </p>
      <div className="space-y-1.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-slate-300 capitalize">
                {entry.name}
              </span>
            </div>
            <span className="text-xs font-semibold text-white">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentimentChart({ data }: SentimentChartProps) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  const gridStroke = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.05)";
  const axisStroke = isLight ? "rgba(0,0,0,0.12)" : "rgba(255,255,255,0.2)";
  const tickFill = isLight ? "#475569" : "#94a3b8";

  return (
    <div className="chart-container">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <h3 className="text-base font-semibold text-white">
          Sentiment Trend
        </h3>
        <span className="text-xs text-slate-500 ml-auto">
          Last 90 days
        </span>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#34d399" stopOpacity={isLight ? 0.2 : 0.3} />
              <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={isLight ? 0.2 : 0.3} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="neutralGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#60a5fa" stopOpacity={isLight ? 0.15 : 0.2} />
              <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
          <XAxis
            dataKey="date"
            stroke={axisStroke}
            tick={{ fill: tickFill, fontSize: 11 }}
            tickFormatter={(val) =>
              new Date(val).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={axisStroke}
            tick={{ fill: tickFill, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            formatter={(value: string) => (
              <span className="text-xs text-slate-400 capitalize">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="positive"
            stroke="#34d399"
            strokeWidth={2}
            fill="url(#positiveGradient)"
            name="positive"
          />
          <Area
            type="monotone"
            dataKey="negative"
            stroke="#fb7185"
            strokeWidth={2}
            fill="url(#negativeGradient)"
            name="negative"
          />
          <Area
            type="monotone"
            dataKey="neutral"
            stroke="#60a5fa"
            strokeWidth={2}
            fill="url(#neutralGradient)"
            name="neutral"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
