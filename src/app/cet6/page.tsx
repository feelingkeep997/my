"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ExamSelector from "@/components/cet6/exam-selector";
import Cet6ExamPage from "@/components/cet6/exam-page";
import { getExamPaperById } from "@/components/cet6/exam-data";
import { useMode } from "@/components/navbar";

export default function Cet6Page() {
  const { mode } = useMode();
  const router = useRouter();
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "vocabulary") {
      router.push("/vocabulary");
    }
  }, [mode, router]);

  if (mode === "vocabulary") {
    return null;
  }

  const selectedPaper = selectedPaperId ? getExamPaperById(selectedPaperId) : undefined;

  const handleSelect = (paperId: string) => {
    setSelectedPaperId(paperId);
  };

  const handleBack = () => {
    setSelectedPaperId(null);
  };

  return (
    <>
      {selectedPaper ? (
        <Cet6ExamPage paper={selectedPaper} onBack={handleBack} />
      ) : (
        <ExamSelector onSelect={handleSelect} />
      )}
    </>
  );
}
