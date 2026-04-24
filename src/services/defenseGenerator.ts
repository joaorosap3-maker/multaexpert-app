import { Case } from '../contexts/CaseContext';
import { AnalysisRecommendation } from './aiAnalyseService';
import { WHITE_LABEL } from '../constants';

/**
 * Generates technical and professional HTML content for an administrative traffic defense
 */
export function generateDefenseTemplate(caseData: Case, selectedTheses: AnalysisRecommendation[]): string {
  const date = new Date().toLocaleDateString('pt-BR');
  
  // Dynamic organ selection
  const organName = caseData.court || "ORGÃO AUTUADOR"; 
  const organAddress = `AO ILUSTRÍSSIMO SENHOR PRESIDENTE DA JARI DO(A) ${organName.toUpperCase()}`;

  // Legal Foundation Sections based on selected theses
  let thesesContent = '';
  selectedTheses.forEach((thesis, index) => {
    thesesContent += `
      <div style="margin-bottom: 25px;">
        <h3 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; color: #1a1a1a; margin-bottom: 12px;">
          ${index + 1}. DA ${thesis.tese.toUpperCase()}
        </h3>
        <p style="text-align: justify; margin-bottom: 10px; text-indent: 2cm;">
          Doutos Julgadores, a referida autuação não pode subsistir em razão da flagrante irregularidade técnica identificada. Conforme se depreende da análise dos fatos, observa-se que:
        </p>
        <p style="text-align: justify; margin-bottom: 10px; font-style: italic; background-color: #f9f9f9; padding: 10px; border-left: 3px solid #ccc; margin-left: 1cm;">
          "${thesis.justificativa}"
        </p>
        <p style="text-align: justify; margin-top: 10px; text-indent: 2cm;">
          Tal vício afronta diretamente o disposto no <strong>${thesis.base_legal}</strong>, o qual estabelece critérios imperativos para a validade do ato administrativo de punição. A inobservância de tais requisitos formais e materiais conduz inevitavelmente à nulidade do auto de infração, conforme preceitua o Art. 281, parágrafo único, inciso I, do Código de Trânsito Brasileiro.
        </p>
      </div>
    `;
  });

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: black; line-height: 1.6; font-size: 12pt; padding: 1.5cm; max-width: 800px; margin: 0 auto; background: white;">
      <!-- ENDEREÇAMENTO -->
      <p style="text-align: center; font-weight: bold; margin-bottom: 50px; font-size: 13pt;">
        ${organAddress}
      </p>

      <!-- IDENTIFICAÇÃO -->
      <p style="text-align: justify; margin-bottom: 35px; text-indent: 2cm;">
        <strong>${caseData.name.toUpperCase()}</strong>, inscrito(a) no CPF sob nº ${caseData.phone ? '***.***.' + caseData.phone.slice(-4) : '________________'}, residente e domiciliado(a) em ${caseData.address || '________________'}, na qualidade de proprietário(a)/condutor(a) do veículo <strong>PLACA ${caseData.plate}</strong>, vem, respeitosamente, à presença de Vossa Senhoria, com fulcro na Lei nº 9.503/97 e Resoluções do CONTRAN, apresentar:
      </p>

      <h1 style="text-align: center; font-size: 16pt; font-weight: bold; margin-bottom: 40px; text-transform: uppercase; letter-spacing: 2px; border-top: 2px solid black; border-bottom: 2px solid black; padding: 10px 0;">
        Defesa Prévia / Recurso Administrativo
      </h1>

      <p style="margin-bottom: 40px; text-align: center; font-weight: bold;">
        Auto de Infração nº ${caseData.autoNumber} | Código da Infração: ${caseData.infractionType}
      </p>

      <!-- FUNDAMENTAÇÃO ÉTICA E FATOS -->
      <h2 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">I - DOS FATOS</h2>
      <p style="text-align: justify; margin-bottom: 30px; text-indent: 2cm;">
        O Requerente foi notificado da autuação acima especificada por suposta violação ao Artigo ${caseData.legalBase || '____'} do Código de Trânsito Brasileiro, ocorrida em ${caseData.infractionDate}, no local ${caseData.address}. 
      </p>
      <p style="text-align: justify; margin-bottom: 35px; text-indent: 2cm;">
        Entretanto, em que pese o prestígio e a presunção de legitimidade dos atos administrativos, a autuação em tela encontra-se eivada de vícios de legalidade que impedem sua manutenção, conforme passa-se a expor detalhadamente.
      </p>

      <!-- FUNDAMENTAÇÃO JURÍDICA -->
      <h2 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">II - DO DIREITO E DA FUNDAMENTAÇÃO</h2>
      ${thesesContent}

      <!-- PEDIDOS -->
      <h2 style="font-size: 13pt; font-weight: bold; text-transform: uppercase; margin-bottom: 15px;">III - DOS PEDIDOS</h2>
      <p style="text-align: justify; margin-bottom: 20px; text-indent: 2cm;">
        Diante do exposto, e com base na estrita legalidade que deve nortear a Administração Pública, REQUER-SE à esta Ilustre Junta:
      </p>
      <ol style="text-align: justify; margin-bottom: 45px; margin-left: 2cm;">
        <li style="margin-bottom: 12px;">O recebimento do presente recurso, visto que tempestivo e devidamente instruído;</li>
        <li style="margin-bottom: 12px;">O provimento total da defesa para declarar a <strong>NULIDADE e o consequente ARQUIVAMENTO</strong> do Auto de Infração nº ${caseData.autoNumber}, com a baixa definitiva de quaisquer efeitos pecuniários ou pontuação no prontuário do condutor;</li>
        <li style="margin-bottom: 12px;">Caso o julgamento não ocorra no prazo regulamentar, a concessão do <strong>EFEITO SUSPENSIVO</strong>, nos termos do Art. 285, § 3º do CTB.</li>
      </ol>

      <p style="text-align: center; margin-top: 60px;">
        Pede Deferimento.
      </p>
      
      <p style="text-align: center; margin-top: 10px;">
        ${caseData.court || 'Brasília/DF'}, ${date}.
      </p>

      <div style="margin-top: 90px; text-align: center;">
        <div style="border-top: 1px solid black; width: 350px; margin: 0 auto; padding-top: 10px;">
          <p style="margin: 0; font-weight: bold; text-transform: uppercase;">${caseData.name}</p>
          <p style="margin: 0; font-size: 10pt; opacity: 0.7;">Recorrente</p>
        </div>
      </div>

      <div style="margin-top: 100px; text-align: center; font-size: 8pt; color: #888; border-top: 1px solid #eee; padding-top: 10px;">
        Documento gerado por ${WHITE_LABEL.COMPANY_NAME} • ${WHITE_LABEL.WEBSITE}
      </div>
    </div>
  `;
}

