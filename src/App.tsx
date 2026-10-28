import React, { useState, useEffect } from 'react';
import {
  LotteryType,
  LotteryConfig,
  BolaoPool,
  GeneratedTicket,
  ContestResult,
  Participant,
  RegisteredUser,
  PoolNotification,
  BoletoPayment,
} from './types/lottery';
import { LOTTERIES_CONFIG, INITIAL_POOLS } from './data/lotteriesData';
import { Header, ActiveTab } from './components/Header';
import { DrawAlertsBanner } from './components/DrawAlertsBanner';
import { LotterySelector } from './components/LotterySelector';
import { PoolOverview } from './components/PoolOverview';
import { SyndicateSimulator } from './components/SyndicateSimulator';
import { ParticipantsManager } from './components/ParticipantsManager';
import { TicketsList } from './components/TicketsList';
import { ResultsConferer } from './components/ResultsConferer';
import { PriceTableModal } from './components/PriceTableModal';
import { NewPoolModal } from './components/NewPoolModal';
import { AuthModal } from './components/AuthModal';
import { BoletoModal } from './components/BoletoModal';
import { QuickJoinModal } from './components/QuickJoinModal';
import { AdminPixModal } from './components/AdminPixModal';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { Trophy, Calculator, Users, Ticket, CheckCircle2, Plus, Archive, FolderArchive } from 'lucide-react';
import { generateCaixaBoleto } from './services/paymentService';
import { PixConfig, DEFAULT_PIX_CONFIG } from './services/pixService';
import { fetchOfficialCaixaLatest, CaixaLiveStatus } from './services/caixaApi';
import {
  loadPoolsFromFirestore,
  savePoolToFirestore,
  loadPixConfigFromFirestore,
  savePixConfigToFirestore,
} from './services/firestoreService';
import { sounds } from './services/soundEffects';

const STORAGE_KEY_POOLS = 'bolao_caixa_pools_v3';
const STORAGE_KEY_USER = 'bolao_caixa_user_v3';
const STORAGE_KEY_NOTIFICATIONS = 'bolao_caixa_notifs_v3';

const DEFAULT_USERS: RegisteredUser[] = [
  {
    id: 'user-admin-1',
    name: 'Rodrigo Bento',
    email: 'rodrigobento1979@gmail.com',
    phone: '(11) 98765-4321',
    role: 'admin',
    registeredAt: '2026-10-27T10:00:00Z',
  },
  {
    id: 'user-part-2',
    name: 'Carlos Mendes',
    email: 'carlos.mendes@email.com',
    phone: '(11) 97123-8899',
    role: 'participant',
    registeredAt: '2026-10-27T10:30:00Z',
  },
  {
    id: 'user-part-3',
    name: 'Mariana Silveira',
    email: 'mariana.silveira@email.com',
    phone: '(21) 99344-1122',
    role: 'participant',
    registeredAt: '2026-10-27T11:00:00Z',
  },
];

