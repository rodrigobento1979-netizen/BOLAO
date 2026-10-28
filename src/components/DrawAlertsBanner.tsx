import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Clock, Bell, RotateCw } from 'lucide-react';
import { LOTTERIES_CONFIG } from '../data/lotteriesData';
import { LotteryConfig, LotteryType } from '../types/lottery';
import { CaixaLiveStatus } from '../services/caixaApi';
import { sounds } from '../services/soundEffects';

interface DrawAlertsBannerProps {
  currentLottery: LotteryType;
  onSelectLottery: (lottery: LotteryType) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  configs?: Record<LotteryType, LotteryConfig>;
  caixaStatus?: CaixaLiveStatus | null;
  onRefreshCaixa?: () => void;
  isRefreshingCaixa?: boolean;
}

export const DrawAlertsBanner: React.FC<DrawAlertsBannerProps> = ({
  currentLottery,
  onSelectLottery,
  unreadNotificationsCount = 0,
  onOpenNotifications,
  configs = LOTTERIES_CONFIG,
  caixaStatus,
  onRefreshCaixa,
  isRefreshingCaixa = false,
}) => {
  const [soundOn, setSoundOn] = useState(sounds.enabled);
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 48, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    sounds.enabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) sounds.playBallTap(580);
  };

  const accumulatedLotteries = Object.values(configs).filter(
    (l) => l.isAccumulated
  );

  return (
    <div className="bg-[#002447] text-white text-xs border-b border-[#001D3A] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-1.5 sm:py-2 flex flex-wrap items-center justify-between gap-2.5">
        {/* Left: Ticker with accumulated alerts */}
        <div className="flex items-center gap-2.5 overflow-x-auto py-0.5 no-scrollbar">
          <div className="flex items-center gap-1.5 text-[#FFB612] font-black uppercase tracking-wider shrink-0 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFB612] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FFB612]"></span>
            </span>
            <span>Prêmios Acumulados Caixa:</span>
          </div>

          <div className="flex items-center gap-1.5">
            {accumulatedLotteries.map((lottery) => {
              const formattedJackpot = (lottery.currentJackpotEstimate / 1000000).toLocaleString('pt-BR', {
                maximumFractionDigits: 1,
              });
              const isSelected = lottery.id === currentLottery;
              return (
                <button
                  key={lottery.id}
                  onClick={() => onSelectLottery(lottery.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 shrink-0 text-xs active:scale-95 ${
                    isSelected
                      ? 'bg-[#FFB612] text-slate-950 font-black shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-blue-100'
                  }`}
                >
                  <span className="font-semibold">{lottery.name}</span>
                  <span className="font-mono font-black">
                    R$ {formattedJackpot}M
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Next draw closing countdown & notification & sound toggle */}
        <div className="flex items-center gap-4 text-blue-100 shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Fechamento do concurso Caixa:</span>
            <span className="font-mono font-bold text-white bg-black/20 px-1.5 py-0.5 rounded">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>

          {/* Live Official Caixa Source Indicator & Refresh Button */}
          {onRefreshCaixa && (
            <button
              onClick={() => {
                sounds.playBallTap(500);
                onRefreshCaixa();
              }}
              disabled={isRefreshingCaixa}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-semibold transition-all active:scale-95 text-[11px]"
              title={caixaStatus ? `Dados oficiais obtidos de ${caixaStatus.source} às ${caixaStatus.lastUpdated}. Clique para atualizar.` : 'Buscar dados ao vivo no site da Caixa'}
            >
              <RotateCw className={`w-3 h-3 text-emerald-400 ${isRefreshingCaixa ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">
                {isRefreshingCaixa ? 'Consultando Caixa...' : 'Site Oficial Caixa'}
              </span>
            </button>
          )}

          {onOpenNotifications && (
            <button
              onClick={onOpenNotifications}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              title="Avisos e Boletos de Bolões"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300" />
              <span>Avisos</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          <span className="text-blue-300/40" aria-hidden="true">|</span>

          <button
            onClick={toggleSound}
            title={soundOn ? 'Desativar efeitos sonoros' : 'Ativar efeitos sonoros'}
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            {soundOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
                <span className="hidden md:inline">Som ativo</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-blue-300" />
                <span className="hidden md:inline">Sem som</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
