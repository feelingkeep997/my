"use client";

import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { ArrowLeft, BookOpen, Brain, BarChart3, Timer, Trophy, EyeOff } from "lucide-react";
import Link from "next/link";
import { vocabulary } from "@/lib/vocabulary-data";
import {
  loadState, saveState, getStats, getDueWords, getNewWords,
  type SRSState, type SRSStats,
} from "@/lib/srs-engine";
import {
  loadGamification, saveGamification, checkAchievements,
  type GamificationState, type GameStats,
} from "@/lib/gamification";

import StatsBar from "./stats-bar";
import FlashcardView from "./flashcard-view";

const QuizMode = lazy(() => import("./quiz-mode"));
const DashboardView = lazy(() => import("./dashboard-view"));
const SRSVisualizer = lazy(() => import("./srs-visualizer"));
const PomodoroTimer = lazy(() => import("./pomodoro-timer"));
const AchievementsView = lazy(() => import("./achievements"));
const VocabTest = lazy(() => import("./vocab-test"));

type Tab = "learn" | "quiz" | "dashboard" | "focus" | "achievements";
type LearnMode = "learn" | "review";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "learn", label: "学习", icon: <BookOpen className="size-4" /> },
  { id: "quiz", label: "测验", icon: <Brain className="size-4" /> },
  { id: "dashboard", label: "仪表盘", icon: <BarChart3 className="size-4" /> },
  { id: "focus", label: "专注", icon: <Timer className="size-4" /> },
  { id: "achievements", label: "成就", icon: <Trophy className="size-4" /> },
];

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-b-cyan-400/40 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
    </div>
  );
}

