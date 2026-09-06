import { NextRequest, NextResponse } from 'next/server';
import { getDataReader } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const search = searchParams.get('search')?.toLowerCase() || '';
    const pageUrl = searchParams.get('pageUrl') || '';

    const reader = getDataReader();

    // Fetch all conversations (the reader handles pagination internally)
    const result = await reader.getConversations({
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      limit: 10000,
    });

    // Apply search and page_url filter in-memory
    let filtered = result.conversations;

    if (pageUrl) {
      filtered = filtered.filter((conv) => conv.page_url === pageUrl);
    }

    if (search) {
      filtered = filtered.filter((conv) =>
        conv.messages.some(
          (msg) =>
            msg.message_text.toLowerCase().includes(search) ||
            msg.sender.toLowerCase().includes(search)
        ) ||
        conv.page_url.toLowerCase().includes(search) ||
        conv.session_id.toLowerCase().includes(search)
      );
    }

    // Sort by most recent first
    filtered.sort(
      (a, b) => b.started_at.getTime() - a.started_at.getTime()
    );

    // Paginate
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = filtered.slice(start, start + limit);

    // Extract unique page_urls for filter dropdown
    const allPageUrls = [
      ...new Set(result.conversations.map((c) => c.page_url)),
    ].sort();

    // Serialize
    const serialized = {
      conversations: paged.map((conv) => ({
        ...conv,
        started_at: conv.started_at.toISOString(),
        ended_at: conv.ended_at.toISOString(),
        messages: conv.messages.map((msg) => ({
          ...msg,
          timestamp:
            msg.timestamp instanceof Date
              ? msg.timestamp.toISOString()
              : msg.timestamp,
        })),
      })),
      total,
      page,
      limit,
      totalPages,
      pageUrls: allPageUrls,
    };

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
