import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  Task,
  Habit,
  FocusSession,
  UserSettings,
  FocusModeType,
  DailyBrief,
} from '../types';
import {
  loadTasksFromStorage,
  saveTasksToStorage,
  loadHabitsFromStorage,
  saveHabitsToStorage,
  loadFocusSessionsFromStorage,
  saveFocusSessionsToStorage,
  loadSettingsFromStorage,
  saveSettingsToStorage,
  generateSampleData,
  formatDate,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

export type NavigationTab = 'dashboard' | 'tasks' | 'habits' | 'focus' | 'planner' | 'analytics' | 'settings';

interface TimerState {
  mode: FocusModeType;
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
  selectedTaskId?: string;
  completedCycles: number;
}

interface LifeOSContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleHabitDate: (habitId: string, dateStr: string) => void;
  focusSessions: FocusSession[];
  timerState: TimerState;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  setTimerMode: (mode: FocusModeType, customMinutes?: number) => void;
  setSelectedFocusTask: (taskId?: string) => void;
  skipTimerPhase: () => void;
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  isSampleDataActive: boolean;
  resetSampleData: () => void;
  clearAllData: () => void;
  dailyBrief: DailyBrief | null;
  isLoadingBrief: boolean;
  fetchDailyBrief: () => Promise<void>;
  // Quick modals
  isTaskModalOpen: boolean;
  openTaskModal: (taskToEdit?: Task) => void;
  closeTaskModal: () => void;
  editingTask: Task | null;
  isHabitModalOpen: boolean;
  openHabitModal: (habitToEdit?: Habit) => void;
  closeHabitModal: () => void;
  editingHabit: Habit | null;
}

const LifeOSContext = createContext<LifeOSContextType | undefined>(undefined);

