"use client";

import { useState, useCallback, useEffect } from "react";
import { Check, X, ArrowRight, Trophy, RotateCcw, Pencil, ListChecks, BookOpen } from "lucide-react";
import type { Word } from "@/lib/vocabulary-data";
import { vocabulary } from "@/lib/vocabulary-data";
import type { SRSState, ReviewQuality } from "@/lib/srs-engine";
import { reviewWord } from "@/lib/srs-engine";
import type { GamificationState } from "@/lib/gamification";
import { addXP, checkAchievements } from "@/lib/gamification";

interface Props {
  words: Word[];
  srsState: SRSState;
  gamification: GamificationState;
  onDone: (srs: SRSState, gam: GamificationState) => void;
}

type QuizMode = "choice" | "spelling" | "fill" | "both";
type Phase = "select" | "quiz" | "result";

interface QuizQuestion {
  word: Word;
  type: "choice" | "spelling" | "fill";
  options: string[];
  correctIndex: number;
  sentence?: string;
  sentenceTranslation?: string;
}

function generateQuestions(words: Word[], mode: QuizMode): QuizQuestion[] {
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  const questions: QuizQuestion[] = [];

  for (const word of shuffled) {
    let type: "choice" | "spelling" | "fill";
    if (mode === "both") {
      type = Math.random() > 0.5 ? "choice" : Math.random() > 0.5 ? "spelling" : "fill";
    } else {
      type = mode;
    }

    if (type === "choice") {
      const others = vocabulary
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [
        ...others.map((w) => w.meaning),
        word.meaning,
      ].sort(() => Math.random() - 0.5);
      questions.push({
        word,
        type: "choice",
        options,
        correctIndex: options.indexOf(word.meaning),
      });
    } else if (type === "fill") {
      const sentence = word.example.replace(new RegExp(word.word, "gi"), "______");
      const others = vocabulary
        .filter((w) => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [
        ...others.map((w) => w.word),
        word.word,
      ].sort(() => Math.random() - 0.5);
      questions.push({
        word,
        type: "fill",
        options,
        correctIndex: options.indexOf(word.word),
        sentence,
        sentenceTranslation: word.exampleTranslation,
      });
    } else {
      questions.push({
        word,
        type: "spelling",
        options: [],
        correctIndex: 0,
      });
    }
  }
  return questions;
}

export default function QuizMode({
  words,
  srsState,
  gamification,
  onDone,
}: Props) {
  const [phase, setPhase] = useState<Phase>("select");
  const [quizMode, setQuizMode] = useState<QuizMode>("both");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [spellingInput, setSpellingInput] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [startTime, setStartTime] = useState(0);

  const startQuiz = useCallback(
    (mode: QuizMode) => {
      const quizWords = words.length > 0 ? words : vocabulary.slice(0, 20);
      setQuizMode(mode);
      setQuestions(generateQuestions(quizWords, mode));
      setCurrentQ(0);
      setAnswers([]);
      setSelectedOption(null);
      setSpellingInput("");
      setShowFeedback(false);
      setStartTime(Date.now());
      setPhase("quiz");
    },
    [words]
  );

  const handleChoiceAnswer = useCallback(
    (optionIndex: number) => {
      if (showFeedback) return;
      setSelectedOption(optionIndex);
      const correct = optionIndex === questions[currentQ].correctIndex;
      setAnswers((a) => [...a, correct]);
      setShowFeedback(true);
    },
    [showFeedback, questions, currentQ]
  );

  const handleSpellingAnswer = useCallback(() => {
    if (showFeedback || !spellingInput.trim()) return;
    const correct =
      spellingInput.trim().toLowerCase() ===
      questions[currentQ].word.word.toLowerCase();
    setAnswers((a) => [...a, correct]);
    setShowFeedback(true);
  }, [showFeedback, spellingInput, questions, currentQ]);

  const handleNext = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelectedOption(null);
      setSpellingInput("");
      setShowFeedback(false);
    } else {
      setPhase("result");
    }
  }, [currentQ, questions.length]);

  useEffect(() => {
    if (phase !== "quiz") return;
    const handler = (e: KeyboardEvent) => {
      if (showFeedback) {
        if (e.key === "Enter" || e.key === " ") handleNext();
        return;
      }
      const q = questions[currentQ];
      if (q?.type === "choice" || q?.type === "fill") {
        if (e.key >= "1" && e.key <= "4")
          handleChoiceAnswer(parseInt(e.key) - 1);
      }
      if (q?.type === "spelling") {
        if (e.key === "Enter") handleSpellingAnswer();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    phase,
    showFeedback,
    questions,
    currentQ,
    handleChoiceAnswer,
    handleSpellingAnswer,
    handleNext,
  ]);

  const correctCount = answers.filter(Boolean).length;
  const elapsed =
    phase === "result" ? Math.round((Date.now() - startTime) / 1000) : 0;
  const isPerfect = correctCount === questions.length && questions.length > 0;

  const applyResults = useCallback(() => {
    let newSRS = { ...srsState };
    let newGam = { ...gamification };

    questions.forEach((q, i) => {
      const quality: ReviewQuality = answers[i] ? 2 : 0;
      newSRS = reviewWord(newSRS, q.word.id, quality);
      if (answers[i]) newGam = addXP(newGam, 15);
    });

    if (isPerfect) {
      newGam = {
        ...newGam,
        perfectQuizzes: newGam.perfectQuizzes + 1,
      };
      const { newState } = checkAchievements(newGam, {
        totalLearned: 0,
        totalMastered: 0,
        currentStreak: 0,
        longestStreak: 0,
        perfectQuizzes: newGam.perfectQuizzes,
        pomodorosCompleted: newGam.totalPomodoros,
        wordsLearnedInSession: 0,
      });
      newGam = newState;
    }

    onDone(newSRS, newGam);
  }, [srsState, gamification, questions, answers, isPerfect, onDone]);

  if (phase === "select") {
    return (
      <div className="flex flex-col items-center gap-8 py-12">
        <h2 className="text-2xl font-bold text-white tracking-tight animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          选择测验模式
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
          <ModeCard
            icon={<ListChecks className="size-8" />}
            title="选择题"
            desc="看单词选释义"
            onClick={() => startQuiz("choice")}
            delay={0}
          />
          <ModeCard
            icon={<Pencil className="size-8" />}
            title="拼写测验"
            desc="看释义拼写单词"
            onClick={() => startQuiz("spelling")}
            delay={1}
          />
          <ModeCard
            icon={<BookOpen className="size-8" />}
            title="例句填空"
            desc="看例句选单词"
            onClick={() => startQuiz("fill")}
            delay={2}
          />
          <ModeCard
            icon={<Trophy className="size-8" />}
            title="混合测验"
            desc="随机三种题型"
            onClick={() => startQuiz("both")}
            delay={3}
          />
        </div>
      </div>
    );
  }

  if (phase === "result") {
    return (
      <div className="flex flex-col items-center gap-6 py-12">
        <div className="animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          {isPerfect ? (
            <div className="relative">
              <Trophy className="size-16 text-amber-400" />
              <div className="absolute inset-0 blur-xl bg-amber-400/20 rounded-full" />
            </div>
          ) : correctCount >= questions.length * 0.6 ? (
            <div className="relative">
              <Check className="size-16 text-emerald-400" />
              <div className="absolute inset-0 blur-xl bg-emerald-400/20 rounded-full" />
            </div>
          ) : (
            <RotateCcw className="size-16 text-cyan-400" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isPerfect
            ? "满分！"
            : correctCount >= questions.length * 0.6
              ? "做得不错！"
              : "继续加油！"}
        </h2>

        <div className="flex items-center gap-8 text-center">
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
            <p className="text-3xl font-bold text-emerald-400 tabular-nums">{correctCount}</p>
            <p className="text-xs text-white/30">正确</p>
          </div>
          <div className="text-white/15 text-2xl">/</div>
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-100">
            <p className="text-3xl font-bold text-white tabular-nums">{questions.length}</p>
            <p className="text-xs text-white/30">总题数</p>
          </div>
          <div className="text-white/15 text-2xl">|</div>
          <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-200">
            <p className="text-3xl font-bold text-cyan-400 tabular-nums">{elapsed}s</p>
            <p className="text-xs text-white/30">用时</p>
          </div>
        </div>

        {correctCount < questions.length && (
          <div className="w-full max-w-md animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-300">
            <p className="text-sm text-white/30 mb-2">错词已自动加入复习队列</p>
            <div className="space-y-2">
              {questions
                .filter((_, i) => !answers[i])
                .map((q) => (
                  <div
                    key={q.word.id}
                    className="flex items-center justify-between rounded-xl bg-red-500/[0.04] border border-red-500/[0.08] px-4 py-2.5 transition-all duration-300"
                  >
                    <span className="text-white font-medium">{q.word.word}</span>
                    <span className="text-white/40 text-sm">{q.word.meaning}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        <button
          onClick={applyResults}
          className="group relative px-8 py-3 rounded-full text-white font-medium transition-all duration-300 ease-out active:scale-95 flex items-center gap-2 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(6,182,212,0.3) 0%, rgba(59,130,246,0.3) 100%)",
            border: "1px solid rgba(6,182,212,0.3)",
            boxShadow: "0 4px 20px rgba(6,182,212,0.15)",
          }}
        >
          <span className="relative z-10">完成</span>
          <ArrowRight className="size-4 relative z-10 transition-transform duration-300 group-hover:translate-x-0.5" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div className="flex flex-col items-center gap-6 py-8 max-w-2xl mx-auto">
      <div className="w-full">
        <div className="flex justify-between text-sm text-white/30 mb-2">
          <span>{q.type === "choice" ? "选择题" : q.type === "fill" ? "例句填空" : "拼写题"}</span>
          <span className="tabular-nums">{currentQ + 1} / {questions.length}</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentQ + 1) / questions.length) * 100}%`,
              background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
              boxShadow: "0 0 12px rgba(6,182,212,0.3)",
            }}
          />
        </div>
      </div>

      <div
        key={`${currentQ}-${q.type}`}
        className="w-full animate-[fadeInRight_0.4s_cubic-bezier(0.22,1,0.36,1)_both]"
      >
        {q.type === "choice" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight">
                {q.word.word}
              </h2>
              <p className="text-white/30 font-mono">{q.word.phonetic}</p>
            </div>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let style =
                  "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-white/70";
                if (showFeedback) {
                  if (i === q.correctIndex)
                    style =
                      "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400";
                  else if (i === selectedOption)
                    style =
                      "border-red-500/30 bg-red-500/[0.08] text-red-400";
                  else
                    style =
                      "border-white/[0.04] bg-white/[0.02] text-white/20";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceAnswer(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-300 ease-out ${style}`}
                  >
                    <span className="text-xs text-white/20 mr-2 tabular-nums">
                      {i + 1}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {q.type === "fill" && (
          <div>
            <div className="text-center mb-6">
              <p className="text-xs text-white/25 mb-1">选择正确的单词填入空白处</p>
            </div>
            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-5 mb-6">
              <p className="text-lg text-white/70 leading-relaxed text-center">
                {q.sentence}
              </p>
              {q.sentenceTranslation && (
                <p className="text-sm text-white/30 mt-2 text-center">{q.sentenceTranslation}</p>
              )}
            </div>
            <div className="space-y-3">
              {q.options.map((opt, i) => {
                let style =
                  "border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] text-white/70";
                if (showFeedback) {
                  if (i === q.correctIndex)
                    style =
                      "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400";
                  else if (i === selectedOption)
                    style =
                      "border-red-500/30 bg-red-500/[0.08] text-red-400";
                  else
                    style =
                      "border-white/[0.04] bg-white/[0.02] text-white/20";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleChoiceAnswer(i)}
                    disabled={showFeedback}
                    className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-300 ease-out ${style}`}
                  >
                    <span className="text-xs text-white/20 mr-2 tabular-nums">
                      {i + 1}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div className="mt-4 rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                <p className="text-sm text-white/50 mb-1">完整例句：</p>
                <p className="text-white/70 italic">"{q.word.example}"</p>
                <p className="text-white/30 text-xs mt-1">{q.word.exampleTranslation}</p>
              </div>
            )}
          </div>
        )}

        {q.type === "spelling" && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold text-cyan-400 mb-2 tracking-tight">
                {q.word.meaning}
              </h2>
              <p className="text-white/30">{q.word.meaningEn}</p>
              <p className="text-white/20 mt-1 font-mono text-sm">
                {q.word.phonetic}
              </p>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={spellingInput}
                onChange={(e) => setSpellingInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (showFeedback) handleNext();
                    else handleSpellingAnswer();
                  }
                }}
                disabled={showFeedback}
                placeholder="输入单词..."
                autoFocus
                className="flex-1 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/40 text-lg transition-all duration-300 backdrop-blur-sm"
              />
              {!showFeedback && (
                <button
                  onClick={handleSpellingAnswer}
                  className="px-6 py-3 rounded-xl bg-cyan-500/[0.1] border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/[0.15] transition-all duration-300 backdrop-blur-sm"
                >
                  确认
                </button>
              )}
            </div>
            {showFeedback && (
              <div
                className={`mt-3 p-3 rounded-xl border animate-[fadeInUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both] ${
                  answers[currentQ]
                    ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
                    : "bg-red-500/[0.08] border-red-500/20 text-red-400"
                }`}
              >
                {answers[currentQ] ? (
                  <span className="flex items-center gap-2">
                    <Check className="size-4" /> 正确！
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <X className="size-4" /> 正确答案：{q.word.word}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showFeedback && (q.type === "choice" || q.type === "fill") && (
        <div
          className={`w-full p-3 rounded-xl border animate-[fadeInUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both] ${
            answers[currentQ]
              ? "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400"
              : "bg-red-500/[0.08] border-red-500/20 text-red-400"
          }`}
        >
          {answers[currentQ]
            ? "回答正确！"
            : `正确答案：${q.word.meaning}`}
        </div>
      )}

      {showFeedback && (
        <button
          onClick={handleNext}
          className="px-8 py-3 rounded-full bg-white/[0.05] border border-white/[0.08] text-white/60 hover:bg-white/[0.08] transition-all duration-300 active:scale-95 flex items-center gap-2 animate-[fadeIn_0.4s_cubic-bezier(0.22,1,0.36,1)_both] backdrop-blur-sm"
        >
          {currentQ < questions.length - 1 ? "下一题" : "查看结果"}
          <ArrowRight className="size-4" />
        </button>
      )}
    </div>
  );
}

function ModeCard({
  icon,
  title,
  desc,
  onClick,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
  delay: number;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative rounded-2xl border border-white/[0.06] p-6 text-center transition-all duration-400 ease-out hover:scale-[1.02] active:scale-[0.98] animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] overflow-hidden"
      style={{
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
        animationDelay: `${delay * 80}ms`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="text-cyan-400/70 mb-3 flex justify-center relative z-10 group-hover:text-cyan-400 transition-colors duration-300">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white/80 mb-1 relative z-10 group-hover:text-white transition-colors duration-300">
        {title}
      </h3>
      <p className="text-sm text-white/30 relative z-10">{desc}</p>
    </button>
  );
}
