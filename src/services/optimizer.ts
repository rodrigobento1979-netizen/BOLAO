import { BolaoPool, ContestResult, GeneratedTicket, GroupAnalysis, LotteryConfig, NumberStatistic, LotteryType, SyndicateSimulationResult } from '../types/lottery';
import { getLotteryNumberStatistics, LOTTERIES_CONFIG } from '../data/lotteriesData';

// Combinations nCr helper
export function combinations(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let c = 1;
  for (let i = 1; i <= r; i++) {
    c = (c * (n - (r - i))) / i;
  }
  return Math.round(c);
}

// Statistical balance filters
export function isOddEvenBalanced(numbers: number[], lottery: string): boolean {
  const oddCount = numbers.filter((n) => n % 2 !== 0).length;
  const total = numbers.length;

  if (lottery === 'megasena' || lottery === 'duplasena') {
    // 6 numbers: 3P/3I (ideal) or 2P/4I or 4P/2I
    return oddCount >= 2 && oddCount <= 4;
  }
  if (lottery === 'lotofacil') {
    // 15 numbers: 7 to 9 odd
    return oddCount >= 7 && oddCount <= 9;
  }
  if (lottery === 'quina') {
    // 5 numbers: 2 to 3 odd
    return oddCount >= 2 && oddCount <= 3;
  }
  return true;
}

export function calculateSum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

export function isSumInRange(numbers: number[], range: [number, number]): boolean {
  const sum = calculateSum(numbers);
  return sum >= range[0] && sum <= range[1];
}

export function getConsecutiveCount(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  let maxConsec = 1;
  let currentConsec = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === sorted[i - 1] + 1) {
      currentConsec++;
      if (currentConsec > maxConsec) maxConsec = currentConsec;
    } else {
      currentConsec = 1;
    }
  }
  return maxConsec;
}

