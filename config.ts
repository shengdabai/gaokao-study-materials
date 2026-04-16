export interface SubjectConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const SUBJECTS: SubjectConfig[] = [
  { id: "math", name: "数学", icon: "📐", color: "indigo" },
  { id: "physics", name: "物理", icon: "⚡", color: "blue" },
  { id: "chemistry", name: "化学", icon: "🧪", color: "violet" },
  { id: "chinese", name: "语文", icon: "📖", color: "emerald" },
  { id: "english", name: "英语", icon: "🔤", color: "teal" },
  { id: "politics", name: "政治", icon: "⚖️", color: "rose" },
];

export const SUBJECT_ID_TO_NAME: Record<string, string> = {
  math: "数学",
  physics: "物理",
  chemistry: "化学",
  chinese: "语文",
  english: "英语",
  politics: "政治",
};

export type TabType = "ai" | "notes" | "resources" | "mistakes";

export const TAB_LABELS: Record<TabType, string> = {
  ai: "拍题",
  notes: "笔记",
  resources: "资料库",
  mistakes: "错题",
};

export function getTopicsForSubject(subId: string): string[] {
  switch (subId) {
    case "math":
      return ["三角函数", "立体几何", "导数基础", "圆锥曲线", "数列求和"];
    case "physics":
      return ["牛顿运动定律", "动能定理", "电磁感应", "万有引力", "电路分析"];
    case "chemistry":
      return ["氧化还原反应", "有机化学基础", "电化学", "元素周期律", "化学平衡"];
    case "chinese":
      return ["文言文实词", "古诗词鉴赏", "作文素材", "成语运用"];
    case "english":
      return ["定语从句", "虚拟语气", "完形填空技巧", "写作模板"];
    case "politics":
      return ["唯物辩证法", "经济生活", "政治生活", "文化生活"];
    default:
      return [];
  }
}
