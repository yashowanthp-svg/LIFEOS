import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Timer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Plus,
  Play,
  RotateCw,
  Zap,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { calculateHabitStats, formatDate, getPastDates } from '../utils/storage';

export const DashboardView: React.FC = () => {
  const {
    tasks,
    habits,
    focusSessions,
    timerState,
    startTimer,
    setActiveTab,
    toggleTaskComplete,
    toggleHabitDate,
    openTaskModal,
    openHabitModal,
    dailyBrief,
    isLoadingBrief,
    fetchDailyBrief,
  } = useLifeOS();

  const todayStr = formatDate(new Date());

  // Task Stats for Today
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const pendingTodayTasks = todayTasks.filter(t => t.status !== 'completed');
  const completedTodayTasks = todayTasks.filter(t => t.status === 'completed');
  
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
  const overallTaskPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Overdue Tasks
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr);

  // Focus Stats for Today
  const todayFocusSessions = focusSessions.filter(f => f.date === todayStr);
  const todayFocusMinutes = todayFocusSessions.reduce((acc, f) => acc + f.minutes, 0);

  // Habits Today
  const completedHabitsToday = habits.filter(h => (h.completedDates || []).includes(todayStr)).length;
  const habitRateToday = habits.length > 0 ? Math.round((completedHabitsToday / habits.length) * 100) : 0;

  // Past 7 days productivity bar chart data
  const past7Days = getPastDates(7);
  const weeklyData = past7Days.map(dateStr => {
    const d = new Date(dateStr + 'T12:00:00');
    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'narrow' });
    const tasksDone = tasks.filter(t => t.status === 'completed' && (t.completedAt?.startsWith(dateStr) || t.dueDate === dateStr)).length;
    const focusMins = focusSessions.filter(f => f.date === dateStr).reduce((acc, f) => acc + f.minutes, 0);
    return { dateStr, dayLabel, tasksDone, focusMins };
  });
  const maxWeeklyTasks = Math.max(1, ...weeklyData.map(w => w.tasksDone));

  // Prioritized list for today: high first, then medium, then low
  const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const prioritizedTasks = [...tasks]
    .filter(t => t.status !== 'completed')
    .sort((a, b) => {
      // Due today or overdue first
      const aToday = a.dueDate <= todayStr ? 1 : 0;
      const bToday = b.dueDate <= todayStr ? 1 : 0;
      if (aToday !== bToday) return bToday - aToday;

      const pw = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
      if (pw !== 0) return pw;
      return (a.estimatedDuration || 30) - (b.estimatedDuration || 30);
    })
    .slice(0, 5);

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Overdue Warning Alert Banner if applicable */}
      {overdueTasks.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              You have <strong className="font-semibold text-rose-200">{overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}</strong> from previous days.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('tasks')}
            className="text-rose-300 hover:text-white underline font-semibold cursor-pointer"
          >
            Review Tasks &rarr;
          </button>
        </div>
      )}

      {/* Hero KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Daily Task Completion Progress */}
        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800/80 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Daily Completion</span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {completedTodayTasks.length}
                <span className="text-sm font-normal text-slate-500"> / {todayTasks.length}</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {pendingTodayTasks.length === 0 && todayTasks.length > 0
                  ? 'All today tasks completed!'
                  : `${pendingTodayTasks.length} pending today`}
              </p>
            </div>
            <div className="text-right font-mono font-bold text-lg text-indigo-400">
              {todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : overallTaskPercent}%
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${todayTasks.length > 0 ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) : overallTaskPercent}%`,
              }}
            />
          </div>
        </div>

        {/* KPI 2: Focus Time Logged Today */}
        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Focus Hours Today</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Timer className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {(todayFocusMinutes / 60).toFixed(1)}
                <span className="text-sm font-normal text-slate-500"> hrs</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {todayFocusSessions.length} session{todayFocusSessions.length !== 1 ? 's' : ''} logged
              </p>
            </div>
            <button
              onClick={() => setActiveTab('focus')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Focus &rarr;
            </button>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-cyan-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (todayFocusMinutes / 180) * 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Habit Execution Rate */}
        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Habits Logged</span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Flame className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {completedHabitsToday}
                <span className="text-sm font-normal text-slate-500"> / {habits.length}</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {habits.length - completedHabitsToday} habit{habits.length - completedHabitsToday !== 1 ? 's' : ''} remaining
              </p>
            </div>
            <div className="text-right font-mono font-bold text-lg text-emerald-400">
              {habitRateToday}%
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${habitRateToday}%` }}
            />
          </div>
        </div>

        {/* KPI 4: Productivity Momentum */}
        <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800/80 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Productivity Momentum</span>
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono text-white">
                {completedTasksCount}
                <span className="text-sm font-normal text-slate-500"> tasks done</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Across {tasks.length} total objectives
              </p>
            </div>
            <button
              onClick={() => setActiveTab('analytics')}
              className="text-xs text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
            >
              Trends &rarr;
            </button>
          </div>
          <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${overallTaskPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* AI Daily Recommendation & Strategic Guidance Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#0F1420] to-slate-900/60 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Daily Intelligence Brief</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {dailyBrief?.source === 'ai' ? 'Gemini 3.8 Flash' : 'Strategic Heuristic'}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Dynamic personalized game plan tailored to your deadlines & habits
              </p>
            </div>
          </div>

          <button
            onClick={fetchDailyBrief}
            disabled={isLoadingBrief}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh AI recommendation"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isLoadingBrief ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="mt-4 pt-3.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              "{dailyBrief?.greeting || 'Organizing your day with clear intentionality leads to effortless flow.'}"
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-indigo-300">
                <Zap className="w-3.5 h-3.5" />
                <span>Strategy: {dailyBrief?.energyTip || 'Deep work early, operational tasks late.'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300">
                <Flame className="w-3.5 h-3.5" />
                <span>{dailyBrief?.habitFocus || 'Consistent habits build compound momentum.'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
            <span className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
              Optimal Day Blueprint
            </span>
            <p className="text-xs text-slate-300 mt-1 italic">
              "{dailyBrief?.quote || 'Action conquers anxiety. Start the first 25 minutes.'}"
            </p>
            <button
              onClick={() => setActiveTab('planner')}
              className="mt-3 w-full py-1.5 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Build Day Schedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Today's Prioritized Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Today's Prioritized Tasks</h2>
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs font-mono font-medium">
                {prioritizedTasks.length} active
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openTaskModal()}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
              <span className="text-slate-700">|</span>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                View All &rarr;
              </button>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {prioritizedTasks.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#0F1420] border border-slate-800 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">All Clear! No Pending Tasks</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You have conquered all prioritized tasks. Add a new objective or celebrate your momentum.
                </p>
                <button
                  onClick={() => openTaskModal()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Task</span>
                </button>
              </div>
            ) : (
              prioritizedTasks.map(task => {
                const isOverdue = task.dueDate < todayStr;
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl bg-[#0F1420] border border-slate-800/90 hover:border-slate-700/80 transition-all flex items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* Completion Checkbox */}
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="mt-0.5 sm:mt-0 text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                        title="Mark complete"
                      >
                        <Circle className="w-5 h-5" />
                      </button>

                      {/* Title & metadata */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                            {task.title}
                          </span>
                          {task.isSample && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                              Sample
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-slate-400 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              task.priority === 'high'
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                : task.priority === 'medium'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}
                          >
                            {task.priority}
                          </span>

                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {task.category}
                          </span>

                          <span className="flex items-center gap-1 font-mono text-slate-400">
                            <Clock className="w-3 h-3" />
                            {task.estimatedDuration}m
                          </span>

                          <span className={`${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>
                            {isOverdue ? 'Overdue: ' : 'Due: '}
                            {task.dueDate}
                            {task.dueTime ? ` @ ${task.dueTime}` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Focus Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('focus');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Start Pomodoro for this task"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column (1 col): Habits & Focus Mini-Timer */}
        <div className="space-y-6">
          {/* Focus Timer Mini Widget */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold text-white">Focus Session</h3>
              </div>
              <button
                onClick={() => setActiveTab('focus')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Full Mode &rarr;
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 capitalize">
                  {timerState.mode.replace('_', ' ')}
                </span>
                <div className="text-2xl font-bold font-mono text-white mt-0.5">
                  {formatTimerDigits(timerState.remainingSeconds)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={timerState.isRunning ? () => setActiveTab('focus') : startTimer}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{timerState.isRunning ? 'Active' : 'Start'}</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Today: {todayFocusSessions.length} sessions</span>
              <span className="font-mono text-cyan-400 font-semibold">{todayFocusMinutes} mins focus</span>
            </div>
          </div>

          {/* Daily Habit Checklist */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Habit Check-In</h3>
              </div>
              <button
                onClick={() => openHabitModal()}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium cursor-pointer"
              >
                + New Habit
              </button>
            </div>

            <div className="space-y-2">
              {habits.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No active habits. Create one to build consistency!
                </p>
              ) : (
                habits.map(habit => {
                  const stats = calculateHabitStats(habit);
                  const isDoneToday = stats.completedToday;

                  return (
                    <div
                      key={habit.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-2.5 hover:border-slate-700/80 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          onClick={() => toggleHabitDate(habit.id, todayStr)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                            isDoneToday
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'bg-slate-800 border border-slate-700 hover:border-slate-600 text-transparent'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current stroke-white" />
                        </button>

                        <div className="min-w-0 flex-1">
                          <span
                            className={`text-xs font-semibold truncate block ${
                              isDoneToday ? 'text-slate-400 line-through' : 'text-slate-200'
                            }`}
                          >
                            {habit.title}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {habit.frequency} • {stats.currentStreak} day streak
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-amber-400 shrink-0">
                        <Flame className="w-3 h-3 fill-amber-400" />
                        <span>{stats.currentStreak}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setActiveTab('habits')}
              className="w-full py-1.5 text-center text-xs font-semibold text-indigo-400 hover:text-indigo-300 block transition-colors cursor-pointer"
            >
              View Habit Heatmaps &rarr;
            </button>
          </div>

          {/* Compact 7-Day Velocity Chart */}
          <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                7-Day Completion Flow
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">Tasks / Focus</span>
            </div>

            <div className="h-28 flex items-end justify-between gap-2 pt-2">
              {weeklyData.map(item => {
                const heightPercent = Math.max(10, Math.round((item.tasksDone / maxWeeklyTasks) * 80));
                const isToday = item.dateStr === todayStr;

                return (
                  <div key={item.dateStr} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <div className="text-[9px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                      {item.tasksDone}
                    </div>
                    <div className="w-full bg-slate-900 rounded-t-md h-20 flex items-end justify-center p-0.5">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${
                          isToday ? 'bg-indigo-500 shadow-sm shadow-indigo-500/30' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        isToday ? 'text-indigo-400 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {item.dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
