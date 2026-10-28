import React, { useState, useEffect } from 'react';
import { BolaoPool, ContestResult, GeneratedTicket, LotteryConfig } from '../types/lottery';
import { fetchContestResult } from '../services/caixaApi';
import { checkTickets } from '../services/optimizer';
import { Trophy, RefreshCw, CheckCircle, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

interface ResultsConfererProps {
  pool: BolaoPool;
  config: LotteryConfig;
  onUpdatePoolTickets: (tickets: GeneratedTicket[], result: ContestResult) => void;
}

export const ResultsConferer: React.FC<ResultsConfererProps> = ({
  pool,
  config,
  onUpdatePoolTickets,
}) => {
  const [contestNumber, setContestNumber] = useState<number>(pool.targetContestNumber);
  const [result, setResult] = useState<ContestResult | null>(pool.checkedContestResult || null);
  const [loading, setLoading] = useState(false);
  const [checkedSummary, setCheckedSummary] = useState<{
    checkedTickets: GeneratedTicket[];
    totalHits: number;
    totalPrizeWon: number;
    winningTicketsCount: number;
    summaryTiers: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    loadContest(pool.targetContestNumber);
  }, [config.id, pool.targetContestNumber]);

  const loadContest = async (num?: number) => {
    setLoading(true);
    try {
      const res = await fetchContestResult(config.id, num);
      setResult(res);
      if (res.contestNumber) setContestNumber(res.contestNumber);
    } catch {
      // Handled in api fallback
    } finally {
      setLoading(false);
    }
  };

  const handleConferir = () => {
    if (!result) return;
    sounds.playBallTap(620);

    const summary = checkTickets(pool.tickets, result, config);
    setCheckedSummary(summary);
    onUpdatePoolTickets(summary.checkedTickets, result);

    if (summary.totalPrizeWon > 0) {
      sounds.playWinChime();
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#005CA9', '#10b981', '#fbbf24', '#38bdf8'],
      });
    }
  };

  const totalQuotas = pool.participants.reduce((acc, p) => acc + p.quotas, 0);
  const prizePerQuota =
    checkedSummary && checkedSummary.totalPrizeWon > 0 && totalQuotas > 0
      ? checkedSummary.totalPrizeWon / totalQuotas
      : 0;

  return (
    <div className="space-y-6 text-slate-800">
      {/* Official Caixa Contest Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005CA9]">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Conferência Oficial Loterias Caixa</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Resultado do Concurso Nº {result?.contestNumber || contestNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data do Sorteio: {result?.drawDate || 'Hoje'} · {config.fullName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="number"
              value={contestNumber}
              onChange={(e) => setContestNumber(Number(e.target.value))}
              className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:border-[#005CA9]"
              placeholder="Nº Concurso"
            />
            <button
              onClick={() => loadContest(contestNumber)}
              disabled={loading}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Buscando...' : 'Atualizar'}</span>
            </button>
          </div>
        </div>

        {/* Drawn Numbers Balls */}
        {result && (
          <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Dezenas Sorteadas pela Caixa:
              </span>
              {result.accumulated ? (
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Acumulou! Próximo: R${' '}
                  {(result.nextJackpotEstimate / 1000000).toLocaleString('pt-BR')}M
                </span>
              ) : (
                <span className="text-[11px] font-bold text-emerald-700">
                  Prêmio Principal Saiu!
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {result.drawnNumbers.map((n) => (
                <span
                  key={n}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-mono font-black text-sm sm:text-base text-white shadow-md"
                  style={{ backgroundColor: config.accentColor }}
                >
                  {String(n).padStart(2, '0')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button: Conferir Bolão */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500">
            {pool.tickets.length} apostas registradas no bolão para verificação
          </div>

          <button
            onClick={handleConferir}
            disabled={pool.tickets.length === 0 || !result}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 bg-[#005CA9] hover:bg-[#004889] text-white rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md shadow-blue-900/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-[#FFB612]" />
            <span>Conferir Todas as Apostas do Bolão</span>
          </button>
        </div>
      </div>

      {/* Prize / Hit Summary Banner */}
      {checkedSummary && (
        <div className="space-y-4 animate-fade-in">
          <div
            className={`p-6 rounded-2xl border shadow-sm ${
              checkedSummary.totalPrizeWon > 0
                ? 'bg-emerald-50 border-emerald-300'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    checkedSummary.totalPrizeWon > 0
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {checkedSummary.totalPrizeWon > 0 ? (
                    <Trophy className="w-6 h-6" />
                  ) : (
                    <Award className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-black text-slate-900">
                    {checkedSummary.totalPrizeWon > 0
                      ? '🎉 Parabéns! O Bolão foi Premiado!'
                      : 'Conferência Concluída'}
                  </h4>
                  <div className="text-xs text-slate-600 mt-0.5">
                    {checkedSummary.winningTicketsCount}{' '}
                    {checkedSummary.winningTicketsCount === 1 ? 'bilhete premiado' : 'bilhetes premiados'} ·{' '}
                    {checkedSummary.totalHits} acertos totais em todas as apostas
                  </div>
                </div>
              </div>

              {/* Prize Value Tally & Division per Quota */}
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Prêmio Total do Bolão</div>
                  <div className="text-2xl font-black font-mono text-emerald-700">
                    R$ {checkedSummary.totalPrizeWon.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                {checkedSummary.totalPrizeWon > 0 && (
                  <div className="border-l border-emerald-200 pl-6">
                    <div className="text-xs text-slate-500 font-medium">
                      Valor por Cota ({totalQuotas} cotas)
                    </div>
                    <div className="text-xl font-bold font-mono text-amber-700">
                      R$ {prizePerQuota.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Breakdown of tiers won */}
            {Object.keys(checkedSummary.summaryTiers).length > 0 && (
              <div className="mt-4 pt-4 border-t border-emerald-200 flex flex-wrap gap-2">
                {Object.entries(checkedSummary.summaryTiers).map(([tier, count]) => (
                  <span
                    key={tier}
                    className="px-3 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-xs font-mono font-bold text-emerald-800"
                  >
                    {count}x {tier}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Tickets Inspection Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Detalhamento de Acertos por Aposta
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checkedSummary.checkedTickets.map((t, idx) => {
                const isWinner = (t.hits || 0) >= 4;

                return (
                  <div
                    key={t.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isWinner
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono text-slate-900">
                          Jogo #{idx + 1}
                        </span>
                        {t.winningTier && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                            {t.winningTier}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {t.hits} {t.hits === 1 ? 'acerto' : 'acertos'}
                        </span>
                        {t.prizeAmount && (
                          <span className="text-xs font-mono font-bold text-emerald-700">
                            + R$ {t.prizeAmount.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Ball badges: highlight hit numbers in gold/green */}
                    <div className="flex flex-wrap gap-1.5">
                      {t.numbers.map((n) => {
                        const isHit = result?.drawnNumbers.includes(n);
                        return (
                          <span
                            key={n}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all ${
                              isHit
                                ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-sm scale-105'
                                : 'bg-slate-50 border border-slate-300 text-slate-700'
                            }`}
                          >
                            {String(n).padStart(2, '0')}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
