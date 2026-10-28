import React, { useState } from 'react';
import { BolaoPool, GeneratedTicket, LotteryConfig } from '../types/lottery';
import { FileText, Printer, Share2, Check, Plus, Trash2, Dices } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TicketsListProps {
  pool: BolaoPool;
  config: LotteryConfig;
  onUpdateTickets: (tickets: GeneratedTicket[]) => void;
  onOpenGeneratorTab: () => void;
}

export const TicketsList: React.FC<TicketsListProps> = ({
  pool,
  config,
  onUpdateTickets,
  onOpenGeneratorTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [manualNumbers, setManualNumbers] = useState<string>('');
  const [showManualAdd, setShowManualAdd] = useState(false);

  const totalCost = pool.tickets.reduce((acc, t) => acc + t.cost, 0);

  const handleShareWhatsApp = () => {
    sounds.playBallTap(500);
    const totalBudget = pool.participants.reduce((acc, p) => acc + p.quotas * pool.quotaPrice, 0);

    const participantsList = pool.participants
      .map((p) => `• ${p.name}: ${p.quotas} cota(s) (${p.paid ? '✅ Pago' : '⏳ Pendente'})`)
      .join('\n');

    const gamesList = pool.tickets
      .map(
        (t, idx) =>
          `*Jogo ${idx + 1}:* ${t.numbers.map((n) => String(n).padStart(2, '0')).join(' - ')}`
      )
      .join('\n');

    const message =
      `🍀 *BOLÃO OFICIAL CAIXA: ${config.fullName.toUpperCase()}*\n` +
      `📌 *Bolão:* ${pool.title}\n` +
      `🎯 *Concurso Alvo:* Nº ${pool.targetContestNumber} (${pool.targetContestDate})\n` +
      `💰 *Cota:* R$ ${pool.quotaPrice.toFixed(2)} | *Arrecadado:* R$ ${totalBudget.toFixed(2)}\n\n` +
      `👥 *PARTICIPANTES:*\n${participantsList}\n\n` +
      `🎟️ *JOGOS REGISTRADOS (${pool.tickets.length}):*\n${gamesList}\n\n` +
      `Boa sorte a todos os participantes do bolão! 🏆💰`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyClipboard = () => {
    sounds.playBallTap(520);
    const gamesList = pool.tickets
      .map(
        (t, idx) =>
          `Jogo ${idx + 1}: [ ${t.numbers.map((n) => String(n).padStart(2, '0')).join(' - ')} ]`
      )
      .join('\n');

    navigator.clipboard.writeText(gamesList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    sounds.playBallTap(500);
    window.print();
  };

  const handleAddManualTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const parts = manualNumbers
      .split(/[\s,.-]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= config.totalNumbers);

    const uniqueNums = Array.from(new Set(parts)).sort((a, b) => a - b);
    if (uniqueNums.length < config.minNumbers) {
      alert(`Insira no mínimo ${config.minNumbers} dezenas válidas.`);
      return;
    }

    const newTicket: GeneratedTicket = {
      id: `ticket-manual-${Date.now()}`,
      ticketNumber: pool.tickets.length + 1,
      numbers: uniqueNums,
      cost: config.minPrice,
      strategyUsed: 'consenso_participantes',
      confidenceScore: 85,
      rationale: 'Jogo adicionado manualmente pelo organizador.',
    };

    onUpdateTickets([...pool.tickets, newTicket]);
    setManualNumbers('');
    setShowManualAdd(false);
  };

  const handleRemoveTicket = (id: string) => {
    onUpdateTickets(pool.tickets.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-5 sm:space-y-6 text-slate-800">
      {/* Header Bar */}
      <div className="bg-white border border-[#C5DCF0] rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#005CA9]">
            <FileText className="w-4 h-4" />
            <span>Bilhetes Registrados do Bolão</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
            {pool.tickets.length} {pool.tickets.length === 1 ? 'Aposta Oficial' : 'Apostas Oficiais'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Custo total das apostas:{' '}
            <strong className="text-[#005CA9] font-mono font-black">R$ {totalCost.toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {pool.tickets.length === 0 ? (
            <button
              onClick={onOpenGeneratorTab}
              className="min-h-[42px] px-4 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <Dices className="w-4 h-4" />
              <span>Gerar Combinações com as Dezenas</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCopyClipboard}
                className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#C5DCF0] active:scale-95 shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="min-h-[38px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handlePrint}
                className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-[#C5DCF0] active:scale-95 shadow-2xs"
                title="Imprimir volantes"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowManualAdd(!showManualAdd)}
            className="min-h-[38px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005CA9] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Jogo</span>
          </button>
        </div>
      </div>

      {/* Manual Add Card */}
      {showManualAdd && (
        <form
          onSubmit={handleAddManualTicket}
          className="p-4 sm:p-5 bg-white border border-[#C5DCF0] rounded-2xl space-y-3 animate-fade-in shadow-xs"
        >
          <div className="text-xs font-bold text-slate-800">
            Adicionar Jogo Manualmente (Ex: bilhete físico comprado na lotérica)
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Digite as dezenas separadas por espaço ou vírgula (ex: 05 10 23 34 42 53)"
              value={manualNumbers}
              onChange={(e) => setManualNumbers(e.target.value)}
              className="flex-1 min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#005CA9]"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-xs font-bold shrink-0 active:scale-95"
            >
              Adicionar
            </button>
          </div>
        </form>
      )}

      {/* Tickets List View */}
      {pool.tickets.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white border border-dashed border-[#C5DCF0] rounded-2xl space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mx-auto text-[#005CA9]">
            <FileText className="w-6 h-6" />
          </div>
          <div className="text-sm font-bold text-slate-900">
            Nenhum bilhete salvo ainda no bolão
          </div>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Após os participantes escolherem suas dezenas, gere as combinações otimizadas pelo simulador matemático.
          </p>
          <button
            onClick={onOpenGeneratorTab}
            className="min-h-[44px] px-5 py-2.5 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>Abrir Simulador & Gerar Jogos</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {pool.tickets.map((t, idx) => (
            <div
              key={t.id}
              className="p-4 bg-white border border-[#C5DCF0] rounded-2xl space-y-3 relative group hover:border-[#005CA9] transition-all shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-mono text-[#005CA9]">
                  Jogo #{idx + 1}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    R$ {t.cost.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemoveTicket(t.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Excluir aposta"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Number Balls with 3D Spherical Effect */}
              <div className="flex flex-wrap gap-1.5">
                {t.numbers.map((n) => (
                  <span
                    key={n}
                    className="w-8 h-8 rounded-full ball-3d-mega text-white flex items-center justify-center font-mono font-black text-xs shadow-xs"
                  >
                    {String(n).padStart(2, '0')}
                  </span>
                ))}
              </div>

              {t.rationale && (
                <div className="text-[11px] text-slate-500 leading-tight pt-1 border-t border-slate-100">
                  {t.rationale}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
