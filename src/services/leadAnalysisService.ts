// Serviço de análise de leads/multas com integração preparada para IA real

export interface LeadAnalysisResult {
  resumo: string;
  gravidade: string;
  pontos: number;
  valor: number;
  recomendacao: string;
}

export async function analyzeLead(lead: any): Promise<LeadAnalysisResult> {
  try {
    // Tentar análise com IA real
    const result = await analyzeLeadWithAI(lead);
    return result;
  } catch (error) {
    console.warn('⚠️ Análise com IA falhou:', error);

    // Fallback seguro (SEM dados fake)
    return {
      resumo: "Não foi possível analisar automaticamente esta multa.",
      gravidade: "Indefinida",
      pontos: 0,
      valor: 0,
      recomendacao: "Revisar manualmente ou tentar novamente."
    };
  }
}

async function analyzeLeadWithAI(lead: any): Promise<LeadAnalysisResult> {
  // ⚠️ AQUI você vai integrar com IA real (OpenAI, API própria, etc)

  // Exemplo de estrutura para futura API:
  /*
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ lead })
  });

  if (!response.ok) {
    throw new Error('Erro na API de análise');
  }

  return await response.json();
  */

  // 🚨 TEMPORÁRIO: se não tem IA ainda, lança erro controlado
  throw new Error("IA não configurada");
}

// ❌ REMOVIDO: generateMockAnalysis (não usar mais)

// Funções utilitárias continuam OK
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