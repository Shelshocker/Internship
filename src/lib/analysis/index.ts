import { LLMAnalyzer } from './types';
import { MockAnalyzer, OpenAIAnalyzer, AnthropicAnalyzer, GeminiAnalyzer } from './llm-analyzer';

export function getLLMAnalyzer(): LLMAnalyzer {
  const provider = process.env.LLM_PROVIDER?.toUpperCase() || 'MOCK';
  
  switch (provider) {
    case 'OPENAI':
      return new OpenAIAnalyzer();
    case 'ANTHROPIC':
      return new AnthropicAnalyzer();
    case 'GEMINI':
      return new GeminiAnalyzer();
    case 'MOCK':
    default:
      return new MockAnalyzer();
  }
}

export * from './types';
export * from './prompt-templates';
export * from './llm-analyzer';
export * from './aggregator';
