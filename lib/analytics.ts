
/**
 * Resource Analytics Algorithm Utility
 * Implements the V-Matrix and Entry Size calculation logic
 */

export const calculateVMatrix = (N: number, K: number, ratio: number): number[][] => {
  const V: number[][] = Array.from({ length: N + 1 }, () => Array(K + 1).fill(0));

  // Base Case: V[n][0] = 1.0 for all n
  for (let n = 0; n <= N; n++) {
    V[n][0] = 1.0;
  }

  // Fill Matrix
  for (let n = 1; n <= N; n++) {
    for (let k = 1; k <= Math.min(n, K); k++) {
      if (n === k) {
        V[n][k] = V[n - 1][k - 1] / ratio;
      } else {
        V[n][k] = (V[n - 1][k - 1] / ratio) + (V[n - 1][k] * (1 - 1 / ratio));
      }
    }
  }

  return V;
};

export const calculateEntryAmount = (
  currentBalance: number,
  nRemaining: number,
  kRemaining: number,
  ratio: number,
  V: number[][]
 ): number => {
  // If target successes reached or impossible to reach, amount is 0
  if (kRemaining <= 0 || nRemaining < kRemaining) return 0;

  // Formula:
  // Numerator = B_current * ( V[n_remaining - 1][k_remaining - 1] - V[n_remaining - 1][k_remaining] )
  // Denominator = (ratio - 1) * V[n_remaining - 1][k_remaining] + V[n_remaining - 1][k_remaining - 1]
  
  const v_n_minus_1_k_minus_1 = V[nRemaining - 1][kRemaining - 1];
  const v_n_minus_1_k = V[nRemaining - 1][kRemaining];

  const numerator = currentBalance * (v_n_minus_1_k_minus_1 - v_n_minus_1_k);
  const denominator = (ratio - 1) * v_n_minus_1_k + v_n_minus_1_k_minus_1;

  if (denominator === 0) return 0;
  
  const amount = numerator / denominator;
  return Math.max(0, amount);
};

export const getExpectedFinalBalance = (initialBalance: number, N: number, K: number, V: number[][]): number => {
  if (V[N][K] === 0) return 0;
  return initialBalance / V[N][K];
};
