"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react";
import type { GamificationState } from "@/lib/gamification";
import { addXP } from "@/lib/gamification";

const WORK_MINUTES = 25;
const BREAK_MINUTES = 5;
const LONG_BREAK_MINUTES = 15;

interface Props {
  gamification: GamificationState;
  onUpdate: (gam: GamificationState) => void;
}

export default function PomodoroTimer({ gamification, onUpdate }: Props) {
  const [isWork, setIsWork] = useState(true);
  const [totalSeconds, setTotalSeconds] = useState(WORK_MINUTES * 60);
  const [remaining, setRemaining] = useState(WORK_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearTimer();
            setIsRunning(false);
            if (isWork) {
              const newCount = sessionCount + 1;
              setSessionCount(newCount);
              let newGam = addXP(gamification, 25);
              newGam = {
                ...newGam,
                totalPomodoros: newGam.totalPomodoros + 1,
              };
              onUpdate(newGam);
              setIsWork(false);
              const breakTime =
                newCount % 4 === 0 ? LONG_BREAK_MINUTES : BREAK_MINUTES;
              setTotalSeconds(breakTime * 60);
              setRemaining(breakTime * 60);
            } else {
              setIsWork(true);
              setTotalSeconds(WORK_MINUTES * 60);
              setRemaining(WORK_MINUTES * 60);
            }
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [
    isRunning,
    remaining,
    isWork,
    sessionCount,
    gamification,
    onUpdate,
    clearTimer,
  ]);

  const toggleTimer = useCallback(() => {
    setIsRunning((r) => !r);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setRemaining(totalSeconds);
  }, [clearTimer, totalSeconds]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = totalSeconds > 0 ? 1 - remaining / totalSeconds : 0;

  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const accentColor = isWork ? "#06b6d4" : "#10b981";
  const accentGlow = isWork
    ? "rgba(6,182,212,0.3)"
    : "rgba(16,185,129,0.3)";

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        {isWork ? (
          <>
            <BookOpen className="size-5 text-cyan-400" />
            专注模式
          </>
        ) : (
          <>
            <Coffee className="size-5 text-emerald-400" />
            休息时间
          </>
        )}
      </h2>

      <div className="relative animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <svg width={260} height={260} className="-rotate-90">
          <circle
            cx={130}
            cy={130}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={6}
          />
          <circle
            cx={130}
            cy={130}
            r={radius}
            fill="none"
            stroke={accentColor}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{
              filter: `drop-shadow(0 0 12px ${accentGlow})`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-mono font-bold text-white tabular-nums tracking-tight">
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </span>
          <span className="text-sm text-white/25 mt-1">
            {isWork
              ? "专注中"
              : sessionCount % 4 === 0
                ? "长休息"
                : "短休息"}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-200">
        <button
          onClick={reset}
          className="p-3 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-white/40 hover:text-white/70 transition-all duration-300 backdrop-blur-sm"
        >
          <RotateCcw className="size-5" />
        </button>
        <button
          onClick={toggleTimer}
          className="group relative px-8 py-3 rounded-full font-medium text-white transition-all duration-300 active:scale-95 flex items-center gap-2 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${accentColor}33 0%, ${accentColor}22 100%)`,
            border: `1px solid ${accentColor}44`,
            boxShadow: `0 4px 20px ${accentGlow}`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isRunning ? (
            <>
              <Pause className="size-5 relative z-10" />
              <span className="relative z-10">暂停</span>
            </>
          ) : (
            <>
              <Play className="size-5 relative z-10" />
              <span className="relative z-10">
                {remaining === totalSeconds ? "开始" : "继续"}
              </span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-3 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-300">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ease-out ${
              i < sessionCount % 4 ||
              (sessionCount > 0 && sessionCount % 4 === 0 && i < 4)
                ? "bg-cyan-400 shadow-sm shadow-cyan-400/40"
                : "bg-white/[0.08]"
            }`}
          />
        ))}
        <span className="text-xs text-white/20 ml-2">
          第 {sessionCount + 1} 个番茄
        </span>
      </div>

      <div className="text-center text-sm text-white/20 space-y-1 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-400">
        <p>
          每个番茄钟: {WORK_MINUTES}分钟专注 + {BREAK_MINUTES}分钟休息
        </p>
        <p>每4个番茄后: {LONG_BREAK_MINUTES}分钟长休息</p>
        <p className="text-cyan-400/30">
          已完成 {gamification.totalPomodoros} 个番茄钟
        </p>
      </div>
    </div>
  );
}
