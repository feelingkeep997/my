"use client";

import { BookOpen, Brain, Flame, Star, Zap } from "lucide-react";
import type { SRSStats } from "@/lib/srs-engine";
import type { GamificationState } from "@/lib/gamification";
import { getLevelName, getLevelProgress, getXPForNextLevel } from "@/lib/gamification";

interface Props {
  stats: SRSStats;
  gamification: GamificationState;
}

export default function StatsBar({ stats, gamification }: Props) {
  const levelProgress = getLevelProgress(gamification.xp);
  const xpToNext = getXPForNextLevel(gamification.xp);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      <StatCard
        icon={<BookOpen className="size-3.5" />}
        label="待复习"
        value={stats.dueToday}
        color="text-cyan-400"
        gradient="from-cyan-500/15 to-cyan-500/5"
        delay={0}
      />
      <StatCard
        icon={<Brain className="size-3.5" />}
        label="已掌握"
        value={stats.mastered}
        color="text-emerald-400"
        gradient="from-emerald-500/15 to-emerald-500/5"
        delay={1}
      />
      <StatCard
        icon={<Flame className="size-3.5" />}
        label="连续天数"
        value={stats.streak}
        color="text-orange-400"
        gradient="from-orange-500/15 to-orange-500/5"
        delay={2}
      />
      <StatCard
        icon={<Star className="size-3.5" />}
        label={getLevelName(gamification.level)}
        value={`Lv.${gamification.level + 1}`}
        color="text-amber-400"
        gradient="from-amber-500/15 to-amber-500/5"
        delay={3}
        extra={
          <div className="mt-2">
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${levelProgress * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b, #fbbf24)",
                  boxShadow: "0 0 8px rgba(245,158,11,0.4)",
                }}
              />
            </div>
            <p className="text-[10px] text-white/20 mt-1">{xpToNext} XP 升级</p>
          </div>
        }
      />
      <StatCard
        icon={<Zap className="size-3.5" />}
        label="今日学习"
        value={`${stats.todayNew}+${stats.todayReviewed}`}
        color="text-violet-400"
        gradient="from-violet-500/15 to-violet-500/5"
        delay={4}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  gradient,
  delay,
  extra,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  gradient: string;
  delay: number;
  extra?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-xl border border-white/[0.05] bg-gradient-to-br ${gradient} p-3 backdrop-blur-sm animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] hover-lift`}
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      <div className={`flex items-center gap-1.5 ${color} mb-1`}>
        {icon}
        <span className="text-[11px] opacity-80">{label}</span>
      </div>
      <p className={`text-lg font-bold ${color} tracking-tight`}>{value}</p>
      {extra}
    </div>
  );
}
