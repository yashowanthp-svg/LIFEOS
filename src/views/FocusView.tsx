import React, { useState } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  Volume2,
  VolumeX,
  Sparkles,
  CloudRain,
  Radio,
  Headphones,
  Sliders,
  Flame,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { FocusModeType } from '../types';
import { formatDate } from '../utils/storage';

export const FocusView: React.FC = () => {
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerMode,
    skipTimerPhase,
    tasks,
    setSelectedFocusTask,
    focusSessions,
    settings,
    updateSettings,
    toggleTaskComplete,
  } = useLifeOS();

  const [customMinutes, setCustomMinutes] = useState(50);
  const [showCustomModal, setShowCustomModal] = useState(false);

  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const associatedTask = tasks.find(t => t.id === timerState.selectedTaskId);
  const todayStr = formatDate(new Date());
  const todaySessions = focusSessions.filter(f => f.date === todayStr);
  const todayFocusMinutes = todaySessions.reduce((acc, f) => acc + f.minutes, 0);

  const formatTimerDigits = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Circular progress math
  const progressPercent = timerState.totalSeconds > 0
    ? ((timerState.totalSeconds - timerState.remainingSeconds) / timerState.totalSeconds) * 100
    : 0;

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const cycleTarget = settings.longBreakInterval || 4;
  const currentCycleProgress = (timerState.completedCycles % cycleTarget) + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center justify-center sm:justify-start gap-2">
            <Timer className="w-5 h-5 text-cyan-400" />
            <span>Focus Deep Work Chamber</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured intervals designed for peak cognitive absorption and deliberate recovery.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
            Today: {todayFocusMinutes} mins ({todaySessions.length} sessions)
          </span>
        </div>
      </div>

      {/* Main Focus Timer Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[#0F1420] border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col items-center">
        {/* Glow ambient background element */}
        <div
          className={`absolute -top-32 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-20 ${
            timerState.mode === 'pomodoro'
              ? 'bg-indigo-500'
              : timerState.mode === 'short_break'
              ? 'bg-emerald-500'
              : 'bg-cyan-500'
          }`}
        />

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 z-10 max-w-full overflow-x-auto">
          <button
            onClick={() => setTimerMode('pomodoro')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timerState.mode === 'pomodoro'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pomodoro ({settings.pomodoroMin || 25}m)
          </button>
          <button
            onClick={() => setTimerMode('short_break')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timerState.mode === 'short_break'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Short Break ({settings.shortBreakMin || 5}m)
          </button>
          <button
            onClick={() => setTimerMode('long_break')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timerState.mode === 'long_break'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Long Break ({settings.longBreakMin || 15}m)
          </button>
          <button
            onClick={() => {
              setShowCustomModal(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              timerState.mode === 'custom'
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Custom ({customMinutes}m)
          </button>
        </div>

        {/* Circular Display */}
        <div className="relative my-8 flex items-center justify-center">
          <svg className="w-72 h-72 sm:w-80 sm:h-80 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              className="text-slate-800/80"
              fill="transparent"
            />
            {/* Dynamic progress ring */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-500 ${
                timerState.mode === 'pomodoro'
                  ? 'text-indigo-500'
                  : timerState.mode === 'short_break'
                  ? 'text-emerald-400'
                  : timerState.mode === 'long_break'
                  ? 'text-cyan-400'
                  : 'text-violet-500'
              }`}
              fill="transparent"
            />
          </svg>

          {/* Time and cycle center info */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white select-none">
              {formatTimerDigits(timerState.remainingSeconds)}
            </span>
            <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-2">
              {timerState.mode.replace('_', ' ')}
            </span>
            <div className="flex items-center gap-1.5 mt-3">
              {Array.from({ length: cycleTarget }).map((_, idx) => (
                <span
                  key={idx}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx < (timerState.completedCycles % cycleTarget)
                      ? 'bg-indigo-400'
                      : idx === (timerState.completedCycles % cycleTarget) && timerState.isRunning
                      ? 'bg-indigo-400 animate-ping'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
              <span className="text-[10px] text-slate-400 ml-1 font-mono font-semibold">
                Round {currentCycleProgress}/{cycleTarget}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="flex items-center gap-3 z-10">
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={timerState.isRunning ? pauseTimer : startTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm tracking-wide shadow-xl flex items-center gap-2.5 transition-all cursor-pointer ${
              timerState.isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 scale-105 active:scale-95'
            }`}
          >
            {timerState.isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>Pause Session</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current ml-0.5" />
                <span>Start Focus</span>
              </>
            )}
          </button>

          <button
            onClick={skipTimerPhase}
            className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Skip to next phase"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Associated Task Selector Bar */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 w-full max-w-md z-10 space-y-2">
          <label className="block text-xs font-semibold text-slate-400 text-center">
            Anchor Focus to a Specific Task:
          </label>
          <div className="flex items-center gap-2">
            <select
              value={timerState.selectedTaskId || ''}
              onChange={e => setSelectedFocusTask(e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">No task attached (Independent Deep Work)</option>
              {pendingTasks.map(t => (
                <option key={t.id} value={t.id}>
                  [{t.priority.toUpperCase()}] {t.title} ({t.estimatedDuration}m)
                </option>
              ))}
            </select>
          </div>

          {associatedTask && (
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
              <span className="truncate">Working on: <strong>{associatedTask.title}</strong></span>
              <button
                onClick={() => toggleTaskComplete(associatedTask.id)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold shrink-0 cursor-pointer"
              >
                Mark Done &check;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Focus Atmosphere & Ambient Audio Controls */}
      <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Ambient Sound Selection */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Headphones className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Focus Atmosphere Generator
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            Real-time synthesized audio waves (plays automatically when timer runs)
          </p>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'off', label: 'Mute', icon: VolumeX },
              { id: 'rain', label: 'Soft Rain', icon: CloudRain },
              { id: 'whitenoise', label: 'Air Flow', icon: Radio },
              { id: 'hum', label: 'Theta Beat', icon: Headphones },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = settings.ambientSound === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => updateSettings({ ambientSound: item.id as any })}
                  className={`py-2 px-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-sm'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Volume Slider & Audio Cue Controls */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                Ambient Sound Volume
              </span>
              <span className="font-mono text-cyan-400">
                {Math.round((settings.ambientVolume || 0.4) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.ambientVolume || 0.4}
              onChange={e => updateSettings({ ambientVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">Session Bells & Completion Chimes</span>
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`px-3 py-1 rounded-lg font-semibold cursor-pointer transition-colors ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>
      </div>

      {/* Today's Completed Focus Log */}
      <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Today's Focus Log ({todaySessions.length} Blocks)</span>
          </h3>
          <span className="text-xs font-mono font-semibold text-slate-400">
            {todayFocusMinutes} Total Minutes
          </span>
        </div>

        <div className="space-y-2">
          {todaySessions.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              No sessions completed yet today. Start your first 25-minute Pomodoro!
            </p>
          ) : (
            todaySessions.map((session, idx) => (
              <div
                key={session.id || idx}
                className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-slate-200">
                    {session.taskTitle || 'Deep Work Session'}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {session.mode}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-cyan-400 font-bold">
                  <span>+{session.minutes} mins</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Custom Duration Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="p-6 rounded-2xl bg-[#0F1420] border border-slate-800 max-w-xs w-full space-y-4">
            <h3 className="text-sm font-bold text-white">Set Custom Focus Time</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Duration (Minutes):</label>
              <input
                type="number"
                min="5"
                max="180"
                value={customMinutes}
                onChange={e => setCustomMinutes(Math.max(5, Math.min(180, parseInt(e.target.value) || 25)))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-center text-lg outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowCustomModal(false)}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setTimerMode('custom', customMinutes);
                  setShowCustomModal(false);
                }}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
