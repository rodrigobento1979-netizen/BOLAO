import React, { useState, useMemo } from 'react';
import { LotteryType, BolaoPool, GeneratedTicket } from '../types/lottery';
import { LOTTERIES_CONFIG } from '../data/lotteriesData';
import { simulateSyndicateStrategy, generateSuperCombinations } from '../services/optimizer';
import {
  Calculator,
  Users,
  DollarSign,
  TrendingUp,
  Layers,
  Scale,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Dices,
  HelpCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

interface SyndicateSimulatorProps {
  currentLottery: LotteryType;
  onSelectLottery: (lottery: LotteryType) => void;
  activePool: BolaoPool;
  onApplySimulationToPool: (
    participantCount: number,
    quotaValue: number,
    tickets: GeneratedTicket[]
  ) => void;
}

export const SyndicateSimulator: React.FC<SyndicateSimulatorProps> = ({
  currentLottery,
  onSelectLottery,
  activePool,
  onApplySimulationToPool,
}) => {
  const [participantCount, setParticipantCount] = useState<number>(15);
  const [quotaValue, setQuotaValue] = useState<number>(30);
  const [selectedStrategy, setSelectedStrategy] = useState<'fechamento' | 'multipla'>('fechamento');
  const [isApplying, setIsApplying] = useState(false);

  const config = LOTTERIES_CONFIG[currentLottery];

  // Dynamic simulation result
  const simulation = useMemo(() => {
    return simulateSyndicateStrategy(currentLottery, participantCount, quotaValue);
  }, [currentLottery, participantCount, quotaValue]);

  const handleApply = () => {
    sounds.playBallTap(600);
    setIsApplying(true);

    setTimeout(() => {
      // Generate tickets based on the simulation strategy
      const strat = selectedStrategy === 'fechamento' ? 'fechamento_matematico' : 'aposta_multipla';
      const dummyPool: BolaoPool = {
        ...activePool,
        quotaPrice: quotaValue,
        totalQuotas: participantCount,
      };

      const tickets = generateSuperCombinations(dummyPool, config, strat);
      onApplySimulationToPool(participantCount, quotaValue, tickets);
      setIsApplying(false);
      sounds.playWinChime();

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#005CA9', '#10b981', '#f59e0b', '#3b82f6'],
      });
    }, 400);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005CA9]">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>Consultor Matemático & Simulador de Bolões</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Descubra a Melhor Distribuição de Jogo para seu Grupo
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
              Simule a quantidade de cotistas e valor de cota. O algoritmo compara teorias de matemáticos (como fechamentos e apostas múltiplas) e indica a opção ideal de investimento.
            </p>
          </div>

          {/* Quick Lottery Switcher for Top 3 */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {(['megasena', 'lotofacil', 'quina'] as LotteryType[]).map((lot) => {
              const isSel = lot === currentLottery;
              const cfg = LOTTERIES_CONFIG[lot];
              return (
                <button
                  key={lot}
                  onClick={() => {
                    sounds.playBallTap(500);
                    onSelectLottery(lot);
                  }}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
                    isSel
                      ? 'bg-white text-[#005CA9] shadow-sm border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cfg.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inputs Grid: Participants & Quota Value - 100% Button-driven (Tipo Botão) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* 1. Quantidade de Cotistas / Participantes */}
          <div className="p-4 bg-slate-50 border border-[#C5DCF0] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Users className="w-4 h-4 text-[#005CA9]" />
                <span>Cotistas no Bolão</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Toque nos botões
              </span>
            </div>

            {/* Stepper Buttons Row */}
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  sounds.playBallTap(350);
                  setParticipantCount((prev) => Math.max(2, prev - 1));
                }}
                disabled={participantCount <= 2}
                className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xl flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                title="Diminuir 1 cotista"
              >
                -
              </button>

              <div className="text-center px-2">
                <div className="text-2xl font-black font-mono text-[#005CA9] leading-none">
                  {participantCount}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                  {participantCount === 1 ? 'Participante' : 'Participantes'}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playBallTap(500);
                  setParticipantCount((prev) => Math.min(100, prev + 1));
                }}
                disabled={participantCount >= 100}
                className="w-11 h-11 rounded-lg bg-[#005CA9] hover:bg-[#004889] text-white font-black text-xl flex items-center justify-center transition-all active:scale-90 shadow-2xs"
                title="Aumentar 1 cotista"
              >
                +
              </button>
            </div>

            {/* Quick Preset Buttons (Tipo Botão) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Atalhos Rápidos de Cotistas:
              </span>
              <div className="grid grid-cols-6 gap-1.5">
                {[5, 10, 15, 20, 30, 50].map((num) => {
                  const isSelected = participantCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(400 + num * 5);
                        setParticipantCount(num);
                      }}
                      className={`h-9 rounded-lg text-xs font-mono font-black transition-all flex items-center justify-center active:scale-95 ${
                        isSelected
                          ? 'bg-[#005CA9] text-white shadow-sm ring-2 ring-blue-300 font-bold scale-[1.02]'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Valor da Cota por Pessoa */}
          <div className="p-4 bg-slate-50 border border-[#C5DCF0] rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Valor por Cota</span>
              </label>
              <span className="text-[11px] font-bold text-slate-500">
                Toque nos botões
              </span>
            </div>

            {/* Stepper Buttons Row */}
            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-inner">
              <button
                type="button"
                onClick={() => {
                  sounds.playBallTap(350);
                  setQuotaValue((prev) => Math.max(5, prev - 5));
                }}
                disabled={quotaValue <= 5}
                className="w-11 h-11 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
                title="Diminuir R$ 5"
              >
                -5
              </button>

              <div className="text-center px-2">
                <div className="text-2xl font-black font-mono text-emerald-700 leading-none">
                  R$ {quotaValue.toFixed(2)}
                </div>
                <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mt-0.5">
                  por cota individual
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playBallTap(500);
                  setQuotaValue((prev) => Math.min(500, prev + 5));
                }}
                className="w-11 h-11 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center transition-all active:scale-90 shadow-2xs"
                title="Aumentar R$ 5"
              >
                +5
              </button>
            </div>

            {/* Quick Preset Buttons (Tipo Botão) */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Valores Populares de Cota:
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {[10, 20, 30, 50, 100].map((val) => {
                  const isSelected = quotaValue === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(420 + val * 2);
                        setQuotaValue(val);
                      }}
                      className={`h-9 rounded-lg text-xs font-mono font-black transition-all flex items-center justify-center active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300 font-bold scale-[1.02]'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      R${val}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Total Arrecadado & Poder de Fogo */}
          <div className="p-4 bg-gradient-to-br from-[#003D73] to-[#002447] text-white rounded-2xl flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between text-blue-200 text-xs font-bold uppercase tracking-wider">
                <span>Orçamento Total</span>
                <span className="bg-[#FFB612] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                  100% Rateado
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-[#FFB612] mt-1.5">
                R$ {simulation.totalBudget.toFixed(2)}
              </div>
              <div className="text-xs text-blue-100/90 mt-1">
                {participantCount} cotistas × R$ {quotaValue.toFixed(2)}
              </div>
            </div>

            <div className="text-xs text-blue-100 pt-3 border-t border-white/15 mt-3 space-y-1">
              <div className="flex items-center justify-between">
                <span>Apostas Simples Equivalentes:</span>
                <strong className="text-white font-mono text-sm">
                  {simulation.fechamentoPlan.totalTickets} apostas
                </strong>
              </div>
              <div className="text-[11px] text-blue-200/80">
                Modalidade: <span className="text-white font-semibold">{config.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mathematician Verdict Highlight */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border border-blue-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#005CA9] uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Veredito dos Agentes Matemáticos & Especialistas em Loterias</span>
        </div>
        <p className="text-sm text-slate-800 leading-relaxed font-sans font-medium">
          {simulation.mathematicianVerdict}
        </p>
      </div>

      {/* 2 Strategic Paths: Fechamento vs Aposta Múltipla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Strategy 1: Fechamento Inteligente */}
        <div
          onClick={() => {
            sounds.playBallTap(520);
            setSelectedStrategy('fechamento');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedStrategy === 'fechamento'
              ? 'bg-white border-[#005CA9] ring-2 ring-blue-300 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          {simulation.recommendedOption === 'fechamento' && (
            <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Mais Recomendado
            </span>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-[#005CA9]" />
              <h4 className="text-base font-black text-slate-900">
                {simulation.fechamentoPlan.title}
              </h4>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {simulation.fechamentoPlan.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Dezenas distintas do grupo cobertas:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {simulation.fechamentoPlan.distinctNumbersCovered} dezenas
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Total de bilhetes registrados:</span>
                <span className="font-mono font-bold text-slate-900">
                  {simulation.fechamentoPlan.totalTickets} bilhetes
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Eficiência matemática combinatória:</span>
                <span className="font-mono font-bold text-[#005CA9]">
                  {simulation.fechamentoPlan.efficiencyScore}%
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-slate-700 text-[11px] leading-snug">
                <strong>Condição de Garantia:</strong> {simulation.fechamentoPlan.guarantee}
              </div>
            </div>
          </div>

          {/* Action Button inside Card */}
          <div className="pt-4 mt-3 border-t border-slate-100">
            <button
              type="button"
              className={`w-full h-11 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98 ${
                selectedStrategy === 'fechamento'
                  ? 'bg-[#005CA9] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedStrategy === 'fechamento' ? 'Estratégia Fechamento Selecionada' : 'Selecionar Esta Opção'}</span>
            </button>
          </div>
        </div>

        {/* Strategy 2: Super Aposta Múltipla Caixa */}
        <div
          onClick={() => {
            sounds.playBallTap(520);
            setSelectedStrategy('multipla');
          }}
          className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
            selectedStrategy === 'multipla'
              ? 'bg-white border-[#005CA9] ring-2 ring-blue-300 shadow-md'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          {simulation.recommendedOption === 'multipla' && (
            <span className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
              Mais Recomendado
            </span>
          )}

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <h4 className="text-base font-black text-slate-900">
                {simulation.multiplaPlan.title}
              </h4>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              {simulation.multiplaPlan.description}
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Dezenas no volante único:</span>
                <span className="font-mono font-bold text-slate-900">
                  {simulation.multiplaPlan.numbersInTicket} dezenas
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Apostas simples equivalentes:</span>
                <span className="font-mono font-bold text-amber-700">
                  {simulation.multiplaPlan.equivalentBets} apostas
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Jogos simples complementares:</span>
                <span className="font-mono font-bold text-slate-900">
                  +{simulation.multiplaPlan.bonusTicketsCount} bilhetes
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-slate-700 text-[11px] leading-snug">
                <strong>Multiplicador de Prêmios:</strong> {simulation.multiplaPlan.multiplierEffect}
              </div>
            </div>
          </div>

          {/* Action Button inside Card */}
          <div className="pt-4 mt-3 border-t border-slate-100">
            <button
              type="button"
              className={`w-full h-11 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-98 ${
                selectedStrategy === 'multipla'
                  ? 'bg-[#005CA9] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{selectedStrategy === 'multipla' ? 'Estratégia Múltipla Selecionada' : 'Selecionar Esta Opção'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Depósito das 6 Dezenas por Participante Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-black text-sm sm:text-base text-slate-900">
              Depósito de Dezenas dos {participantCount} Participantes
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Cada participante deposita suas {config.defaultDrawNumbers} dezenas da sorte no bolão. O sistema unifica tudo e monta os jogos sem sobreposições inúteis.
            </p>
          </div>

          <button
            onClick={handleApply}
            disabled={isApplying}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-[#005CA9] hover:bg-[#004889] text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-[#FFB612]" />
            <span>
              {isApplying
                ? 'Gerando Jogos...'
                : `Aplicar ao Bolão (${selectedStrategy === 'fechamento' ? 'Fechamento' : 'Aposta Múltipla'})`}
            </span>
          </button>
        </div>

        {/* Informative Step Walkthrough */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-[#005CA9]">1. Coleta das Dezenas</span>
            <p className="text-slate-600">
              Os cotistas entram e marcam suas dezenas favoritas no volante digital individual.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-[#005CA9]">2. Matriz de Cobertura</span>
            <p className="text-slate-600">
              O sistema pontua as dezenas de consenso do grupo e preenche as matrizes de fechamento.
            </p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-[#005CA9]">3. Apostas Otimizadas</span>
            <p className="text-slate-600">
              Gera os bilhetes oficiais balanceados prontos para conferência e rateio de prêmios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
