import { LLMAnalyzer, AnalysisResult, ProConItem, CustomerWant } from './types';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BATCH_SIZE, SYSTEM_PROMPT, USER_PROMPT_TEMPLATE, ANALYSIS_JSON_SCHEMA } from './prompt-templates';
import { mergeAnalysisResults } from './aggregator';

export class MockAnalyzer implements LLMAnalyzer {
  async analyzeConversations(conversations: any[]): Promise<AnalysisResult> {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const pros: ProConItem[] = [
      {
        id: 'pro-1', type: 'pro', topic: 'Fast Response Times',
        description: 'Users frequently highlighted the speed of the agent responses.',
        category: 'Response Speed', consumerCount: 42, severity: 'high',
        quotes: [
          { text: "Wow, that was fast! Thank you.", sessionId: 's-101', timestamp: '2026-08-01T10:00:00Z' },
          { text: "I didn't expect to get an answer so quickly, this is great.", sessionId: 's-102', timestamp: '2026-08-02T11:15:00Z' },
          { text: "Appreciate the quick reply, super helpful.", sessionId: 's-103', timestamp: '2026-08-03T09:20:00Z' }
        ]
      },
      {
        id: 'pro-2', type: 'pro', topic: 'Clear Admissions Info',
        description: 'Information regarding the admissions process was found to be very clear.',
        category: 'Admissions Info', consumerCount: 38, severity: 'high',
        quotes: [
          { text: "Thanks, the admission steps are very clear now.", sessionId: 's-104', timestamp: '2026-08-04T14:30:00Z' },
          { text: "That perfectly explains what documents I need to submit.", sessionId: 's-105', timestamp: '2026-08-05T12:00:00Z' },
          { text: "Very informative regarding the deadlines.", sessionId: 's-106', timestamp: '2026-08-05T15:45:00Z' }
        ]
      },
      {
        id: 'pro-3', type: 'pro', topic: 'Helpful Course Guidance',
        description: 'Users appreciated the recommendations on course selections.',
        category: 'Course Guidance', consumerCount: 29, severity: 'medium',
        quotes: [
          { text: "These electives look exactly like what I wanted to study.", sessionId: 's-107', timestamp: '2026-08-01T16:20:00Z' },
          { text: "Thanks for helping me map out my semester.", sessionId: 's-108', timestamp: '2026-08-02T08:10:00Z' },
          { text: "Good suggestions for prerequisites.", sessionId: 's-109', timestamp: '2026-08-03T11:55:00Z' }
        ]
      },
      {
        id: 'pro-4', type: 'pro', topic: 'Effective Financial Aid Help',
        description: 'The financial aid breakdown provided by the bot was highly valued.',
        category: 'Financial Aid Help', consumerCount: 25, severity: 'high',
        quotes: [
          { text: "This clears up a lot of my confusion about scholarships.", sessionId: 's-110', timestamp: '2026-08-03T14:15:00Z' },
          { text: "I understand the FAFSA requirements much better now.", sessionId: 's-111', timestamp: '2026-08-04T09:30:00Z' },
          { text: "Thank you for the detailed grant info.", sessionId: 's-112', timestamp: '2026-08-04T10:45:00Z' }
        ]
      }
    ];

    const cons: ProConItem[] = [
      {
        id: 'con-1', type: 'con', topic: 'Pricing Confusion',
        description: 'Users are confused about the hidden fees in the tuition breakdown.',
        category: 'Pricing Confusion', consumerCount: 45, severity: 'high',
        quotes: [
          { text: "Why is the technology fee not included in the main tuition quote?", sessionId: 's-201', timestamp: '2026-08-01T11:00:00Z' },
          { text: "This pricing makes no sense, I see two different numbers.", sessionId: 's-202', timestamp: '2026-08-02T12:30:00Z' },
          { text: "I can't figure out how much the lab fees are from this.", sessionId: 's-203', timestamp: '2026-08-03T10:45:00Z' }
        ]
      },
      {
        id: 'con-2', type: 'con', topic: 'Broken Links Provided',
        description: 'The bot frequently provided 404 links for the housing portal.',
        category: 'Technical Bug', consumerCount: 32, severity: 'high',
        quotes: [
          { text: "That link you sent for housing gives me a 404 error.", sessionId: 's-204', timestamp: '2026-08-02T09:15:00Z' },
          { text: "I clicked the dorm application and the page is broken.", sessionId: 's-205', timestamp: '2026-08-03T13:20:00Z' },
          { text: "Can you give me a working link to the residence halls?", sessionId: 's-206', timestamp: '2026-08-05T11:10:00Z' }
        ]
      },
      {
        id: 'con-3', type: 'con', topic: 'Repetitive Answers',
        description: 'The bot kept repeating the same answer for nuanced questions.',
        category: 'Content Quality', consumerCount: 27, severity: 'medium',
        quotes: [
          { text: "You just said that. I need more specific details.", sessionId: 's-213', timestamp: '2026-08-03T09:40:00Z' },
          { text: "Stop giving me the same canned response.", sessionId: 's-214', timestamp: '2026-08-04T15:20:00Z' },
          { text: "I read that already, can I talk to a human?", sessionId: 's-215', timestamp: '2026-08-05T16:05:00Z' }
        ]
      },
      {
        id: 'con-4', type: 'con', topic: 'Missing Alumni Information',
        description: 'Users could not get answers about alumni networking events.',
        category: 'Missing Information', consumerCount: 22, severity: 'medium',
        quotes: [
          { text: "You didn't answer my question about the alumni meetup.", sessionId: 's-207', timestamp: '2026-08-01T14:40:00Z' },
          { text: "I need details on the alumni network, not just a generic link.", sessionId: 's-208', timestamp: '2026-08-04T08:55:00Z' },
          { text: "Is there no information available for past graduates?", sessionId: 's-209', timestamp: '2026-08-05T10:30:00Z' }
        ]
      }
    ];

    const customerWants: CustomerWant[] = [
      {
        topic: 'Real-Time Application Status',
        description: 'Applicants want to check their admission application status directly through the chatbot.',
        mentionCount: 22,
        priority: 'high',
        category: 'Admissions',
        exampleQuotes: [
          'Can you tell me where my application is in the review process?',
          'I submitted my documents 2 weeks ago, any updates?',
          'How do I track my admission decision?'
        ]
      },
      {
        topic: 'Detailed Scholarship Comparison',
        description: 'Students want a side-by-side comparison of available scholarships with eligibility criteria.',
        mentionCount: 18,
        priority: 'medium',
        category: 'Financial Aid',
        exampleQuotes: [
          'Which scholarships am I eligible for with a 3.5 GPA?',
          'Can you compare the merit vs. need-based scholarships?',
          'I want a list of all scholarships sorted by deadline.'
        ]
      },
      {
        topic: 'Virtual Campus Tour Booking',
        description: 'Prospective students want to schedule virtual or in-person campus tours through the chat.',
        mentionCount: 15,
        priority: 'medium',
        category: 'Campus Life',
        exampleQuotes: [
          'Can I book a campus tour for next Saturday?',
          'Do you offer virtual tours? I live out of state.',
          'I want to visit the engineering building specifically.'
        ]
      },
      {
        topic: 'Course Prerequisite Checker',
        description: 'Students want to verify if they meet prerequisites for specific courses before enrolling.',
        mentionCount: 14,
        priority: 'medium',
        category: 'Academics',
        exampleQuotes: [
          'Can I take Data Structures without Intro to CS?',
          'What are the prereqs for Organic Chemistry?',
          'Am I eligible to register for this 400-level course?'
        ]
      },
      {
        topic: 'Payment Plan Calculator',
        description: 'Families want a tool to estimate monthly payment plans for tuition and fees.',
        mentionCount: 11,
        priority: 'low',
        category: 'Financial Aid',
        exampleQuotes: [
          'Can you break down the tuition into monthly payments?',
          'What would my payment be if I use a 10-month plan?',
          'Do you have an installment option for room and board?'
        ]
      }
    ];

    const categoryBreakdown = {
      pros: [
        { category: 'Response Speed', count: 42, percentage: 31 },
        { category: 'Admissions Info', count: 38, percentage: 28 },
        { category: 'Course Guidance', count: 29, percentage: 22 },
        { category: 'Financial Aid Help', count: 25, percentage: 19 }
      ],
      cons: [
        { category: 'Pricing Confusion', count: 45, percentage: 36 },
        { category: 'Technical Bug', count: 32, percentage: 25 },
        { category: 'Content Quality', count: 27, percentage: 21 },
        { category: 'Missing Information', count: 22, percentage: 18 }
      ]
    };

    return {
      id: 'mock-analysis-123',
      analyzedAt: new Date().toISOString(),
      totalConversations: conversations.length || 1000,
      overallSentiment: {
        positive: 58,
        negative: 30,
        neutral: 12,
        score: 0.28
      },
      pros,
      cons,
      customerWants,
      categoryBreakdown,
      topComplaint: 'Pricing Confusion',
      topPraise: 'Fast Responses'
    };
  }
}

