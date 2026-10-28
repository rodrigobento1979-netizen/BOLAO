import React, { useState } from 'react';
import { LotteryType, RegisteredUser } from '../types/lottery';
import { LOTTERIES_CONFIG } from '../data/lotteriesData';
import {
  Trophy,
  Users,
  Ticket,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  User,
  Shield,
  Bell,
  LogIn,
  Calculator,
  QrCode,
  Share2,
  Check,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export type ActiveTab = 'overview' | 'simulator' | 'participants' | 'tickets' | 'results';

interface HeaderProps {
  currentLottery: LotteryType;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenPriceTable: () => void;
  onCreateNewPool: () => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onOpenAdminPixModal: () => void;
  currentUser: RegisteredUser | null;
  unreadNotificationsCount: number;
  ticketsCount: number;
  participantsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentLottery,
  activeTab,
  onSelectTab,
  onOpenPriceTable,
  onCreateNewPool,
  onOpenAuthModal,
  onOpenNotifications,
  onOpenAdminPixModal,
  currentUser,
  unreadNotificationsCount,
  ticketsCount,
  participantsCount,
}) => {
  const [copiedPublicLink, setCopiedPublicLink] = useState(false);
  const config = LOTTERIES_CONFIG[currentLottery];

  const handleTabClick = (tab: ActiveTab) => {
    sounds.playBallTap(480);
    onSelectTab(tab);
  };

  const handleCopyPublicLink = () => {
    sounds.playBallTap(500);
    // Official public URL that does not require Google login
    navigator.clipboard.writeText('https://ais-pre-4qmjmjh6rx2iv43vgsz7vb-39259881863.us-west1.run.app');
    setCopiedPublicLink(true);
    setTimeout(() => setCopiedPublicLink(false), 2500);
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Visão Geral', icon: <Trophy className="w-4 h-4" /> },
    { id: 'simulator', label: 'Simulador Matemático', icon: <Calculator className="w-4 h-4" /> },
    {
      id: 'participants',
      label: 'Cotistas & Volante',
      icon: <Users className="w-4 h-4" />,
      badge: participantsCount,
    },
    {
      id: 'tickets',
      label: 'Bilhetes do Bolão',
      icon: <Ticket className="w-4 h-4" />,
      badge: ticketsCount,
    },
    { id: 'results', label: 'Conferidor Oficial', icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-gradient-to-r from-[#003D73] via-[#005CA9] to-[#004889] text-white border-b border-[#002D57] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        {/* Brand bar */}
        <div className="py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          {/* Logo with official Caixa X style */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F39200] text-white flex items-center justify-center shadow-md font-black text-xl tracking-tighter">
              <span>X</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-lg font-black text-white tracking-tight leading-none drop-shadow-xs">
                  Loterias Caixa <span className="text-[#FFB612]">Bolão</span>
                </h1>
                <span className="text-[9px] uppercase font-bold text-white bg-emerald-500/80 px-1.5 py-0.2 rounded border border-emerald-300/40 backdrop-blur-xs">
                  Público Livre
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-blue-100 font-medium mt-0.5">
                Mega-Sena · Lotofácil · Quina
              </p>
            </div>
          </div>

          {/* Action buttons with touch-ergonomic sizing */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Share Public Link Button */}
            <button
              onClick={handleCopyPublicLink}
              className="min-h-[38px] px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border border-white/25 active:scale-95 shadow-xs"
              title="Copiar link público para convidar amigos (sem pedir login do Google)"
            >
              {copiedPublicLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span className="text-emerald-200 font-black">Link Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#FFB612]" />
                  <span className="hidden sm:inline">Link Público</span>
                </>
              )}
            </button>

            {/* Button to configure Pix - Open to everyone */}
            <button
              onClick={onOpenAdminPixModal}
              className="min-h-[38px] px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 transition-all shadow-sm active:scale-95"
              title="Configurar chave Pix do Bolão"
            >
              <QrCode className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Chave Pix</span>
            </button>

            {/* Notifications Button */}
            <button
              onClick={onOpenNotifications}
              className="min-h-[38px] p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all relative flex items-center gap-1 text-xs font-semibold border border-white/20 active:scale-95"
              title="Notificações e Boletos"
            >
              <Bell className="w-4 h-4 text-white" />
              <span className="hidden md:inline">Avisos</span>
              {unreadNotificationsCount > 0 && (
                <span className="bg-[#FFB612] text-slate-950 font-black text-[10px] px-1.5 py-0.2 rounded-full shadow-sm">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Price Table Button */}
            <button
              onClick={onOpenPriceTable}
              className="min-h-[38px] px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all border border-white/20 active:scale-95"
              title="Tabela de Preços Oficiais Caixa"
            >
              <DollarSign className="w-3.5 h-3.5 text-[#FFB612]" />
              <span className="hidden lg:inline">Tabela Caixa</span>
            </button>

            {/* User Profile Badge */}
            <button
              onClick={onOpenAuthModal}
              className="min-h-[38px] px-2.5 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/25 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Clique para alterar seu nome de exibição"
            >
              <User className="w-3.5 h-3.5 text-blue-200" />
              <span className="max-w-[85px] sm:max-w-[130px] truncate">
                {currentUser?.name || 'Seu Nome'}
              </span>
            </button>

            {/* Create Pool Button with Caixa Orange */}
            <button
              onClick={onCreateNewPool}
              className="min-h-[38px] px-3 py-1.5 bg-[#F39200] hover:bg-[#FFB612] text-slate-950 rounded-xl text-xs font-black flex items-center gap-1 transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5 text-slate-950" />
              <span>Novo Bolão</span>
            </button>
          </div>
        </div>

        {/* Clean, Non-Scrolling Navigation Tabs on Caixa Blue Ribbon */}
        <nav className="flex items-center justify-between sm:justify-start gap-1 py-1.5 border-t border-white/15 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex-1 sm:flex-initial min-h-[42px] px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-center shrink-0 ${
                  isActive
                    ? 'bg-white text-[#005CA9] shadow-md font-black'
                    : 'text-blue-100 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.icon}
                <span className="text-[11px] sm:text-xs">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-[#005CA9] text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
