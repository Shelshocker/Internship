import { readFileSync } from 'fs';
import { join } from 'path';
import { ChatMessage, Conversation, DataReader } from './types';

/**
 * CsvDataReader reads chat transcripts from the CSV files in data/chat_messages.csv.
 * This mirrors the target Redshift schema and provides a realistic data ingestion path.
 */
export class CsvDataReader implements DataReader {
  private conversations: Conversation[] | null = null;

  private loadData(): Conversation[] {
    if (this.conversations) return this.conversations;

    const csvPath = join(process.cwd(), 'data', 'chat_messages.csv');
    let csvContent: string;

    try {
      csvContent = readFileSync(csvPath, 'utf-8');
    } catch {
      throw new Error(
        `Could not read CSV file at ${csvPath}. Run "node scripts/generate-mock-data.mjs" first to generate mock data.`
      );
    }

    const lines = csvContent.trim().split('\n');
    // Skip header: message_id,session_id,user_id,timestamp,sender,message_text,page_url
    const messages: ChatMessage[] = [];

    for (let i = 1; i < lines.length; i++) {
      const parsed = parseCsvLine(lines[i]);
      if (!parsed || parsed.length < 7) continue;

      const [messageId, sessionId, userId, timestamp, sender, messageText, pageUrl] = parsed;

      // Filter out trivial single-word greetings
      const trimmed = messageText.trim().toLowerCase();
      if (['hi', 'hello', 'hey', 'thanks', 'bye', 'ok', 'yes', 'no', 'sure'].includes(trimmed)) {
        continue;
      }

      messages.push({
        message_id: messageId,
        session_id: sessionId,
        user_id: userId || null,
        timestamp: new Date(timestamp),
        sender: sender as 'user' | 'assistant',
        message_text: messageText,
        page_url: pageUrl,
      });
    }

    // Group messages by session_id
    const sessionMap = new Map<string, ChatMessage[]>();
    for (const msg of messages) {
      if (!sessionMap.has(msg.session_id)) {
        sessionMap.set(msg.session_id, []);
      }
      sessionMap.get(msg.session_id)!.push(msg);
    }

    // Build Conversation objects
    this.conversations = [];
    for (const [sessionId, msgs] of sessionMap) {
      msgs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

      this.conversations.push({
        session_id: sessionId,
        user_id: msgs[0].user_id,
        messages: msgs,
        page_url: msgs[0].page_url,
        started_at: msgs[0].timestamp,
        ended_at: msgs[msgs.length - 1].timestamp,
      });
    }

    // Sort by start date descending
    this.conversations.sort((a, b) => b.started_at.getTime() - a.started_at.getTime());

    console.log(`[CsvDataReader] Loaded ${this.conversations.length} conversations with ${messages.length} messages from CSV`);

    return this.conversations;
  }

  async getConversations(options?: {
    dateFrom?: Date;
    dateTo?: Date;
    page?: number;
    limit?: number;
  }): Promise<{ conversations: Conversation[]; total: number }> {
    let filtered = this.loadData();

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
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return { conversations: paginated, total };
  }

  async getConversationById(sessionId: string): Promise<Conversation | null> {
    const all = this.loadData();
    return all.find(c => c.session_id === sessionId) || null;
  }

  async getRawMessages(options?: {
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<ChatMessage[]> {
    const all = this.loadData();
    let messages = all.flatMap(c => c.messages);

    if (options?.dateFrom) {
      messages = messages.filter(m => m.timestamp >= options.dateFrom!);
    }
    if (options?.dateTo) {
      messages = messages.filter(m => m.timestamp <= options.dateTo!);
    }

    return messages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
}

/**
 * Parse a CSV line handling quoted fields with commas and escaped quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
  }

  result.push(current);
  return result;
}
