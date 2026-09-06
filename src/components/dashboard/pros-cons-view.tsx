"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Quote, ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import { SeverityBadge, ConsumerCountBadge } from "@/components/ui/badge";

interface ProConItemData {
  id: string;
  type: "pro" | "con";
  topic: string;
  description: string;
  category: string;
  consumerCount: number;
  severity: "high" | "medium" | "low";
  quotes: Array<{
    text: string;
    sessionId: string;
    timestamp: string;
  }>;
}

function ProConCard({ item, onViewChat }: { item: ProConItemData; onViewChat?: (sessionId: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isPro = item.type === "pro";

  return (
    <div
      className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
        isPro
          ? "hover:border-emerald-500/30"
          : "hover:border-rose-500/30"
      }`}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                isPro
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {isPro ? (
                <ThumbsUp className="w-4 h-4" />
              ) : (
                <ThumbsDown className="w-4 h-4" />
              )}
            </div>
            <h4 className="font-semibold text-white text-sm leading-tight truncate">
              {item.topic}
            </h4>
          </div>
          <SeverityBadge severity={item.severity} />
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 leading-relaxed mb-4 pl-[42px]">
          {item.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pl-[42px]">
          <div className="flex items-center gap-3">
            <ConsumerCountBadge count={item.consumerCount} />
            <span className="text-xs text-slate-500 px-2 py-1 rounded-full bg-white/5">
              {item.category}
            </span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <Quote className="w-3 h-3" />
            {expanded ? "Hide" : "View"} Quotes ({item.quotes.length})
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Quotes Drawer */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-white/5 bg-white/[0.02] px-5 py-4">
          <div className="space-y-3 pl-[42px]">
            {item.quotes.map((quote, i) => (
              <div
                key={i}
                className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:rounded-full"
                style={{
                  ["--tw-before-bg" as string]: isPro
                    ? "rgba(52, 211, 153, 0.4)"
                    : "rgba(251, 113, 133, 0.4)",
                }}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[2px] rounded-full ${
                    isPro ? "bg-emerald-400/40" : "bg-rose-400/40"
                  }`}
                />
                <p className="text-sm text-slate-300 italic leading-relaxed">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                  Session {quote.sessionId.slice(0, 8)}... •{" "}
                  {new Date(quote.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                  {onViewChat && (
                    <button
                      onClick={() => onViewChat(quote.sessionId)}
                      className={`inline-flex items-center gap-1 font-medium transition-colors cursor-pointer ${
                        isPro
                          ? "text-emerald-400/70 hover:text-emerald-300"
                          : "text-rose-400/70 hover:text-rose-300"
                      }`}
                    >
                      View Chat
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProsConsViewProps {
  pros: ProConItemData[];
  cons: ProConItemData[];
  onViewChat?: (sessionId: string) => void;
}

export function ProsConsView({ pros, cons, onViewChat }: ProsConsViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "pros" | "cons">("all");

  const filteredPros = activeTab === "cons" ? [] : pros;
  const filteredCons = activeTab === "pros" ? [] : cons;

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {(
          [
            { key: "all", label: "All Feedback" },
            { key: "pros", label: `Pros (${pros.length})` },
            { key: "cons", label: `Cons (${cons.length})` },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              activeTab === tab.key
                ? "bg-white/10 text-white shadow-lg shadow-white/5"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pros Column */}
        {filteredPros.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
              <h3 className="text-lg font-semibold gradient-text-emerald">
                Positive Feedback
              </h3>
              <span className="text-xs text-slate-500 ml-auto">
                {filteredPros.length} topics
              </span>
            </div>
            <div className="space-y-4">
              {filteredPros
                .sort((a, b) => b.consumerCount - a.consumerCount)
                .map((item) => (
                  <ProConCard key={item.id} item={item} onViewChat={onViewChat} />
                ))}
            </div>
          </div>
        )}

        {/* Cons Column */}
        {filteredCons.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <h3 className="text-lg font-semibold gradient-text-rose">
                Negative Feedback
              </h3>
              <span className="text-xs text-slate-500 ml-auto">
                {filteredCons.length} topics
              </span>
            </div>
            <div className="space-y-4">
              {filteredCons
                .sort((a, b) => b.consumerCount - a.consumerCount)
                .map((item) => (
                  <ProConCard key={item.id} item={item} onViewChat={onViewChat} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
