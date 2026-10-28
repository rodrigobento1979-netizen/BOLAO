import React, { useState } from 'react';
import { X, Trophy, Plus, Sparkles, Check, Calculator, Info } from 'lucide-react';
import { BolaoPool, LotteryType, RegisteredUser } from '../types/lottery';
import { LOTTERIES_CONFIG } from '../data/lotteriesData';
import { sounds } from '../services/soundEffects';
import { generateCaixaBoleto } from '../services/paymentService';

interface NewPoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLottery: LotteryType;
  currentUser: RegisteredUser | null;
  onOpenAuthModal: () => void;
  onCreatePool: (newPool: BolaoPool) => void;
}

export const NewPoolModal: React.FC<NewPoolModalProps> = ({
  isOpen,
  onClose,
  defaultLottery,
  currentUser,
  onOpenAuthModal,
  onCreatePool,
}) => {
  const [selectedLottery, setSelectedLottery] = useState<LotteryType>(defaultLottery);
  const [organizerName, setOrganizerName] = useState(currentUser?.name || '');
  const [organizerPhone, setOrganizerPhone] = useState(currentUser?.phone || '');
  const [title, setTitle] = useState('');
  const [quotaPrice, setQuotaPrice] = useState(30);
  const [totalQuotas, setTotalQuotas] = useState(15);
  const [targetContestNumber, setTargetContestNumber] = useState(
    LOTTERIES_CONFIG[defaultLottery].nextContestNumber
  );
  const [selectedStrategy, setSelectedStrategy] = useState<'fechamento_munir' | 'hibrido' | 'democratica'>('fechamento_munir');
  const [endDate, setEndDate] = useState<string>(() => {
    const c = LOTTERIES_CONFIG[defaultLottery];
    return c.nextContestDate ? `${c.nextContestDate}T18:00` : '';
  });
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const config = LOTTERIES_CONFIG[selectedLottery];
  const totalBudget = totalQuotas * quotaPrice;
  const singleBetPrice = config.minPrice;
  const equivalentBets = Math.floor(totalBudget / singleBetPrice);

  const handleLotteryChange = (lottery: LotteryType) => {
    setSelectedLottery(lottery);
    const c = LOTTERIES_CONFIG[lottery];
    setTargetContestNumber(c.nextContestNumber);
    if (c.nextContestDate) {
      setEndDate(`${c.nextContestDate}T18:00`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sounds.playBallTap(600);

    const adminName = organizerName.trim() || (currentUser ? currentUser.name : 'Organizador do Bolão');
    const adminEmail = currentUser?.email || 'contato@bolao.com.br';
    const adminPhone = organizerPhone.trim() || (currentUser ? currentUser.phone : '');

    // Generate initial admin quota boleto
    const adminBoleto = generateCaixaBoleto(quotaPrice, adminName, title.trim());

    const newPool: BolaoPool = {
      id: `pool-${selectedLottery}-${Date.now()}`,
      title: title.trim(),
      lotteryType: selectedLottery,
      targetContestNumber: Number(targetContestNumber),
      targetContestDate: config.nextContestDate,
      quotaPrice: Number(quotaPrice),
      totalQuotas: Number(totalQuotas),
      selectedStrategy,
      status: 'open_bets',
      createdAt: new Date().toISOString(),
      endDate: endDate.trim() || undefined,
      notes: notes.trim() || undefined,
      createdByAdminName: adminName,
      participants: [
        {
          id: `part-admin-${Date.now()}`,
          userId: currentUser?.id,
          name: adminName,
          email: adminEmail,
          phone: adminPhone,
          quotas: 1,
          paid: true,
          chosenNumbers: config.id === 'megasena' ? [10, 23, 34, 42, 53, 58] : [1, 3, 5, 7, 8, 10, 11, 13, 14, 17, 20, 22, 24, 25, 2],
          joinedAt: new Date().toISOString(),
          boleto: { ...adminBoleto, status: 'pago' },
        },
      ],
      tickets: [],
    };

    onCreatePool(newPool);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header - Caixa Gradient */}
        <div className="bg-gradient-to-r from-[#002046] via-[#005CA9] to-[#0072CE] text-white p-5 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-300" />
              <span className="font-black text-lg tracking-tight">Criar Novo Bolão Inteligente</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-blue-100 mt-1 relative z-10">
            Acesso público e livre · Qualquer pessoa pode criar seu bolão com cotas e valor
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* Lottery Mode Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Modalidade de Loteria Caixa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['megasena', 'lotofacil', 'quina'] as LotteryType[]).map((lot) => {
                const isSelected = selectedLottery === lot;
                const c = LOTTERIES_CONFIG[lot];
                return (
                  <button
                    key={lot}
                    type="button"
                    onClick={() => handleLotteryChange(lot)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#005CA9] bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full mx-auto mb-1"
                      style={{ backgroundColor: c.accentColor }}
                    />
                    <div className="text-xs font-black text-slate-900">{c.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      R$ {c.minPrice.toFixed(2)}/aposta
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title and Organizer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Bolão *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Bolão dos Amigos - Mega Acumulada"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Seu Nome (Organizador) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Rodrigo Bento"
                value={organizerName}
                onChange={(e) => setOrganizerName(e.target.value)}
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white"
              />
            </div>
          </div>

          {/* Quotas & Price Simulator Live Calculation - Tipo Botão */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-[#C5DCF0] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <Calculator className="w-4 h-4 text-[#005CA9]" />
                <span>Cotas & Valor Arrecadado</span>
              </span>
              <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Total: R$ {totalBudget.toFixed(2)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Stepper Cotistas */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Quantidade de Cotas</span>
                  <span className="font-mono font-black text-slate-900 text-sm">{totalQuotas} cotas</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playBallTap(350);
                      setTotalQuotas((prev) => Math.max(2, prev - 1));
                    }}
                    className="w-8 h-8 rounded-md bg-white hover:bg-slate-200 text-slate-800 font-black text-base flex items-center justify-center shadow-xs active:scale-90"
                  >
                    -
                  </button>
                  <span className="font-mono font-black text-base text-[#005CA9]">{totalQuotas}</span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playBallTap(500);
                      setTotalQuotas((prev) => Math.min(100, prev + 1));
                    }}
                    className="w-8 h-8 rounded-md bg-[#005CA9] hover:bg-[#004889] text-white font-black text-base flex items-center justify-center shadow-xs active:scale-90"
                  >
                    +
                  </button>
                </div>
                {/* Presets */}
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[5, 10, 15, 20, 30].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(400 + num * 5);
                        setTotalQuotas(num);
                      }}
                      className={`h-7 rounded-md text-[11px] font-mono font-bold transition-all active:scale-95 ${
                        totalQuotas === num
                          ? 'bg-[#005CA9] text-white font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stepper Valor da Cota */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Valor por Cota</span>
                  <span className="font-mono font-black text-emerald-700 text-sm">R$ {quotaPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playBallTap(350);
                      setQuotaPrice((prev) => Math.max(5, prev - 5));
                    }}
                    className="w-8 h-8 rounded-md bg-white hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center justify-center shadow-xs active:scale-90"
                  >
                    -5
                  </button>
                  <span className="font-mono font-black text-base text-emerald-700">R$ {quotaPrice}</span>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playBallTap(500);
                      setQuotaPrice((prev) => Math.min(500, prev + 5));
                    }}
                    className="w-8 h-8 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center shadow-xs active:scale-90"
                  >
                    +5
                  </button>
                </div>
                {/* Presets */}
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[15, 20, 30, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(450 + val * 2);
                        setQuotaPrice(val);
                      }}
                      className={`h-7 rounded-md text-[11px] font-mono font-bold transition-all active:scale-95 ${
                        quotaPrice === val
                          ? 'bg-emerald-600 text-white font-black'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      R${val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 pt-2 flex items-center justify-between border-t border-slate-200">
              <span>{totalQuotas} cotistas × R$ {quotaPrice.toFixed(2)}</span>
              <span className="font-mono font-bold text-[#005CA9]">
                = {equivalentBets} jogos simples ({config.name})
              </span>
            </div>
          </div>

          {/* 3 Specialist Strategies Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Estratégia Matemática (Conselho de Especialistas):
            </label>

            {/* Option 1: Munir / UFMG Fechamento */}
            <div
              onClick={() => setSelectedStrategy('fechamento_munir')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStrategy === 'fechamento_munir'
                  ? 'border-[#005CA9] bg-blue-50/80 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900">
                      1. Fechamento Munir & UFMG (Amplitude Máxima)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Desdobra o total arrecadado ({equivalentBets} jogos) combinando as dezenas de todos os cotistas sem repetições inúteis, com filtros de paridade 3P/3I e garantia matemática de Quadra/Quina.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedStrategy === 'fechamento_munir'
                    ? 'border-[#005CA9] bg-[#005CA9] text-white'
                    : 'border-slate-300'
                }`}>
                  {selectedStrategy === 'fechamento_munir' && <Check className="w-3 h-3" />}
                </div>
              </div>
            </div>

            {/* Option 2: Híbrido */}
            <div
              onClick={() => setSelectedStrategy('hibrido')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStrategy === 'hibrido'
                  ? 'border-[#005CA9] bg-blue-50/80 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-slate-900">
                    2. Estratégia Híbrida (Cartão Âncora + Amplitude)
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Gera 1 Super Aposta Múltipla Caixa (7 ou 8 dezenas com as mais votadas pelo grupo) + jogos simples distribuindo as demais dezenas indicadas.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedStrategy === 'hibrido'
                    ? 'border-[#005CA9] bg-[#005CA9] text-white'
                    : 'border-slate-300'
                }`}>
                  {selectedStrategy === 'hibrido' && <Check className="w-3 h-3" />}
                </div>
              </div>
            </div>

            {/* Option 3: Democrática */}
            <div
              onClick={() => setSelectedStrategy('democratica')}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                selectedStrategy === 'democratica'
                  ? 'border-[#005CA9] bg-blue-50/80 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-xs font-black text-slate-900">
                    3. Democrática com Expansão Estatística
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                    Preserva fielmente o volante original de cada um dos {totalQuotas} cotistas e gera os {Math.max(0, equivalentBets - totalQuotas)} jogos restantes cobrindo as dezenas mais quentes.
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                  selectedStrategy === 'democratica'
                    ? 'border-[#005CA9] bg-[#005CA9] text-white'
                    : 'border-slate-300'
                }`}>
                  {selectedStrategy === 'democratica' && <Check className="w-3 h-3" />}
                </div>
              </div>
            </div>
          </div>

          {/* Data Fim / Encerramento das Apostas (Arquivamento Automático) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Data e Horário de Encerramento (Data Fim)
              </label>
              <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded">
                Arquivamento
              </span>
            </div>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-[#005CA9]"
            />
            <span className="text-[11px] text-slate-500 block pt-0.5 leading-snug">
              Ao atingir esta data/hora ou ao ser arquivado pelo organizador, o bolão é ocultado do modal de novas cotas para não poluir a interface.
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações / Instruções para os Participantes
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Pagamento da cota via Pix até as 18h do dia do sorteio. Divisão 100% igualitária de qualquer prêmio."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#005CA9] to-[#0072CE] hover:from-[#004889] hover:to-[#005CA9] text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-md shadow-blue-900/20 active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Abrir Bolão Oficial</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
