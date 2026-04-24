import React, { createContext, useContext, useState, useEffect } from 'react';

export interface LearnedCase {
  id: string;
  caseType: string;
  finalContent: string;
  keywords: string[];
  date: string;
  organ: string;
}

interface LearningContextType {
  learnedCases: LearnedCase[];
  learnFromCase: (caseData: Omit<LearnedCase, 'id' | 'date'>) => void;
  getRelevantLearnings: (caseType: string, organ: string) => LearnedCase[];
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [learnedCases, setLearnedCases] = useState<LearnedCase[]>(() => {
    const saved = localStorage.getItem('multaexpert_learning');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('multaexpert_learning', JSON.stringify(learnedCases));
  }, [learnedCases]);

  const learnFromCase = (caseData: Omit<LearnedCase, 'id' | 'date'>) => {
    const newLearning: LearnedCase = {
      ...caseData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR')
    };
    
    // Avoid duplicates for basically the same content
    setLearnedCases(prev => {
      const exists = prev.some(l => l.caseType === caseData.caseType && l.organ === caseData.organ && l.finalContent === caseData.finalContent);
      if (exists) return prev;
      return [newLearning, ...prev].slice(0, 50); // Keep last 50 learnings
    });
  };

  const getRelevantLearnings = (caseType: string, organ: string) => {
    return learnedCases.filter(l => 
      l.caseType === caseType || 
      l.organ === organ
    ).slice(0, 3);
  };

  return (
    <LearningContext.Provider value={{ learnedCases, learnFromCase, getRelevantLearnings }}>
      {children}
    </LearningContext.Provider>
  );
}

export function useLearning() {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
}
