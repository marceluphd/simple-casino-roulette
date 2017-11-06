import * as game from '../game';
import * as db from '../game/db';
const TEST_DB = 'rouletteTest';

before(async () => {
  await game.initialize();
  await db.getMongoDbConnection().dropDatabase(TEST_DB);
});

after(async () => {
  await db.getMongoDbConnection().dropDatabase(TEST_DB);
  await db.getMongoDbConnection().close(true);
});