export const LifeOSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);
  const [habits, setHabits] = useState<Habit[]>(loadHabitsFromStorage);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(loadFocusSessionsFromStorage);
  const [settings, setSettings] = useState<UserSettings>(loadSettingsFromStorage);

  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [isLoadingBrief, setIsLoadingBrief] = useState<boolean>(false);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Persistent Focus Timer State
  const [timerState, setTimerState] = useState<TimerState>({
    mode: 'pomodoro',
    remainingSeconds: (settings.pomodoroMin || 25) * 60,
    totalSeconds: (settings.pomodoroMin || 25) * 60,
    isRunning: false,
    selectedTaskId: undefined,
    completedCycles: 0,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Save changes to storage
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    saveHabitsToStorage(habits);
  }, [habits]);

  useEffect(() => {
    saveFocusSessionsToStorage(focusSessions);
  }, [focusSessions]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  // Ambient sound handling
  useEffect(() => {
    if (settings.ambientSound && settings.ambientSound !== 'off' && timerState.isRunning) {
      soundFx.startAmbient(settings.ambientSound, settings.ambientVolume);
    } else {
      soundFx.stopAmbient();
    }
    return () => {
      soundFx.stopAmbient();
    };
  }, [settings.ambientSound, settings.ambientVolume, timerState.isRunning]);

  // Check if sample data is currently active
  const isSampleDataActive = tasks.some(t => t.isSample) || habits.some(h => h.isSample);

  // Task Operations
  const addTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    setTasks(prev => [newTask, ...prev]);
    soundFx.playClick();
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates, isSample: false } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    soundFx.playClick();
  }, []);

  const triggerCelebration = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366F1', '#10B981', '#06B6D4', '#F59E0B'],
    });
  };

  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const isNowCompleted = t.status !== 'completed';
          if (isNowCompleted) {
            triggerCelebration();
            soundFx.playCompletionChime();
          } else {
            soundFx.playClick();
          }
          return {
            ...t,
            status: isNowCompleted ? 'completed' : 'pending',
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            isSample: false,
          };
        }
        return t;
      })
    );
  }, []);

  // Habit Operations
  const addHabit = useCallback((habitData: Omit<Habit, 'id' | 'createdAt' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      completedDates: [],
      createdAt: new Date().toISOString(),
      isSample: false,
    };
    setHabits(prev => [...prev, newHabit]);
    soundFx.playClick();
  }, []);

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setHabits(prev => prev.map(h => (h.id === id ? { ...h, ...updates, isSample: false } : h)));
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    soundFx.playClick();
  }, []);

  const toggleHabitDate = useCallback((habitId: string, dateStr: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          const dates = new Set(h.completedDates || []);
          const isAdding = !dates.has(dateStr);
          if (isAdding) {
            dates.add(dateStr);
            triggerCelebration();
            soundFx.playCompletionChime();
          } else {
            dates.delete(dateStr);
            soundFx.playClick();
          }
          return {
            ...h,
            completedDates: Array.from(dates),
            isSample: false,
          };
        }
        return h;
      })
    );
  }, []);

  // Timer Tick and Handlers
  const completeTimerSession = useCallback(() => {
    const now = new Date();
    const todayStr = formatDate(now);
    soundFx.playTimerBell();
    triggerCelebration();

    if (timerState.mode === 'pomodoro' || timerState.mode === 'custom') {
      const minutesLogged = Math.round(timerState.totalSeconds / 60);
      const associatedTask = tasks.find(t => t.id === timerState.selectedTaskId);
      
      const newSession: FocusSession = {
        id: `focus-${Date.now()}`,
        date: todayStr,
        minutes: minutesLogged,
        taskId: timerState.selectedTaskId,
        taskTitle: associatedTask ? associatedTask.title : 'General Deep Work',
        mode: timerState.mode,
        completedAt: now.toISOString(),
        isSample: false,
      };

      setFocusSessions(prev => [newSession, ...prev]);

      // If tied to a task, offer or keep completed
      const newCycles = timerState.completedCycles + 1;
      const nextMode: FocusModeType =
        newCycles % (settings.longBreakInterval || 4) === 0 ? 'long_break' : 'short_break';
      const nextDuration =
        nextMode === 'long_break' ? (settings.longBreakMin || 15) * 60 : (settings.shortBreakMin || 5) * 60;

      setTimerState(prev => ({
        ...prev,
        mode: nextMode,
        remainingSeconds: nextDuration,
        totalSeconds: nextDuration,
        isRunning: false,
        completedCycles: newCycles,
      }));
    } else {
      // Break finished, advance back to work
      const workDuration = (settings.pomodoroMin || 25) * 60;
      setTimerState(prev => ({
        ...prev,
        mode: 'pomodoro',
        remainingSeconds: workDuration,
        totalSeconds: workDuration,
        isRunning: false,
      }));
    }
  }, [timerState, tasks, settings]);

  useEffect(() => {
    if (timerState.isRunning) {
      timerRef.current = setInterval(() => {
        setTimerState(prev => {
          if (prev.remainingSeconds <= 1) {
            clearInterval(timerRef.current!);
            completeTimerSession();
            return {
              ...prev,
              remainingSeconds: 0,
              isRunning: false,
            };
          }
          return {
            ...prev,
            remainingSeconds: prev.remainingSeconds - 1,
          };
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState.isRunning, completeTimerSession]);

  const startTimer = useCallback(() => {
    soundFx.playClick();
    setTimerState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pauseTimer = useCallback(() => {
    soundFx.playClick();
    setTimerState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const resetTimer = useCallback(() => {
    soundFx.playClick();
    let seconds = (settings.pomodoroMin || 25) * 60;
    if (timerState.mode === 'short_break') seconds = (settings.shortBreakMin || 5) * 60;
    if (timerState.mode === 'long_break') seconds = (settings.longBreakMin || 15) * 60;
    setTimerState(prev => ({
      ...prev,
      remainingSeconds: seconds,
      totalSeconds: seconds,
      isRunning: false,
    }));
  }, [timerState.mode, settings]);

  const setTimerMode = useCallback((mode: FocusModeType, customMinutes?: number) => {
    soundFx.playClick();
    let seconds = (settings.pomodoroMin || 25) * 60;
    if (mode === 'short_break') seconds = (settings.shortBreakMin || 5) * 60;
    else if (mode === 'long_break') seconds = (settings.longBreakMin || 15) * 60;
    else if (mode === 'custom' && customMinutes) seconds = customMinutes * 60;

    setTimerState(prev => ({
      ...prev,
      mode,
      remainingSeconds: seconds,
      totalSeconds: seconds,
      isRunning: false,
    }));
  }, [settings]);

  const setSelectedFocusTask = useCallback((taskId?: string) => {
    setTimerState(prev => ({ ...prev, selectedTaskId: taskId }));
  }, []);

  const skipTimerPhase = useCallback(() => {
    completeTimerSession();
  }, [completeTimerSession]);

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSampleData = useCallback(() => {
    const sample = generateSampleData();
    setTasks(sample.tasks);
    setHabits(sample.habits);
    setFocusSessions(sample.focusSessions);
    saveTasksToStorage(sample.tasks);
    saveHabitsToStorage(sample.habits);
    saveFocusSessionsToStorage(sample.focusSessions);
    soundFx.playCompletionChime();
  }, []);

  const clearAllData = useCallback(() => {
    setTasks([]);
    setHabits([]);
    setFocusSessions([]);
    saveTasksToStorage([]);
    saveHabitsToStorage([]);
    saveFocusSessionsToStorage([]);
    soundFx.playClick();
  }, []);

  // Daily brief generator
  const fetchDailyBrief = useCallback(async () => {
    setIsLoadingBrief(true);
    try {
      const res = await fetch('/api/daily-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks, habits }),
      });
      if (res.ok) {
        const data = await res.json();
        setDailyBrief(data);
      }
    } catch (err) {
      console.warn('Failed to fetch daily brief, using offline summary:', err);
    } finally {
      setIsLoadingBrief(false);
    }
  }, [tasks, habits]);

  // Initial fetch for daily brief
  useEffect(() => {
    fetchDailyBrief();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Modal helpers
  const openTaskModal = useCallback((task?: Task) => {
    setEditingTask(task || null);
    setIsTaskModalOpen(true);
  }, []);

  const closeTaskModal = useCallback(() => {
    setEditingTask(null);
    setIsTaskModalOpen(false);
  }, []);

  const openHabitModal = useCallback((habit?: Habit) => {
    setEditingHabit(habit || null);
    setIsHabitModalOpen(true);
  }, []);

  const closeHabitModal = useCallback(() => {
    setEditingHabit(null);
    setIsHabitModalOpen(false);
  }, []);

  return (
    <LifeOSContext.Provider
      value={{
        activeTab,
        setActiveTab,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        habits,
        addHabit,
        updateHabit,
        deleteHabit,
        toggleHabitDate,
        focusSessions,
        timerState,
        startTimer,
        pauseTimer,
        resetTimer,
        setTimerMode,
        setSelectedFocusTask,
        skipTimerPhase,
        settings,
        updateSettings,
        isSampleDataActive,
        resetSampleData,
        clearAllData,
        dailyBrief,
        isLoadingBrief,
        fetchDailyBrief,
        isTaskModalOpen,
        openTaskModal,
        closeTaskModal,
        editingTask,
        isHabitModalOpen,
        openHabitModal,
        closeHabitModal,
        editingHabit,
      }}
    >
      {children}
    </LifeOSContext.Provider>
  );
};

export const useLifeOS = () => {
  const context = useContext(LifeOSContext);
  if (!context) throw new Error('useLifeOS must be used within a LifeOSProvider');
  return context;
};
