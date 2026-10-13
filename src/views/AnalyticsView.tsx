import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Flame,
  Timer,
  Calendar,
  PieChart,
  Award,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { calculateHabitStats, formatDate, getPastDates } from '../utils/storage';
import { Priority } from '../types';

export const AnalyticsView: React.FC = () => {
  const { tasks, habits, focusSessions, isSampleDataActive } = useLifeOS();
  const [timeRange, setTimeRange] = useState<'7' | '30' | 'all'>('7');

  const daysCount = timeRange === '7' ? 7 : timeRange === '30' ? 30 : 90;
  const dateRangeList = useMemo(() => getPastDates(daysCount), [daysCount]);
  const dateRangeSet = useMemo(() => new Set(dateRangeList), [dateRangeList]);

  // Filter tasks within date range
  const relevantTasks = useMemo(() => {
    if (timeRange === 'all') return tasks;
    return tasks.filter(t => {
      const matchDue = dateRangeSet.has(t.dueDate);
      const matchComp = t.completedAt ? dateRangeSet.has(t.completedAt.split('T')[0]) : false;
      return matchDue || matchComp;
    });
  }, [tasks, dateRangeSet, timeRange]);

  const completedTasks = relevantTasks.filter(t => t.status === 'completed');
  const totalTasks = relevantTasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Priority Breakdown of completed tasks
  const priorityBreakdown = useMemo(() => {
    const counts: Record<Priority, number> = { high: 0, medium: 0, low: 0 };
    completedTasks.forEach(t => {
      if (counts[t.priority] !== undefined) counts[t.priority]++;
    });
    return counts;
  }, [completedTasks]);

  // Focus Sessions in range
  const relevantFocusSessions = useMemo(() => {
    if (timeRange === 'all') return focusSessions;
    return focusSessions.filter(f => dateRangeSet.has(f.date));
  }, [focusSessions, dateRangeSet, timeRange]);

  const totalFocusMinutes = relevantFocusSessions.reduce((acc, f) => acc + f.minutes, 0);
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const totalFocusSessionsCount = relevantFocusSessions.length;

  // Habit metrics
  const habitStats = habits.map(calculateHabitStats);
  const avgConsistency = habitStats.length > 0
    ? Math.round(
        habitStats.reduce((acc, h) => acc + (timeRange === '7' ? h.weeklyRate : h.monthlyRate), 0) /
          habitStats.length
      )
    : 0;

  // Daily task completion chart data
  const chartDays = timeRange === '7' ? 7 : 14;
  const chartDates = useMemo(() => getPastDates(chartDays), [chartDays]);
  const dailyTrends = useMemo(() => {
    return chartDates.map(dateStr => {
      const d = new Date(dateStr + 'T12:00:00');
      const label = timeRange === '7'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : `${d.getMonth() + 1}/${d.getDate()}`;
      const completedOnDate = tasks.filter(
        t => t.status === 'completed' && (t.completedAt?.startsWith(dateStr) || t.dueDate === dateStr)
      ).length;
      const focusOnDate = focusSessions
        .filter(f => f.date === dateStr)
        .reduce((acc, f) => acc + f.minutes, 0);

      return { dateStr, label, completedOnDate, focusOnDate };
    });
  }, [chartDates, tasks, focusSessions, timeRange]);

  const maxDailyTasks = Math.max(1, ...dailyTrends.map(d => d.completedOnDate));
  const maxDailyFocus = Math.max(30, ...dailyTrends.map(d => d.focusOnDate));

  // Productivity Score Calculation (0-100)
  const productivityScore = useMemo(() => {
    if (totalTasks === 0 && habits.length === 0 && relevantFocusSessions.length === 0) return 0;
    // Task weight: 40%, Habit weight: 40%, Focus weight: 20%
    const taskScore = completionRate * 0.4;
    const habitScore = avgConsistency * 0.4;
    const focusTargetMins = daysCount * 45; // 45m daily benchmark
    const focusScore = Math.min(100, (totalFocusMinutes / focusTargetMins) * 100) * 0.2;
    return Math.min(100, Math.round(taskScore + habitScore + focusScore));
  }, [totalTasks, habits, relevantFocusSessions, completionRate, avgConsistency, totalFocusMinutes, daysCount]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header with Time Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Productivity Analytics & Telemetry</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Objective performance trends computed from your real historical records.
          </p>
        </div>

        {/* Range Buttons */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1 self-start sm:self-center">
          <button
            onClick={() => setTimeRange('7')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              timeRange === '7'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              timeRange === '30'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              timeRange === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Demonstration Data Warning Notice */}
      {isSampleDataActive && (
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            Analytics reflect active tasks & demonstration history. As you clear or log your personal data, metrics dynamically update.
          </span>
        </div>
      )}

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Productivity Index */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>LifeOS Velocity Score</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {productivityScore}
            <span className="text-sm font-normal text-slate-500"> / 100</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Balanced composite of task completions, habit streaks, and focus volume.
          </p>
        </div>

        {/* Task Completion Rate */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Task Completion Ratio</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {completionRate}%
          </div>
          <p className="text-[11px] text-slate-400">
            {completedTasks.length} completed out of {totalTasks} tracked objectives
          </p>
        </div>

        {/* Focus Volume */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Deep Focus Time</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Timer className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {totalFocusHours} <span className="text-sm font-normal text-slate-500">hrs</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Across {totalFocusSessionsCount} structured Pomodoro sessions
          </p>
        </div>

        {/* Habit Consistency */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Habit Consistency Rate</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold font-mono text-white">
            {avgConsistency}%
          </div>
          <p className="text-[11px] text-slate-400">
            Average across {habits.length} recurring daily rituals
          </p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Task Completion Trend Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white">Daily Execution Velocity</h2>
              <p className="text-xs text-slate-400">Tasks completed each day over selected timeframe</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>Tasks Completed</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-52 flex items-end justify-between gap-2 pt-6">
            {dailyTrends.map(day => {
              const heightPercent = Math.max(6, Math.round((day.completedOnDate / maxDailyTasks) * 85));

              return (
                <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group">
                  <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.completedOnDate}
                  </span>
                  <div className="w-full bg-slate-900 rounded-t-lg h-36 flex items-end justify-center p-1">
                    <div
                      className="w-full bg-indigo-500 rounded-t-md hover:bg-indigo-400 transition-all duration-300 shadow-sm shadow-indigo-500/30"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 truncate max-w-full">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Breakdown (1 col) */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Completed by Priority</h2>
            <p className="text-xs text-slate-400">Impact distribution of completed objectives</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* High Priority */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  High Priority
                </span>
                <span className="font-mono text-slate-300 font-bold">
                  {priorityBreakdown.high} ({completedTasks.length > 0 ? Math.round((priorityBreakdown.high / completedTasks.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{
                    width: `${completedTasks.length > 0 ? (priorityBreakdown.high / completedTasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Medium Priority
                </span>
                <span className="font-mono text-slate-300 font-bold">
                  {priorityBreakdown.medium} ({completedTasks.length > 0 ? Math.round((priorityBreakdown.medium / completedTasks.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full"
                  style={{
                    width: `${completedTasks.length > 0 ? (priorityBreakdown.medium / completedTasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Low Priority */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Low Priority
                </span>
                <span className="font-mono text-slate-300 font-bold">
                  {priorityBreakdown.low} ({completedTasks.length > 0 ? Math.round((priorityBreakdown.low / completedTasks.length) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full"
                  style={{
                    width: `${completedTasks.length > 0 ? (priorityBreakdown.low / completedTasks.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 mt-4">
            💡 Pro tip: Maintaining &gt;40% high priority completions guarantees your effort is aligned with core leverage.
          </div>
        </div>
      </div>

      {/* Focus Minutes Distribution by Day */}
      <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Deep Focus Minutes Distribution</h2>
            <p className="text-xs text-slate-400">Total intentional study and work minutes recorded</p>
          </div>
          <span className="text-xs font-mono font-bold text-cyan-400">
            {totalFocusMinutes} Total Minutes Logged
          </span>
        </div>

        <div className="h-44 flex items-end justify-between gap-2 pt-4">
          {dailyTrends.map(day => {
            const heightPercent = Math.max(6, Math.round((day.focusOnDate / maxDailyFocus) * 85));

            return (
              <div key={day.dateStr} className="flex-1 flex flex-col items-center gap-1 group">
                <span className="text-[10px] text-cyan-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.focusOnDate}m
                </span>
                <div className="w-full bg-slate-900 rounded-t-lg h-28 flex items-end justify-center p-1">
                  <div
                    className="w-full bg-cyan-400 rounded-t-md hover:bg-cyan-300 transition-all duration-300 shadow-sm shadow-cyan-400/30"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 truncate max-w-full">
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
