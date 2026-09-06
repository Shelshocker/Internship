import { ChatMessage, Conversation, DataReader } from './types';

// Deterministic random number generator for consistent mock data
class Mulberry32 {
  private a: number;
  constructor(seed: number) {
    this.a = seed;
  }
  next(): number {
    let t = this.a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

const rng = new Mulberry32(98765);

function randomInt(min: number, max: number): number {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (rng.next() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const PAGE_URLS = [
  '/admissions', '/pricing', '/courses', '/financial-aid', 
  '/contact', '/apply', '/tuition', '/support'
];

interface Scenario {
  topic: string;
  userMessages: string[];
  assistantMessages: string[];
}

const SCENARIOS: Scenario[] = [
  {
    topic: 'pricing',
    userMessages: [
      "hi, how much is the computer science program?",
      "is that per semester or per year?",
      "are there any hidden fees like lab costs?",
      "wow thats kinda expensive... do u offer scholarships?"
    ],
    assistantMessages: [
      "Hello! The Computer Science program tuition is $12,500 per academic year for in-state students and $24,000 for out-of-state.",
      "That is per academic year (two semesters).",
      "Yes, there is a $250 technology fee and typical lab fees range from $50-$100 per practical course.",
      "We absolutely do! We have merit-based and need-based scholarships. You can apply through our Financial Aid portal."
    ]
  },
  {
    topic: 'broken_link',
    userMessages: [
      "i'm trying to click on the student portal link but its broken",
      "its giving me a 404 error",
      "no im using chrome on my laptop",
      "ok clearing cache worked thanks!"
    ],
    assistantMessages: [
      "I'm sorry to hear that. Could you tell me what error message you are seeing?",
      "Thank you. Are you accessing it from a mobile device or a desktop computer?",
      "I see. Our IT team recently updated the portal. Could you try clearing your browser cache or opening the link in an incognito window?",
      "You're welcome! Let me know if you need any other help."
    ]
  },
  {
    topic: 'course_registration',
    userMessages: [
      "how do I register for classes?",
      "it says I have a hold on my account?",
      "how do I pay the library fine?",
      "ok paid it, can I register now?"
    ],
    assistantMessages: [
      "You can register for classes through the Student Portal under the 'Registration' tab. Registration for Fall opens next Monday.",
      "A hold prevents registration. Usually this is due to an unpaid balance, missing transcripts, or advising requirements. Let me check... it looks like you have a small library fine.",
      "You can pay the fine online through the 'Bursar' section of your Student Portal.",
      "It typically takes 15-30 minutes for the hold to be automatically removed after payment. Then you should be able to register!"
    ]
  },
  {
    topic: 'financial_aid',
    userMessages: [
      "when is the fafsa deadline?",
      "what if i missed the priority deadline?",
      "ok, where do I send my tax transcripts?",
      "thanks for the help"
    ],
    assistantMessages: [
      "The priority deadline for FAFSA submission for the upcoming academic year is March 1st. Have you already started your application?",
      "If you miss the priority deadline, you can still apply, but some state and institutional funds may be depleted. Federal Pell Grants and Direct Loans will still be available.",
      "You can upload your tax transcripts securely through the Financial Aid dashboard in your Student Portal.",
      "You're very welcome! Don't hesitate to reach out if you have more questions."
    ]
  },
  {
    topic: 'admissions_status',
    userMessages: [
      "i applied 3 weeks ago, when will I hear back?",
      "can you check my application status? ID is 94823",
      "oh I forgot to send my SAT scores...",
      "will send them today via collegeboard"
    ],
    assistantMessages: [
      "Undergraduate applications typically take 4-6 weeks to process once all materials are received.",
      "Let me check... Your application (ID 94823) is currently marked 'Incomplete' because we are missing your standardized test scores.",
      "No worries! Once we receive the official scores, your application will be moved to the review queue.",
      "Great! It usually takes 3-5 business days for electronic scores to attach to your file. Keep an eye on your applicant portal."
    ]
  }
];

const GENERIC_STARTERS = [
  "hello", "hi there", "i need help", "question about admissions", "is anyone there?", "help with my account", "quick question"
];

const GENERIC_RESPONSES = [
  "Hello! How can I assist you today?",
  "Hi there! What can I help you find?",
  "I'm here to help! What's your question?"
];

const POSITIVE_CLOSINGS = [
  "thanks a lot!", "very helpful, bye", "perfect thank you", "great service, thanks", "you rock thx"
];

const POSITIVE_CLOSING_RESPONSES = [
  "You're welcome! Have a great day!",
  "Glad I could help. Let me know if you need anything else.",
  "Happy to assist!"
];

const FRUSTRATED_FOLLOWUPS = [
  "that doesn't answer my question", "this bot is useless", "let me talk to a human", "this is so confusing", "not helpful at all"
];

const APOLOGETIC_RESPONSES = [
  "I apologize for the confusion. Let me connect you with a human agent.",
  "I'm sorry I couldn't resolve this. A support representative will email you shortly.",
  "I'm sorry for the frustration. Please call our support line at 555-0199 for immediate assistance."
];

function generateConversations(count: number): Conversation[] {
  const conversations: Conversation[] = [];
  
  const now = new Date('2026-08-05T00:00:00Z');
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  for (let i = 0; i < count; i++) {
    const sessionId = generateId();
    const userId = rng.next() > 0.4 ? `usr_${randomInt(10000, 99999)}` : null;
    const pageUrl = randomItem(PAGE_URLS);
    
    const startTimeMs = randomInt(ninetyDaysAgo.getTime(), now.getTime());
    let currentMessageTime = new Date(startTimeMs);
    
    // Total turns must be at least 3, up to 12
    const numTurns = randomInt(3, 10);
    const messages: ChatMessage[] = [];
    
    const scenario = randomItem(SCENARIOS);
    const useScenario = rng.next() > 0.2; // 80% use scenario, 20% random
    const isNegative = rng.next() > 0.65; // ~35% negative
    
    for (let turn = 0; turn < numTurns; turn++) {
      const isUser = turn % 2 === 0;
      
      let text = "";
      if (isUser) {
        if (turn === 0) {
          text = useScenario ? scenario.userMessages[0] : randomItem(GENERIC_STARTERS);
        } else if (turn >= numTurns - 2) {
          text = isNegative ? randomItem(FRUSTRATED_FOLLOWUPS) : randomItem(POSITIVE_CLOSINGS);
        } else {
          const index = Math.min(Math.floor(turn / 2), scenario.userMessages.length - 1);
          text = useScenario ? scenario.userMessages[index] : "can you explain more?";
        }
      } else {
        if (turn === 1) {
          text = useScenario ? scenario.assistantMessages[0] : randomItem(GENERIC_RESPONSES);
        } else if (turn >= numTurns - 2) {
          text = isNegative ? randomItem(APOLOGETIC_RESPONSES) : randomItem(POSITIVE_CLOSING_RESPONSES);
        } else {
          const index = Math.min(Math.floor(turn / 2), scenario.assistantMessages.length - 1);
          text = useScenario ? scenario.assistantMessages[index] : "I can provide more details if needed.";
        }
      }
      
      messages.push({
        message_id: generateId(),
        session_id: sessionId,
        user_id: userId,
        timestamp: new Date(currentMessageTime.getTime()),
        sender: isUser ? 'user' : 'assistant',
        message_text: text,
        page_url: pageUrl
      });
      
      // Advance time by 15-120 seconds for next message
      currentMessageTime = new Date(currentMessageTime.getTime() + randomInt(15000, 120000));
    }
    
    messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    conversations.push({
      session_id: sessionId,
      user_id: userId,
      messages: messages,
      page_url: pageUrl,
      started_at: messages[0].timestamp,
      ended_at: messages[messages.length - 1].timestamp
    });
  }
  
  // Sort conversations by started_at desc
  conversations.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());
  
  return conversations;
}

const mockConversations = generateConversations(220);

export class MockDataReader implements DataReader {
  async getConversations(options?: {
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    let filtered = mockConversations;
    
    if (options?.dateFrom) {
      filtered = filtered.filter(c => c.started_at >= options.dateFrom!);
    }
    if (options?.dateTo) {
      filtered = filtered.filter(c => c.started_at <= options.dateTo!);
    }
    
    const total = filtered.length;
    
    const page = options?.page || 1;
    const limit = options?.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginated = filtered.slice(startIndex, endIndex);
    
    return {
      conversations: paginated,
      total
    };
  }
  
  async getConversationById(sessionId: string): Promise<Conversation | null> {
    const convo = mockConversations.find(c => c.session_id === sessionId);
    return convo || null;
  }
  
  async getRawMessages(options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<ChatMessage[]> {
    let allMessages = mockConversations.flatMap(c => c.messages);
    
    if (options?.dateFrom) {
      allMessages = allMessages.filter(m => m.timestamp >= options.dateFrom!);
    }
    if (options?.dateTo) {
      allMessages = allMessages.filter(m => m.timestamp <= options.dateTo!);
    }
    
    // Sort by timestamp desc
    allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    return allMessages;
  }
}
