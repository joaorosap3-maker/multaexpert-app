import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

export interface HistoryItem {
  id: string;
  date: string;
  action: string;
  description: string;
}

export interface Billing {
  id: string;
  serviceId: number | 'manual';
  description: string;
  value: number;
  date: string;
  status: 'Pendente' | 'Pago' | 'Cancelado' | 'Atrasado';
}

export interface Service {
  id: number;
  title: string;
  category: string;
  desc: string;
  price: number;
  billingType: 'unitário' | 'pacote' | 'recorrente';
  targetAudience: 'Motoboy' | 'Motorista de App' | 'Cliente Comum';
  priority: string;
  sla: string;
  color: string;
  duration?: string;
  includes: {
    documents: boolean;
    support: 'Email' | 'WhatsApp' | '24/7' | 'Nenhum';
    resourcesQuantity: number;
  };
  upsellServiceId?: number;
  offerTrigger?: string;
  recurrenceInfo?: {
    monthlyValue: number;
    interval: string;
  };
  packageInfo?: {
    quantity: number;
  };
}

export interface CaseDocument {
  id: string;
  name: string;
  type: 'CNH' | 'CRLV' | 'Multa' | 'Outros' | 'Contrato' | 'Procuração' | 'Defesa';
  uploadDate: string;
  size: string;
  url: string;
}

export interface GenerationEntry {
  id: string;
  type: string;
  date: string;
  content: string;
  summary?: string;
}

export interface Case {
  id: string;
  name: string; // Used as display name (Proprietário)
  ownerName: string;
  driverName: string;
  address: string;
  autoNumber: string;
  infractionDate: string;
  infractionDescription: string;
  legalBase: string;
  phone: string;
  infractionType: string;
  plate: string;
  column: string; // start | analysis | closing | payment
  priority: string; // Urgente | Padrão | Crítica | Média | Alta
  time: string;
  date: string;
  avatar: string | null;
  observations?: string;
  comments?: number;
  status: string;
  court: string;
  completion: number;
  outcome?: 'deferred' | 'denied';
  appliedThesisId?: string;
  appliedThesisTitle?: string;
  history?: HistoryItem[];
  billings?: Billing[];
  linkedServiceIds?: number[];
  documents?: CaseDocument[];
  generations?: GenerationEntry[];
}

