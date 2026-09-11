import React, { useState, useEffect, useRef } from 'react';
import { StoryTurn, MiniGameChallenge, WorldGenre } from '../types';
import { MiniGameWidget } from './MiniGameWidget';
import {
  AppLanguage,
  I18N_TEXTS,
  SURVIVAL_QUOTES_EN,
  DEDUCTION_STAGES_EN,
} from '../utils/i18n';
import {
  Send,
  Sparkles,
  RotateCcw,
  Check,
  Copy,
  Trophy,
  Skull,
  Compass,
  CornerDownRight,
  Flame,
  Zap,
  BookOpen,
  Image as ImageIcon,
  ZoomIn,
  Dices,
  RefreshCw,
  X,
  Clock,
  Mountain,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  Scroll,
  Gamepad2,
  KeyRound,
} from 'lucide-react';

interface StoryDisplayProps {
  turns: StoryTurn[];
  currentOptions: string[];
  isLoading: boolean;
  isEnding: boolean;
  endingType?: string;
  onSelectAction: (action: string) => void;
  onRestartGame: () => void;
  hasCustomActionDlc: boolean;
  onOpenSponsorModal: () => void;
  onOpenBiographyModal: () => void;
  onRegenerateImage?: (turnIndex: number) => void;
  currentMiniGame?: MiniGameChallenge | null;
  worldGenre?: WorldGenre;
  language?: AppLanguage;
}

// 《赛博徒步》与硬核生存经典箴言
const SURVIVAL_QUOTES = [
  { quote: '抉如投石，时空生漪。', source: '《赛博徒步之生死鳌太线》' },
  { quote: '失温常发生在风力突增的瞬间，警惕每一缕未加防备的寒意。', source: '荒野生存指南' },
  { quote: '背包里的每一克负重，都是你与死神博弈的沉重筹码。', source: '极端远征纪要' },
  { quote: '在迷茫未卜的荒野中，停步辨明方向远比盲目狂奔更需要勇气。', source: '迷雾穿越准则' },
  { quote: '刀剑出鞘必有回音，每一个细微的念想都在重构未来的因果。', source: '时空因果律' },
  { quote: '危难关头的每一份干粮与绷带，往往比神兵利器更能救你于水火。', source: '行者手记' },
  { quote: '当你在凝视深渊时，别忘了检查你的理智值与防毒面具。', source: '旧日调查员遗志' },
  { quote: '真正的求生者从不盲目冒险，他们只是做好了面对严寒的最坏准备。', source: '探险家铭文' },
];

// 等待推演的阶段指示
const DEDUCTION_STAGES = [
  { icon: '🎲', title: '命运检定', desc: '正在掷出 D20 骰子判定因果分支与偶发异动...' },
  { icon: '🌌', title: '世界线观测', desc: '正在推演环境剧变、各方阵营反应与局势演化...' },
  { icon: '⚖️', title: '数值结算', desc: '正在结算生命值、内力/精力、装备磨损与道具判定...' },
  { icon: '🎨', title: '意境描摹', desc: '绘师正在为当前场景研墨着色，生成沉浸插画...' },
  { icon: '📜', title: '史诗编撰', desc: '因果已然定格，正在将你的抉择与结局镌刻入篇章...' },
];

