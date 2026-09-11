import React, { useRef, useState } from 'react';
import {
  Save,
  Download,
  Upload,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  FileJson,
  Cloud,
  Clock,
  Sparkles,
} from 'lucide-react';
import { AdventureSession, SaveSlot, UserProfile } from '../types';

interface SaveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSession: AdventureSession | null;
  savedSlots: SaveSlot[];
  onLoadSession: (session: AdventureSession) => void;
  onSaveCurrentSlot: (slotName: string) => void;
  onDeleteSlot: (slotId: string) => void;
  onImportFullCache: (data: { session?: AdventureSession; slots?: SaveSlot[] }) => void;
  currentUser: UserProfile | null;
}

export const SaveManagerModal: React.FC<SaveManagerModalProps> = ({
  isOpen,
  onClose,
  currentSession,
  savedSlots,
  onLoadSession,
  onSaveCurrentSlot,
  onDeleteSlot,
  onImportFullCache,
  currentUser,
}) => {
  const [newSlotName, setNewSlotName] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const showNotice = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  };

  // 1. Export Game Cache to JSON file
  const handleExportCache = () => {
    try {
      const cacheData = {
        app: 'text-rpg-generator',
        version: '1.0',
        exportedAt: Date.now(),
        exportedBy: currentUser?.email || 'guest',
        currentSession,
        savedSlots,
      };

      const jsonStr = JSON.stringify(cacheData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timeStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `text_rpg_game_backup_${timeStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotice('success', '遊戲快取備份 JSON 已成功導出下載！');
    } catch (err: any) {
      showNotice('error', '導出快取失敗：' + err.message);
    }
  };

  // 2. Import Game Cache from JSON file
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        // Validation
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('無效的 JSON 檔案格式');
        }

        const session = parsed.currentSession || (parsed.world && parsed.turns ? parsed : null);
        const slots = Array.isArray(parsed.savedSlots) ? parsed.savedSlots : [];

        if (!session && slots.length === 0) {
          throw new Error('未在檔案中找到任何可恢復的冒險紀錄或存檔槽位');
        }

        onImportFullCache({
          session: session || undefined,
          slots: slots.length > 0 ? slots : undefined,
        });

        showNotice('success', '成功導入遊戲快取！已恢復冒險進度與所有存檔槽位。');
      } catch (err: any) {
        showNotice('error', '導入失敗：' + (err.message || '檔案損壞或格式不符'));
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSession) {
      showNotice('error', '當前沒有正在進行中的冒險，無法儲存');
      return;
    }
    const name = newSlotName.trim() || `第 ${currentSession.turns.length} 幕 - ${currentSession.world}`;
    onSaveCurrentSlot(name);
    setNewSlotName('');
    showNotice('success', '已成功將當前進度保存至新槽位！');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>歷史冒險紀錄與快取管理</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  支援 JSON 導入導出
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                可隨時備份整機遊戲快取、更換設備導入，或管理多個冒險世界線
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

        {/* Notice feedback banner */}
        {feedback && (
          <div
            className={`my-3 p-3 rounded-2xl text-xs flex items-center gap-2.5 animate-fade-in border ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/60 border-rose-700 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* Game Cache Import & Export Action Bar (核心要求) */}
        <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>全域遊戲快取備份與轉移</span>
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              <p className="text-[11px] text-zinc-400">
                包含當前進行中劇本、全部槽位與歷史設定的完整獨立封包
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                🛡️ 零密鑰外洩：導出檔案不包含任何個人 API Key
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden File input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
            {/* Import Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-all active:scale-95"
              title="從本機讀取備份的 .json 遊戲快取"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>導入快取 JSON</span>
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportCache}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              title="將當前所有冒險進度打包導出為 .json 檔案"
            >
              <Download className="w-3.5 h-3.5" />
              <span>導出遊戲快取</span>
            </button>
          </div>
        </div>

        {/* Current Active Adventure Card */}
        <div className="mb-5 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>當前進行中的冒險</span>
            </span>
            {currentSession && (
              <span className="text-[11px] text-zinc-400 font-mono">
                {currentSession.world} · 第 {currentSession.turns.length} 幕
              </span>
            )}
          </div>

          {currentSession ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="min-w-0 flex-1">
                <p className="font-serif font-bold text-zinc-200 truncate">
                  {currentSession.turns[currentSession.turns.length - 1]?.chapterTitle || '當前冒險進行中'}
                </p>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  主角：{currentSession.characterDescription}
                </p>
              </div>

              {/* Save current session into slot */}
              <form onSubmit={handleCreateSlot} className="flex gap-1.5 w-full sm:w-auto">
                <input
                  type="text"
                  value={newSlotName}
                  onChange={(e) => setNewSlotName(e.target.value)}
                  placeholder="自訂存檔名稱（可選）"
                  className="px-3 py-1.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs flex items-center gap-1 shrink-0"
                >
                  <Save className="w-3.5 h-3.5 text-amber-400" />
                  <span>存入新槽位</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-900/40 text-center text-xs text-zinc-500">
              當前未在進行冒險，請在主畫面選擇世界觀並啟程。
            </div>
          )}
        </div>

        {/* Saved Slots List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-300 uppercase tracking-wider">
            <span>本機存檔槽位 ({savedSlots.length})</span>
            <span className="text-[11px] text-zinc-500 font-normal">隨時點擊「載入」切換世界線</span>
          </div>

          {savedSlots.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
              {savedSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-2xl bg-zinc-950/70 border border-zinc-800 hover:border-zinc-700 flex items-center justify-between gap-3 text-xs transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-200 truncate">{slot.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                        {slot.session.world}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(slot.savedAt).toLocaleString()}
                      </span>
                      <span>·</span>
                      <span>{slot.session.turns.length} 幕回合</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onLoadSession(slot.session);
                        showNotice('success', `已成功載入存檔【${slot.name}】！`);
                        setTimeout(onClose, 600);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-semibold text-xs flex items-center gap-1 transition-all"
                    >
                      <Play className="w-3 h-3" />
                      <span>載入進度</span>
                    </button>
                    <button
                      onClick={() => onDeleteSlot(slot.id)}
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition-colors"
                      title="刪除此存檔"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-zinc-950/30 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
              暫無保存的存檔槽位。當前進行中的冒險會隨時自動暫存在瀏覽器，您也可以點擊上方「存入新槽位」永久保存特定章節。
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
