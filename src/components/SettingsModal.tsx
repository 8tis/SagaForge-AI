import React, { useState } from 'react';
import { ApiConfig } from '../types';
import {
  Key,
  Globe,
  Cpu,
  Sliders,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Image as ImageIcon,
  Lock,
  Trash2,
} from 'lucide-react';
import { encryptApiKey } from '../utils/crypto';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiConfig;
  onSaveConfig: (cfg: ApiConfig) => void;
  serverHasKey: boolean;
}

const PRESET_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI 兼容协议 (推荐)',
    desc: '适用于 DeepSeek、OpenRouter、SiliconFlow、OpenAI、Ollama 等第三方 API',
  },
  {
    id: 'gemini',
    name: 'Google Gemini 官方协议',
    desc: '直接调用 Google Gemini 2.5 系列模型，需使用 Google AI Studio 密钥',
  },
];

const PRESET_BASE_URLS = [
  { label: 'DeepSeek 官方 (性价比极高)', url: 'https://api.deepseek.com/v1' },
  { label: 'OpenRouter (聚合全球顶尖模型)', url: 'https://openrouter.ai/api/v1' },
  { label: 'SiliconFlow 硅基流动', url: 'https://api.siliconflow.cn/v1' },
  { label: 'OpenAI 官方', url: 'https://api.openai.com/v1' },
  { label: '本地 Ollama / vLLM', url: 'http://localhost:11434/v1' },
];

const PRESET_MODELS_OPENAI = [
  'deepseek-chat',
  'deepseek-reasoner',
  'gpt-4o-mini',
  'gpt-4o',
  'anthropic/claude-3.5-sonnet',
  'Qwen/Qwen2.5-72B-Instruct',
];

