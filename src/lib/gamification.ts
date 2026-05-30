export type AchievementId =
  | "first_word"
  | "ten_words"
  | "fifty_words"
  | "hundred_words"
  | "streak_7"
  | "streak_30"
  | "perfect_quiz"
  | "pomodoro_5"
  | "pomodoro_20"
  | "speed_learner";

export interface Achievement {
  id: AchievementId;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  check: (stats: GameStats) => boolean;
}

export interface GameStats {
  totalLearned: number;
  totalMastered: number;
  currentStreak: number;
  longestStreak: number;
  perfectQuizzes: number;
  pomodorosCompleted: number;
  wordsLearnedInSession: number;
}

export interface GamificationState {
  xp: number;
  level: number;
  unlockedAchievements: AchievementId[];
  totalPomodoros: number;
  perfectQuizzes: number;
}

const STORAGE_KEY = "vocab-gamification-v2";

export const LEVEL_NAMES = [
  "初学者",
  "学徒",
  "求知者",
  "学者",
  "智者",
  "大师",
  "宗师",
  "传奇",
  "不朽",
  "词汇之王",
];

const XP_PER_LEVEL = 100;

export const achievements: Achievement[] = [
  {
    id: "first_word",
    name: "初窥门径",
    description: "学习第一个单词",
    icon: "🌱",
    xpReward: 10,
    check: (s) => s.totalLearned >= 1,
  },
  {
    id: "ten_words",
    name: "小有成就",
    description: "累计学习10个单词",
    icon: "📚",
    xpReward: 50,
    check: (s) => s.totalLearned >= 10,
  },
  {
    id: "fifty_words",
    name: "半百之功",
    description: "累计学习50个单词",
    icon: "🎓",
    xpReward: 100,
    check: (s) => s.totalLearned >= 50,
  },
  {
    id: "hundred_words",
    name: "百词斩",
    description: "累计学习100个单词",
    icon: "⚔️",
    xpReward: 200,
    check: (s) => s.totalLearned >= 100,
  },
  {
    id: "streak_7",
    name: "日积月累",
    description: "连续学习7天",
    icon: "🔥",
    xpReward: 80,
    check: (s) => s.currentStreak >= 7,
  },
  {
    id: "streak_30",
    name: "持之以恒",
    description: "连续学习30天",
    icon: "💎",
    xpReward: 300,
    check: (s) => s.currentStreak >= 30,
  },
  {
    id: "perfect_quiz",
    name: "完美答卷",
    description: "测验获得满分",
    icon: "✨",
    xpReward: 50,
    check: (s) => s.perfectQuizzes >= 1,
  },
  {
    id: "pomodoro_5",
    name: "专注达人",
    description: "完成5个番茄钟",
    icon: "🍅",
    xpReward: 60,
    check: (s) => s.pomodorosCompleted >= 5,
  },
  {
    id: "pomodoro_20",
    name: "番茄大师",
    description: "完成20个番茄钟",
    icon: "🏆",
    xpReward: 200,
    check: (s) => s.pomodorosCompleted >= 20,
  },
  {
    id: "speed_learner",
    name: "速学达人",
    description: "单次学习会话中学完20个新词",
    icon: "⚡",
    xpReward: 100,
    check: (s) => s.wordsLearnedInSession >= 20,
  },
];

export function loadGamification(): GamificationState {
  if (typeof window === "undefined") {
    return defaultGamification();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultGamification();
    return JSON.parse(raw);
  } catch {
    return defaultGamification();
  }
}

export function saveGamification(state: GamificationState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function defaultGamification(): GamificationState {
  return {
    xp: 0,
    level: 0,
    unlockedAchievements: [],
    totalPomodoros: 0,
    perfectQuizzes: 0,
  };
}

export function addXP(state: GamificationState, amount: number): GamificationState {
  const newXP = state.xp + amount;
  const newLevel = Math.floor(newXP / XP_PER_LEVEL);
  return { ...state, xp: newXP, level: newLevel };
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)];
}

export function getLevelProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}

export function getXPForNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}

export function checkAchievements(
  state: GamificationState,
  stats: GameStats
): { newState: GamificationState; unlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];

  for (const a of achievements) {
    if (!state.unlockedAchievements.includes(a.id) && a.check(stats)) {
      newlyUnlocked.push(a);
    }
  }

  if (newlyUnlocked.length === 0) {
    return { newState: state, unlocked: [] };
  }

  let newState = { ...state };
  newState.unlockedAchievements = [
    ...state.unlockedAchievements,
    ...newlyUnlocked.map((a) => a.id),
  ];

  // Award XP for achievements
  const totalReward = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0);
  newState = addXP(newState, totalReward);

  return { newState, unlocked: newlyUnlocked };
}
