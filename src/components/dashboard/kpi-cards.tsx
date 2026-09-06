"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MessageSquareText,
  TrendingUp,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

interface KPIData {
  totalConversations: number;
  sentimentScore: number; // -1 to 1
  positivePercent: number;
  negativePercent: number;
  topComplaint: string;
  topPraise: string;
}

function useCountUp(target: number, duration = 1200, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(target * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      }
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, enabled]);

  return value;
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  delay: number;
}

function KPICard({
  title,
  value,
  subtitle,
  icon,
  gradient,
  glowColor,
  delay,
}: KPICardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  return (
    <div
      className={`glass-card rounded-2xl p-6 relative overflow-hidden transition-all duration-500 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-5"
      }`}
      style={{
        boxShadow: visible ? `0 0 40px ${glowColor}` : "none",
      }}
    >
      {/* Gradient accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${gradient}`}
      />

      <div className="flex items-start justify-between mb-4">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div
          className={`p-2 rounded-xl bg-gradient-to-br ${gradient} opacity-80`}
        >
          {icon}
        </div>
      </div>

      <div className="mb-1">
        <span className="text-3xl font-bold text-white tracking-tight">
          {value}
        </span>
      </div>

      {subtitle && (
        <p className="text-sm text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}

export function KPICards({ data }: { data: KPIData | null }) {
  const conversations = useCountUp(data?.totalConversations ?? 0, 1500, !!data);
  const positivePercent = useCountUp(
    data ? Math.round(data.positivePercent) : 0,
    1200,
    !!data
  );

  if (!data) return null;

  const sentimentLabel =
    data.sentimentScore > 0.2
      ? "Mostly Positive"
      : data.sentimentScore < -0.2
      ? "Mostly Negative"
      : "Mixed";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <KPICard
        title="Conversations"
        value={conversations.toLocaleString()}
        subtitle="Total analyzed"
        icon={<MessageSquareText className="w-5 h-5 text-white" />}
        gradient="from-blue-500 to-cyan-400"
        glowColor="rgba(96, 165, 250, 0.08)"
        delay={0}
      />
      <KPICard
        title="Sentiment"
        value={`${positivePercent}% Positive`}
        subtitle={sentimentLabel}
        icon={<TrendingUp className="w-5 h-5 text-white" />}
        gradient="from-emerald-500 to-teal-400"
        glowColor="rgba(52, 211, 153, 0.08)"
        delay={100}
      />
      <KPICard
        title="Top Praise"
        value={data.topPraise}
        subtitle="Most praised aspect"
        icon={<ThumbsUp className="w-5 h-5 text-white" />}
        gradient="from-violet-500 to-purple-400"
        glowColor="rgba(167, 139, 250, 0.08)"
        delay={200}
      />
      <KPICard
        title="Top Complaint"
        value={data.topComplaint}
        subtitle="Most reported issue"
        icon={<ThumbsDown className="w-5 h-5 text-white" />}
        gradient="from-rose-500 to-pink-400"
        glowColor="rgba(251, 113, 133, 0.08)"
        delay={300}
      />
    </div>
  );
}
