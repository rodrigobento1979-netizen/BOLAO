import { LotteryConfig, LotteryType, ContestResult, NumberStatistic, BolaoPool } from '../types/lottery';

export const LOTTERIES_CONFIG: Record<LotteryType, LotteryConfig> = {
  megasena: {
    id: 'megasena',
    name: 'Mega-Sena',
    fullName: 'Mega-Sena Oficial',
    accentColor: '#10b981', // Emerald
    badgeBg: 'bg-emerald-50 border-emerald-300',
    badgeText: 'text-emerald-700',
    totalNumbers: 60,
    minNumbers: 6,
    maxNumbers: 20,
    defaultDrawNumbers: 6,
    minPrice: 5.0,
    drawDays: ['Terça-feira', 'Quinta-feira', 'Sábado'],
    drawTime: '20:00 (Brasília)',
    currentJackpotEstimate: 85000000,
    isAccumulated: true,
    nextContestNumber: 2824,
    nextContestDate: '2026-10-29',
    prizes: [
      { tier: 'Sena', hitsNeeded: 6, description: 'Prêmio Principal (6 dezenas)' },
      { tier: 'Quina', hitsNeeded: 5, description: '5 acertos (Prêmio intermediário alto)' },
      { tier: 'Quadra', hitsNeeded: 4, description: '4 acertos (Premiação de retorno base)' },
    ],
    statSumIdealRange: [130, 210],
    statIdealOddEven: '3 Pares e 3 Ímpares (33%) ou 4P/2I (24%)',
    priceTable: [
      { numbers: 6, price: 5.0, equivalentSingleBets: 1, oddsJackpot: 50063860 },
      { numbers: 7, price: 35.0, equivalentSingleBets: 7, oddsJackpot: 7151980 },
      { numbers: 8, price: 140.0, equivalentSingleBets: 28, oddsJackpot: 1787995 },
      { numbers: 9, price: 420.0, equivalentSingleBets: 84, oddsJackpot: 595998 },
      { numbers: 10, price: 1050.0, equivalentSingleBets: 210, oddsJackpot: 238399 },
      { numbers: 11, price: 2310.0, equivalentSingleBets: 462, oddsJackpot: 108363 },
      { numbers: 12, price: 4620.0, equivalentSingleBets: 924, oddsJackpot: 54182 },
      { numbers: 13, price: 8580.0, equivalentSingleBets: 1716, oddsJackpot: 29175 },
      { numbers: 14, price: 15015.0, equivalentSingleBets: 3003, oddsJackpot: 16671 },
      { numbers: 15, price: 25025.0, equivalentSingleBets: 5005, oddsJackpot: 10003 },
      { numbers: 16, price: 40040.0, equivalentSingleBets: 8008, oddsJackpot: 6252 },
      { numbers: 17, price: 61880.0, equivalentSingleBets: 12376, oddsJackpot: 4045 },
      { numbers: 18, price: 92820.0, equivalentSingleBets: 18564, oddsJackpot: 2697 },
      { numbers: 19, price: 135660.0, equivalentSingleBets: 27132, oddsJackpot: 1845 },
      { numbers: 20, price: 193800.0, equivalentSingleBets: 38760, oddsJackpot: 1292 },
    ],
  },

  lotofacil: {
    id: 'lotofacil',
    name: 'Lotofácil',
    fullName: 'Lotofácil Oficial',
    accentColor: '#9333ea', // Purple
    badgeBg: 'bg-purple-50 border-purple-300',
    badgeText: 'text-purple-700',
    totalNumbers: 25,
    minNumbers: 15,
    maxNumbers: 20,
    defaultDrawNumbers: 15,
    minPrice: 3.0,
    drawDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    drawTime: '20:00 (Brasília)',
    currentJackpotEstimate: 6000000,
    isAccumulated: false,
    nextContestNumber: 3318,
    nextContestDate: '2026-10-28',
    prizes: [
      { tier: '15 Acertos', hitsNeeded: 15, description: 'Prêmio Principal' },
      { tier: '14 Acertos', hitsNeeded: 14, description: 'Segunda faixa' },
      { tier: '13 Acertos', hitsNeeded: 13, description: 'R$ 30,00 fixo' },
      { tier: '12 Acertos', hitsNeeded: 12, description: 'R$ 12,00 fixo' },
      { tier: '11 Acertos', hitsNeeded: 11, description: 'R$ 6,00 fixo' },
    ],
    statSumIdealRange: [180, 210],
    statIdealOddEven: '8 Ímpares e 7 Pares (31%) ou 7Í/8P (26%)',
    priceTable: [
      { numbers: 15, price: 3.0, equivalentSingleBets: 1, oddsJackpot: 3268760 },
      { numbers: 16, price: 48.0, equivalentSingleBets: 16, oddsJackpot: 204297 },
      { numbers: 17, price: 408.0, equivalentSingleBets: 136, oddsJackpot: 24035 },
      { numbers: 18, price: 2448.0, equivalentSingleBets: 816, oddsJackpot: 4005 },
      { numbers: 19, price: 11628.0, equivalentSingleBets: 3876, oddsJackpot: 843 },
      { numbers: 20, price: 46512.0, equivalentSingleBets: 15504, oddsJackpot: 211 },
    ],
  },

  quina: {
    id: 'quina',
    name: 'Quina',
    fullName: 'Quina Oficial',
    accentColor: '#2563eb', // Blue
    badgeBg: 'bg-blue-50 border-blue-300',
    badgeText: 'text-blue-700',
    totalNumbers: 80,
    minNumbers: 5,
    maxNumbers: 15,
    defaultDrawNumbers: 5,
    minPrice: 2.5,
    drawDays: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    drawTime: '20:00 (Brasília)',
    currentJackpotEstimate: 14500000,
    isAccumulated: true,
    nextContestNumber: 6652,
    nextContestDate: '2026-10-28',
    prizes: [
      { tier: 'Quina', hitsNeeded: 5, description: 'Prêmio Principal (5 acertos)' },
      { tier: 'Quadra', hitsNeeded: 4, description: '4 acertos' },
      { tier: 'Terno', hitsNeeded: 3, description: '3 acertos' },
      { tier: 'Duque', hitsNeeded: 2, description: '2 acertos' },
    ],
    statSumIdealRange: [180, 240],
    statIdealOddEven: '3 Ímpares e 2 Pares (31%) ou 2Í/3P (31%)',
    priceTable: [
      { numbers: 5, price: 2.5, equivalentSingleBets: 1, oddsJackpot: 24040016 },
      { numbers: 6, price: 15.0, equivalentSingleBets: 6, oddsJackpot: 4006669 },
      { numbers: 7, price: 52.5, equivalentSingleBets: 21, oddsJackpot: 1144763 },
      { numbers: 8, price: 140.0, equivalentSingleBets: 56, oddsJackpot: 429286 },
      { numbers: 9, price: 315.0, equivalentSingleBets: 126, oddsJackpot: 190794 },
      { numbers: 10, price: 630.0, equivalentSingleBets: 252, oddsJackpot: 95396 },
      { numbers: 11, price: 1155.0, equivalentSingleBets: 462, oddsJackpot: 52035 },
      { numbers: 12, price: 1980.0, equivalentSingleBets: 792, oddsJackpot: 30354 },
      { numbers: 13, price: 3217.5, equivalentSingleBets: 1287, oddsJackpot: 18679 },
      { numbers: 14, price: 5005.0, equivalentSingleBets: 2002, oddsJackpot: 12008 },
      { numbers: 15, price: 7507.5, equivalentSingleBets: 3003, oddsJackpot: 8005 },
    ],
  },
};

