"use client";

import React, { useState } from "react";
import { Lightbulb, ChevronDown, ChevronUp, Users, Quote } from "lucide-react";

interface CustomerWant {
  topic: string;
  description: string;
  mentionCount: number;
  priority: "high" | "medium" | "low";
  category: string;
  exampleQuotes: string[];
}

interface CustomerWantsProps {
  data: CustomerWant[];
}

const priorityConfig = {
  high: {
    label: "High Priority",
    barColor: "bg-gradient-to-r from-rose-500 to-pink-400",
    dotColor: "bg-rose-400",
    textColor: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/25",
  },
  medium: {
    label: "Medium",
    barColor: "bg-gradient-to-r from-amber-500 to-orange-400",
    dotColor: "bg-amber-400",
    textColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/25",
  },
  low: {
    label: "Low",
    barColor: "bg-gradient-to-r from-blue-500 to-cyan-400",
    dotColor: "bg-blue-400",
    textColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/25",
  },
};

function WantCard({ want, maxMentions }: { want: CustomerWant; maxMentions: number }) {
  const [showQuotes, setShowQuotes] = useState(false);
  const config = priorityConfig[want.priority];
  const barWidth = Math.max(8, (want.mentionCount / maxMentions) * 100);

  return (
    <div className="glass-card rounded-xl p-5 group">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <div className={`w-2 h-2 rounded-full shrink-0 ${config.dotColor}`} />
            <h4 className="text-sm font-semibold text-white truncate">
              {want.topic}
            </h4>
            <span
              className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.bgColor} ${config.borderColor} ${config.textColor}`}
            >
              {config.label}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-4">
            {want.description}
          </p>
        </div>
      </div>

      {/* Mention Bar */}
      <div className="pl-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full ${config.barColor} transition-all duration-700 ease-out`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
            <Users className="w-3 h-3" />
            {want.mentionCount}
          </span>
        </div>
      </div>

      {/* Category + Quotes Toggle */}
      <div className="flex items-center justify-between pl-4">
        <span className="text-[10px] text-slate-500 px-2 py-0.5 rounded-full bg-white/5 uppercase tracking-wider font-medium">
          {want.category}
        </span>
        {want.exampleQuotes.length > 0 && (
          <button
            onClick={() => setShowQuotes(!showQuotes)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Quote className="w-3 h-3" />
            {showQuotes ? "Hide" : "Show"} quotes
            {showQuotes ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Expandable Quotes */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showQuotes ? "max-h-[400px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/5 pt-3 pl-4 space-y-2">
          {want.exampleQuotes.map((quote, i) => (
            <div
              key={i}
              className="relative pl-3 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[2px] before:rounded-full before:bg-violet-400/40"
            >
              <p className="text-xs text-slate-300 italic leading-relaxed">
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomerWantsSection({ data }: CustomerWantsProps) {
  const maxMentions = Math.max(...data.map((d) => d.mentionCount), 1);

  return (
    <div className="chart-container">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h3 className="text-base font-semibold text-white">
          What Customers Want
        </h3>
        <span className="text-xs text-slate-500 ml-auto">
          {data.length} unmet needs identified
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.map((want, i) => (
          <WantCard key={i} want={want} maxMentions={maxMentions} />
        ))}
      </div>

      {data.length === 0 && (
        <div className="text-center py-8">
          <Lightbulb className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">
            No customer wants identified yet. Run an analysis to discover unmet needs.
          </p>
        </div>
      )}
    </div>
  );
}
