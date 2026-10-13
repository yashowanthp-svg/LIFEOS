import React, { useState, useRef } from 'react';
import {
  SlidersHorizontal,
  User,
  Clock,
  Timer,
  Volume2,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ShieldCheck,
  Check,
  HardDrive,
  Sparkles,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { soundFx } from '../utils/audio';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    tasks,
    habits,
    focusSessions,
    resetSampleData,
    clearAllData,
  } = useLifeOS();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    soundFx.playCompletionChime();
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportJSON = () => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks,
      habits,
      focusSessions,
      settings,
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundFx.playCompletionChime();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          localStorage.setItem('lifeos_tasks_v1', JSON.stringify(parsed.tasks));
        }
        if (parsed.habits && Array.isArray(parsed.habits)) {
          localStorage.setItem('lifeos_habits_v1', JSON.stringify(parsed.habits));
        }
        if (parsed.focusSessions && Array.isArray(parsed.focusSessions)) {
          localStorage.setItem('lifeos_focus_v1', JSON.stringify(parsed.focusSessions));
        }
        if (parsed.settings) {
          localStorage.setItem('lifeos_settings_v1', JSON.stringify(parsed.settings));
        }
        window.location.reload();
      } catch (err) {
        alert('Invalid JSON backup file structure.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
            <span>Preferences & Data Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Customize your schedule defaults, sound triggers, and manage full data exports.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-3">
            <User className="w-4 h-4 text-indigo-400" />
            <span>User Identity & Title</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Your Preferred Name
              </label>
              <input
                type="text"
                value={settings.userName}
                onChange={e => updateSettings({ userName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Role / Focus Title
              </label>
              <input
                type="text"
                value={settings.userRole}
                onChange={e => updateSettings({ userRole: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white text-xs outline-none"
              />
            </div>
          </div>
        </div>

        {/* Schedule & Focus Defaults */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-3">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>Productivity Hours & Interval Defaults</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Work Start
              </label>
              <input
                type="time"
                value={settings.workStart}
                onChange={e => updateSettings({ workStart: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Daily Work End
              </label>
              <input
                type="time"
                value={settings.workEnd}
                onChange={e => updateSettings({ workEnd: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-mono text-xs outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Pomodoro Duration
              </label>
              <select
                value={settings.pomodoroMin}
                onChange={e => updateSettings({ pomodoroMin: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
              >
                <option value={20}>20 minutes</option>
                <option value={25}>25 minutes (Standard)</option>
                <option value={45}>45 minutes</option>
                <option value={50}>50 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Energy Peak Rhythm
              </label>
              <select
                value={settings.peakEnergy}
                onChange={e => updateSettings({ peakEnergy: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500"
              >
                <option value="morning">Morning (Early Focus)</option>
                <option value="afternoon">Afternoon (Post-Lunch)</option>
                <option value="evening">Evening (Night Owl)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio and Feedback Defaults */}
        <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800/80 pb-3">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Sound & Feedback Preferences</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <span className="text-xs font-semibold text-white block">
                Completion Chimes & Gong
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Play pleasant synthesized chords when tasks are completed or focus sessions conclude.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !settings.soundEnabled;
                updateSettings({ soundEnabled: next });
                if (next) soundFx.playCompletionChime();
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                settings.soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {settings.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>

      {/* Storage and Data Governance Section */}
      <div className="p-5 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
            <HardDrive className="w-4 h-4 text-cyan-400" />
            <span>Data Persistence & Governance</span>
          </div>
          <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Local Offline Persistence Active</span>
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          All your tasks, habit history, focus sessions, and configuration are persisted immediately to your browser's persistent storage. You can back up your entire LifeOS workspace as JSON or import an existing backup anytime.
        </p>

        {/* Export / Import / Reset / Clear Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Import JSON Backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />

          <button
            type="button"
            onClick={resetSampleData}
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Reset Demo Data</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Clear all tasks, habits, and focus logs? You will start with a blank workspace.')) {
                clearAllData();
              }
            }}
            className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
