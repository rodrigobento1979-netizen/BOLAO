import React from 'react';
import { LotteryType, LotteryConfig } from '../types/lottery';
import { LOTTERIES_CONFIG } from '../data/lotteriesData';
import { sounds } from '../services/soundEffects';

interface LotterySelectorProps {
  selectedLottery: LotteryType;
  onSelectLottery: (lottery: LotteryType) => void;
  configs?: Record<LotteryType, LotteryConfig>;
}

export const LotterySelector: React.FC<LotterySelectorProps> = ({
  selectedLottery,
  onSelectLottery,
  configs = LOTTERIES_CONFIG,
}) => {
  // Only the 3 top lotteries: Mega-Sena, Lotofácil, Quina
  const allowedLotteries: LotteryType[] = ['megasena', 'lotofacil', 'quina'];

  const handleSelect = (id: LotteryType) => {
    sounds.playBallTap(500);
    onSelectLottery(id);
  };

  return (
    <div className="w-full bg-[#002D57] border-b border-[#001F3D] shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-2.5">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
          {allowedLotteries.map((id) => {
            const l = configs[id] || LOTTERIES_CONFIG[id];
            const isSelected = l.id === selectedLottery;
            const jackpotM = (l.currentJackpotEstimate / 1000000).toLocaleString('pt-BR', {
              maximumFractionDigits: 1,
            });

            return (
              <button
                key={l.id}
                onClick={() => handleSelect(l.id)}
                className={`min-h-[52px] sm:min-h-[58px] flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-xl transition-all border text-left active:scale-[0.98] ${
                  isSelected
                    ? 'bg-white text-slate-900 border-2 border-[#FFB612] shadow-md ring-2 ring-[#FFB612]/30'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-xs'
                }`}
              >
                {/* Official Caixa Lottery Emblem Icon */}
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-white shrink-0 shadow-sm"
                  style={{ backgroundColor: l.accentColor }}
                >
                  {l.id === 'megasena' && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      {/* 4-leaf clover symbol of Mega-Sena */}
                      <path d="M12 2C9.5 2 7.5 4 7.5 6.5c0 1.2.5 2.3 1.3 3.1-2.1.3-3.8 2.1-3.8 4.4 0 2.5 2 4.5 4.5 4.5.8 0 1.5-.2 2.2-.6l-.7 4.1h2l.7-4.1c.7.4 1.4.6 2.3.6 2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.1-3.8-4.4.8-.8 1.3-1.9 1.3-3.1C22 4 20 2 17.5 2c-1.5 0-2.8.7-3.7 1.8C12.9 2.7 11.5 2 12 2zm-2.5 6.5C9.5 7.4 10.4 6.5 11.5 6.5h1c1.1 0 2 .9 2 2s-.9 2-2 2h-1c-1.1 0-2-.9-2-2z" />
                    </svg>
                  )}
                  {l.id === 'lotofacil' && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      {/* Grid dots matrix of Lotofácil */}
                      <circle cx="5" cy="5" r="2.2" />
                      <circle cx="12" cy="5" r="2.2" />
                      <circle cx="19" cy="5" r="2.2" />
                      <circle cx="5" cy="12" r="2.2" />
                      <circle cx="12" cy="12" r="2.2" />
                      <circle cx="19" cy="12" r="2.2" />
                      <circle cx="5" cy="19" r="2.2" />
                      <circle cx="12" cy="19" r="2.2" />
                      <circle cx="19" cy="19" r="2.2" />
                    </svg>
                  )}
                  {l.id === 'quina' && (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                      {/* 5-point star of Quina */}
                      <path d="M12 2l2.8 6.5 7 .6-5.3 4.6 1.6 6.9-6.1-3.6-6.1 3.6 1.6-6.9L2.2 9.1l7-.6L12 2z" />
                    </svg>
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className={`font-black text-xs sm:text-sm truncate ${isSelected ? 'text-slate-900' : 'text-white'}`}>
                      {l.name}
                    </span>
                    {l.isAccumulated && (
                      <span className={`hidden md:inline-block text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                        isSelected
                          ? 'text-amber-900 bg-amber-100 border border-amber-300'
                          : 'text-amber-300 bg-amber-400/20 border border-amber-300/30'
                      }`}>
                        Acumulou
                      </span>
                    )}
                  </div>

                  <div className={`text-[10px] sm:text-xs font-mono font-bold flex items-center justify-between mt-0.5 ${
                    isSelected ? 'text-[#005CA9]' : 'text-amber-300'
                  }`}>
                    <span>R$ {jackpotM}M</span>
                    <span className={`text-[10px] font-sans font-normal hidden lg:inline ${
                      isSelected ? 'text-slate-400' : 'text-blue-200'
                    }`}>
                      Conc. {l.nextContestNumber}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
