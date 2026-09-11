import React from 'react';
import { CharacterState, WorldGenre } from '../types';
import { WORLD_PRESETS } from '../data/worlds';
import {
  Heart,
  Zap,
  Sword,
  Sparkles,
  Package,
  Bookmark,
  User,
  Shield,
  Sparkle,
} from 'lucide-react';

interface CharacterPanelProps {
  state: CharacterState;
  characterDescription: string;
  worldGenre: WorldGenre;
  onUseItem?: (item: string) => void;
  isLoading?: boolean;
  isEnding?: boolean;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  state,
  characterDescription,
  worldGenre,
  onUseItem,
  isLoading = false,
  isEnding = false,
}) => {
  const worldInfo = WORLD_PRESETS[worldGenre] || WORLD_PRESETS['奇幻'];
  const energyLabel = worldInfo.energyName || '魔法 / 精力';

  // HP percentage
  const hpPercent = Math.min(100, Math.max(0, Math.round((state.hp / (state.maxHp || 100)) * 100)));
  const mpPercent = Math.min(100, Math.max(0, Math.round((state.mp / (state.maxMp || 100)) * 100)));

  // Determine HP bar color
  let hpBarColor = 'bg-emerald-500';
  let hpTextColor = 'text-emerald-400';
  if (hpPercent <= 25) {
    hpBarColor = 'bg-rose-500';
    hpTextColor = 'text-rose-400';
  } else if (hpPercent <= 50) {
    hpBarColor = 'bg-amber-500';
    hpTextColor = 'text-amber-400';
  }

  return (
    <aside className="h-full flex flex-col bg-zinc-900/70 border-r border-zinc-800 text-zinc-200 overflow-y-auto custom-scrollbar p-4 space-y-5">
      {/* Header Profile */}
      <div className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-indigo-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-zinc-100 truncate">冒险者设定</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {worldGenre}
              </span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5" title={characterDescription}>
              {characterDescription}
            </p>
          </div>
        </div>
      </div>

      {/* HP & MP / Energy Gauges */}
      <div className="space-y-3 p-3.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/80">
        {/* HP */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Heart className={`w-3.5 h-3.5 ${hpTextColor} fill-current`} />
              <span>生命值 (HP)</span>
            </span>
            <span className={`font-mono text-xs ${hpTextColor}`}>
              {state.hp} / {state.maxHp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-500 ${hpBarColor}`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* MP / Energy */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Zap className="w-3.5 h-3.5 text-cyan-400 fill-current" />
              <span>{energyLabel}</span>
            </span>
            <span className="font-mono text-xs text-cyan-400">
              {state.mp} / {state.maxMp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-cyan-500 to-indigo-500"
              style={{ width: `${mpPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Equipment (装备) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <Sword className="w-3.5 h-3.5 text-amber-400" />
          <span>穿戴装备 ({state.equipment.length})</span>
        </div>
        {state.equipment.length > 0 ? (
          <div className="grid grid-cols-1 gap-1.5">
            {state.equipment.map((item, idx) => (
              <div
                key={idx}
                className="px-3 py-2 rounded-xl bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 flex items-center gap-2 text-xs transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                <span className="text-zinc-200 font-medium">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-950/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
            暂无装备
          </div>
        )}
      </div>

      {/* Skills (技能) */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>习得技能 ({state.skills.length})</span>
        </div>
        {state.skills.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {state.skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-950/40 text-indigo-200 border border-indigo-500/30 text-xs font-medium flex items-center gap-1.5"
              >
                <Shield className="w-3 h-3 text-indigo-400" />
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-950/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
            未习得特殊技能
          </div>
        )}
      </div>

      {/* Inventory (物品栏 - 赛博徒步风格可交互行装) */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>行囊道具 ({state.inventory.length})</span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-medium">点击可即时使用</span>
        </div>
        {state.inventory.length > 0 ? (
          <div className="grid grid-cols-1 gap-1.5">
            {state.inventory.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80 hover:border-amber-500/40 flex items-center justify-between text-xs text-zinc-300 transition-all group"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-amber-400 group-hover:scale-105 transition-transform">
                    <Sparkle className="w-3 h-3" />
                  </div>
                  <span className="truncate font-serif text-xs text-zinc-200 font-medium">{item}</span>
                </div>
                {onUseItem ? (
                  <button
                    type="button"
                    disabled={isLoading || isEnding}
                    onClick={() => onUseItem(item)}
                    title={`在当前局势中使用「${item}」`}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/15 hover:bg-amber-500/25 active:bg-amber-500/40 text-amber-300 border border-amber-500/40 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-1"
                  >
                    <span>使用</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded shrink-0">道具</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-zinc-950/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
            行囊空空如也，在旅途中探索以拾取奇物
          </div>
        )}
      </div>

      {/* Flags / Milestones */}
      {state.flags && Object.keys(state.flags).length > 0 && (
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
            <Bookmark className="w-3 h-3 text-amber-400" />
            <span>命运印记</span>
          </div>
          <div className="space-y-1">
            {Object.entries(state.flags).map(([k, v], idx) => (
              <div key={idx} className="text-[11px] text-zinc-400 bg-zinc-950/40 px-2.5 py-1 rounded-md border border-zinc-800/50 truncate">
                <span className="text-zinc-500">{k}: </span>
                <span className="text-zinc-300">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
