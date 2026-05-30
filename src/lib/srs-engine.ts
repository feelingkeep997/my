import { vocabulary, type Word } from "./vocabulary-data";

// SM-2 Algorithm types
export type ReviewQuality = 0 | 1 | 2 | 3; // again=0, hard=1, good=2, easy=3

export interface WordProgress {
  id: number;
  easeFactor: number;
  interval: number; // days
  repetitions: number;
  nextReview: string; // ISO date
  lastReview: string | null;
  status: "new" | "learning" | "review" | "mastered";
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  newWords: number;
  reviewed: number;
  correct: number;
}

export interface SRSSettings {
  dailyNewWords: number;
}

export interface SRSState {
  progress: Record<number, WordProgress>;
  dailyRecords: DailyRecord[];
  streak: number;
  longestStreak: number;
  lastStudyDate: string | null;
  settings?: SRSSettings;
}

const STORAGE_KEY = "vocab-srs-progress-v2";

function today(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function loadState(): SRSState {
  if (typeof window === "undefined") {
    return defaultState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw);
  } catch {
    return defaultState();
  }
}

export function saveState(state: SRSState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function updateSettings(state: SRSState, settings: Partial<SRSSettings>): SRSState {
  return {
    ...state,
    settings: {
      ...(state.settings || { dailyNewWords: 15 }),
      ...settings,
    },
  };
}

function defaultState(): SRSState {
  return {
    progress: {},
    dailyRecords: [],
    streak: 0,
    longestStreak: 0,
    lastStudyDate: null,
    settings: {
      dailyNewWords: 15,
    },
  };
}

function defaultProgress(id: number): WordProgress {
  return {
    id,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: today(),
    lastReview: null,
    status: "new",
  };
}

// SM-2 core algorithm
export function reviewWord(
  state: SRSState,
  wordId: number,
  quality: ReviewQuality
): SRSState {
  const progress = { ...(state.progress[wordId] ?? defaultProgress(wordId)) };
  const now = today();

  if (quality < 2) {
    // Failed: reset repetitions
    progress.repetitions = 0;
    progress.interval = 0;
    progress.status = "learning";
  } else {
    // Passed
    if (progress.repetitions === 0) {
      progress.interval = 1;
    } else if (progress.repetitions === 1) {
      progress.interval = 3;
    } else if (progress.repetitions === 2) {
      progress.interval = 6;
    } else {
      progress.interval = Math.round(progress.interval * progress.easeFactor);
    }
    progress.repetitions += 1;
    progress.status = progress.repetitions >= 5 ? "mastered" : "review";
  }

  // Update ease factor
  progress.easeFactor = Math.max(
    1.3,
    progress.easeFactor + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02))
  );

  progress.lastReview = now;
  const next = new Date();
  next.setDate(next.getDate() + progress.interval);
  progress.nextReview = next.toISOString().split("T")[0];

  // Update state
  const newState = { ...state };
  newState.progress = { ...state.progress, [wordId]: progress };

  // Update daily record
  const todayRecord = getOrCreateDailyRecord(newState, now);
  todayRecord.reviewed += 1;
  if (quality >= 2) todayRecord.correct += 1;

  // Update streak
  updateStreak(newState, now);

  return newState;
}

export function markNewWord(state: SRSState, wordId: number): SRSState {
  const now = today();
  const progress = { ...(state.progress[wordId] ?? defaultProgress(wordId)) };
  progress.status = "learning";
  progress.lastReview = now;

  const newState = { ...state };
  newState.progress = { ...state.progress, [wordId]: progress };

  const todayRecord = getOrCreateDailyRecord(newState, now);
  todayRecord.newWords += 1;

  updateStreak(newState, now);
  return newState;
}

function getOrCreateDailyRecord(state: SRSState, date: string): DailyRecord {
  let record = state.dailyRecords.find((r) => r.date === date);
  if (!record) {
    record = { date, newWords: 0, reviewed: 0, correct: 0 };
    state.dailyRecords = [...state.dailyRecords, record];
  }
  return record;
}

function updateStreak(state: SRSState, date: string): void {
  if (state.lastStudyDate) {
    const gap = daysBetween(state.lastStudyDate, date);
    if (gap === 1) {
      state.streak += 1;
    } else if (gap > 1) {
      state.streak = 1;
    }
  } else {
    state.streak = 1;
  }
  state.longestStreak = Math.max(state.longestStreak, state.streak);
  state.lastStudyDate = date;
}

export function getDueWords(state: SRSState): Word[] {
  const now = today();
  return vocabulary.filter((w) => {
    const p = state.progress[w.id];
    if (!p || p.status === "new") return false;
    return p.nextReview <= now;
  });
}

export function getNewWords(state: SRSState, limit = 10): Word[] {
  return vocabulary
    .filter((w) => {
      const p = state.progress[w.id];
      return !p || p.status === "new";
    })
    .slice(0, limit);
}

export function getWordProgress(
  state: SRSState,
  wordId: number
): WordProgress {
  return state.progress[wordId] ?? defaultProgress(wordId);
}

export function resetWordProgress(state: SRSState, wordId: number): SRSState {
  const newState = { ...state };
  newState.progress = { ...state.progress };
  delete newState.progress[wordId];
  return newState;
}

export interface SRSStats {
  total: number;
  newCount: number;
  learning: number;
  reviewing: number;
  mastered: number;
  dueToday: number;
  streak: number;
  longestStreak: number;
  todayNew: number;
  todayReviewed: number;
  todayCorrect: number;
}

export function getStats(state: SRSState): SRSStats {
  const now = today();
  const todayRecord = state.dailyRecords.find((r) => r.date === now);

  let newCount = 0,
    learning = 0,
    reviewing = 0,
    mastered = 0,
    dueToday = 0;

  for (const w of vocabulary) {
    const p = state.progress[w.id];
    if (!p || p.status === "new") {
      newCount++;
    } else if (p.status === "learning") {
      learning++;
      if (p.nextReview <= now) dueToday++;
    } else if (p.status === "review") {
      reviewing++;
      if (p.nextReview <= now) dueToday++;
    } else {
      mastered++;
      if (p.nextReview <= now) dueToday++;
    }
  }

  return {
    total: vocabulary.length,
    newCount,
    learning,
    reviewing,
    mastered,
    dueToday,
    streak: state.streak,
    longestStreak: state.longestStreak,
    todayNew: todayRecord?.newWords ?? 0,
    todayReviewed: todayRecord?.reviewed ?? 0,
    todayCorrect: todayRecord?.correct ?? 0,
  };
}

// Memory retention simulation for chart
export function simulateRetention(
  easeFactor: number,
  interval: number
): { day: number; retention: number }[] {
  const points: { day: number; retention: number }[] = [];
  for (let d = 0; d <= 30; d++) {
    const retention = Math.exp(
      -((d * 0.693) / Math.max(interval, 0.5)) * (1 / (easeFactor / 2.5))
    );
    points.push({ day: d, retention: Math.max(0, Math.min(1, retention)) });
  }
  return points;
}
