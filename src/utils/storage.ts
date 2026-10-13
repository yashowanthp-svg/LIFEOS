import { Task, Habit, FocusSession, UserSettings } from '../types';

const STORAGE_KEYS = {
  TASKS: 'lifeos_tasks_v1',
  HABITS: 'lifeos_habits_v1',
  FOCUS_SESSIONS: 'lifeos_focus_v1',
  SETTINGS: 'lifeos_settings_v1',
  HAS_INITIALIZED: 'lifeos_initialized_v1',
};

// Helper: format date as YYYY-MM-DD
export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate past dates array
export function getPastDates(daysCount: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Alex Chen',
  userRole: 'CS Student & Builder',
  workStart: '08:30',
  workEnd: '17:30',
  pomodoroMin: 25,
  shortBreakMin: 5,
  longBreakMin: 15,
  longBreakInterval: 4,
  soundEnabled: true,
  ambientSound: 'off',
  ambientVolume: 0.4,
  peakEnergy: 'morning',
  accentTheme: 'indigo',
};

// Generate realistic seed data
export function generateSampleData(): {
  tasks: Task[];
  habits: Habit[];
  focusSessions: FocusSession[];
} {
  const today = formatDate(new Date());
  
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = formatDate(tomorrowDate);

  const in2DaysDate = new Date();
  in2DaysDate.setDate(in2DaysDate.getDate() + 2);
  const in2Days = formatDate(in2DaysDate);

  const in4DaysDate = new Date();
  in4DaysDate.setDate(in4DaysDate.getDate() + 4);
  const in4Days = formatDate(in4DaysDate);

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDate(yesterdayDate);

  const past14 = getPastDates(14);

  const tasks: Task[] = [
    {
      id: 'task-sample-1',
      title: 'Complete Machine Learning Term Paper Draft',
      description: 'Finish sections on Transformer attention architectures and cite 8 references.',
      priority: 'high',
      dueDate: today,
      dueTime: '17:00',
      estimatedDuration: 90,
      category: 'Study',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'task-sample-2',
      title: 'Review Linear Algebra Quiz 3 Solutions',
      description: 'Work through eigenvector decomposition exercises and proofs.',
      priority: 'medium',
      dueDate: tomorrow,
      dueTime: '14:00',
      estimatedDuration: 45,
      category: 'Study',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'task-sample-3',
      title: 'Submit Product Architecture Case Study',
      description: 'Package system diagrams, API contracts, and trade-off matrix.',
      priority: 'high',
      dueDate: in2Days,
      dueTime: '18:00',
      estimatedDuration: 60,
      category: 'Work',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'task-sample-4',
      title: 'Prepare Weekly Sprint Demo Slides',
      description: 'Highlight frontend state refactor and user flow improvements.',
      priority: 'medium',
      dueDate: in4Days,
      dueTime: '11:00',
      estimatedDuration: 45,
      category: 'Work',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'task-sample-5',
      title: 'Grocery Restock & Healthy Meal Prep',
      description: 'High protein staples, leafy greens, and electrolyte recovery drinks.',
      priority: 'low',
      dueDate: today,
      dueTime: '19:30',
      estimatedDuration: 40,
      category: 'Health',
      status: 'pending',
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'task-sample-6',
      title: 'Read Research Paper on Memory Mechanisms',
      description: 'Summarized core takeaways on working memory and spaced retrieval.',
      priority: 'low',
      dueDate: yesterday,
      estimatedDuration: 30,
      category: 'Study',
      status: 'completed',
      completedAt: yesterday,
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'task-sample-7',
      title: 'Sync with Mentor on Capstone Scope',
      description: 'Refined project deliverables and validated deployment roadmap.',
      priority: 'high',
      dueDate: yesterday,
      estimatedDuration: 30,
      category: 'Work',
      status: 'completed',
      completedAt: yesterday,
      createdAt: new Date().toISOString(),
      isSample: true,
    },
  ];

  // Generate realistic completions for past 14 days
  // Deep Work completed ~11 out of 14 days
  const deepWorkCompletions = past14.filter((_, i) => i !== 2 && i !== 6 && i !== 10);
  // Morning Cardio completed ~9 out of 14 days
  const cardioCompletions = past14.filter((_, i) => i % 2 === 0);
  // Reading completed 13 of 14 days (long streak!)
  const readingCompletions = past14.filter((_, i) => i !== 8);
  // Hydration completed 12 of 14 days
  const hydrationCompletions = past14.filter((_, i) => i !== 3 && i !== 7);

  const habits: Habit[] = [
    {
      id: 'habit-sample-1',
      title: 'Deep Work (2 Hours Uninterrupted)',
      description: 'No social media, no notifications, pure deliberate practice.',
      category: 'Focus',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completedDates: deepWorkCompletions,
      color: '#6366F1', // Indigo
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'habit-sample-2',
      title: 'Morning Cardio & Mobility',
      description: '20-30 min heart rate elevation and spine mobility routine.',
      category: 'Health',
      frequency: 'weekdays',
      targetDaysPerWeek: 5,
      completedDates: cardioCompletions,
      color: '#10B981', // Emerald
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'habit-sample-3',
      title: 'Read 20 Pages Non-Fiction',
      description: 'Cognitive science, engineering philosophy, or biographies.',
      category: 'Growth',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completedDates: readingCompletions,
      color: '#F59E0B', // Amber
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'habit-sample-4',
      title: 'Optimal Hydration (2.5L Water)',
      description: 'Water with mineral electrolytes before afternoon caffeine cutoff.',
      category: 'Health',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completedDates: hydrationCompletions,
      color: '#06B6D4', // Cyan
      createdAt: new Date().toISOString(),
      isSample: true,
    },
    {
      id: 'habit-sample-5',
      title: 'Daily Retrospective & Journaling',
      description: 'Score day from 1-10, note biggest win and 1 improvement for tomorrow.',
      category: 'Mindfulness',
      frequency: 'daily',
      targetDaysPerWeek: 7,
      completedDates: past14.slice(6), // Last 8 days straight
      color: '#8B5CF6', // Violet
      createdAt: new Date().toISOString(),
      isSample: true,
    },
  ];

  // Realistic past focus sessions
  const focusSessions: FocusSession[] = [];
  past14.forEach((dateStr, idx) => {
    // 2 to 4 sessions per day
    const sessionCount = idx % 3 === 0 ? 3 : (idx % 2 === 0 ? 4 : 2);
    for (let s = 0; s < sessionCount; s++) {
      focusSessions.push({
        id: `focus-sample-${idx}-${s}`,
        date: dateStr,
        minutes: 25,
        mode: 'pomodoro',
        taskTitle: s === 0 ? 'Machine Learning Term Paper' : (s === 1 ? 'Linear Algebra Exercises' : 'Sprint Architecture'),
        completedAt: `${dateStr}T1${s}:30:00Z`,
        isSample: true,
      });
    }
  });

  return { tasks, habits, focusSessions };
}

