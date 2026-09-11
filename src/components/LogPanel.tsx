import React, { useState } from 'react';
import { Quest, StoryTurn } from '../types';
import { ScrollText, CheckCircle2, CircleDashed, XCircle, History, ChevronRight, BookOpen } from 'lucide-react';

interface LogPanelProps {
  quests: Quest[];
  turns: StoryTurn[];
  onOpenBiographyModal: () => void;
}

export const LogPanel: React.FC<LogPanelProps> = ({ quests, turns, onOpenBiographyModal }) => {
  const [activeTab, setActiveTab] = useState<'quests' | 'history'>('quests');

  const activeQuests = quests.filter((q) => q.status === 'in_progress');
  const completedQuests = quests.filter((q) => q.status === 'completed');
  const failedQuests = quests.filter((q) => q.status === 'failed');

  return (
    <aside className="h-full flex flex-col bg-zinc-900/70 border-l border-zinc-800 text-zinc-200 overflow-hidden">
      {/* Top Tab Switcher */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-950/60">
        <div className="grid grid-cols-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('quests')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'quests'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>任務日誌 ({quests.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'history'
                ? 'bg-amber-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>歷程回顧 ({turns.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {activeTab === 'quests' ? (
          <div className="space-y-4">
            {/* Active Quests */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <CircleDashed className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>進行中任務 ({activeQuests.length})</span>
                </span>
              </div>
              {activeQuests.length > 0 ? (
                <div className="space-y-2">
                  {activeQuests.map((quest, idx) => (
                    <div
                      key={quest.id || idx}
                      className="p-3.5 rounded-2xl bg-zinc-950/70 border border-amber-500/30 shadow-sm space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          {quest.title}
                        </h4>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                          進行中
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed pl-3">{quest.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-zinc-950/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                  當前暫無未完成的行動目標
                </div>
              )}
            </div>

            {/* Completed Quests */}
            {completedQuests.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>已達成使命 ({completedQuests.length})</span>
                </div>
                <div className="space-y-2">
                  {completedQuests.map((quest, idx) => (
                    <div
                      key={quest.id || idx}
                      className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-400 space-y-0.5 opacity-80"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-300 line-through">{quest.title}</span>
                        <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> 已完成
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{quest.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Quests */}
            {failedQuests.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>已錯失/失敗 ({failedQuests.length})</span>
                </div>
                <div className="space-y-2">
                  {failedQuests.map((quest, idx) => (
                    <div
                      key={quest.id || idx}
                      className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800 text-xs text-zinc-500 space-y-0.5"
                    >
                      <div className="flex items-center justify-between text-rose-400/90 font-semibold">
                        <span>{quest.title}</span>
                        <span className="text-[10px]">失敗</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{quest.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* History Chronicle */
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                過往抉擇編年史 ({turns.length} 幕)
              </span>
              <button
                onClick={onOpenBiographyModal}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 underline font-semibold"
              >
                <BookOpen className="w-3 h-3" />
                <span>生成小說傳記</span>
              </button>
            </div>

            {turns.length > 0 ? (
              <div className="relative border-l border-zinc-800 ml-2 space-y-4 pl-4">
                {turns.map((turn) => (
                  <div key={turn.turnNumber} className="relative group text-xs">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700 group-hover:bg-amber-400 border border-zinc-900 transition-colors" />

                    <div className="font-serif font-bold text-zinc-300 flex items-center gap-1.5">
                      <span className="text-amber-400">第 {turn.turnNumber} 幕</span>
                      <span>·</span>
                      <span className="truncate">{turn.chapterTitle || '冒險'}</span>
                    </div>

                    {turn.selectedAction ? (
                      <div className="mt-1 p-2 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-zinc-300 font-sans flex items-start gap-1">
                        <ChevronRight className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{turn.selectedAction}</span>
                      </div>
                    ) : (
                      <div className="mt-1 text-[11px] text-zinc-500 italic">
                        踏入未知險境……
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                暫無歷史記錄
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
