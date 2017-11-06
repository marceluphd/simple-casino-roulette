import * as db from '../db';
const TEST_DB = 'rouletteTest';

before(async () => {
  const dbConnection = await db.connectToMongoDb();
  await dbConnection.dropDatabase(TEST_DB);
});

after(async () => {
  await db.getMongoDbConnection().dropDatabase(TEST_DB);
  await db.getMongoDbConnection().close(true);
});
