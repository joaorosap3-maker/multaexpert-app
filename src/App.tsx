import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import Pipeline from './pages/Pipeline';
import Services from './pages/Services';
import Precedents from './pages/Precedents';
import Processes from './pages/Processes';
import NewLeadModal from './components/modals/NewLeadModal';
import { useAuth } from './context/AuthContext';
import { Providers } from './providers/Providers';
import Login from './components/auth/Login';
import KnowledgeBase from './pages/KnowledgeBase';
import { Toaster } from 'sonner';

function MainApp() {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-premium">
      <Sidebar />
      
      <div className="pl-[280px]">
        <TopBar onOpenNewLead={() => setIsLeadModalOpen(true)} />
        <main className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pipeline" element={<Pipeline />} />
            <Route path="/processes" element={<Processes />} />
            <Route path="/services" element={<Services />} />
            <Route path="/precedents" element={<Precedents />} />
            <Route path="/knowledge-base" element={<KnowledgeBase />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
      
      <NewLeadModal 
        isOpen={isLeadModalOpen} 
        onClose={() => setIsLeadModalOpen(false)} 
      />
      <Toaster 
        position="top-right" 
        richColors 
        theme="dark" 
        toastOptions={{
          className: 'balanced rounded-2xl border border-white/10 backdrop-blur-xl bg-surface-container/80 shadow-2xl',
        }}
      />
    </div>
  );
}

function AuthWrapper() {
  const { user, loading } = useAuth();

  // Loading inicial para evitar tela piscando
  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-container/20 border-t-primary-container rounded-full animate-spin"></div>
          <p className="text-on-surface-variant text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, mostrar página de login
  if (!user) {
    return (
      <>
        <Login />
        <Toaster position="top-right" richColors theme="dark" />
      </>
    );
  }

  // Se estiver logado, mostrar o app
  return <MainApp />;
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <AuthWrapper />
      </BrowserRouter>
    </Providers>
  );
}
