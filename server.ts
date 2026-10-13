import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const geminiApiKey = process.env.GEMINI_API_KEY;
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Heuristic fallback planner when API key is not present or API call fails
function generateHeuristicPlan(payload: any) {
  const {
    tasks = [],
    startTime = '09:00',
    endTime = '17:30',
    focusBlockMin = 25,
    breakMin = 5,
    energyPeak = 'morning',
  } = payload;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const totalAvailableMin = Math.max(60, (endH * 60 + endM) - (startH * 60 + startM));

  // Sort tasks by priority (high > medium > low) and estimated duration
  const priorityWeight: Record<string, number> = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...tasks].sort((a: any, b: any) => {
    const pw = (priorityWeight[b.priority] || 1) - (priorityWeight[a.priority] || 1);
    if (pw !== 0) return pw;
    return (a.estimatedDuration || 30) - (b.estimatedDuration || 30);
  });

  const schedule: any[] = [];
  const conflicts: any[] = [];
  let currentMinFromStart = 0;
  let pomodoroCounter = 0;

  // Add 15 min morning planning buffer if start is morning
  let currTimeMinutes = startH * 60 + startM;

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Kickoff slot
  schedule.push({
    id: 'block-kickoff',
    startTime: formatTime(currTimeMinutes),
    endTime: formatTime(currTimeMinutes + 15),
    type: 'buffer',
    title: 'Daily Alignment & Mindset Kickoff',
    description: 'Review top goals, clear physical workspace, prepare water & focus playlist.',
    durationMin: 15,
  });
  currTimeMinutes += 15;
  currentMinFromStart += 15;

  for (const task of sortedTasks) {
    const duration = Math.min(180, Math.max(15, Number(task.estimatedDuration) || 30));
    
    // Check if task fits in remaining window (reserving 15 min wind-down)
    if (currTimeMinutes + duration > (endH * 60 + endM) - 15) {
      conflicts.push({
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        durationMin: duration,
        reason: 'Exceeds today\'s available work window without compromising recovery time.',
        recommendation: task.priority === 'high' 
          ? 'Delegate lower-priority tasks or extend schedule by 45 minutes.' 
          : 'Schedule as top priority tomorrow morning.',
      });
      continue;
    }

    // Schedule task
    const taskStart = currTimeMinutes;
    const taskEnd = currTimeMinutes + duration;
    schedule.push({
      id: `block-task-${task.id}`,
      taskId: task.id,
      startTime: formatTime(taskStart),
      endTime: formatTime(taskEnd),
      type: 'task',
      title: task.title,
      description: task.description || `${task.category || 'Focus'} deep work session`,
      priority: task.priority,
      category: task.category,
      durationMin: duration,
      reason: task.priority === 'high' ? 'High impact item scheduled during peak mental clarity.' : 'Standard operational block.',
    });
    currTimeMinutes = taskEnd;
    pomodoroCounter++;

    // Add breaks
    if (currTimeMinutes < (endH * 60 + endM) - 25) {
      const isLongBreak = pomodoroCounter % 3 === 0;
      const breakDuration = isLongBreak ? Math.max(15, breakMin * 2) : breakMin;
      const breakTitle = isLongBreak ? 'Deep Recharge & Hydration' : 'Short Eye & Posture Reset';
      
      schedule.push({
        id: `block-break-${schedule.length}`,
        startTime: formatTime(currTimeMinutes),
        endTime: formatTime(currTimeMinutes + breakDuration),
        type: 'break',
        title: breakTitle,
        description: isLongBreak 
          ? 'Step away from screen, hydrate, stretch, or take a brisk walk.' 
          : 'Breathe deeply, 20-20-20 eye rest rule, shake out hands.',
        durationMin: breakDuration,
      });
      currTimeMinutes += breakDuration;
    }
  }

  // Wrap up block
  if (currTimeMinutes < (endH * 60 + endM)) {
    schedule.push({
      id: 'block-winddown',
      startTime: formatTime(currTimeMinutes),
      endTime: formatTime(endH * 60 + endM),
      type: 'buffer',
      title: 'Daily Review & Shutdown Routine',
      description: 'Log completed tasks, update habit streaks, clear inbox, shutdown work station.',
      durationMin: (endH * 60 + endM) - currTimeMinutes,
    });
  }

  const scheduledTasksCount = schedule.filter(s => s.type === 'task').length;
  const totalFocusMin = schedule.filter(s => s.type === 'task').reduce((acc, s) => acc + s.durationMin, 0);

  return {
    schedule,
    conflicts,
    summary: `Organized ${scheduledTasksCount} tasks totaling ${Math.round(totalFocusMin / 60 * 10) / 10} hours of high-leverage focus. High priority work is sequenced early to capitalize on your ${energyPeak} energy peak.`,
    tips: [
      'Front-load hardest deep work: eliminate distractions during the first 90 minutes.',
      'Protect scheduled micro-breaks to avoid late-afternoon cognitive fatigue.',
      'If an unexpected meeting occurs, sacrifice low-priority buffer blocks first.',
    ],
    source: 'heuristic',
  };
}

