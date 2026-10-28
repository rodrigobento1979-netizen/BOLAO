import React, { useState } from 'react';
import { X, Dices, QrCode, CheckCircle2, Copy, Check, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { BolaoPool, LotteryConfig, Participant } from '../types/lottery';
import { sounds } from '../services/soundEffects';
import { generateCaixaBoleto } from '../services/paymentService';
import { DEFAULT_PIX_CONFIG, generatePixPayload, generatePixQrCodeDataUrl } from '../services/pixService';

interface QuickJoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: BolaoPool;
  config: LotteryConfig;
  onAddParticipant: (participant: Participant) => void;
}

export const QuickJoinModal: React.FC<QuickJoinModalProps> = ({
  isOpen,
  onClose,
  pool,
  config,
  onAddParticipant,
}) => {
  const [step, setStep] = useState<'form' | 'pix'>('form');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quotas, setQuotas] = useState(1);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [createdParticipant, setCreatedParticipant] = useState<Participant | null>(null);
  const [pixQrDataUrl, setPixQrDataUrl] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const isArchived = pool.status === 'archived';
  const isExpired = Boolean(pool.endDate && new Date(pool.endDate).getTime() < Date.now());
  const isClosed = isArchived || isExpired;

  const totalAmount = quotas * pool.quotaPrice;
  const numbersNeeded = config.defaultDrawNumbers;

  // Toggle number in participant's volante
  const toggleNumber = (num: number) => {
    sounds.playBallTap(320 + num * 7);
    if (selectedNumbers.includes(num)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== num));
    } else {
      if (selectedNumbers.length >= config.maxNumbers) return;
      setSelectedNumbers([...selectedNumbers, num].sort((a, b) => a - b));
    }
  };

  // Surpresinha / quick random pick
  const handleRandomPick = () => {
    sounds.playBallTap(620);
    const chosen = new Set<number>();
    while (chosen.size < numbersNeeded) {
      const rand = Math.floor(Math.random() * config.totalNumbers) + 1;
      chosen.add(rand);
    }
    setSelectedNumbers(Array.from(chosen).sort((a, b) => a - b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isClosed) return;

    sounds.playBallTap(650);

    // If no numbers chosen, pick automatically
    let finalNumbers = [...selectedNumbers];
    if (finalNumbers.length === 0) {
      const chosen = new Set<number>();
      while (chosen.size < numbersNeeded) {
        chosen.add(Math.floor(Math.random() * config.totalNumbers) + 1);
      }
      finalNumbers = Array.from(chosen).sort((a, b) => a - b);
    }

    const quotaCount = Math.max(1, quotas);
    const boleto = generateCaixaBoleto(quotaCount * pool.quotaPrice, name.trim(), pool.title);

    const newPart: Participant = {
      id: `part-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      quotas: quotaCount,
      paid: false,
      chosenNumbers: finalNumbers,
      joinedAt: new Date().toISOString(),
      boleto,
    };

    // Generate real Pix QR code
    try {
      const res = await generatePixQrCodeDataUrl(
        DEFAULT_PIX_CONFIG,
        quotaCount * pool.quotaPrice,
        `Cota ${name.trim().substring(0, 15)}`
      );
      setPixQrDataUrl(res.qrCodeDataUrl);
    } catch {
      // fallback
    }

    setCreatedParticipant(newPart);
    onAddParticipant(newPart);
    setStep('pix');
  };

  const handleCopyPix = () => {
    sounds.playBallTap(500);
    const pixPayload = createdParticipant?.boleto?.pixCopyPaste || 
      generatePixPayload(DEFAULT_PIX_CONFIG, totalAmount, `Cota ${name}`);
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🍀 Olá! Acabei de garantir minha cota no *${pool.title}* (${config.fullName})!\n` +
      `👤 Participante: ${name}\n` +
      `💰 Valor: R$ ${totalAmount.toFixed(2)} (${quotas} ${quotas === 1 ? 'cota' : 'cotas'})\n` +
      `🔢 Meus números da sorte: ${selectedNumbers.join(', ')}\n` +
      `Já vou realizar o Pix de confirmação!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in text-slate-800">
      <div className="bg-white border border-slate-200/80 rounded-t-3xl sm:rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header - Caixa Blue Gradient & Emblems */}
        <div className="bg-gradient-to-r from-[#00386E] via-[#005CA9] to-[#004889] text-white p-4 sm:p-6 shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFB612] shadow-sm" />
              <div className="text-xs uppercase tracking-widest font-black text-blue-100">
                Loterias Caixa · {config.fullName}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight relative z-10">
            {step === 'form' ? 'Garantir Minha Cota no Bolão' : 'Pagar Cota via Pix'}
          </h3>

          <div className="flex items-center gap-2 text-xs text-blue-100 mt-1 relative z-10 font-mono">
            <span className="truncate max-w-[200px] sm:max-w-none">{pool.title}</span>
            <span>·</span>
            <span className="text-[#FFB612] font-black">R$ {pool.quotaPrice.toFixed(2)} / cota</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          {step === 'form' ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Closed / Archived Warning */}
              {isClosed && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-3 text-xs text-rose-900 shadow-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-sm font-black text-rose-950 block">
                      Apostas Encerradas para este Bolão
                    </strong>
                    <span className="text-rose-800 mt-0.5 block leading-relaxed">
                      {isArchived
                        ? 'Este bolão foi arquivado pelo organizador e não aceita mais novas cotas.'
                        : `O prazo de participação expirou em ${pool.endDate ? new Date(pool.endDate).toLocaleString('pt-BR') : pool.targetContestDate}.`}
                    </span>
                  </div>
                </div>
              )}

              {/* Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Seu Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={isClosed}
                    autoFocus
                    placeholder="Ex: Carlos Eduardo Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 px-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Apenas o nome é obrigatório para registrar seu bilhete no bolão.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      WhatsApp / Celular <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      E-mail <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-[#005CA9] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* Quotas Selector - Modern Button Controls (Tipo Botão) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Quantidade de Cotas
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Escolha no botão ou ajuste no + / -
                    </span>
                  </div>

                  {/* Stepper + Total Card */}
                  <div className="flex items-center justify-between p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playBallTap(350);
                          setQuotas(Math.max(1, quotas - 1));
                        }}
                        className="w-11 h-11 rounded-xl bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 font-black text-xl flex items-center justify-center transition-transform active:scale-90 shadow-xs"
                      >
                        -
                      </button>
                      <div className="w-14 text-center">
                        <span className="font-mono font-black text-2xl text-slate-900 leading-none block">
                          {quotas}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-500">
                          {quotas === 1 ? 'Cota' : 'Cotas'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playBallTap(500);
                          setQuotas(Math.min(50, quotas + 1));
                        }}
                        className="w-11 h-11 rounded-xl bg-[#005CA9] text-white hover:bg-[#004889] font-black text-xl flex items-center justify-center transition-transform active:scale-90 shadow-xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right pr-2">
                      <div className="text-[11px] text-slate-500 font-semibold uppercase">Total a Pagar</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-[#005CA9]">
                        R$ {totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Quick Preset Buttons (Tipo Botão) */}
                  <div className="grid grid-cols-5 gap-1.5">
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
                          className={`h-9 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center active:scale-95 ${
                            isSel
                              ? 'bg-[#005CA9] text-white shadow-sm ring-2 ring-blue-300 scale-[1.02]'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {num} {num === 1 ? 'cota' : 'cotas'}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Volante Interativo Touch-First Tipo Botão */}
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                        Volante de Dezenas
                      </span>
                      <span
                        className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full transition-colors ${
                          selectedNumbers.length === numbersNeeded
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-blue-100 text-[#005CA9]'
                        }`}
                      >
                        {selectedNumbers.length} / {numbersNeeded} {selectedNumbers.length === numbersNeeded ? '✓ Completo' : 'marcadas'}
                      </span>
                    </div>
                    <span className="block text-[11px] text-slate-500 mt-0.5">
                      Toque nas dezenas do volante ou use os botões rápidos abaixo
                    </span>
                  </div>

                  {/* Smart Assistant Buttons (Tipo Botão) */}
                  <div className="flex items-center flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={handleRandomPick}
                      className="h-8 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-2xs"
                      title="Sortear números aleatoriamente"
                    >
                      <Dices className="w-3.5 h-3.5 text-amber-600" />
                      <span>🎲 Surpresinha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.playBallTap(580);
                        const evens = Array.from({ length: config.totalNumbers }, (_, i) => i + 1).filter(n => n % 2 === 0);
                        const odds = Array.from({ length: config.totalNumbers }, (_, i) => i + 1).filter(n => n % 2 !== 0);
                        const half = Math.floor(numbersNeeded / 2);
                        const chosen = new Set<number>();
                        while (chosen.size < half) chosen.add(evens[Math.floor(Math.random() * evens.length)]);
                        while (chosen.size < numbersNeeded) chosen.add(odds[Math.floor(Math.random() * odds.length)]);
                        setSelectedNumbers(Array.from(chosen).sort((a, b) => a - b));
                      }}
                      className="h-8 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-1 transition-transform active:scale-95"
                      title="Equilibrar pares e ímpares"
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

                {/* Selected Numbers Preview Badges */}
                {selectedNumbers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 p-2.5 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner">
                    <span className="text-[11px] font-bold text-slate-500 mr-1">Escolhidas:</span>
                    {selectedNumbers.map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleNumber(num)}
                        className="w-7 h-7 rounded-full ball-3d-active-caixa text-white flex items-center justify-center text-xs font-mono font-black shadow-xs hover:scale-105 transition-transform"
                        title="Toque para remover esta dezena"
                      >
                        {String(num).padStart(2, '0')}
                      </button>
                    ))}
                  </div>
                )}

                {/* Grid of numbers - High Tactile Buttons */}
                <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5 p-3 rounded-2xl bg-slate-100/80 border border-[#C5DCF0] max-h-56 overflow-y-auto">
                  {Array.from({ length: config.totalNumbers }, (_, i) => i + 1).map((n) => {
                    const isSelected = selectedNumbers.includes(n);
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => toggleNumber(n)}
                        className={`h-11 sm:h-10 rounded-xl font-mono text-xs font-black transition-all flex items-center justify-center active:scale-90 ${
                          isSelected
                            ? 'ball-3d-active-caixa text-white ring-2 ring-[#FFB612] scale-105 z-10 shadow-md'
                            : 'bg-white hover:bg-blue-50 hover:border-[#005CA9] text-slate-800 border border-slate-200/90 shadow-2xs'
                        }`}
                      >
                        {String(n).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isClosed}
                  className={`w-full min-h-[50px] rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                    isClosed
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                      : 'bg-gradient-to-r from-[#F39200] via-[#FFA41B] to-[#F39200] hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-[#F39200]/30 border border-amber-300/50 active:scale-[0.98]'
                  }`}
                >
                  <Sparkles className="w-5 h-5 text-current" />
                  <span>{isClosed ? 'Apostas Encerradas para este Bolão' : `Confirmar Cota & Gerar Pix (R$ ${totalAmount.toFixed(2)})`}</span>
                </button>
              </div>
            </form>
          ) : (
            /* STEP 2: PIX PAYMENT SCREEN */
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Cota Reservada com Sucesso!
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Olá <strong className="text-slate-800">{createdParticipant?.name}</strong>, pague sua cota via Pix para garantir a inclusão oficial dos seus números no volante.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl max-w-xs mx-auto shadow-sm space-y-3">
                <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-inner flex items-center justify-center">
                  {pixQrDataUrl ? (
                    <img
                      src={pixQrDataUrl}
                      alt="QR Code Pix"
                      className="w-48 h-48 rounded-lg"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                      Gerando QR Code...
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-xs text-slate-500 font-medium">Valor da sua Cota</div>
                  <div className="text-2xl font-black font-mono text-emerald-600">
                    R$ {totalAmount.toFixed(2)}
                  </div>
                </div>

                {/* Copy Paste Button */}
                <button
                  onClick={handleCopyPix}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    copiedPix
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-[#005CA9] hover:bg-[#004889] text-white shadow-md shadow-blue-900/20'
                  }`}
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Código Pix Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Chave / Código Pix</span>
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Share CTA */}
              <div className="pt-2 flex flex-col gap-2 max-w-xs mx-auto">
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Avisar no WhatsApp do Bolão</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Fechar e Voltar ao Bolão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
