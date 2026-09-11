import React, { useState } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, AlertCircle, ExternalLink, X, ShieldCheck, Lock } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveKey: (key: string) => void;
  hasEnvKey: boolean;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveKey,
  hasEnvKey,
}) => {
  const [inputVal, setInputVal] = useState(apiKey);
  const [showPassword, setShowPassword] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(inputVal.trim());
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    setInputVal('');
    onSaveKey('');
  };

  const isConfigured = Boolean(apiKey.trim() || hasEnvKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl p-6 text-zinc-100 overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">配置 Gemini API 密钥</h2>
              <p className="text-xs text-zinc-400">调用 Google Gemini 生成文字冒险与剧情演进</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Reassurance Notice */}
        <div className="my-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span><strong>本地安全承诺</strong>：您的 API 密钥仅保存在当前浏览器本地（LocalStorage）中，绝不上报或留存于云端数据库。</span>
        </div>

        {/* Current status banner */}
        <div className="my-3 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/60 flex items-center gap-3 text-xs">
          {isConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div className="flex-1">
            <span className="font-semibold">当前状态：</span>
            {apiKey.trim() ? (
              <span className="text-emerald-300">已使用用户自定义密钥（保存在本地浏览器）</span>
            ) : hasEnvKey ? (
              <span className="text-emerald-300">已检测到系统环境变量预置密钥（随时可用）</span>
            ) : (
              <span className="text-amber-300">尚未检测到 API Key，请在下方输入以开始游戏</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                <Lock className="w-2.5 h-2.5" />
                <span>仅保存在本地</span>
              </span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={hasEnvKey ? "留空则使用系统预置密钥，或输入您的专属 Key" : "AIzaSy..."}
                className="w-full px-4 py-2.5 pr-10 text-sm bg-zinc-950 border border-zinc-700 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-zinc-100 placeholder-zinc-500 font-mono transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-xs text-zinc-400 flex items-center gap-1.5">
              <span>还没有 Key？可前往</span>
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-0.5"
              >
                Google AI Studio 免费获取
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors py-1.5 px-2"
            >
              清除已存密钥
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-xl bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                {savedFeedback ? '已保存！' : '保存密钥'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