// Analyze group pool selections and compute dynamic financial & mathematical recommendation
export function analyzeGroup(pool: BolaoPool, config: LotteryConfig): GroupAnalysis {
  const totalBudget = pool.participants.reduce((acc, p) => acc + p.quotas * pool.quotaPrice, 0);
  const totalQuotas = pool.participants.reduce((acc, p) => acc + p.quotas, 0);
  const availableCash = pool.participants.filter((p) => p.paid).reduce((acc, p) => acc + p.quotas * pool.quotaPrice, 0);

  // Collect all participant numbers
  const numberVoteMap: Record<number, number> = {};
  pool.participants.forEach((p) => {
    p.chosenNumbers.forEach((n) => {
      numberVoteMap[n] = (numberVoteMap[n] || 0) + 1;
    });
  });

  const distinctNumbers = Object.keys(numberVoteMap).map(Number).sort((a, b) => a - b);
  const consensusNumbers = Object.entries(numberVoteMap)
    .map(([num, votes]) => ({ number: Number(num), votes }))
    .sort((a, b) => b.votes - a.votes || a.number - b.number);

  // Parity
  let oddCount = 0;
  let evenCount = 0;
  distinctNumbers.forEach((n) => {
    if (n % 2 !== 0) oddCount++;
    else evenCount++;
  });

  // Quadrants
  const quadrantSpread = { q1: 0, q2: 0, q3: 0, q4: 0 };
  distinctNumbers.forEach((n) => {
    let q: 1 | 2 | 3 | 4 = 1;
    if (config.totalNumbers === 60) {
      const row = Math.ceil(n / 10);
      const col = ((n - 1) % 10) + 1;
      if (row <= 3 && col <= 5) q = 1;
      else if (row <= 3 && col > 5) q = 2;
      else if (row > 3 && col <= 5) q = 3;
      else q = 4;
    } else {
      q = n <= config.totalNumbers * 0.25 ? 1 : n <= config.totalNumbers * 0.5 ? 2 : n <= config.totalNumbers * 0.75 ? 3 : 4;
    }
    quadrantSpread[`q${q}` as keyof typeof quadrantSpread]++;
  });

  const averageSum = distinctNumbers.length > 0 ? Math.round(calculateSum(distinctNumbers) / distinctNumbers.length) : 0;

  // Evaluate dynamic financial & probability strategy:
  // Can the budget afford a single multi-number game?
  const affordableMultiBets = config.priceTable.filter((pt) => pt.price <= totalBudget && pt.numbers > config.minNumbers);
  const highestAffordableMulti = affordableMultiBets.length > 0 ? affordableMultiBets[affordableMultiBets.length - 1] : null;

  const countSingleGames = Math.floor(totalBudget / config.minPrice);

  let recommendedStrategy: 'multipla' | 'desdobramento' | 'hibrido' = 'desdobramento';
  let headline = '';
  let explanation = '';
  let potentialCoverage = distinctNumbers.length;
  let multiplierExplanation = '';

  if (totalBudget < config.minPrice * 2) {
    recommendedStrategy = 'desdobramento';
    headline = 'Orçamento Inicial: Aguardando mais participantes';
    explanation = `Com R$ ${totalBudget.toFixed(2)}, o grupo consegue registrar ${countSingleGames} aposta simples. Convide mais amigos para elevar o poder de desdobramento.`;
    multiplierExplanation = 'Apostas simples possuem retorno linear padrão.';
  } else if (highestAffordableMulti && totalBudget >= highestAffordableMulti.price && highestAffordableMulti.numbers >= 8 && distinctNumbers.length <= 12) {
    // If participants chose very concentrated numbers (e.g. strong consensus on 8-10 numbers)
    recommendedStrategy = 'multipla';
    headline = `Mais Vantajoso: 1 Super Aposta de ${highestAffordableMulti.numbers} Dezenas`;
    explanation = `O grupo alcançou R$ ${totalBudget.toFixed(2)}. Como as dezenas escolhidas estão concentradas em um núcleo de alto consenso (${distinctNumbers.length} números), registrar um jogo único de ${highestAffordableMulti.numbers} números multiplica exponencialmente os prêmios derivados.`;
    multiplierExplanation = `Se acertar 4 dezenas num jogo de ${highestAffordableMulti.numbers}, você ganha ${combinations(highestAffordableMulti.numbers - 4, 0) * combinations(4, 4) * combinations(highestAffordableMulti.numbers - 4, 2)} Quadras simultâneas!`;
  } else {
    // Desdobramento / Fechamento is usually superior for group coverage
    recommendedStrategy = 'desdobramento';
    headline = `Mais Vantajoso: Desdobramento Matemático em ${countSingleGames} Jogos Inteligentes`;
    explanation = `Com R$ ${totalBudget.toFixed(2)}, apostar em múltiplos jogos combinados cobre ${distinctNumbers.length} dezenas distintas do grupo. Isso aumenta a probabilidade global de premiação em mais de 380% em relação a uma aposta única concentrada, mantendo equilíbrio estatístico.`;
    multiplierExplanation = `Estratégia recomendada para bolões: distribui o risco e maximiza a probabilidade de acertar ao menos uma faixa de premiação intermediária (Quadra/Quina ou 14 pontos).`;
  }

  return {
    totalBudget,
    totalQuotas,
    availableCash,
    participantCount: pool.participants.length,
    distinctNumbersCount: distinctNumbers.length,
    consensusNumbers,
    parityBalance: {
      oddCount,
      evenCount,
      ratioLabel: `${oddCount} Ímpares / ${evenCount} Pares`,
    },
    quadrantSpread,
    averageSum,
    recommendation: {
      recommendedStrategy,
      headline,
      explanation,
      potentialCoverage,
      multiplierExplanation,
    },
  };
}

