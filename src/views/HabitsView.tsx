import React from 'react';
import {
  Flame,
  Plus,
  CheckCircle2,
  Calendar,
  Award,
  TrendingUp,
  Edit2,
  Trash2,
  Info,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { calculateHabitStats, formatDate, getPastDates } from '../utils/storage';

export const HabitsView: React.FC = () => {
  const {
    habits,
    toggleHabitDate,
    openHabitModal,
    deleteHabit,
  } = useLifeOS();

  const todayStr = formatDate(new Date());
  const past30Days = getPastDates(30);
  const past7Days = getPastDates(7);

  // Overall calculations across all habits
  const overallHabitStats = habits.map(calculateHabitStats);
  const totalHabits = habits.length;
  const bestOverallStreak = overallHabitStats.length > 0
    ? Math.max(0, ...overallHabitStats.map(s => s.bestStreak))
    : 0;
  const currentLongestStreak = overallHabitStats.length > 0
    ? Math.max(0, ...overallHabitStats.map(s => s.currentStreak))
    : 0;
  const avgWeeklyConsistency = overallHabitStats.length > 0
    ? Math.round(overallHabitStats.reduce((acc, s) => acc + s.weeklyRate, 0) / overallHabitStats.length)
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-emerald-400" />
            <span>Habit Architecture</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily rituals, build compound consistency, and review your historical heatmaps.
          </p>
        </div>

        <button
          onClick={() => openHabitModal()}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Habit</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Current Top Streak</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {currentLongestStreak} <span className="text-xs font-normal text-slate-400">consecutive days</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">All-Time Best Streak</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {bestOverallStreak} <span className="text-xs font-normal text-slate-400">days record</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400">Avg Weekly Consistency</span>
            <div className="text-xl font-bold font-mono text-white mt-0.5">
              {avgWeeklyConsistency}% <span className="text-xs font-normal text-slate-400">across {totalHabits} habits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Habits List & Heatmaps */}
      <div className="space-y-4">
        {habits.length === 0 ? (
          <div className="p-12 rounded-2xl bg-[#0F1420] border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No habits configured yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Atomic habits compound into extraordinary results. Start with a manageable daily goal.
            </p>
            <button
              onClick={() => openHabitModal()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Habit</span>
            </button>
          </div>
        ) : (
          habits.map(habit => {
            const stats = calculateHabitStats(habit);
            const isDoneToday = stats.completedToday;
            const completedSet = new Set(habit.completedDates || []);

            return (
              <div
                key={habit.id}
                className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 hover:border-slate-700/80 shadow-xl transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3">
                    {/* Today toggle button */}
                    <button
                      onClick={() => toggleHabitDate(habit.id, todayStr)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isDoneToday
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                          : 'bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-500'
                      }`}
                      title={isDoneToday ? 'Completed today! Click to undo' : 'Click to complete for today'}
                    >
                      <CheckCircle2 className="w-5 h-5 fill-current" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <h3 className="text-base font-bold text-white tracking-tight">
                          {habit.title}
                        </h3>
                        {habit.isSample && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                            Sample
                          </span>
                        )}
                      </div>
                      {habit.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{habit.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions & streak indicators */}
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-400">
                        <Flame className="w-4 h-4 fill-amber-400" />
                        <span>{stats.currentStreak} day streak</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        Best: {stats.bestStreak}d • 7-day: {stats.weeklyRate}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1 border-l border-slate-800 pl-3">
                      <button
                        onClick={() => openHabitModal(habit)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Edit habit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Delete habit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 30-Day Heatmap Grid */}
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>30-Day Consistency Heatmap</span>
                    </div>
                    <span>Click any day to toggle check-in</span>
                  </div>

                  {/* Responsive grid of 30 days */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {past30Days.map(dateStr => {
                      const isCompleted = completedSet.has(dateStr);
                      const isToday = dateStr === todayStr;
                      const dateObj = new Date(dateStr + 'T12:00:00');
                      const dayNumber = dateObj.getDate();

                      return (
                        <button
                          key={dateStr}
                          onClick={() => toggleHabitDate(habit.id, dateStr)}
                          className={`w-7 h-8 rounded-md flex flex-col items-center justify-center text-[10px] transition-all cursor-pointer shrink-0 font-mono ${
                            isCompleted
                              ? 'text-white font-bold shadow-sm'
                              : 'bg-slate-800/80 text-slate-500 hover:bg-slate-750 hover:text-slate-300'
                          } ${isToday ? 'ring-1 ring-white/60' : ''}`}
                          style={{
                            backgroundColor: isCompleted ? habit.color : undefined,
                          }}
                          title={`${dateStr}: ${isCompleted ? 'Completed' : 'Missed'}`}
                        >
                          <span className="text-[9px] opacity-80">{dayNumber}</span>
                          <span className="text-[8px] font-bold">
                            {isCompleted ? '✓' : '•'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
