# Gaokao Review

An AI-powered study assistant for Gaokao (Chinese college entrance exam) preparation. Features photo-based problem solving, knowledge base search, study materials, and mistake book management.

高考复习资料 -- AI 智能备考助手，集成拍题讲解、知识库笔记搜索、备考资料库和错题本管理。

## Features / 功能特性

### AI Photo Explanation / AI 拍题讲解
- Upload problem photos, AI auto-identifies subject and knowledge points
- Step-by-step detailed solutions with easy-to-understand explanations
- Score-boosting tips and suggestions
- Save to mistake book for later review

### Knowledge Base Search / 笔记搜索
- Integrated GetNote knowledge base (Gaokao + Math dual databases)
- Quick search by knowledge point name
- Automatic fallback to AI generation when knowledge base unavailable
- Search results labeled by source (knowledge base match vs. AI-generated)
- Quick-search buttons for popular topics per subject

### Study Materials / 资料库
- 6-month sprint plan with subject analysis and 3-phase review schedule
- Complete prep guides for all 6 subjects
- Recommended educator channels
- Data sourced from GetNote platform

### Mistake Book / 错题本
- Save AI-analyzed problems with solutions
- Manage by subject and date
- IndexedDB persistence with localStorage fallback

## Covered Subjects / 覆盖科目

| Subject | Key Topics |
|---------|-----------|
| Math | Trigonometry, Solid Geometry, Calculus, Conic Sections, Sequences |
| Physics | Newton's Laws, Kinetic Energy, Electromagnetic Induction, Circuits |
| Chemistry | Redox Reactions, Organic Chemistry, Electrochemistry, Equilibrium |
| Chinese | Classical Chinese, Poetry Analysis, Essay Writing, Idioms |
| English | Relative Clauses, Subjunctive Mood, Cloze Test, Writing Templates |
| Politics | Dialectics, Economic Life, Political Life, Cultural Life |

## Tech Stack / 技术栈

- **Frontend**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS 4
- **Animation**: Motion (Framer Motion)
- **Icons**: Lucide React
- **AI**: Google Gemini 3 Flash Preview
- **Knowledge Base**: GetNote platform + Make Webhook

## Project Structure / 项目结构

```
gaokao/
├── index.tsx           # Main app component
├── knowledge-base.ts   # Knowledge base data (GetNote sync)
├── index.html          # HTML entry
├── index.css           # Styles
├── vite.config.ts      # Vite build config
├── api/                # Server-side proxy endpoints
├── storage/            # IndexedDB persistence layer
└── .env.local          # Local env (not committed)
```

## Getting Started / 快速开始

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Environment Variables / 环境变量

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API key (required for AI features) |
| `WEBHOOK_URL` | Make webhook URL (optional, for knowledge base search) |
| `WEBHOOK_TOKEN` | Webhook auth token (optional) |

## License

Private repository. All rights reserved.