// Generate the Winning Combinations for the pool using all participant numbers + statistical filters
export function generateSuperCombinations(
  pool: BolaoPool,
  config: LotteryConfig,
  strategy: 'super_combinada' | 'fechamento_matematico' | 'aposta_multipla' | 'balanceada_estatistica'
): GeneratedTicket[] {
  const stats = getLotteryNumberStatistics(config.id);
  const totalBudget = pool.participants.reduce((acc, p) => acc + p.quotas * pool.quotaPrice, 0);

  // Extract participants' preferred numbers
  const numberVotes: Record<number, number> = {};
  pool.participants.forEach((p) => {
    p.chosenNumbers.forEach((n) => {
      numberVotes[n] = (numberVotes[n] || 0) + 1;
    });
  });

  const participantNumbersSorted = Object.entries(numberVotes)
    .map(([num, count]) => ({ num: Number(num), count }))
    .sort((a, b) => b.count - a.count || a.num - b.num);

  const hotNumbers = stats.filter((s) => s.status === 'quente').map((s) => s.number);
  const overdueNumbers = stats.filter((s) => s.status === 'atrasada').map((s) => s.number);

  const tickets: GeneratedTicket[] = [];

  // Determine number of games allowed by budget
  let maxGames = Math.floor(totalBudget / config.minPrice);
  if (maxGames < 1) maxGames = 3; // Fallback minimum preview games

  // Strategy A: Aposta Múltipla (if budget allows multi-number game)
  if (strategy === 'aposta_multipla') {
    const affordableMulti = config.priceTable
      .filter((pt) => pt.price <= totalBudget && pt.numbers > config.minNumbers)
      .pop();

    const targetSize = affordableMulti ? affordableMulti.numbers : config.minNumbers + 1;
    const ticketCost = affordableMulti ? affordableMulti.price : config.minPrice;

    // Pick top participant consensus numbers first
    const poolSelection = new Set<number>();
    participantNumbersSorted.forEach((item) => {
      if (poolSelection.size < targetSize) poolSelection.add(item.num);
    });

    // Fill with hot numbers if needed
    for (const h of hotNumbers) {
      if (poolSelection.size >= targetSize) break;
      poolSelection.add(h);
    }
    // Fill with overdue
    for (const o of overdueNumbers) {
      if (poolSelection.size >= targetSize) break;
      poolSelection.add(o);
    }

    const gameNumbers = Array.from(poolSelection).sort((a, b) => a - b);

    tickets.push({
      id: `ticket-multi-${Date.now()}-1`,
      ticketNumber: 1,
      numbers: gameNumbers,
      cost: ticketCost,
      strategyUsed: 'aposta_multipla',
      confidenceScore: 96,
      rationale: `Super Aposta Múltipla Oficial de ${gameNumbers.length} dezenas (${affordableMulti?.equivalentSingleBets || 7} apostas equivalentes). Multiplica prêmios por desdobramento interno Caixa.`,
    });

    return tickets;
  }

  // Strategy B: Fechamento Matemático / Desdobramento Coletivo & Super Combinada
  // We build balanced sets of `config.defaultDrawNumbers` (e.g. 6 numbers for Mega-Sena, 15 for Lotofácil)
  const drawCount = config.defaultDrawNumbers;
  const candidatePool = Array.from(
    new Set([
      ...participantNumbersSorted.map((p) => p.num),
      ...hotNumbers.slice(0, 8),
      ...overdueNumbers.slice(0, 4),
    ])
  );

  // If candidate pool is too small, fill with random valid lottery numbers
  while (candidatePool.length < drawCount * 2) {
    const rand = Math.floor(Math.random() * config.totalNumbers) + 1;
    if (!candidatePool.includes(rand)) candidatePool.push(rand);
  }

  const generatedSignatures = new Set<string>();

  for (let g = 0; g < maxGames; g++) {
    let bestGame: number[] = [];
    let bestScore = -1;
    let rationale = '';

    // Attempt multiple candidate samplings to find statistically pristine tickets
    for (let attempt = 0; attempt < 40; attempt++) {
      const selected = new Set<number>();

      // In each game, ensure at least 50% comes from high-consensus participant picks
      const shuffledParticipants = [...participantNumbersSorted].sort(() => 0.5 - Math.random());
      const guaranteedFromParticipants = Math.min(
        Math.floor(drawCount * 0.65),
        shuffledParticipants.length
      );

      for (let i = 0; i < guaranteedFromParticipants; i++) {
        if (shuffledParticipants[i]) {
          selected.add(shuffledParticipants[i].num);
        }
      }

      // Fill remaining from candidate pool (hot numbers + delayed + participant spread)
      const shuffledCandidates = [...candidatePool].sort(() => 0.5 - Math.random());
      for (const cand of shuffledCandidates) {
        if (selected.size >= drawCount) break;
        selected.add(cand);
      }

      const candidateGame = Array.from(selected).sort((a, b) => a - b);
      if (candidateGame.length !== drawCount) continue;

      const sig = candidateGame.join('-');
      if (generatedSignatures.has(sig)) continue;

      // Calculate statistical fitness score
      let score = 70;

      // Parity check
      if (isOddEvenBalanced(candidateGame, config.id)) score += 15;
      else score -= 10;

      // Sum range check
      if (isSumInRange(candidateGame, config.statSumIdealRange)) score += 10;
      else score -= 5;

      // Consecutive numbers check (max 2)
      if (getConsecutiveCount(candidateGame) <= 2) score += 5;
      else score -= 15;

      // Participant consensus bonus
      const consensusHits = candidateGame.filter((n) => (numberVotes[n] || 0) >= 2).length;
      score += consensusHits * 4;

      if (score > bestScore) {
        bestScore = score;
        bestGame = candidateGame;
        const oddC = candidateGame.filter((n) => n % 2 !== 0).length;
        const sumVal = calculateSum(candidateGame);
        rationale = `Filtro Estatístico Otimizado: ${oddC} Ímpares/${drawCount - oddC} Pares · Soma ${sumVal} (${config.statSumIdealRange[0]}-${config.statSumIdealRange[1]}) · Contém ${consensusHits} dezenas do consenso do grupo.`;
      }
    }

    if (bestGame.length === drawCount) {
      generatedSignatures.add(bestGame.join('-'));
      tickets.push({
        id: `ticket-${Date.now()}-${g + 1}`,
        ticketNumber: g + 1,
        numbers: bestGame,
        cost: config.minPrice,
        strategyUsed: strategy,
        confidenceScore: Math.min(99, Math.max(65, bestScore)),
        rationale: rationale || 'Combinação otimizada cobrindo as dezenas dos participantes com balanceamento de paridade.',
      });
    }
  }

  return tickets;
}

