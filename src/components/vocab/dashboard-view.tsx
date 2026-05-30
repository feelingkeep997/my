"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { BookOpen, Brain, Clock, Target, TrendingUp, Flame } from "lucide-react";
import type { SRSState, SRSStats } from "@/lib/srs-engine";

interface Props {
  srsState: SRSState;
  stats: SRSStats;
}

const COLORS = {
  new: "#6b7280",
  learning: "#f59e0b",
  review: "#3b82f6",
  mastered: "#10b981",
};

export default function DashboardView({ srsState, stats }: Props) {
  const pieData = useMemo(
    () => [
      { name: "未学习", value: stats.newCount, color: COLORS.new },
      { name: "学习中", value: stats.learning, color: COLORS.learning },
      { name: "复习中", value: stats.reviewing, color: COLORS.review },
      { name: "已掌握", value: stats.mastered, color: COLORS.mastered },
    ].filter((d) => d.value > 0),
    [stats]
  );

  const dailyData = useMemo(() => {
    const days: {
      date: string;
      newWords: number;
      reviewed: number;
      correct: number;
      accuracy: number;
    }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const record = srsState.dailyRecords.find((r) => r.date === dateStr);
      days.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        newWords: record?.newWords ?? 0,
        reviewed: record?.reviewed ?? 0,
        correct: record?.correct ?? 0,
        accuracy:
          record && record.reviewed > 0
            ? Math.round((record.correct / record.reviewed) * 100)
            : 0,
      });
    }
    return days;
  }, [srsState]);

  const heatmapData = useMemo(() => {
    const days: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const record = srsState.dailyRecords.find((r) => r.date === dateStr);
      const count = (record?.newWords ?? 0) + (record?.reviewed ?? 0);
      days.push({ date: dateStr.slice(5), count });
    }
    return days;
  }, [srsState]);

  const maxHeat = Math.max(1, ...heatmapData.map((d) => d.count));

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <TrendingUp className="size-5 text-cyan-400" />
        数据仪表盘
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <DashCard
          icon={<BookOpen className="size-3.5" />}
          label="总词数"
          value={stats.total}
          color="text-white/80"
          delay={0}
        />
        <DashCard
          icon={<Brain className="size-3.5" />}
          label="已掌握"
          value={stats.mastered}
          color="text-emerald-400"
          delay={1}
        />
        <DashCard
          icon={<Target className="size-3.5" />}
          label="待复习"
          value={stats.dueToday}
          color="text-cyan-400"
          delay={2}
        />
        <DashCard
          icon={<Flame className="size-3.5" />}
          label="最长连续"
          value={`${stats.longestStreak}天`}
          color="text-orange-400"
          delay={3}
        />
      </div>

      {/* Today's Report */}
      <div
        className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-50"
        style={{
          background:
            "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
        }}
      >
        <h3 className="text-sm font-medium text-cyan-400/80 mb-4 flex items-center gap-2">
          <BookOpen className="size-4" />
          今日学习报告
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
            <p className="text-2xl font-bold text-cyan-400 tabular-nums">{stats.todayNew}</p>
            <p className="text-[11px] text-white/25 mt-1">新学单词</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
            <p className="text-2xl font-bold text-violet-400 tabular-nums">{stats.todayReviewed}</p>
            <p className="text-[11px] text-white/25 mt-1">复习单词</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">
              {stats.todayReviewed > 0 ? Math.round((stats.todayCorrect / stats.todayReviewed) * 100) : 0}%
            </p>
            <p className="text-[11px] text-white/25 mt-1">正确率</p>
          </div>
          <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
            <p className="text-2xl font-bold text-orange-400 tabular-nums">{stats.streak}</p>
            <p className="text-[11px] text-white/25 mt-1">连续天数</p>
          </div>
        </div>
        {stats.todayReviewed > 0 && stats.todayCorrect < stats.todayReviewed && (
          <div className="rounded-xl bg-red-500/[0.03] border border-red-500/[0.06] p-3">
            <p className="text-[11px] text-red-400/60 mb-1">
              今日有 {stats.todayReviewed - stats.todayCorrect} 个词答错，建议重点复习
            </p>
          </div>
        )}
        {stats.todayReviewed === 0 && stats.todayNew === 0 && (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
            <p className="text-xs text-white/20">今日还没有学习记录，开始学习吧！</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Learning Trend */}
        <div
          className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-100"
          style={{
            background:
              "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
          }}
        >
          <h3 className="text-sm font-medium text-cyan-400/80 mb-4">
            学习趋势（近14天）
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reviewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#a78bfa"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="#a78bfa"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.03)"
              />
              <XAxis
                dataKey="date"
                tick={{
                  fill: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                }}
                axisLine={{
                  stroke: "rgba(255,255,255,0.06)",
                }}
              />
              <YAxis
                tick={{
                  fill: "rgba(255,255,255,0.2)",
                  fontSize: 10,
                }}
                axisLine={{
                  stroke: "rgba(255,255,255,0.06)",
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(10,10,20,0.95)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                  backdropFilter: "blur(12px)",
                }}
              />
              <Area
                type="monotone"
                dataKey="newWords"
                name="新词"
                stroke="#06b6d4"
                fill="url(#newGrad)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="reviewed"
                name="复习"
                stroke="#a78bfa"
                fill="url(#reviewGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Word Distribution */}
        <div
          className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-200"
          style={{
            background:
              "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
          }}
        >
          <h3 className="text-sm font-medium text-cyan-400/80 mb-4">
            词汇分布
          </h3>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5">
              {pieData.map((entry) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: entry.color }}
                  />
                  <span className="text-white/40">{entry.name}</span>
                  <span className="text-white/70 font-medium tabular-nums">
                    {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div
        className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-300"
        style={{
          background:
            "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
        }}
      >
        <h3 className="text-sm font-medium text-cyan-400/80 mb-4 flex items-center gap-2">
          <Clock className="size-4" />
          学习热力图（近30天）
        </h3>
        <div className="flex gap-1 overflow-x-auto pb-2">
          {heatmapData.map((d, i) => {
            const intensity = d.count / maxHeat;
            return (
              <div
                key={d.date}
                className="group relative"
              >
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-[3px] transition-all duration-300 hover:scale-125"
                  style={{
                    background:
                      intensity === 0
                        ? "rgba(255,255,255,0.03)"
                        : intensity < 0.3
                          ? "rgba(6,182,212,0.2)"
                          : intensity < 0.6
                            ? "rgba(6,182,212,0.4)"
                            : intensity < 0.8
                              ? "rgba(6,182,212,0.6)"
                              : "rgba(6,182,212,0.85)",
                    animationDelay: `${i * 15}ms`,
                  }}
                />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                  <div
                    className="text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap"
                    style={{
                      background: "rgba(10,10,20,0.95)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    {d.date}: {d.count} 个词
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-white/20">
          <span>少</span>
          {[0, 0.2, 0.4, 0.6, 0.8].map((v) => (
            <div
              key={v}
              className="w-3 h-3 rounded-[2px]"
              style={{
                background:
                  v === 0
                    ? "rgba(255,255,255,0.03)"
                    : `rgba(6,182,212,${v})`,
              }}
            />
          ))}
          <span>多</span>
        </div>
      </div>

      {/* Accuracy Chart */}
      <div
        className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-400"
        style={{
          background:
            "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
        }}
      >
        <h3 className="text-sm font-medium text-cyan-400/80 mb-4">
          正确率趋势
        </h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={dailyData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.03)"
            />
            <XAxis
              dataKey="date"
              tick={{
                fill: "rgba(255,255,255,0.2)",
                fontSize: 10,
              }}
              axisLine={{
                stroke: "rgba(255,255,255,0.06)",
              }}
            />
            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.2)",
                fontSize: 10,
              }}
              axisLine={{
                stroke: "rgba(255,255,255,0.06)",
              }}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(10,10,20,0.95)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                fontSize: 12,
                backdropFilter: "blur(12px)",
              }}
              formatter={(v: number) => [`${v}%`, "正确率"]}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              name="正确率"
              stroke="#10b981"
              strokeWidth={2}
              dot={{
                fill: "#10b981",
                r: 3,
                strokeWidth: 0,
              }}
              activeDot={{
                r: 5,
                fill: "#10b981",
                stroke: "rgba(16,185,129,0.3)",
                strokeWidth: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function DashCard({
  icon,
  label,
  value,
  color,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  delay: number;
}) {
  return (
    <div
      className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 hover-lift animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
      style={{ animationDelay: `${delay * 60}ms` }}
    >
      <div className="flex items-center gap-1.5 text-white/30 text-[11px] mb-1">
        {icon} {label}
      </div>
      <p className={`text-lg font-bold ${color} tracking-tight tabular-nums`}>
        {value}
      </p>
    </div>
  );
}