export default function App() {
  const [selectedLottery, setSelectedLottery] = useState<LotteryType>('megasena');
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Modals
  const [isPriceTableOpen, setIsPriceTableOpen] = useState(false);
  const [isNewPoolModalOpen, setIsNewPoolModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAdminPixModalOpen, setIsAdminPixModalOpen] = useState(false);
  const [isQuickJoinOpen, setIsQuickJoinOpen] = useState(false);
  const [authDefaultRole, setAuthDefaultRole] = useState<'admin' | 'participant'>('participant');

  // Pix Config (synced with Firestore)
  const [pixConfig, setPixConfig] = useState<PixConfig>(DEFAULT_PIX_CONFIG);

  // Boleto modal state
  const [activeBoletoData, setActiveBoletoData] = useState<{
    boleto: BoletoPayment;
    participantName: string;
    participantId: string;
    poolTitle: string;
  } | null>(null);

  // Current logged in user (defaults to Admin Rodrigo Bento for immediate rich access)
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_USERS[0];
  });

  // Pools state with localStorage initialization
  const [poolsByLottery, setPoolsByLottery] = useState<Record<LotteryType, BolaoPool[]>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POOLS);
      if (saved) return JSON.parse(saved);
    } catch {}

    const initial = { ...INITIAL_POOLS };
    Object.values(initial).forEach((pools) => {
      pools.forEach((p) => {
        p.participants.forEach((part) => {
          if (!part.boleto) {
            part.boleto = generateCaixaBoleto(part.quotas * p.quotaPrice, part.name, p.title);
            if (part.paid) part.boleto.status = 'pago';
          }
        });
      });
    });
    return initial;
  });

  // Notifications state
  const [notifications, setNotifications] = useState<PoolNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'notif-initial-1',
        poolId: 'pool-mega-amigos-1',
        poolTitle: 'Bolão dos 15 Amigos - Mega da Virada',
        lotteryType: 'megasena',
        message: 'Novo Bolão Aberto! O boleto bancário Caixa e a chave Pix oficial foram liberados para pagamento da sua cota. Entre para definir seus números da sorte!',
        quotaPrice: 30.0,
        createdAt: '2026-10-27T14:00:00Z',
        read: false,
        sentToUsersCount: 15,
      },
    ];
  });

  // 1. Load Pix Config and Pools from Firestore on mount
  useEffect(() => {
    loadPixConfigFromFirestore().then((cfg) => {
      setPixConfig(cfg);
    });

    loadPoolsFromFirestore().then((remotePools) => {
      if (remotePools && Object.values(remotePools).some((list) => list.length > 0)) {
        setPoolsByLottery(remotePools);
      }
    });
  }, []);

  // Save states locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_POOLS, JSON.stringify(poolsByLottery));
    } catch {}
  }, [poolsByLottery]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  // Live Official Caixa Configs & Status
  const [liveConfigs, setLiveConfigs] = useState<Record<LotteryType, LotteryConfig>>(LOTTERIES_CONFIG);
  const [caixaStatus, setCaixaStatus] = useState<CaixaLiveStatus | null>(null);
  const [isRefreshingCaixa, setIsRefreshingCaixa] = useState(false);
  const [poolFilterTab, setPoolFilterTab] = useState<'active' | 'archived'>('active');

  const refreshCaixaData = async (lottery: LotteryType = selectedLottery) => {
    setIsRefreshingCaixa(true);
    try {
      const res = await fetchOfficialCaixaLatest(lottery);
      setLiveConfigs((prev) => ({
        ...prev,
        [lottery]: {
          ...prev[lottery],
          ...res.configUpdate,
        },
      }));
      setCaixaStatus(res.status);
    } catch (e) {
      console.warn('Erro ao atualizar dados oficiais da Caixa:', e);
    } finally {
      setIsRefreshingCaixa(false);
    }
  };

  useEffect(() => {
    refreshCaixaData(selectedLottery);
  }, [selectedLottery]);

  // Current config backed by real official Caixa numbers
  const currentConfig = liveConfigs[selectedLottery] || LOTTERIES_CONFIG[selectedLottery];
  const currentLotteryPools = poolsByLottery[selectedLottery] || [];

  const activePools = currentLotteryPools.filter((p) => p.status !== 'archived');
  const archivedPools = currentLotteryPools.filter((p) => p.status === 'archived');

  // Active pool for this lottery
  const [activePoolId, setActivePoolId] = useState<string>(() => {
    return activePools[0]?.id || currentLotteryPools[0]?.id || '';
  });

  // Ensure activePoolId exists and respects active status
  useEffect(() => {
    if (currentLotteryPools.length > 0) {
      const currentExists = currentLotteryPools.some((p) => p.id === activePoolId);
      if (!currentExists) {
        const preferred = activePools[0] || currentLotteryPools[0];
        setActivePoolId(preferred.id);
      }
    } else {
      const defaultPool: BolaoPool = {
        id: `pool-${selectedLottery}-${Date.now()}`,
        title: `Bolão Oficial ${currentConfig.name}`,
        lotteryType: selectedLottery,
        targetContestNumber: currentConfig.nextContestNumber,
        targetContestDate: currentConfig.nextContestDate,
        quotaPrice: 30.0,
        totalQuotas: 15,
        status: 'open_bets',
        createdAt: new Date().toISOString(),
        endDate: currentConfig.nextContestDate ? `${currentConfig.nextContestDate}T18:00` : undefined,
        notes: `Bolão oficial com rateio automático e persistência no Firebase Firestore.`,
        participants: [
          {
            id: `part-admin-${Date.now()}`,
            name: currentUser?.name || 'Rodrigo Bento (Admin)',
            email: currentUser?.email || 'rodrigobento1979@gmail.com',
            phone: currentUser?.phone || '(11) 98765-4321',
            quotas: 1,
            paid: true,
            chosenNumbers: currentConfig.id === 'megasena' ? [10, 23, 34, 42, 53, 58] : [1, 3, 5, 7, 8, 10, 11, 13, 14, 17, 20, 22, 24, 25, 2],
            joinedAt: new Date().toISOString(),
          },
        ],
        tickets: [],
      };

      setPoolsByLottery((prev) => ({
        ...prev,
        [selectedLottery]: [defaultPool],
      }));
      setActivePoolId(defaultPool.id);
      savePoolToFirestore(defaultPool);
    }
  }, [selectedLottery, currentLotteryPools, activePoolId, currentConfig, currentUser]);

  // Active pool object
  const activePool =
    currentLotteryPools.find((p) => p.id === activePoolId) || activePools[0] || currentLotteryPools[0];

  const updateActivePool = (updated: BolaoPool) => {
    setPoolsByLottery((prev) => ({
      ...prev,
      [selectedLottery]: (prev[selectedLottery] || []).map((p) =>
        p.id === updated.id ? updated : p
      ),
    }));
    // Sync to Firestore
    savePoolToFirestore(updated);
  };

  const handleUpdateParticipants = (updatedParticipants: Participant[]) => {
    if (!activePool) return;
    updateActivePool({
      ...activePool,
      participants: updatedParticipants,
    });
  };

  const handleApplyTickets = (tickets: GeneratedTicket[]) => {
    if (!activePool) return;
    updateActivePool({
      ...activePool,
      tickets,
    });
    setActiveTab('tickets');
  };

  // Apply Simulation strategy from SyndicateSimulator
  const handleApplySimulationToPool = (
    participantCount: number,
    quotaValue: number,
    tickets: GeneratedTicket[]
  ) => {
    if (!activePool) return;

    let currentParts = [...activePool.participants];
    const autoNames = [
      'Carlos Mendes', 'Mariana Silveira', 'Lucas Ferreira', 'Ana Paula Rocha',
      'Felipe Oliveira', 'Beatriz Lima', 'Eduardo Santos', 'Camila Ribeiro',
      'Gabriel Souza', 'Larissa Martins', 'Renato Dias', 'Patricia Gomes',
      'Thiago Barbosa', 'Vanessa Castro', 'Marcelo Nunes', 'Juliana Lima',
      'Diego Costa', 'Fernanda Alves', 'Rodrigo Silva', 'Tatiane Rocha'
    ];

    while (currentParts.length < participantCount) {
      const idx = currentParts.length;
      const autoName = autoNames[idx % autoNames.length] || `Participante ${idx + 1}`;
      const autoNumbers = new Set<number>();
      while (autoNumbers.size < currentConfig.defaultDrawNumbers) {
        autoNumbers.add(Math.floor(Math.random() * currentConfig.totalNumbers) + 1);
      }
      const b = generateCaixaBoleto(quotaValue, autoName, activePool.title);
      currentParts.push({
        id: `part-auto-${Date.now()}-${idx}`,
        name: autoName,
        phone: `(11) 987${(idx * 3) % 10}4-55${idx}`,
        quotas: 1,
        paid: true,
        chosenNumbers: Array.from(autoNumbers).sort((a, b) => a - b),
        joinedAt: new Date().toISOString(),
        boleto: { ...b, status: 'pago' },
      });
    }

    const updatedPool: BolaoPool = {
      ...activePool,
      quotaPrice: quotaValue,
      totalQuotas: participantCount,
      participants: currentParts,
      tickets,
    };

    updateActivePool(updatedPool);
    setActiveTab('tickets');
  };

  // Create new pool + broadcast notification + save to Firestore
  const handleCreateNewPool = (newPool: BolaoPool) => {
    setPoolsByLottery((prev) => ({
      ...prev,
      [newPool.lotteryType]: [...(prev[newPool.lotteryType] || []), newPool],
    }));
    setSelectedLottery(newPool.lotteryType);
    setActivePoolId(newPool.id);
    setActiveTab('overview');

    savePoolToFirestore(newPool);

    const newNotif: PoolNotification = {
      id: `notif-${Date.now()}`,
      poolId: newPool.id,
      poolTitle: newPool.title,
      lotteryType: newPool.lotteryType,
      message: `Novo Bolão Aberto: "${newPool.title}"! O boleto bancário Caixa e o Pix de R$ ${newPool.quotaPrice.toFixed(2)} por cota foram disponibilizados. Acesse para garantir suas cotas e escolher suas dezenas!`,
      quotaPrice: newPool.quotaPrice,
      createdAt: new Date().toISOString(),
      read: false,
      sentToUsersCount: newPool.totalQuotas,
    };

    setNotifications((prev) => [newNotif, ...prev]);
    sounds.playWinChime();
  };

  // "Quero Apostar" flow - Opens QuickJoinModal directly
  const handleJoinPoolPrompt = () => {
    sounds.playBallTap(500);
    setIsQuickJoinOpen(true);
  };

  const handleAddQuickParticipant = (participant: Participant) => {
    if (!activePool) return;
    updateActivePool({
      ...activePool,
      participants: [...activePool.participants, participant],
    });
    sounds.playWinChime();
  };

  const handleOpenBoletoForParticipant = (participantId: string) => {
    if (!activePool) return;
    const p = activePool.participants.find((item) => item.id === participantId);
    if (!p) return;

    let boleto = p.boleto;
    if (!boleto) {
      boleto = generateCaixaBoleto(p.quotas * activePool.quotaPrice, p.name, activePool.title);
      p.boleto = boleto;
    }

    setActiveBoletoData({
      boleto,
      participantName: p.name,
      participantId: p.id,
      poolTitle: activePool.title,
    });
  };

  const handleMarkParticipantPaid = (participantId: string) => {
    if (!activePool) return;
    const updated = activePool.participants.map((p) => {
      if (p.id === participantId) {
        return {
          ...p,
          paid: true,
          boleto: p.boleto ? { ...p.boleto, status: 'pago' as const, paidAt: new Date().toISOString() } : undefined,
        };
      }
      return p;
    });
    updateActivePool({ ...activePool, participants: updated });
  };

  const handleUpdatePoolTicketsResult = (
    tickets: GeneratedTicket[],
    result: ContestResult
  ) => {
    if (!activePool) return;
    updateActivePool({
      ...activePool,
      tickets,
      checkedContestResult: result,
      status: 'checked',
    });
  };

  const handleSavePixConfig = (newConfig: PixConfig) => {
    setPixConfig(newConfig);
    savePixConfigToFirestore(newConfig);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const currentBudget = activePool
    ? activePool.participants.reduce((acc, p) => acc + p.quotas * activePool.quotaPrice, 0)
    : 0;

  return (
    <div className="min-h-screen bg-[#EBF3FA] text-slate-800 flex flex-col font-sans">
      {/* Top Banner with Draw closing timer & accumulated jackpots in Caixa blue */}
      <DrawAlertsBanner
        currentLottery={selectedLottery}
        onSelectLottery={(l) => {
          setSelectedLottery(l);
          setActiveTab('overview');
        }}
        unreadNotificationsCount={unreadNotificationsCount}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        configs={liveConfigs}
        caixaStatus={caixaStatus}
        onRefreshCaixa={() => refreshCaixaData(selectedLottery)}
        isRefreshingCaixa={isRefreshingCaixa}
      />

      {/* Main Header with clean non-scrolling tabs, Caixa brand and Admin Pix button */}
      <Header
        currentLottery={selectedLottery}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPriceTable={() => setIsPriceTableOpen(true)}
        onCreateNewPool={() => {
          setIsNewPoolModalOpen(true);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => {
          setIsNotificationsOpen(true);
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onOpenAdminPixModal={() => setIsAdminPixModalOpen(true)}
        currentUser={currentUser}
        unreadNotificationsCount={unreadNotificationsCount}
        ticketsCount={activePool?.tickets.length || 0}
        participantsCount={activePool?.participants.length || 0}
      />

      {/* Lottery Selector Strip (Mega-Sena, Lotofácil, Quina with Caixa emblems) */}
      <LotterySelector
        selectedLottery={selectedLottery}
        configs={liveConfigs}
        onSelectLottery={(l) => {
          setSelectedLottery(l);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-5 sm:space-y-6 pb-32 sm:pb-12">
        {/* Pool Selector & Filter Strip: Active vs Archived */}
        <div className="bg-white/90 backdrop-blur-xs rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider shrink-0">
              Bolões {currentConfig.name}:
            </span>

            {/* Segmented Filter: Ativos vs Arquivados */}
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-bold border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setPoolFilterTab('active');
                  if (activePools.length > 0 && activePool?.status === 'archived') {
                    setActivePoolId(activePools[0].id);
                  }
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  poolFilterTab === 'active'
                    ? 'bg-white text-[#005CA9] shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚡ Ativos</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  poolFilterTab === 'active' ? 'bg-blue-100 text-[#005CA9]' : 'bg-slate-200 text-slate-700'
                }`}>
                  {activePools.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPoolFilterTab('archived');
                  if (archivedPools.length > 0 && activePool?.status !== 'archived') {
                    setActivePoolId(archivedPools[0].id);
                  }
                }}
                className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  poolFilterTab === 'archived'
                    ? 'bg-white text-slate-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderArchive className="w-3.5 h-3.5 text-slate-500" />
                <span>Arquivados</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  poolFilterTab === 'archived' ? 'bg-slate-200 text-slate-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {archivedPools.length}
                </span>
              </button>
            </div>
          </div>

          {/* List of pools for selected category */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
            {(poolFilterTab === 'active' ? activePools : archivedPools).map((p) => {
              const isSelected = p.id === activePoolId;
              const isExpired = p.endDate ? new Date(p.endDate).getTime() < Date.now() : false;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    sounds.playBallTap(500);
                    setActivePoolId(p.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50 text-[#005CA9] border border-blue-300 shadow-2xs font-black'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span className="truncate max-w-[130px] sm:max-w-[180px]">{p.title}</span>
                  {p.status === 'archived' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded font-bold">
                      Arquivado
                    </span>
                  )}
                  {isExpired && p.status !== 'archived' && (
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">
                      Encerrado
                    </span>
                  )}
                </button>
              );
            })}
            {(poolFilterTab === 'active' ? activePools : archivedPools).length === 0 && (
              <span className="text-xs text-slate-400 italic py-1">
                {poolFilterTab === 'active' ? 'Nenhum bolão ativo nesta loteria.' : 'Nenhum bolão arquivado.'}
              </span>
            )}
          </div>
        </div>

        {/* Tab Views */}
        {activePool && (
          <>
            {activeTab === 'overview' && (
              <PoolOverview
                pool={activePool}
                config={currentConfig}
                currentUser={currentUser}
                onOpenPriceTable={() => setIsPriceTableOpen(true)}
                onUpdatePool={updateActivePool}
                onOpenTab={setActiveTab}
                onJoinPoolPrompt={handleJoinPoolPrompt}
                onOpenBoletoForParticipant={handleOpenBoletoForParticipant}
              />
            )}

            {activeTab === 'simulator' && (
              <SyndicateSimulator
                currentLottery={selectedLottery}
                onSelectLottery={(l) => setSelectedLottery(l)}
                activePool={activePool}
                onApplySimulationToPool={handleApplySimulationToPool}
              />
            )}

            {activeTab === 'participants' && (
              <ParticipantsManager
                participants={activePool.participants}
                config={currentConfig}
                quotaPrice={activePool.quotaPrice}
                poolTitle={activePool.title}
                onUpdateParticipants={handleUpdateParticipants}
                onOpenBoleto={(p) => handleOpenBoletoForParticipant(p.id)}
              />
            )}

            {activeTab === 'tickets' && (
              <TicketsList
                pool={activePool}
                config={currentConfig}
                onUpdateTickets={(tickets) => updateActivePool({ ...activePool, tickets })}
                onOpenGeneratorTab={() => setActiveTab('simulator')}
              />
            )}

            {activeTab === 'results' && (
              <ResultsConferer
                pool={activePool}
                config={currentConfig}
                onUpdatePoolTickets={handleUpdatePoolTicketsResult}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Action Button (Thumb Ergonomics) */}
      {activePool &&
        activeTab === 'overview' &&
        activePool.status !== 'archived' &&
        (!activePool.endDate || new Date(activePool.endDate).getTime() >= Date.now()) && (
          <div className="fixed bottom-18 left-0 right-0 p-3 sm:hidden z-30 pointer-events-none flex justify-center">
            <button
              onClick={handleJoinPoolPrompt}
              className="pointer-events-auto w-full max-w-sm min-h-[50px] rounded-2xl bg-gradient-to-r from-[#F39200] via-[#FFA41B] to-[#F39200] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-2xl shadow-[#F39200]/40 border border-amber-300/40 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Garantir Minha Cota (R$ {activePool.quotaPrice.toFixed(2)})</span>
            </button>
          </div>
        )}

      {/* Quick Join Modal for fast participant entry */}
      {activePool && (
        <QuickJoinModal
          isOpen={isQuickJoinOpen}
          onClose={() => setIsQuickJoinOpen(false)}
          pool={activePool}
          config={currentConfig}
          onAddParticipant={handleAddQuickParticipant}
        />
      )}

      {/* Caixa Boleto & Real Dynamic Pix QR Code Modal */}
      {activeBoletoData && (
        <BoletoModal
          isOpen={true}
          onClose={() => setActiveBoletoData(null)}
          boleto={activeBoletoData.boleto}
          participantName={activeBoletoData.participantName}
          poolTitle={activeBoletoData.poolTitle}
          pixConfig={pixConfig}
          onMarkAsPaid={() => handleMarkParticipantPaid(activeBoletoData.participantId)}
        />
      )}

      {/* Admin Pix Configuration Modal */}
      <AdminPixModal
        isOpen={isAdminPixModalOpen}
        onClose={() => setIsAdminPixModalOpen(false)}
        currentConfig={pixConfig}
        onSaveConfig={handleSavePixConfig}
      />

      {/* User Identification Modal (Acesso Público) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        defaultRole={authDefaultRole}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          sounds.playWinChime();
        }}
      />

      {/* Notification Center Modal */}
      <NotificationCenterModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onOpenPool={(poolId) => {
          setActivePoolId(poolId);
          setActiveTab('overview');
        }}
        onOpenMyBoleto={() => {
          if (activePool && currentUser) {
            const p = activePool.participants.find(
              (item) => item.email?.toLowerCase() === currentUser.email?.toLowerCase() || item.userId === currentUser.id
            );
            if (p) handleOpenBoletoForParticipant(p.id);
            else handleJoinPoolPrompt();
          }
        }}
      />

      {/* Official Caixa Price Table Modal */}
      <PriceTableModal
        config={currentConfig}
        isOpen={isPriceTableOpen}
        onClose={() => setIsPriceTableOpen(false)}
        currentBudget={currentBudget}
      />

      {/* New Custom Pool Modal (Admin exclusive) */}
      <NewPoolModal
        isOpen={isNewPoolModalOpen}
        onClose={() => setIsNewPoolModalOpen(false)}
        defaultLottery={selectedLottery}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthDefaultRole('admin');
          setIsAuthModalOpen(true);
        }}
        onCreatePool={handleCreateNewPool}
      />

      {/* Clean White & Blue Footer */}
      {/* Clean Light Blue Footer */}
      <footer className="border-t border-[#C8DEF2] bg-white/60 backdrop-blur-xs py-4 text-xs text-slate-500 mt-auto hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#005CA9]">Loterias Caixa</span>
            <span aria-hidden="true">·</span>
            <span>Mega-Sena, Lotofácil e Quina · Sincronizado com Google Firebase Firestore</span>
          </div>

          <div className="text-slate-500 font-medium">
            Painel Oficial do Bolão · Acesso Público e Livre (Sem senhas)
          </div>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar in Authentic Caixa Blue (100% Mobile Thumb Zone) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-[#002447] via-[#003566] to-[#003D73] border-t border-[#001F3D] py-1 px-2 flex items-center justify-around sm:hidden shadow-2xl pb-safe">
        <button
          onClick={() => {
            sounds.playBallTap(450);
            setActiveTab('overview');
          }}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            activeTab === 'overview' ? 'text-[#FFB612] font-black scale-105' : 'text-blue-200/75 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Bolão</span>
        </button>

        <button
          onClick={() => {
            sounds.playBallTap(450);
            setActiveTab('simulator');
          }}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            activeTab === 'simulator' ? 'text-[#FFB612] font-black scale-105' : 'text-blue-200/75 hover:text-white'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Simulador</span>
        </button>

        <button
          onClick={() => {
            sounds.playBallTap(450);
            setActiveTab('participants');
          }}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all relative active:scale-95 ${
            activeTab === 'participants' ? 'text-[#FFB612] font-black scale-105' : 'text-blue-200/75 hover:text-white'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Cotistas</span>
          {activePool && activePool.participants.length > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-[#FFB612] text-slate-950 text-[9px] font-mono flex items-center justify-center font-black shadow-xs">
              {activePool.participants.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            sounds.playBallTap(450);
            setActiveTab('tickets');
          }}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            activeTab === 'tickets' ? 'text-[#FFB612] font-black scale-105' : 'text-blue-200/75 hover:text-white'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Jogos</span>
        </button>

        <button
          onClick={() => {
            sounds.playBallTap(450);
            setActiveTab('results');
          }}
          className={`flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 transition-all active:scale-95 ${
            activeTab === 'results' ? 'text-[#FFB612] font-black scale-105' : 'text-blue-200/75 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 tracking-tight">Conferir</span>
        </button>
      </nav>
    </div>
  );
}