export class OpenAIAnalyzer implements LLMAnalyzer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async analyzeConversations(conversations: any[]): Promise<AnalysisResult> {
    const batches = [];
    for (let i = 0; i < conversations.length; i += BATCH_SIZE) {
      batches.push(conversations.slice(i, i + BATCH_SIZE));
    }

    const batchResults = await Promise.all(batches.map(async (batch) => {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: USER_PROMPT_TEMPLATE(JSON.stringify(batch)) }
        ]
      });
      const resultText = completion.choices[0]?.message?.content || '{}';
      return JSON.parse(resultText) as Partial<AnalysisResult>;
    }));

    return mergeAnalysisResults(batchResults, conversations.length);
  }
}

export class AnthropicAnalyzer implements LLMAnalyzer {
  private anthropic: Anthropic;

  constructor() {
    this.anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async analyzeConversations(conversations: any[]): Promise<AnalysisResult> {
    const batches = [];
    for (let i = 0; i < conversations.length; i += BATCH_SIZE) {
      batches.push(conversations.slice(i, i + BATCH_SIZE));
    }

    const batchResults = await Promise.all(batches.map(async (batch) => {
      const msg = await this.anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 4096,
        system: SYSTEM_PROMPT + `\n\nEnsure the response strictly adheres to this JSON schema: ${JSON.stringify(ANALYSIS_JSON_SCHEMA)}`,
        messages: [
          { role: "user", content: USER_PROMPT_TEMPLATE(JSON.stringify(batch)) }
        ]
      });
      const resultText = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
      return JSON.parse(resultText) as Partial<AnalysisResult>;
    }));