const PRESET_MODELS_GEMINI = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  serverHasKey,
}) => {
  const [form, setForm] = useState<ApiConfig>({ ...config });
  const [showPassword, setShowPassword] = useState(false);
  const [showImagePassword, setShowImagePassword] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState<string[]>([]);
  const [fetchMsg, setFetchMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFetchModels = async () => {
    setFetchingModels(true);
    setFetchMsg(null);
    try {
      const res = await fetch('/api/models/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: form.provider,
          baseUrl: form.baseUrl,
          keyCipher: form.apiKey ? encryptApiKey(form.apiKey) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '拉取模型失败');
      if (Array.isArray(data.models) && data.models.length > 0) {
        setFetchedModels(data.models);
        setFetchMsg({ type: 'success', text: `成功获取到 ${data.models.length} 个可用模型！` });
        if (!form.model || !data.models.includes(form.model)) {
          setForm((prev) => ({ ...prev, model: data.models[0] }));
        }
      } else {
        throw new Error('未获取到任何可用模型');
      }
    } catch (err: any) {
      setFetchMsg({ type: 'error', text: err.message || '获取模型失败，请检查 Base URL 与 Key' });
    } finally {
      setFetchingModels(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(form);
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      onClose();
    }, 800);
  };

  const handleResetToDefault = () => {
    setForm({
      provider: 'openai',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: '',
      model: 'deepseek-chat',
      temperature: 0.8,
      nsfwFilter: false,
      enableImageGen: true,
      imageProvider: 'pollinations',
      imageModel: 'flux',
      imageApiKey: '',
      imageApiBase: '',
      imageStyle: 'cinematic',
    });
  };

  const handleClearApiKey = () => {
    const updated = { ...form, apiKey: '', imageApiKey: '' };
    setForm(updated);
    onSaveConfig(updated);
    setFetchMsg({ type: 'success', text: '已彻底清除保存在当前浏览器本地的 API Key！' });
  };

  const isConfigured = Boolean(form.apiKey.trim() || serverHasKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>AI 引擎与模型配置</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  支持三方 API
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                可自由配置 DeepSeek、OpenRouter、OpenAI 等任意兼容接口或 Gemini
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

        {/* Privacy & Security Guarantee Banner (隐私与本地安全承诺) */}
        <div className="my-4 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs space-y-2.5 shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>数据安全与隐私承诺：纯本地浏览器存储 · 绝不入云端库</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold shrink-0">
              100% 零服务端留存
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-300 leading-relaxed pt-1 border-t border-emerald-500/20">
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>本地浏览器专享</strong>：您的 API 密钥与自定义 Base URL 仅存储在当前浏览器 LocalStorage 中，服务端数据库（包括云存档）绝无记录。</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold">✓</span>
              <span><strong>动态加盐加密交互</strong>：与 AI 交互推演时通过客户端动态流密码混淆传输，服务端内存毫秒级转发即焚，无任何落地日志。</span>
            </div>
          </div>
        </div>

        {/* Current status banner */}
        <div className="my-3 p-3.5 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-3 text-xs">
          {isConfigured ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div className="flex-1 leading-relaxed">
            <span className="font-semibold text-zinc-300">运行就绪度：</span>
            {form.apiKey.trim() ? (
              <span className="text-emerald-300">已使用您设置的自定义 API Key（安全存储在本地浏览器）</span>
            ) : serverHasKey ? (
              <span className="text-emerald-300">已检测到服务器预置兜底 API Key（可直接留空使用）</span>
            ) : (
              <span className="text-amber-300">尚未配置 API Key，请在下方填入以激活剧情生成引擎</span>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>选择 API 接口协议</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_PROVIDERS.map((p) => {
                const isSelected = form.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setForm({
                        ...form,
                        provider: p.id as 'openai' | 'gemini',
                        model: p.id === 'gemini' ? 'gemini-2.5-flash' : 'deepseek-chat',
                        baseUrl: p.id === 'gemini' ? '' : form.baseUrl || 'https://api.deepseek.com/v1',
                      });
                    }}
                    className={`p-3 text-left rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60 text-amber-200 shadow-sm'
                        : 'bg-zinc-950/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{p.name}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-1 line-clamp-2">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Base URL (if OpenAI-compatible) */}
          {form.provider === 'openai' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>自定义 API Base URL</span>
                </label>
              </div>
              <input
                type="text"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="例如 https://api.deepseek.com/v1 或 https://openrouter.ai/api/v1"
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-amber-400 font-mono text-zinc-200 transition-all"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[11px] text-zinc-500 self-center mr-1">快捷填入：</span>
                {PRESET_BASE_URLS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, baseUrl: item.url })}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-amber-300 border border-zinc-700/60 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>API 访问令牌 (Token / Key)</span>
                </label>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  <span>纯本地缓存 · 绝不上云</span>
                </span>
              </div>
              {form.provider === 'gemini' ? (
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  免费获取 Gemini Key <ExternalLink className="w-3 h-3" />
                </a>
              ) : (
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  获取 DeepSeek Key <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.apiKey}
                onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                placeholder={
                  serverHasKey
                    ? '留空将默认使用服务器预置密钥，输入则优先使用个人私有 Key'
                    : form.provider === 'gemini'
                    ? 'AIzaSy...'
                    : 'sk-...'
                }
                className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-zinc-950 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-amber-400 font-mono text-zinc-200 placeholder-zinc-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>模型名称 (Model)</span>
              </label>
              <button
                type="button"
                onClick={handleFetchModels}
                disabled={fetchingModels}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="向配置的服务商接口实时拉取可用模型列表"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${fetchingModels ? 'animate-spin' : ''}`} />
                <span>{fetchingModels ? '拉取中...' : '自动获取模型'}</span>
              </button>
            </div>

            {fetchMsg && (
              <div
                className={`mb-2 px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 ${
                  fetchMsg.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {fetchMsg.type === 'success' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{fetchMsg.text}</span>
              </div>
            )}

            {fetchedModels.length > 0 && (
              <div className="mb-2 p-2.5 rounded-xl bg-zinc-950/70 border border-emerald-500/30">
                <label className="block text-[11px] text-emerald-400 font-medium mb-1">
                  从已获取的模型中直接选用 ({fetchedModels.length} 个)：
                </label>
                <select
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-emerald-400 font-mono text-zinc-100 cursor-pointer"
                >
                  {fetchedModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder={form.provider === 'gemini' ? 'gemini-2.5-flash' : 'deepseek-chat'}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-zinc-950 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-amber-400 font-mono text-zinc-200 transition-all"
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-zinc-500 self-center mr-1">常用模型：</span>
              {(form.provider === 'gemini' ? PRESET_MODELS_GEMINI : PRESET_MODELS_OPENAI).map(
                (modelName, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setForm({ ...form, model: modelName })}
                    className={`text-[11px] px-2 py-0.5 rounded-lg border transition-colors ${
                      form.model === modelName
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border-zinc-700/60'
                    }`}
                  >
                    {modelName}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Temperature */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-zinc-300">创作随机度 (Temperature)：{form.temperature}</span>
              <span className="text-zinc-500 text-[11px]">
                {form.temperature <= 0.6 ? '严谨收敛' : form.temperature <= 0.9 ? '平衡均衡' : '天马行空'}
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.2"
              step="0.05"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Image Generation Section */}
          <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-200">
                    开启剧情场景插画生成
                  </label>
                  <p className="text-[11px] text-zinc-500">
                    根据每幕剧情、世界观与感官描述自动生成相符的场景插画
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.enableImageGen !== false}
                  onChange={(e) => setForm({ ...form, enableImageGen: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {form.enableImageGen !== false && (
              <div className="space-y-4 pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300">生图模型预设</span>
                  <span className="text-[10px] text-amber-400">点击快捷切换生图模型</span>
                </div>

                {/* Free Pollinations Models */}
                <div>
                  <div className="text-[11px] text-zinc-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>免配置免费引擎 (Pollinations)：</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'flux', label: '⚡ FLUX.1 标准', desc: '全能高画质' },
                      { id: 'flux-anime', label: '🌸 二次元动漫', desc: '唯美日漫风' },
                      { id: 'flux-realism', label: '📷 极写真实感', desc: '胶片摄影质感' },
                      { id: 'turbo', label: '⚡ SDXL Turbo', desc: '秒级出图' },
                      { id: 'midjourney', label: '🎨 Midjourney', desc: '艺术概念CG' },
                    ].map((m) => {
                      const isSelected =
                        (form.imageProvider === 'pollinations' || !form.imageProvider) &&
                        (form.imageModel === m.id || (!form.imageModel && m.id === 'flux'));
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setForm({ ...form, imageProvider: 'pollinations', imageModel: m.id })}
                          className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="font-bold text-xs">{m.label}</div>
                          <div className="text-[10px] text-zinc-500 truncate">{m.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Commercial / Custom API Models */}
                <div>
                  <div className="text-[11px] text-zinc-400 mb-1.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>商业 / 专属 API 引擎 (需配置 Key)：</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          imageProvider: 'openai',
                          imageModel: 'black-forest-labs/FLUX.1-schnell',
                          imageApiBase: form.imageApiBase || 'https://api.siliconflow.cn/v1',
                        })
                      }
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        form.imageModel === 'black-forest-labs/FLUX.1-schnell'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs">🚀 硅基流动 FLUX</div>
                      <div className="text-[10px] text-zinc-500 truncate">需 SiliconFlow Key (支持自填)</div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          imageProvider: 'openai',
                          imageModel: 'dall-e-3',
                          imageApiBase: form.imageApiBase || 'https://api.openai.com/v1',
                        })
                      }
                      className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        form.imageModel === 'dall-e-3'
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="font-bold text-xs">💎 OpenAI DALL-E 3</div>
                      <div className="text-[10px] text-zinc-500 truncate">需 OpenAI Key (支持自填)</div>
                    </button>
                  </div>
                </div>

                {/* Custom Model Name Input */}
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">
                    当前生效的生图模型名称：
                  </label>
                  <input
                    type="text"
                    value={form.imageModel || ''}
                    onChange={(e) => setForm({ ...form, imageModel: e.target.value })}
                    placeholder="例如：flux, flux-anime, dall-e-3, black-forest-labs/FLUX.1-schnell"
                    className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-400 font-mono text-zinc-200"
                  />
                </div>

                {/* Dedicated Image API Key & Base URL (especially for DeepSeek users!) */}
                <div className="p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>生图专属 API Key & Base URL（可选）</span>
                    </label>
                    <span className="text-[10px] text-emerald-400/90 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      仅存浏览器
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    如果您文本对话使用 DeepSeek（DeepSeek 自身无生图能力），想要用硅基流动或 OpenAI 出图，可在此单独配置专属 Key 与接口：
                  </p>

                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">
                      生图专属 API Key：
                    </label>
                    <div className="relative">
                      <input
                        type={showImagePassword ? 'text' : 'password'}
                        value={form.imageApiKey || ''}
                        onChange={(e) => setForm({ ...form, imageApiKey: e.target.value })}
                        placeholder="sk-xxxxxxxx (留空则默认使用上方通用 Key 或免配置引擎)"
                        className="w-full pl-3 pr-10 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-400 font-mono text-zinc-200 placeholder:text-zinc-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowImagePassword(!showImagePassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showImagePassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] text-zinc-400">
                        生图 Base URL：
                      </label>
                      <div className="flex items-center gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, imageApiBase: 'https://api.siliconflow.cn/v1' })}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          填入硅基流动
                        </button>
                        <span className="text-zinc-600">|</span>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, imageApiBase: 'https://api.openai.com/v1' })}
                          className="text-amber-400 hover:underline cursor-pointer"
                        >
                          填入 OpenAI
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={form.imageApiBase || ''}
                      onChange={(e) => setForm({ ...form, imageApiBase: e.target.value })}
                      placeholder="https://api.siliconflow.cn/v1 或 https://api.openai.com/v1"
                      className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-700 rounded-lg focus:outline-none focus:border-amber-400 font-mono text-zinc-200 placeholder:text-zinc-600"
                    />
                  </div>
                </div>

                {/* Art Style Selector */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-zinc-300">
                      插画艺术画风偏好
                    </label>
                    <span className="text-[10px] text-amber-400">决定生成插图的美学表现</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'cinematic', label: '🎬 电影级写实', desc: '逼真光影与构图' },
                      { id: 'anime', label: '🌸 新海诚唯美动漫', desc: '绚丽云彩与光斑' },
                      { id: 'ink_painting', label: '🖌️ 国风水墨古韵', desc: '山水诗意工笔画' },
                      { id: 'cyberpunk', label: '⚡ 赛博朋克霓虹', desc: '高科技炫彩反光' },
                      { id: 'dark_fantasy', label: '🌌 暗黑史诗油画', desc: '厚重笔触与沉郁' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setForm({ ...form, imageStyle: st.id as any })}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          (form.imageStyle || 'cinematic') === st.id
                            ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="font-semibold text-xs text-zinc-200">{st.label}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{st.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                恢复默认配置
              </button>
              {form.apiKey.trim() && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="text-xs text-rose-400/80 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="彻底抹除保存在当前浏览器本地的 API Key 缓存"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>清除本地密钥</span>
                </button>
              )}
            </div>
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
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1.5"
              >
                {savedFeedback ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已保存生效！</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>保存配置</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
