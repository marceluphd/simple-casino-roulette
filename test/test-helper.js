import * as db from '../db';

before(async () => {
  await db.connectToMongoDb();
});

after(async () => {
  await db.getMongoDbConnection().close(true);
});
