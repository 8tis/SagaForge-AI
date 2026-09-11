import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, Download, RotateCcw, X } from 'lucide-react';
import { StoryTurn, BiographyData, ApiConfig } from '../types';
import { sanitizeApiConfig } from '../utils/crypto';

interface BiographyModalProps {
  isOpen: boolean;
  onClose: () => void;
  turns: StoryTurn[];
  worldGenre: string;
  characterDesc: string;
  apiConfig: ApiConfig;
}

export const BiographyModal: React.FC<BiographyModalProps> = ({
  isOpen,
  onClose,
  turns,
  worldGenre,
  characterDesc,
  apiConfig,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [biography, setBiography] = useState<BiographyData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (turns.length === 0) {
      setErrorMsg('當前尚無冒險歷程，請先進行幾個回合的遊戲再編撰傳記。');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/adventure/biography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: worldGenre,
          character: characterDesc,
          turns,
          apiConfig: sanitizeApiConfig(apiConfig),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '傳記生成失敗');
      }

      setBiography(data);
    } catch (err: any) {
      setErrorMsg(err.message || '編撰史詩傳記時發生異常，請重試');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!biography) return;
    const fullText = `《${biography.title}》\n\n【序言】\n${biography.preface}\n\n` +
      biography.chapters
        .map((c) => `第 ${c.chapterNumber} 章：${c.title}\n${c.content}`)
        .join('\n\n') +
      `\n\n【終卷題記】\n${biography.epilogue}`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-6 sm:p-8 text-zinc-100 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <span>冒險史詩傳記 · 小說生成器</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                  AI 史官提煉
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                將您在遊戲中的抉擇與經歷（當前共 {turns.length} 幕）提煉為五章史詩短篇傳奇小說
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

        {/* Error message */}
        {errorMsg && (
          <div className="my-4 p-3 rounded-2xl bg-rose-950/60 border border-rose-700 text-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Main content */}
        {!biography ? (
          <div className="py-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-zinc-950 border border-zinc-800 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-zinc-100">準備將你的冒險鑄就為傳奇之書</h3>
              <p className="text-xs text-zinc-400 mt-1">
                AI 史官將梳理每一幕重大抉擇，以傳奇回憶體撰寫 5 個精彩篇章，並加上卷首語與後記。
              </p>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || turns.length === 0}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-lg shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>史官正在研墨著書中，請稍候...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>立即生成五章冒險傳記</span>
                </>
              )}
            </button>
          </div>
        ) : (
          /* Render Generated Biography Book */
          <div className="py-4 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-serif font-extrabold text-xl text-amber-300 tracking-wide">
                  《{biography.title}》
                </h3>
                <span className="text-[11px] text-zinc-500">
                  世界線：{worldGenre} · 共 5 章全卷
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已複製全文' : '複製全書'}</span>
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="重新撰寫另一種文風"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>重新編撰</span>
                </button>
              </div>
            </div>

            {/* Preface */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 font-serif italic text-xs text-zinc-400 leading-relaxed">
              <strong className="text-amber-400 not-italic block mb-1">【卷首序語】</strong>
              {biography.preface}
            </div>

            {/* Chapters */}
            <div className="space-y-4">
              {biography.chapters.map((ch) => (
                <div
                  key={ch.chapterNumber}
                  className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 space-y-2 font-serif"
                >
                  <h4 className="text-sm font-bold text-amber-300 tracking-wide flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      第 {ch.chapterNumber} 章
                    </span>
                    <span>{ch.title}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-loose whitespace-pre-wrap">
                    {ch.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Epilogue */}
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 font-serif text-xs text-zinc-400 leading-relaxed text-center">
              <strong className="text-amber-400 block mb-1">【終卷題記】</strong>
              {biography.epilogue}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
