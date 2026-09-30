import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { AiAssistantDrawer } from '../components/ai/AiAssistantDrawer';
import { GuidedDemoTour } from '../components/common/GuidedDemoTour';

export const AppLayout: React.FC = () => {
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-primary overflow-x-hidden">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <div className="ambient-top-accent" />
        <Header 
          onOpenAiAssistant={() => setIsAiDrawerOpen(true)} 
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
        />

        <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-7xl w-full mx-auto page-enter-animation">
          <Outlet />
        </main>
      </div>

      {/* AI Management Assistant Slide-over */}
      <AiAssistantDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />

      {/* Interactive Hackathon Video & Demo Tour */}
      <GuidedDemoTour
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onOpenAiAssistant={() => setIsAiDrawerOpen(true)}
      />
    </div>
  );
};
