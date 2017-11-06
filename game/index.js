import { connectToMongoDb } from './db';
import Round from './round';
import Bet from './bet';

const STARTING_BALANCE = 1000;

let round = null;
let bet = null;
let timerIdForRound = null;

// Balance stored in-memory because I've made assumptions:
// 1) one player only (for now)
// 2) If program crashes, the player starts with starting balance again.
let currentBalance = STARTING_BALANCE;

export async function initialize() {
  const db = await connectToMongoDb();
  round = new Round(db);
  bet = new Bet(db);
  await startNextRound();
}

export function startTimerForCurrentRound() {
  timerIdForRound = setTimeout(async () => {
    await finishRoundAndStartNew();
  }, round.ROUND_DURATION);
}

export async function createBet(roundNo, number, amount) {
  let result = null;
  try {
    result = await bet.create(
      await round.getCurrentRound(),
      currentBalance,
      roundNo,
      number,
      amount
    );
  } catch (err) {
    console.error(err);
  }

  return result;
}

export async function startNextRound() {
  let nextRound = null;
  try {
    nextRound = await round.createNextRound();
  } catch (err) {
    console.error(err);
  }

  return nextRound;
}

// Exposed for convenient unit test.
export async function finishCurrentRound(winningNumber) {
  const { roundNo, startTime, endTime } = await round.getCurrentRound();
  currentBalance = await bet.evaluateAllBets(
    roundNo,
    startTime,
    endTime,
    winningNumber,
    currentBalance
  );
}

export function getCurrentBalance() {
  return currentBalance;
}

// for unit test convenience
export function resetBalance() {
  currentBalance = STARTING_BALANCE;
}

function chooseWinningNumber() {
  return Math.floor(Math.random() * (bet.MAX_NUMBER +1));
}

export async function finishRoundAndStartNew() {
  try {
    const winningNumber = chooseWinningNumber();
    await finishCurrentRound(winningNumber);
    await startNextRound();

    // Start timer for new round.
    timerIdForRound = setTimeout(async () => {
      await finishRoundAndStartNew();
    }, round.ROUND_DURATION);

  } catch (err) {
    console.log(err);
  }
}

// for unit test convenience
export async function getWinningBets(roundNo, startTime, endTime) {
  return await bet.readWinningBets(roundNo, startTime, endTime);
}

// for unit test convenience
export async function getLostBets(roundNo, startTime, endTime) {
  return await bet.readLostBets(roundNo, startTime, endTime);
}
