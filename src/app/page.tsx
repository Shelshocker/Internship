"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Brain,
  LayoutDashboard,
  MessageSquare,
  Activity,
  Sparkles,
  FileText,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { ProsConsView } from "@/components/dashboard/pros-cons-view";
import { CustomerWantsSection } from "@/components/dashboard/customer-wants";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { Filters } from "@/components/dashboard/filters";
import { DashboardSkeleton } from "@/components/ui/skeleton";
import { ConversationBrowser } from "@/components/dashboard/conversation-browser";
import { PasswordGate } from "@/components/password-gate";

type TabId = "dashboard" | "conversations";

interface AnalysisData {
  id: string;
  analyzedAt: string;
  totalConversations: number;
  overallSentiment: {
    positive: number;
    negative: number;
    neutral: number;
    score: number;
  };
  pros: Array<{
    id: string;
    type: "pro" | "con";
    topic: string;
    description: string;
    category: string;
    consumerCount: number;
    severity: "high" | "medium" | "low";
    quotes: Array<{ text: string; sessionId: string; timestamp: string }>;
  }>;
  cons: Array<{
    id: string;
    type: "pro" | "con";
    topic: string;
    description: string;
    category: string;
    consumerCount: number;
    severity: "high" | "medium" | "low";
    quotes: Array<{ text: string; sessionId: string; timestamp: string }>;
  }>;
  customerWants: Array<{
    topic: string;
    description: string;
    mentionCount: number;
    priority: "high" | "medium" | "low";
    category: string;
    exampleQuotes: string[];
  }>;
  categoryBreakdown: {
    pros: Array<{ category: string; count: number; percentage: number }>;
    cons: Array<{ category: string; count: number; percentage: number }>;
  };
  topComplaint: string;
  topPraise: string;
}

