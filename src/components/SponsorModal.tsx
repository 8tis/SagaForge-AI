import React, { useState } from 'react';
import {
  Heart,
  Crown,
  Sparkles,
  Zap,
  Coffee,
  CheckCircle2,
  ExternalLink,
  X,
  Gift,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { PublicSiteConfig, UserProfile } from '../types';

interface SponsorModalProps {
  isOpen: boolean;
  onClose: () => void;
  publicConfig: PublicSiteConfig | null;
  currentUser: UserProfile | null;
  onRedeemSuccess: (type: string, msg: string) => void;
}

export const SponsorModal: React.FC<SponsorModalProps> = ({
  isOpen,
  onClose,
  publicConfig,
  currentUser,
  onRedeemSuccess,
}) => {
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || isRedeeming) return;

    setIsRedeeming(true);
    setRedeemError(null);
    setRedeemSuccessMsg(null);

    try {
      const res = await fetch('/api/sponsor/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          email: currentUser?.email || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '兑换失败，请检查赞助码');
      }

      setRedeemSuccessMsg(data.message || '恭喜，赞助权益已成功激活！');
      setCode('');
      onRedeemSuccess(data.codeType, data.message);
    } catch (err: any) {
      setRedeemError(err.message || '兑换发生异常，请重试');
    } finally {
      setIsRedeeming(false);
    }
  };

  const isVip = currentUser?.isVip || false;
  const hasDlc = currentUser?.hasCustomActionDlc || false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/30 text-rose-400">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>贊助開發者 · 解鎖專屬特權</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  社群共創
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                本專案由獨立開發者持續維護，您的每一份慷慨支持都化為創作的燃料！
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

        {/* User's current privileges */}
        {currentUser && (
          <div className="my-4 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">當前帳戶：</span>
              <strong className="text-zinc-200">{currentUser.nickname} ({currentUser.email})</strong>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                  isVip
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                {isVip ? '贊助會員' : '免費玩家'}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 ${
                  hasDlc
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                {hasDlc ? '已啟動自訂動作 DLC' : '未加購 DLC'}
              </span>
            </div>
          </div>
        )}

        {/* Sponsor Tiers Grid */}
        <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1: 贊助會員 */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-amber-500/30 relative flex flex-col justify-between hover:border-amber-500/60 transition-all">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Crown className="w-4 h-4" />
                  <span>贊助會員 (Sponsor Tier)</span>
                </span>
                <span className="text-sm font-extrabold text-amber-300">$5 USD / ¥35</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                專為熱愛文字冒險的先鋒玩家設計，支持伺服器算力與劇情庫更新。
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>解鎖全部官方精選「遊戲卡帶庫」劇本</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>尊爵黃金暱稱與專屬身份光環</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>支援雲端存檔永久保留多個進度槽位</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Tier 2: 自訂動作 DLC */}
          <div className="p-4 rounded-2xl bg-zinc-950/70 border border-purple-500/30 relative flex flex-col justify-between hover:border-purple-500/60 transition-all">
            <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-zinc-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase shadow">
              高自由度旗艦 DLC
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>自訂動作 DLC 功能</span>
                </span>
                <span className="text-sm font-extrabold text-purple-300">$10 USD / ¥70</span>
              </div>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                突破常規選項限制！在故事舞台自由輸入任何你想採取的行動，AI 即時做出專屬反饋。
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>解除自由輸入框鎖定，任意輸入奇思妙想</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>AI 即時演算動態因果、專屬特長與特殊結局</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>包含贊助會員全部特權</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sponsor QR & Payment Links */}
        <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800 flex flex-col sm:flex-row items-center gap-5 my-4">
          {publicConfig?.sponsorQrUrl && (
            <div className="w-32 h-32 bg-zinc-900 rounded-xl p-2 border border-zinc-700 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={publicConfig.sponsorQrUrl}
                alt="贊助二維碼"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h4 className="text-sm font-bold text-zinc-200">
              {publicConfig?.sponsorTitle || '贊助支付與支持管道'}
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {publicConfig?.sponsorNotice ||
                '您可以透過掃描二維碼或點擊下方 BuyMeACoffee 連結進行贊助。付款時備註您的 Email，我們將發放專屬【贊助碼】！'}
            </p>
            {publicConfig?.sponsorLink && (
              <a
                href={publicConfig.sponsorLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold transition-all mt-1"
              >
                <Coffee className="w-4 h-4" />
                <span>前往 BuyMeACoffee 贊助頁面</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Redeem Code Section (核心要求：支持赞助码/兑换码) */}
        <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-zinc-950 to-zinc-900 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-zinc-100">持有贊助碼？立即輸入兌換啟動</h3>
          </div>
          <p className="text-xs text-zinc-400 mb-3">
            如果您已獲得管理員或贊助頁面發放的【贊助兌換碼】（如 VIP-XXXX 或 DLC-XXXX），請在下方輸入：
          </p>

          <form onSubmit={handleRedeem} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="例如：VIP-HERO-8888 或 DLC-ACTION-9999"
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-amber-400 font-mono tracking-wider text-zinc-100 placeholder-zinc-500 uppercase"
            />
            <button
              type="submit"
              disabled={isRedeeming || !code.trim()}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-500 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 disabled:cursor-not-allowed"
            >
              {isRedeeming ? (
                <span>驗證中...</span>
              ) : (
                <>
                  <Gift className="w-3.5 h-3.5" />
                  <span>立即兌換</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback */}
          {redeemSuccessMsg && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2 animate-fade-in">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{redeemSuccessMsg}</span>
            </div>
          )}

          {redeemError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{redeemError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
