import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Sliders,
  KeyRound,
  Users,
  Copy,
  Check,
  Trash2,
  PlusCircle,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ExternalLink,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { SponsorCodeItem } from '../types';
import { encryptApiKey } from '../utils/crypto';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onConfigUpdated }) => {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'config' | 'codes' | 'users'>('config');

  // Config tab state
  const [configForm, setConfigForm] = useState({
    siteTitle: '',
    announcement: '',
    sponsorQrUrl: '',
    sponsorLink: '',
    sponsorTitle: '',
    sponsorNotice: '',
    defaultProvider: 'openai' as 'openai' | 'gemini',
    defaultApiBase: '',
    defaultApiKey: '',
    defaultModel: '',
    defaultTemperature: 0.8,
    enableImageGen: true,
    defaultImageProvider: 'pollinations',
    defaultImageModel: 'flux',
    newPassword: '',
  });

  // Codes tab state
  const [codes, setCodes] = useState<SponsorCodeItem[]>([]);
  const [codeCount, setCodeCount] = useState(5);
  const [codeType, setCodeType] = useState<'vip' | 'custom_action_dlc' | 'all_access'>('vip');
  const [codeNote, setCodeNote] = useState('');

  // Users tab state
  const [usersList, setUsersList] = useState<any[]>([]);

  const [copiedAll, setCopiedAll] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [fetchingAdminModels, setFetchingAdminModels] = useState(false);
  const [fetchedAdminModels, setFetchedAdminModels] = useState<string[]>([]);

  const handleFetchAdminModels = async () => {
    setFetchingAdminModels(true);
    try {
      const res = await fetch('/api/models/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: configForm.defaultProvider,
          baseUrl: configForm.defaultApiBase,
          keyCipher: configForm.defaultApiKey ? encryptApiKey(configForm.defaultApiKey) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '拉取失败');
      if (Array.isArray(data.models) && data.models.length > 0) {
        setFetchedAdminModels(data.models);
        showNotice('success', `成功拉取到 ${data.models.length} 个可用模型！`);
        if (!configForm.defaultModel || !data.models.includes(configForm.defaultModel)) {
          setConfigForm((prev) => ({ ...prev, defaultModel: data.models[0] }));
        }
      } else {
        throw new Error('未获取到任何可用模型');
      }
    } catch (err: any) {
      showNotice('error', '获取模型失败: ' + err.message);
    } finally {
      setFetchingAdminModels(false);
    }
  };

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setStatusNotice({ type, msg });
    setTimeout(() => setStatusNotice(null), 3000);
  };

  // 1. Admin login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '密码错误');

      setIsAdminAuth(true);
      fetchAdminData();
    } catch (err: any) {
      setLoginError(err.message || '登录失败');
    }
  };

  // Fetch admin configs, codes, users
  const fetchAdminData = async () => {
    try {
      const headers = { 'x-admin-key': adminPassword };

      // Fetch config
      const cfgRes = await fetch('/api/admin/config', { headers });
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setConfigForm({
          ...cfg,
          newPassword: '',
        });
      }

      // Fetch codes
      const codesRes = await fetch('/api/admin/codes', { headers });
      if (codesRes.ok) {
        setCodes(await codesRes.json());
      }

      // Fetch users
      const usersRes = await fetch('/api/admin/users', { headers });
      if (usersRes.ok) {
        setUsersList(await usersRes.json());
      }
    } catch (err: any) {
      console.error('Fetch admin data error:', err);
    }
  };

  // Save config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminPassword,
        },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '保存失败');

      if (configForm.newPassword) {
        setAdminPassword(configForm.newPassword);
        setConfigForm({ ...configForm, newPassword: '' });
      }
      showNotice('success', '后台配置已更新并实时生效！');
      onConfigUpdated();
    } catch (err: any) {
      showNotice('error', '保存配置失败: ' + err.message);
    }
  };

  // Generate codes
  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminPassword,
        },
        body: JSON.stringify({
          count: codeCount,
          type: codeType,
          note: codeNote || `批量生成 ${codeType}`,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '生成失败');

      showNotice('success', data.message || '生成成功');
      setCodeNote('');
      // refresh codes
      const codesRes = await fetch('/api/admin/codes', { headers: { 'x-admin-key': adminPassword } });
      if (codesRes.ok) setCodes(await codesRes.json());
    } catch (err: any) {
      showNotice('error', '生成赞助码失败: ' + err.message);
    }
  };

  // Revoke code
  const handleRevokeCode = async (codeStr: string) => {
    try {
      const res = await fetch(`/api/admin/codes/${encodeURIComponent(codeStr)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminPassword },
      });
      if (res.ok) {
        setCodes(codes.filter((c) => c.code !== codeStr));
        showNotice('success', `赞助码 ${codeStr} 已作废`);
      }
    } catch (err: any) {
      showNotice('error', '作废失败: ' + err.message);
    }
  };

  // Toggle user permissions
  const handleToggleUserPermission = async (userId: string, isVip: boolean, hasCustomActionDlc: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminPassword,
        },
        body: JSON.stringify({ isVip, hasCustomActionDlc }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUsersList(usersList.map((u) => (u.id === userId ? { ...u, ...updated } : u)));
        showNotice('success', '用户权限已更新');
      }
    } catch (err: any) {
      showNotice('error', '更新失败');
    }
  };

  // Copy unused codes
  const handleCopyUnusedCodes = () => {
    const unused = codes.filter((c) => !c.isUsed).map((c) => `${c.code} (${c.type})`).join('\n');
    if (!unused) {
      showNotice('error', '没有未使用的赞助码');
      return;
    }
    navigator.clipboard.writeText(unused);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
    showNotice('success', '已复制全部未使用赞助码至剪贴簿！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-700 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>GM 控制台 · 後台管理系統</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
                  ADMIN PORTAL
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                配置系統公告、第三方 API 端點、贊助碼批次產生與使用者權限控制
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

        {/* Status Notification */}
        {statusNotice && (
          <div
            className={`my-3 p-3 rounded-xl text-xs flex items-center gap-2 border animate-fade-in ${
              statusNotice.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/70 border-rose-700 text-rose-200'
            }`}
          >
            {statusNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusNotice.msg}</span>
          </div>
        )}

        {/* Auth Barrier: If not authenticated */}
        {!isAdminAuth ? (
          <div className="py-12 max-w-sm mx-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-zinc-700 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">請輸入管理員密鑰以進入後台</h3>
              <p className="text-xs text-zinc-500 mt-1">預設密碼為 admin123456（登入後可自由修改）</p>
            </div>

            {loginError && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleAdminLogin} className="space-y-3">
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="請輸入管理密碼..."
                className="w-full px-4 py-2.5 text-center bg-zinc-950 border border-zinc-700 rounded-xl text-sm focus:outline-none focus:border-amber-400 font-mono text-zinc-100"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
              >
                解鎖控制台
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Admin Dashboard */
          <div className="mt-5 space-y-5">
            {/* Top Navigation Tabs */}
            <div className="grid grid-cols-3 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('config')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'config'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>系統與 API 參數</span>
              </button>
              <button
                onClick={() => setActiveTab('codes')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'codes'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <KeyRound className="w-4 h-4" />
                <span>贊助碼 / 兌換碼管理 ({codes.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'users'
                    ? 'bg-amber-500 text-zinc-950 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>註冊使用者權限 ({usersList.length})</span>
              </button>
            </div>

            {/* TAB 1: System Config */}
            {activeTab === 'config' && (
              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    站點與贊助展示設定
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">站點名稱</label>
                      <input
                        type="text"
                        value={configForm.siteTitle}
                        onChange={(e) => setConfigForm({ ...configForm, siteTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">贊助彈窗標題</label>
                      <input
                        type="text"
                        value={configForm.sponsorTitle}
                        onChange={(e) => setConfigForm({ ...configForm, sponsorTitle: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">頂部橫幅公告</label>
                    <textarea
                      rows={2}
                      value={configForm.announcement}
                      onChange={(e) => setConfigForm({ ...configForm, announcement: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">贊助二維碼圖片連結 (URL)</label>
                      <input
                        type="text"
                        value={configForm.sponsorQrUrl}
                        onChange={(e) => setConfigForm({ ...configForm, sponsorQrUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">贊助跳轉連結 (BuyMeACoffee 等)</label>
                      <input
                        type="text"
                        value={configForm.sponsorLink}
                        onChange={(e) => setConfigForm({ ...configForm, sponsorLink: e.target.value })}
                        placeholder="https://buymeacoffee.com/..."
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Configuration */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    系統預設第三方 AI 介面參數（未自填 Key 的玩家將採用此預設）
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">預設協議類型</label>
                      <select
                        value={configForm.defaultProvider}
                        onChange={(e) =>
                          setConfigForm({
                            ...configForm,
                            defaultProvider: e.target.value as 'openai' | 'gemini',
                          })
                        }
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                      >
                        <option value="openai">OpenAI 兼容協議 (DeepSeek / OpenRouter / 硅基流動)</option>
                        <option value="gemini">Google Gemini 官方協議</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-zinc-300">預設模型名稱</label>
                        <button
                          type="button"
                          onClick={handleFetchAdminModels}
                          disabled={fetchingAdminModels}
                          className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <RefreshCw className={`w-3 h-3 ${fetchingAdminModels ? 'animate-spin' : ''}`} />
                          <span>{fetchingAdminModels ? '拉取中...' : '自動獲取模型'}</span>
                        </button>
                      </div>

                      {fetchedAdminModels.length > 0 && (
                        <div className="mb-2 p-2 rounded-lg bg-zinc-950 border border-emerald-500/30">
                          <label className="block text-[10px] text-emerald-400 font-medium mb-1">
                            從獲取的模型列表中選用 ({fetchedAdminModels.length} 個)：
                          </label>
                          <select
                            value={configForm.defaultModel}
                            onChange={(e) => setConfigForm({ ...configForm, defaultModel: e.target.value })}
                            className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-100 font-mono cursor-pointer"
                          >
                            {fetchedAdminModels.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <input
                        type="text"
                        value={configForm.defaultModel}
                        onChange={(e) => setConfigForm({ ...configForm, defaultModel: e.target.value })}
                        placeholder="deepseek-chat 或 gemini-2.5-flash"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                      />
                    </div>
                  </div>

                  {configForm.defaultProvider === 'openai' && (
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">預設 API Base URL</label>
                      <input
                        type="text"
                        value={configForm.defaultApiBase}
                        onChange={(e) => setConfigForm({ ...configForm, defaultApiBase: e.target.value })}
                        placeholder="https://api.deepseek.com/v1"
                        className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">系統預設 API Key (Token)</label>
                    <input
                      type="password"
                      value={configForm.defaultApiKey}
                      onChange={(e) => setConfigForm({ ...configForm, defaultApiKey: e.target.value })}
                      placeholder="sk-... 或 AIzaSy..."
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                    />
                  </div>
                </div>

                {/* Global Scene Image Generation */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-200">
                          全站預設開啟 AI 劇情場景插畫
                        </label>
                        <p className="text-[11px] text-zinc-500">
                          推演劇情時自動為玩家繪製精準契合故事的高清意境插圖
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={configForm.enableImageGen !== false}
                        onChange={(e) => setConfigForm({ ...configForm, enableImageGen: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>

                  {configForm.enableImageGen !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">預設生圖協議</label>
                        <select
                          value={configForm.defaultImageProvider || 'pollinations'}
                          onChange={(e) =>
                            setConfigForm({
                              ...configForm,
                              defaultImageProvider: e.target.value as 'pollinations' | 'openai',
                            })
                          }
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 cursor-pointer"
                        >
                          <option value="pollinations">Pollinations FLUX 引擎（免配置免費，推薦）</option>
                          <option value="openai">OpenAI 兼容端點（DALL-E 3 / 矽基流動 FLUX）</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">預設生圖模型名稱</label>
                        <input
                          type="text"
                          value={configForm.defaultImageModel || ''}
                          onChange={(e) => setConfigForm({ ...configForm, defaultImageModel: e.target.value })}
                          placeholder="flux 或 dall-e-3 或 black-forest-labs/FLUX.1-schnell"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Password reset */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800">
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    變更後台管理密碼（留空則不變更）
                  </label>
                  <input
                    type="password"
                    value={configForm.newPassword}
                    onChange={(e) => setConfigForm({ ...configForm, newPassword: e.target.value })}
                    placeholder="輸入新密碼（至少6位）"
                    className="w-full max-w-sm px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 font-mono"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 active:scale-95"
                  >
                    <Save className="w-4 h-4" />
                    <span>儲存並即時套用配置</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB 2: Sponsor Codes Management */}
            {activeTab === 'codes' && (
              <div className="space-y-4">
                {/* Batch Generator Form */}
                <form
                  onSubmit={handleGenerateCodes}
                  className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex flex-wrap items-end gap-3"
                >
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">產生數量</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={codeCount}
                      onChange={(e) => setCodeCount(parseInt(e.target.value, 10))}
                      className="w-24 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100 text-center"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">贊助碼類型</label>
                    <select
                      value={codeType}
                      onChange={(e) => setCodeType(e.target.value as any)}
                      className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                    >
                      <option value="vip">贊助會員 (VIP)</option>
                      <option value="custom_action_dlc">自訂動作 DLC (DLC)</option>
                      <option value="all_access">全功能神聖特權 (ALL)</option>
                    </select>
                  </div>

                  <div className="flex-1 min-w-[200px] space-y-1">
                    <label className="text-xs font-semibold text-zinc-300">發放備註說明</label>
                    <input
                      type="text"
                      value={codeNote}
                      onChange={(e) => setCodeNote(e.target.value)}
                      placeholder="例如：給用戶 test@gmail.com 的贊助碼"
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-zinc-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>批次產生</span>
                  </button>
                </form>

                {/* Codes List Header Action */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    全站贊助碼總清單 ({codes.length})
                  </span>
                  <button
                    onClick={handleCopyUnusedCodes}
                    className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 border border-zinc-700 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>複製所有未使用的贊助碼</span>
                  </button>
                </div>

                {/* Table of Codes */}
                <div className="border border-zinc-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold border-b border-zinc-800">
                      <tr>
                        <th className="p-3">贊助代碼</th>
                        <th className="p-3">特權類型</th>
                        <th className="p-3">兌換狀態</th>
                        <th className="p-3">使用者備註</th>
                        <th className="p-3 text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
                      {codes.map((c) => (
                        <tr key={c.code} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3 font-mono font-bold text-amber-300">{c.code}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                c.type === 'vip'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : c.type === 'custom_action_dlc'
                                  ? 'bg-purple-500/20 text-purple-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {c.type}
                            </span>
                          </td>
                          <td className="p-3">
                            {c.isUsed ? (
                              <span className="text-zinc-500">
                                已兌換 ({c.usedByEmail || 'guest'})
                              </span>
                            ) : (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 未使用
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-zinc-400 truncate max-w-xs">{c.note || '-'}</td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleRevokeCode(c.code)}
                              className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                              title="刪除/作廢此碼"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: User Management */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  已註冊使用者清單 ({usersList.length})
                </div>

                <div className="border border-zinc-800 rounded-2xl overflow-hidden max-h-96 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left text-xs text-zinc-300">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold border-b border-zinc-800">
                      <tr>
                        <th className="p-3">暱稱 / Email</th>
                        <th className="p-3">註冊時間</th>
                        <th className="p-3">贊助會員 (VIP)</th>
                        <th className="p-3">自訂動作 DLC</th>
                        <th className="p-3 text-right">已兌換碼數</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
                      {usersList.map((u) => (
                        <tr key={u.id} className="hover:bg-zinc-800/40 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-zinc-100">{u.nickname}</div>
                            <div className="text-zinc-500 text-[11px]">{u.email}</div>
                          </td>
                          <td className="p-3 text-zinc-500">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleUserPermission(u.id, !u.isVip, u.hasCustomActionDlc)}
                              className={`px-2.5 py-1 rounded-lg font-semibold text-xs border transition-colors ${
                                u.isVip
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {u.isVip ? 'VIP 已開通' : '點擊開通 VIP'}
                            </button>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleUserPermission(u.id, u.isVip, !u.hasCustomActionDlc)}
                              className={`px-2.5 py-1 rounded-lg font-semibold text-xs border transition-colors ${
                                u.hasCustomActionDlc
                                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {u.hasCustomActionDlc ? 'DLC 已授權' : '點擊授權 DLC'}
                            </button>
                          </td>
                          <td className="p-3 text-right font-mono text-zinc-400">
                            {u.redeemedCodes?.length || 0} 個
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