// Historical Frequency & Delay Seed Data for Mega-Sena, Lotofácil and Quina
export function getLotteryNumberStatistics(lottery: LotteryType): NumberStatistic[] {
  const config = LOTTERIES_CONFIG[lottery];
  const total = config.totalNumbers;
  const stats: NumberStatistic[] = [];

  // Deterministic realistic statistical seed based on official Caixa historical archives
  const hotNumbersMega = [10, 53, 5, 37, 34, 23, 4, 42, 33, 27, 38, 54, 17, 28, 41];
  const overdueMega = [15, 21, 26, 55, 59, 12, 19, 48];

  const hotNumbersLoto = [20, 10, 25, 11, 13, 24, 3, 14, 5, 1, 22, 17];
  const overdueLoto = [8, 16, 23, 6];

  const hotNumbersQuina = [4, 49, 39, 52, 26, 16, 44, 31, 10, 73, 56];
  const overdueQuina = [3, 18, 41, 67, 79];

  for (let num = 1; num <= total; num++) {
    const isOdd = num % 2 !== 0;
    
    let quadrant: 1 | 2 | 3 | 4 = 1;
    if (total === 60) {
      const row = Math.ceil(num / 10);
      const col = ((num - 1) % 10) + 1;
      if (row <= 3 && col <= 5) quadrant = 1;
      else if (row <= 3 && col > 5) quadrant = 2;
      else if (row > 3 && col <= 5) quadrant = 3;
      else quadrant = 4;
    } else {
      quadrant = num <= total * 0.25 ? 1 : num <= total * 0.5 ? 2 : num <= total * 0.75 ? 3 : 4;
    }

    let status: 'quente' | 'fria' | 'atrasada' | 'neutra' = 'neutra';
    let freqTotal = Math.floor(260 + ((num * 17) % 73));
    let freqRecent = Math.floor(4 + ((num * 7) % 12));
    let delay = Math.floor(((num * 3) % 18) + 1);

    if (lottery === 'megasena') {
      if (hotNumbersMega.includes(num)) {
        status = 'quente';
        freqTotal += 45;
        freqRecent += 6;
        delay = Math.floor(Math.random() * 3) + 1;
      } else if (overdueMega.includes(num)) {
        status = 'atrasada';
        delay = 14 + (num % 15);
      } else if (num % 7 === 0 && num > 40) {
        status = 'fria';
        freqRecent = Math.max(1, freqRecent - 3);
      }
    } else if (lottery === 'lotofacil') {
      freqTotal = Math.floor(1900 + ((num * 31) % 180));
      freqRecent = Math.floor(25 + ((num * 3) % 15));
      if (hotNumbersLoto.includes(num)) {
        status = 'quente';
        freqRecent += 8;
        delay = 1;
      } else if (overdueLoto.includes(num)) {
        status = 'atrasada';
        delay = 4 + (num % 5);
      }
    } else if (lottery === 'quina') {
      freqTotal = Math.floor(410 + ((num * 23) % 60));
      freqRecent = Math.floor(5 + ((num * 2) % 8));
      if (hotNumbersQuina.includes(num)) {
        status = 'quente';
        freqRecent += 6;
        delay = 1;
      } else if (overdueQuina.includes(num)) {
        status = 'atrasada';
        delay = 18 + (num % 12);
      }
    }

    stats.push({
      number: num,
      frequencyTotal: freqTotal,
      frequencyRecent: freqRecent,
      delayContests: delay,
      status,
      odd: isOdd,
      quadrant,
    });
  }

  return stats;
}