export default function VocabLayout() {
  const [tab, setTab] = useState<Tab>("learn");
  const [learnMode, setLearnMode] = useState<LearnMode>("learn");
  const [srsState, setSrsState] = useState<SRSState | null>(null);
  const [gamification, setGamification] = useState<GamificationState | null>(null);
  const [sessionLearned, setSessionLearned] = useState(0);
  const [showVisualizer, setShowVisualizer] = useState(false);
  const [hideMeaning, setHideMeaning] = useState(false);
  const [quizSubTab, setQuizSubTab] = useState<"quiz" | "test">("quiz");

  useEffect(() => {
    setSrsState(loadState());
    setGamification(loadGamification());
  }, []);

  const stats: SRSStats | null = srsState ? getStats(srsState) : null;

  const currentWords = srsState
    ? learnMode === "learn" ? getNewWords(srsState, srsState.settings?.dailyNewWords ?? 15) : getDueWords(srsState)
    : [];

  const handleFlashcardUpdate = useCallback(
    (newSRS: SRSState, newGam: GamificationState, learned: number) => {
      setSrsState(newSRS);
      setGamification(newGam);
      setSessionLearned(learned);
      saveState(newSRS);

      const s = getStats(newSRS);
      const gameStats: GameStats = {
        totalLearned: s.mastered + s.reviewing + s.learning,
        totalMastered: s.mastered,
        currentStreak: newSRS.streak,
        longestStreak: newSRS.longestStreak,
        perfectQuizzes: newGam.perfectQuizzes,
        pomodorosCompleted: newGam.totalPomodoros,
        wordsLearnedInSession: learned,
      };
      const { newState, unlocked } = checkAchievements(newGam, gameStats);
      if (unlocked.length > 0) {
        setGamification(newState);
        saveGamification(newState);
      } else {
        saveGamification(newGam);
      }
    },
    []
  );

  const handleQuizDone = useCallback((newSRS: SRSState, newGam: GamificationState) => {
    setSrsState(newSRS);
    setGamification(newGam);
    saveState(newSRS);
    saveGamification(newGam);
    setTab("learn");
  }, []);

  const handleGamUpdate = useCallback((newGam: GamificationState) => {
    setGamification(newGam);
    saveGamification(newGam);
  }, []);

  if (!srsState || !gamification || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(160deg, #08080f 0%, #0c0c18 50%, #0a0a14 100%)" }}>
        <div className="relative">
          <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-b-cyan-400/40 rounded-full animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white" style={{ background: "linear-gradient(160deg, #08080f 0%, #0c0c18 50%, #0a0a14 100%)" }}>
      <div style={{ paddingTop: "56px" }}>
        {/* Header */}
        <div
          className="border-b border-white/[0.04]"
          style={{
            background: "linear-gradient(180deg, rgba(12,12,20,0.95) 0%, rgba(10,10,18,0.9) 100%)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-all duration-300 text-sm group"
              >
                <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
                返回
              </Link>
              <h1 className="text-lg font-semibold tracking-tight">CET-6 词汇</h1>
              <div className="w-16" />
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
              {TABS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-all duration-300 ease-out whitespace-nowrap ${
                    tab === t.id
                      ? "text-white"
                      : "text-white/30 hover:text-white/50 hover:bg-white/[0.03]"
                  }`}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {t.icon}
                  {t.label}
                  {tab === t.id && (
                    <span className="absolute inset-0 rounded-xl bg-white/[0.06] border border-white/[0.08]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="container mx-auto px-4 py-4">
          <StatsBar stats={stats} gamification={gamification} />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 pb-12">
          <div
            key={tab}
            className="animate-[fadeInUp_0.4s_cubic-bezier(0.22,1,0.36,1)_both]"
          >
            {tab === "learn" && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                    onClick={() => setLearnMode("learn")}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out ${
                      learnMode === "learn"
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shadow-sm shadow-cyan-500/10"
                        : "text-white/30 hover:text-white/50 border border-transparent"
                    }`}
                  >
                    学习新词 ({stats.newCount})
                  </button>
                  <button
                    onClick={() => setLearnMode("review")}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out ${
                      learnMode === "review"
                        ? "bg-purple-500/15 text-purple-400 border border-purple-500/25 shadow-sm shadow-purple-500/10"
                        : "text-white/30 hover:text-white/50 border border-transparent"
                    }`}
                  >
                    复习旧词 ({stats.dueToday})
                  </button>
                  <button
                    onClick={() => setShowVisualizer((v) => !v)}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out ${
                      showVisualizer
                        ? "bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-sm shadow-blue-500/10"
                        : "text-white/30 hover:text-white/50 border border-transparent"
                    }`}
                  >
                    <Brain className="size-3.5 inline mr-1" />
                    算法可视化
                  </button>
                  <button
                    onClick={() => setHideMeaning((v) => !v)}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out ${
                      hideMeaning
                        ? "bg-violet-500/15 text-violet-400 border border-violet-500/25 shadow-sm shadow-violet-500/10"
                        : "text-white/30 hover:text-white/50 border border-transparent"
                    }`}
                  >
                    <EyeOff className="size-3.5 inline mr-1" />
                    隐藏释义
                  </button>
                  <button
                    onClick={() => {
                      const newGoal = prompt("请输入每日新词目标（建议 10-50）：", srsState?.settings?.dailyNewWords?.toString() || "15");
                      const parsed = parseInt(newGoal || "15", 10);
                      if (!isNaN(parsed) && parsed > 0) {
                        const updated = {
                          ...srsState,
                          settings: { ...srsState.settings, dailyNewWords: parsed }
                        };
                        setSrsState(updated);
                        saveState(updated);
                      }
                    }}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out text-white/30 hover:text-white/50 border border-transparent`}
                  >
                    ⚙️ 设置计划
                  </button>
                </div>

                {currentWords.length === 0 ? (
                  <div className="text-center py-16 animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
                    <p className="text-5xl mb-4">{learnMode === "learn" ? "🎓" : "✅"}</p>
                    <h2 className="text-xl font-semibold text-white mb-2">
                      {learnMode === "learn" ? "所有单词已学完！" : "今日复习已完成！"}
                    </h2>
                    <p className="text-white/30 text-sm">
                      {learnMode === "learn" ? "切换到复习模式巩固记忆" : "明天再来复习吧"}
                    </p>
                  </div>
                ) : (
                  <FlashcardView
                    words={currentWords}
                    mode={learnMode}
                    srsState={srsState}
                    gamification={gamification}
                    onUpdate={handleFlashcardUpdate}
                    hideMeaning={hideMeaning}
                  />
                )}

                {showVisualizer && (
                  <div className="mt-10 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
                    <Suspense fallback={<TabLoader />}>
                      <SRSVisualizer words={vocabulary} srsState={srsState} />
                    </Suspense>
                  </div>
                )}
              </div>
            )}

            {tab === "quiz" && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <button
                    onClick={() => setQuizSubTab("quiz")}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out ${
                      quizSubTab === "quiz"
                        ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/25 shadow-sm shadow-cyan-500/10"
                        : "text-white/30 hover:text-white/50 border border-transparent"
                    }`}
                  >
                    单词测验
                  </button>
                  <button
                    onClick={() => setQuizSubTab("test")}
                    className={`px-5 py-2 rounded-full text-sm transition-all duration-300 ease-out ${
                      quizSubTab === "test"
                        ? "bg-violet-500/15 text-violet-400 border border-violet-500/25 shadow-sm shadow-violet-500/10"
                        : "text-white/30 hover:text-white/50 border border-transparent"
                    }`}
                  >
                    词汇量测试
                  </button>
                </div>
                {quizSubTab === "quiz" ? (
                  <Suspense fallback={<TabLoader />}>
                    <QuizMode
                      words={currentWords.length > 0 ? currentWords : vocabulary.slice(0, 20)}
                      srsState={srsState}
                      gamification={gamification}
                      onDone={handleQuizDone}
                    />
                  </Suspense>
                ) : (
                  <Suspense fallback={<TabLoader />}>
                    <VocabTest />
                  </Suspense>
                )}
              </div>
            )}

            {tab === "dashboard" && (
              <Suspense fallback={<TabLoader />}>
                <DashboardView srsState={srsState} stats={stats} />
              </Suspense>
            )}

            {tab === "focus" && (
              <Suspense fallback={<TabLoader />}>
                <PomodoroTimer gamification={gamification} onUpdate={handleGamUpdate} />
              </Suspense>
            )}

            {tab === "achievements" && (
              <Suspense fallback={<TabLoader />}>
                <AchievementsView gamification={gamification} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
