import React from "react";

type BadgeVariant = "high" | "medium" | "low" | "pro" | "con" | "neutral" | "count";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
  pro: "bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 text-emerald-400 border border-emerald-500/30",
  con: "bg-gradient-to-r from-rose-500/20 to-rose-400/10 text-rose-400 border border-rose-500/30",
  neutral:
    "bg-gradient-to-r from-slate-500/20 to-slate-400/10 text-slate-300 border border-slate-500/30",
  count:
    "bg-gradient-to-r from-blue-500/20 to-blue-400/10 text-blue-400 border border-blue-500/30",
};

export function Badge({ variant, children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: "high" | "medium" | "low" }) {
  const labels = { high: "High", medium: "Medium", low: "Low" };
  const icons = { high: "🔴", medium: "🟡", low: "🔵" };
  return (
    <Badge variant={severity}>
      <span className="text-[10px]">{icons[severity]}</span>
      {labels[severity]}
    </Badge>
  );
}

export function ConsumerCountBadge({ count }: { count: number }) {
  return (
    <Badge variant="count">
      <svg
        className="w-3 h-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
      {count} user{count !== 1 ? "s" : ""}
    </Badge>
  );
}
