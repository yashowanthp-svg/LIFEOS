export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'completed';
export type TaskCategory = 'Study' | 'Work' | 'Personal' | 'Health' | 'Finance' | 'Creative' | 'Tech';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  estimatedDuration: number; // minutes (e.g. 30, 45, 60)
  category: TaskCategory;
  status: TaskStatus;
  completedAt?: string;
  createdAt: string;
  isSample?: boolean;
}

export type HabitCategory = 'Health' | 'Focus' | 'Growth' | 'Mindfulness' | 'Discipline' | 'Creativity';
export type HabitFrequency = 'daily' | 'weekdays' | 'weekends';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  targetDaysPerWeek: number;
  completedDates: string[]; // ['YYYY-MM-DD']
  color: string;
  createdAt: string;
  isSample?: boolean;
}

export type FocusModeType = 'pomodoro' | 'short_break' | 'long_break' | 'custom';

export interface FocusSession {
  id: string;
  date: string; // YYYY-MM-DD
  minutes: number;
  taskId?: string;
  taskTitle?: string;
  mode: FocusModeType;
  completedAt: string;
  isSample?: boolean;
}

export interface ScheduleBlock {
  id: string;
  taskId?: string;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  type: 'task' | 'break' | 'buffer';
  title: string;
  description?: string;
  priority?: Priority;
  category?: string;
  durationMin: number;
  reason?: string;
}

export interface ScheduleConflict {
  taskId: string;
  title: string;
  priority: Priority;
  durationMin: number;
  reason: string;
  recommendation: string;
}

export interface AIPlan {
  schedule: ScheduleBlock[];
  conflicts: ScheduleConflict[];
  summary: string;
  tips: string[];
  source: 'ai' | 'heuristic';
}

export interface DailyBrief {
  greeting: string;
  topPriorities: {
    title: string;
    priority: Priority;
    estimatedDuration?: number;
  }[];
  habitFocus: string;
  energyTip: string;
  quote: string;
  source: 'ai' | 'heuristic';
}

export interface UserSettings {
  userName: string;
  userRole: string;
  workStart: string; // "09:00"
  workEnd: string; // "17:30"
  pomodoroMin: number;
  shortBreakMin: number;
  longBreakMin: number;
  longBreakInterval: number; // sessions before long break (e.g. 4)
  soundEnabled: boolean;
  ambientSound: 'off' | 'rain' | 'whitenoise' | 'hum';
  ambientVolume: number; // 0 to 1
  peakEnergy: 'morning' | 'afternoon' | 'evening';
  accentTheme: 'indigo' | 'violet' | 'cyan' | 'emerald';
}
