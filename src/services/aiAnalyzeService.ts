// Serviço de análise de multas com IA real

export interface LeadAnalysisResult {
  resumo: string;
  gravidade: string;
  pontos: number;
  valor: number;
  recomendacao: string;
}

export async function analyzeLeadWithAI(lead: any, text?: string): Promise<LeadAnalysisResult> {
  try {
    // Preparar dados para enviar à API
    const payload = {
      lead: {
        name: lead.name,
        plate: lead.plate,
        phone: lead.phone,
        infractionDate: lead.infractionDate,
        infractionDescription: lead.infractionDescription,
        infractionType: lead.infractionType,
        address: lead.address
      },
      text: text || lead.infractionDescription
    };

    // Chamar a API de análise
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error('Erro na análise com IA:', error);
    
    // Tratar diferentes tipos de erro
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('408')) {
        throw new Error('Timeout na análise. Tente novamente.');
      }
      
      if (error.message.includes('API key') || error.message.includes('500')) {
        throw new Error('Serviço de IA indisponível no momento.');
      }
      
      if (error.message.includes('400')) {
        throw new Error('Dados insuficientes para análise.');
      }
    }
    
    throw new Error('Erro ao analisar a multa. Tente novamente.');
  }
}

// Função de fallback usando análise mock caso a IA falhe
export async function analyzeLeadWithFallback(lead: any, text?: string): Promise<LeadAnalysisResult> {
  try {
    // Tentar análise com IA primeiro
    return await analyzeLeadWithAI(lead, text);
  } catch (error) {
    console.warn('Análise com IA falhou, usando fallback:', error);
    
    // Fallback para análise mock
    return generateMockAnalysis(lead);
  }
}

function generateMockAnalysis(lead: any): LeadAnalysisResult {
  const infractions = [
    {
      resumo: "Infração por excesso de velocidade em via urbana",
      gravidade: "Média",
      pontos: 4,
      valor: 130.16,
      recomendacao: "Entrar com recurso baseado em falha de sinalização"
    },
    {
      resumo: "Estacionamento em local proibido",
      gravidade: "Leve",
      pontos: 3,
      valor: 88.38,
      recomendacao: "Verificar se havia sinalização adequada no local"
    },
    {
      resumo: "Avanço de sinal vermelho",
      gravidade: "Gravíssima",
      pontos: 7,
      valor: 293.47,
      recomendacao: "Verificar se o radar estava funcionando corretamente"
    },
    {
      resumo: "Transitar na contramão",
      gravidade: "Gravíssima",
      pontos: 5,
      valor: 195.23,
      recomendacao: "Analisar se havia necessidade de manobra evasiva"
    }
  ];

  // Selecionar infração baseada no nome do lead (mock)
  const index = lead.name ? lead.name.length % infractions.length : 0;
  
  return infractions[index];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function getGravityColor(gravidade: string): string {
  switch (gravidade.toLowerCase()) {
    case 'leve':
      return 'text-green-600 bg-green-50';
    case 'média':
      return 'text-yellow-600 bg-yellow-50';
    case 'grave':
      return 'text-orange-600 bg-orange-50';
    case 'gravíssima':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}
