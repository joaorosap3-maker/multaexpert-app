import { GoogleGenerativeAI } from "@google/generative-ai";

// Inicialização do Gemini com variável de ambiente correta
const genAI = new GoogleGenerativeAI(
  process.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

// Interfaces para tipagem
export interface AnalysisResult {
  insights: string[];
  nulidades: string[];
  probabilidade_sucesso: number;
  acoes_recomendadas: string[];
}

export interface AnalysisRecommendation {
  type: 'nulidade' | 'defesa' | 'recurso';
  title: string;
  description: string;
  probability: number;
  // Propriedades usadas em defenseGenerator.ts
  tese?: string;
  justificativa?: string;
  base_legal?: string;
}

export interface LeadAnalysisResult {
  resumo: string;
  gravidade: string;
  pontos: number;
  valor: number;
  recomendacao: string;
}

// Objeto padrão para fallback
const DEFAULT_ANALYSIS_RESULT: AnalysisResult = {
  insights: ["Análise não disponível no momento"],
  nulidades: ["Nenhuma nulidade identificada"],
  probabilidade_sucesso: 0.3,
  acoes_recomendadas: ["Consultar especialista em trânsito"]
};

// Função principal de análise de multas
export async function analyzeTrafficFine(fineData: any): Promise<AnalysisResult> {
  const prompt = `
Você é um especialista em direito de trânsito brasileiro.

Analise os dados abaixo e retorne APENAS um JSON válido, sem texto adicional.

Dados da multa:
- Auto: ${fineData.auto || 'Não informado'}
- Placa: ${fineData.placa || 'Não informada'}
- Código: ${fineData.codigo || 'Não informado'}
- Data/Hora: ${fineData.dataHora || 'Não informada'}

Responda EXATAMENTE neste formato JSON:
{
  "insights": ["análise 1", "análise 2"],
  "nulidades": ["nulidade 1", "Nulidade 2"],
  "probabilidade_sucesso": 0.75,
  "acoes_recomendadas": ["ação 1", "ação 2"]
}

IMPORTANTE: 
- Responda APENAS o JSON
- Não inclua explicações
- probabilidade_sucesso deve ser número de 0 a 1
- arrays devem conter strings relevantes
`;

  try {
    console.log('🤖 Enviando requisição para Gemini API...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('📝 Resposta bruta da IA:', text);

    // Limpar e parsear JSON
    const cleaned = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^[^{]*({[^}]+})[^}]*$/g, '$1') // Extrair JSON do meio do texto
      .trim();

    console.log('🧹 JSON limpo:', cleaned);

    const parsed = JSON.parse(cleaned);
    
    // Validar estrutura
    if (!parsed.insights || !parsed.nulidades || typeof parsed.probabilidade_sucesso !== 'number') {
      console.warn('⚠️ Resposta da IA não tem formato esperado, usando fallback');
      return DEFAULT_ANALYSIS_RESULT;
    }

    console.log('✅ Análise concluída com sucesso:', parsed);
    return parsed;
    
  } catch (error) {
    console.error("❌ Erro na análise da IA:", error);
    console.log('🔄 Usando resultado padrão...');
    return DEFAULT_ANALYSIS_RESULT;
  }
}

// Função para analisar leads (substitui leadAnalysisService)
export async function analyzeLead(lead: any): Promise<LeadAnalysisResult> {
  try {
    const result = await analyzeTrafficFine(lead);
    
    if (!result) {
      return {
        resumo: "Não foi possível analisar automaticamente esta multa.",
        gravidade: "Indefinida",
        pontos: 0,
        valor: 0,
        recomendacao: "Recomendamos análise manual por um especialista."
      };
    }

    // Converter resultado para formato LeadAnalysisResult
    return {
      resumo: result.insights.join(" "),
      gravidade: result.probabilidade_sucesso > 0.7 ? "Alta" : result.probabilidade_sucesso > 0.4 ? "Média" : "Baixa",
      pontos: Math.floor(result.probabilidade_sucesso * 7), // Estimativa de pontos
      valor: Math.floor(result.probabilidade_sucesso * 300), // Estimativa de valor
      recomendacao: result.acoes_recomendadas[0] || "Consultar especialista em trânsito."
    };
  } catch (error) {
    console.warn('⚠️ Análise com IA falhou:', error);
    
    // Fallback seguro
    return {
      resumo: "Não foi possível analisar automaticamente esta multa.",
      gravidade: "Indefinida",
      pontos: 0,
      valor: 0,
      recomendacao: "Recomendamos análise manual por um especialista."
    };
  }
}

// Função para analisar infrações (substitui aiAnalyzeService)
export async function analyzeInfraction(infractionData: any): Promise<AnalysisResult | null> {
  return analyzeTrafficFine(infractionData);
}

// Função auxiliar para formatação de moeda
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Função para obter cor da gravidade
export function getGravityColor(gravidade: string): string {
  switch (gravidade.toLowerCase()) {
    case 'baixa':
      return 'text-green-500';
    case 'média':
    case 'media':
      return 'text-yellow-500';
    case 'alta':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
}