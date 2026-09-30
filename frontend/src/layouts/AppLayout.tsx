import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { AiAssistantDrawer } from '../components/ai/AiAssistantDrawer';

export const AppLayout: React.FC = () => {
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-primary">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="ambient-top-accent" />
        <Header onOpenAiAssistant={() => setIsAiDrawerOpen(true)} />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto page-enter-animation">
          <Outlet />
        </main>
      </div>

      {/* AI Management Assistant Slide-over */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
};
