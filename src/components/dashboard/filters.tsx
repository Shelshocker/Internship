"use client";

import React from "react";
import {
  Search,
  Calendar,
  Filter,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface FiltersProps {
  dateFrom: string;
  dateTo: string;
  searchQuery: string;
  selectedCategory: string;
  categories: string[];
  isAnalyzing: boolean;
  onDateFromChange: (val: string) => void;
  onDateToChange: (val: string) => void;
  onSearchChange: (val: string) => void;
  onCategoryChange: (val: string) => void;
  onRunAnalysis: () => void;
}

export function Filters({
  dateFrom,
  dateTo,
  searchQuery,
  selectedCategory,
  categories,
  isAnalyzing,
  onDateFromChange,
  onDateToChange,
  onSearchChange,
  onCategoryChange,
  onRunAnalysis,
}: FiltersProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="search-input"
            type="text"
            placeholder="Search topics, quotes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all outline-none"
          />
        </div>

        {/* Date From */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="date-from-input"
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-blue-500/50 transition-all outline-none"
          />
        </div>

        {/* Date To */}
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            id="date-to-input"
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="pl-10 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:border-blue-500/50 transition-all outline-none"
          />
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none focus:border-blue-500/50 transition-all outline-none cursor-pointer"
          >
            <option value="">
              All Categories
            </option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Run Analysis Button */}
        <button
          id="run-analysis-btn"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
            isAnalyzing
              ? "bg-white/5 text-slate-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
          }`}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Run Analysis
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
