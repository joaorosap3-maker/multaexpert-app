import React, { createContext, useContext, useState, useEffect } from 'react';

export interface KnowledgeDocument {
  id: string;
  title: string;
  type: 'processo' | 'edital' | 'lei' | 'nulidade' | 'outro';
  content: string;
  category: string;
  date: string;
  tags: string[];
}

interface KnowledgeContextType {
  documents: KnowledgeDocument[];
  addDocument: (doc: Omit<KnowledgeDocument, 'id' | 'date'>) => void;
  deleteDocument: (id: string) => void;
  searchDocuments: (query: string) => KnowledgeDocument[];
}

const KnowledgeContext = createContext<KnowledgeContextType | undefined>(undefined);

const initialDocuments: KnowledgeDocument[] = [
  {
    id: '1',
    title: 'Resolução CONTRAN 798/2020',
    type: 'lei',
    content: 'Estabelece requisitos técnicos mínimos para a fiscalização da velocidade de veículos automotores... A aferição do radar deve ser feita anualmente pelo INMETRO.',
    category: 'Velocidade',
    date: '20/04/2026',
    tags: ['velocidade', 'radar', 'contran']
  },
  {
    id: '2',
    title: 'Modelo de Recurso - Embriaguez',
    type: 'processo',
    content: 'Argumentação sobre a nulidade do auto de infração por falta de descrição detalhada dos sinais de alteração da capacidade psicomotora...',
    category: 'Lei Seca',
    date: '21/04/2026',
    tags: ['lei seca', 'bafômetro', 'nulidade']
  }
];

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() => {
    const saved = localStorage.getItem('multaexpert_knowledge');
    return saved ? JSON.parse(saved) : initialDocuments;
  });

  useEffect(() => {
    localStorage.setItem('multaexpert_knowledge', JSON.stringify(documents));
  }, [documents]);

  const addDocument = (docData: Omit<KnowledgeDocument, 'id' | 'date'>) => {
    const newDoc: KnowledgeDocument = {
      ...docData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toLocaleDateString('pt-BR')
    };
    setDocuments(prev => [newDoc, ...prev]);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const searchDocuments = (query: string) => {
    const q = query.toLowerCase();
    return documents.filter(doc => 
      doc.title.toLowerCase().includes(q) || 
      doc.content.toLowerCase().includes(q) ||
      doc.tags.some(t => t.toLowerCase().includes(q))
    );
  };

  return (
    <KnowledgeContext.Provider value={{ documents, addDocument, deleteDocument, searchDocuments }}>
      {children}
    </KnowledgeContext.Provider>
  );
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (context === undefined) {
    throw new Error('useKnowledge must be used within a KnowledgeProvider');
  }
  return context;
}
