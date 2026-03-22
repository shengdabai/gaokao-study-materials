import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera, Upload, Search, BookOpen, Brain, Zap,
  ChevronRight, GraduationCap, History, Trash2,
  Bookmark, X, Key, Lock, Sparkles, Layout,
  Target, BarChart3, Settings, LogOut, Plus,
  Library, Users, ExternalLink, ChevronDown, ChevronUp,
  Calendar, TrendingUp, FileText, Video
} from "lucide-react";
import { BLOGGERS, STUDY_PLAN, SUBJECT_GUIDES } from "./knowledge-base";

// Subjects configuration
const SUBJECTS = [
  { id: "math", name: "数学", icon: "📐", color: "indigo" },
  { id: "physics", name: "物理", icon: "⚡", color: "blue" },
  { id: "chemistry", name: "化学", icon: "🧪", color: "violet" },
  { id: "chinese", name: "语文", icon: "📖", color: "emerald" },
  { id: "english", name: "英语", icon: "🔤", color: "teal" },
  { id: "politics", name: "政治", icon: "⚖️", color: "rose" },
];

// Map subject IDs to display names for knowledge base
const SUBJECT_ID_TO_NAME: Record<string, string> = {
  math: "数学", physics: "物理", chemistry: "化学",
  chinese: "语文", english: "英语", politics: "政治",
};

interface ErrorItem {
  id: number;
  subject: string;
  image: string;
  analysis: string;
  date: string;
}

type TabType = "ai" | "notes" | "resources" | "mistakes";

const TAB_LABELS: Record<TabType, string> = {
  ai: "拍题",
  notes: "笔记",
  resources: "资料库",
  mistakes: "错题",
};

