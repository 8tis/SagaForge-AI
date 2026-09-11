import React, { useState } from 'react';
import { GameCartridge, WorldGenre } from '../types';
import { GAME_CARTRIDGES } from '../data/cartridges';
import { Disc3, Play, Sparkles, Filter, X, Zap } from 'lucide-react';

interface CartridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCartridge: (cartridge: GameCartridge) => void;
  hasCustomActionDlc: boolean;
  onOpenSponsorModal: () => void;
}

export const CartridgeModal: React.FC<CartridgeModalProps> = ({
  isOpen,
  onClose,
  onSelectCartridge,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  if (!isOpen) return null;

  const genres = ['all', ...Array.from(new Set(GAME_CARTRIDGES.map((c) => c.genre)))];

  const filtered = selectedGenre === 'all'
    ? GAME_CARTRIDGES
    : GAME_CARTRIDGES.filter((c) => c.genre === selectedGenre);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Disc3 className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>遊戲卡帶庫 (Cartridge Library)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-medium border border-cyan-500/30">
                  經典預設劇本
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                精選大師級世界線與開局，一鍵載入即可投入高沉浸感的故事冒險
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Genre Filter Tabs */}
        <div className="my-4 flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
          <span className="text-zinc-500 flex items-center gap-1 mr-1 text-[11px]">
            <Filter className="w-3 h-3" />
            <span>分類：</span>
          </span>
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors border ${
                selectedGenre === g
                  ? 'bg-amber-500 text-zinc-950 font-bold border-amber-500'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800'
              }`}
            >
              {g === 'all' ? '全部卡帶' : g}
            </button>
          ))}
        </div>

        {/* Cartridge Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((cart) => (
            <div
              key={cart.id}
              className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-cyan-500/50 transition-all flex flex-col justify-between group space-y-3 shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {cart.genre} · {cart.difficulty}難度
                  </span>
                  {cart.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                      {cart.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors">
                  {cart.title}
                </h3>
                <p className="text-[11px] text-amber-300/90 font-medium mt-0.5">
                  {cart.tagline}
                </p>
                <p className="text-xs text-zinc-400 mt-2 leading-relaxed line-clamp-3">
                  {cart.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500">作者：{cart.author || '社群'}</span>
                <button
                  onClick={() => {
                    onSelectCartridge(cart);
                    onClose();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center gap-1.5 transition-all group-hover:scale-[1.02]"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>啟動此卡帶</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