    return mergeAnalysisResults(batchResults, conversations.length);
  }
}

export class GeminiAnalyzer implements LLMAnalyzer {
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async analyzeConversations(conversations: import('../data/types').Conversation[]): Promise<AnalysisResult> {
    const batches: import('../data/types').Conversation[][] = [];
    for (let i = 0; i < conversations.length; i += BATCH_SIZE) {
      batches.push(conversations.slice(i, i + BATCH_SIZE));
    }

    const model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
      systemInstruction: SYSTEM_PROMPT + `\n\nYour response must strictly follow this JSON schema:\n${JSON.stringify(ANALYSIS_JSON_SCHEMA, null, 2)}`,
    });

    // Process batches SEQUENTIALLY with retry to avoid rate limits
    const batchResults: Partial<AnalysisResult>[] = [];

    for (let bIdx = 0; bIdx < batches.length; bIdx++) {
      const batch = batches[bIdx];
      console.log(`[Gemini] Processing batch ${bIdx + 1}/${batches.length} (${batch.length} conversations)...`);

      // Compact serialization: only user messages + page context, no timestamps, no pretty-print
      const serialized = batch.map(conv => ({
        id: conv.session_id,
        page: conv.page_url,
        msgs: conv.messages.map(m => `${m.sender === 'user' ? 'U' : 'A'}: ${m.message_text}`),
      }));

      const prompt = USER_PROMPT_TEMPLATE(JSON.stringify(serialized));

      // Retry with exponential backoff
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();
          const parsed = JSON.parse(responseText) as Partial<AnalysisResult>;
          batchResults.push(parsed);
          lastError = null;
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error(String(err));
          const isRateLimit = lastError.message.includes('429') || lastError.message.includes('quota');
          const delay = isRateLimit ? (attempt + 1) * 15000 : (attempt + 1) * 3000;
          console.warn(`[Gemini] Batch ${bIdx + 1} attempt ${attempt + 1} failed: ${lastError.message.slice(0, 100)}. Retrying in ${delay / 1000}s...`);
          await new Promise(r => setTimeout(r, delay));
        }
      }

      if (lastError) {
        console.error(`[Gemini] Batch ${bIdx + 1} failed after 3 attempts. Skipping.`);
        // Continue with remaining batches instead of failing entirely
      }

      // Delay between batches to respect rate limits (2s for free tier)
      if (bIdx < batches.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    if (batchResults.length === 0) {
      throw new Error('All Gemini API calls failed. Check your API key and quota at https://ai.dev/rate-limit');
    }

    console.log(`[Gemini] Analysis complete. ${batchResults.length}/${batches.length} batches succeeded.`);
    return mergeAnalysisResults(batchResults, conversations.length);
  }
}

