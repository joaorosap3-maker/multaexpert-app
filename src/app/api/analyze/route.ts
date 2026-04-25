import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Inicializar OpenAI com a API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Parse do corpo da requisição
    const body = await request.json();
    const { lead, text } = body;

    // Validar dados de entrada
    if (!lead && !text) {
      return NextResponse.json(
        { error: 'É necessário fornecer dados do lead ou texto da multa' },
        { status: 400 }
      );
    }

    // Construir o prompt para análise
    const prompt = `
Analise a seguinte multa de trânsito no Brasil e retorne um JSON estruturado com as seguintes informações:

${text ? `Texto da multa: "${text}"` : ''}

${lead ? `
Dados do lead:
- Nome: ${lead.name || 'Não informado'}
- Placa: ${lead.plate || 'Não informada'}
- Telefone: ${lead.phone || 'Não informado'}
- Data da infração: ${lead.infractionDate || 'Não informada'}
- Descrição da infração: ${lead.infractionDescription || 'Não informada'}
- Tipo de infração: ${lead.infractionType || 'Não informado'}
- Endereço: ${lead.address || 'Não informado'}
` : ''}

Por favor, analise esses dados e retorne APENAS um JSON no seguinte formato:
{
  "resumo": "Breve resumo da infração em português",
  "gravidade": "Leve|Média|Grave|Gravíssima",
  "pontos": número de pontos na CNH,
  "valor": valor da multa em reais (número),
  "recomendacao": "Recomendação sobre o que fazer (entrar com recurso, pagar, etc.)"
}

IMPORTANTE:
- Retorne APENAS o JSON, sem nenhum texto adicional
- O valor deve ser um número (ex: 130.16)
- A gravidade deve ser exatamente uma das 4 opções
- Seja conciso e direto nas recomendações
- Baseie-se na legislação de trânsito brasileira
`;

    // Chamar a API da OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Você é um especialista em multas de trânsito do Brasil. Analise os dados fornecidos e retorne sempre um JSON válido no formato solicitado."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500,
    });

    // Extrair a resposta
    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('Nenhuma resposta da IA');
    }

    // Tentar fazer parse do JSON
    let analysis;
    try {
      // Limpar a resposta para remover possíveis marcadores de código
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim();
      analysis = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Resposta bruta:', response);
      
      // Tentar extrair dados manualmente se o JSON falhar
      analysis = extractDataManually(response);
    }

    // Validar estrutura do resultado
    const validatedAnalysis = validateAndCleanResult(analysis);

    return NextResponse.json(validatedAnalysis);

  } catch (error) {
    console.error('Erro na análise da multa:', error);
    
    // Retornar erro específico baseado no tipo de erro
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Chave da API OpenAI não configurada' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('timeout') || error.message.includes('timeout')) {
        return NextResponse.json(
          { error: 'Timeout na análise. Tente novamente.' },
          { status: 408 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erro ao analisar a multa. Tente novamente.' },
      { status: 500 }
    );
  }
}

// Função para validar e limpar o resultado
function validateAndCleanResult(data: any) {
  const result = {
    resumo: data.resumo || 'Análise não disponível',
    gravidade: 'Média', // valor padrão
    pontos: 4, // valor padrão
    valor: 130.16, // valor padrão
    recomendacao: 'Recomenda-se entrar com recurso'
  };

  // Validar gravidade
  const validGravidades = ['Leve', 'Média', 'Grave', 'Gravíssima'];
  if (data.gravidade && validGravidades.includes(data.gravidade)) {
    result.gravidade = data.gravidade;
  }

  // Validar pontos (deve ser entre 0-7)
  if (typeof data.pontos === 'number' && data.pontos >= 0 && data.pontos <= 7) {
    result.pontos = data.pontos;
  }

  // Validar valor (deve ser positivo)
  if (typeof data.valor === 'number' && data.valor > 0) {
    result.valor = data.valor;
  }

  // Usar os outros campos se existirem
  if (data.resumo && typeof data.resumo === 'string') {
    result.resumo = data.resumo;
  }

  if (data.recomendacao && typeof data.recomendacao === 'string') {
    result.recomendacao = data.recomendacao;
  }

  return result;
}

// Função de fallback para extrair dados manualmente
function extractDataManually(text: string) {
  const result = {
    resumo: 'Análise não disponível',
    gravidade: 'Média',
    pontos: 4,
    valor: 130.16,
    recomendacao: 'Recomenda-se entrar com recurso'
  };

  // Tentar extrair gravidade
  const gravidadeMatch = text.match(/gravidade[:\s]+(Leve|Média|Grave|Gravíssima)/i);
  if (gravidadeMatch) {
    result.gravidade = gravidadeMatch[1];
  }

  // Tentar extrair pontos
  const pontosMatch = text.match(/pontos[:\s]+(\d+)/i);
  if (pontosMatch) {
    result.pontos = parseInt(pontosMatch[1]);
  }

  // Tentar extrair valor
  const valorMatch = text.match(/valor[:\s]+R?\$?\s*(\d+[.,]\d{2})/i);
  if (valorMatch) {
    const valorStr = valorMatch[1].replace(',', '.');
    result.valor = parseFloat(valorStr);
  }

  return result;
}