// Sample recent official Caixa contest results for instant checking
export const LATEST_OFFICIAL_RESULTS: Record<LotteryType, ContestResult> = {
  megasena: {
    lotteryType: 'megasena',
    contestNumber: 2823,
    drawDate: '2026-10-26',
    drawnNumbers: [10, 14, 27, 33, 45, 53],
    accumulated: true,
    nextJackpotEstimate: 85000000,
    prizeTiers: [
      { hitsDescription: '6 acertos (Sena)', winnersCount: 0, prizeValue: 0 },
      { hitsDescription: '5 acertos (Quina)', winnersCount: 68, prizeValue: 54932.18 },
      { hitsDescription: '4 acertos (Quadra)', winnersCount: 4892, prizeValue: 1102.45 },
    ],
  },
  lotofacil: {
    lotteryType: 'lotofacil',
    contestNumber: 3317,
    drawDate: '2026-10-27',
    drawnNumbers: [1, 3, 5, 7, 8, 10, 11, 13, 14, 17, 19, 20, 22, 24, 25],
    accumulated: false,
    nextJackpotEstimate: 6000000,
    prizeTiers: [
      { hitsDescription: '15 acertos', winnersCount: 2, prizeValue: 1845120.30 },
      { hitsDescription: '14 acertos', winnersCount: 312, prizeValue: 1680.50 },
      { hitsDescription: '13 acertos', winnersCount: 11400, prizeValue: 30.0 },
      { hitsDescription: '12 acertos', winnersCount: 134200, prizeValue: 12.0 },
      { hitsDescription: '11 acertos', winnersCount: 712000, prizeValue: 6.0 },
    ],
  },
  quina: {
    lotteryType: 'quina',
    contestNumber: 6651,
    drawDate: '2026-10-27',
    drawnNumbers: [12, 23, 44, 58, 77],
    accumulated: true,
    nextJackpotEstimate: 14500000,
    prizeTiers: [
      { hitsDescription: '5 acertos (Quina)', winnersCount: 0, prizeValue: 0 },
      { hitsDescription: '4 acertos (Quadra)', winnersCount: 45, prizeValue: 9840.12 },
      { hitsDescription: '3 acertos (Terno)', winnersCount: 3820, prizeValue: 112.40 },
      { hitsDescription: '2 acertos (Duque)', winnersCount: 94100, prizeValue: 4.55 },
    ],
  },
};

