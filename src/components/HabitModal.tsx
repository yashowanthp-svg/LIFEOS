import React, { useState, useEffect } from 'react';
import { X, Flame, Trash2, CheckCircle2 } from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { HabitCategory, HabitFrequency } from '../types';

const CATEGORIES: HabitCategory[] = [
  'Focus',
  'Health',
  'Growth',
  'Mindfulness',
  'Discipline',
  'Creativity',
];

const COLORS = [
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Rose', hex: '#F43F5E' },
];

export const HabitModal: React.FC = () => {
  const {
    isHabitModalOpen,
    closeHabitModal,
    addHabit,
    updateHabit,
    deleteHabit,
    editingHabit,
  } = useLifeOS();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('Focus');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [color, setColor] = useState('#6366F1');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingHabit) {
      setTitle(editingHabit.title);
      setDescription(editingHabit.description || '');
      setCategory(editingHabit.category || 'Focus');
      setFrequency(editingHabit.frequency || 'daily');
      setColor(editingHabit.color || '#6366F1');
    } else {
      setTitle('');
      setDescription('');
      setCategory('Focus');
      setFrequency('daily');
      setColor('#6366F1');
    }
    setError('');
  }, [editingHabit, isHabitModalOpen]);

  if (!isHabitModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a habit title');
      return;
    }

    const targetDays = frequency === 'daily' ? 7 : frequency === 'weekdays' ? 5 : 2;

    if (editingHabit) {
      updateHabit(editingHabit.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        targetDaysPerWeek: targetDays,
        color,
      });
    } else {
      addHabit({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        frequency,
        targetDaysPerWeek: targetDays,
        color,
      });
    }

    closeHabitModal();
  };

  const handleDelete = () => {
    if (editingHabit) {
      deleteHabit(editingHabit.id);
      closeHabitModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0F1420] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            <h2 className="text-base font-bold text-white">
              {editingHabit ? 'Edit Habit' : 'Build a New Habit'}
            </h2>
          </div>
          <button
            onClick={closeHabitModal}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Habit Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. 2 Hours Focused Deep Work"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Routine / Cue / Reward (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="When I sit at my desk at 9 AM, I will put phone in drawer..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white placeholder-slate-500 text-sm outline-none transition-all resize-none"
            />
          </div>

          {/* Category & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as HabitCategory)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Frequency</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value as HabitFrequency)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="daily">Daily (7 days / wk)</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends only</option>
              </select>
            </div>
          </div>

          {/* Color Accent Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-slate-400" />
              Theme Accent
            </label>
            <div className="flex items-center gap-2.5">
              {COLORS.map(c => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => setColor(c.hex)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    color === c.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0F1420] scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {editingHabit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={closeHabitModal}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                style={{ backgroundColor: color }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{editingHabit ? 'Save Habit' : 'Track Habit'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
