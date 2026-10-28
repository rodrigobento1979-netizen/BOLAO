import { GoogleGenAI } from '@google/genai';
import { BolaoPool, LotteryConfig } from '../types/lottery';

export async function consultAiLotteryAdvisor(
  pool: BolaoPool,
  config: LotteryConfig,
  customPrompt?: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Distinct participant numbers
  const allNumbers = pool.participants.flatMap((p) => p.chosenNumbers);
  const distinct = Array.from(new Set(allNumbers)).sort((a, b) => a - b);
  const totalBudget = pool.participants.reduce((acc, p) => acc + p.quotas * pool.quotaPrice, 0);

  const fallbackAnalysis = `Análise Matemática Estratégica do Bolão (${config.name}):
1. Cobertura: O grupo reuniu ${distinct.length} dezenas distintas (${distinct.join(', ')}).
2. Orçamento: R$ ${totalBudget.toFixed(2)} acumulados entre ${pool.participants.length} participantes.
3. Recomendação Matemática: Priorize desdobramento de jogos simples de ${config.defaultDrawNumbers} dezenas com filtros de paridade 3P/3I e soma centrada em ${config.statSumIdealRange[0]}-${config.statSumIdealRange[1]}.`;

  if (!apiKey) {
    return fallbackAnalysis;
  }

  try {
    const ai = new GoogleGenAI();
    const prompt = `Você é um estatístico matemático especialista em Loterias Oficiais da Caixa Econômica Federal e bolões em grupo.
Analise a situação deste bolão de ${config.fullName}:
- Participantes: ${pool.participants.length}
- Orçamento do grupo: R$ ${totalBudget.toFixed(2)} (${pool.participants.reduce((acc, p) => acc + p.quotas, 0)} cotas a R$ ${pool.quotaPrice.toFixed(2)})
- Dezenas escolhidas pelos participantes: ${distinct.join(', ')}
- Faixa ideal histórica de soma: ${config.statSumIdealRange[0]} a ${config.statSumIdealRange[1]}
- Balanço ideal par/ímpar: ${config.statIdealOddEven}

Forneça um parecer conciso, direto e de alto valor prático para o grupo:
1. Avaliação do universo de dezenas do grupo (se há vícios, repetições excessivas ou boa distribuição de quadrantes).
2. Veredito: É mais vantajoso fazer 1 aposta múltipla concentrada ou desdobramento em várias apostas simples com esse orçamento? Explique matematicamente o porquê.
3. 2 recomendações táticas para maximizar as probabilidades de retorno de prêmio secundário (Quadra/Quina ou 14 pontos).
${customPrompt ? `Pergunta adicional do usuário: "${customPrompt}"` : ''}

Responda em português brasileiro com formatação limpa e profissional.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || fallbackAnalysis;
  } catch {
    return fallbackAnalysis;
  }
}
