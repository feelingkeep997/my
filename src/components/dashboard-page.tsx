"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Settings } from "lucide-react";
import { useMode } from "@/components/navbar";

export default function DashboardPage() {
  const { mode } = useMode();

  return (
    <>
      <section className="relative w-full overflow-hidden bg-black pb-10 font-light text-white antialiased md:pb-16">
        {/* Background Effects */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, #050508 0%, #0a0a12 30%, #0d0d1a 60%, #080810 100%)",
          }}
        />
        <div
          className="absolute right-0 top-0 h-[60%] w-[60%]"
          style={{
            background:
              "radial-gradient(ellipse at 70% 20%, rgba(0, 200, 255, 0.04) 0%, rgba(0, 100, 200, 0.02) 40%, transparent 70%)",
          }}
        />
        <div
          className="absolute left-0 top-0 h-[50%] w-[50%] -scale-x-100"
          style={{
            background:
              "radial-gradient(ellipse at 60% 30%, rgba(120, 80, 255, 0.03) 0%, transparent 60%)",
          }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative pt-28 md:pt-32">
          <div className="absolute top-6 left-6 z-20">
            <Link
              href="/api-management"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.08] text-white/50 hover:text-white/80 text-sm font-medium backdrop-blur-sm transition-all duration-400 ease-out hover:border-white/[0.12] hover:shadow-lg hover:shadow-black/20"
            >
              <Settings className="size-4" />
              API管理
            </Link>
          </div>

          <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-light md:text-6xl lg:text-8xl tracking-tight">
                <span className="bg-gradient-to-b from-white via-white/90 to-white/50 bg-clip-text text-transparent">
                  玄域
                </span>
              </h1>

              <p className="text-white/30 text-lg mb-10 tracking-wide">
                智能词汇学习系统
              </p>

              <div className="mb-12 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/vocabulary"
                  className="group relative w-full overflow-hidden rounded-full px-10 py-4 text-white text-base font-medium sm:w-auto transition-all duration-500 ease-out"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow:
                      "0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  <span className="relative z-10">
                    {mode === "exam" ? "开始考试" : "开始背单词"}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/[0.05] to-white/[0.1] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-px rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, y: 40, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 1,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.2,
              }}
            >
              <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-2xl">
                {/* Glow Effect */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent opacity-50 blur-xl" />
                <Image
                  src="/images/preview.jpg"
                  alt="预览图片"
                  width={1920}
                  height={1080}
                  className="relative h-auto w-full rounded-2xl border border-white/[0.06]"
                  priority
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
      </section>
    </>
  );
}
