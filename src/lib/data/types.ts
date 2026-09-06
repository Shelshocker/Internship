export interface ChatMessage {
  message_id: string;
  session_id: string;
  user_id: string | null;
  timestamp: Date;
  sender: 'user' | 'assistant';
  message_text: string;
  page_url: string;
}

export interface Conversation {
  session_id: string;
  user_id: string | null;
  messages: ChatMessage[];
  page_url: string;
  started_at: Date;
  ended_at: Date;
}

export interface DataReader {
  getConversations(options?: {
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ conversations: Conversation[]; total: number }>;
  
  getConversationById(sessionId: string): Promise<Conversation | null>;
  
  getRawMessages(options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<ChatMessage[]>;
}