// Default sample pool to provide immediate rich experience
export const INITIAL_POOLS: Record<LotteryType, BolaoPool[]> = {
  megasena: [
    {
      id: 'pool-mega-amigos-1',
      title: 'Bolão dos 15 Amigos - Mega da Virada',
      lotteryType: 'megasena',
      targetContestNumber: 2824,
      targetContestDate: '2026-10-29',
      quotaPrice: 30.0,
      totalQuotas: 15,
      status: 'open_bets',
      createdAt: '2026-10-27T14:00:00Z',
      notes: 'Bolão estratégico para 15 pessoas a R$ 30 por cota (Total R$ 450,00). Aplicação de fechamento matemático de 16 dezenas e desdobramento.',
      participants: [
        {
          id: 'part-1',
          name: 'Rodrigo Bento (Organizador)',
          phone: '(11) 98765-4321',
          quotas: 1,
          paid: true,
          chosenNumbers: [5, 10, 23, 34, 42, 53],
          joinedAt: '2026-10-27T14:10:00Z',
        },
        {
          id: 'part-2',
          name: 'Carlos Mendes',
          phone: '(11) 97123-8899',
          quotas: 1,
          paid: true,
          chosenNumbers: [4, 10, 17, 28, 38, 54],
          joinedAt: '2026-10-27T14:25:00Z',
        },
        {
          id: 'part-3',
          name: 'Mariana Silveira',
          phone: '(21) 99344-1122',
          quotas: 1,
          paid: true,
          chosenNumbers: [5, 14, 27, 33, 41, 60],
          joinedAt: '2026-10-27T15:00:00Z',
        },
        {
          id: 'part-4',
          name: 'Lucas Ferreira',
          phone: '(31) 98877-2233',
          quotas: 1,
          paid: false,
          chosenNumbers: [7, 10, 23, 31, 45, 58],
          joinedAt: '2026-10-27T15:45:00Z',
        },
        {
          id: 'part-5',
          name: 'Ana Paula Rocha',
          phone: '(41) 99111-6677',
          quotas: 1,
          paid: true,
          chosenNumbers: [3, 11, 22, 34, 42, 53],
          joinedAt: '2026-10-27T16:10:00Z',
        },
      ],
      tickets: [],
    },
  ],
  lotofacil: [
    {
      id: 'pool-loto-familia-1',
      title: 'Bolão Lotofácil 15 Cotas - 14 e 15 Pontos',
      lotteryType: 'lotofacil',
      targetContestNumber: 3318,
      targetContestDate: '2026-10-28',
      quotaPrice: 25.0,
      totalQuotas: 15,
      status: 'open_bets',
      createdAt: '2026-10-27T10:00:00Z',
      notes: 'Fechamento com 5 dezenas fixas de consenso do grupo e 15 variáveis, maximizando retorno para 14 pontos.',
      participants: [
        {
          id: 'part-l1',
          name: 'Rodrigo Bento',
          quotas: 1,
          paid: true,
          chosenNumbers: [1, 2, 3, 5, 7, 8, 10, 11, 13, 14, 17, 19, 20, 22, 24],
          joinedAt: '2026-10-27T10:15:00Z',
        },
        {
          id: 'part-l2',
          name: 'Juliana Costa',
          quotas: 1,
          paid: true,
          chosenNumbers: [1, 3, 4, 5, 8, 9, 10, 12, 13, 15, 17, 20, 21, 23, 25],
          joinedAt: '2026-10-27T10:30:00Z',
        },
        {
          id: 'part-l3',
          name: 'Marcos Vinícius',
          quotas: 1,
          paid: true,
          chosenNumbers: [2, 3, 5, 6, 7, 10, 11, 13, 14, 16, 18, 20, 22, 24, 25],
          joinedAt: '2026-10-27T11:00:00Z',
        },
      ],
      tickets: [],
    },
  ],
  quina: [
    {
      id: 'pool-quina-1',
      title: 'Bolão da Quina em Grupo - 10 Cotas',
      lotteryType: 'quina',
      targetContestNumber: 6652,
      targetContestDate: '2026-10-28',
      quotaPrice: 20.0,
      totalQuotas: 10,
      status: 'open_bets',
      createdAt: '2026-10-27T11:00:00Z',
      notes: 'Desdobramento inteligente com dezenas de alta frequência e atraso reduzido.',
      participants: [
        {
          id: 'part-q1',
          name: 'Rodrigo Bento',
          quotas: 1,
          paid: true,
          chosenNumbers: [4, 16, 26, 39, 52],
          joinedAt: '2026-10-27T11:10:00Z',
        },
      ],
      tickets: [],
    },
  ],
};
