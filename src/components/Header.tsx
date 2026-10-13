import React, { useState, useEffect } from 'react';
import { Plus, Timer, Sparkles, CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';

export const Header: React.FC = () => {
  const {
    settings,
    timerState,
    setActiveTab,
    openTaskModal,
    openHabitModal,
    isSampleDataActive,
    clearAllData,
    resetSampleData,
  } = useLifeOS();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  let timeGreeting = 'Good morning';
  if (hours >= 12 && hours < 17) timeGreeting = 'Good afternoon';
  else if (hours >= 17) timeGreeting = 'Good evening';

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="border-b border-slate-800/80 bg-[#0B0F17]/80 backdrop-blur-md sticky top-0 z-20 px-4 lg:px-8 py-3.5 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Greeting & Current Live Date */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg lg:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>{timeGreeting},</span>
              <span className="text-indigo-400">{settings.userName || 'Champion'}</span>
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              {settings.userRole || 'Productive'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-2">
            <span>{formattedDate}</span>
            <span>•</span>
            <span className="font-mono text-slate-300">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </p>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Active Timer Pill */}
          {timerState.isRunning && (
            <button
              onClick={() => setActiveTab('focus')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/20 transition-all cursor-pointer animate-pulse"
              title="Focus timer is active"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>Focusing:</span>
              <span className="font-mono font-bold">
                {formatTimerDigits(timerState.remainingSeconds)}
              </span>
            </button>
          )}

          {/* AI Planner Quick Action */}
          <button
            onClick={() => setActiveTab('planner')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Planner</span>
          </button>

          {/* Add Habit Quick Button */}
          <button
            onClick={() => openHabitModal()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>Habit</span>
          </button>

          {/* Add Task Primary Button */}
          <button
            onClick={() => openTaskModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Clear Demonstration Data Ribbon */}
      {isSampleDataActive && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400/80" />
            <span>
              Previewing with <strong className="text-slate-300">realistic sample data</strong>. Your edits and additions will persist.
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 sm:mt-0">
            <button
              onClick={clearAllData}
              className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Clear sample data to start with empty workspace"
            >
              <Trash2 className="w-3 h-3" />
              Clear Sample Data
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={resetSampleData}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
              title="Reset back to initial realistic demo data"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
