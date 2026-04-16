import type { ReactNode } from "react";
import { motion } from "motion/react";
import { BarChart3, Bookmark, Trash2 } from "lucide-react";

interface ErrorItem {
  id: number;
  subject: string;
  image: string;
  analysis: string;
  date: string;
}

interface MistakesTabProps {
  errorNotebook: ErrorItem[];
  onRemove: (id: number) => void;
  renderMarkdown: (text: string) => ReactNode;
}

export function MistakesTab({ errorNotebook, onRemove, renderMarkdown }: MistakesTabProps) {
  return (
    <motion.div
      key="mistakes"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">我的错题本</h2>
          <p className="text-slate-500 mt-1">记录每一次错误，都是进步的阶梯。</p>
        </div>
        <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-bold text-slate-700">共 {errorNotebook.length} 条记录</span>
        </div>
      </div>

      {errorNotebook.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-20 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">错题本空空如也</h3>
          <p className="text-slate-400 max-w-xs mx-auto">在"拍题讲解"中分析题目后，点击"存入错题本"即可在这里看到。</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {errorNotebook.map((item) => (
            <motion.div
              key={item.id}
              layout
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">{item.subject}</span>
                  <span className="text-xs text-slate-400 font-medium">{item.date}</span>
                </div>
                <button onClick={() => onRemove(item.id)} aria-label="删除此错题" className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 flex-1 space-y-6">
                <div className="aspect-video bg-slate-50 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                  <img src={item.image} alt={`${item.subject}错题图片`} loading="lazy" className="w-full h-full object-contain" />
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
  );
}
