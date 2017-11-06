import { MongoClient } from 'mongodb';
import Round from './round';
import Bet from './bet';

const config = require('../config.json')[process.env.NODE_ENV];
const STARTING_BALANCE = 1000;

let mongoDbConnection = null;
let round = null;
let bet = null;

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
      round = new Round(mongoDbConnection);
      bet = new Bet(mongoDbConnection);
    }
  } catch (err) {
    console.log(err);
  }

  return mongoDbConnection;
}

export function getMongoDbConnection() {
  return mongoDbConnection;
}

export async function createBet(roundNo, number, amount) {
  try {
    return await bet.create(
      await round.getCurrentRound(),
      currentBalance,
      roundNo,
      number,
      amount
    );
  } catch (err) {
    console.error(err);
  }
}

// Exposed for convenient unit test
export async function startNextRound() {
  let nextRound = null;
  try {
    nextRound = await round.createNextRound();
  } catch (err) {
    console.error(err);
  }

  return nextRound;
}
