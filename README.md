# 🧠 Customer AI Chat Analytics Dashboard

An AI-powered analytics platform that ingests customer chat transcripts from an on-site "Ask AI" assistant and extracts actionable insights — recurring praise, complaints, customer wants, and product feedback — displayed on an interactive executive dashboard.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss)

---

## ✨ Features

- **Pro/Con Extraction** — AI identifies top praises and complaints from chat transcripts, with supporting customer quotes
- **Customer Wants** — Surfaces unmet needs and feature requests with priority ranking
- **Category Breakdown** — Bar charts showing complaint and praise distribution by category
- **KPI Cards** — Animated cards showing total conversations, sentiment score, top praise, and top complaint
- **Chat Transcript Browser** — Full-text search across all conversations with expandable chat bubbles
- **Quote → Chat Navigation** — Click "View Chat" on any quote to jump directly to the source conversation
- **Dark/Light Mode** — Toggleable theme with smooth transitions and localStorage persistence
- **Responsive Design** — Works on desktop, tablet, and mobile

## 🏗️ Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── analysis/     # POST - triggers LLM analysis
│   │   ├── conversations/# GET  - paginated chat search
│   │   └── insights/     # GET  - cached analysis results
│   ├── globals.css       # CSS variables theming system
│   ├── layout.tsx        # Root layout + ThemeProvider
│   └── page.tsx          # Main dashboard (state manager)
├── components/
│   ├── dashboard/
│   │   ├── kpi-cards.tsx           # Animated KPI cards
│   │   ├── customer-wants.tsx      # Customer wants grid
│   │   ├── category-chart.tsx      # Recharts bar charts
│   │   ├── pros-cons-view.tsx      # Feedback cards with quotes
│   │   ├── conversation-browser.tsx# Searchable chat browser
│   │   └── filters.tsx             # Date/search/category filters
│   ├── theme-provider.tsx          # Dark/light mode context
│   └── ui/
│       ├── badge.tsx               # Severity & count badges
│       └── skeleton.tsx            # Loading skeletons
└── lib/
    ├── data/
    │   ├── types.ts        # Conversation/ChatMessage interfaces
    │   ├── mock-reader.ts  # Mock data from CSV files
    │   └── index.ts        # DataReader factory
    └── analysis/
        ├── types.ts            # AnalysisResult, CustomerWant, etc.
        ├── llm-analyzer.ts     # Mock, OpenAI, Anthropic, Gemini analyzers
        ├── prompt-templates.ts # LLM system prompt + JSON schema
        ├── aggregator.ts       # Batch result merging
        └── index.ts            # Analyzer factory
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/chat-analytics.git
cd chat-analytics

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Optional: Add an API key to use real LLM analysis
# Without this, the app uses realistic mock data
GEMINI_API_KEY=your_key_here

# Or use OpenAI / Anthropic
# OPENAI_API_KEY=your_key_here
# ANTHROPIC_API_KEY=your_key_here
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📊 Data Source

The app reads mock chat transcripts from CSV files in the `data/` directory. Each CSV contains realistic customer conversations with a school website's AI assistant, covering topics like:

- Admissions & application process
- Tuition, fees & financial aid
- Course registration & prerequisites
- Campus facilities & events
- Technical issues with the website

## 🔧 Tech Stack

| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Utility-first styling |
| **Recharts** | Bar chart visualizations |
| **Lucide React** | Icon library |
| **Google Gemini** | LLM analysis (optional) |

## 📝 License

MIT
