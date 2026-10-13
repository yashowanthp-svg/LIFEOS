import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  Calendar,
  AlertTriangle,
  Play,
  RotateCw,
  Sliders,
  CheckCircle2,
  Lightbulb,
  Copy,
  Check,
  Zap,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { AIPlan, ScheduleBlock, ScheduleConflict } from '../types';

export const AIPlannerView: React.FC = () => {
  const {
    tasks,
    settings,
    setActiveTab,
    setSelectedFocusTask,
  } = useLifeOS();

  const [startTime, setStartTime] = useState(settings.workStart || '09:00');
  const [endTime, setEndTime] = useState(settings.workEnd || '17:30');
  const [focusBlockMin, setFocusBlockMin] = useState(settings.pomodoroMin || 25);
  const [breakMin, setBreakMin] = useState(settings.shortBreakMin || 5);
  const [energyPeak, setEnergyPeak] = useState<'morning' | 'afternoon' | 'evening'>(
    settings.peakEnergy || 'morning'
  );
  const [prioritizeDeadlines, setPrioritizeDeadlines] = useState(true);

  // Checkbox selection of tasks to include in planning
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
    pendingTasks.map(t => t.id)
  );

  const [isLoading, setIsLoading] = useState(false);
  const [aiPlan, setAiPlan] = useState<AIPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedSchedule, setCopiedSchedule] = useState(false);

  const handleToggleTaskSelection = (id: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedTaskIds(pendingTasks.map(t => t.id));
  };

  const handleDeselectAll = () => {
    setSelectedTaskIds([]);
  };

  const generatePlan = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    const tasksToPlan = pendingTasks.filter(t => selectedTaskIds.includes(t.id));

    try {
      const response = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: tasksToPlan,
          startTime,
          endTime,
          focusBlockMin,
          breakMin,
          energyPeak,
          prioritizeDeadlines,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAiPlan(data);
    } catch (err: any) {
      console.error('Failed to generate AI plan:', err);
      setErrorMsg('Could not connect to planning service. Please retry in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartFocusFromBlock = (block: ScheduleBlock) => {
    if (block.taskId) {
      setSelectedFocusTask(block.taskId);
    }
    setActiveTab('focus');
  };

  const handleCopySchedule = () => {
    if (!aiPlan) return;
    const text = aiPlan.schedule
      .map(s => `${s.startTime} - ${s.endTime} | [${s.type.toUpperCase()}] ${s.title}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedSchedule(true);
    setTimeout(() => setCopiedSchedule(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>AI Daily Schedule Architect</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Generates mathematically optimized, non-delusional daily schedules powered by Gemini.
          </p>
        </div>
      </div>

      {/* Input Parameters Card */}
      <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Step 1: Configure Your Daily Reality & Constraints</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {pendingTasks.length} pending candidate tasks available
          </span>
        </div>

        {/* Time Window & Rhythm Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Work Day Start
            </label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Hard Stop Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-slate-400" />
              Peak Energy Window
            </label>
            <select
              value={energyPeak}
              onChange={e => setEnergyPeak(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="morning">Morning (Early High Focus)</option>
              <option value="afternoon">Afternoon (Post-Lunch Peak)</option>
              <option value="evening">Evening (Night Flow State)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Focus Block Default
            </label>
            <select
              value={focusBlockMin}
              onChange={e => setFocusBlockMin(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value={25}>25 min (Standard Pomodoro)</option>
              <option value={45}>45 min (Academic Block)</option>
              <option value={50}>50 min (Deep Flow Session)</option>
              <option value={90}>90 min (Ultradian Cycle)</option>
            </select>
          </div>
        </div>

        {/* Task Selection Checklist */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Select Tasks to Fit into Today's Schedule:
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Select All
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                className="text-slate-500 hover:text-slate-300 font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {pendingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No pending tasks found. Create a few tasks to test the AI schedule generator!
              </p>
            ) : (
              pendingTasks.map(task => {
                const isSelected = selectedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTaskSelection(task.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-slate-900 border-indigo-500/40 text-white'
                        : 'bg-slate-900/40 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded accent-indigo-600 pointer-events-none"
                      />
                      <span className="font-semibold truncate">{task.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                          task.priority === 'high'
                            ? 'bg-rose-500/10 text-rose-300'
                            : task.priority === 'medium'
                            ? 'bg-amber-500/10 text-amber-300'
                            : 'bg-emerald-500/10 text-emerald-300'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {task.estimatedDuration}m
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Generate Plan Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end">
          <button
            onClick={generatePlan}
            disabled={isLoading || selectedTaskIds.length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing Schedule...' : 'Generate Intelligent Day Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* AI Schedule Output Presentation */}
      {aiPlan && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          {/* Executive Summary Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-[#0F1420] to-slate-900 border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">Schedule Strategic Rationale</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  Engine: {aiPlan.source === 'ai' ? 'Gemini 3.8 Flash' : 'Deterministic Heuristic'}
                </span>
                <button
                  onClick={handleCopySchedule}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-800 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy schedule to clipboard"
                >
                  {copiedSchedule ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSchedule ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              {aiPlan.summary}
            </p>

            {/* Tactical Tips */}
            {aiPlan.tips && aiPlan.tips.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
                {aiPlan.tips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-[11px] text-slate-300 border border-slate-800"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Realistic Conflicts / Deficits Section (Crucial requirement!) */}
          {aiPlan.conflicts && aiPlan.conflicts.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 shadow-lg space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Honest Schedule Overflow Warning ({aiPlan.conflicts.length} Task{aiPlan.conflicts.length > 1 ? 's' : ''} Deferred)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                LifeOS refuses to promise impossible cramming. These tasks exceed today's realistic window without compromising recovery time:
              </p>

              <div className="space-y-2 mt-2">
                {aiPlan.conflicts.map((conf, idx) => (
                  <div
                    key={conf.taskId || idx}
                    className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white">{conf.title}</span>
                      <span className="font-mono text-slate-400">{conf.durationMin}m needed</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{conf.reason}</p>
                    <p className="text-amber-300/90 text-[11px] font-medium">
                      💡 <strong>Actionable alternative:</strong> {conf.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Timeline Blocks */}
          <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Optimized Timeline Schedule</span>
              <span className="text-xs font-mono text-slate-400">
                {aiPlan.schedule.length} sequential blocks
              </span>
            </h3>

            <div className="space-y-2.5 pt-2">
              {aiPlan.schedule.map((block, idx) => {
                const isTask = block.type === 'task';
                const isBreak = block.type === 'break';
                const isBuffer = block.type === 'buffer';

                return (
                  <div
                    key={block.id || idx}
                    className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isTask
                        ? 'bg-slate-900/90 border-slate-700/80 hover:border-indigo-500/50'
                        : isBreak
                        ? 'bg-emerald-950/15 border-emerald-500/20 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                      {/* Time badge */}
                      <div className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-500/20 px-2 py-1 rounded-lg shrink-0">
                        {block.startTime} - {block.endTime}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-bold ${
                              isTask ? 'text-white' : isBreak ? 'text-emerald-300' : 'text-slate-300'
                            }`}
                          >
                            {block.title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-mono uppercase bg-slate-800 text-slate-400">
                            {block.type}
                          </span>
                          {block.priority && (
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded uppercase font-semibold ${
                                block.priority === 'high'
                                  ? 'bg-rose-500/10 text-rose-300'
                                  : 'bg-amber-500/10 text-amber-300'
                              }`}
                            >
                              {block.priority}
                            </span>
                          )}
                        </div>

                        {block.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {block.description}
                          </p>
                        )}

                        {block.reason && (
                          <p className="text-[10px] text-indigo-400/90 mt-0.5 italic">
                            Why: {block.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quick action button */}
                    <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-mono text-slate-500">
                        {block.durationMin}m
                      </span>
                      {isTask && (
                        <button
                          onClick={() => handleStartFocusFromBlock(block)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Start focus timer for this block"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start Block</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
