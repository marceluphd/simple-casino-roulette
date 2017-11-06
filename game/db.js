import { MongoClient } from 'mongodb';
const config = require('../config.json')[process.env.NODE_ENV];

let mongoDbConnection = null;

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

export function getMongoDbConnection() {
  return mongoDbConnection;
}