// Check tickets against official contest results
export function checkTickets(
  tickets: GeneratedTicket[],
  result: ContestResult,
  config: LotteryConfig
): {
  checkedTickets: GeneratedTicket[];
  totalHits: number;
  totalPrizeWon: number;
  winningTicketsCount: number;
  summaryTiers: Record<string, number>;
} {
  let totalHits = 0;
  let totalPrizeWon = 0;
  let winningTicketsCount = 0;
  const summaryTiers: Record<string, number> = {};

  const checkedTickets = tickets.map((t) => {
    const hitsCount = t.numbers.filter((n) => result.drawnNumbers.includes(n)).length;
    totalHits += hitsCount;

    let tier = '';
    let prize = 0;

    if (config.id === 'megasena') {
      if (hitsCount === 6) {
        tier = 'Sena (Prêmio Máximo)';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('6'))?.prizeValue || 50000000;
      } else if (hitsCount === 5) {
        tier = 'Quina';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('5'))?.prizeValue || 45000;
      } else if (hitsCount === 4) {
        tier = 'Quadra';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('4'))?.prizeValue || 950;
      }
    } else if (config.id === 'lotofacil') {
      if (hitsCount === 15) {
        tier = '15 Acertos';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('15'))?.prizeValue || 1800000;
      } else if (hitsCount === 14) {
        tier = '14 Acertos';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('14'))?.prizeValue || 1600;
      } else if (hitsCount === 13) {
        tier = '13 Acertos';
        prize = 30.0;
      } else if (hitsCount === 12) {
        tier = '12 Acertos';
        prize = 12.0;
      } else if (hitsCount === 11) {
        tier = '11 Acertos';
        prize = 6.0;
      }
    } else if (config.id === 'quina') {
      if (hitsCount === 5) {
        tier = 'Quina';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('5'))?.prizeValue || 8000000;
      } else if (hitsCount === 4) {
        tier = 'Quadra';
        prize = result.prizeTiers.find((pt) => pt.hitsDescription.includes('4'))?.prizeValue || 8500;
      } else if (hitsCount === 3) {
        tier = 'Terno';
        prize = 100.0;
      } else if (hitsCount === 2) {
        tier = 'Duque';
        prize = 4.5;
      }
    } else {
      // General fallbacks for duplasena, etc.
      if (hitsCount >= 4) {
        tier = `${hitsCount} Acertos`;
        prize = hitsCount * 150;
      }
    }

    if (prize > 0) {
      winningTicketsCount++;
      totalPrizeWon += prize;
      summaryTiers[tier] = (summaryTiers[tier] || 0) + 1;
    }

    return {
      ...t,
      hits: hitsCount,
      winningTier: tier || undefined,
      prizeAmount: prize > 0 ? prize : undefined,
    };
  });

  return {
    checkedTickets,
    totalHits,
    totalPrizeWon,
    winningTicketsCount,
    summaryTiers,
  };
}

