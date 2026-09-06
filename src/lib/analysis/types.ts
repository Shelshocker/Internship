export type Severity = 'high' | 'medium' | 'low';
export type SentimentLabel = 'positive' | 'negative' | 'neutral' | 'mixed';

export interface ProConItem {
  id: string;
  type: 'pro' | 'con';
  topic: string;
  description: string;
  category: string; // e.g., "UI Issue", "Pricing", "Admissions", "Technical Bug", "Content Quality", "Response Speed"
  consumerCount: number;
  severity: Severity; // For cons: how bad. For pros: impact level
  quotes: Array<{
    text: string;
    sessionId: string;
    timestamp: string;
  }>;
}

export interface CustomerWant {
  topic: string;
  description: string;
  mentionCount: number;
  priority: 'high' | 'medium' | 'low';
  category: string;
  exampleQuotes: string[];
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

export interface AnalysisResult {
  id: string;
  analyzedAt: string; // ISO datetime
  totalConversations: number;
  overallSentiment: {
    positive: number; // percentage
    negative: number;
    neutral: number;
    score: number; // -1 to 1
  };
  pros: ProConItem[];
  cons: ProConItem[];
  customerWants: CustomerWant[];
  categoryBreakdown: {
    pros: CategoryBreakdown[];
    cons: CategoryBreakdown[];
  };
  topComplaint: string;
  topPraise: string;
}

export interface LLMAnalyzer {
  analyzeConversations(conversations: import('../data/types').Conversation[]): Promise<AnalysisResult>;
}
