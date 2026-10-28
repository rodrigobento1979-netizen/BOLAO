import React, { useState } from 'react';
import { BolaoPool, LotteryConfig } from '../types/lottery';
import { analyzeGroup } from '../services/optimizer';
import { getLotteryNumberStatistics } from '../data/lotteriesData';
import { consultAiLotteryAdvisor } from '../services/aiAdvisor';
import {
  TrendingUp,
  Brain,
  Layers,
  Scale,
  Flame,
  Clock,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface StatisticalAnalysisProps {
  pool: BolaoPool;
  config: LotteryConfig;
}

export const StatisticalAnalysis: React.FC<StatisticalAnalysisProps> = ({ pool, config }) => {
  const analysis = analyzeGroup(pool, config);
  const numberStats = getLotteryNumberStatistics(config.id);

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const hotNumbers = numberStats.filter((s) => s.status === 'quente').slice(0, 10);
  const overdueNumbers = numberStats.filter((s) => s.status === 'atrasada').slice(0, 8);

  const handleRunAiConsultant = async () => {
    sounds.playBallTap(650);
    setLoadingAi(true);
    try {
      const res = await consultAiLotteryAdvisor(pool, config);
      setAiReport(res);
      sounds.playWinChime();
    } catch {
      setAiReport('Não foi possível conectar ao consultor estatístico no momento.');
    } finally {
      setLoadingAi(false);
    }
  };

  const simpleBetsCount = Math.floor(analysis.totalBudget / config.minPrice);
  const multiOption = config.priceTable
    .filter((pt) => pt.price <= analysis.totalBudget && pt.numbers > config.minNumbers)
    .pop();

  return (
    <div className="space-y-6 text-slate-800">
      {/* Strategy Recommendation Hero Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005CA9]">
            <TrendingUp className="w-4 h-4" />
            <span>Inteligência Probabilística & Vantagem Financeira</span>
          </div>

          <button
            onClick={handleRunAiConsultant}
            disabled={loadingAi}
            className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#005CA9] border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Brain className="w-3.5 h-3.5 text-[#005CA9]" />
            <span>{loadingAi ? 'Analisando Probabilidades...' : 'Auditoria IA do Bolão'}</span>
          </button>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">
          {analysis.recommendation.headline}
        </h3>

        <p className="text-slate-600 text-sm leading-relaxed max-w-3xl mb-5">
          {analysis.recommendation.explanation}
        </p>

        {/* Dynamic Comparative Box: Single Multi vs Multiple Tickets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Option A: Desdobramento / Múltiplos Jogos */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              analysis.recommendation.recommendedStrategy === 'desdobramento'
                ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#005CA9]" />
                Opção 1: Desdobramento ({simpleBetsCount} jogos simples)
              </span>
              {analysis.recommendation.recommendedStrategy === 'desdobramento' && (
                <span className="text-[10px] uppercase font-bold text-[#005CA9] bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  Mais Vantajoso
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Total de apostas geradas:</span>
                <span className="font-mono font-bold text-slate-900">{simpleBetsCount} bilhetes</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Dezenas distintas cobertas:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {analysis.distinctNumbersCount} dezenas do grupo
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Vantagem principal:</span>
                <span className="text-right text-slate-800 font-medium">
                  Máxima dispersão de risco e chances ampliadas em múltiplos volantes
                </span>
              </div>
            </div>
          </div>

          {/* Option B: Aposta Múltipla Única */}
          <div
            className={`p-4 rounded-xl border transition-all ${
              analysis.recommendation.recommendedStrategy === 'multipla'
                ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-amber-600" />
                Opção 2: Jogo Múltiplo Caixa (
                {multiOption ? `${multiOption.numbers} dezenas` : 'Aguardando cotas'})
              </span>
              {analysis.recommendation.recommendedStrategy === 'multipla' && (
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Mais Vantajoso
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Custo do bilhete único:</span>
                <span className="font-mono font-bold text-slate-900">
                  {multiOption ? `R$ ${multiOption.price.toFixed(2)}` : 'R$ --'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-500">Apostas combinadas:</span>
                <span className="font-mono font-bold text-amber-700">
                  {multiOption ? `${multiOption.equivalentSingleBets} jogos` : '1 jogo'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Multiplicador de prêmios:</span>
                <span className="text-right text-slate-800 font-medium">
                  {multiOption
                    ? 'Ao acertar a quadra ou quina, ganha múltiplos prêmios simultâneos!'
                    : 'Disponível a partir de R$ 35,00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Report Output */}
        {aiReport && (
          <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-slate-800 animate-fade-in space-y-2">
            <div className="flex items-center justify-between text-[#005CA9] font-bold border-b border-blue-200 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Parecer Técnico do Estrategista de Loterias IA</span>
              </div>
              <button
                onClick={() => setAiReport(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                Ocultar
              </button>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-slate-700 font-sans">
              {aiReport}
            </div>
          </div>
        )}
      </div>

      {/* Statistical Gauges & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Parity (Odd/Even) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900">
              Balanço Par / Ímpar
            </span>
            <span className="text-[11px] font-mono text-[#005CA9] font-bold">
              {analysis.parityBalance.ratioLabel}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
            <div
              style={{
                width: `${
                  (analysis.parityBalance.oddCount /
                    Math.max(1, analysis.distinctNumbersCount)) *
                  100
                }%`,
              }}
              className="bg-[#005CA9] h-full transition-all"
              title="Ímpares"
            />
            <div
              style={{
                width: `${
                  (analysis.parityBalance.evenCount /
                    Math.max(1, analysis.distinctNumbersCount)) *
                  100
                }%`,
              }}
              className="bg-sky-400 h-full transition-all"
              title="Pares"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-600 mt-2">
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#005CA9]" />
              {analysis.parityBalance.oddCount} Ímpares
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              {analysis.parityBalance.evenCount} Pares
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Padrão mais frequente em concursos: {config.statIdealOddEven}
          </p>
        </div>

        {/* Quadrants Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900">
              Dispersão por Quadrantes
            </span>
            <span className="text-[11px] text-slate-500">4 Zonas do Volante</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Q1 (Noroeste)</div>
              <div className="text-base font-bold text-slate-900">{analysis.quadrantSpread.q1} dezenas</div>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Q2 (Nordeste)</div>
              <div className="text-base font-bold text-slate-900">{analysis.quadrantSpread.q2} dezenas</div>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Q3 (Sudoeste)</div>
              <div className="text-base font-bold text-slate-900">{analysis.quadrantSpread.q3} dezenas</div>
            </div>
            <div className="p-2 rounded bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500 uppercase">Q4 (Sudeste)</div>
              <div className="text-base font-bold text-slate-900">{analysis.quadrantSpread.q4} dezenas</div>
            </div>
          </div>
        </div>

        {/* Sum Range Gauge */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-900">
              Média e Soma Esperada
            </span>
            <span className="text-[11px] font-mono text-[#005CA9] font-bold">
              Média: {analysis.averageSum}
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Faixa ideal histórica:</span>
              <span className="font-mono text-slate-900 font-bold">
                {config.statSumIdealRange[0]} a {config.statSumIdealRange[1]}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              Mais de 80% dos concursos oficiais da Caixa têm a soma de dezenas dentro desta faixa da curva de Gauss. O gerador respeita essa restrição automaticamente.
            </div>
          </div>
        </div>
      </div>

      {/* Hot & Overdue Numbers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hottest numbers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Dezenas Mais Sorteadas na História ({config.name})</span>
            </div>
            <span className="text-[11px] text-slate-500">Alta Frequência</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {hotNumbers.map((s) => (
              <div
                key={s.number}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-xs"
              >
                <span className="font-mono font-bold text-amber-800">
                  {String(s.number).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {s.frequencyTotal}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue numbers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <Clock className="w-4 h-4 text-[#005CA9]" />
              <span>Dezenas Mais Atrasadas (Tempo sem Sair)</span>
            </div>
            <span className="text-[11px] text-slate-500">Probabilidade de Retorno</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {overdueNumbers.map((s) => (
              <div
                key={s.number}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-xs"
              >
                <span className="font-mono font-bold text-[#005CA9]">
                  {String(s.number).padStart(2, '0')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {s.delayContests} conc. atrás
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consensus numbers from participants */}
      {analysis.consensusNumbers.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Dezenas com Consenso dos Participantes</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Classificadas pelos votos dos amigos do bolão
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {analysis.consensusNumbers.map((c) => (
              <div
                key={c.number}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono border ${
                  c.votes >= 2
                    ? 'bg-blue-50 border-blue-300 text-[#005CA9] font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{String(c.number).padStart(2, '0')}</span>
                <span className="text-[10px] text-slate-500">
                  ({c.votes} {c.votes === 1 ? 'voto' : 'votos'})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