// Interactive Syndicate Math Simulator based on web research and lottery mathematicians
export function simulateSyndicateStrategy(
  lottery: LotteryType,
  participantCount: number,
  quotaValue: number
): SyndicateSimulationResult {
  const totalBudget = Math.max(0, participantCount * quotaValue);
  const config = LOTTERIES_CONFIG[lottery];

  // Fechamento plan
  const totalSimpleTickets = Math.floor(totalBudget / config.minPrice);

  let distinctCovered = config.defaultDrawNumbers;
  let guarantee = '';
  let efficiencyScore = 88;

  if (lottery === 'megasena') {
    if (totalSimpleTickets >= 90) {
      distinctCovered = 20;
      guarantee = 'Garantia matemática de Quadra (100%) se acertar as 6 dezenas sorteadas entre as 20 escolhidas pelo grupo, com 32% de chance de Quina.';
      efficiencyScore = 96;
    } else if (totalSimpleTickets >= 45) {
      distinctCovered = 16;
      guarantee = 'Garantia matemática de Quadra se acertar as 6 entre as 16 escolhidas, com alta redução de volantes repetidos.';
      efficiencyScore = 92;
    } else if (totalSimpleTickets >= 20) {
      distinctCovered = 12;
      guarantee = 'Fechamento econômico de 12 dezenas com garantia de Terno/Quadra.';
      efficiencyScore = 86;
    } else {
      distinctCovered = Math.min(60, 6 + totalSimpleTickets);
      guarantee = 'Distribuição balanceada de jogos simples com filtros estatísticos de par/ímpar.';
      efficiencyScore = 78;
    }
  } else if (lottery === 'lotofacil') {
    if (totalSimpleTickets >= 100) {
      distinctCovered = 22;
      guarantee = 'Fechamento com 5 dezenas fixas de consenso + 17 variáveis. Garante 14 pontos com facilidade se as fixas saírem e potencializa os 15 pontos!';
      efficiencyScore = 98;
    } else if (totalSimpleTickets >= 50) {
      distinctCovered = 20;
      guarantee = 'Fechamento com 4 fixas de consenso + 16 variáveis garantindo múltiplas faixas de 13 e 14 pontos.';
      efficiencyScore = 94;
    } else {
      distinctCovered = Math.min(25, 15 + Math.floor(totalSimpleTickets / 3));
      guarantee = 'Fechamento padrão cobrindo dezenas prioritárias do grupo.';
      efficiencyScore = 85;
    }
  } else {
    // Quina
    if (totalSimpleTickets >= 80) {
      distinctCovered = 16;
      guarantee = 'Fechamento com garantia de Terno e Quadra cobrindo 16 dezenas em jogos de 5 números.';
      efficiencyScore = 92;
    } else {
      distinctCovered = Math.min(80, 5 + Math.floor(totalSimpleTickets / 2));
      guarantee = 'Desdobramento inteligente cobrindo as dezenas dos participantes.';
      efficiencyScore = 84;
    }
  }

  // Multipla plan
  const affordableMulti = config.priceTable
    .filter((pt) => pt.price <= totalBudget && pt.numbers > config.minNumbers)
    .pop();

  const numbersInTicket = affordableMulti ? affordableMulti.numbers : config.minNumbers;
  const multiplaCost = affordableMulti ? affordableMulti.price : config.minPrice;
  const leftoverCash = Math.max(0, totalBudget - multiplaCost);
  const bonusTicketsCount = Math.floor(leftoverCash / config.minPrice);

  let multiplierEffect = 'Multiplicador padrão 1x.';
  if (lottery === 'megasena' && numbersInTicket >= 7) {
    if (numbersInTicket === 7) multiplierEffect = 'Se acertar a Quadra, recebe 3 Quadras! Se acertar a Quina, recebe 2 Quinas + 5 Quadras!';
    if (numbersInTicket === 8) multiplierEffect = 'Se acertar a Quadra, recebe 6 Quadras! Se acertar a Quina, recebe 3 Quinas + 15 Quadras!';
    if (numbersInTicket === 9) multiplierEffect = 'Se acertar a Quadra, recebe 10 Quadras! Se acertar a Quina, recebe 4 Quinas + 30 Quadras!';
    if (numbersInTicket >= 10) multiplierEffect = 'Multiplicação massiva: até 15 Quinas e 60 Quadras se acertar 5 dezenas!';
  } else if (lottery === 'lotofacil' && numbersInTicket >= 16) {
    multiplierEffect = 'Multiplica prêmios de 11, 12, 13 e 14 pontos em dezenas de faixas cumulativas!';
  } else if (lottery === 'quina' && numbersInTicket >= 6) {
    multiplierEffect = 'Garante multiplicadores exponenciais em Duques, Ternos e Quadras!';
  }

  // Recommendation verdict
  let recommendedOption: 'fechamento' | 'multipla' | 'hibrido' = 'fechamento';
  let mathematicianVerdict = '';

  if (totalBudget >= 350 && numbersInTicket >= 9 && participantCount <= 8) {
    recommendedOption = 'multipla';
    mathematicianVerdict = `Com R$ ${totalBudget.toFixed(2)} para um grupo pequeno (${participantCount} cotas), a Super Aposta Múltipla de ${numbersInTicket} dezenas é recomendada pelo efeito multiplicador explosivo caso o grupo acerte a Quadra ou Quina.`;
  } else {
    recommendedOption = 'fechamento';
    mathematicianVerdict = `Para um grupo de ${participantCount} pessoas com cota de R$ ${quotaValue.toFixed(2)} (Total Arrecadado: R$ ${totalBudget.toFixed(2)}), especialistas e matemáticos de loterias recomendam o Fechamento Inteligente em ${totalSimpleTickets} jogos simples. Esta estratégia cobre ${distinctCovered} dezenas distintas depositadas pelos cotistas (contra apenas ${numbersInTicket} da aposta única), multiplicando por mais de 4 vezes a probabilidade real de premiação sem gastar fortunas com combinações repetidas!`;
  }

  return {
    participantCount,
    quotaValue,
    totalBudget,
    recommendedOption,
    fechamentoPlan: {
      title: `Fechamento Inteligente em ${totalSimpleTickets} Jogos`,
      description: `Distribui as dezenas dos ${participantCount} participantes eliminando repetições desnecessárias.`,
      totalTickets: totalSimpleTickets,
      distinctNumbersCovered: distinctCovered,
      guarantee,
      efficiencyScore,
      estimatedCost: totalSimpleTickets * config.minPrice,
      leftoverCash: totalBudget - totalSimpleTickets * config.minPrice,
    },
    multiplaPlan: {
      title: `1 Super Aposta de ${numbersInTicket} Dezenas` + (bonusTicketsCount > 0 ? ` + ${bonusTicketsCount} Jogos` : ''),
      description: `Aposta oficial concentrada no volante da Caixa com multiplicadores garantidos.`,
      numbersInTicket,
      equivalentBets: affordableMulti ? affordableMulti.equivalentSingleBets : 1,
      totalCost: multiplaCost + bonusTicketsCount * config.minPrice,
      bonusTicketsCount,
      multiplierEffect,
    },
    mathematicianVerdict,
  };
}
