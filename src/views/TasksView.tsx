import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  Tag,
  AlertCircle,
  Edit2,
  Trash2,
  Play,
  LayoutList,
  Columns,
  CheckSquare,
} from 'lucide-react';
import { useLifeOS } from '../context/LifeOSContext';
import { Task, Priority, TaskCategory, TaskStatus } from '../types';
import { formatDate } from '../utils/storage';

const CATEGORIES: ('All' | TaskCategory)[] = [
  'All',
  'Study',
  'Work',
  'Personal',
  'Health',
  'Finance',
  'Creative',
  'Tech',
];

export const TasksView: React.FC = () => {
  const {
    tasks,
    toggleTaskComplete,
    deleteTask,
    openTaskModal,
    setActiveTab,
    setSelectedFocusTask,
  } = useLifeOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'overdue'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'duration' | 'title'>('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const todayStr = formatDate(new Date());

  const overdueCount = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed' && t.dueDate < todayStr).length;
  }, [tasks, todayStr]);

  // Filter and Sort Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        const matchesCategory = task.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }

      // Status
      if (statusFilter === 'pending' && task.status !== 'pending') return false;
      if (statusFilter === 'completed' && task.status !== 'completed') return false;
      if (statusFilter === 'overdue' && (task.status === 'completed' || task.dueDate >= todayStr)) {
        return false;
      }

      // Priority
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

      // Category
      if (categoryFilter !== 'All' && task.category !== categoryFilter) return false;

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, todayStr]);

  const sortedTasks = useMemo(() => {
    const priorityWeight: Record<Priority, number> = { high: 3, medium: 2, low: 1 };

    return [...filteredTasks].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate + (a.dueTime || '00:00');
        const dateB = b.dueDate + (b.dueTime || '00:00');
        comparison = dateA.localeCompare(dateB);
      } else if (sortBy === 'priority') {
        comparison = priorityWeight[b.priority] - priorityWeight[a.priority];
      } else if (sortBy === 'duration') {
        comparison = (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
      } else if (sortBy === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTasks, sortBy, sortDirection]);

  // Kanban groups
  const kanbanPending = sortedTasks.filter(t => t.status === 'pending');
  const kanbanCompleted = sortedTasks.filter(t => t.status === 'completed');

  const handleStartFocus = (task: Task) => {
    setSelectedFocusTask(task.id);
    setActiveTab('focus');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            <span>Task Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Organize, prioritize, and execute your academic and professional workload.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View mode toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kanban Board view"
            >
              <Columns className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => openTaskModal()}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Overdue alert banner if any */}
      {overdueCount > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-rose-300 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              You have <strong className="font-semibold text-rose-200">{overdueCount} overdue task{overdueCount > 1 ? 's' : ''}</strong> that need urgent attention or rescheduling.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('overdue')}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Filter Overdue
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0F1420] border border-slate-800 shadow-lg space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or tag..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 focus:border-indigo-500 text-white placeholder-slate-500 text-xs outline-none transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Status: All Tasks</option>
              <option value="pending">Status: Pending Only</option>
              <option value="completed">Status: Completed Only</option>
              <option value="overdue">Status: Overdue Deadlines</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Priority: All Levels</option>
              <option value="high">Priority: High Only</option>
              <option value="medium">Priority: Medium Only</option>
              <option value="low">Priority: Low Only</option>
            </select>
          </div>
        </div>

        {/* Secondary Category Pills & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mr-1">
              Category:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="duration">Duration</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 font-mono text-[11px] px-2"
              title="Toggle sort direction"
            >
              {sortDirection === 'asc' ? 'Asc' : 'Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Task Content: List View vs Kanban View */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#0F1420] border border-slate-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-500 mx-auto flex items-center justify-center">
                <CheckSquare className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-white">No tasks match your filter criteria</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try adjusting your search terms or filter selections, or create a new task.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setPriorityFilter('all');
                  setCategoryFilter('All');
                }}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            sortedTasks.map(task => {
              const isOverdue = task.status !== 'completed' && task.dueDate < todayStr;
              const isDueToday = task.dueDate === todayStr;
              const isCompleted = task.status === 'completed';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                    isCompleted
                      ? 'bg-[#0B0F17]/60 border-slate-800/60 opacity-60'
                      : isOverdue
                      ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-[#0F1420] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className={`mt-0.5 transition-colors cursor-pointer shrink-0 ${
                        isCompleted
                          ? 'text-emerald-400'
                          : 'text-slate-500 hover:text-emerald-400'
                      }`}
                      title={isCompleted ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    {/* Task Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-sm font-semibold text-white break-words ${
                            isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isSample && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-medium">
                            Sample
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2.5 mt-2 text-[11px] text-slate-400 flex-wrap">
                        {/* Priority Badge */}
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

                        {/* Category */}
                        <span className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300">
                          {task.category}
                        </span>

                        {/* Duration */}
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3 h-3" />
                          {task.estimatedDuration}m
                        </span>

                        {/* Due Date Indicator */}
                        <span
                          className={`flex items-center gap-1 font-medium ${
                            isOverdue
                              ? 'text-rose-400 font-semibold'
                              : isDueToday
                              ? 'text-amber-300 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          <Calendar className="w-3 h-3" />
                          {isOverdue ? 'Overdue: ' : isDueToday ? 'Due Today: ' : 'Due: '}
                          {task.dueDate}
                          {task.dueTime ? ` @ ${task.dueTime}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {!isCompleted && (
                      <button
                        onClick={() => handleStartFocus(task)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Start focus timer on this task"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Focus</span>
                      </button>
                    )}

                    <button
                      onClick={() => openTaskModal(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit task"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban Column View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Pending */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <h3 className="text-sm font-bold text-white">Pending Action Items</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {kanbanPending.length}
              </span>
            </div>

            <div className="space-y-3">
              {kanbanPending.map(task => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-[#0F1420] border border-slate-800 hover:border-slate-700 shadow-md space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-white break-words">
                      {task.title}
                    </span>
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-slate-500 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                        task.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-300'
                          : task.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      onClick={() => handleStartFocus(task)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{task.estimatedDuration}m</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Completed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="text-sm font-bold text-white">Completed</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                {kanbanCompleted.length}
              </span>
            </div>

            <div className="space-y-3">
              {kanbanCompleted.map(task => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-[#0B0F17]/70 border border-slate-800/60 opacity-60 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-400 line-through break-words">
                      {task.title}
                    </span>
                    <button
                      onClick={() => toggleTaskComplete(task.id)}
                      className="text-emerald-400 cursor-pointer shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500/20" />
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Done • {task.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
