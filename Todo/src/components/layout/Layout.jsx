import { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../views/Dashboard';
import Tasks from '../views/Tasks';
import Pomodoro from '../views/Pomodoro';
import Notes from '../views/Notes';
import Expenses from '../views/Expenses';
import Settings from '../views/Settings';

const TITLES = {
  dashboard: 'Dashboard Overview',
  tasks: 'Task Manager',
  pomodoro: 'Focus Timer',
  notes: 'Personal Notes',
  expenses: 'Expense Tracker',
  settings: 'System Settings',
};

export default function Layout() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden relative bg-transparent text-app-main font-body transition-colors duration-300">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        <Header currentTitle={TITLES[currentView]} />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 pb-24 md:pb-8 relative scroll-smooth w-full">
          <div className="max-w-6xl mx-auto h-full">
            {currentView === 'dashboard' && <Dashboard setView={setCurrentView} />}
            {currentView === 'tasks' && <Tasks />}
            {currentView === 'pomodoro' && <Pomodoro />}
            {currentView === 'notes' && <Notes />}
            {currentView === 'expenses' && <Expenses />}
            {currentView === 'settings' && <Settings />}
          </div>
        </main>
      </div>
    </div>
  );
}
