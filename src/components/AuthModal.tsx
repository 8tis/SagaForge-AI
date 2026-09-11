import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Smile,
  Crown,
  Zap,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile, token: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    const endpoint = tab === 'login' ? '/api/auth/login' : '/api/auth/register';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          nickname: nickname.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '验证失败，请重试');
      }

      onLoginSuccess(data.user, data.token);
      setEmail('');
      setPassword('');
      setNickname('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-zinc-100 overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                {currentUser ? '冒險者帳戶中心' : tab === 'login' ? '登入帳戶' : '註冊新帳戶'}
              </h2>
              <p className="text-xs text-zinc-400">
                {currentUser
                  ? '檢視會員權益、已兌換贊助碼與帳號狀態'
                  : '登入以永久同步您的存檔進度與贊助特權'}
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

        {/* If user is logged in: display User Profile */}
        {currentUser ? (
          <div className="py-5 space-y-4">
            <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center font-bold text-lg text-zinc-950 shadow-md">
                  {currentUser.nickname.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-base text-zinc-100 truncate">{currentUser.nickname}</h3>
                  <p className="text-xs text-zinc-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              {/* Status Badges */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap gap-2">
                <span
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                    currentUser.isVip
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  {currentUser.isVip ? '贊助榮譽會員' : '免費玩家'}
                </span>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                    currentUser.hasCustomActionDlc
                      ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  {currentUser.hasCustomActionDlc ? '已解鎖自訂動作 DLC' : '未加值 DLC'}
                </span>
              </div>
            </div>

            {/* Redeemed Codes History */}
            {currentUser.redeemedCodes && currentUser.redeemedCodes.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-zinc-950/40 border border-zinc-800 text-xs">
                <span className="text-zinc-400 font-semibold block mb-1.5">已綁定之贊助碼：</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentUser.redeemedCodes.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Logout button */}
            <div className="pt-3 border-t border-zinc-800 flex justify-end">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-rose-950/50 text-zinc-300 hover:text-rose-300 border border-zinc-700 hover:border-rose-800/60 font-semibold text-xs flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>登出當前帳戶</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login & Register Tabs and Forms */
          <div className="pt-4 space-y-4">
            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  tab === 'login'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                登入
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setErrorMsg(null);
                }}
                className={`py-2 rounded-xl transition-all ${
                  tab === 'register'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                註冊新帳號
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs flex items-center gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {tab === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                    <Smile className="w-3.5 h-3.5 text-amber-400" />
                    <span>冒險者暱稱</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="例如：流浪風行者"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>電子郵件 (Email)</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@example.com"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>登入密碼 (至少 6 位)</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.99]"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{tab === 'login' ? '立即登入' : '註冊帳戶'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
