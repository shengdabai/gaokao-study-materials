<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# GAOKAO-600 高考冲刺 · 逆袭计划

专为高三学子打造的智能备考助手，集成 AI 拍题讲解、知识库笔记搜索、备考资料库和错题本管理。

View app in AI Studio: https://ai.studio/apps/d1e1dc58-c28b-45a5-85aa-2890325e4005

## 功能特性

### AI 拍题讲解
- 上传题目照片，AI 自动识别科目和知识点
- 分步骤详细解答，通俗易懂
- 提供"提分技巧"建议
- 支持存入错题本

### Get 笔记搜索
- 集成 GetNote 知识库（高考 + 数学双知识库）
- 输入知识点名称快速检索核心笔记
- 知识库查询失败时自动降级到 AI 生成
- 搜索结果区分"知识库匹配"和"AI 智能生成"
- 每科提供热门知识点快速搜索按钮

### 资料库（知识库同步）
- **半年冲刺计划**：六科考试特点 + 三阶段复习规划
- **各科备考攻略**：6 科完整的题型分析、备考策略、四周冲刺方案
- **名师推荐**：5 位订阅博主（李永乐老师、嘉靖学长、清年阁、九三学长、英语兔）
- 知识库数据来源：GetNote 平台（topic: K0BlyZmn）

### 错题本管理
- 保存 AI 分析过的题目及解析
- 按科目和日期管理
- 支持删除操作
- 数据存储在 localStorage

## 覆盖科目

| 科目 | 热门知识点 |
|------|-----------|
| 数学 | 三角函数、立体几何、导数基础、圆锥曲线、数列求和 |
| 物理 | 牛顿运动定律、动能定理、电磁感应、万有引力、电路分析 |
| 化学 | 氧化还原反应、有机化学基础、电化学、元素周期律、化学平衡 |
| 语文 | 文言文实词、古诗词鉴赏、作文素材、成语运用 |
| 英语 | 定语从句、虚拟语气、完形填空技巧、写作模板 |
| 政治 | 唯物辩证法、经济生活、政治生活、文化生活 |

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式**: Tailwind CSS 4
- **动画**: Motion (Framer Motion)
- **图标**: Lucide React
- **AI 模型**: Google Gemini 3 Flash Preview
- **知识库**: GetNote 平台 + Make Webhook

## 本地运行

**Prerequisites:** Node.js

1. 安装依赖：
   ```bash
   npm install
   ```
2. 在 [.env.local](.env.local) 中设置 `GEMINI_API_KEY`
3. 运行开发服务器：
   ```bash
   npm run dev
   ```

## 项目结构

```
gaokao/
├── index.tsx           # 主应用组件
├── knowledge-base.ts   # 知识库数据（GetNote 同步）
├── index.html          # HTML 入口
├── index.css           # 样式配置
├── vite.config.ts      # Vite 构建配置
├── tsconfig.json       # TypeScript 配置
├── package.json        # 依赖声明
└── .env.local          # API Key 配置
```

## 更新日志

### 2026-03-22
- 新增「资料库」标签页，同步 GetNote 知识库内容
- 嵌入六科完整备考攻略（题型分析 + 策略 + 冲刺方案）
- 嵌入半年冲刺复习计划
- 新增名师推荐模块（5 位博主）
- 搜索支持双知识库查询（高考 + 数学）
- 搜索结果标注数据来源（知识库匹配 / AI 生成）
- 修复移动端导航，显示全部 6 个科目
- 优化移动端响应式布局
- 添加搜索加载状态展示