interface CaseContextType {
  cases: Case[];
  services: Service[];
  addCase: (newCase: Omit<Case, 'id' | 'date' | 'column' | 'status' | 'completion' | 'court'>) => Promise<void>;
  updateCase: (id: string, updatedCase: Partial<Case>) => void;
  deleteCase: (id: string) => void;
  addService: (newService: Omit<Service, 'id'>) => void;
  linkServiceToCase: (caseId: string, serviceId: number) => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

// Initial Mock Services
const initialServices: Service[] = [
  {
    id: 1,
    title: 'Recurso JARI - 1ª Instância',
    category: 'Administrativo',
    desc: 'Elaboração de recurso fundamentado para a Junta Administrativa de Recursos de Infrações contra penalidades de trânsito.',
    price: 250.00,
    billingType: 'unitário',
    targetAudience: 'Cliente Comum',
    priority: 'Alta',
    sla: '5 dias úteis',
    color: 'blue',
    includes: {
      documents: true,
      support: 'Email',
      resourcesQuantity: 1
    },
    upsellServiceId: 2,
    offerTrigger: 'Após indeferimento 1ª instância'
  },
  {
    id: 2,
    title: 'Cassação de CNH',
    category: 'Defesa CNH',
    desc: 'Defesa especializada para processos de cassação do direito de dirigir, focando em nulidades processuais e prescrição.',
    price: 1200.00,
    billingType: 'unitário',
    targetAudience: 'Cliente Comum',
    priority: 'Crítica',
    sla: '12 dias úteis',
    color: 'amber',
    includes: {
      documents: true,
      support: 'WhatsApp',
      resourcesQuantity: 3
    }
  },
  {
    id: 3,
    title: 'Assinatura Mensal - Motoboy',
    category: 'Recorrência',
    desc: 'Proteção jurídica mensal para motoboys. Inclui até 2 recursos por mês e monitoramento de prontuário.',
    price: 49.90,
    billingType: 'recorrente',
    targetAudience: 'Motoboy',
    recurrenceInfo: { monthlyValue: 49.90, interval: 'Mensal' },
    priority: 'Média',
    sla: '48 horas',
    color: 'emerald',
    duration: '12 meses',
    includes: {
      documents: true,
      support: '24/7',
      resourcesQuantity: 24
    }
  },
  {
    id: 4,
    title: 'Pacote 10 Recursos - App',
    category: 'Pacote',
    desc: 'Pacote pré-pago exclusivo para motoristas de aplicativo. Recursos ilimitados para infrações leves e médias.',
    price: 399.00,
    billingType: 'pacote',
    targetAudience: 'Motorista de App',
    packageInfo: { quantity: 10 },
    priority: 'Alta',
    sla: '3 dias úteis',
    color: 'indigo',
    includes: {
      documents: true,
      support: 'WhatsApp',
      resourcesQuantity: 10
    }
  },
  {
    id: 5,
    title: 'Defesa Lei Seca',
    category: 'Defesa CNH',
    desc: 'Especialista em anulação de multas de bafômetro e recusa, com foco em erros de procedimento e calibração.',
    price: 1800.00,
    billingType: 'unitário',
    targetAudience: 'Cliente Comum',
    priority: 'Crítica',
    sla: '15 dias úteis',
    color: 'rose',
    includes: {
      documents: true,
      support: 'WhatsApp',
      resourcesQuantity: 3
    }
  }
];

// Initial Mock Data
const initialCases: Case[] = [
  { 
    id: 'LE-9042', 
    column: 'start', 
    priority: 'Urgente', 
    name: 'Carlos Alberto Oliveira', 
    ownerName: 'Carlos Alberto Oliveira',
    driverName: 'Carlos Alberto Oliveira',
    address: 'Av. Paulista, 1000 - SP',
    autoNumber: '1B234567-8',
    infractionDate: '12/05/2026',
    infractionDescription: '745-50 - Velocidade superior à máxima permitida em até 20%',
    legalBase: 'CTB Artigo 218, I',
    phone: '(11) 98765-4321',
    plate: 'ABC-1234', 
    infractionType: 'Velocidade',
    time: '2h atrás',
    date: '22/04/2026',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=64&h=64',
    status: 'Em Análise',
    court: 'DETRAN/SP',
    completion: 65,
    documents: [
      {
        id: 'doc1',
        name: 'CNH_Digital_Carlos.pdf',
        type: 'CNH',
        uploadDate: '22/04/2026',
        size: '1.2 MB',
        url: '#'
      },
      {
        id: 'doc2',
        name: 'Notificacao_Multa_1B23.jpg',
        type: 'Multa',
        uploadDate: '22/04/2026',
        size: '850 KB',
        url: '#'
      }
    ]
  },
  { 
    id: 'LE-8911', 
    column: 'analysis', 
    priority: 'Alta', 
    name: 'Roberto Ferreira Jr.', 
    ownerName: 'Roberto Ferreira Jr.',
    driverName: 'Desconhecido',
    address: 'Rua das Flores, 123 - RJ',
    autoNumber: '9Z987654-2',
    infractionDate: '10/05/2026',
    infractionDescription: 'Lei Seca - Dirigir sob influência de álcool',
    legalBase: 'CTB Artigo 165',
    phone: '(21) 99887-7665',
    plate: 'XYZ-5678', 
    infractionType: 'Lei Seca',
    time: 'Análise IA',
    date: '21/04/2026',
    observations: '"Aguardando CNH digital para verificação de pontuação."',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=64&h=64',
    comments: 3,
    status: 'Petição Gerada',
    court: 'CETRAN/RJ',
    completion: 85
  },
  { 
    id: 'LE-8842', 
    column: 'awaiting_client', 
    priority: 'Padrão', 
    name: 'Beatriz Mendes', 
    ownerName: 'Beatriz Mendes',
    driverName: 'Beatriz Mendes',
    address: 'Não extraído',
    autoNumber: '5X432109-0',
    infractionDate: '05/05/2026',
    infractionDescription: 'Avançar sinal vermelho',
    legalBase: 'CTB Artigo 208',
    phone: '(31) 97766-5544',
    plate: 'JKL-4321', 
    infractionType: 'Suspensão CNH',
    time: '1 dia atrás',
    date: '20/04/2026',
    avatar: null,
    status: 'Em Julgamento',
    court: 'DETRAN/SP',
    completion: 78
  }
];

// Helper functions to convert lead data to Case format
const getColumnFromStageId = (stageId: number): string => {
  // Map stage_id to column names used by the UI
  const stageMapping: { [key: number]: string } = {
    1: 'start',
    2: 'analysis', 
    3: 'in_progress',
    4: 'proposal_sent',
    5: 'awaiting_client',
    6: 'completed'
  };
  return stageMapping[stageId] || 'start';
};

const getTimeFromCreatedAt = (createdAt: string): string => {
  const now = new Date();
  const created = new Date(createdAt);
  const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Agora';
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  if (diffInHours < 48) return 'Ontem';
  return `${Math.floor(diffInHours / 24)} dias atrás`;
};

const formatDateFromCreatedAt = (createdAt: string): string => {
  return new Date(createdAt).toLocaleDateString('pt-BR');
};

const getStatusFromStageId = (stageId: number): string => {
  const statusMapping: { [key: number]: string } = {
    1: 'Entrada',
    2: 'Em Análise',
    3: 'Em Andamento', 
    4: 'Proposta Enviada',
    5: 'Aguardando Cliente',
    6: 'Concluído'
  };
  return statusMapping[stageId] || 'Entrada';
};

const getCompletionFromStageId = (stageId: number): number => {
  const completionMapping: { [key: number]: number } = {
    1: 10,
    2: 35,
    3: 55,
    4: 75,
    5: 85,
    6: 100
  };
  return completionMapping[stageId] || 10;
};

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('multaexpert_services');
    return saved ? JSON.parse(saved) : initialServices;
  });

  // Fetch leads from Supabase and convert to Case format
  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return;

      try {
        // Get user's company_id
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();

        const companyId = userData?.company_id;

        // Fetch leads from Supabase
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false });

        // Convert leads to Case format
        const convertedCases: Case[] = (leadsData || []).map(lead => ({
          id: lead.id,
          column: lead.stage_id ? getColumnFromStageId(lead.stage_id) : 'start',
          priority: lead.priority || 'Padrão',
          name: lead.name || 'Nome não informado',
          ownerName: lead.owner_name || lead.name || 'Nome não informado',
          driverName: lead.driver_name || lead.name || 'Nome não informado',
          address: lead.address || 'Endereço não informado',
          autoNumber: lead.auto_number || '',
          infractionDate: lead.infraction_date || '',
          infractionDescription: lead.infraction_description || '',
          legalBase: lead.legal_base || '',
          phone: lead.phone || '',
          plate: lead.plate || '',
          infractionType: lead.infraction_type || '',
          time: getTimeFromCreatedAt(lead.created_at),
          date: formatDateFromCreatedAt(lead.created_at),
          avatar: lead.avatar || null,
          status: getStatusFromStageId(lead.stage_id),
          court: lead.court || 'DETRAN',
          completion: getCompletionFromStageId(lead.stage_id),
          documents: lead.documents || [],
          observations: lead.observations || '',
          comments: lead.comments || 0
        }));

        setCases(convertedCases);
      } catch (error) {
        console.error('Error fetching leads:', error);
        // Fallback to initial cases if there's an error
        setCases(initialCases);
      }
    };

    fetchLeads();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('multaexpert_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('multaexpert_services', JSON.stringify(services));
  }, [services]);

  const addCase = async (newCaseData: Omit<Case, 'id' | 'date' | 'column' | 'status' | 'completion' | 'court'>) => {
    if (!user) return;

    try {
      // Get user's company_id
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      const companyId = userData?.company_id;

      // Create lead in Supabase
      const { data: newLead, error } = await supabase
        .from('leads')
        .insert({
          company_id: companyId,
          name: newCaseData.name,
          owner_name: newCaseData.ownerName,
          driver_name: newCaseData.driverName,
          address: newCaseData.address,
          auto_number: newCaseData.autoNumber,
          infraction_date: newCaseData.infractionDate,
          infraction_description: newCaseData.infractionDescription,
          legal_base: newCaseData.legalBase,
          phone: newCaseData.phone,
          plate: newCaseData.plate,
          infraction_type: newCaseData.infractionType,
          priority: newCaseData.priority,
          stage_id: 1, // Default to first stage
          created_at: new Date().toISOString(),
          observations: newCaseData.observations,
          documents: newCaseData.documents || []
        })
        .select()
        .single();

      if (error) throw error;

      // Convert to Case format and add to local state
      const newCase: Case = {
        ...newCaseData,
        id: newLead.id,
        date: new Date().toLocaleDateString('pt-BR'),
        column: 'start',
        status: 'Entrada',
        completion: 10,
        court: 'DETRAN',
        time: 'Agora'
      };

      setCases(prev => [newCase, ...prev]);
    } catch (error) {
      console.error('Error adding case:', error);
      // Fallback to local only if Supabase fails
      const newIdNum = Math.floor(1000 + Math.random() * 9000);
      const newCase: Case = {
        ...newCaseData,
        id: `LE-${newIdNum}`,
        date: new Date().toLocaleDateString('pt-BR'),
        column: 'start',
        status: 'Entrada',
        completion: 10,
        court: 'DETRAN',
        time: 'Agora'
      };
      setCases(prev => [newCase, ...prev]);
    }
  };

  const updateCase = (id: string, updatedCase: Partial<Case>) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, ...updatedCase } : c));
  };

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  const addService = (newServiceData: Omit<Service, 'id'>) => {
    const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;
    const newService: Service = {
      ...newServiceData,
      id: newId
    };
    setServices(prev => [newService, ...prev]);
  };

  const linkServiceToCase = (caseId: string, serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setCases(prev => prev.map(c => {
      if (c.id === caseId) {
        const newBilling: Billing = {
          id: `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
          serviceId: service.id,
          description: service.title,
          value: service.price,
          date: new Date().toLocaleDateString('pt-BR'),
          status: 'Pendente'
        };

        const newHistoryItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleString('pt-BR'),
          action: 'Serviço Vinculado',
          description: `Vínculo de "${service.title}" com cobrança de R$ ${service.price.toFixed(2)} gerada.`
        };

        return {
          ...c,
          linkedServiceIds: [...(c.linkedServiceIds || []), serviceId],
          billings: [...(c.billings || []), newBilling],
          history: [newHistoryItem, ...(c.history || [])],
          status: 'Aguardando Pagamento'
        };
      }
      return c;
    }));
  };

  return (
    <CaseContext.Provider value={{ cases, services, addCase, updateCase, deleteCase, addService, linkServiceToCase }}>
      {children}
    </CaseContext.Provider>
  );
}

export function useCases() {
  const context = useContext(CaseContext);
  if (context === undefined) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
}
