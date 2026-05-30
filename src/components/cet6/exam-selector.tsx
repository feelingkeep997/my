"use client";

import { BookOpen, Calendar, FileText, ChevronRight } from "lucide-react";
import { getExamPaperList, type ExamPaper } from "./exam-data";

interface ExamSelectorProps {
  onSelect: (paperId: string) => void;
}

export default function ExamSelector({ onSelect }: ExamSelectorProps) {
  const papers = getExamPaperList();

  const papersByDate = papers.reduce(
    (acc, paper) => {
      if (!acc[paper.date]) {
        acc[paper.date] = [];
      }
      acc[paper.date].push(paper);
      return acc;
    },
    {} as Record<string, typeof papers>
  );

  const dateLabels: Record<string, string> = {
    "2025-06": "2025年6月",
    "2025-12": "2025年12月",
  };

  return (
    <div
      className="min-h-screen text-white pt-20"
      style={{
        background:
          "linear-gradient(160deg, #08080f 0%, #0c0c18 50%, #0a0a14 100%)",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]">
          <div className="p-2.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/15">
            <BookOpen className="size-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">六级模拟考试</h1>
            <p className="text-white/35 text-sm">选择一套试卷开始练习</p>
          </div>
        </div>

        {/* Paper List */}
        <div className="max-w-3xl mx-auto space-y-8">
          {Object.entries(papersByDate).map(([date, datePapers], groupIdx) => (
            <div
              key={date}
              className="animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{ animationDelay: `${groupIdx * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="size-4 text-blue-400/70" />
                <h2 className="text-lg font-semibold text-blue-400/80 tracking-tight">
                  {dateLabels[date] || date}
                </h2>
              </div>

              <div className="space-y-2.5">
                {datePapers.map((paper, i) => (
                  <button
                    key={paper.id}
                    onClick={() => onSelect(paper.id)}
                    className="group w-full text-left p-5 rounded-2xl border border-white/[0.06] transition-all duration-400 ease-out hover:border-blue-500/20"
                    style={{
                      background:
                        "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
                      animationDelay: `${(groupIdx * 100) + (i * 60)}ms`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/[0.08] border border-blue-500/10 group-hover:bg-blue-500/[0.12] transition-all duration-300">
                          <FileText className="size-5 text-blue-400/70 group-hover:text-blue-400 transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white/80 group-hover:text-blue-400 transition-colors duration-300">
                            {paper.title}
                          </h3>
                          <p className="text-sm text-white/30 mt-1">
                            {paper.description}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="size-5 text-white/15 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="max-w-3xl mx-auto mt-8 animate-[fadeInUp_0.5s_cubic-bezier(0.22,1,0.36,1)_both] delay-300">
          <div
            className="p-5 rounded-2xl border border-blue-500/[0.12]"
            style={{
              background:
                "linear-gradient(145deg, rgba(59,130,246,0.06) 0%, rgba(59,130,246,0.02) 100%)",
            }}
          >
            <h4 className="text-blue-400/80 font-medium mb-2.5 text-sm">
              练习提示
            </h4>
            <ul className="text-sm text-white/35 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="text-blue-400/40 mt-0.5">•</span>
                每套试卷包含阅读理解、选词填空、写作和翻译四个部分
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400/40 mt-0.5">•</span>
                阅读理解部分每题都可以查看原文
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400/40 mt-0.5">•</span>
                完成后可查看成绩和详细解析
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
