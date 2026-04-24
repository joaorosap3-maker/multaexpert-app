import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { CaseProvider } from '../contexts/CaseContext';
import { KnowledgeProvider } from '../contexts/KnowledgeContext';
import { LearningProvider } from '../contexts/LearningContext';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <CaseProvider>
        <KnowledgeProvider>
          <LearningProvider>
            {children}
          </LearningProvider>
        </KnowledgeProvider>
      </CaseProvider>
    </AuthProvider>
  );
}
