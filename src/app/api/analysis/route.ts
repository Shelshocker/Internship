import { NextRequest, NextResponse } from 'next/server';
import { getDataReader } from '@/lib/data';
import { getLLMAnalyzer } from '@/lib/analysis';
import type { AnalysisResult } from '@/lib/analysis/types';

// In-memory store for the latest analysis result
let latestAnalysis: AnalysisResult | null = null;
let isAnalyzing = false;

export async function POST(request: NextRequest) {
  if (isAnalyzing) {
    return NextResponse.json(
      { error: 'Analysis already in progress', status: 'running' },
      { status: 409 }
    );
  }

  try {
    isAnalyzing = true;

    const body = await request.json().catch(() => ({}));
    const { dateFrom, dateTo } = body as { dateFrom?: string; dateTo?: string };

    const reader = getDataReader();
    const options: { dateFrom?: Date; dateTo?: Date } = {};
    if (dateFrom) options.dateFrom = new Date(dateFrom);
    if (dateTo) options.dateTo = new Date(dateTo);

    // Get all conversations for the date range
    const { conversations } = await reader.getConversations({
      ...options,
      limit: 10000, // Get all for analysis
    });

    // Run LLM analysis
    const analyzer = getLLMAnalyzer();
    const result = await analyzer.analyzeConversations(conversations);

    latestAnalysis = result;
    isAnalyzing = false;

    return NextResponse.json({
      status: 'complete',
      result,
    });
  } catch (error) {
    isAnalyzing = false;
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    isAnalyzing,
    hasResults: !!latestAnalysis,
  });
}

// Export for the insights route to access
export { latestAnalysis };
