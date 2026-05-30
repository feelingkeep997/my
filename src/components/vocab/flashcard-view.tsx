"use client";

import { useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight, Eye, Volume2 } from "lucide-react";
import type { Word } from "@/lib/vocabulary-data";
import type { SRSState, ReviewQuality } from "@/lib/srs-engine";
import { reviewWord, markNewWord, getWordProgress, resetWordProgress } from "@/lib/srs-engine";
import type { GamificationState } from "@/lib/gamification";
import { addXP } from "@/lib/gamification";

interface Props {
  words: Word[];
  mode: "learn" | "review";
  srsState: SRSState;
  gamification: GamificationState;
  onUpdate: (srs: SRSState, gam: GamificationState, sessionLearned: number) => void;
  hideMeaning?: boolean;
}

export default function FlashcardView({ words, mode, srsState, gamification, onUpdate, hideMeaning }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [sessionLearned, setSessionLearned] = useState(0);

  const current = words[index];

  const goNext = useCallback(() => {
    if (index < words.length - 1) {
      setFlipped(false);
      setTimeout(() => setIndex((i) => i + 1), 150);
    }
  }, [index, words.length]);

  const goPrev = useCallback(() => {
    if (index > 0) {
      setFlipped(false);
      setTimeout(() => setIndex((i) => i - 1), 150);
    }
  }, [index]);

  const handleRate = useCallback(
    (quality: ReviewQuality) => {
      let newSRS = { ...srsState };
      let newGam = { ...gamification };

      if (mode === "learn") {
        newSRS = markNewWord(newSRS, current.id);
        newGam = addXP(newGam, 10);
        setSessionLearned((s) => s + 1);
      } else {
        newGam = addXP(newGam, 5);
      }

      newSRS = reviewWord(newSRS, current.id, quality);
      onUpdate(newSRS, newGam, sessionLearned + (mode === "learn" ? 1 : 0));
      goNext();
    },
    [srsState, gamification, current, mode, onUpdate, goNext, sessionLearned]
  );

  const speak = useCallback(() => {
    if ("speechSynthesis" in window) {
      const u = new SpeechSynthesisUtterance(current.word);
      u.lang = "en-US";
      u.rate = 0.9;
      speechSynthesis.speak(u);
    }
  }, [current]);

  const handleReset = useCallback(() => {
    const newSRS = resetWordProgress(srsState, current.id);
    onUpdate(newSRS, gamification, sessionLearned);
  }, [srsState, gamification, current, onUpdate, sessionLearned]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
      if (flipped) {
        if (e.key === "1") handleRate(0);
        if (e.key === "2") handleRate(1);
        if (e.key === "3") handleRate(2);
        if (e.key === "4") handleRate(3);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goPrev, goNext, flipped, handleRate]);

  // Touch gesture handling
  const touchStart = { x: 0, y: 0 };
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < 40 && absDy < 40) return; // tap, ignore

    if (absDx > absDy) {
      // Horizontal swipe
      if (flipped) {
        if (dx < -50) handleRate(0); // left = forget
        else if (dx > 50) handleRate(2); // right = know
      } else {
        if (dx < -50) goPrev();
        else if (dx > 50) goNext();
      }
    } else if (dy < -50) {
      // Swipe up = flip
      setFlipped((f) => !f);
    }
  }, [flipped, goPrev, goNext, handleRate]);

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <div className="text-6xl">🎉</div>
        <h2 className="text-2xl font-bold text-white">
          {mode === "learn" ? "今日新词已学完！" : "复习完成！"}
        </h2>
        <p className="text-white/30">共学习 {words.length} 个单词</p>
      </div>
    );
  }

  const progress = getWordProgress(srsState, current.id);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Progress */}
      <div className="w-full max-w-2xl">
        <div className="flex justify-between text-sm text-white/30 mb-2">
          <span>{mode === "learn" ? "新词学习" : "复习模式"}</span>
          <span className="tabular-nums">{index + 1} / {words.length}</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((index + 1) / words.length) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
              boxShadow: "0 0 12px rgba(6,182,212,0.3)",
            }}
          />
        </div>
      </div>

      {/* Card with CSS 3D flip */}
      <div className="w-full max-w-2xl" style={{ perspective: 1200 }}>
        <div
          className="w-full min-h-[420px] cursor-pointer select-none relative"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            transition: "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)",
          }}
          onClick={() => setFlipped((f) => !f)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px) saturate(1.2)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <h2 className="text-5xl font-bold text-white mb-3 tracking-tight">{current.word}</h2>
            <p className="text-lg text-white/30 mb-6 font-mono">{current.phonetic}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak();
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/70 hover:bg-white/[0.08] transition-all duration-300 text-sm backdrop-blur-sm"
            >
              <Volume2 className="size-4" />
              发音
            </button>
            <p className="mt-10 text-white/20 text-sm animate-[pulse-soft_2s_ease-in-out_infinite]">
              点击翻转卡片
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-start overflow-y-auto"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.015) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px) saturate(1.2)",
              boxShadow:
                "0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <div className="w-full max-w-lg pt-2">
              {/* Word + Exam Frequency */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <p className="text-sm text-white/25 font-mono">{current.word}</p>
                  {current.examFrequency && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                      current.examFrequency === "high"
                        ? "text-red-400 bg-red-500/[0.1] border-red-500/20"
                        : current.examFrequency === "medium"
                          ? "text-amber-400 bg-amber-500/[0.1] border-amber-500/20"
                          : "text-white/30 bg-white/[0.04] border-white/[0.08]"
                    }`}>
                      {current.examFrequency === "high" ? "高频" : current.examFrequency === "medium" ? "中频" : "低频"}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-semibold text-cyan-400 mb-2 tracking-tight">
                  {hideMeaning ? "???" : current.meaning}
                </h3>
                <p className="text-sm text-white/30">{current.meaningEn}</p>
              </div>

              {/* Example Sentence */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 mb-3">
                <p className="text-white/60 italic text-sm mb-2 leading-relaxed">
                  &ldquo;{current.example}&rdquo;
                </p>
                <p className="text-white/30 text-xs">{current.exampleTranslation}</p>
              </div>

              {/* Root & Affix */}
              {current.rootAffix && (
                <div className="rounded-xl bg-cyan-500/[0.04] border border-cyan-500/[0.08] p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-cyan-400/70 font-medium tracking-wider uppercase">词根词缀</span>
                  </div>
                  <p className="text-sm text-cyan-300/70 leading-relaxed">{current.rootAffix}</p>
                </div>
              )}

              {/* Memory Tip */}
              {current.memoryTip && (
                <div className="rounded-xl bg-amber-500/[0.04] border border-amber-500/[0.08] p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] text-amber-400/70 font-medium tracking-wider uppercase">记忆技巧</span>
                  </div>
                  <p className="text-sm text-amber-300/70 leading-relaxed">{current.memoryTip}</p>
                </div>
              )}

              {/* Synonyms */}
              {current.synonyms && current.synonyms.length > 0 && (
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] text-white/25 font-medium tracking-wider uppercase">同义替换</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {current.synonyms.map((syn) => (
                      <span key={syn} className="text-xs text-white/40 bg-white/[0.04] px-2 py-1 rounded-md border border-white/[0.06]">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Collocations */}
              {current.collocations && current.collocations.length > 0 && (
                <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10px] text-white/25 font-medium tracking-wider uppercase">高频搭配</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {current.collocations.map((col) => (
                      <span key={col} className="text-xs text-emerald-400/60 bg-emerald-500/[0.04] px-2 py-1 rounded-md border border-emerald-500/[0.08]">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* SRS Progress */}
              {progress.status !== "new" && (
                <div className="flex items-center justify-center gap-4 text-xs text-white/20 mt-2 pb-1">
                  <span className="tabular-nums">间隔: {progress.interval}天</span>
                  <span className="tabular-nums">难度系数: {progress.easeFactor.toFixed(1)}</span>
                  <span className="tabular-nums">复习次数: {progress.repetitions}</span>
                </div>
              )}

              {/* Reset Button */}
              {progress.status !== "new" && (
                <div className="flex justify-center mt-1 pb-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleReset(); }}
                    className="text-[10px] text-white/15 hover:text-red-400/60 transition-colors duration-300 px-2 py-1"
                  >
                    重置复习
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={goPrev}
            disabled={index === 0}
            className="p-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-15 disabled:cursor-not-allowed transition-all duration-300 text-white/50 hover:text-white/80 backdrop-blur-sm"
          >
            <ChevronLeft className="size-5" />
          </button>

          {!flipped ? (
            <button
              onClick={() => setFlipped(true)}
              className="px-6 py-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/50 transition-all duration-300 flex items-center gap-2 backdrop-blur-sm"
            >
              <Eye className="size-4" />
              翻转
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <RateButton label="忘了" color="red" kbd="1" onClick={() => handleRate(0)} />
              <RateButton label="模糊" color="yellow" kbd="2" onClick={() => handleRate(1)} />
              <RateButton label="认识" color="green" kbd="3" onClick={() => handleRate(2)} />
              <RateButton label="太简单" color="cyan" kbd="4" onClick={() => handleRate(3)} />
            </div>
          )}

          <button
            onClick={goNext}
            disabled={index === words.length - 1}
            className="p-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] disabled:opacity-15 disabled:cursor-not-allowed transition-all duration-300 text-white/50 hover:text-white/80 backdrop-blur-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="flex justify-center gap-6 mt-3 text-[10px] text-white/15">
          <span>← → 切换</span>
          <span>空格 翻转</span>
          {flipped && <span>1-4 评分</span>}
        </div>
        <div className="flex justify-center gap-6 mt-1 text-[10px] text-white/10 sm:hidden">
          <span>← 左滑 忘了</span>
          <span>→ 右滑 认识</span>
          <span>↑ 上滑 翻转</span>
        </div>
      </div>
    </div>
  );
}

function RateButton({
  label,
  color,
  kbd,
  onClick,
}: {
  label: string;
  color: string;
  kbd: string;
  onClick: () => void;
}) {
  const colors: Record<string, string> = {
    red: "border-red-500/20 bg-red-500/[0.08] text-red-400 hover:bg-red-500/15 hover:border-red-500/30",
    yellow: "border-amber-500/20 bg-amber-500/[0.08] text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/30",
    green: "border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/30",
    cyan: "border-cyan-500/20 bg-cyan-500/[0.08] text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/30",
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl border transition-all duration-300 ease-out active:scale-95 flex flex-col items-center gap-0.5 backdrop-blur-sm ${colors[color]}`}
    >
      <span className="text-sm font-medium">{label}</span>
      <span className="text-[10px] opacity-40">[{kbd}]</span>
    </button>
  );
}
