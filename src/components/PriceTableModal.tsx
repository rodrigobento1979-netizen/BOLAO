import React from 'react';
import { X, Info, ShieldCheck } from 'lucide-react';
import { LotteryConfig } from '../types/lottery';

interface PriceTableModalProps {
  config: LotteryConfig;
  isOpen: boolean;
  onClose: () => void;
  currentBudget: number;
}

export const PriceTableModal: React.FC<PriceTableModalProps> = ({
  config,
  isOpen,
  onClose,
  currentBudget,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Caixa Blue Style */}
        <div className="bg-[#005CA9] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: config.accentColor }}
            />
            <div>
              <h3 className="font-bold text-lg text-white">
                Tabela Oficial de Preços Caixa & Desdobramentos
              </h3>
              <p className="text-xs text-blue-100">
                {config.fullName} · Valores vigentes oficiais das Loterias Caixa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Budget Insight Banner */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs text-slate-500 font-medium">
                Orçamento Atual do seu Bolão
              </div>
              <div className="text-xl font-bold font-mono text-[#005CA9]">
                R$ {currentBudget.toFixed(2)}
              </div>
            </div>
            <div className="text-xs text-slate-700 max-w-sm">
              Linhas destacadas em azul indicam apostas múltiplas que seu bolão já consegue pagar com o total arrecadado!
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Qtd. Dezenas</th>
                  <th className="py-3 px-4">Valor Oficial (R$)</th>
                  <th className="py-3 px-4">Apostas Simples Equivalentes</th>
                  <th className="py-3 px-4">Chance de Prêmio Máximo</th>
                  <th className="py-3 px-4 text-right">Status Bolão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {config.priceTable.map((row) => {
                  const canAfford = currentBudget >= row.price;
                  const isMin = row.numbers === config.minNumbers;

                  return (
                    <tr
                      key={row.numbers}
                      className={`transition-colors ${
                        canAfford
                          ? 'bg-blue-50/50 hover:bg-blue-100/40'
                          : 'hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2 font-sans">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono text-white shadow-2xs"
                            style={{ backgroundColor: config.accentColor }}
                          >
                            {row.numbers}
                          </span>
                          <span>
                            {row.numbers} dezenas
                            {isMin && (
                              <span className="ml-1 text-[10px] text-slate-500 font-normal">
                                (aposta simples)
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#005CA9]">
                        R$ {row.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {row.equivalentSingleBets.toLocaleString('pt-BR')} jogos
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        1 em {row.oddsJackpot.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canAfford ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-emerald-700">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Disponível
                          </span>
                        ) : (
                          <span className="text-[11px] font-sans text-slate-400">
                            Faltam R$ {(row.price - currentBudget).toFixed(2)}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mathematical Educational Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Info className="w-4 h-4 text-[#005CA9] shrink-0" />
              <span>Como funcionam as apostas múltiplas nas Loterias Caixa:</span>
            </div>
            <p>
              Ao marcar mais números em um único bilhete (ex: 8 números na Mega-Sena ou 18 na Lotofácil), você está pagando exatamente a combinação matemática equivalente de jogos simples.
            </p>
            <p>
              <strong>Vantagem de Multiplicação:</strong> Se você acertar a Quadra em um jogo de 8 números da Mega-Sena, você não ganha apenas 1 Quadra, mas sim <strong>6 Quadras</strong> simultâneas! Se acertar a Quina, ganha <strong>3 Quinas e 15 Quadras</strong>!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            Fechar Tabela
          </button>
        </div>
      </div>
    </div>
  );
};
