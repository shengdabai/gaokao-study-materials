# 📚 高考学习助手 · AI 智能备考

![last commit](https://img.shields.io/github/last-commit/shengdabai/gaokao-study-materials)
![stars](https://img.shields.io/github/stars/shengdabai/gaokao-study-materials?style=social)
![follow](https://img.shields.io/github/followers/shengdabai?style=social)

> 一款面向高考考生的 AI 备考助手 —— 拍照解题、知识库搜索、备考资料库、错题本，一站式陪你冲刺。

## 为什么做这个

高考复习信息分散、答疑成本高，刷题之后没有系统地沉淀错题。这个项目把「拍照问 AI → 看懂讲解 → 存进错题本 → 配合知识库与资料库系统复习」串成一条完整闭环，让一个人也能高效自学备考。

## 做什么

- 拍下不会的题，AI 自动识别科目与知识点，给出分步讲解
- 按知识点名称快速检索笔记，知识库没有时自动用 AI 兜底生成
- 内置六大科目备考资料与冲刺计划
- 把 AI 讲解过的题一键存入错题本，按科目和日期管理复习

## ✨ 功能特性

### 📷 AI 拍题讲解
- 上传题目照片，AI 自动识别科目与所考知识点
- 通俗易懂的分步详解，配提分建议
- 一键保存到错题本，方便日后回顾

### 🔍 知识库搜索
- 集成 GetNote 知识库（高考 + 数学双库）
- 按知识点名称快速检索
- 知识库无匹配时自动回退到 AI 生成
- 搜索结果标注来源（知识库命中 / AI 生成）
- 每个科目提供热门知识点的一键快搜

### 📦 备考资料库
- 六个月冲刺计划，含学科分析与三阶段复习安排
- 六大科目完整备考指南
- 推荐优质教学频道
- 数据来源于 GetNote 平台

### 📝 错题本
- 保存 AI 分析过的题目与解法
- 按科目与日期管理
- IndexedDB 持久化，localStorage 兜底

## 覆盖科目

| 科目 | 重点内容 |
|------|---------|
| 数学 📐 | 三角函数、立体几何、导数基础、圆锥曲线、数列求和 |
| 物理 ⚡ | 牛顿运动定律、动能定理、电磁感应、万有引力、电路分析 |
| 化学 🧪 | 氧化还原反应、有机化学基础、电化学、元素周期律、化学平衡 |
| 语文 📖 | 文言文实词、古诗词鉴赏、作文素材、成语运用 |
| 英语 🔤 | 定语从句、虚拟语气、完形填空技巧、写作模板 |
| 政治 ⚖️ | 唯物辩证法、经济生活、政治生活、文化生活 |

## 🧱 技术栈

- **前端**：React 19 + TypeScript
- **构建**：Vite 6
- **样式**：Tailwind CSS 4
- **动画**：Motion（Framer Motion）
- **图标**：Lucide React
- **AI**：Google Gemini 3 Flash Preview
- **知识库**：GetNote 平台 + Make Webhook
- **存储**：IndexedDB（localStorage 兜底）

## 🚀 快速开始

```bash
npm install
npm run dev
```

启动后访问 http://localhost:5173

### 环境变量

| 变量 | 说明 |
|------|------|
| `GEMINI_API_KEY` | Google Gemini API key（AI 功能必填） |
| `WEBHOOK_URL` | Make webhook 地址（可选，用于知识库搜索） |
| `WEBHOOK_TOKEN` | Webhook 鉴权 token（可选） |

## 📖 使用说明

1. **拍题**：在「拍题」页上传题目照片，等待 AI 识别并给出分步讲解，看完可一键存入错题本
2. **笔记**：在「笔记」页输入知识点名称检索，结果会标注来自知识库还是 AI 生成
3. **资料库**：在「资料库」页查看冲刺计划、各科备考指南与推荐频道
4. **错题**：在「错题」页按科目、日期回顾此前保存的题目与解法

## 🗺️ 状态

项目持续迭代中，覆盖六大高考科目，已上线拍题讲解、知识库搜索、资料库与错题本四大模块。欢迎试用并反馈。

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

暂无开源协议（All rights reserved）。
