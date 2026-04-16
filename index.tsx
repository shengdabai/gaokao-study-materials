import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import { motion, AnimatePresence } from "motion/react";
import {
  Camera, Upload, Search, BookOpen, Brain, Zap,
  ChevronRight, GraduationCap, History, Trash2,
  Bookmark, X, Key, Sparkles, Layout,
  Target, Settings, Library
} from "lucide-react";
import { loadNotebook, persistNotebook } from "./storage/notebookDb";
import { SUBJECTS, TAB_LABELS, getTopicsForSubject, type TabType } from "./config";
import { MistakesTab } from "./components/MistakesTab";
import { ResourcesTab } from "./components/ResourcesTab";

interface ErrorItem {
  id: number;
  subject: string;
  image: string;
  analysis: string;
  date: string;
}

const compressImage = (dataUrl: string, maxWidth = 800): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataUrl;
  });

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

  // Toast notification
  const [toast, setToast] = useState<string | null>(null);
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // Delete confirmation modal
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const checkServerConfig = async () => {
    try {
      const response = await fetch("/api/status");
      if (!response.ok) throw new Error("status check failed");
      const data = await response.json();
      setHasApiKey(Boolean(data.aiConfigured));
    } catch (e) {
      console.error("Error checking server config:", e);
      setHasApiKey(false);
    }
  };

  // Initialize Data & Check Key
  useEffect(() => {
    const init = async () => {
      try {
        await checkServerConfig();
      } finally {
        setIsCheckingKey(false);
      }

      const savedHistory = localStorage.getItem("app_search_history");
      if (savedHistory) {
        try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) { console.error("Failed to parse search history:", e); }
      }

      try {
        const notebook = await loadNotebook();
        setErrorNotebook(notebook);
      } catch (e) {
        console.error("Failed to load error notebook:", e);
      }
    };
    init();
  }, []);

  const handleSelectKey = async () => {
    setIsCheckingKey(true);
    try {
      await checkServerConfig();
    } finally {
      setIsCheckingKey(false);
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

  const addToNotebook = async () => {
    if (!selectedImage || !aiAnalysis) return;
    const compressed = await compressImage(selectedImage);
    const newItem: ErrorItem = {
      id: Date.now(),
      subject: activeSubject.name,
      image: compressed,
      analysis: aiAnalysis,
      date: new Date().toLocaleDateString()
    };
    const newNotebook = [newItem, ...errorNotebook];
    setErrorNotebook(newNotebook);
    try {
      await persistNotebook(newNotebook);
      showToast("已成功加入错题本！");
    } catch (e) {
      console.error("Failed to persist error notebook:", e);
      showToast("存储失败，请重试");
    }
  };

  const removeFromNotebook = (id: number) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId === null) return;
    const newNotebook = errorNotebook.filter(item => item.id !== deleteConfirmId);
    setErrorNotebook(newNotebook);
    try {
      await persistNotebook(newNotebook);
      showToast("已删除错题记录");
    } catch (e) {
      console.error("Failed to persist notebook after delete:", e);
      showToast("删除后保存失败，请重试");
    }
    setDeleteConfirmId(null);
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
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: selectedImage }),
      });
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || "分析失败，请稍后重试。");
        (error as Error & { status?: number }).status = response.status;
        throw error;
      }

      setAiAnalysis(data.analysis || "无法解析，请重试。");
    } catch (error) {
      console.error("Analysis failed", error);
      const status = (error as Error & { status?: number }).status;
      if (status === 503) {
        setHasApiKey(false);
        showToast("服务端未配置 GEMINI_API_KEY，请先配置后重试。");
      }
      setAiAnalysis(error instanceof Error ? error.message : "分析失败，请检查网络或重试。");
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

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryToUse }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "搜索失败，请重试。");
      }

      setNoteResults({ ...data.result, source: data.source });
    } catch (e) {
      console.error("Knowledge base search failed:", e);
      setNoteResults({ error: e instanceof Error ? e.message : "搜索失败，请重试。" });
    } finally {
      setIsSearching(false);
    }
  };

  const renderMarkdown = (text: string) => (
    <div className="markdown-body">
      <Markdown>{text}</Markdown>
    </div>
  );

  if (isCheckingKey) return <div className="min-h-screen flex items-center justify-center"><div className="loader"></div></div>;

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-2xl max-w-lg w-full text-center border border-slate-200 dark:border-slate-800 shadow-lg"
        >
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">高考冲刺 · 逆袭计划</h1>
          <p className="text-slate-500 mb-10 leading-relaxed">
            专为高三学子打造的智能备考助手。<br/>
            请先在服务端配置 Gemini API Key，再刷新页面开启 AI 智能分析功能。
          </p>
          <button
            onClick={handleSelectKey}
            className="w-full bg-indigo-600 text-white font-semibold py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
          >
            <Key className="w-5 h-5" />
            重新检查服务配置
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:m-2">跳转到主要内容</a>
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight dark:text-white">高考逆袭</span>
        </div>

        <nav aria-label="科目导航" className="space-y-1 flex-1">
          <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-2">核心科目</div>
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
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <Library className="w-5 h-5" />
            <span className="text-sm font-medium">资料库</span>
          </button>
          <button
            onClick={handleSelectKey}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium">设置 API Key</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Header - Mobile & Desktop */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 lg:px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-indigo-600" />
              <span className="font-bold">高考逆袭</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 text-sm text-slate-500">
              <Layout className="w-4 h-4" />
              <span>工作台</span>
              <ChevronRight className="w-4 h-4" />
              <span className="font-medium text-slate-900 dark:text-white">{activeSubject.name}复习</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
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
                      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                          <Camera className="w-6 h-6 text-indigo-600" />
                          AI 拍题讲解
                        </h2>
                        <p className="text-slate-500 text-sm mb-8">上传题目照片，AI 老师为您深度解析解题思路与技巧。</p>

                        <div
                          role="button"
                          tabIndex={0}
                          aria-label="上传题目图片"
                          className="aspect-video border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all cursor-pointer relative overflow-hidden group focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                          onClick={() => fileInputRef.current?.click()}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                        >
                          {selectedImage ? (
                            <img src={selectedImage} alt="已上传的题目图片" className="w-full h-full object-contain" />
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
                              : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20 active:scale-[0.98]"
                          }`}
                        >
                          {isAnalyzing ? <div className="loader border-white/30 border-t-white"></div> : <Sparkles className="w-5 h-5" />}
                          {isAnalyzing ? "正在深度解析..." : "开始 AI 分析"}
                        </button>
                      </div>

                      <div className="bg-teal-600 rounded-2xl p-8 text-white relative overflow-hidden shadow-lg">
                        <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                          <Zap className="w-5 h-5" />
                          提分小贴士
                        </h3>
                        <p className="text-teal-100 text-sm leading-relaxed">
                          基础薄弱不可怕，关键是掌握核心公式。每天坚持分析 3 道错题，30 天见证奇迹。
                        </p>
                      </div>
                    </div>

                    <div className="min-h-[500px]">
                      {aiAnalysis ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 h-full"
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
                        <div className="h-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center text-slate-400 p-10 text-center">
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
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-10 border border-slate-200 dark:border-slate-800 shadow-sm max-w-3xl mx-auto w-full">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Get 笔记搜索</h2>
                      <p className="text-slate-500">输入知识点名称，从知识库中快速获取核心笔记与考点总结。</p>
                    </div>

                    <div className="relative group">
                      <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input
                        type="text"
                        value={noteQuery}
                        onChange={(e) => setNoteQuery(e.target.value)}
                        placeholder={`搜索${activeSubject.name}知识点...`}
                        aria-label="搜索知识点"
                        className="w-full pl-14 pr-32 py-5 rounded-2xl border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus-visible:outline-2 focus-visible:outline-indigo-500 transition-all text-lg"
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
                              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-100 hover:text-indigo-600 transition-all"
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
                      role="region"
                      aria-live="polite"
                    >
                      {noteResults.error ? (
                        <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-6 rounded-2xl border border-rose-100 dark:border-rose-900">{noteResults.error}</div>
                      ) : (
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                          <div className="bg-slate-50 dark:bg-slate-800 px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
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
                          className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl text-center hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
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
                <ResourcesTab
                  showStudyPlan={showStudyPlan}
                  setShowStudyPlan={setShowStudyPlan}
                  expandedSubjectGuide={expandedSubjectGuide}
                  setExpandedSubjectGuide={setExpandedSubjectGuide}
                  renderMarkdown={renderMarkdown}
                />
              )}

              {activeTab === "mistakes" && (
                <MistakesTab
                  errorNotebook={errorNotebook}
                  onRemove={removeFromNotebook}
                  renderMarkdown={renderMarkdown}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[80] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-sm w-full shadow-xl border border-slate-200 dark:border-slate-800 text-center"
              role="alertdialog"
              aria-labelledby="delete-title"
              aria-describedby="delete-desc"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/30 rounded-full flex items-center justify-center mx-auto mb-5">
                <Trash2 className="w-6 h-6 text-rose-500" />
              </div>
              <h3 id="delete-title" className="text-lg font-bold text-slate-900 dark:text-white mb-2">确认删除</h3>
              <p id="delete-desc" className="text-slate-500 dark:text-slate-400 text-sm mb-8">确定要删除这条错题记录吗？此操作无法撤销。</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-all"
                >
                  删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl shadow-lg text-sm font-medium"
            role="status"
            aria-live="polite"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Nav - All 6 subjects */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2 z-50">
        <div className="flex items-center justify-around">
          {SUBJECTS.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubject(sub)}
              className={`flex flex-col items-center justify-center gap-0.5 px-2 py-2 rounded-xl transition-all min-w-[48px] min-h-[48px] ${
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
              className="w-full bg-white dark:bg-slate-900 rounded-t-3xl p-6"
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

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