export const StoryDisplay: React.FC<StoryDisplayProps> = ({
  turns,
  currentOptions,
  isLoading,
  isEnding,
  endingType = 'none',
  onSelectAction,
  onRestartGame,
  hasCustomActionDlc,
  onOpenSponsorModal,
  onOpenBiographyModal,
  onRegenerateImage,
  currentMiniGame,
  worldGenre = '仙侠',
  language = 'zh',
}) => {
  const t = I18N_TEXTS[language] || I18N_TEXTS.zh;
  const quotesList = language === 'en' ? SURVIVAL_QUOTES_EN : SURVIVAL_QUOTES;
  const deductionStagesList = language === 'en' ? DEDUCTION_STAGES_EN : DEDUCTION_STAGES;

  const [customAction, setCustomAction] = useState('');
  const [copied, setCopied] = useState(false);
  const [previewImage, setPreviewImage] = useState<{
    url: string;
    title: string;
    prompt?: string;
    model?: string;
  } | null>(null);
  const [activeMiniGame, setActiveMiniGame] = useState<MiniGameChallenge | null>(null);

  // 浏览模式：'focus' (单幕翻页模式 - 默认) vs 'timeline' (折叠长卷模式)
  const [viewMode, setViewMode] = useState<'focus' | 'timeline'>(() => {
    return (localStorage.getItem('story_display_view_mode') as 'focus' | 'timeline') || 'focus';
  });

  // 单幕翻页模式下当前检视的幕次索引
  const [focusTurnIndex, setFocusTurnIndex] = useState(Math.max(0, turns.length - 1));

  // 长卷模式下手动展开的历史幕索引集合
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});

  // 等待状态：秒表计时器与阶段轮播
  const [elapsedTime, setElapsedTime] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // 互动微游戏：D20 骰子掷骰
  const [diceRoll, setDiceRoll] = useState<{ value: number; label: string } | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 当幕次增加时，自动跳到最新一幕
  useEffect(() => {
    setFocusTurnIndex(Math.max(0, turns.length - 1));
  }, [turns.length]);

  // 当翻页切换幕次时，平滑回到顶部方便顺畅阅读本幕剧情
  useEffect(() => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [focusTurnIndex]);

  // 保存浏览模式偏好
  const toggleViewMode = (mode: 'focus' | 'timeline') => {
    setViewMode(mode);
    localStorage.setItem('story_display_view_mode', mode);
  };

  // 长卷模式下自动滚动到底部最新幕
  useEffect(() => {
    if (viewMode === 'timeline') {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [turns.length, isLoading, currentOptions.length, viewMode]);

  // Stopwatch & stage interval during loading
  useEffect(() => {
    if (!isLoading) {
      setElapsedTime(0);
      setStageIndex(0);
      return;
    }
    const start = Date.now();
    const timer = setInterval(() => {
      const sec = (Date.now() - start) / 1000;
      setElapsedTime(sec);
      setStageIndex(Math.min(deductionStagesList.length - 1, Math.floor(sec / 2.2)));
    }, 100);

    const quoteTimer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotesList.length);
    }, 3200);

    return () => {
      clearInterval(timer);
      clearInterval(quoteTimer);
    };
  }, [isLoading, deductionStagesList.length, quotesList.length]);

  // Interactive dice rolling
  const rollDice = () => {
    setIsRolling(true);
    setTimeout(() => {
      const val = Math.floor(Math.random() * 20) + 1;
      let label = '';
      if (val === 20) {
        label = '🌟 大成功！(Critical Success) 诸神向你投来赞许的目光！';
      } else if (val >= 18) {
        label = '✨ 极佳检定！局势正向你偏转！';
      } else if (val >= 10) {
        label = '🛡️ 检定通过！稳扎稳打，破局有望！';
      } else if (val >= 2) {
        label = '⚠️ 检定受挫！暗潮汹涌，危机逼近！';
      } else {
        label = '💀 大失败！(Critical Fumble) 厄运之神正在狂笑！';
      }
      setDiceRoll({ value: val, label });
      setIsRolling(false);
    }, 280);
  };

  const currentTurn = turns[focusTurnIndex] || turns[turns.length - 1];
  const isViewingLatest = focusTurnIndex === turns.length - 1;
  const prevTurnOfFocus = focusTurnIndex > 0 ? turns[focusTurnIndex - 1] : null;

  // 提取当前最新小游戏挑战（仅当正在查看最新一幕且该幕触发了随机机关事件时显示）
  const latestTurn = turns[turns.length - 1];
  const activeChallenge = isViewingLatest ? (currentMiniGame || latestTurn?.miniGame || null) : null;

  // 键盘快捷键监听：左右方向键翻页，数字键1-4选择行动
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement === inputRef.current) return;
      if (isLoading) return;

      // 翻页快捷键（仅在单幕翻页模式下有效）
      if (viewMode === 'focus') {
        if (e.key === 'ArrowLeft' && focusTurnIndex > 0) {
          e.preventDefault();
          setFocusTurnIndex((prev) => Math.max(0, prev - 1));
          return;
        }
        if (e.key === 'ArrowRight' && !isViewingLatest) {
          e.preventDefault();
          setFocusTurnIndex((prev) => Math.min(turns.length - 1, prev + 1));
          return;
        }
      }

      // 数字键选择行动（仅在查看最新幕且未结束时有效）
      if (isViewingLatest && !isEnding) {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= currentOptions.length) {
          e.preventDefault();
          onSelectAction(currentOptions[num - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentOptions, isLoading, isEnding, onSelectAction, viewMode, focusTurnIndex, isViewingLatest, turns.length]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAction.trim() || isLoading || isEnding) return;

    if (!hasCustomActionDlc) {
      onOpenSponsorModal();
      return;
    }

    onSelectAction(customAction.trim());
    setCustomAction('');
  };

  const handleCopyStory = () => {
    const fullText = turns
      .map(
        (t) =>
          `【第 ${t.turnNumber} 幕：${t.chapterTitle || '冒險'}】\n${t.story}${
            t.selectedAction ? `\n\n▶ 你的抉擇：${t.selectedAction}` : ''
          }`
      )
      .join('\n\n--------------------\n\n');

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="h-full flex flex-col bg-zinc-950 text-zinc-100 relative overflow-hidden">
      {/* Top View Control Toolbar */}
      <div className="px-4 sm:px-6 py-2.5 bg-zinc-900/90 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-2.5 shrink-0 backdrop-blur-sm z-10">
        {/* Left: Turn Stepper / Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {viewMode === 'focus' ? (
            <>
              <button
                type="button"
                disabled={focusTurnIndex <= 0}
                onClick={() => setFocusTurnIndex((prev) => Math.max(0, prev - 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title={`${t.prevTurn} (←)`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden md:inline">{t.prevTurn}</span>
              </button>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs font-semibold shadow-inner">
                <span className="text-amber-400">{t.turnPrefix} {currentTurn?.turnNumber || 1} {t.turnSuffix}</span>
                <span className="text-zinc-600">/</span>
                <span className="text-zinc-400">{t.turnTotal}{turns.length}{t.turnsLabel}</span>
              </div>

              <button
                type="button"
                disabled={isViewingLatest}
                onClick={() => setFocusTurnIndex((prev) => Math.min(turns.length - 1, prev + 1))}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-zinc-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                title={`${t.nextTurn} (→)`}
              >
                <span className="hidden md:inline">{t.nextTurn}</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              {!isViewingLatest && (
                <button
                  type="button"
                  onClick={() => setFocusTurnIndex(turns.length - 1)}
                  className="ml-1 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold border border-amber-500/40 transition-all active:scale-95 animate-pulse flex items-center gap-1 cursor-pointer"
                  title={t.jumpToLatest}
                >
                  <span>{t.jumpToLatest}</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-serif font-bold">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.turnTotal} {turns.length} {t.turnsLabel}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: View Mode Toggle & Copy */}
        <div className="flex items-center gap-2">
          {/* Mode switch pill */}
          <div className="flex items-center p-0.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => toggleViewMode('focus')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'focus'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={t.focusMode}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>{t.focusMode}</span>
            </button>
            <button
              type="button"
              onClick={() => toggleViewMode('timeline')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title={t.timelineMode}
            >
              <Scroll className="w-3.5 h-3.5" />
              <span>{t.timelineMode}</span>
            </button>
          </div>

          <button
            onClick={handleCopyStory}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            title={t.copyStory}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Story Content Area */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 space-y-6"
      >
        {/* MODE 1: FOCUS VIEW (单幕翻页专注模式 - 告别无限长滚动) */}
        {viewMode === 'focus' && currentTurn && (
          <div className="space-y-4 animate-fade-in">
            {/* History Review Banner when not on latest turn */}
            {!isViewingLatest && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-300 animate-fade-in shadow-inner">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    正在回顾第 <strong>{currentTurn.turnNumber}</strong> 幕历史档案（只读回顾）
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFocusTurnIndex(turns.length - 1)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors shrink-0 cursor-pointer shadow"
                >
                  返回最新第 {turns.length} 幕 ⏩
                </button>
              </div>
            )}

            {/* Context from previous turn's choice */}
            {prevTurnOfFocus?.selectedAction && (
              <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-center gap-2 text-xs text-zinc-400 font-sans">
                <CornerDownRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">
                  <strong className="text-zinc-300">承接抉择：</strong>
                  {prevTurnOfFocus.selectedAction}
                </span>
              </div>
            )}

            {/* Turn Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-serif font-bold">
                  <Flame className="w-3.5 h-3.5" />
                  <span>第 {currentTurn.turnNumber} 幕</span>
                </div>
                {currentTurn.chapterTitle && (
                  <h3 className="font-serif font-bold text-base sm:text-lg text-zinc-100 tracking-wide">
                    {currentTurn.chapterTitle}
                  </h3>
                )}
              </div>
              {currentTurn.timestamp && (
                <span className="text-[11px] text-zinc-500 font-mono">
                  {new Date(currentTurn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {/* Scene Illustration Card */}
            {currentTurn.imageUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800/90 shadow-2xl bg-zinc-950 group">
                <img
                  src={currentTurn.imageUrl}
                  alt={currentTurn.chapterTitle || '场景插画'}
                  className="w-full max-h-72 sm:max-h-80 object-cover object-center group-hover:scale-102 transition-transform duration-700"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30 pointer-events-none" />

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        url: currentTurn.imageUrl!,
                        title: currentTurn.chapterTitle || `第 ${currentTurn.turnNumber} 幕场景`,
                        prompt: currentTurn.imagePrompt,
                        model: currentTurn.imageModel,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-zinc-200 text-xs flex items-center gap-1 backdrop-blur-md border border-white/10 shadow transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                    <span>查看大图</span>
                  </button>
                  {isViewingLatest && onRegenerateImage && (
                    <button
                      type="button"
                      onClick={() => onRegenerateImage(focusTurnIndex)}
                      className="p-1.5 rounded-lg bg-black/75 hover:bg-black text-zinc-200 text-xs flex items-center justify-center backdrop-blur-md border border-white/10 shadow transition-colors cursor-pointer"
                      title="重新绘制本幕场景"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  )}
                </div>

                <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 text-[11px] text-amber-300/90 font-serif font-medium bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  <ImageIcon className="w-3 h-3 text-amber-400" />
                  <span>场景意境插画 · {currentTurn.chapterTitle || '历程纪实'}</span>
                  {currentTurn.imageModel && (
                    <span className="ml-1 pl-1.5 border-l border-amber-500/30 text-[10px] text-amber-200/90 font-mono">
                      🎨 {currentTurn.imageModel}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Story Narrative Box */}
            <div className="p-5 sm:p-6 rounded-2xl border leading-relaxed text-xs sm:text-sm font-serif tracking-normal selection:bg-amber-500/30 bg-zinc-900/95 border-zinc-700/80 shadow-xl shadow-black/40 text-zinc-100">
              <div className="whitespace-pre-wrap leading-loose">{currentTurn.story}</div>
            </div>

            {/* Current chosen action if inspecting historical turn */}
            {currentTurn.selectedAction && !isViewingLatest && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-amber-300/90 pl-3 border-l-2 border-amber-500/40 py-1 font-sans">
                <CornerDownRight className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-amber-400">你当时做出的抉择：</strong>
                  {currentTurn.selectedAction}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MODE 2: TIMELINE VIEW (时间轴折叠长卷模式 - 历史幕自动折叠) */}
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {turns.map((turn, index) => {
              const isLatest = index === turns.length - 1;
              const isExpanded = isLatest || expandedTurns[index];

              if (!isExpanded) {
                // Collapsed historical card
                return (
                  <div
                    key={turn.turnNumber || index}
                    onClick={() => setExpandedTurns((prev) => ({ ...prev, [index]: true }))}
                    className="p-3 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between text-xs cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                        第 {turn.turnNumber} 幕
                      </span>
                      <span className="text-zinc-200 font-serif font-medium truncate">
                        {turn.chapterTitle || '冒险纪实'}
                      </span>
                      <span className="text-zinc-500 text-[11px] truncate hidden sm:inline">
                        — {turn.story.slice(0, 45)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-zinc-400 group-hover:text-amber-300 text-[11px] shrink-0 font-medium">
                      <span>展开</span>
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              }

              // Expanded turn card
              return (
                <div
                  key={turn.turnNumber || index}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    isLatest
                      ? 'bg-zinc-900/90 border-amber-500/40 shadow-xl'
                      : 'bg-zinc-900/60 border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20 text-xs">
                        第 {turn.turnNumber} 幕
                      </span>
                      {turn.chapterTitle && (
                        <h4 className="font-serif font-bold text-sm sm:text-base text-zinc-100">
                          {turn.chapterTitle}
                        </h4>
                      )}
                    </div>
                    {!isLatest && (
                      <button
                        type="button"
                        onClick={() => setExpandedTurns((prev) => ({ ...prev, [index]: false }))}
                        className="text-zinc-500 hover:text-zinc-300 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>收起</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {turn.imageUrl && (
                    <div className="relative mb-3 rounded-2xl overflow-hidden border border-zinc-800/90 shadow-lg bg-zinc-950 group">
                      <img
                        src={turn.imageUrl}
                        alt={turn.chapterTitle || '场景插画'}
                        className="w-full max-h-64 object-cover object-center"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-black/30 pointer-events-none" />
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: turn.imageUrl!,
                              title: turn.chapterTitle || `第 ${turn.turnNumber} 幕场景`,
                              prompt: turn.imagePrompt,
                              model: turn.imageModel,
                            })
                          }
                          className="px-2 py-1 rounded-lg bg-black/75 hover:bg-black text-zinc-200 text-xs flex items-center gap-1 backdrop-blur-md border border-white/10"
                        >
                          <ZoomIn className="w-3 h-3 text-amber-400" />
                          <span>大图</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 rounded-2xl border leading-relaxed text-xs sm:text-sm font-serif bg-zinc-900/80 border-zinc-800 text-zinc-200">
                    <div className="whitespace-pre-wrap leading-loose">{turn.story}</div>
                  </div>

                  {turn.selectedAction && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-amber-300/90 pl-3 border-l-2 border-amber-500/40 py-1 font-sans">
                      <CornerDownRight className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-amber-400">抉择：</strong>
                        {turn.selectedAction}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Rich Immersive Loading Experience (Shown when waiting for AI deduction) */}
        {isLoading && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900/95 to-zinc-950 border border-amber-500/40 shadow-2xl space-y-4 animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-1/4 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-lg animate-bounce">
                  {DEDUCTION_STAGES[stageIndex].icon}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-100 flex items-center gap-2">
                    <span>阶段 {stageIndex + 1}/5：{DEDUCTION_STAGES[stageIndex].title}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {DEDUCTION_STAGES[stageIndex].desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs font-mono text-amber-300 shadow-inner">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
                <span>推演耗时 {elapsedTime.toFixed(1)}s</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {DEDUCTION_STAGES.map((s, idx) => {
                const isActive = idx === stageIndex;
                const isDone = idx < stageIndex;
                return (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? 'bg-amber-400 shadow-sm shadow-amber-400/50'
                        : isDone
                        ? 'bg-amber-600/70'
                        : 'bg-zinc-800'
                    }`}
                  />
                );
              })}
            </div>

            {/* Cyberhiking Survival Quote Carousel */}
            <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/90 relative">
              <div className="flex items-start gap-2.5">
                <Mountain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1">
                  <p className="text-xs sm:text-sm font-serif italic text-amber-200/90 leading-relaxed transition-all duration-300">
                    “{SURVIVAL_QUOTES[quoteIndex].quote}”
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-0.5">
                    <span>—— {SURVIVAL_QUOTES[quoteIndex].source}</span>
                    <span className="text-zinc-600 font-sans">生存箴言轮播</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive D20 Destiny Dice Rolling Micro-Game */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-3 rounded-2xl border border-indigo-500/20">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Dices className={`w-4 h-4 text-indigo-400 shrink-0 ${isRolling ? 'animate-spin' : ''}`} />
                <div className="min-w-0">
                  <span className="text-xs text-zinc-200 font-medium block truncate">
                    {diceRoll ? diceRoll.label : '等待片刻？点击右侧掷一枚「命运 D20 骰子」测手气'}
                  </span>
                  {diceRoll && (
                    <span className="text-[10px] text-indigo-300/80 font-mono">
                      本次掷骰点数：D20 = {diceRoll.value} / 20
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={rollDice}
                disabled={isRolling}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-500/20 hover:bg-indigo-500/30 active:bg-indigo-500/40 text-indigo-200 border border-indigo-500/40 transition-all shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-sm"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>{diceRoll ? '再掷一次' : '掷命运检定骰'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Ending Card */}
        {isEnding && !isLoading && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-500/30 text-center space-y-4 shadow-2xl animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 mx-auto flex items-center justify-center">
              {endingType === 'defeat' ? (
                <Skull className="w-7 h-7 text-rose-400" />
              ) : (
                <Trophy className="w-7 h-7 text-amber-400" />
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-zinc-100">
                {endingType === 'defeat'
                  ? '身死道消 · 冒險終局'
                  : endingType === 'victory'
                  ? '加冕登峰 · 凱旋成就'
                  : '天地浩瀚 · 餘音開放結局'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-md mx-auto">
                你在此方世界线的历程已画下句点。你可以将本篇历程提炼为小说传记，或重开一段新的轮回。
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                onClick={onOpenBiographyModal}
                className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs sm:text-sm font-semibold flex items-center gap-2 border border-amber-500/40 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>生成史诗冒險传记</span>
              </button>
              <button
                onClick={handleCopyStory}
                className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-medium flex items-center gap-2 border border-zinc-700 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '已複製全篇史诗' : '复制历程文字'}</span>
              </button>
              <button
                onClick={onRestartGame}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>重开新冒险</span>
              </button>
            </div>
          </div>
        )}

        <div ref={scrollEndRef} />
      </div>

      {/* Bottom Action Area (Always readily accessible!) */}
      {!isEnding && (
        <>
          {/* If inspecting historical turn in focus mode, show a friendly jump-back reminder bar */}
          {viewMode === 'focus' && !isViewingLatest ? (
            <div className="p-3.5 sm:p-4 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-zinc-400 min-w-0">
                <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">
                  当前处于第 <strong>{currentTurn?.turnNumber}</strong> 幕阅览模式，下一步行动请前往最新第 <strong>{turns.length}</strong> 幕。
                </span>
              </div>
              <button
                type="button"
                onClick={() => setFocusTurnIndex(turns.length - 1)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0 cursor-pointer"
              >
                <span>跳回最新幕做抉择</span>
                <CornerDownRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-3.5 sm:p-4 bg-zinc-900/95 border-t border-zinc-800 backdrop-blur-md space-y-3 shrink-0">
              {/* Active MiniGame Challenge Card */}
              {activeChallenge && !isLoading && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-indigo-950/60 border border-amber-500/50 shadow-xl shadow-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                      <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[10px] uppercase tracking-wider border border-amber-500/30">
                          随机机关事件
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-100 truncate">
                          {activeChallenge.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                        {activeChallenge.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveMiniGame(activeChallenge)}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>破解机关 / 小游戏</span>
                  </button>
                </div>
              )}

              {/* Action Options */}
              {currentOptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
                    <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>请抉择你的下一步行动：</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 hidden sm:inline font-mono">
                      (键盘数字键 1-{currentOptions.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {currentOptions.map((option, idx) => (
                      <button
                        key={idx}
                        disabled={isLoading}
                        onClick={() => onSelectAction(option)}
                        className="w-full text-left p-3 sm:py-2.5 sm:px-4 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 text-xs sm:text-sm text-zinc-200 transition-all flex items-start sm:items-center gap-3 group active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                      >
                        <span className="w-5 h-5 rounded-md bg-zinc-800 group-hover:bg-amber-500 group-hover:text-zinc-950 font-mono text-xs font-bold flex items-center justify-center text-zinc-400 shrink-0 transition-colors">
                          {idx + 1}
                        </span>
                        <span className="flex-1 leading-snug">{option}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Action Input (DLC Gated) */}
              <form onSubmit={handleCustomSubmit} className="pt-1">
                <div className="relative flex items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    value={customAction}
                    disabled={isLoading}
                    onChange={(e) => setCustomAction(e.target.value)}
                    placeholder={
                      hasCustomActionDlc
                        ? '✨ 自订动作：自由输入任何奇思妙想行动（例如：趁守卫分心时偷换钥匙、尝试用幻术欺诈...）'
                        : '🔒 自订动作 DLC（赞助会员专属特权，点击右侧解锁或输入赞助码）'
                    }
                    className={`w-full pl-4 pr-24 py-2.5 bg-zinc-950 border rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all disabled:opacity-50 ${
                      hasCustomActionDlc
                        ? 'border-purple-500/40 focus:border-purple-400 focus:ring-1 focus:ring-purple-400'
                        : 'border-zinc-800'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || (!hasCustomActionDlc && false)}
                    className={`absolute right-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      hasCustomActionDlc
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-zinc-950 shadow'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {hasCustomActionDlc ? (
                      <>
                        <span>执行</span>
                        <Send className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 text-purple-400" />
                        <span>解锁DLC</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

      {/* Fullscreen Image Preview Lightbox */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-zinc-900 border border-zinc-700/80 rounded-3xl overflow-hidden shadow-2xl p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-serif font-bold text-zinc-100 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>{previewImage.title}</span>
                </h3>
                {previewImage.model && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono">
                    🎨 {previewImage.model}
                  </span>
                )}
              </div>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-zinc-800 bg-black flex items-center justify-center">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto object-contain mx-auto"
              />
            </div>

            {previewImage.prompt && (
              <p className="text-[11px] text-zinc-400 font-mono bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800/80 leading-relaxed">
                <strong className="text-amber-400 font-sans">意境提示词：</strong>{' '}
                {previewImage.prompt}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Interactive Mini-Game Widget Modal */}
      {activeMiniGame && (
        <MiniGameWidget
          isOpen={Boolean(activeMiniGame)}
          challenge={activeMiniGame}
          onClose={() => setActiveMiniGame(null)}
          onSuccess={(rewardAction) => {
            setActiveMiniGame(null);
            onSelectAction(rewardAction);
          }}
          onFailure={(penaltyAction) => {
            setActiveMiniGame(null);
            onSelectAction(penaltyAction);
          }}
          worldGenre={worldGenre}
        />
      )}
    </main>
  );
};
