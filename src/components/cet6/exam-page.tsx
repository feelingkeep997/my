"use client";

import { useState } from "react";
import {
  BookOpen,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  PenTool,
  Languages,
  ArrowLeft,
} from "lucide-react";
import {
  type ExamPaper,
  type Question,
  type ExamSection,
  getPassage,
  getTotalQuestions,
} from "./exam-data";

type AnswerRecord = {
  questionId: number;
  selected: number | null;
  isCorrect: boolean;
};

interface Cet6ExamPageProps {
  paper: ExamPaper;
  onBack: () => void;
}

export default function Cet6ExamPage({ paper, onBack }: Cet6ExamPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [examFinished, setExamFinished] = useState(false);
  const [writingAnswer, setWritingAnswer] = useState("");
  const [translationAnswer, setTranslationAnswer] = useState("");

  const section = paper.sections[currentSection];
  const question = section.questions[currentQuestion];
  const totalQuestions = getTotalQuestions(paper);
  const answeredCount = answers.length;

  const currentPassage = question.passageId
    ? getPassage(paper, question.passageId)
    : undefined;

  const getSectionIcon = (sectionId: string) => {
    switch (sectionId) {
      case "reading":
        return <BookOpen className="size-4" />;
      case "writing":
        return <PenTool className="size-4" />;
      case "translation":
        return <Languages className="size-4" />;
      default:
        return <FileText className="size-4" />;
    }
  };

  const handleSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = () => {
    if (question.type === "reading" && selectedAnswer === null) return;
    if (question.type === "writing" && !writingAnswer.trim()) return;
    if (question.type === "translation" && !translationAnswer.trim()) return;

    setShowResult(true);

    if (question.type === "reading") {
      const isCorrect = selectedAnswer === question.answer;
      setAnswers([
        ...answers,
        {
          questionId: question.id,
          selected: selectedAnswer,
          isCorrect,
        },
      ]);
    } else {
      setAnswers([
        ...answers,
        {
          questionId: question.id,
          selected: null,
          isCorrect: true,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (currentQuestion < section.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setWritingAnswer("");
      setTranslationAnswer("");
    } else if (currentSection < paper.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setShowResult(false);
      setWritingAnswer("");
      setTranslationAnswer("");
    } else {
      setExamFinished(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      setCurrentQuestion(
        paper.sections[currentSection - 1].questions.length - 1
      );
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const handleReset = () => {
    setCurrentSection(0);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setExamFinished(false);
    setWritingAnswer("");
    setTranslationAnswer("");
  };

  const correctCount = answers.filter(
    (a) => a.isCorrect && a.selected !== null
  ).length;
  const readingQuestions = answers.filter((a) => a.selected !== null);

  if (examFinished) {
    return (
      <div
        className="min-h-screen text-white pt-20"
        style={{
          background:
            "linear-gradient(160deg, #08080f 0%, #0c0c18 50%, #0a0a14 100%)",
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div
              className="p-8 rounded-2xl border border-white/[0.08] text-center animate-[scaleIn_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
              }}
            >
              <div className="text-6xl mb-4">
                {correctCount >= readingQuestions.length * 0.8
                  ? "🎉"
                  : correctCount >= readingQuestions.length * 0.6
                    ? "👍"
                    : "📚"}
              </div>
              <h2 className="text-2xl font-bold mb-2 tracking-tight">
                考试完成！
              </h2>
              <p className="text-white/40 mb-6">
                你已完成 {paper.title}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div
                  className="p-4 rounded-xl border border-blue-500/15"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.03) 100%)",
                  }}
                >
                  <div className="text-2xl font-bold text-blue-400 tabular-nums">
                    {answeredCount}
                  </div>
                  <div className="text-sm text-white/35">完成题数</div>
                </div>
                <div
                  className="p-4 rounded-xl border border-emerald-500/15"
                  style={{
                    background:
                      "linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.03) 100%)",
                  }}
                >
                  <div className="text-2xl font-bold text-emerald-400 tabular-nums">
                    {correctCount}
                  </div>
                  <div className="text-sm text-white/35">正确题数</div>
                </div>
              </div>

              <div className="text-4xl font-bold text-blue-400 mb-6 tabular-nums">
                {readingQuestions.length > 0
                  ? Math.round(
                      (correctCount / readingQuestions.length) * 100
                    )
                  : 0}{" "}
                分
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.2) 100%)",
                    border: "1px solid rgba(59,130,246,0.3)",
                  }}
                >
                  <span className="relative z-10">重新考试</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                <button
                  onClick={onBack}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all duration-300"
                >
                  <ArrowLeft className="size-4" />
                  选择其他试卷
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/[0.06] rounded-xl transition-all duration-300"
            >
              <ArrowLeft className="size-5 text-white/40" />
            </button>
            <div className="p-2.5 rounded-xl bg-blue-500/[0.08] border border-blue-500/15">
              <BookOpen className="size-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {paper.title}
              </h1>
              <p className="text-white/35 text-sm">
                {section.title} · {section.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm">
            <Clock className="size-4" />
            <span className="tabular-nums">
              进度 {answeredCount}/{totalQuestions}
            </span>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {paper.sections.map((s, index) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentSection(index);
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setShowResult(false);
              }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-300 ${
                currentSection === index
                  ? "text-blue-400"
                  : "text-white/35 hover:text-white/50 hover:bg-white/[0.03] border border-transparent"
              }`}
            >
              {getSectionIcon(s.id)}
              {s.title}
              {currentSection === index && (
                <span className="absolute inset-0 rounded-xl bg-blue-500/[0.08] border border-blue-500/15" />
              )}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${(answeredCount / totalQuestions) * 100}%`,
                background: "linear-gradient(90deg, #3b82f6, #a78bfa)",
                boxShadow: "0 0 12px rgba(59,130,246,0.3)",
              }}
            />
          </div>
        </div>

        {/* Question Area */}
        <div className="max-w-3xl mx-auto">
          {currentPassage && (
            <div
              className="p-6 rounded-2xl border border-white/[0.06] mb-6 animate-[fadeInUp_0.4s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <FileText className="size-4 text-blue-400/60" />
                <span className="text-sm text-white/35">
                  {currentPassage.title || "阅读材料"}
                </span>
              </div>
              <p className="text-white/60 leading-relaxed whitespace-pre-line text-sm">
                {currentPassage.content}
              </p>
            </div>
          )}

          <div
            className="p-6 rounded-2xl border border-white/[0.06] mb-6 animate-[fadeInUp_0.4s_cubic-bezier(0.22,1,0.36,1)_both]"
            style={{
              background:
                "linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-500/[0.1] text-blue-400/80 rounded-full text-sm border border-blue-500/15">
                {section.title} · 第 {currentQuestion + 1} 题
              </span>
            </div>
            <h3 className="text-lg mb-6 leading-relaxed">
              {question.question}
            </h3>

            {question.type === "reading" && question.options && (
              <div className="space-y-2.5">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(index)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ease-out ${
                      selectedAnswer === index
                        ? showResult
                          ? index === question.answer
                            ? "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/[0.08] border-red-500/30 text-red-400"
                          : "bg-blue-500/[0.08] border-blue-500/30 text-blue-400"
                        : showResult && index === question.answer
                          ? "bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-400"
                          : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-white/60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.06] text-sm text-white/40">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option.substring(3)}</span>
                      {showResult && index === question.answer && (
                        <CheckCircle className="size-5 ml-auto text-emerald-400" />
                      )}
                      {showResult &&
                        selectedAnswer === index &&
                        index !== question.answer && (
                          <XCircle className="size-5 ml-auto text-red-400" />
                        )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {question.type === "writing" && (
              <div>
                <textarea
                  value={writingAnswer}
                  onChange={(e) => setWritingAnswer(e.target.value)}
                  placeholder="请在此处输入你的作文..."
                  className="w-full h-48 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                  disabled={showResult}
                />
                <div className="mt-2 text-sm text-white/30 tabular-nums">
                  字数：{writingAnswer.length}
                </div>
              </div>
            )}

            {question.type === "translation" && (
              <div>
                <textarea
                  value={translationAnswer}
                  onChange={(e) => setTranslationAnswer(e.target.value)}
                  placeholder="请在此处输入你的翻译..."
                  className="w-full h-48 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/20 resize-none focus:outline-none focus:border-blue-500/30 transition-all duration-300 backdrop-blur-sm"
                  disabled={showResult}
                />
              </div>
            )}
          </div>

          {showResult && question.explanation && (
            <div
              className="p-4 rounded-xl border border-amber-500/[0.12] mb-6 animate-[fadeInUp_0.3s_cubic-bezier(0.22,1,0.36,1)_both]"
              style={{
                background:
                  "linear-gradient(145deg, rgba(245,158,11,0.06) 0%, rgba(245,158,11,0.02) 100%)",
              }}
            >
              <h4 className="text-amber-400/80 font-medium mb-2 text-sm">
                解析
              </h4>
              <p className="text-white/50 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentSection === 0 && currentQuestion === 0}
              className="inline-flex items-center gap-2 px-4 py-2 text-white/35 hover:text-white/60 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ChevronLeft className="size-4" />
              上一题
            </button>

            <div className="flex gap-3">
              {!showResult ? (
                <button
                  onClick={handleSubmit}
                  disabled={
                    (question.type === "reading" &&
                      selectedAnswer === null) ||
                    (question.type === "writing" &&
                      !writingAnswer.trim()) ||
                    (question.type === "translation" &&
                      !translationAnswer.trim())
                  }
                  className="group relative px-6 py-3 rounded-xl text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.2) 100%)",
                    border: "1px solid rgba(59,130,246,0.3)",
                  }}
                >
                  <span className="relative z-10">提交答案</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.2) 100%)",
                    border: "1px solid rgba(59,130,246,0.3)",
                  }}
                >
                  <span className="relative z-10">
                    {currentSection === paper.sections.length - 1 &&
                    currentQuestion === section.questions.length - 1
                      ? "完成考试"
                      : "下一题"}
                  </span>
                  <ChevronRight className="size-4 relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
