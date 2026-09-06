import { NextRequest, NextResponse } from 'next/server';
import { getDataReader } from '@/lib/data';
import { getLLMAnalyzer } from '@/lib/analysis';
import { MockAnalyzer } from '@/lib/analysis/llm-analyzer';
import type { AnalysisResult } from '@/lib/analysis/types';

// In-memory cache for the latest analysis result
let cachedInsights: AnalysisResult | null = null;
let isAnalyzing = false;

/**
 * GET /api/insights
 * Returns cached analysis results, or a "not_analyzed" status if no analysis has been run yet.
 * Does NOT auto-trigger LLM analysis — the user must click "Run Analysis" (POST).
 */
export async function GET() {
  try {
    if (cachedInsights) {
      return NextResponse.json({ status: 'ready', data: cachedInsights });
    }

    // On first load, return conversation metadata WITHOUT running LLM
    const reader = getDataReader();
    const { total } = await reader.getConversations({ limit: 1 });

    return NextResponse.json({
      status: 'not_analyzed',
      totalConversations: total,
      message: 'Click "Run Analysis" to analyze conversations with AI.',
    });
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { status: 'error', error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/insights
 * Triggers the LLM analysis pipeline on conversations (with optional date filters).
 * Falls back to MockAnalyzer if the configured LLM provider fails.
 */
export async function POST(request: NextRequest) {
  if (isAnalyzing) {
    return NextResponse.json(
      { status: 'running', message: 'Analysis already in progress...' },
      { status: 409 }
    );
  }

  try {
    isAnalyzing = true;

    const body = await request.json().catch(() => ({}));
    const { dateFrom, dateTo } = body as { dateFrom?: string; dateTo?: string };

    const reader = getDataReader();
    const options: { dateFrom?: Date; dateTo?: Date; limit: number } = { limit: 10000 };
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    const { conversations } = await reader.getConversations(options);

    console.log(`[Analysis] Starting analysis of ${conversations.length} conversations...`);

    let result: AnalysisResult;
    let usedFallback = false;
    const provider = process.env.LLM_PROVIDER?.toUpperCase() || 'MOCK';

    try {
      const analyzer = getLLMAnalyzer();
      result = await analyzer.analyzeConversations(conversations);
    } catch (llmError) {
      // If the configured LLM fails, fall back to MockAnalyzer so the dashboard still works
      const errorMsg = llmError instanceof Error ? llmError.message : String(llmError);
      console.warn(`[Analysis] ${provider} provider failed: ${errorMsg.slice(0, 200)}`);
      console.warn(`[Analysis] Falling back to MockAnalyzer...`);

      const fallback = new MockAnalyzer();
      result = await fallback.analyzeConversations(conversations);
      usedFallback = true;
    }

    cachedInsights = result;
    isAnalyzing = false;

    console.log(`[Analysis] Complete. ${result.pros.length} pros, ${result.cons.length} cons identified.${usedFallback ? ' (used mock fallback)' : ''}`);

    return NextResponse.json({
      status: 'ready',
      data: result,
      ...(usedFallback && {
        warning: `${provider} API call failed (likely quota exceeded). Showing mock analysis results instead. To use real AI analysis, generate a new API key at https://aistudio.google.com/apikey and update GEMINI_API_KEY in .env.local`,
      }),
    });
  } catch (error) {
    isAnalyzing = false;
    console.error('Analysis error:', error);
    return NextResponse.json(
      { status: 'error', error: `Analysis failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}
