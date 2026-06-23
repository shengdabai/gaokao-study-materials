# gaokao-study-materials

AI 高考备考助手：拍照解题、知识库搜索、备考资料库、错题本，一站式陪你冲刺高考

## Business Context

- **Category:** education product
- **Audience:** learners, teachers, parents, and education operators who need a clearer learning or exam-prep workflow.
- **Repository status:** Public repository. Keep examples, docs, and issues free of credentials, private data, and machine-specific paths.
- **Topics:** ai, education, gaokao, gemini, react, study-tools, typescript

## What This Project Is For

- AI 高考备考助手：拍照解题、知识库搜索、备考资料库、错题本，一站式陪你冲刺高考.
- Give users a concrete learning workflow instead of a loose collection of content.
- Make practice, feedback, review, or recommendation steps easier to repeat.

## Where It Fits

This repository supports productized learning workflows: diagnostic input, guided practice, review loops, and clearer handoff between learner, teacher, and software.

## Technical Overview

- **Primary language:** TypeScript
- **Detected stack:** TypeScript, Node.js, Vite, React, Tailwind CSS
- **Default branch:** `main`
- **Visibility:** `PUBLIC`
- **License:** MIT License

## Repository Map

- `components`
- `api`
- `LICENSE`
- `README.md`
- `SECURITY.md`
- `config.ts`
- `index.css`
- `index.html`
- `index.tsx`
- `knowledge-base.ts`
- `metadata.json`
- `package-lock.json`

## Quick Start

Use the commands that match the current project state:

```bash
npm install
npm run dev
npm run preview
npm run build
npm run lint
```

| Command | Purpose |
|---|---|
| `npm install` | Install project dependencies. |
| `npm run dev` | vite |
| `npm run preview` | vite preview |
| `npm run build` | vite build |
| `npm run lint` | tsc --noEmit |

## Operating Notes

- Keep real credentials out of the repository. Use local environment files, GitHub repository secrets, or the deployment platform secret manager.
- If a `.env.example` file exists, treat it as documentation only; never commit filled-in `.env` files.
- Before publishing screenshots, demos, or client examples, remove private names, internal paths, account IDs, and API endpoints.
- The `Repository Hygiene` workflow is a lightweight guardrail, not a replacement for product-specific tests.

## Delivery Checklist

- [ ] README describes the user, business outcome, and operating boundary.
- [ ] Setup or preview commands are current and do not rely on private machine state.
- [ ] No real secrets, private user data, or machine-local state are tracked.
- [ ] Screenshots, demos, or sample outputs are safe to share publicly when the repository is public.
- [ ] Product-specific tests or smoke checks are documented before production use.

## Roadmap

- Tighten the fastest path from clone to useful demo.
- Add project-specific screenshots, sample outputs, or a short walkthrough where useful.
- Promote repeated manual steps into scripts, tests, or documented workflows.
- Keep security, privacy, and licensing boundaries explicit as the project evolves.

## Maintainer Notes

Maintained by [Tony Sheng](https://github.com/shengdabai). This README is written as a business-facing handoff: it should help a future collaborator, client, or reviewer understand why the repository exists, how to inspect it, and what must be true before it is reused or shipped.

## 项目结构

```
gaokao/
├── index.tsx           # 主应用组件
├── knowledge-base.ts   # 知识库数据（GetNote 同步）
├── index.html          # HTML 入口
├── index.css           # 样式
├── config.ts           # 科目与标签配置
├── vite.config.ts      # Vite 构建配置
├── api/                # 服务端代理接口（analyze / search / status）
├── components/         # 资料库、错题本等 UI 组件
└── storage/            # IndexedDB 持久化层
```

## 🤝 关于与连接

本项目由 **Tony（盛）** 开发维护。Tony 是一名中文培训师，累计服务 6000+ 学员，长期用 AI 打造中文教学与备考工具，希望让更多考生用得上、用得起好工具。

如果这个项目对你有帮助，欢迎 ⭐ Star 支持，也欢迎关注我的 GitHub [@shengdabai](https://github.com/shengdabai)。

### 相关项目

- [gaokao-600](https://github.com/shengdabai/gaokao-600) —— 高考冲刺逆袭计划
- [gaokao-review](https://github.com/shengdabai/gaokao-review) —— 高考复习
- [gaokao-assistant](https://github.com/shengdabai/gaokao-assistant) —— 高考助手

## License

MIT License — 见根目录 [LICENSE](./LICENSE) 文件。
