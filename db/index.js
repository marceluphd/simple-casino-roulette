import { MongoClient } from 'mongodb';
import Round from './round';
import Bet from './bet';

const config = require('../config.json')[process.env.NODE_ENV];
const STARTING_BALANCE = 1000;

let mongoDbConnection = null;
let round = null;
let bet = null;
let timerIdForRound = null;

// Balance stored in-memory because I've made assumptions:
// 1) one player only (for now)
// 2) If program crashes, the player starts with starting balance again.
let currentBalance = STARTING_BALANCE;

export async function connectToMongoDb() {
  try {
    if (!mongoDbConnection) {
      mongoDbConnection =
          await MongoClient.connect(config.roulette.mongodb.url);
      console.log('Connected to MongoDB.');
    }
  } catch (err) {
    console.log(err);
  }

  return mongoDbConnection;
}

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

export function getMongoDbConnection() {
  return mongoDbConnection;
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
  await bet.evaluateAllBets(
    roundNo,
    startTime,
    endTime,
    winningNumber
  );
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
