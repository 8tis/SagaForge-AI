import React from 'react';
import {
  Compass,
  Key,
  Shield,
  ScrollText,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Heart,
  Save,
  User,
  Sliders,
  ShieldAlert,
  BookOpen,
  Crown,
  Disc3,
  Sparkles,
} from 'lucide-react';
import { WorldGenre, UserProfile } from '../types';

interface NavbarProps {
  currentWorld?: WorldGenre;
  chapterTitle?: string;
  turnCount?: number;
  hasConfiguredKey: boolean;
  currentUser: UserProfile | null;
  onOpenSettingsModal: () => void;
  onOpenSponsorModal: () => void;
  onOpenSaveModal: () => void;
  onOpenAuthModal: () => void;
  onOpenAdminModal: () => void;
  onOpenAboutModal: () => void;
  onOpenBenefitsModal: () => void;
  onOpenCartridgeModal: () => void;
  onOpenBiographyModal: () => void;
  onStartNewAdventure: () => void;
  activeMobileTab: 'status' | 'story' | 'logs';
  onSelectMobileTab: (tab: 'status' | 'story' | 'logs') => void;
  isGameActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentWorld,
  chapterTitle,
  turnCount = 0,
  hasConfiguredKey,
  currentUser,
  onOpenSettingsModal,
  onOpenSponsorModal,
  onOpenSaveModal,
  onOpenAuthModal,
  onOpenAdminModal,
  onOpenAboutModal,
  onOpenBenefitsModal,
  onOpenCartridgeModal,
  onOpenBiographyModal,
  onStartNewAdventure,
  activeMobileTab,
  onSelectMobileTab,
  isGameActive,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 text-zinc-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: App Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartNewAdventure}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-zinc-950 shadow-lg shadow-amber-500/20 font-bold hover:scale-105 transition-transform"
            title="回到冒險起點"
          >
            <Compass className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base sm:text-lg tracking-wide bg-gradient-to-r from-amber-200 via-amber-100 to-zinc-300 bg-clip-text text-transparent">
                AI 文字冒險遊戲產生器
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/80 text-amber-400 border border-zinc-700/60 hidden lg:inline-block">
                多世界線
              </span>
            </div>
            {isGameActive && currentWorld ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="text-amber-400 font-medium">【{currentWorld}】</span>
                <span className="truncate max-w-[140px] sm:max-w-xs text-zinc-300 font-serif">
                  {chapterTitle || '序章'}
                </span>
                <span className="hidden md:inline text-zinc-500">· 第 {turnCount} 幕</span>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 hidden sm:block">
                自訂第三方 API · 自由編織命運與冒險
              </p>
            )}
          </div>
        </div>

        {/* Center: Navigation Shortcuts (Desktop) */}
        <nav className="hidden xl:flex items-center gap-1 text-xs text-zinc-400">
          <button
            onClick={onOpenCartridgeModal}
            className="px-2.5 py-1.5 rounded-lg hover:text-cyan-300 hover:bg-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <Disc3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>卡帶庫</span>
          </button>
          <button
            onClick={onOpenAboutModal}
            className="px-2.5 py-1.5 rounded-lg hover:text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            關於網站
          </button>
          <button
            onClick={onOpenBenefitsModal}
            className="px-2.5 py-1.5 rounded-lg hover:text-amber-300 hover:bg-zinc-900 transition-colors flex items-center gap-1"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span>會員福利</span>
          </button>
          {isGameActive && (
            <button
              onClick={onOpenBiographyModal}
              className="px-2.5 py-1.5 rounded-lg hover:text-amber-300 hover:bg-zinc-900 transition-colors flex items-center gap-1"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>冒險傳記</span>
            </button>
          )}
        </nav>

        {/* Right: Actions, Modals & User state */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* New Game */}
          {isGameActive && (
            <button
              onClick={onStartNewAdventure}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition-all hover:border-amber-500/40"
              title="重新創建角色與故事"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">新冒險</span>
            </button>
          )}

          {/* Save / Cache Manager (Export / Import) */}
          <button
            onClick={onOpenSaveModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 transition-all"
            title="歷史存檔與遊戲快取導出/導入"
          >
            <Save className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">快取/存檔</span>
          </button>

          {/* Sponsor Developer */}
          <button
            onClick={onOpenSponsorModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/40 transition-all active:scale-95"
            title="贊助開發者或兌換贊助碼"
          >
            <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
            <span className="hidden sm:inline">贊助</span>
          </button>

          {/* Auth / Account */}
          <button
            onClick={onOpenAuthModal}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              currentUser
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
            title={currentUser ? `已登入：${currentUser.nickname}` : '登入/註冊帳戶'}
          >
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">
              {currentUser ? currentUser.nickname.slice(0, 5) : '登入'}
            </span>
          </button>

          {/* API Settings */}
          <button
            onClick={onOpenSettingsModal}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              hasConfiguredKey
                ? 'bg-zinc-900 border-zinc-700 hover:border-zinc-500 text-zinc-300'
                : 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 animate-pulse'
            }`}
            title="配置 API 接口、模型與 Token"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">API設定</span>
            {hasConfiguredKey ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Admin Portal Button */}
          <button
            onClick={onOpenAdminModal}
            className="p-1.5 rounded-xl text-zinc-500 hover:text-amber-300 hover:bg-zinc-900 transition-colors"
            title="管理後台 (GM Portal)"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      {isGameActive && (
        <div className="lg:hidden grid grid-cols-3 border-t border-zinc-800/80 bg-zinc-950 text-xs text-zinc-400">
          <button
            onClick={() => onSelectMobileTab('status')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeMobileTab === 'status'
                ? 'border-amber-500 text-amber-400 font-semibold bg-amber-500/5'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>角色狀態</span>
          </button>
          <button
            onClick={() => onSelectMobileTab('story')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeMobileTab === 'story'
                ? 'border-amber-500 text-amber-400 font-semibold bg-amber-500/5'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>故事舞台</span>
          </button>
          <button
            onClick={() => onSelectMobileTab('logs')}
            className={`py-2.5 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeMobileTab === 'logs'
                ? 'border-amber-500 text-amber-400 font-semibold bg-amber-500/5'
                : 'border-transparent hover:text-zinc-200'
            }`}
          >
            <ScrollText className="w-4 h-4" />
            <span>任務與記錄</span>
          </button>
        </div>
      )}
    </header>
  );
};
