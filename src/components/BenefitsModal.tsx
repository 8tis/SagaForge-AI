import React from 'react';
import { Crown, Check, X, Zap, Gift, ShieldCheck } from 'lucide-react';

interface BenefitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSponsor: () => void;
}

export const BenefitsModal: React.FC<BenefitsModalProps> = ({ isOpen, onClose, onOpenSponsor }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">會員福利與特權對比</h2>
              <p className="text-xs text-zinc-400">感謝支持文字冒險專案，選擇最適合你的冒險方案</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="my-5 border border-zinc-800 rounded-2xl overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-zinc-950 text-zinc-400 font-bold border-b border-zinc-800">
              <tr>
                <th className="p-3">功能特性</th>
                <th className="p-3 text-center">免費玩家</th>
                <th className="p-3 text-center text-amber-400">贊助會員 ($5)</th>
                <th className="p-3 text-center text-purple-400">自訂動作 DLC ($10)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70 bg-zinc-900/50">
              <tr>
                <td className="p-3 text-zinc-200 font-medium">自訂第三方 API (DeepSeek/Gemini等)</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 完整支援</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 完整支援</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 完整支援</td>
              </tr>
              <tr>
                <td className="p-3 text-zinc-200 font-medium">9大經典世界觀與角色設定隨機骰子</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 支援</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 支援</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 支援</td>
              </tr>
              <tr>
                <td className="p-3 text-zinc-200 font-medium">遊戲快取 JSON 一鍵導入 / 導出</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 支援</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 支援</td>
                <td className="p-3 text-center text-emerald-400 font-bold">✓ 支援</td>
              </tr>
              <tr>
                <td className="p-3 text-zinc-200 font-medium">官方精選「遊戲卡帶庫」劇本</td>
                <td className="p-3 text-center text-zinc-500">基礎卡帶</td>
                <td className="p-3 text-center text-amber-300 font-bold">★ 全部無限暢玩</td>
                <td className="p-3 text-center text-purple-300 font-bold">★ 全部無限暢玩</td>
              </tr>
              <tr>
                <td className="p-3 text-zinc-200 font-medium">自訂文字動作輸入 (自由度無上限)</td>
                <td className="p-3 text-center text-zinc-600">—</td>
                <td className="p-3 text-center text-zinc-600">—</td>
                <td className="p-3 text-center text-purple-400 font-extrabold">★ 永久解鎖</td>
              </tr>
              <tr>
                <td className="p-3 text-zinc-200 font-medium">五章冒險史詩傳記小說生成</td>
                <td className="p-3 text-center text-emerald-400">✓ 支援</td>
                <td className="p-3 text-center text-emerald-400">✓ 支援</td>
                <td className="p-3 text-center text-emerald-400">✓ 支援</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* CTA */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-zinc-400">
            贊助後將自動獲取【贊助碼】，在贊助彈窗中填寫即可即時解鎖全部權限。
          </p>
          <button
            onClick={() => {
              onClose();
              onOpenSponsor();
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shrink-0 shadow-md transition-all active:scale-95"
          >
            前往贊助或輸入贊助碼
          </button>
        </div>
      </div>
    </div>
  );
};
