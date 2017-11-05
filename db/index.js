import { MongoClient } from 'mongodb';
import Round from './round';
import Bet from './bet';

const config = require('../config.json')[process.env.NODE_ENV];

let mongoDbConnection = null;
let round = null;
let bet = null;

export async function connectToMongoDb() {
  try {
    if (!mongoDbConnection) {
      mongoDbConnection = await MongoClient.connect(config.roulette.mongodb.url);
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
      roundNo,
      number,
      amount
    );
  } catch (err) {
    console.error(err);
  }
}