// Accurate streak calculation
export function calculateHabitStats(habit: Habit): {
  currentStreak: number;
  bestStreak: number;
  completedToday: boolean;
  weeklyRate: number;
  monthlyRate: number;
} {
  const datesSet = new Set(habit.completedDates || []);
  const todayStr = formatDate(new Date());
  const completedToday = datesSet.has(todayStr);

  // Compute current streak
  let currentStreak = 0;
  const checkDate = new Date();
  
  // If not completed today, check if yesterday was completed
  if (!completedToday) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (true) {
    const formatted = formatDate(checkDate);
    if (datesSet.has(formatted)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Compute best streak across all history
  const sortedDates = Array.from(datesSet).sort();
  let bestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
    prevDate = currentDate;
  }
  bestStreak = Math.max(bestStreak, currentStreak);

  // Weekly completion rate (past 7 days)
  const past7 = getPastDates(7);
  const completedPast7 = past7.filter(d => datesSet.has(d)).length;
  const target7 = habit.targetDaysPerWeek || 7;
  const weeklyRate = Math.min(100, Math.round((completedPast7 / Math.min(7, target7)) * 100));

  // Monthly completion rate (past 30 days)
  const past30 = getPastDates(30);
  const completedPast30 = past30.filter(d => datesSet.has(d)).length;
  const target30 = Math.round(((habit.targetDaysPerWeek || 7) / 7) * 30);
  const monthlyRate = Math.min(100, Math.round((completedPast30 / target30) * 100));

  return {
    currentStreak,
    bestStreak,
    completedToday,
    weeklyRate,
    monthlyRate,
  };
}

// Storage operations
export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading tasks:', e);
  }
  const sample = generateSampleData();
  saveTasksToStorage(sample.tasks);
  return sample.tasks;
}

export function saveTasksToStorage(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Error saving tasks:', e);
  }
}

export function loadHabitsFromStorage(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HABITS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading habits:', e);
  }
  const sample = generateSampleData();
  saveHabitsToStorage(sample.habits);
  return sample.habits;
}

export function saveHabitsToStorage(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  } catch (e) {
    console.error('Error saving habits:', e);
  }
}

export function loadFocusSessionsFromStorage(): FocusSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.FOCUS_SESSIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading focus sessions:', e);
  }
  const sample = generateSampleData();
  saveFocusSessionsToStorage(sample.focusSessions);
  return sample.focusSessions;
}

export function saveFocusSessionsToStorage(sessions: FocusSession[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.FOCUS_SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving focus sessions:', e);
  }
}

export function loadSettingsFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    console.error('Error loading settings:', e);
  }
  return DEFAULT_SETTINGS;
}

export function saveSettingsToStorage(settings: UserSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}