export default function DashboardPage() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [targetSessionId, setTargetSessionId] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [totalConversations, setTotalConversations] = useState(0);
  const [needsAnalysis, setNeedsAnalysis] = useState(false);

  // Navigate to a specific chat from a quote
  const handleViewChat = useCallback((sessionId: string) => {
    setTargetSessionId(sessionId);
    setActiveTab("conversations");
  }, []);

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Fetch insights on mount
  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setWarning(null);
      const res = await fetch("/api/insights");
      if (!res.ok) throw new Error("Failed to fetch insights");
      const json = await res.json();

      if (json.status === "ready" && json.data) {
        setData(json.data);
        setTotalConversations(json.data.totalConversations);
        setNeedsAnalysis(false);
        if (json.warning) setWarning(json.warning);
      } else if (json.status === "not_analyzed") {
        setData(null);
        setTotalConversations(json.totalConversations || 0);
        setNeedsAnalysis(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Run Analysis handler
  const handleRunAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setWarning(null);

      const body: Record<string, string> = {};
      if (dateFrom) body.dateFrom = dateFrom;
      if (dateTo) body.dateTo = dateTo;

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Analysis failed");
      }

      if (json.status === "ready" && json.data) {
        setData(json.data);
        setTotalConversations(json.data.totalConversations);
        setNeedsAnalysis(false);
        if (json.warning) setWarning(json.warning);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Extract unique categories from pros and cons
  const categories = useMemo(() => {
    if (!data) return [];
    const cats = new Set<string>();
    [...data.pros, ...data.cons].forEach((item) => cats.add(item.category));
    return Array.from(cats).sort();
  }, [data]);

  // Filtered pros & cons
  const filteredPros = useMemo(() => {
    if (!data) return [];
    return data.pros.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.topic.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.quotes.some((q) => q.text.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [data, selectedCategory, searchQuery]);

  const filteredCons = useMemo(() => {
    if (!data) return [];
    return data.cons.filter((item) => {
      if (selectedCategory && item.category !== selectedCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.topic.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query) ||
          item.quotes.some((q) => q.text.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [data, selectedCategory, searchQuery]);

  return (
    <PasswordGate>
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[72px] glass flex flex-col items-center py-6 z-50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
          <Brain className="w-5 h-5 text-white" />
        </div>

        <nav className="flex flex-col items-center gap-4 flex-1">
          <SidebarIcon icon={<LayoutDashboard className="w-5 h-5" />} active={activeTab === "dashboard"} label="Dashboard" onClick={() => setActiveTab("dashboard")} />
          <SidebarIcon icon={<MessageSquare className="w-5 h-5" />} active={activeTab === "conversations"} label="Conversations" onClick={() => setActiveTab("conversations")} />
        </nav>

        <div className="mt-auto flex flex-col items-center gap-4">
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
            AI
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-[72px] p-6 lg:p-8">
        {activeTab === "conversations" ? (
          <div className="animate-[fade-in_0.3s_ease-out]">
            <ConversationBrowser
              targetSessionId={targetSessionId}
              onClearTarget={() => setTargetSessionId(null)}
            />
          </div>
        ) : (
        <>
        {/* Header */}
        <header className="mb-8 animate-[fade-in_0.5s_ease-out]">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 tracking-tight">
                Customer Insights Dashboard
              </h1>
              <p className="text-sm text-slate-400 max-w-xl">
                AI-powered analysis of customer chat conversations. Extract
                actionable insights, sentiment trends, and product feedback
                from your support interactions.
              </p>
            </div>

            {data && (
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 glass-light rounded-xl px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Last analyzed:{" "}
                {new Date(data.analyzedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            )}
          </div>
        </header>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm animate-[scale-in_0.3s_ease-out]">
            <strong>Error:</strong> {error}
            <button
              onClick={fetchInsights}
              className="ml-3 underline hover:text-rose-300 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Warning Banner (shown when LLM falls back to mock) */}
        {warning && !error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm animate-[scale-in_0.3s_ease-out]">
            <strong>⚠ Note:</strong> {warning}
            <button
              onClick={() => setWarning(null)}
              className="ml-3 text-amber-500/60 hover:text-amber-300 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 animate-[slide-up_0.5s_ease-out]" style={{ animationDelay: "0.1s", animationFillMode: "both" }}>
          <Filters
            dateFrom={dateFrom}
            dateTo={dateTo}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            categories={categories}
            isAnalyzing={isAnalyzing}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onSearchChange={setSearchQuery}
            onCategoryChange={setSelectedCategory}
            onRunAnalysis={handleRunAnalysis}
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <DashboardSkeleton />
        ) : isAnalyzing ? (
          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-8 text-center animate-[fade-in_0.3s_ease-out]">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 mb-4">
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Analyzing {totalConversations} Conversations...
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                AI is reading through your chat transcripts, extracting sentiment, 
                identifying recurring themes, and categorizing feedback. This may take a minute.
              </p>
              <div className="w-64 h-2 bg-white/5 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full animate-[shimmer_1.5s_ease-in-out_infinite]" style={{ width: "60%" }} />
              </div>
            </div>
            <DashboardSkeleton />
          </div>
        ) : needsAnalysis && !data ? (
          /* Welcome / No Analysis Yet State */
          <div className="flex items-center justify-center min-h-[60vh] animate-[fade-in_0.5s_ease-out]">
            <div className="glass-card rounded-2xl p-12 text-center max-w-lg">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 mb-6">
                <FileText className="w-10 h-10 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Ready to Analyze
              </h2>
              <p className="text-slate-400 mb-2 text-lg">
                <span className="text-white font-semibold">{totalConversations}</span> chat transcripts loaded from CSV
              </p>
              <p className="text-sm text-slate-500 mb-8 max-w-sm mx-auto">
                Click the button below to run AI analysis on your customer conversations. 
                The LLM will extract pros, cons, sentiment trends, and actionable insights.
              </p>
              <button
                onClick={handleRunAnalysis}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer"
              >
                <Sparkles className="w-5 h-5" />
                Run AI Analysis
              </button>
            </div>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="animate-[slide-up_0.5s_ease-out]" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
              <KPICards
                data={{
                  totalConversations: data.totalConversations,
                  sentimentScore: data.overallSentiment.score,
                  positivePercent: data.overallSentiment.positive,
                  negativePercent: data.overallSentiment.negative,
                  topComplaint: data.topComplaint,
                  topPraise: data.topPraise,
                }}
              />
            </div>

            {/* Customer Wants */}
            {data.customerWants && data.customerWants.length > 0 && (
              <div className="animate-[slide-up_0.5s_ease-out]" style={{ animationDelay: "0.3s", animationFillMode: "both" }}>
                <CustomerWantsSection data={data.customerWants} />
              </div>
            )}

            {/* Category Charts */}
            <div className="animate-[slide-up_0.5s_ease-out]" style={{ animationDelay: "0.4s", animationFillMode: "both" }}>
              <CategoryChart
                consBreakdown={data.categoryBreakdown?.cons || []}
                prosBreakdown={data.categoryBreakdown?.pros || []}
              />
            </div>

            {/* Pros/Cons Section */}
            <div className="animate-[slide-up_0.5s_ease-out]" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-xl font-bold text-white">
                  Detailed Feedback Analysis
                </h2>
                <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">
                  {filteredPros.length + filteredCons.length} topics
                </span>
              </div>
              <ProsConsView pros={filteredPros} cons={filteredCons} onViewChat={handleViewChat} />
            </div>
          </div>
        ) : null}
      </>
        )}
      </main>
    </div>
    </PasswordGate>
  );
}

function SidebarIcon({
  icon,
  active,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  active?: boolean;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer ${
        active
          ? "bg-white/10 text-white shadow-lg shadow-white/5"
          : "text-slate-500 hover:text-white hover:bg-white/5"
      }`}
    >
      {icon}
    </button>
  );
}
