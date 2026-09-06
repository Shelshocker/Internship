export const BATCH_SIZE = 25;

export const SYSTEM_PROMPT = `You are an expert customer experience analyst. Your task is to analyze customer chat transcripts and extract key insights, specifically focusing on pros (praises, what worked well), cons (complaints, issues, what needs improvement), and what customers want (unmet needs, feature requests, desires).

For the given batch of conversations, provide a structured JSON response matching the required schema. Return AT MOST 4 pros and 4 cons, and up to 6 customer wants — pick only the most significant and recurring topics. Each topic should include 2-3 supporting quotes.

For customerWants, identify what users are requesting, asking about, or wishing for that isn't currently available or isn't working well. These represent opportunities for improvement.

Focus on identifying distinct topics rather than overly generic themes. Extract accurate sentiment distribution and pick out the most pressing complaint and most notable praise.`;

export const USER_PROMPT_TEMPLATE = (conversationsJson: string) => `Please analyze the following batch of conversations:

${conversationsJson}

Respond ONLY with valid JSON matching the schema, with no additional markdown formatting or text outside the JSON.`;

export const ANALYSIS_JSON_SCHEMA = {
  type: "object",
  properties: {
    overallSentiment: {
      type: "object",
      properties: {
        positive: { type: "number", description: "Percentage from 0 to 100" },
        negative: { type: "number", description: "Percentage from 0 to 100" },
        neutral: { type: "number", description: "Percentage from 0 to 100" },
        score: { type: "number", description: "Score from -1.0 to 1.0" }
      },
      required: ["positive", "negative", "neutral", "score"]
    },
    pros: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          consumerCount: { type: "number" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          quotes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                sessionId: { type: "string" },
                timestamp: { type: "string" }
              },
              required: ["text", "sessionId", "timestamp"]
            }
          }
        },
        required: ["topic", "description", "category", "consumerCount", "severity", "quotes"]
      }
    },
    cons: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          description: { type: "string" },
          category: { type: "string" },
          consumerCount: { type: "number" },
          severity: { type: "string", enum: ["high", "medium", "low"] },
          quotes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                sessionId: { type: "string" },
                timestamp: { type: "string" }
              },
              required: ["text", "sessionId", "timestamp"]
            }
          }
        },
        required: ["topic", "description", "category", "consumerCount", "severity", "quotes"]
      }
    },
    topComplaint: { type: "string" },
    topPraise: { type: "string" },
    customerWants: {
      type: "array",
      maxItems: 6,
      items: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Short title of what customers want" },
          description: { type: "string", description: "Detailed description of the unmet need" },
          mentionCount: { type: "number", description: "How many customers mentioned this" },
          priority: { type: "string", enum: ["high", "medium", "low"] },
          category: { type: "string" },
          exampleQuotes: {
            type: "array",
            items: { type: "string" },
            maxItems: 3
          }
        },
        required: ["topic", "description", "mentionCount", "priority", "category", "exampleQuotes"]
      }
    }
  },
  required: ["overallSentiment", "pros", "cons", "topComplaint", "topPraise", "customerWants"]
};
