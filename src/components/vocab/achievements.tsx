"use client";

import { Lock, Trophy } from "lucide-react";
import { achievements, type GamificationState } from "@/lib/gamification";

interface Props {
  gamification: GamificationState;
}

export default function AchievementsView({ gamification }: Props) {
  const unlocked = gamification.unlockedAchievements;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <Trophy className="size-5 text-amber-400" />
        成就系统
        <span className="text-sm text-white/25 font-normal ml-2">
          {unlocked.length} / {achievements.length} 已解锁
        </span>
      </h2>

      <div className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-100">
        <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${(unlocked.length / achievements.length) * 100}%`,
              background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
              boxShadow: "0 0 12px rgba(245,158,11,0.3)",
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {achievements.map((a, i) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <div
              key={a.id}
              className={`group rounded-2xl border p-5 transition-all duration-400 ease-out animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] ${
                isUnlocked
                  ? "border-amber-500/15 hover:border-amber-500/25"
                  : "border-white/[0.04] hover:border-white/[0.08] opacity-50"
              }`}
              style={{
                animationDelay: `${i * 50}ms`,
                background: isUnlocked
                  ? "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, rgba(251,191,36,0.02) 100%)"
                  : "linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`text-3xl flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                    isUnlocked ? "" : "grayscale opacity-30"
                  }`}
                >
                  {isUnlocked ? (
                    <span>{a.icon}</span>
                  ) : (
                    <Lock className="size-7 text-white/15" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold tracking-tight ${
                        isUnlocked ? "text-white/90" : "text-white/30"
                      }`}
                    >
                      {a.name}
                    </h3>
                    {isUnlocked && (
                      <span className="text-[10px] text-amber-400/80 bg-amber-500/[0.08] px-2 py-0.5 rounded-full border border-amber-500/10">
                        +{a.xpReward} XP
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/25 mt-0.5">
                    {a.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
