import React, { useState } from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  Timer,
  Sparkles,
  BarChart3,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Zap,
  Play,
  Pause,
} from 'lucide-react';
import { useLifeOS, NavigationTab } from '../context/LifeOSContext';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {
    activeTab,
    setActiveTab,
    tasks,
    habits,
    timerState,
    startTimer,
    pauseTimer,
  } = useLifeOS();

  const pendingTasksCount = tasks.filter(t => t.status !== 'completed').length;
  const todayStr = new Date().toISOString().split('T')[0];
  const completedHabitsCount = habits.filter(h => (h.completedDates || []).includes(todayStr)).length;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number;
    highlight?: boolean;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'tasks',
      label: 'My Tasks',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
    },
    {
      id: 'habits',
      label: 'Habits',
      icon: Flame,
      badge: habits.length > 0 ? `${completedHabitsCount}/${habits.length}` : undefined,
    },
    {
      id: 'focus',
      label: 'Focus Mode',
      icon: Timer,
      badge: timerState.isRunning ? 'Running' : undefined,
      highlight: timerState.isRunning,
    },
    {
      id: 'planner',
      label: 'AI Planner',
      icon: Sparkles,
      badge: 'AI',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: SlidersHorizontal,
    },
  ];

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-800/80 bg-[#0B0F17]/95 backdrop-blur-md transition-all duration-300 z-30 select-none relative ${
          isCollapsed ? 'w-[74px]' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 text-left focus:outline-none overflow-hidden group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  LifeOS
                </span>
                <span className="block text-[10px] tracking-wider font-semibold uppercase text-indigo-400">
                  Personal OS
                </span>
              </div>
            )}
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <div
                  className={`relative shrink-0 ${
                    isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.highlight && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      item.highlight
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : item.badge === 'AI'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Compact Persistent Timer Card in Sidebar */}
        <div className="p-3 border-t border-slate-800/80">
          {!isCollapsed ? (
            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800/90">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      timerState.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                    }`}
                  />
                  <span className="capitalize">{timerState.mode.replace('_', ' ')}</span>
                </div>
                <button
                  onClick={() => setActiveTab('focus')}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Open
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold tracking-tight text-white">
                  {formatTimerDigits(timerState.remainingSeconds)}
                </span>
                <button
                  onClick={timerState.isRunning ? pauseTimer : startTimer}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                    timerState.isRunning
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                  title={timerState.isRunning ? 'Pause' : 'Start'}
                >
                  {timerState.isRunning ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('focus')}
              className="w-full flex flex-col items-center py-2 text-slate-400 hover:text-indigo-400 transition-colors"
              title="Focus timer"
            >
              <Timer className={`w-5 h-5 ${timerState.isRunning ? 'text-cyan-400 animate-pulse' : ''}`} />
              <span className="text-[10px] font-mono mt-1 font-bold">
                {formatTimerDigits(timerState.remainingSeconds)}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0B0F17]/95 border-t border-slate-800/80 backdrop-blur-lg z-40 flex items-center justify-around px-2">
        {navItems.slice(0, 5).map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.highlight && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                )}
              </div>
              <span className="text-[10px] font-medium mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-colors ${
            activeTab === 'analytics' || activeTab === 'settings'
              ? 'text-indigo-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Stats</span>
        </button>
      </nav>
    </>
  );
};
