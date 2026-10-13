import React from 'react';
import { LifeOSProvider, useLifeOS } from './context/LifeOSContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';
import { HabitModal } from './components/HabitModal';
import { DashboardView } from './views/DashboardView';
import { TasksView } from './views/TasksView';
import { HabitsView } from './views/HabitsView';
import { FocusView } from './views/FocusView';
import { AIPlannerView } from './views/AIPlannerView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab } = useLifeOS();

  return (
    <div className="flex h-screen bg-[#090D16] text-slate-100 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic View Scrollable Container */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 pb-24 md:pb-12">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'tasks' && <TasksView />}
          {activeTab === 'habits' && <HabitsView />}
          {activeTab === 'focus' && <FocusView />}
          {activeTab === 'planner' && <AIPlannerView />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal />
      <HabitModal />
    </div>
  );
};

export default function App() {
  return (
    <LifeOSProvider>
      <MainLayout />
    </LifeOSProvider>
  );
}
