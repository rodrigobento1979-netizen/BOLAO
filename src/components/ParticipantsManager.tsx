import React, { useState } from 'react';
import { Participant, LotteryConfig } from '../types/lottery';
import { UserPlus, Trash2, CheckCircle2, Clock, Sparkles, Dices, ChevronDown, ChevronUp, Edit3, QrCode, FileText } from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { generateCaixaBoleto } from '../services/paymentService';

interface ParticipantsManagerProps {
  participants: Participant[];
  config: LotteryConfig;
  quotaPrice: number;
  poolTitle: string;
  onUpdateParticipants: (participants: Participant[]) => void;
  onOpenBoleto: (participant: Participant) => void;
}

export const ParticipantsManager: React.FC<ParticipantsManagerProps> = ({
  participants,
  config,
  quotaPrice,
  poolTitle,
  onUpdateParticipants,
  onOpenBoleto,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quotas, setQuotas] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [activeVolanteParticipantId, setActiveVolanteParticipantId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');

  // Toggle number in participant's volante
  const toggleNumber = (num: number, currentList: number[], onChange: (updated: number[]) => void) => {
    sounds.playBallTap(350 + num * 6);
    if (currentList.includes(num)) {
      onChange(currentList.filter((n) => n !== num));
    } else {
      if (currentList.length >= config.maxNumbers) return;
      onChange([...currentList, num].sort((a, b) => a - b));
    }
  };

  // Surpresinha / quick random pick
  const handleRandomPick = (count: number, onChange: (updated: number[]) => void) => {
    sounds.playBallTap(600);
    const chosen = new Set<number>();
    while (chosen.size < count) {
      const rand = Math.floor(Math.random() * config.totalNumbers) + 1;
      chosen.add(rand);
    }
    onChange(Array.from(chosen).sort((a, b) => a - b));
  };

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    sounds.playBallTap(550);

    let finalNumbers = [...selectedNumbers];
    if (finalNumbers.length === 0) {
      const chosen = new Set<number>();
      while (chosen.size < config.minNumbers) {
        chosen.add(Math.floor(Math.random() * config.totalNumbers) + 1);
      }
      finalNumbers = Array.from(chosen).sort((a, b) => a - b);
    }

    const quotaCount = Math.max(1, quotas);
    const boleto = generateCaixaBoleto(quotaCount * quotaPrice, name.trim(), poolTitle);

    const newParticipant: Participant = {
      id: `part-${Date.now()}`,
      name: name.trim(),
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      quotas: quotaCount,
      paid: false,
      chosenNumbers: finalNumbers,
      joinedAt: new Date().toISOString(),
      boleto,
    };

    onUpdateParticipants([...participants, newParticipant]);
    setName('');
    setEmail('');
    setPhone('');
    setQuotas(1);
    setSelectedNumbers([]);
    setIsFormOpen(false);
  };

  const handleRemoveParticipant = (id: string) => {
    onUpdateParticipants(participants.filter((p) => p.id !== id));
  };

  const handleTogglePaid = (id: string) => {
    onUpdateParticipants(
      participants.map((p) => {
        if (p.id === id) {
          const nextPaid = !p.paid;
          return {
            ...p,
            paid: nextPaid,
            boleto: p.boleto ? { ...p.boleto, status: nextPaid ? 'pago' : 'pendente' } : undefined,
          };
        }
        return p;
      })
    );
  };

  const handleUpdateParticipantNumbers = (id: string, updatedNumbers: number[]) => {
    onUpdateParticipants(
      participants.map((p) => (p.id === id ? { ...p, chosenNumbers: updatedNumbers } : p))
    );
  };

  const totalQuotas = participants.reduce((acc, p) => acc + p.quotas, 0);
  const totalPaidQuotas = participants.filter((p) => p.paid).reduce((acc, p) => acc + p.quotas, 0);
  const totalArrecadado = totalQuotas * quotaPrice;
  const totalDisponivel = totalPaidQuotas * quotaPrice;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Financial Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white border border-[#C5DCF0] p-3.5 sm:p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Participantes</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            {participants.length} pessoas
          </div>
        </div>

        <div className="bg-white border border-[#C5DCF0] p-3.5 sm:p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total de Cotas</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 mt-1">
            {totalQuotas} cotas
          </div>
        </div>

        <div className="bg-white border border-[#C5DCF0] p-3.5 sm:p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Orçamento Previsto</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#005CA9] mt-1">
            R$ {totalArrecadado.toFixed(2)}
          </div>
        </div>

        <div className="bg-white border border-[#C5DCF0] p-3.5 sm:p-4 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Confirmado (Pix)</div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 mt-1">
            R$ {totalDisponivel.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add Participant Card / Accordion */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#005CA9]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Cadastrar Novo Participante & Emitir Boleto de Cota
              </h3>
              <p className="text-xs text-slate-500">
                Preencha nome, e-mail e telefone/WhatsApp para emissão do boleto Caixa e escolha das dezenas
              </p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            {isFormOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isFormOpen && (
          <form onSubmit={handleAddParticipant} className="p-6 border-t border-slate-200 space-y-5 bg-slate-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: João da Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  E-mail <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="email"
                  placeholder="joao@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Telefone / WhatsApp <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#005CA9]"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-4 bg-blue-50/60 p-3 rounded-2xl border border-blue-200/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase tracking-wide">
                    Quantidade de Cotas
                  </label>
                  <span className="text-xs font-mono font-bold text-[#005CA9]">
                    = R$ {(quotas * quotaPrice).toFixed(2)} total
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Stepper Buttons */}
                  <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(350);
                        setQuotas(Math.max(1, quotas - 1));
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-lg flex items-center justify-center transition-all active:scale-90"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-black text-lg text-slate-900">
                      {quotas}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(500);
                        setQuotas(Math.min(50, quotas + 1));
                      }}
                      className="w-9 h-9 rounded-lg bg-[#005CA9] text-white hover:bg-[#004889] font-black text-lg flex items-center justify-center transition-all active:scale-90"
                    >
                      +
                    </button>
                  </div>

                  {/* Preset Pills (Tipo Botão) */}
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {[1, 2, 3, 5, 10].map((num) => {
                      const isSel = quotas === num;
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => {
                            sounds.playBallTap(400 + num * 20);
                            setQuotas(num);
                          }}
                          className={`h-9 px-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center active:scale-95 ${
                            isSel
                              ? 'bg-[#005CA9] text-white shadow-sm ring-2 ring-blue-300 font-black'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {num} {num === 1 ? 'cota' : 'cotas'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Volante Digital Selector for this new participant */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <span>Marcar Dezenas no Volante ({selectedNumbers.length}/{config.defaultDrawNumbers} recomendadas)</span>
                  {selectedNumbers.length > 0 && (
                    <span className="text-[#005CA9] font-mono font-bold">
                      [{selectedNumbers.join(', ')}]
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleRandomPick(config.defaultDrawNumbers, setSelectedNumbers)}
                    className="h-8 px-2.5 text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl flex items-center gap-1 font-bold transition-transform active:scale-95 shadow-2xs"
                  >
                    <Dices className="w-3.5 h-3.5 text-amber-600" />
                    <span>🎲 Surpresinha</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sounds.playBallTap(560);
                      const evens = Array.from({ length: config.totalNumbers }, (_, i) => i + 1).filter(n => n % 2 === 0);
                      const odds = Array.from({ length: config.totalNumbers }, (_, i) => i + 1).filter(n => n % 2 !== 0);
                      const half = Math.floor(config.defaultDrawNumbers / 2);
                      const chosen = new Set<number>();
                      while (chosen.size < half) chosen.add(evens[Math.floor(Math.random() * evens.length)]);
                      while (chosen.size < config.defaultDrawNumbers) chosen.add(odds[Math.floor(Math.random() * odds.length)]);
                      setSelectedNumbers(Array.from(chosen).sort((a, b) => a - b));
                    }}
                    className="h-8 px-2.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-xl font-semibold transition-transform active:scale-95"
                  >
                    <span>⚖️ Par/Ímpar</span>
                  </button>

                  {selectedNumbers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(300);
                        setSelectedNumbers([]);
                      }}
                      className="h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold transition-colors"
                    >
                      Limpar
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of numbers */}
              <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 max-h-56 overflow-y-auto">
                {Array.from({ length: config.totalNumbers }, (_, i) => i + 1).map((n) => {
                  const isChecked = selectedNumbers.includes(n);
                  return (
                    <button
                      key={n}
                      type="button"
                      onClick={() => toggleNumber(n, selectedNumbers, setSelectedNumbers)}
                      className={`h-9 sm:h-9 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center active:scale-90 ${
                        isChecked
                          ? 'ball-3d-active-caixa text-white shadow-sm ring-2 ring-[#FFB612] scale-105 z-10'
                          : 'bg-slate-50 hover:bg-blue-50 text-slate-700 border border-slate-200 shadow-2xs'
                      }`}
                    >
                      {String(n).padStart(2, '0')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>Salvar & Emitir Boleto</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Participants Roster with Filter Buttons (Tipo Botão) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-slate-500 px-1">
          <div>
            <span className="font-black text-slate-900 text-sm">
              Participantes ({participants.length})
            </span>
            <span className="hidden sm:inline text-slate-400 ml-2">
              Toque no participante para editar ou ver o Pix
            </span>
          </div>

          {/* Quick Filter Buttons (Tipo Botão) */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                sounds.playBallTap(450);
                setFilterStatus('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-[#005CA9] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({participants.length})
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playBallTap(470);
                setFilterStatus('paid');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'paid'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pagos ({participants.filter(p => p.paid).length})
            </button>

            <button
              type="button"
              onClick={() => {
                sounds.playBallTap(430);
                setFilterStatus('pending');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({participants.filter(p => !p.paid).length})
            </button>
          </div>
        </div>

        {participants.length === 0 ? (
          <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
            Nenhum participante adicionado ainda. Adicione os amigos do bolão acima!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {participants
              .filter((p) => {
                if (filterStatus === 'paid') return p.paid;
                if (filterStatus === 'pending') return !p.paid;
                return true;
              })
              .map((p) => {
              const isVolanteOpen = activeVolanteParticipantId === p.id;
              const contributionVal = p.quotas * quotaPrice;

              return (
                <div
                  key={p.id}
                  className="bg-white border border-[#C5DCF0] rounded-2xl overflow-hidden transition-all hover:border-[#005CA9] shadow-xs"
                >
                  <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#005CA9] text-white flex items-center justify-center font-bold text-sm font-mono shadow-xs shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-black text-sm text-slate-900 flex items-center gap-2 truncate">
                          <span className="truncate">{p.name}</span>
                          {p.phone && (
                            <span className="text-xs text-slate-400 font-normal shrink-0">
                              · {p.phone}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="font-mono font-bold text-slate-700">
                            {p.quotas} {p.quotas === 1 ? 'cota' : 'cotas'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[#005CA9] font-black">
                            R$ {contributionVal.toFixed(2)}
                          </span>
                          {p.email && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-400 truncate max-w-[120px]">{p.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Numbers preview */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {p.chosenNumbers.slice(0, 6).map((num) => (
                        <span
                          key={num}
                          className="w-7 h-7 rounded-full ball-3d-mega text-white flex items-center justify-center text-xs font-mono font-black shadow-xs"
                        >
                          {String(num).padStart(2, '0')}
                        </span>
                      ))}
                      {p.chosenNumbers.length > 6 && (
                        <span className="text-xs font-mono text-slate-500 font-bold ml-1">
                          +{p.chosenNumbers.length - 6}
                        </span>
                      )}
                    </div>

                    {/* Actions: View Boleto, Paid toggle, Edit numbers, Remove */}
                    <div className="flex items-center flex-wrap gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Boleto button */}
                      <button
                        onClick={() => onOpenBoleto(p)}
                        className="min-h-[36px] px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#005CA9] border border-blue-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95"
                        title="Ver Boleto / Pix Caixa"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Boleto / Pix</span>
                      </button>

                      <button
                        onClick={() => handleTogglePaid(p.id)}
                        className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors active:scale-95 ${
                          p.paid
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {p.paid ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Pago</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pendente</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() =>
                          setActiveVolanteParticipantId(isVolanteOpen ? null : p.id)
                        }
                        className="min-h-[36px] px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isVolanteOpen ? 'Fechar' : 'Dezenas'}</span>
                      </button>

                      <button
                        onClick={() => handleRemoveParticipant(p.id)}
                        className="min-h-[36px] min-w-[36px] p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center active:scale-95 ml-auto sm:ml-0"
                        title="Remover participante"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Inline Volante Editor for this participant */}
                  {isVolanteOpen && (
                    <div className="px-5 pb-5 pt-3 border-t border-slate-200 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-bold">
                          Dezenas da sorte de {p.name} ({p.chosenNumbers.length} selecionadas):
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleRandomPick(config.defaultDrawNumbers, (nums) =>
                                handleUpdateParticipantNumbers(p.id, nums)
                              )
                            }
                            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Dices className="w-3 h-3 text-amber-600" />
                            <span>Nova Surpresinha</span>
                          </button>
                          <button
                            onClick={() => handleUpdateParticipantNumbers(p.id, [])}
                            className="text-[11px] text-rose-600 hover:underline"
                          >
                            Zerar
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 rounded-2xl bg-white border border-slate-200 max-h-56 overflow-y-auto">
                        {Array.from({ length: config.totalNumbers }, (_, i) => i + 1).map((n) => {
                          const isSel = p.chosenNumbers.includes(n);
                          return (
                            <button
                              key={n}
                              type="button"
                              onClick={() =>
                                toggleNumber(n, p.chosenNumbers, (nums) =>
                                  handleUpdateParticipantNumbers(p.id, nums)
                                )
                              }
                              className={`h-9 rounded-xl text-xs font-mono font-black transition-all flex items-center justify-center active:scale-90 ${
                                isSel
                                  ? 'ball-3d-active-caixa text-white shadow-sm ring-2 ring-[#FFB612] scale-105 z-10'
                                  : 'bg-slate-50 text-slate-800 hover:bg-blue-50 border border-slate-200 shadow-2xs'
                              }`}
                            >
                              {String(n).padStart(2, '0')}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
