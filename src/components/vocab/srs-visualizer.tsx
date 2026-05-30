"use client";

import { useMemo } from "react";
import { Brain, Clock, TrendingUp, Zap } from "lucide-react";
import type { Word } from "@/lib/vocabulary-data";
import type { SRSState } from "@/lib/srs-engine";
import { getWordProgress, simulateRetention } from "@/lib/srs-engine";

interface Props {
  words: Word[];
  srsState: SRSState;
}

export default function SRSVisualizer({ words, srsState }: Props) {
  const sampleWord = useMemo(() => {
    const reviewed = words.filter((w) => {
      const p = srsState.progress[w.id];
      return p && p.status !== "new";
    });
    return reviewed[0] || words[0];
  }, [words, srsState]);

  const progress = getWordProgress(srsState, sampleWord.id);
  const retentionData = simulateRetention(
    progress.easeFactor,
    progress.interval
  );

  const nodes = useMemo(() => {
    return words.slice(0, 12).map((w, i) => {
      const p = srsState.progress[w.id];
      const mastery = p ? Math.min(1, p.repetitions / 5) : 0;
      const angle = (i / 12) * Math.PI * 2;
      const radius = 80 + (1 - mastery) * 40;
      return {
        id: w.id,
        word: w.word,
        x: Math.cos(angle) * radius + 140,
        y: Math.sin(angle) * radius + 140,
        mastery,
      };
    });
  }, [words, srsState]);

  const connections = useMemo(() => {
    const result: { a: number; b: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if ((i * 7 + j * 13) % 10 < 4) {
          result.push({ a: i, b: j });
        }
      }
    }
    return result;
  }, [nodes.length]);

  const chartPath = useMemo(() => {
    const w = 300,
      h = 160,
      padX = 30,
      padY = 10;
    const points = retentionData.map((d, i) => {
      const x = padX + (i / 30) * (w - padX * 2);
      const y = h - padY - d.retention * (h - padY * 2);
      return `${x},${y}`;
    });
    return `M${points.join("L")}`;
  }, [retentionData]);

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-white flex items-center gap-2 tracking-tight animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
        <Brain className="size-5 text-cyan-400" />
        记忆引擎可视化
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Neural Network */}
        <div
          className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-100"
          style={{
            background:
              "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
          }}
        >
          <h3 className="text-sm font-medium text-cyan-400/80 mb-4 flex items-center gap-2">
            <Zap className="size-4" />
            神经网络记忆图
          </h3>
          <svg
            viewBox="0 0 280 280"
            className="w-full max-w-[280px] mx-auto"
          >
            {connections.map(({ a, b }) => {
              const na = nodes[a],
                nb = nodes[b];
              const strength = (na.mastery + nb.mastery) / 2;
              return (
                <line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={`rgba(6,182,212,${0.04 + strength * 0.25})`}
                  strokeWidth={0.5 + strength * 1.5}
                  className="transition-all duration-500"
                />
              );
            })}
            {nodes.map((node, i) => (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={4 + node.mastery * 6}
                  fill={
                    node.mastery > 0.6
                      ? "rgba(16,185,129,0.8)"
                      : node.mastery > 0
                        ? "rgba(6,182,212,0.8)"
                        : "rgba(255,255,255,0.12)"
                  }
                  className="transition-all duration-500"
                  style={{
                    transformOrigin: `${node.x}px ${node.y}px`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
                <text
                  x={node.x}
                  y={node.y + 16}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize={7}
                >
                  {node.word}
                </text>
              </g>
            ))}
            <circle
              cx={140}
              cy={140}
              r={8}
              fill="rgba(6,182,212,0.5)"
              className="animate-[pulse-soft_2s_ease-in-out_infinite]"
            />
          </svg>
          <div className="flex justify-center gap-4 mt-3 text-[10px] text-white/25">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-white/12" /> 未学
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500" /> 学习中
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> 已掌握
            </span>
          </div>
        </div>

        {/* Retention Curve */}
        <div
          className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-200"
          style={{
            background:
              "linear-gradient(145deg, rgba(0,20,40,0.6) 0%, rgba(0,10,30,0.4) 100%)",
          }}
        >
          <h3 className="text-sm font-medium text-cyan-400/80 mb-4 flex items-center gap-2">
            <TrendingUp className="size-4" />
            记忆衰减曲线 — {sampleWord.word}
          </h3>
          <svg viewBox="0 0 300 160" className="w-full">
            {[0, 0.25, 0.5, 0.75, 1].map((v) => (
              <g key={v}>
                <line
                  x1={30}
                  y1={10 + v * 140}
                  x2={270}
                  y2={10 + v * 140}
                  stroke="rgba(255,255,255,0.03)"
                />
                <text
                  x={25}
                  y={14 + v * 140}
                  textAnchor="end"
                  fill="rgba(255,255,255,0.2)"
                  fontSize={8}
                >
                  {Math.round((1 - v) * 100)}%
                </text>
              </g>
            ))}
            {[0, 5, 10, 15, 20, 25, 30].map((d) => {
              const x = 30 + (d / 30) * 240;
              return (
                <text
                  key={d}
                  x={x}
                  y={155}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.2)"
                  fontSize={8}
                >
                  {d}
                </text>
              );
            })}
            <text
              x={150}
              y={158}
              textAnchor="middle"
              fill="rgba(255,255,255,0.15)"
              fontSize={7}
            >
              天数
            </text>
            <path
              d={chartPath}
              fill="none"
              stroke="#06b6d4"
              strokeWidth={2}
            />
            <path d={`${chartPath}L270,150L30,150Z`} fill="url(#retGrad)" />
            <defs>
              <linearGradient
                id="retGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="#06b6d4"
                  stopOpacity={0.15}
                />
                <stop
                  offset="100%"
                  stopColor="#06b6d4"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Algorithm Parameters */}
      <div
        className="rounded-2xl border border-white/[0.05] p-5 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-300"
        style={{
          background:
            "linear-gradient(145deg, rgba(0,20,40,0.5) 0%, rgba(0,10,30,0.3) 100%)",
        }}
      >
        <h3 className="text-sm font-medium text-cyan-400/80 mb-4">
          SM-2 算法参数
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ParamCard
            label="难度系数 EF"
            value={progress.easeFactor.toFixed(2)}
            sub="初始值 2.5"
            icon={<TrendingUp className="size-3.5" />}
          />
          <ParamCard
            label="复习间隔"
            value={`${progress.interval} 天`}
            sub={progress.nextReview}
            icon={<Clock className="size-3.5" />}
          />
          <ParamCard
            label="复习次数"
            value={progress.repetitions.toString()}
            sub="连续正确次数"
            icon={<Zap className="size-3.5" />}
          />
          <ParamCard
            label="当前状态"
            value={statusLabel(progress.status)}
            sub="SM-2 自动调度"
            icon={<Brain className="size-3.5" />}
          />
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 text-center">
          <p className="text-xs text-white/25 font-mono">
            EF&apos; = EF + (0.1 - (5-q) × (0.08 + (5-q) × 0.02))
          </p>
          <p className="text-[10px] text-white/15 mt-1">
            SM-2 难度系数更新公式 · q = 评分质量(0-5)
          </p>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    new: "未学习",
    learning: "学习中",
    review: "复习中",
    mastered: "已掌握",
  };
  return map[status] || status;
}

function ParamCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
      <div className="flex items-center gap-1.5 text-white/30 text-[11px] mb-1">
        {icon}
        {label}
      </div>
      <p className="text-lg font-bold text-white/80 tracking-tight">
        {value}
      </p>
      <p className="text-[10px] text-white/20 mt-0.5">{sub}</p>
    </div>
  );
}
