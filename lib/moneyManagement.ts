import { calculateVMatrix as calcV, calculateEntryAmount, getExpectedFinalBalance } from './analytics';

export const calculateVMatrix = (N: number, K: number, odds: number): number[][] => {
  return calcV(N, K, odds);
};

export const calculateBetAmount = (
  currentCapital: number,
  nRemaining: number,
  kRemaining: number,
  odds: number,
  V: number[][]
): number => {
  return calculateEntryAmount(currentCapital, nRemaining, kRemaining, odds, V);
};

export const getExpectedFinalCapital = (initialCapital: number, N: number, K: number, V: number[][]): number => {
  return getExpectedFinalBalance(initialCapital, N, K, V);
};
