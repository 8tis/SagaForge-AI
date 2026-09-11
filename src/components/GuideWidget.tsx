import React, { useState } from 'react';
import { Bot, Send, X, MessageSquare, Sparkles, HelpCircle, ChevronUp } from 'lucide-react';
import { ApiConfig, CharacterState } from '../types';
import { sanitizeApiConfig } from '../utils/crypto';

interface GuideWidgetProps {
  worldGenre?: string;
  characterDesc?: string;
  currentState?: CharacterState;
  apiConfig: ApiConfig;
}

const FAQS = [
  '新手如何快速開始一場冒險？',
  '怎樣獲得並配置第三方 API 密鑰？',
  '什麼是「自訂動作 DLC」？如何使用？',
  '生命值 (HP) 歸零會發生什麼？',
];

export const GuideWidget: React.FC<GuideWidgetProps> = ({
  worldGenre,
  characterDesc,
  currentState,
  apiConfig,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [messages, setMessages] = useState<{ sender: 'guide' | 'user'; text: string }[]>([
    {
      sender: 'guide',
      text: '你好，我是你的專屬冒險精靈導師！在旅途中有任何規則疑問、策略困惑或設定好奇，隨時點擊向我提問～',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (questionText?: string) => {
    const q = questionText || inputVal;
    if (!q.trim() || isLoading) return;

    const userMsg = q.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    if (!questionText) setInputVal('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/adventure/guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          world: worldGenre,
          character: characterDesc,
          currentState,
          apiConfig: sanitizeApiConfig(apiConfig),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '嚮導暫時無法回應');
      }

      setMessages((prev) => [...prev, { sender: 'guide', text: data.answer }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'guide', text: `精靈導師耳邊傳來一陣雜音：${err.message || '請稍後重試'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="p-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-110 flex items-center gap-2 font-bold text-xs group active:scale-95"
          title="向 AI 冒險嚮導提問"
        >
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline">冒險嚮導</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </button>
      )}

      {/* Expanded Chat Window */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[480px] animate-fade-in text-zinc-100">
          {/* Header */}
          <div className="p-3.5 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-zinc-100 flex items-center gap-1.5">
                  <span>AI 冒險精靈導師</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-normal">
                    在線
                  </span>
                </h3>
                <p className="text-[10px] text-zinc-400">解答規則機制與世界觀策略</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-3.5 overflow-y-auto custom-scrollbar space-y-3 text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'guide' && (
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 text-[10px]">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-zinc-950 font-medium rounded-tr-none'
                      : 'bg-zinc-950/80 border border-zinc-800 text-zinc-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-[11px] text-zinc-500 italic p-2">
                <div className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>精靈正在翻閱古代典籍...</span>
              </div>
            )}
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-2 border-t border-zinc-800/80 bg-zinc-950/50 flex flex-wrap gap-1">
            {FAQS.map((faq, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSend(faq)}
                className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800/60 hover:bg-zinc-800 text-zinc-400 hover:text-amber-300 border border-zinc-700/50 transition-colors truncate max-w-[180px]"
              >
                {faq}
              </button>
            ))}
          </div>

          {/* Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-zinc-950 border-t border-zinc-800 flex gap-2"
          >
            <input
              type="text"
              value={inputVal}
              disabled={isLoading}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="向導師提問任何問題..."
              className="flex-1 px-3 py-2 bg-zinc-900 border border-zinc-700/80 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-800 text-zinc-950 disabled:text-zinc-600 font-bold text-xs flex items-center justify-center transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
