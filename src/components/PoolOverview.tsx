import React, { useState } from 'react';
import { BolaoPool, LotteryConfig, RegisteredUser } from '../types/lottery';
import {
  Users,
  DollarSign,
  Calendar,
  Trophy,
  Plus,
  Settings,
  Share2,
  QrCode,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Dices,
  Archive,
  ArchiveRestore,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { ActiveTab } from './Header';

interface PoolOverviewProps {
  pool: BolaoPool;
  config: LotteryConfig;
  currentUser: RegisteredUser | null;
  onOpenPriceTable: () => void;
  onUpdatePool: (updated: BolaoPool) => void;
  onOpenTab: (tab: ActiveTab) => void;
  onJoinPoolPrompt: () => void;
  onOpenBoletoForParticipant: (participantId: string) => void;
}

export const PoolOverview: React.FC<PoolOverviewProps> = ({
  pool,
  config,
  currentUser,
  onOpenPriceTable,
  onUpdatePool,
  onOpenTab,
  onJoinPoolPrompt,
  onOpenBoletoForParticipant,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(pool.title);
  const [quotaPrice, setQuotaPrice] = useState(pool.quotaPrice);
  const [totalQuotasTarget, setTotalQuotasTarget] = useState(pool.totalQuotas || 15);
  const [targetContestNumber, setTargetContestNumber] = useState(pool.targetContestNumber);
  const [endDate, setEndDate] = useState(pool.endDate || '');
  const [copiedShare, setCopiedShare] = useState(false);

  const isArchived = pool.status === 'archived';
  const isExpired = Boolean(pool.endDate && new Date(pool.endDate).getTime() < Date.now());
  const isClosed = isArchived || isExpired;

  const totalQuotasTaken = pool.participants.reduce((acc, p) => acc + p.quotas, 0);
  const paidQuotas = pool.participants.filter((p) => p.paid).reduce((acc, p) => acc + p.quotas, 0);
  const maxQuotas = pool.totalQuotas || Math.max(15, totalQuotasTaken);
  const progressPercent = Math.min(100, Math.round((totalQuotasTaken / maxQuotas) * 100));

  const totalBudgetPlanned = maxQuotas * pool.quotaPrice;
  const totalArrecadadoConfirmado = paidQuotas * pool.quotaPrice;
  const ticketsCost = pool.tickets.reduce((acc, t) => acc + t.cost, 0);

  // Group numbers frequency
  const numberCounts: { [num: number]: number } = {};
  pool.participants.forEach((p) => {
    p.chosenNumbers.forEach((n) => {
      numberCounts[n] = (numberCounts[n] || 0) + 1;
    });
  });

  const sortedNumbers = Object.entries(numberCounts)
    .map(([num, count]) => ({ number: Number(num), count }))
    .sort((a, b) => b.count - a.count);

  const distinctNumbersCount = sortedNumbers.length;

  // Check if current user is already a participant
  const currentParticipant = pool.participants.find(
    (p) =>
      (currentUser && p.userId === currentUser.id) ||
      (currentUser && p.email?.toLowerCase() === currentUser.email?.toLowerCase())
  );

  const handleToggleArchive = () => {
    sounds.playBallTap(520);
    const nextStatus = isArchived ? 'open_bets' : 'archived';
    onUpdatePool({
      ...pool,
      status: nextStatus,
      archivedAt: nextStatus === 'archived' ? new Date().toISOString() : undefined,
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playBallTap(500);
    onUpdatePool({
      ...pool,
      title,
      quotaPrice: Number(quotaPrice),
      totalQuotas: Number(totalQuotasTarget),
      targetContestNumber: Number(targetContestNumber),
      endDate: endDate.trim() || undefined,
    });
    setIsEditing(false);
  };

  const publicAppUrl = 'https://ais-pre-4qmjmjh6rx2iv43vgsz7vb-39259881863.us-west1.run.app';

  const handleShareWhatsApp = () => {
    sounds.playBallTap(550);
    const text = encodeURIComponent(
      `🍀 *CONVITE: ${pool.title.toUpperCase()}*\n` +
      `🏆 Loteria: ${config.fullName} (Concurso #${pool.targetContestNumber})\n` +
      `💰 Cota: R$ ${pool.quotaPrice.toFixed(2)} | Vagas: ${totalQuotasTaken}/${maxQuotas} preenchidas\n` +
      `🎯 Acesse o link público (sem login) e escolha seus números:\n${publicAppUrl}\n` +
      `Bora faturar juntos esse prêmio!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleCopyLink = () => {
    sounds.playBallTap(500);
    const text = `Bolão ${pool.title} (${config.fullName}) - Cota R$ ${pool.quotaPrice.toFixed(2)}. Acesse sem login: ${publicAppUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const strategyLabel =
    pool.selectedStrategy === 'hibrido'
      ? 'Híbrida (Super Cartão Âncora + Amplitude)'
      : pool.selectedStrategy === 'democratica'
      ? 'Democrática + Expansão Estatística'
      : 'Fechamento Munir & UFMG (Amplitude Máxima)';

  return (
    <div className="space-y-6">
      {/* Eye-catching Hero Card with Deep Caixa Navy Gradient */}
      <div className="bg-gradient-to-br from-[#001833] via-[#003875] to-[#005CA9] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-400/20 relative overflow-hidden">
        {/* Glowing atmospheric circles */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-56 h-56 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Top badges bar */}
          {/* Top badges bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-3.5 h-3.5 rounded-full shadow-md"
                style={{ backgroundColor: config.accentColor }}
              />
              <span className="font-black text-xs uppercase tracking-widest text-blue-200">
                {config.fullName}
              </span>
              <span className="text-blue-300/60">·</span>
              <span className="text-xs font-mono text-blue-200">Concurso #{pool.targetContestNumber}</span>
              <span className="text-blue-300/60">·</span>
              <span className="text-xs text-blue-200">{pool.targetContestDate}</span>

              {/* Status Pill */}
              {isArchived ? (
                <span className="bg-rose-500/90 text-white border border-rose-300/60 px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-sm">
                  <Archive className="w-3 h-3" />
                  <span>ARQUIVADO</span>
                </span>
              ) : isExpired ? (
                <span className="bg-amber-500/90 text-slate-950 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-sm">
                  <Clock className="w-3 h-3" />
                  <span>ENCERRADO</span>
                </span>
              ) : (
                <span className="bg-emerald-500/80 text-white border border-emerald-300/50 px-2.5 py-0.5 rounded-full text-[11px] font-black flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ABERTO</span>
                </span>
              )}
            </div>

            {/* Jackpot estimate pill */}
            <div className="bg-amber-400/15 border border-amber-300/40 text-amber-300 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1.5 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Prêmio Est.: R$ {(config.currentJackpotEstimate / 1000000).toFixed(1)} Milhões</span>
            </div>
          </div>

          {/* Main Title & Notes */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {pool.title}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
              {pool.notes || 'Bolão oficial organizado com otimização matemática para grupos, cotas individuais via Pix e divisão 100% igualitária de qualquer prêmio.'}
            </p>

            {/* Archived notice if closed */}
            {isClosed && (
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center gap-2.5 text-xs text-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
                <span>
                  {isArchived
                    ? 'Este bolão foi arquivado pelo organizador. Ele não é mais exibido nos modais de participação.'
                    : `Este bolão encerrou o período de apostas em ${pool.endDate ? new Date(pool.endDate).toLocaleString('pt-BR') : pool.targetContestDate}.`}
                </span>
              </div>
            )}
          </div>

          {/* Quota Progress Bar */}
          <div className="bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-200 font-bold flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Preenchimento de Cotas:</span>
                <strong className="text-white font-mono text-sm">
                  {totalQuotasTaken} de {maxQuotas} cotas
                </strong>
              </span>

              <span className="font-mono font-black text-emerald-400 text-sm">
                {progressPercent}%
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-200/80 pt-0.5">
              <span>
                Cota: <strong className="text-white font-mono">R$ {pool.quotaPrice.toFixed(2)}</strong> cada
              </span>
              <span>
                Previsto: <strong className="text-white font-mono">R$ {totalBudgetPlanned.toFixed(2)}</strong> (Confirmado no Pix: <strong className="text-emerald-300 font-mono">R$ {totalArrecadadoConfirmado.toFixed(2)}</strong>)
              </span>
            </div>
          </div>

          {/* CTA Action Row - 100% Mobile Friendly Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
              {/* Primary "Participar / Entrar no Bolão" CTA */}
              {isClosed ? (
                <div className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-2xl bg-white/10 border border-white/20 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                  <Archive className="w-4 h-4 text-amber-300" />
                  <span>{isArchived ? 'Bolão Arquivado (Apostas Fechadas)' : 'Apostas Encerradas'}</span>
                </div>
              ) : currentParticipant ? (
                <button
                  onClick={() => onOpenBoletoForParticipant(currentParticipant.id)}
                  className="w-full sm:w-auto min-h-[48px] px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 transition-all"
                >
                  <QrCode className="w-5 h-5 text-slate-950" />
                  <span>Ver Meu Pix / Cota ({currentParticipant.paid ? 'Confirmado' : 'Pendente'})</span>
                </button>
              ) : (
                <button
                  onClick={onJoinPoolPrompt}
                  className="w-full sm:w-auto min-h-[50px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#F39200] via-[#FFA41B] to-[#F39200] hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-[#F39200]/30 border border-amber-300/40 active:scale-95 transition-all"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                  <span>Garantir Minha Cota (R$ {pool.quotaPrice.toFixed(2)})</span>
                </button>
              )}

              {/* Archive / Desarquivar Toggle Button */}
              <button
                onClick={handleToggleArchive}
                className="w-full sm:w-auto min-h-[48px] px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-95 backdrop-blur-xs"
                title={isArchived ? 'Desarquivar e reabrir bolão' : 'Arquivar bolão para ocultá-lo dos modais'}
              >
                {isArchived ? (
                  <>
                    <ArchiveRestore className="w-4 h-4 text-emerald-300" />
                    <span>Reativar / Desarquivar</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-4 h-4 text-amber-300" />
                    <span>Arquivar Bolão</span>
                  </>
                )}
              </button>

              {/* WhatsApp Share Button */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleShareWhatsApp}
                  className="flex-1 sm:flex-initial min-h-[48px] px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/20 transition-all active:scale-95 backdrop-blur-xs"
                  title="Compartilhar bolão no WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="min-h-[48px] min-w-[48px] p-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 flex items-center justify-center active:scale-95"
                  title="Copiar texto de convite"
                >
                  <Share2 className="w-4 h-4" />
                </button>

                {/* Admin Settings Button */}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="min-h-[48px] min-w-[48px] p-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-all border border-white/20 flex items-center justify-center active:scale-95"
                  title="Ajustar configurações e data de encerramento do bolão"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Edit Form */}
      {isEditing && (
        <form
          onSubmit={handleSaveEdit}
          className="p-5 rounded-3xl bg-white border border-slate-200 shadow-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in text-slate-800"
        >
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nome do Bolão
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#005CA9]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Valor por Cota (R$)
            </label>
            <input
              type="number"
              step="0.50"
              value={quotaPrice}
              onChange={(e) => setQuotaPrice(Number(e.target.value))}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#005CA9]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Meta de Cotas
            </label>
            <input
              type="number"
              value={totalQuotasTarget}
              onChange={(e) => setTotalQuotasTarget(Number(e.target.value))}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#005CA9]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Data e Horário Fim (Encerramento)
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-10 px-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-[#005CA9]"
            />
          </div>
          <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleToggleArchive}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isArchived
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}
            >
              {isArchived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
              <span>{isArchived ? 'Desarquivar Bolão' : 'Arquivar este Bolão'}</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      )}

      {/* 4 Clean Metric Cards with Modern Hover Effects */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Cotistas */}
        <div
          onClick={() => onOpenTab('participants')}
          className="bg-white border border-[#C5DCF0] rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-[#005CA9] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-700">Cotistas</span>
            <Users className="w-4 h-4 text-[#005CA9] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-0.5">
            {pool.participants.length} <span className="text-xs font-normal text-slate-500">pessoas</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
            {totalQuotasTaken} cotas ({paidQuotas} pagas Pix)
          </div>
        </div>

        {/* Arrecadação */}
        <div className="bg-white border border-[#C5DCF0] rounded-2xl p-3.5 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-700">Total Arrecadado</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-0.5">
            R$ {totalBudgetPlanned.toFixed(2)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
            R$ {pool.quotaPrice.toFixed(2)} por cota
          </div>
        </div>

        {/* Dezenas Coletadas */}
        <div
          onClick={() => onOpenTab('simulator')}
          className="bg-white border border-[#C5DCF0] rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-[#005CA9] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-700">Dezenas do Grupo</span>
            <Trophy className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-0.5">
            {distinctNumbersCount} <span className="text-xs font-normal text-slate-500">dezenas</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#005CA9] font-bold mt-1">
            Simulador →
          </div>
        </div>

        {/* Jogos Gerados */}
        <div
          onClick={() => onOpenTab('tickets')}
          className="bg-white border border-[#C5DCF0] rounded-2xl p-3.5 sm:p-5 shadow-xs hover:shadow-md hover:border-[#005CA9] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-bold text-slate-700">Jogos Oficiais</span>
            <Calendar className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-0.5">
            {pool.tickets.length} <span className="text-xs font-normal text-slate-500">apostas</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
            Custo: R$ {ticketsCost.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Collective Group Numbers Showcase (3D Spherical Balls) */}
      <div className="bg-white border border-[#C5DCF0] rounded-3xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Dezenas Escolhidas pelos Participantes ({distinctNumbersCount})</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada número abaixo foi depositado por um participante do grupo. As mais votadas têm prioridade na matriz.
            </p>
          </div>

          <button
            onClick={() => onOpenTab('simulator')}
            className="min-h-[40px] px-4 py-2 bg-[#005CA9] hover:bg-[#004889] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs self-start sm:self-auto active:scale-95"
          >
            <Dices className="w-4 h-4" />
            <span>Otimizar Combinações</span>
          </button>
        </div>

        {sortedNumbers.length === 0 ? (
          <div className="p-8 text-center bg-[#F0F6FC] rounded-2xl border border-dashed border-[#C5DCF0] text-slate-400 text-xs">
            Nenhuma dezena registrada ainda. Convide amigos ou garanta sua cota acima!
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {sortedNumbers.map(({ number, count }) => (
              <div
                key={number}
                className="relative flex items-center gap-1.5 bg-[#F0F6FC] hover:bg-[#E3EFFB] p-1.5 pr-2.5 rounded-full border border-[#C5DCF0] transition-transform hover:scale-105"
                title={`${count} ${count === 1 ? 'voto' : 'votos'}`}
              >
                <span className="w-8 h-8 rounded-full ball-3d-mega text-white flex items-center justify-center font-mono font-black text-xs shadow-xs">
                  {String(number).padStart(2, '0')}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-600">
                  {count}x
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Strategy explanation card */}
        <div className="p-4 rounded-2xl bg-[#EBF3FA] border border-[#BBD5EE] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#005CA9] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block font-bold mb-0.5">
              Estratégia Ativa: {strategyLabel}
            </strong>
            O sistema desdobra o montante arrecadado (R$ {totalBudgetPlanned.toFixed(2)}) utilizando filtros estatísticos oficiais da Caixa (paridade 3P/3I e cobertura de quadrantes) recomendados por especialistas para maximizar probabilidades.
          </div>
        </div>
      </div>
    </div>
  );
};
