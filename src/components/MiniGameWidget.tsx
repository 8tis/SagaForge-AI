import React, { useState, useEffect, useRef } from 'react';
import {
  KeyRound,
  Scale,
  Crosshair,
  Zap,
  Scissors,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { MiniGameChallenge, WorldGenre } from '../types';

interface MiniGameWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: MiniGameChallenge;
  onSuccess: (action: string) => void;
  onFailure: (action: string) => void;
  worldGenre?: WorldGenre;
}

export const MiniGameWidget: React.FC<MiniGameWidgetProps> = ({
  isOpen,
  onClose,
  challenge,
  onSuccess,
  onFailure,
  worldGenre = '仙侠',
}) => {
  // Common states
  const [gameState, setGameState] = useState<'playing' | 'success' | 'failed'>('playing');
  const [showClue, setShowClue] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // 1. Password Lock States
  const [inputCode, setInputCode] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(4);
  const [isShaking, setIsShaking] = useState(false);

  // 2. Equation Puzzle States
  const defaultVarVal = 0;
  const [varValue, setVarValue] = useState<number>(defaultVarVal);

  // 3. Lockpick QTE States
  const [needlePos, setNeedlePos] = useState(0);
  const [needleDir, setNeedleDir] = useState<1 | -1>(1);
  const [hitsCount, setHitsCount] = useState(0);
  const requiredHits = challenge.qteData?.requiredHits || 2;
  const animFrameRef = useRef<number | null>(null);

  // 4. Wire Circuit States
  const [cutWireIds, setCutWireIds] = useState<string[]>([]);

  // Reset internal state when challenge changes
  useEffect(() => {
    setGameState('playing');
    setInputCode('');
    setAttemptsLeft(4);
    setShowClue(false);
    setFeedbackMsg(null);
    setVarValue(0);
    setHitsCount(0);
    setCutWireIds([]);
  }, [challenge]);

  // QTE Needle Animation Loop
  useEffect(() => {
    if (challenge.type !== 'lockpick_qte' || gameState !== 'playing' || !isOpen) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const speed = (challenge.qteData?.speed || 1.2) * 1.5;

    const animate = () => {
      setNeedlePos((prev) => {
        let next = prev + needleDir * speed;
        if (next >= 100) {
          next = 100;
          setNeedleDir(-1);
        } else if (next <= 0) {
          next = 0;
          setNeedleDir(1);
        }
        return next;
      });
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [challenge.type, needleDir, gameState, isOpen]);

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // Mode 1: Password Lock Handlers
  // -------------------------------------------------------------
  const handleKeypadPress = (val: string) => {
    if (gameState !== 'playing') return;
    const maxLen = challenge.lockData?.length || challenge.targetAnswer?.length || 4;
    if (inputCode.length >= maxLen) return;
    setInputCode((prev) => prev + val);
  };

  const handleKeypadDelete = () => {
    if (gameState !== 'playing') return;
    setInputCode((prev) => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    if (gameState !== 'playing') return;
    setInputCode('');
  };

  const handleVerifyPassword = () => {
    const target = (challenge.targetAnswer || '1234').trim().toLowerCase();
    const current = inputCode.trim().toLowerCase();

    if (current === target) {
      setGameState('success');
      setFeedbackMsg('密码校验完全正确！暗锁齿轮咬合解开！');
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      const nextAttempts = attemptsLeft - 1;
      setAttemptsLeft(nextAttempts);

      if (nextAttempts <= 0) {
        setGameState('failed');
        setFeedbackMsg('密码连续错误，暗锁锁定并引发反制！');
      } else {
        setFeedbackMsg(`密码错误！剩余尝试机会：${nextAttempts} 次`);
      }
    }
  };

  // -------------------------------------------------------------
  // Mode 2: Equation Puzzle Handlers
  // -------------------------------------------------------------
  const correctEqVal = Number(challenge.equationData?.correctValue ?? challenge.targetAnswer ?? 6);
  const rightWeight = challenge.equationData?.rightSideValue ?? 18;

  // Dynamic left weight calculated based on varValue:
  const leftWeight = rightWeight + (varValue - correctEqVal) * 2;
  const tiltDegrees = Math.max(-20, Math.min(20, (leftWeight - rightWeight) * 1.5));
  const isBalanced = varValue === correctEqVal;

  const handleVerifyEquation = () => {
    if (isBalanced) {
      setGameState('success');
      setFeedbackMsg('左右天平精准配平！未知解已验算通过，灵阵平息解开！');
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setGameState('failed');
      setFeedbackMsg('配比严重失衡！灵力逆流引发警报！');
    }
  };

  // -------------------------------------------------------------
  // Mode 3: Lockpick QTE Handlers
  // -------------------------------------------------------------
  const handleLockpickStrike = () => {
    if (gameState !== 'playing') return;
    const targetStart = challenge.qteData?.targetZoneStart || 40;
    const targetWidth = challenge.qteData?.targetZoneWidth || 20;
    const targetEnd = targetStart + targetWidth;

    if (needlePos >= targetStart && needlePos <= targetEnd) {
      const nextHits = hitsCount + 1;
      setHitsCount(nextHits);
      if (nextHits >= requiredHits) {
        setGameState('success');
        setFeedbackMsg('咔哒一声！锁芯所有弹子完美归位！');
      } else {
        setFeedbackMsg(`精准命中破绽！还需锁定 ${requiredHits - nextHits} 处弹子！`);
      }
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setGameState('failed');
      setFeedbackMsg('锁针错位滑脱，机关发出刺耳警报！');
    }
  };

  // -------------------------------------------------------------
  // Mode 4: Wire Circuit Handlers
  // -------------------------------------------------------------
  const handleCutWire = (wire: { id: string; color: string; isCorrect: boolean }) => {
    if (gameState !== 'playing') return;
    setCutWireIds((prev) => [...prev, wire.id]);

    if (wire.isCorrect) {
      setGameState('success');
      setFeedbackMsg('核心灵流回路被安全切断！暗雷与禁制成功解除！');
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      setGameState('failed');
      setFeedbackMsg('剪错灵流导线！残余雷火能量爆发！');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-100 overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar transition-transform ${
          isShaking ? 'animate-shake' : ''
        }`}
      >
        {/* Decorative corner glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {challenge.type === 'password_lock' && <KeyRound className="w-5 h-5" />}
              {challenge.type === 'equation_puzzle' && <Scale className="w-5 h-5" />}
              {challenge.type === 'lockpick_qte' && <Crosshair className="w-5 h-5" />}
              {challenge.type === 'wire_circuit' && <Zap className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">{challenge.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-amber-300 border border-zinc-700 font-mono">
                  {challenge.type === 'password_lock' && '密码破译'}
                  {challenge.type === 'equation_puzzle' && '天平方程'}
                  {challenge.type === 'lockpick_qte' && '锁芯微操'}
                  {challenge.type === 'wire_circuit' && '导线拆解'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{challenge.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="关闭暂避"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clue and Lore Accordion */}
        <div className="my-3 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>现场观察线索</span>
            </div>
            <button
              type="button"
              onClick={() => setShowClue(!showClue)}
              className="text-amber-400 hover:text-amber-300 text-xs underline cursor-pointer"
            >
              {showClue ? '收起线索' : '查阅现场线索'}
            </button>
          </div>
          {showClue && (
            <div className="mt-2 pt-2 border-t border-zinc-800/80 text-zinc-300 leading-relaxed space-y-1 animate-fade-in">
              <p className="font-serif italic text-amber-200/90">
                “{challenge.clue || '细致检视机关边缘，似乎能辨认出一串残损的符号与暗号标记。'}”
              </p>
              {challenge.equationData?.hint && (
                <p className="text-[11px] text-zinc-400">💡 提示：{challenge.equationData.hint}</p>
              )}
              {challenge.lockData?.hint && (
                <p className="text-[11px] text-zinc-400">💡 提示：{challenge.lockData.hint}</p>
              )}
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* GAME MODE 1: PASSWORD LOCK */}
        {/* ------------------------------------------------------------- */}
        {challenge.type === 'password_lock' && (
          <div className="space-y-4 py-1">
            {/* Display Code Screen */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-500/30 flex flex-col items-center justify-center shadow-inner">
              <span className="text-[10px] text-zinc-500 tracking-widest uppercase mb-1 font-mono">
                SECURE CODE TERMINAL · 密码破译输入屏
              </span>
              <div className="flex items-center gap-2 sm:gap-3 my-2">
                {Array.from({ length: challenge.lockData?.length || 4 }).map((_, idx) => {
                  const char = inputCode[idx];
                  return (
                    <div
                      key={idx}
                      className={`w-10 h-12 rounded-xl border flex items-center justify-center font-mono text-xl font-bold transition-all ${
                        char
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20 scale-105'
                          : 'bg-zinc-900/90 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      {char ? char : '•'}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                <span>剩余尝试机会：{attemptsLeft} 次</span>
                <span>目标位长：{challenge.lockData?.length || 4} 位</span>
              </div>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    if (k === 'C') handleKeypadClear();
                    else if (k === '⌫') handleKeypadDelete();
                    else handleKeypadPress(k);
                  }}
                  className={`py-3 rounded-xl font-mono text-sm sm:text-base font-bold transition-all active:scale-95 border cursor-pointer ${
                    k === 'C'
                      ? 'bg-zinc-800/80 hover:bg-rose-950/40 text-rose-300 border-zinc-700'
                      : k === '⌫'
                      ? 'bg-zinc-800/80 hover:bg-zinc-700 text-amber-300 border-zinc-700'
                      : 'bg-zinc-950/80 hover:bg-zinc-800 text-zinc-100 border-zinc-800 hover:border-amber-500/40'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>

            {/* Verify Action Button */}
            {gameState === 'playing' && (
              <button
                type="button"
                onClick={handleVerifyPassword}
                disabled={inputCode.length === 0}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                验证输入并破解
              </button>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* GAME MODE 2: EQUATION / BALANCE SCALE */}
        {/* ------------------------------------------------------------- */}
        {challenge.type === 'equation_puzzle' && (
          <div className="space-y-4 py-1">
            {/* Equation question card */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-amber-500/30 text-center space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono">
                平衡方程谜题 · ALCHEMICAL EQUATION
              </span>
              <div className="text-base sm:text-lg font-mono font-bold text-amber-200">
                {challenge.equationData?.question || '2X + 6 = 18，求解 X 的数值'}
              </div>
              <p className="text-[11px] text-zinc-400">
                调节下方未知数【{challenge.equationData?.variableName || 'X'}】使双臂天平精准归零平衡
              </p>
            </div>

            {/* Physical Balance Scale Graphic */}
            <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Fulcrum and beam */}
              <div
                className="w-48 sm:w-60 h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full transition-transform duration-300 origin-center shadow-lg relative"
                style={{ transform: `rotate(${tiltDegrees}deg)` }}
              >
                {/* Left Pan */}
                <div className="absolute -left-1 -top-8 flex flex-col items-center">
                  <div className="w-16 py-1 rounded-lg bg-zinc-800 border border-amber-500/40 text-center text-xs font-mono font-bold text-amber-300 shadow">
                    左臂: {leftWeight}
                  </div>
                  <div className="w-0.5 h-6 bg-amber-500/60" />
                </div>

                {/* Right Pan */}
                <div className="absolute -right-1 -top-8 flex flex-col items-center">
                  <div className="w-16 py-1 rounded-lg bg-zinc-800 border border-amber-500/40 text-center text-xs font-mono font-bold text-zinc-200 shadow">
                    右臂: {rightWeight}
                  </div>
                  <div className="w-0.5 h-6 bg-amber-500/60" />
                </div>
              </div>

              {/* Fulcrum base */}
              <div className="w-6 h-6 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[18px] border-b-zinc-600 mt-1" />

              {/* Status indicator */}
              <div className="mt-3 text-xs font-semibold">
                {isBalanced ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 完美平衡！
                  </span>
                ) : leftWeight > rightWeight ? (
                  <span className="text-amber-400">左重右轻（数值偏大，请调低）</span>
                ) : (
                  <span className="text-cyan-400">左轻右重（数值偏小，请调高）</span>
                )}
              </div>
            </div>

            {/* Variable Adjuster Controls */}
            <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-semibold">
                  设定未知数 {challenge.equationData?.variableName || 'X'} =
                </span>
                <span className="text-base font-mono font-bold text-amber-300 px-3 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  {varValue}
                </span>
              </div>

              <input
                type="range"
                min="-10"
                max="30"
                step="1"
                value={varValue}
                onChange={(e) => setVarValue(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />

              <div className="flex items-center justify-center gap-2 pt-1">
                {[-5, -1, 1, 5].map((delta) => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() => setVarValue((prev) => prev + delta)}
                    className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer active:scale-95"
                  >
                    {delta > 0 ? `+${delta}` : delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Balance */}
            {gameState === 'playing' && (
              <button
                type="button"
                onClick={handleVerifyEquation}
                className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95 shadow-md cursor-pointer ${
                  isBalanced
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-zinc-950 shadow-emerald-500/20'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700'
                }`}
              >
                {isBalanced ? '✨ 确定配平：触发阵法共鸣' : '检验当前平衡状态'}
              </button>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* GAME MODE 3: LOCKPICK SWEET-SPOT QTE */}
        {/* ------------------------------------------------------------- */}
        {challenge.type === 'lockpick_qte' && (
          <div className="space-y-4 py-1">
            <div className="text-center space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono">
                微操开锁 · LOCKPICK SWEET-SPOT
              </span>
              <p className="text-xs text-zinc-300">
                观察探针摆动，当游标进入绿色【锁芯破绽区】瞬间，点击“固定锁栓”！
              </p>
            </div>

            {/* Hit progress indicator */}
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: requiredHits }).map((_, i) => (
                <div
                  key={i}
                  className={`w-8 h-2 rounded-full transition-all ${
                    i < hitsCount ? 'bg-emerald-400 shadow-md shadow-emerald-400/50' : 'bg-zinc-800'
                  }`}
                />
              ))}
              <span className="text-xs text-zinc-400 ml-2">
                破绽咬合：{hitsCount} / {requiredHits}
              </span>
            </div>

            {/* Oscillation Track */}
            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="relative w-full h-8 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-700/60 shadow-inner">
                {/* Target Sweet Spot */}
                <div
                  className="absolute top-0 bottom-0 bg-emerald-500/40 border-x-2 border-emerald-400"
                  style={{
                    left: `${challenge.qteData?.targetZoneStart || 40}%`,
                    width: `${challenge.qteData?.targetZoneWidth || 20}%`,
                  }}
                />

                {/* Oscillating Needle */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-amber-400 shadow-lg shadow-amber-400 transition-all rounded-full"
                  style={{ left: `${needlePos}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>0% 极左</span>
                <span className="text-emerald-400 font-bold">破绽安全区</span>
                <span>100% 极右</span>
              </div>
            </div>

            {/* Strike Action */}
            {gameState === 'playing' && (
              <button
                type="button"
                onClick={handleLockpickStrike}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Crosshair className="w-4 h-4" />
                <span>精准截停 · 固定锁栓</span>
              </button>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* GAME MODE 4: WIRE CIRCUIT DEFUSAL */}
        {/* ------------------------------------------------------------- */}
        {challenge.type === 'wire_circuit' && (
          <div className="space-y-4 py-1">
            <div className="text-center space-y-1">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-mono">
                灵流导线拆解 · CIRCUIT DEFUSAL
              </span>
              <p className="text-xs text-zinc-300">
                根据线索判断唯一正确的导线。切断正确回路即可解除禁制，切错将引爆反噬！
              </p>
            </div>

            {/* Wire list */}
            <div className="space-y-2.5">
              {(
                challenge.wireData?.wires || [
                  { id: 'w1', color: 'rose', label: '赤焰导线（火相）', isCorrect: false },
                  { id: 'w2', color: 'cyan', label: '玄水导线（水相）', isCorrect: true },
                  { id: 'w3', color: 'emerald', label: '青木导线（木相）', isCorrect: false },
                ]
              ).map((wire) => {
                const isCut = cutWireIds.includes(wire.id);
                return (
                  <div
                    key={wire.id}
                    className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                      isCut
                        ? 'bg-zinc-950/40 border-zinc-800 opacity-60'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-8 rounded-full shadow-md ${
                          wire.color.includes('rose') || wire.color.includes('red')
                            ? 'bg-rose-500 shadow-rose-500/40'
                            : wire.color.includes('cyan') || wire.color.includes('blue')
                            ? 'bg-cyan-400 shadow-cyan-400/40'
                            : 'bg-emerald-400 shadow-emerald-400/40'
                        }`}
                      />
                      <span className="text-xs font-semibold text-zinc-200">{wire.label}</span>
                    </div>

                    <button
                      type="button"
                      disabled={isCut || gameState !== 'playing'}
                      onClick={() => handleCutWire(wire)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500 hover:text-zinc-950 text-zinc-300 text-xs font-bold transition-all border border-zinc-700 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>{isCut ? '已切断' : '剪断导线'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {feedbackMsg && (
          <div
            className={`mt-3 p-3 rounded-2xl text-xs flex items-center gap-2 border animate-fade-in ${
              gameState === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                : gameState === 'failed'
                ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                : 'bg-amber-950/50 border-amber-500/30 text-amber-200'
            }`}
          >
            {gameState === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="leading-relaxed">{feedbackMsg}</span>
          </div>
        )}

        {/* Outcome Actions & Resolution Buttons */}
        <div className="mt-4 pt-3.5 border-t border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
          >
            暂且放弃 · 另择出路
          </button>

          <div className="flex items-center gap-2">
            {gameState === 'success' ? (
              <button
                type="button"
                onClick={() => {
                  onSuccess(challenge.rewardAction);
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>推进战果：开启机缘！</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : gameState === 'failed' ? (
              <button
                type="button"
                onClick={() => {
                  onFailure(challenge.penaltyAction);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-zinc-950 font-bold text-xs shadow-md shadow-rose-500/25 transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
              >
                <span>承受后果：闪避应对</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setInputCode('');
                  setVarValue(0);
                  setHitsCount(0);
                  setCutWireIds([]);
                  setFeedbackMsg(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重置</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Pre-configured themed mini-game generator for spontaneous explorations
 */
export function generateThemedMiniGame(worldGenre: string = '仙侠'): MiniGameChallenge {
  const seed = Date.now();
  const types: Array<'password_lock' | 'equation_puzzle' | 'lockpick_qte' | 'wire_circuit'> = [
    'password_lock',
    'equation_puzzle',
    'lockpick_qte',
    'wire_circuit',
  ];
  const chosenType = types[Math.floor(Math.random() * types.length)];
  const isSciFi = worldGenre === '赛博朋克' || worldGenre === '科幻' || worldGenre === '废土';

  if (chosenType === 'password_lock') {
    const d1 = Math.floor(Math.random() * 9) + 1;
    const d2 = Math.floor(Math.random() * 10);
    const d3 = Math.floor(Math.random() * 10);
    const d4 = Math.floor(Math.random() * 10);
    const pass = `${d1}${d2}${d3}${d4}`;

    if (isSciFi) {
      return {
        id: `mg_${seed}`,
        type: 'password_lock',
        title: '加密战术终端四位密码锁',
        description: '终端控制台被防篡改密码锁死，若能破解可获取区域安防控制权与补给。',
        clue: `终端侧面用激光刻着一段残存字符：“开机应急覆写代码为【${pass}】，输入即可解除防卫系统”。`,
        targetAnswer: pass,
        lockData: { length: 4, codeType: 'number', hint: `序列代码 ${pass}` },
        rewardAction: `【破解成功】你敲入 ${pass}，控制台终端发出清脆鸣音，防爆储物仓开启，你获得了内部的高阶战术装备与能量核心！`,
        penaltyAction: '【破解失败】密码错误次数超标，终端触发高压静电电弧防卫，你被电弧击退数步，气血震荡！',
      };
    } else {
      return {
        id: `mg_${seed}`,
        type: 'password_lock',
        title: '上古青铜暗格四象天机锁',
        description: '石室中央立着一具刻有八卦符箓的青铜机关箱，表面排列着旋转铜轮。',
        clue: `箱盖上刻有古偈：“一生二，二生三，三生万物，取象四极，四柱灵数为：${d1} · ${d2} · ${d3} · ${d4}”。`,
        targetAnswer: pass,
        lockData: { length: 4, codeType: 'number', hint: `四柱排列：${d1} ${d2} ${d3} ${d4}` },
        rewardAction: `【破解成功】青铜齿轮咔咔转动，四柱锁扣定格在 ${pass}，箱盖滑开，里面静静卧着一枚流光溢彩的古玉髓与秘籍残页！`,
        penaltyAction: '【破解失败】铜锁发出机括机簧崩紧的异响，数枚淬毒铁蒺藜自暗孔激射而出！',
      };
    }
  }

  if (chosenType === 'equation_puzzle') {
    const A = Math.floor(Math.random() * 4) + 2; // 2 to 5
    const X_ans = Math.floor(Math.random() * 7) + 3; // 3 to 9
    const B = Math.floor(Math.random() * 8) + 2; // 2 to 9
    const isAddition = Math.random() > 0.4;
    const C = isAddition ? A * X_ans + B : A * X_ans - B;
    const sign = isAddition ? '+' : '-';
    const expr = `${A}X ${sign} ${B}`;
    const question = `${expr} = ${C}，求解未知数 X 的整数值`;
    const hint = isAddition
      ? `两端同减 ${B} 得到 ${A}X = ${C - B}，两端除以 ${A} 即可算出 X = ${X_ans}`
      : `两端同加 ${B} 得到 ${A}X = ${C + B}，两端除以 ${A} 即可算出 X = ${X_ans}`;

    return {
      id: `mg_${seed}`,
      type: 'equation_puzzle',
      title: isSciFi ? '反应堆能量阀配平方程' : '炼金魔导天平配平阵法',
      description: '两侧法阵砝码与灵枢处于失衡状态，需要求解未知数使双臂天平精准平衡。',
      clue: `基准公式铭刻：“未知核心 X 遵循均衡法则，计算公式为【${expr} = ${C}】”。`,
      targetAnswer: String(X_ans),
      equationData: {
        question,
        variableName: 'X',
        leftSideExpr: expr,
        rightSideValue: C,
        correctValue: X_ans,
        hint,
      },
      rewardAction: `【配平成功】未知数归位为 ${X_ans}，双臂天平精准归零，法阵激荡起耀眼的五色霞光，压制在你身上的禁制彻底消散，内力大涨！`,
      penaltyAction: '【配平失误】失衡的能量倒灌冲撞，阵眼发生剧烈爆炸，灼热的气浪将你掀翻在地！',
    };
  }

  if (chosenType === 'lockpick_qte') {
    const speeds = [0.9, 1.1, 1.3];
    const speed = speeds[Math.floor(Math.random() * speeds.length)];
    const targetZoneStart = Math.floor(Math.random() * 35) + 30; // 30 to 65%
    const targetZoneWidth = Math.floor(Math.random() * 8) + 20; // 20 to 28%
    const requiredHits = Math.floor(Math.random() * 2) + 2; // 2 or 3

    return {
      id: `mg_${seed}`,
      type: 'lockpick_qte',
      title: '密道重装机械锁芯微操',
      description: '一道精密铸造的多重滚珠机械锁，必须凭借惊人指力在破绽瞬间卡住锁栓。',
      clue: '仔细聆听锁芯内发条摆动的节奏，在游标划过绿色破绽安全区的刹那果断截停！',
      qteData: {
        targetZoneStart,
        targetZoneWidth,
        speed,
        requiredHits,
      },
      rewardAction: '【微操撬锁成功】随着连续两声清脆的“咔哒”脆响，厚重的玄铁门锁应声脱落，后方的密道一览无余！',
      penaltyAction: '【撬锁失手】铁丝在锁芯深处崩断卡死，撞动了后方悬挂的惊魂铜铃，整座据点的守卫都被惊动！',
    };
  }

  // wire_circuit
  const wirePool = isSciFi
    ? [
        { color: 'rose', label: '赤红高压主电缆', isCorrect: false },
        { color: 'cyan', label: '蔚蓝冷却灵流回路', isCorrect: false },
        { color: 'emerald', label: '青翠传感反馈回路', isCorrect: false },
        { color: 'amber', label: '金黄备用跳线导轨', isCorrect: false },
        { color: 'purple', label: '幽紫脉冲点火引线', isCorrect: false },
      ]
    : [
        { color: 'rose', label: '赤焰导线（火灵脉）', isCorrect: false },
        { color: 'cyan', label: '玄水导线（水灵脉）', isCorrect: false },
        { color: 'emerald', label: '青木导线（木灵脉）', isCorrect: false },
        { color: 'amber', label: '厚土导线（土灵脉）', isCorrect: false },
        { color: 'purple', label: '紫电导线（雷灵脉）', isCorrect: false },
      ];

  const shuffled = [...wirePool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);
  const correctIdx = Math.floor(Math.random() * 3);
  const correctWire = selected[correctIdx];

  const wires = selected.map((w, idx) => ({
    id: `w_${idx + 1}`,
    color: w.color,
    label: w.label,
    isCorrect: idx === correctIdx,
  }));

  const clue = isSciFi
    ? `战术引信手册注记：“过载回路必须切断第 ${correctIdx + 1} 根【${correctWire.label}】方能平息能量！”`
    : `秘卷批注：“相生相克，此时阵眼急剧异动，当斩断第 ${correctIdx + 1} 根【${correctWire.label}】！”`;

  return {
    id: `mg_${seed}`,
    type: 'wire_circuit',
    title: isSciFi ? '引信防爆回路导线拆解' : '五行生克符文灵脉切断',
    description: '暗匣连接着三道流淌着危险能量的引信回路，唯有斩断生克关键的一根方可安全拆除。',
    clue,
    wireData: {
      wires,
      hint: `斩断第 ${correctIdx + 1} 根【${correctWire.label}】！`,
    },
    rewardAction: `【回路拆解成功】灵光在第 ${correctIdx + 1} 根【${correctWire.label}】剪断处温顺熄灭，致命引信化为死物，你解除了危机！`,
    penaltyAction: '【剪错回路】能量瞬间逆流短路，爆燃的烈焰伴随轰鸣炸裂开来！',
  };
}
