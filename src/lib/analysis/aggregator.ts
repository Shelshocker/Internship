import { AnalysisResult, ProConItem, CustomerWant, CategoryBreakdown } from './types';

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function mergeAnalysisResults(batchResults: Partial<AnalysisResult>[], totalConversations: number): AnalysisResult {
  const mergedPros = new Map<string, ProConItem>();
  const mergedCons = new Map<string, ProConItem>();
  let totalPositive = 0;
  let totalNegative = 0;
  let totalNeutral = 0;
  let totalScore = 0;
  let batchesWithSentiment = 0;

  for (const result of batchResults) {
    if (result.overallSentiment) {
      totalPositive += result.overallSentiment.positive;
      totalNegative += result.overallSentiment.negative;
      totalNeutral += result.overallSentiment.neutral;
      totalScore += result.overallSentiment.score;
      batchesWithSentiment++;
    }

    const processItems = (items: ProConItem[] | undefined, map: Map<string, ProConItem>, type: 'pro' | 'con') => {
      if (!items) return;
      for (const item of items) {
        // Group by category and a simplified topic string to deduplicate
        const key = `${item.category}-${item.topic.toLowerCase().trim()}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.consumerCount += item.consumerCount;
          existing.quotes.push(...item.quotes);
          // Keep highest severity
          if (item.severity === 'high') existing.severity = 'high';
          else if (item.severity === 'medium' && existing.severity === 'low') existing.severity = 'medium';
        } else {
          map.set(key, { ...item, id: `${type}-${generateId()}`, type });
        }
      }
    };

    processItems(result.pros, mergedPros, 'pro');
    processItems(result.cons, mergedCons, 'con');
  }

  const pros = Array.from(mergedPros.values()).sort((a, b) => b.consumerCount - a.consumerCount);
  const cons = Array.from(mergedCons.values()).sort((a, b) => b.consumerCount - a.consumerCount);

  // Calculate category breakdowns
  const getCategoryBreakdown = (items: ProConItem[]): CategoryBreakdown[] => {
    const counts = new Map<string, number>();
    let total = 0;
    for (const item of items) {
      const current = counts.get(item.category) || 0;
      counts.set(item.category, current + item.consumerCount);
      total += item.consumerCount;
    }
    return Array.from(counts.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const avgPositive = batchesWithSentiment > 0 ? totalPositive / batchesWithSentiment : 0;
  const avgNegative = batchesWithSentiment > 0 ? totalNegative / batchesWithSentiment : 0;
  const avgNeutral = batchesWithSentiment > 0 ? totalNeutral / batchesWithSentiment : 0;
  const avgScore = batchesWithSentiment > 0 ? totalScore / batchesWithSentiment : 0;
  
  // Normalize percentages to ensure they sum to 100
  const sum = avgPositive + avgNegative + avgNeutral;
  const normPositive = sum > 0 ? (avgPositive / sum) * 100 : 0;
  const normNegative = sum > 0 ? (avgNegative / sum) * 100 : 0;
  const normNeutral = sum > 0 ? (avgNeutral / sum) * 100 : 0;

  // Merge customerWants across batches
  const wantsMap = new Map<string, CustomerWant>();
  for (const result of batchResults) {
    if (result.customerWants) {
      for (const want of result.customerWants) {
        const key = want.topic.toLowerCase().trim();
        if (wantsMap.has(key)) {
          const existing = wantsMap.get(key)!;
          existing.mentionCount += want.mentionCount;
          existing.exampleQuotes.push(...want.exampleQuotes);
          if (want.priority === 'high') existing.priority = 'high';
          else if (want.priority === 'medium' && existing.priority === 'low') existing.priority = 'medium';
        } else {
          wantsMap.set(key, { ...want });
        }
      }
    }
  }
  const customerWants = Array.from(wantsMap.values())
    .sort((a, b) => b.mentionCount - a.mentionCount)
    .slice(0, 6);

  return {
    id: `analysis-${Date.now()}`,
    analyzedAt: new Date().toISOString(),
    totalConversations,
    overallSentiment: {
      positive: Math.round(normPositive),
      negative: Math.round(normNegative),
      neutral: Math.round(normNeutral),
      score: avgScore
    },
    pros,
    cons,
    customerWants,
    categoryBreakdown: {
      pros: getCategoryBreakdown(pros),
      cons: getCategoryBreakdown(cons)
    },
    topComplaint: cons.length > 0 ? cons[0].topic : 'None found',
    topPraise: pros.length > 0 ? pros[0].topic : 'None found'
  };
}
