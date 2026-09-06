import { ChatMessage, Conversation, DataReader } from './types';

export class RedshiftDataReader implements DataReader {
  async getConversations(options?: {
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    throw new Error("Redshift connection not configured. Set REDSHIFT_* environment variables.");
  }
  
  async getConversationById(sessionId: string): Promise<Conversation | null> {
    throw new Error("Redshift connection not configured. Set REDSHIFT_* environment variables.");
  }
  
  async getRawMessages(options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<ChatMessage[]> {
    throw new Error("Redshift connection not configured. Set REDSHIFT_* environment variables.");
  }
}
