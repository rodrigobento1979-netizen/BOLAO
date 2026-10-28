import React, { useState } from 'react';
import { BolaoPool, GeneratedTicket, LotteryConfig } from '../types/lottery';
import { generateSuperCombinations } from '../services/optimizer';
import { Sparkles, Wand2, ShieldCheck, Zap, Layers, Check, Copy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../services/soundEffects';

interface WinningCombinationGeneratorProps {
  pool: BolaoPool;
  config: LotteryConfig;
  onApplyTickets: (tickets: GeneratedTicket[]) => void;
}

export const WinningCombinationGenerator: React.FC<WinningCombinationGeneratorProps> = ({
  pool,
  config,
  onApplyTickets,
}) => {
  const [strategy, setStrategy] = useState<
    'super_combinada' | 'fechamento_matematico' | 'aposta_multipla' | 'balanceada_estatistica'
  >('super_combinada');
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicket[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalBudget = pool.participants.reduce((acc, p) => acc + p.quotas * pool.quotaPrice, 0);
  const distinctNumbersCount = new Set(pool.participants.flatMap((p) => p.chosenNumbers)).size;

  const handleGenerate = () => {
    sounds.playBallTap(700);
    setIsGenerating(true);

    setTimeout(() => {
      const tickets = generateSuperCombinations(pool, config, strategy);
      setGeneratedTickets(tickets);
      setIsGenerating(false);
      sounds.playWinChime();

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#005CA9', '#009fe3', '#10b981', '#f59e0b'],
      });
    }, 450);
  };

  const handleSaveToPool = () => {
    if (generatedTickets.length === 0) return;
    sounds.playBallTap(600);
    onApplyTickets(generatedTickets);
  };

  const handleCopySummary = () => {
    if (generatedTickets.length === 0) return;
    const text = `🎯 *BOLÃO OFICIAL CAIXA: ${config.fullName}*\n` +
      `📋 *Bolão:* ${pool.title}\n` +
      `💰 *Arrecadado:* R$ ${totalBudget.toFixed(2)} (${pool.participants.length} participantes)\n\n` +
      `*JOGOS GERADOS (${generatedTickets.length} APOSTAS):*\n` +
      generatedTickets
        .map(
          (t, i) =>
            `Jogo ${i + 1}: [ ${t.numbers.map((n) => String(n).padStart(2, '0')).join(' - ')} ]`
        )
        .join('\n') +
      `\n\n🍀 Boa sorte ao grupo! Que venha a premiação máxima!`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Intro Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005CA9]">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Gerador Matemático de Combinação Vencedora</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Unificação das Escolhas dos Participantes & Otimização
            </h3>
            <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
              O algoritmo cruza todas as {distinctNumbersCount} dezenas indicadas pelos amigos do bolão, aplica matrizes de desdobramento e filtros probabilísticos reais da Caixa.
            </p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-500 font-medium">Orçamento Disponível</div>
            <div className="text-xl font-black font-mono text-[#005CA9]">
              R$ {totalBudget.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Strategy Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <button
            onClick={() => setStrategy('super_combinada')}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              strategy === 'super_combinada'
                ? 'bg-blue-50/70 border-[#005CA9] ring-2 ring-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <Wand2 className="w-4 h-4 text-[#005CA9] shrink-0" />
              <span>Super Combinada (Recomendada)</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Combina consenso dos participantes com filtros de par/ímpar e soma ideal.
            </p>
          </button>

          <button
            onClick={() => setStrategy('fechamento_matematico')}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              strategy === 'fechamento_matematico'
                ? 'bg-blue-50/70 border-[#005CA9] ring-2 ring-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Fechamento Matemático</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Matriz de cobertura para garantir Quadra/Quina sem redundâncias.
            </p>
          </button>

          <button
            onClick={() => setStrategy('aposta_multipla')}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              strategy === 'aposta_multipla'
                ? 'bg-blue-50/70 border-[#005CA9] ring-2 ring-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Aposta Múltipla Caixa</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              1 bilhete único de mais dezenas com prêmios multiplicados oficiais.
            </p>
          </button>

          <button
            onClick={() => setStrategy('balanceada_estatistica')}
            className={`p-3.5 rounded-xl text-left border transition-all ${
              strategy === 'balanceada_estatistica'
                ? 'bg-blue-50/70 border-[#005CA9] ring-2 ring-blue-200 shadow-xs'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs text-slate-900 mb-1">
              <Zap className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Estatística Histórica</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-tight">
              Mescla escolhas dos amigos com as dezenas mais frequentes e atrasadas da Caixa.
            </p>
          </button>
        </div>

        {/* Generate Action Button */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            {pool.participants.length} participantes · {distinctNumbersCount} dezenas distintas sugeridas
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-6 py-3 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-blue-900/20 flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Wand2 className="w-4 h-4" />
            <span>
              {isGenerating
                ? 'Calculando Matrizes...'
                : 'Gerar Combinação Vencedora com Todas as Possibilidades'}
            </span>
          </button>
        </div>
      </div>

      {/* Generated Results Preview */}
      {generatedTickets.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <div className="font-bold text-base text-slate-900 flex items-center gap-2">
                <span>Combinações Otimizadas Geradas</span>
                <span className="text-xs font-mono font-bold text-[#005CA9] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {generatedTickets.length} apostas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Custo total estimado:{' '}
                <strong className="text-slate-800 font-mono">
                  R$ {generatedTickets.reduce((acc, t) => acc + t.cost, 0).toFixed(2)}
                </strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar p/ WhatsApp'}</span>
              </button>

              <button
                onClick={handleSaveToPool}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Salvar Apostas no Bolão</span>
              </button>
            </div>
          </div>

          {/* Ticket items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {generatedTickets.map((t, idx) => (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-[#005CA9]">
                      Jogo #{idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      (R$ {t.cost.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                    <span>Confiança:</span>
                    <span className="font-bold text-emerald-700">{t.confidenceScore}%</span>
                  </div>
                </div>

                {/* Number balls */}
                <div className="flex flex-wrap gap-1.5">
                  {t.numbers.map((num) => (
                    <span
                      key={num}
                      className="w-8 h-8 rounded-full bg-white border border-slate-300 flex items-center justify-center font-mono font-bold text-xs text-slate-900 shadow-2xs"
                    >
                      {String(num).padStart(2, '0')}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 leading-snug">
                  {t.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
