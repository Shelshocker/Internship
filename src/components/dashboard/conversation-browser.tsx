"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  MessageSquare,
  User,
  Bot,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Globe,
  Clock,
  Hash,
  X,
  Filter,
} from "lucide-react";

interface Message {
  message_id: string;
  session_id: string;
  user_id: string | null;
  timestamp: string;
  sender: "user" | "assistant";
  message_text: string;
  page_url: string;
}

interface Conversation {
  session_id: string;
  user_id: string | null;
  messages: Message[];
  page_url: string;
  started_at: string;
  ended_at: string;
}

interface ApiResponse {
  conversations: Conversation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pageUrls: string[];
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-amber-400/30 text-amber-300 rounded-sm px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function ConversationCard({
  conv,
  isExpanded,
  isTargeted,
  onToggle,
  searchQuery,
}: {
  conv: Conversation;
  isExpanded: boolean;
  isTargeted?: boolean;
  onToggle: () => void;
  searchQuery: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const userMsgCount = conv.messages.filter((m) => m.sender === "user").length;
  const assistantMsgCount = conv.messages.length - userMsgCount;
  const firstUserMsg = conv.messages.find((m) => m.sender === "user");
  const duration = Math.round(
    (new Date(conv.ended_at).getTime() - new Date(conv.started_at).getTime()) /
      60000
  );

  // Auto-scroll into view when targeted
  useEffect(() => {
    if (isTargeted && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [isTargeted]);

  return (
    <div
      ref={cardRef}
      className={`glass-card rounded-2xl overflow-hidden transition-all duration-500 ${
        isExpanded ? "ring-1 ring-blue-500/30" : ""
      } ${
        isTargeted
          ? "ring-2 ring-amber-400/50 shadow-lg shadow-amber-400/10 animate-[pulse-glow_2s_ease-in-out_2]"
          : ""
      }`}
    >
      {/* Card Header — clickable */}
      <button
        onClick={onToggle}
        className="w-full text-left p-5 flex items-start gap-4 cursor-pointer group"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquare className="w-5 h-5 text-blue-400" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-white truncate">
              {firstUserMsg
                ? highlightMatch(
                    firstUserMsg.message_text.length > 80
                      ? firstUserMsg.message_text.slice(0, 80) + "…"
                      : firstUserMsg.message_text,
                    searchQuery
                  )
                : "Conversation"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              {conv.page_url}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(conv.started_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {conv.messages.length} msgs
            </span>
            {duration > 0 && (
              <span className="bg-white/5 px-2 py-0.5 rounded-full">
                {duration} min
              </span>
            )}
          </div>
        </div>

        {/* Expand icon */}
        <div className="text-slate-500 group-hover:text-white transition-colors shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Expanded: Chat Transcript */}
      {isExpanded && (
        <div className="border-t border-white/5 animate-[slide-down_0.3s_ease-out]">
          {/* Stats bar */}
          <div className="flex items-center gap-4 px-5 py-3 bg-white/[0.02] text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-blue-400" /> {userMsgCount} user
            </span>
            <span className="flex items-center gap-1">
              <Bot className="w-3 h-3 text-emerald-400" /> {assistantMsgCount}{" "}
              assistant
            </span>
            <span className="ml-auto font-mono text-[10px] text-slate-500/60 select-all">
              {conv.session_id.slice(0, 8)}…
            </span>
          </div>

          {/* Messages */}
          <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto">
            {conv.messages.map((msg, i) => (
              <div
                key={msg.message_id || i}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "" : "flex-row-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-blue-500/15"
                      : "bg-emerald-500/15"
                  }`}
                >
                  {msg.sender === "user" ? (
                    <User className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-blue-500/10 border border-blue-500/20 text-white rounded-tl-sm"
                      : "bg-emerald-500/8 border border-emerald-500/15 text-slate-300 rounded-tr-sm"
                  }`}
                >
                  <div>{highlightMatch(msg.message_text, searchQuery)}</div>
                  <div className="text-[10px] text-slate-500/60 mt-1.5">
                    {new Date(msg.timestamp).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ConversationBrowserProps {
  targetSessionId?: string | null;
  onClearTarget?: () => void;
}

export function ConversationBrowser({ targetSessionId, onClearTarget }: ConversationBrowserProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPage, setSelectedPage] = useState("");
  const [pageUrls, setPageUrls] = useState<string[]>([]);

  // Expanded state
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedPage]);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (selectedPage) params.set("pageUrl", selectedPage);

      const res = await fetch(`/api/conversations?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data: ApiResponse = await res.json();

      setConversations(data.conversations);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      if (data.pageUrls) setPageUrls(data.pageUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedPage]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setExpandedId(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle targetSessionId: search for it and auto-expand
  useEffect(() => {
    if (targetSessionId) {
      setSearchQuery(targetSessionId);
      setSelectedPage("");
      setPage(1);
      setExpandedId(targetSessionId);
    }
  }, [targetSessionId]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Chat Transcripts
          </h2>
          <p className="text-sm text-slate-400">
            Browse and search through {total} customer conversations from CSV data
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 glass-light rounded-xl px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          {total} conversations loaded
        </div>
      </div>

      {/* Target Session Banner */}
      {targetSessionId && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 animate-[fade-in_0.3s_ease-out]">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <p className="text-sm text-amber-300 flex-1">
            Showing chat for session <code className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs">{targetSessionId.slice(0, 12)}…</code>
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setExpandedId(null);
              onClearTarget?.();
            }}
            className="text-xs text-amber-400/70 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search messages, session IDs, pages… (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Page Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="pl-10 pr-8 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white appearance-none focus:border-blue-500/50 transition-all outline-none cursor-pointer"
            >
              <option value="">All Pages</option>
              {pageUrls.map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Active filters chips */}
        {(searchQuery || selectedPage) && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-white/5">
            <span className="text-xs text-slate-500">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-500/15 text-blue-400 px-2.5 py-1 rounded-full">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery("")} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedPage && (
              <span className="inline-flex items-center gap-1 text-xs bg-violet-500/15 text-violet-400 px-2.5 py-1 rounded-full">
                {selectedPage}
                <button onClick={() => setSelectedPage("")} className="hover:text-white cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPage("");
              }}
              className="text-xs text-slate-500 hover:text-white underline ml-2 cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <strong>Error:</strong> {error}
          <button onClick={fetchConversations} className="ml-3 underline hover:text-rose-300 cursor-pointer">
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl skeleton" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 skeleton w-3/4" />
                  <div className="h-3 skeleton w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-2xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No conversations found
          </h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            {searchQuery || selectedPage
              ? "Try adjusting your search or filters"
              : "No chat transcripts have been loaded yet"}
          </p>
        </div>
      ) : (
        <>
          {/* Conversation List */}
          <div className="space-y-3">
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.session_id}
                conv={conv}
                isExpanded={expandedId === conv.session_id}
                isTargeted={targetSessionId === conv.session_id}
                onToggle={() =>
                  setExpandedId(
                    expandedId === conv.session_id ? null : conv.session_id
                  )
                }
                searchQuery={debouncedSearch}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }).map(
                  (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (page <= 4) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = page - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          page === pageNum
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Page info */}
          <p className="text-center text-xs text-slate-500">
            Showing {(page - 1) * 10 + 1}–
            {Math.min(page * 10, total)} of {total} conversations
          </p>
        </>
      )}
    </div>
  );
}
