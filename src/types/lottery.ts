export type LotteryType = 'megasena' | 'lotofacil' | 'quina';

export interface SyndicateSimulationResult {
  participantCount: number;
  quotaValue: number;
  totalBudget: number;
  recommendedOption: 'fechamento' | 'multipla' | 'hibrido';
  fechamentoPlan: {
    title: string;
    description: string;
    totalTickets: number;
    distinctNumbersCovered: number;
    guarantee: string;
    efficiencyScore: number;
    estimatedCost: number;
    leftoverCash: number;
  };
  multiplaPlan: {
    title: string;
    description: string;
    numbersInTicket: number;
    equivalentBets: number;
    totalCost: number;
    bonusTicketsCount: number;
    multiplierEffect: string;
  };
  mathematicianVerdict: string;
}

export interface LotteryConfig {
  id: LotteryType;
  name: string;
  fullName: string;
  accentColor: string;
  badgeBg: string;
  badgeText: string;
  totalNumbers: number;
  minNumbers: number;
  maxNumbers: number;
  defaultDrawNumbers: number;
  minPrice: number;
  drawDays: string[];
  drawTime: string;
  currentJackpotEstimate: number;
  isAccumulated: boolean;
  nextContestNumber: number;
  nextContestDate: string;
  prizes: {
    tier: string;
    hitsNeeded: number | string;
    description: string;
  }[];
  priceTable: {
    numbers: number;
    price: number;
    equivalentSingleBets: number;
    oddsJackpot: number;
  }[];
  statSumIdealRange: [number, number];
  statIdealOddEven: string;
}

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'participant';
  registeredAt: string;
}

export interface BoletoPayment {
  barcode: string;
  linhaDigitavel: string;
  pixCopyPaste: string;
  dueDate: string;
  amount: number;
  status: 'pendente' | 'pago';
  paidAt?: string;
}

export interface Participant {
  id: string;
  userId?: string;
  name: string;
  phone?: string;
  email?: string;
  quotas: number;
  paid: boolean;
  chosenNumbers: number[];
  joinedAt: string;
  boleto?: BoletoPayment;
}

export interface PoolNotification {
  id: string;
  poolId: string;
  poolTitle: string;
  lotteryType: LotteryType;
  message: string;
  quotaPrice: number;
  createdAt: string;
  read: boolean;
  sentToUsersCount: number;
}

export interface GeneratedTicket {
  id: string;
  ticketNumber: number;
  numbers: number[];
  specialNumbers?: number[];
  cost: number;
  strategyUsed: 'super_combinada' | 'fechamento_matematico' | 'aposta_multipla' | 'consenso_participantes' | 'balanceada_estatistica';
  confidenceScore: number;
  rationale: string;
  hits?: number;
  winningTier?: string;
  prizeAmount?: number;
}

export interface BolaoPool {
  id: string;
  title: string;
  lotteryType: LotteryType;
  targetContestNumber: number;
  targetContestDate: string;
  quotaPrice: number;
  totalQuotas: number;
  participants: Participant[];
  tickets: GeneratedTicket[];
  status: 'planning' | 'open_bets' | 'locked' | 'checked' | 'archived';
  createdAt: string;
  endDate?: string;
  archivedAt?: string;
  notes?: string;
  checkedContestResult?: ContestResult;
  createdByAdminName?: string;
  selectedStrategy?: 'fechamento_munir' | 'hibrido' | 'democratica';
}

export interface ContestResult {
  lotteryType: LotteryType;
  contestNumber: number;
  drawDate: string;
  drawnNumbers: number[];
  specialNumbers?: number[];
  accumulated: boolean;
  nextJackpotEstimate: number;
  prizeTiers: {
    hitsDescription: string;
    winnersCount: number;
    prizeValue: number;
  }[];
}

export interface NumberStatistic {
  number: number;
  frequencyTotal: number;
  frequencyRecent: number;
  delayContests: number;
  status: 'quente' | 'fria' | 'atrasada' | 'neutra';
  odd: boolean;
  quadrant: 1 | 2 | 3 | 4;
}

export interface GroupAnalysis {
  totalBudget: number;
  totalQuotas: number;
  availableCash: number;
  participantCount: number;
  distinctNumbersCount: number;
  consensusNumbers: { number: number; votes: number }[];
  parityBalance: { oddCount: number; evenCount: number; ratioLabel: string };
  quadrantSpread: { q1: number; q2: number; q3: number; q4: number };
  averageSum: number;
  recommendation: {
    recommendedStrategy: 'multipla' | 'desdobramento' | 'hibrido';
    headline: string;
    explanation: string;
    potentialCoverage: number;
    multiplierExplanation: string;
  };
}
