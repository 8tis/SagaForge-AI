import React from 'react';
import { Info, Sparkles, BookOpen, Compass, Shield, X, Heart } from 'lucide-react';

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
              <h2 className="text-lg font-bold text-zinc-100">關於本網站</h2>
              <p className="text-xs text-zinc-400">專注於純粹故事與策略的 AI 文字冒險遊戲產生器</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-2">
            <h3 className="font-bold text-amber-300 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>什麼是 AI 文字冒險遊戲產生器？</span>
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
                <strong className="text-zinc-200">動態狀態與戰術博弈：</strong> 生命值、內力/魔法、裝備、技能與隨身物品隨每一次行動即時增減計算。
              </li>
              <li>
                <strong className="text-zinc-200">自訂動作 DLC：</strong> 贊助會員專屬特權，擺脫三選一選項拘束，輸入任意奇思妙想。
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
              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1.5 transition-all"
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