const App = () => {
  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);

  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
  const [activeTab, setActiveTab] = useState<TabType>("ai");

  // AI Solver State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get Notes State
  const [noteQuery, setNoteQuery] = useState("");
  const [noteResults, setNoteResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Error Notebook State
  const [errorNotebook, setErrorNotebook] = useState<ErrorItem[]>([]);

  // Resources State
  const [showStudyPlan, setShowStudyPlan] = useState(false);
  const [expandedSubjectGuide, setExpandedSubjectGuide] = useState<string | null>(null);

  // Mobile subject picker
  const [showMobileSubjects, setShowMobileSubjects] = useState(false);

  // Initialize Data & Check Key
  useEffect(() => {
    const init = async () => {
      try {
        if ((window as any).aistudio && await (window as any).aistudio.hasSelectedApiKey()) {
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Error checking API key:", e);
      } finally {
        setIsCheckingKey(false);
      }

      const savedHistory = localStorage.getItem("app_search_history");
      if (savedHistory) {
        try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}
      }

      const savedNotebook = localStorage.getItem("app_error_notebook");
      if (savedNotebook) {
        try { setErrorNotebook(JSON.parse(savedNotebook)); } catch (e) {}
      }
    };
    init();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasApiKey(true);
      } catch (e) {
        console.error("Error selecting key:", e);
      }
    }
  };

  const updateHistory = (term: string) => {
    setSearchHistory(prev => {
      const newHistory = [term, ...prev.filter(h => h !== term)].slice(0, 6);
      localStorage.setItem("app_search_history", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("app_search_history");
  };

  const addToNotebook = () => {
    if (!selectedImage || !aiAnalysis) return;
    const newItem: ErrorItem = {
      id: Date.now(),
      subject: activeSubject.name,
      image: selectedImage,
      analysis: aiAnalysis,
      date: new Date().toLocaleDateString()
    };
    const newNotebook = [newItem, ...errorNotebook];
    setErrorNotebook(newNotebook);
    localStorage.setItem("app_error_notebook", JSON.stringify(newNotebook));
    alert("已成功加入错题本！");
  };

  const removeFromNotebook = (id: number) => {
    if (!confirm("确定要删除这条错题记录吗？")) return;
    const newNotebook = errorNotebook.filter(item => item.id !== id);
    setErrorNotebook(newNotebook);
    localStorage.setItem("app_error_notebook", JSON.stringify(newNotebook));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setAiAnalysis("");
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAiAnalysis("");

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = selectedImage.split(",")[1];
      const mimeType = selectedImage.match(/:(.*?);/)?.[1] || "image/png";

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { mimeType, data: base64Data } },
            { text: `你是一位专业的高考辅导老师。请分析这张图片中的题目：
              1. 识别科目和知识点。
              2. 给出详细的、分步骤的解答。
              3. 用通俗易懂的语言解释核心概念。
              4. 提供一个"提分技巧"。使用 Markdown 格式输出。` }
          ],
        },
      });
      setAiAnalysis(response.text || "无法解析，请重试。");
    } catch (error: any) {
      console.error("Analysis failed", error);
      if (error.toString().includes("Requested entity was not found") || error.status === 404) {
        setHasApiKey(false);
        alert("API Key 无效，请重新选择。");
      } else {
        setAiAnalysis("分析失败，请检查网络或重试。");
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const searchNotes = async (overrideQuery?: string) => {
    const queryToUse = typeof overrideQuery === 'string' ? overrideQuery : noteQuery;
    if (!queryToUse.trim()) return;
    if (overrideQuery) setNoteQuery(overrideQuery);
    updateHistory(queryToUse.trim());
    setIsSearching(true);
    setNoteResults(null);

    let success = false;
    try {
      const response = await fetch("https://hook.us2.make.com/628uk9k37rq9v8cffmsw4u2ao7kel6l2", {
        method: "POST",
        headers: {
          "Authorization": "Bearer e+XryiX0ivghXJZeW9AcQSazSk8gwIpcYhrRN8KWEoB+C3I+qbxBGydx5FuAk+AUCaAq2dOciv4G9c1CXw9bPwXkfSZez4j+ggw=",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: queryToUse, topic_ids: ["K0BlyZmn", "BJ888R8J"], deep_seek: true })
      });

      if (response.ok) {
        const textResult = await response.text();
        const trimmedResult = textResult.trim();
        if (trimmedResult && trimmedResult.toLowerCase() !== "accepted" && !trimmedResult.toLowerCase().includes("error")) {
          let jsonResult;
          try { jsonResult = JSON.parse(trimmedResult); } catch (e) { jsonResult = { answer: trimmedResult }; }
          const finalAnswer = jsonResult.answer || jsonResult.output || jsonResult.message || "";
          if (finalAnswer.toString().trim().toLowerCase() !== "accepted" && finalAnswer.toString().trim() !== "") {
            setNoteResults({ ...jsonResult, source: "知识库" });
            success = true;
          }
        }
      }
    } catch (e) {}

    if (!success) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `总结关于"${queryToUse}"的高考知识点笔记。包含【核心概念】、【重点公式/结论】、【经典例题】。使用 Markdown。`,
        });
        setNoteResults({ answer: response.text, source: "AI" });
      } catch (e) {
        setNoteResults({ error: "搜索失败，请重试。" });
      }
    }
    setIsSearching(false);
  };

  const renderMarkdown = (text: string) => (
    <div className="markdown-body">
      <Markdown>{text}</Markdown>
    </div>
  );

  if (isCheckingKey) return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>;

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1e1b4b,transparent)] opacity-50"></div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 glass-card p-10 rounded-[2.5rem] max-w-lg w-full text-center border-white/10"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">高考冲刺 · 逆袭计划</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            专为高三学子打造的智能备考助手。<br/>
            请连接您的 API Key 以开启 AI 智能分析功能。
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 text-white font-semibold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95"
          >
            <Key className="w-5 h-5" />
            连接 API Key
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">高考逆袭</span>
        </div>

        <nav className="space-y-1 flex-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">核心科目</div>
          {SUBJECTS.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSubject.id === sub.id
                ? "bg-indigo-50 text-indigo-600 shadow-sm"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className="text-xl">{sub.icon}</span>
              <span className="font-medium">{sub.name}</span>
              {activeSubject.id === sub.id && <motion.div layoutId="activeSub" className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100 space-y-1">
          <button
            onClick={() => setActiveTab("resources")}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Library className="w-5 h-5" />
            <span className="text-sm font-medium">资料库</span>
          </button>
          <button
            onClick={handleSelectKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">设置 API Key</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header - Mobile & Desktop */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              <span className="font-bold">高考逆袭</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <Layout className="w-4 h-4" />
              <span>工作台</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-slate-900">{activeSubject.name}复习</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 p-1 rounded-xl overflow-x-auto">
                {(Object.keys(TAB_LABELS) as TabType[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 lg:px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      activeTab === tab
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {TAB_LABELS[tab]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-10">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === "ai" && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="grid lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                          <Camera className="w-6 h-6 text-indigo-600" />
                          AI 拍题讲解
                        </h2>
                        <p className="text-slate-500 text-sm mb-8">上传题目照片，AI 老师为您深度解析解题思路与技巧。</p>

                        <div
                          className="aspect-video border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer relative overflow-hidden group"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {selectedImage ? (
                            <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center">
                              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                                <Upload className="w-6 h-6 text-indigo-500" />
                              </div>
                              <p className="text-slate-600 font-semibold">点击上传或拍摄</p>
                              <p className="text-slate-400 text-xs mt-1">支持 JPG, PNG 格式</p>
                            </div>
                          )}
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>

                        <button
                          onClick={analyzeImage}
                          disabled={!selectedImage || isAnalyzing}
                          className={`w-full mt-6 py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                            !selectedImage || isAnalyzing
                              ? "bg-slate-300 cursor-not-allowed"
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 active:scale-[0.98]"
                          }`}
                        >
                          {isAnalyzing ? <div className="loader border-white/30 border-t-white"></div> : <Sparkles className="w-5 h-5" />}
                          {isAnalyzing ? "正在深度解析..." : "开始 AI 分析"}
                        </button>
                      </div>

                      <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          提分小贴士
                        </h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                          基础薄弱不可怕，关键是掌握核心公式。每天坚持分析 3 道错题，30 天见证奇迹。
                        </p>
                      </div>
                    </div>

                    <div className="min-h-[500px]">
                      {aiAnalysis ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 h-full"
                        >
                          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                <Brain className="w-6 h-6" />
                              </div>
                              <span className="font-bold text-slate-900">解析结果</span>
                            </div>
                            <button
                              onClick={addToNotebook}
                              className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-all"
                            >
                              <Bookmark className="w-4 h-4" />
                              存入错题本
                            </button>
                          </div>
                          <div className="overflow-y-auto max-h-[600px] pr-2">
                            {renderMarkdown(aiAnalysis)}
                          </div>
                        </motion.div>
                      ) : (
                        <div className="h-full border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-10 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="w-10 h-10 text-slate-200" />
                          </div>
                          <p className="font-medium">等待分析...</p>
                          <p className="text-xs mt-2">上传题目后点击"开始 AI 分析"即可查看详细解答</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "notes" && (
                <motion.div
                  key="notes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-3xl p-6 lg:p-10 border border-slate-200 shadow-sm max-w-3xl mx-auto w-full">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 mb-3">Get 笔记搜索</h2>
                      <p className="text-slate-500">输入知识点名称，从知识库中快速获取核心笔记与考点总结。</p>
                    </div>

                    <div className="relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        value={noteQuery}
                        onChange={(e) => setNoteQuery(e.target.value)}
                        placeholder={`搜索${activeSubject.name}知识点...`}
                        className="w-full pl-14 pr-32 py-5 rounded-2xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all text-lg"
                        onKeyDown={(e) => e.key === 'Enter' && searchNotes()}
                      />
                      <button
                        onClick={() => searchNotes()}
                        disabled={isSearching || !noteQuery.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 transition-all"
                      >
                        {isSearching ? "搜索中" : "搜索"}
                      </button>
                    </div>

                    {searchHistory.length > 0 && (
                      <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">最近搜索</span>
                          <button onClick={clearHistory} className="text-xs text-slate-400 hover:text-rose-500 transition-colors">清空历史</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {searchHistory.map((term, i) => (
                            <button
                              key={i}
                              onClick={() => searchNotes(term)}
                              className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isSearching && (
                    <div className="max-w-3xl mx-auto w-full flex justify-center py-12">
                      <div className="flex flex-col items-center gap-4">
                        <div className="loader"></div>
                        <p className="text-slate-500 text-sm">正在从知识库中搜索...</p>
                      </div>
                    </div>
                  )}

                  {noteResults && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="max-w-3xl mx-auto w-full"
                    >
                      {noteResults.error ? (
                        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl border border-rose-100">{noteResults.error}</div>
                      ) : (
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 px-6 lg:px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                            <span className="font-bold text-slate-700">搜索结果</span>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                              noteResults.source === "AI"
                                ? "bg-indigo-600 text-white"
                                : "bg-emerald-600 text-white"
                            }`}>
                              {noteResults.source === "AI" ? "AI 智能生成" : "知识库匹配"}
                            </span>
                          </div>
                          <div className="p-6 lg:p-8">
                            {renderMarkdown(noteResults.answer || noteResults.output || noteResults.message || JSON.stringify(noteResults))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {!noteResults && !isSearching && (
                    <div className="max-w-3xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {getTopicsForSubject(activeSubject.id).map(topic => (
                        <button
                          key={topic}
                          onClick={() => searchNotes(topic)}
                          className="p-6 bg-white border border-slate-200 rounded-3xl text-center hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-indigo-50 transition-colors">
                            <Target className="w-5 h-5 text-slate-400 group-hover:text-indigo-500" />
                          </div>
                          <span className="font-bold text-slate-700 text-sm">{topic}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "resources" && (
                <motion.div
                  key="resources"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {/* Study Plan Card */}
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-6 lg:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-200 cursor-pointer"
                    onClick={() => setShowStudyPlan(!showStudyPlan)}
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16 blur-xl"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold">半年冲刺计划</h2>
                            <p className="text-indigo-200 text-sm mt-1">六科考试特点 + 三阶段复习规划</p>
                          </div>
                        </div>
                        {showStudyPlan ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">基础重构期 1-2月</span>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">专题突破期 3-4月</span>
                        <span className="bg-white/20 px-3 py-1 rounded-lg text-xs font-medium">模拟冲刺期 5-6月</span>
                      </div>
                    </div>
                  </div>

                  {showStudyPlan && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
                        {renderMarkdown(STUDY_PLAN)}
                      </div>
                    </motion.div>
                  )}

                  {/* Subject Guides */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      各科备考攻略
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {SUBJECTS.map(sub => (
                        <div key={sub.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                          <button
                            onClick={() => setExpandedSubjectGuide(expandedSubjectGuide === sub.id ? null : sub.id)}
                            className="w-full p-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{sub.icon}</span>
                              <div className="text-left">
                                <span className="font-bold text-slate-900">{sub.name}攻略</span>
                                <p className="text-xs text-slate-400 mt-0.5">题型分析 + 备考策略</p>
                              </div>
                            </div>
                            {expandedSubjectGuide === sub.id ? (
                              <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expanded Subject Guide */}
                  {expandedSubjectGuide && SUBJECT_GUIDES[expandedSubjectGuide] && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="bg-slate-50 px-6 lg:px-8 py-4 border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{SUBJECTS.find(s => s.id === expandedSubjectGuide)?.icon}</span>
                          <span className="font-bold text-slate-700">
                            {SUBJECT_ID_TO_NAME[expandedSubjectGuide]}备考攻略
                          </span>
                        </div>
                        <button
                          onClick={() => setExpandedSubjectGuide(null)}
                          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
                        {renderMarkdown(SUBJECT_GUIDES[expandedSubjectGuide])}
                      </div>
                    </motion.div>
                  )}

                  {/* Bloggers / Tutors Section */}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      名师推荐
                    </h3>
                    <p className="text-slate-500 text-sm mb-6">知识库已订阅的高考备考名师，点击可查看其内容。</p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {BLOGGERS.map(blogger => (
                        <a
                          key={blogger.name}
                          href={blogger.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all group"
                        >
                          <img
                            src={blogger.avatar}
                            alt={blogger.name}
                            className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 group-hover:border-indigo-200 transition-colors"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 truncate">{blogger.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">{blogger.platform}</span>
                              <span className="text-xs text-slate-400">{blogger.notesCount} 条笔记</span>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Knowledge Base Stats */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">6</div>
                        <div className="text-xs text-slate-500 mt-1">覆盖科目</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">7</div>
                        <div className="text-xs text-slate-500 mt-1">复习攻略</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">5</div>
                        <div className="text-xs text-slate-500 mt-1">名师博主</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">590+</div>
                        <div className="text-xs text-slate-500 mt-1">博主笔记</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "mistakes" && (
                <motion.div
                  key="mistakes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">我的错题本</h2>
                      <p className="text-slate-500 mt-1">记录每一次错误，都是进步的阶梯。</p>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-bold text-slate-700">共 {errorNotebook.length} 条记录</span>
                    </div>
                  </div>

                  {errorNotebook.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-20 border border-slate-200 shadow-sm text-center">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Bookmark className="w-10 h-10 text-slate-200" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">错题本空空如也</h3>
                      <p className="text-slate-400 max-w-xs mx-auto">在"拍题讲解"中分析题目后，点击"存入错题本"即可在这里看到。</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {errorNotebook.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
                        >
                          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{item.subject}</span>
                              <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                            </div>
                            <button onClick={() => removeFromNotebook(item.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-6 flex-1 space-y-6">
                            <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
                              <img src={item.image} alt="Question" className="w-full h-full object-contain" />
                            </div>
                            <div className="max-h-64 overflow-y-auto pr-2 text-sm">
                              {renderMarkdown(item.analysis)}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Mobile Nav - All 6 subjects */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          {SUBJECTS.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
                activeSubject.id === sub.id ? "text-indigo-600 bg-indigo-50" : "text-slate-400"
              }`}
            >
              <span className="text-lg">{sub.icon}</span>
              <span className="text-[9px] font-bold">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Subject Picker Overlay */}
      <AnimatePresence>
        {showMobileSubjects && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/50 z-[60] flex items-end"
            onClick={() => setShowMobileSubjects(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="w-full bg-white rounded-t-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4">选择科目</h3>
              <div className="grid grid-cols-3 gap-3">
                {SUBJECTS.map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveSubject(sub);
                      setShowMobileSubjects(false);
                    }}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      activeSubject.id === sub.id
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-2xl">{sub.icon}</span>
                    <span className="text-sm font-medium">{sub.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

function getTopicsForSubject(subId: string): string[] {
  switch (subId) {
    case "math": return ["三角函数", "立体几何", "导数基础", "圆锥曲线", "数列求和"];
    case "physics": return ["牛顿运动定律", "动能定理", "电磁感应", "万有引力", "电路分析"];
    case "chemistry": return ["氧化还原反应", "有机化学基础", "电化学", "元素周期律", "化学平衡"];
    case "chinese": return ["文言文实词", "古诗词鉴赏", "作文素材", "成语运用"];
    case "english": return ["定语从句", "虚拟语气", "完形填空技巧", "写作模板"];
    case "politics": return ["唯物辩证法", "经济生活", "政治生活", "文化生活"];
    default: return [];
  }
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
