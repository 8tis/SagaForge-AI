import React from 'react';
import { Info, Sparkles, BookOpen, Compass, Shield, X, Heart, Github } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSponsor: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenSponsor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">關於 SagaForge AI (星历工坊)</h2>
              <p className="text-xs text-zinc-400">The Generative AI RPG & Living Text Adventure Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {/* GitHub Repository Card */}
          <a
            href="https://github.com/8tis/SagaForge-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 transition-all text-xs group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-zinc-900 group-hover:bg-amber-500/10 text-zinc-300 group-hover:text-amber-400 transition-colors">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-zinc-100 group-hover:text-amber-300 transition-colors">
                  GitHub 官方开源仓库
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  https://github.com/8tis/SagaForge-AI
                </div>
              </div>
            </div>
            <span className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-amber-500 group-hover:text-zinc-950 font-bold transition-all shadow-sm">
              前往 Star ⭐
            </span>
          </a>

          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>什麼是 SagaForge AI？</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed text-xs">
              這是一個專注於沉浸式故事生成的純文字 RPG。你只需要定義或挑選英雄的身份與背景，強大的 AI 大模型（可接入 DeepSeek、Google Gemini、OpenRouter 等）就會扮演經驗豐富的地下城主（Game Master），為你即時演繹不可預測的世界因果。
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-zinc-200 text-xs uppercase tracking-wider">核心特色：</h4>
            <ul className="space-y-2 text-xs text-zinc-400 list-disc list-inside">
              <li>
                <strong className="text-zinc-200">自由配置第三方 API：</strong> 自由填寫 DeepSeek、OpenRouter、SiliconFlow、OpenAI 或 Gemini 密鑰，無任何硬編碼鎖定。
              </li>
              <li>
                <strong className="text-emerald-400">🔒 隱私與密鑰安全（零雲端留存）：</strong> 玩家配置的所有第三方 API Key 與介面參數 100% 僅儲存在本地瀏覽器快取中，絕不留存於伺服器資料庫。交互推演時採用動態加鹽混淆傳輸，用完即焚，全面守護玩家密鑰資產。
              </li>
              <li>
                <strong className="text-zinc-200">單幕翻頁專注：</strong> 一頁聚焦一幕，告別無限拉長，支援全鍵盤快捷鍵翻頁與行動。
              </li>
              <li>
                <strong className="text-zinc-200">突發解謎小遊戲：</strong> 密碼暗鎖、石碑方程、靈脈剪線、破綻截停，由 AI 隨機動態生成。
              </li>
              <li>
                <strong className="text-zinc-200">意境級 AI 繪畫：</strong> 每一幕即時生成契合環境與光影氛圍的場景插圖。
              </li>
              <li>
                <strong className="text-zinc-200">中英雙語支持：</strong> 頂欄一鍵切換英文/中文，支援英文 Game Master 原生敘事。
              </li>
              <li>
                <strong className="text-zinc-200">遊戲快取隨時備份：</strong> 一鍵導出與導入 JSON 遊戲存檔，資料完全由玩家本機掌控。
              </li>
              <li>
                <strong className="text-zinc-200">一鍵小說傳記：</strong> 將冒險記錄凝練成 5 章史詩短篇傳記。
              </li>
            </ul>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-xs text-zinc-500">開源社群共創 · 永久保持自由</span>
            <button
              onClick={() => {
                onClose();
                onOpenSponsor();
              }}
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>贊助支持開發</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
