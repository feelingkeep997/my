"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import VocabLayout from "@/components/vocab/vocab-layout";
import { useMode } from "@/components/navbar";

export default function Vocabulary() {
  const { mode } = useMode();
  const router = useRouter();

  useEffect(() => {
    if (mode === "exam") {
      router.push("/cet6");
    }
  }, [mode, router]);

  if (mode === "exam") {
    return null;
  }

  return <VocabLayout />;
}
