import React, { useState } from 'react';
import { WorldGenre, GameCartridge } from '../types';
import { WORLD_PRESETS, WorldPreset } from '../data/worlds';
import {
  Sparkles,
  Dices,
  Wand2,
  Compass,
  ShieldAlert,
  Sliders,
  Disc3,
  Zap,
  Save,
  Lock,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface StartScreenProps {
  onStartGame: (world: WorldGenre, character: string) => void;
  isLoading: boolean;
  hasConfiguredKey: boolean;
  onOpenSettingsModal: () => void;
  onOpenCartridgeModal: () => void;
  onOpenSponsorModal: () => void;
  onOpenSaveModal: () => void;
  hasCustomActionDlc: boolean;
  customActionEnabled: boolean;
  onToggleCustomAction: () => void;
  activeCartridge: GameCartridge | null;
  onClearActiveCartridge: () => void;
}

const WORLD_GENRES: WorldGenre[] = [
  '奇幻',
  '科幻',
  '武侠',
  '仙侠',
  '克苏鲁',
  '宫斗',
  '赛博朋克',
  '末日生存',
  '悬疑侦探',
];

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  isLoading,
  hasConfiguredKey,
  onOpenSettingsModal,
  onOpenCartridgeModal,
  onOpenSponsorModal,
  onOpenSaveModal,
  hasCustomActionDlc,
  customActionEnabled,
  onToggleCustomAction,
  activeCartridge,
  onClearActiveCartridge,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<WorldGenre>(
    activeCartridge?.genre || '仙侠'
  );
  const [characterDesc, setCharacterDesc] = useState<string>(
    activeCartridge?.characterPreset ||
      '身懷上古殘缺銅鏡的外門雜役弟子，心思縝密，雖靈根駁雜但悟性奇高，正面臨宗門試煉的陰謀陷阱。'
  );

  const currentPreset: WorldPreset = WORLD_PRESETS[selectedGenre] || WORLD_PRESETS['奇幻'];

  const handleRandomize = () => {
    const list = currentPreset.characterPresets;
    const randomIndex = Math.floor(Math.random() * list.length);
    const chosen = list[randomIndex];
    setCharacterDesc(`${chosen.name}：${chosen.description}`);
  };

  const handleGenreChange = (genre: WorldGenre) => {
    setSelectedGenre(genre);
    if (activeCartridge) onClearActiveCartridge();
    const firstPreset = WORLD_PRESETS[genre].characterPresets[0];
    setCharacterDesc(`${firstPreset.name}：${firstPreset.description}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characterDesc.trim() || isLoading) return;
    onStartGame(selectedGenre, characterDesc.trim());
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-zinc-950 text-zinc-100">
      <div className="w-full max-w-3xl bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        {/* Atmospheric ambient backdrop glow */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Shortcuts Bar (Cartridges & Saves) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-6 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenCartridgeModal}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>選擇遊戲卡帶庫 ({activeCartridge ? '已選定' : '推薦劇本'})</span>
            </button>
            <button
              type="button"
              onClick={onOpenSaveModal}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Save className="w-3.5 h-3.5 text-cyan-400" />
              <span>導入存檔 / 讀取快取</span>
            </button>
          </div>

          {/* Custom Action DLC Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!hasCustomActionDlc) {
                  onOpenSponsorModal();
                } else {
                  onToggleCustomAction();
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                customActionEnabled && hasCustomActionDlc
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-purple-500/40'
              }`}
              title={
                hasCustomActionDlc
                  ? '點擊切換自訂動作功能'
                  : '自訂動作為贊助者專屬 DLC，點擊解鎖'
              }
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>自訂動作 DLC</span>
              {hasCustomActionDlc ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200">
                  {customActionEnabled ? '已啟用' : '關閉'}
                </span>
              ) : (
                <Lock className="w-3 h-3 text-zinc-500" />
              )}
            </button>
          </div>
        </div>

        {/* Active Cartridge Notification Banner if picked */}
        {activeCartridge && (
          <div className="mb-6 p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/40 flex items-center justify-between gap-3 text-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Disc3 className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-cyan-200">已載入卡帶：{activeCartridge.title}</span>
                <p className="text-zinc-400 text-[11px] mt-0.5">{activeCartridge.tagline}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearActiveCartridge}
              className="text-cyan-400 hover:text-zinc-200 text-xs font-semibold underline"
            >
              清除卡帶
            </button>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-7 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wide mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>支持自订第三方 API · 纯本地浏览器存储 · 密钥安全无忧</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-zinc-100 tracking-tight">
            定義你的英雄，開啟敘事冒險
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
            純文字互動 RPG。由 AI 動態演繹每一輪情境反饋、數值增減與命運抉擇。
          </p>
        </div>

        {/* Missing API Key Warning */}
        {!hasConfiguredKey && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-amber-200">尚未配置 API 访问密钥</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-medium">
                    🔒 仅存本地 · 绝不上云
                  </span>
                </div>
                <p className="text-zinc-400 text-xs mt-0.5">
                  点击右侧快速配置您的 DeepSeek、OpenRouter、OpenAI 或 Gemini 密钥（仅保存在您的当前浏览器本地缓存中）。
                </p>
              </div>
            </div>
            <button
              onClick={onOpenSettingsModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>配置 API</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* World Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-400" />
              <span>選擇冒險世界觀</span>
            </label>
            <div className="relative">
              <select
                value={selectedGenre}
                onChange={(e) => handleGenreChange(e.target.value as WorldGenre)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700/80 rounded-2xl text-zinc-100 text-sm font-medium focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all appearance-none cursor-pointer"
              >
                {WORLD_GENRES.map((genre) => (
                  <option key={genre} value={genre} className="bg-zinc-900 py-2">
                    {WORLD_PRESETS[genre].name} ({genre})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">
                ▼
              </div>
            </div>

            {/* Selected World Lore Preview Card */}
            <div className="mt-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-300">
              <div className="flex items-center justify-between font-semibold text-amber-300 mb-1">
                <span>{currentPreset.tagline}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-400">
                  能量體系：{currentPreset.energyName}
                </span>
              </div>
              <p className="text-zinc-400 leading-relaxed">{currentPreset.description}</p>
            </div>
          </div>

          {/* Character Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <span>主角設定與初始特質</span>
              </label>
              <button
                type="button"
                onClick={handleRandomize}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-zinc-800 transition-colors"
                title="隨機置換為另一名英雄預設"
              >
                <Dices className="w-3.5 h-3.5" />
                <span>隨機骰出設定</span>
              </button>
            </div>

            <textarea
              rows={4}
              value={characterDesc}
              onChange={(e) => setCharacterDesc(e.target.value)}
              placeholder="例如：出身邊陲荒村的見習魔劍士，擁有看透幻象的重瞳，性格警惕戒備，隨身攜帶著父親遺留下來的斷刃與半卷密信..."
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-700/80 rounded-2xl text-zinc-100 text-xs sm:text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all placeholder-zinc-500 resize-none leading-relaxed"
            />

            {/* Quick Preset Chips */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-zinc-500 mr-1">快捷原型：</span>
              {currentPreset.characterPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCharacterDesc(`${preset.name}：${preset.description}`)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 hover:border-amber-500/40 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !characterDesc.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>AI 大模型正在演算初始宿命與場景...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>啟程！開啟這場全新冒險</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
