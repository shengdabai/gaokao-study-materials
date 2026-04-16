import type { Dispatch, ReactNode, SetStateAction } from "react";
import { motion } from "motion/react";
import { Calendar, ChevronDown, ChevronUp, ExternalLink, FileText, Users, X } from "lucide-react";
import { BLOGGERS, STUDY_PLAN, SUBJECT_GUIDES } from "../knowledge-base";
import { SUBJECTS, SUBJECT_ID_TO_NAME } from "../config";

interface ResourcesTabProps {
  showStudyPlan: boolean;
  setShowStudyPlan: Dispatch<SetStateAction<boolean>>;
  expandedSubjectGuide: string | null;
  setExpandedSubjectGuide: Dispatch<SetStateAction<string | null>>;
  renderMarkdown: (text: string) => ReactNode;
}

export function ResourcesTab({
  showStudyPlan,
  setShowStudyPlan,
  expandedSubjectGuide,
  setExpandedSubjectGuide,
  renderMarkdown,
}: ResourcesTabProps) {
  return (
    <motion.div
      key="resources"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div
        className="bg-indigo-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden shadow-lg cursor-pointer"
        onClick={() => setShowStudyPlan(!showStudyPlan)}
      >
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
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="p-6 lg:p-8 max-h-[70vh] overflow-y-auto">
            {renderMarkdown(STUDY_PLAN)}
          </div>
        </motion.div>
      )}

      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          各科备考攻略
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map((sub) => (
            <div key={sub.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
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

      {expandedSubjectGuide && SUBJECT_GUIDES[expandedSubjectGuide] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div className="bg-slate-50 dark:bg-slate-800 px-6 lg:px-8 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">{SUBJECTS.find((s) => s.id === expandedSubjectGuide)?.icon}</span>
              <span className="font-bold text-slate-700">
                {SUBJECT_ID_TO_NAME[expandedSubjectGuide]}备考攻略
              </span>
            </div>
            <button
              onClick={() => setExpandedSubjectGuide(null)}
              aria-label="关闭攻略"
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

      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          名师推荐
        </h3>
        <p className="text-slate-500 text-sm mb-6">知识库已订阅的高考备考名师，点击可查看其内容。</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BLOGGERS.map((blogger) => (
            <a
              key={blogger.name}
              href={blogger.link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all group"
            >
              <img
                src={blogger.avatar}
                alt={blogger.name}
                loading="lazy"
                className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 group-hover:border-indigo-200 transition-colors"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml," +
                    encodeURIComponent(
                      '<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect fill="#f1f5f9" width="56" height="56" rx="12"/><text x="28" y="36" text-anchor="middle" fill="#94a3b8" font-size="18" font-family="sans-serif">' +
                        blogger.name[0] +
                        "</text></svg>",
                    );
                }}
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

      <p className="text-sm text-slate-500 dark:text-slate-400 px-1">
        知识库覆盖 6 科 · 7 套备考攻略 · 5 位名师 · 590+ 条笔记
      </p>
    </motion.div>
  );
}
