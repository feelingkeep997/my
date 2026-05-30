"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, X, ArrowRight, Trophy, RotateCcw, BarChart3 } from "lucide-react";
import type { Word } from "@/lib/vocabulary-data";
import { vocabulary } from "@/lib/vocabulary-data";

type Phase = "intro" | "know" | "verify" | "result";

interface TestWord {
  word: Word;
  known: boolean | null;
}

function getVocabLevel(score: number): { level: string; desc: string; color: string } {
  const pct = score / 30;
  if (pct >= 0.9) return { level: "词汇大师", desc: "词汇量极其丰富", color: "text-amber-400" };
  if (pct >= 0.7) return { level: "词汇高手", desc: "词汇量非常优秀", color: "text-emerald-400" };
  if (pct >= 0.5) return { level: "中等水平", desc: "词汇量达到平均水平", color: "text-cyan-400" };
  if (pct >= 0.3) return { level: "需要努力", desc: "词汇量有待提高", color: "text-violet-400" };
  return { level: "初学者", desc: "建议加大词汇学习力度", color: "text-red-400" };
}

export default function VocabTest() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [testWords, setTestWords] = useState<TestWord[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [verifiedCorrect, setVerifiedCorrect] = useState(0);
  const [verifiedTotal, setVerifiedTotal] = useState(0);
  const [verifyAnswer, setVerifyAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const startTest = useCallback(() => {
    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 30).map((w) => ({ word: w, known: null }));
    setTestWords(selected);
    setCurrentIdx(0);
    setVerifiedCorrect(0);
    setVerifiedTotal(0);
    setVerifyAnswer(null);
    setShowFeedback(false);
    setStartTime(Date.now());
    setPhase("know");
  }, []);

  const handleKnow = useCallback((known: boolean) => {
    setTestWords((prev) => {
      const next = [...prev];
      next[currentIdx] = { ...next[currentIdx], known };
      return next;
    });

    if (known) {
      setPhase("verify");
      setVerifyAnswer(null);
      setShowFeedback(false);
    } else {
      if (currentIdx < testWords.length - 1) {
        setCurrentIdx((i) => i + 1);
      } else {
        setPhase("result");
      }
    }
  }, [currentIdx, testWords.length]);

  const handleVerify = useCallback((optionIdx: number) => {
    if (showFeedback) return;
    setVerifyAnswer(optionIdx);
    setShowFeedback(true);

    const word = testWords[currentIdx].word;
    const correct = word.meaning === getVerifyOptions(word)[optionIdx];
    setVerifiedTotal((t) => t + 1);
    if (correct) setVerifiedCorrect((c) => c + 1);
  }, [showFeedback, testWords, currentIdx]);

  const handleNextVerify = useCallback(() => {
    if (currentIdx < testWords.length - 1) {
      setCurrentIdx((i) => i + 1);
      setVerifyAnswer(null);
      setShowFeedback(false);
      setPhase("know");
    } else {
      setPhase("result");
    }
  }, [currentIdx, testWords.length]);

  useEffect(() => {
    if (phase !== "verify") return;
    const handler = (e: KeyboardEvent) => {
      if (showFeedback) {
        if (e.key === "Enter" || e.key === " ") handleNextVerify();
        return;
      }
      if (e.key >= "1" && e.key <= "4") handleVerify(parseInt(e.key) - 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, showFeedback, handleVerify, handleNextVerify]);

  const getVerifyOptions = (word: Word): string[] => {
    const others = vocabulary
      .filter((w) => w.id !== word.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return [...others.map((w) => w.meaning), word.meaning].sort(
      () => Math.random() - 0.5
    );
  };

  const knownCount = testWords.filter((w) => w.known === true).length;
  const verifiedCount = verifiedCorrect;
  const totalVerified = verifiedTotal;
  const estimatedScore = knownCount - (totalVerified - verifiedCount);
  const elapsed = phase === "result" ? Math.round((Date.now() - startTime) / 1000) : 0;

  if (phase === "intro") {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <div className="text-center animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="relative inline-block mb-4">
            <BarChart3 className="size-16 text-cyan-400" />
            <div className="absolute inset-0 blur-xl bg-cyan-400/20 rounded-full" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">词汇量测试</h2>
          <p className="text-white/30 text-sm max-w-md">
            随机抽取 30 个单词，先判断是否认识，认识的单词会进行验证。
            根据结果预估你的 CET-6 词汇量水平。
          </p>
        </div>
        <button
          onClick={startTest}
          className="group relative px-8 py-3 rounded-full text-white font-medium transition-all duration-300 ease-out active:scale-95 flex items-center gap-2 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.3) 100%)",
            border: "1px solid rgba(6,182,212,0.3)",
            boxShadow: "0 4px 20px rgba(6,182,212,0.15)",
          }}
        >
          <span className="relative z-10">开始测试</span>
          <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    );
  }

  if (phase === "result") {
    const { level, desc, color } = getVocabLevel(estimatedScore > 0 ? estimatedScore : 0);
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="relative">
            <Trophy className={`size-16 ${color}`} />
            <div className={`absolute inset-0 blur-xl bg-current/20 rounded-full ${color}`} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">测试完成</h2>

        <div className="text-center">
          <p className={`text-3xl font-bold ${color} mb-1`}>{level}</p>
          <p className="text-sm text-white/30">{desc}</p>
        </div>

        <div className="flex items-center gap-8 text-center">
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
            <p className="text-3xl font-bold text-cyan-400 tabular-nums">{knownCount}</p>
            <p className="text-xs text-white/30">自认认识</p>
          </div>
          <div className="text-white/15 text-2xl">/</div>
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-100">
            <p className="text-3xl font-bold text-white tabular-nums">{30}</p>
            <p className="text-xs text-white/30">总词数</p>
          </div>
          <div className="text-white/15 text-2xl">|</div>
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-200">
            <p className="text-3xl font-bold text-emerald-400 tabular-nums">
              {totalVerified > 0 ? Math.round((verifiedCorrect / totalVerified) * 100) : 0}%
            </p>
            <p className="text-xs text-white/30">验证正确率</p>
          </div>
          <div className="text-white/15 text-2xl">|</div>
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-300">
            <p className="text-3xl font-bold text-amber-400 tabular-nums">{elapsed}s</p>
            <p className="text-xs text-white/30">用时</p>
          </div>
        </div>

        <div className="w-full max-w-md">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
            <p className="text-sm text-white/40 mb-2">评估依据：</p>
            <ul className="space-y-1 text-xs text-white/25">
              <li>• 自认认识 {knownCount} 个词</li>
              <li>• 验证正确 {verifiedCorrect} 个（共验证 {totalVerified} 个）</li>
              <li>• 预估实际掌握约 {Math.max(0, estimatedScore)} / 30 个词</li>
            </ul>
          </div>
        </div>

        <button
          onClick={startTest}
          className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition-all duration-300 active:scale-95 flex items-center gap-2"
        >
          <RotateCcw className="size-4" />
          重新测试
        </button>
      </div>
    );
  }

  // Know or Verify phase
  const word = testWords[currentIdx]?.word;
  if (!word) return null;

  const verifyOpts = phase === "verify" ? getVerifyOptions(word) : [];

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-white/30 mb-2">
          <span>{phase === "know" ? "判断认识" : "验证单词"}</span>
          <span className="tabular-nums">{currentIdx + 1} / {testWords.length}</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentIdx + 1) / testWords.length) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
              boxShadow: "0 0 12px rgba(6,182,212,0.3)",
            }}
          />
        </div>
      </div>

      <div
        key={`${currentIdx}-${phase}`}
        className="w-full animate-[fadeInRight_0.4s_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        {phase === "know" ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
              {word.word}
            </h2>
            <p className="text-white/30 font-mono mb-8">{word.phonetic}</p>
            <p className="text-sm text-white/25 mb-6">你认识这个单词吗？</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleKnow(true)}
                className="px-8 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-400 hover:bg-emerald-500/15 transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <Check className="size-5" />
                认识
              </button>
              <button
                onClick={() => handleKnow(false)}
                className="px-8 py-3 rounded-xl border border-red-500/20 bg-red-500/[0.08] text-red-400 hover:bg-red-500/15 transition-all duration-300 active:scale-95 flex items-center gap-2"
              >
                <X className="size-5" />
                不认识
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-8">
              <p className="text-xs text-white/25 mb-2">请选择正确的中文释义</p>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                {word.word}
              </h2>
              <p className="text-white/30 font-mono text-sm">{word.phonetic}</p>
            </div>
            <div className="space-y-3">
              {verifyOpts.map((opt, i) => {
                let style =
                  "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-white/70";
                if (showFeedback) {
                  const correctIdx = verifyOpts.indexOf(word.meaning);
                  if (i === correctIdx)
                    style = "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400";
                  else if (i === verifyAnswer)
                    style = "border-red-500/30 bg-red-500/[0.08] text-red-400";
                  else
                    style = "border-white/[0.04] bg-white/[0.02] text-white/20";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleVerify(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-300 ease-out ${style}`}
                  >
                    <span className="text-xs text-white/20 mr-2 tabular-nums">{i + 1}.</span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={handleNextVerify}
                  className="px-6 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition-all duration-300 active:scale-95 flex items-center gap-2"
                >
                  {currentIdx < testWords.length - 1 ? "下一个" : "查看结果"}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="flex justify-center gap-6 text-[10px] text-white/15">
        {phase === "know" ? (
          <>
            <span>Y 认识</span>
            <span>N 不认识</span>
          </>
        ) : (
          <>
            <span>1-4 选择</span>
            {showFeedback && <span>Enter 下一个</span>}
          </>
        )}
      </div>
    </div>
  );
}