// Heuristic daily brief fallback
function generateHeuristicBrief(tasks: any[] = [], habits: any[] = []) {
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const highPriority = pendingTasks.filter(t => t.priority === 'high');
  const todayStr = new Date().toISOString().split('T')[0];
  const pendingHabits = habits.filter(h => !(h.completedDates || []).includes(todayStr));

  let greeting = 'Let\'s make meaningful progress today.';
  if (highPriority.length > 0) {
    greeting = `You have ${highPriority.length} high-leverage objective${highPriority.length > 1 ? 's' : ''} to conquer today. Guard your peak focus hours.`;
  } else if (pendingTasks.length > 0) {
    greeting = `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''}. Steady, uninterrupted momentum will carry you through.`;
  } else {
    greeting = 'Outstanding! All active tasks are clear. Perfect time for deliberate habit building or deep learning.';
  }

  const topPriorities = pendingTasks.slice(0, 3).map(t => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    estimatedDuration: t.estimatedDuration || 30,
  }));

  const habitFocus = pendingHabits.length > 0 
    ? `Maintain momentum: Log your "${pendingHabits[0].title}" habit before evening.`
    : 'All habits completed for today! Keep the winning streak alive.';

  return {
    greeting,
    topPriorities,
    habitFocus,
    energyTip: 'Batch similar communication tasks together and protect uninterrupted 25-minute deep work blocks.',
    quote: 'Focus is not about doing more; it is about eliminating what does not matter.',
    source: 'heuristic',
  };
}

// POST /api/plan
app.post('/api/plan', async (req, res) => {
  const payload = req.body || {};
  const {
    tasks = [],
    startTime = '09:00',
    endTime = '17:30',
    focusBlockMin = 25,
    breakMin = 5,
    energyPeak = 'morning',
    prioritizeDeadlines = true,
  } = payload;

  if (!ai) {
    const fallback = generateHeuristicPlan(payload);
    return res.json(fallback);
  }

  try {
    const prompt = `
You are an expert productivity architect in LifeOS. Generate a realistic, hyper-actionable daily schedule.

User Constraints:
- Work Day Window: ${startTime} to ${endTime}
- Preferred Focus Block Length: ${focusBlockMin} minutes
- Preferred Short Break: ${breakMin} minutes
- Natural Energy Peak: ${energyPeak}
- Prioritize Tight Deadlines: ${prioritizeDeadlines}

Pending Tasks List:
${JSON.stringify(tasks.map((t: any) => ({
  id: t.id,
  title: t.title,
  priority: t.priority,
  durationMin: t.estimatedDuration || 30,
  dueDate: t.dueDate || 'None',
  category: t.category || 'General',
})))}

Rules:
1. Schedule high priority tasks during peak energy (${energyPeak}) and earlier in the day.
2. Insert realistic 5-15 minute breaks between demanding blocks to prevent burnout.
3. Include a 15-minute start-of-day alignment and an end-of-day review/shutdown buffer.
4. Total time MUST NOT exceed the window (${startTime} to ${endTime}).
5. If tasks do NOT fit in the available time, DO NOT cram them impossibly! Put them in the "conflicts" array with candid, realistic explanations and actionable recommendations.
6. Provide an insightful summary explaining the rationale for the schedule order and 3 punchy productivity tips.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'Executive explanation of the schedule layout and sequencing logic.',
            },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  taskId: { type: Type.STRING, description: 'Corresponding task id if type is task' },
                  startTime: { type: Type.STRING, description: 'HH:MM format' },
                  endTime: { type: Type.STRING, description: 'HH:MM format' },
                  type: { type: Type.STRING, description: 'task | break | buffer' },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  category: { type: Type.STRING },
                  durationMin: { type: Type.INTEGER },
                  reason: { type: Type.STRING, description: 'Why placed at this time' },
                },
                required: ['id', 'startTime', 'endTime', 'type', 'title', 'durationMin'],
              },
            },
            conflicts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  durationMin: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                  recommendation: { type: Type.STRING },
                },
                required: ['taskId', 'title', 'reason', 'recommendation'],
              },
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['summary', 'schedule', 'conflicts', 'tips'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      source: 'ai',
    });
  } catch (error) {
    console.error('Gemini planning generation failed, falling back to heuristic:', error);
    const fallback = generateHeuristicPlan(payload);
    return res.json(fallback);
  }
});

// POST /api/daily-brief
app.post('/api/daily-brief', async (req, res) => {
  const { tasks = [], habits = [] } = req.body || {};

  if (!ai) {
    const fallback = generateHeuristicBrief(tasks, habits);
    return res.json(fallback);
  }

  try {
    const prompt = `
You are the AI Executive Coach inside LifeOS. Analyze the user's current productivity status and generate a sharp, motivating morning brief.

Current Status:
- Pending Tasks: ${JSON.stringify(tasks.filter((t: any) => t.status !== 'completed').map((t: any) => ({
  title: t.title,
  priority: t.priority,
  durationMin: t.estimatedDuration || 30,
  category: t.category,
  dueDate: t.dueDate,
})))}
- Habit Streaks: ${JSON.stringify(habits.map((h: any) => ({
  title: h.title,
  completedDatesCount: (h.completedDates || []).length,
})))}

Generate:
1. An encouraging, professional executive greeting tailored to their current workload.
2. Top 3 priority focus tasks to tackle first.
3. A habit focus message reminding them to maintain an active streak.
4. One high-performance energy or focus strategy tip.
5. An inspiring, grounded quote on discipline or mastery.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            topPriorities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  estimatedDuration: { type: Type.INTEGER },
                },
                required: ['title', 'priority'],
              },
            },
            habitFocus: { type: Type.STRING },
            energyTip: { type: Type.STRING },
            quote: { type: Type.STRING },
          },
          required: ['greeting', 'topPriorities', 'habitFocus', 'energyTip', 'quote'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      ...parsed,
      source: 'ai',
    });
  } catch (error) {
    console.error('Gemini daily brief failed, using heuristic:', error);
    const fallback = generateHeuristicBrief(tasks, habits);
    return res.json(fallback);
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiEnabled: Boolean(geminiApiKey),
    time: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeOS server running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start LifeOS server:', err);
  process.exit(1);
});
