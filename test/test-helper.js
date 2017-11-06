import * as db from '../db';
const TEST_DB = 'rouletteTest';

before(async () => {
  await db.initialize();
  await db.getMongoDbConnection().dropDatabase(TEST_DB);
});

after(async () => {
  await db.getMongoDbConnection().dropDatabase(TEST_DB);
  await db.getMongoDbConnection().close(true);
  db.closeGame();
});
