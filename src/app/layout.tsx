import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar, { ModeProvider } from "@/components/navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "玄域",
  description: "智能词汇学习与考试系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ModeProvider>
          <Navbar variant="dark" />
          {children}
        </ModeProvider>
      </body>
    </html>
  );
}
