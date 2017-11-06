const expect = require("chai").expect;
import * as db from '../../db';

describe('DB', function() {
  describe('#createBet()', async () => {
    it('should create bet when all inputs are valid', async () => {
      const { roundNo: currentRoundNo } = await db.startNextRound();
      const {data: newBet, errors} = await db.createBet(currentRoundNo, 7, 10);
      expect(newBet).to.include({
        roundNo: currentRoundNo,
        number: 7,
        amount: 10,
        success: null,
        payout: null,
      });
      expect(newBet).to.have.property('time');
      expect(newBet).to.have.property('_id');
      expect(errors).to.be.null;
    });

    it('bet created should have ID', async () => {
      const { roundNo: currentRoundNo } = await db.startNextRound();
      const {data: newBet} = await db.createBet(currentRoundNo, 7, 10);
      expect(newBet).to.have.property('_id');
    });

    it('should not create bet when given round is not the active one',
        async () => {
      const previousRound = await db.startNextRound();
      const currentRound = await db.startNextRound();
      const {data: newBet, errors} =
          await db.createBet(previousRound.roundNo, 7, 10);
      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });

    it('should not create bet when chosen number is out of range', async () => {
      const { roundNo: currentRoundNo } = await db.startNextRound();
      const invalidNumber = 40;
      const {data: newBet, errors} = await db.createBet(
        currentRoundNo,
        invalidNumber,
        10
      );

      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });

    it('should not create bet when amount is out of range', async () => {
      const { roundNo: currentRoundNo } = await db.startNextRound();
      const invalidAmount = 200;
      const {data: newBet, errors} = await db.createBet(
        currentRoundNo,
        20,
        invalidAmount
      );

      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });

    it('should not create bet when amount together with bets placed'
        + 'so far for the current round exceeds current balance', async () => {
      const { roundNo: currentRoundNo } = await db.startNextRound();

      // Place 10 bets in the first round and exhaust starting balance 1000.
      for (let i = 0; i < 10; i++) {
        const {data: newBet, errors} =
            await db.createBet(currentRoundNo, i, 100);
        expect(newBet).not.to.be.null;
        expect(errors).to.be.null;
      }

      const {data: newBet, errors} =
        await db.createBet(currentRoundNo, 20, 100);
      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });
  });

  describe('#finishCurrentRound()', async () => {
    it('should update winning and losing bets', async () => {
      const { roundNo: currentRoundNo, startTime, endTime } = await db.startNextRound();

      const winningNumber = 16;
      await db.createBet(currentRoundNo, winningNumber, 10);
      await db.createBet(currentRoundNo, 9, 20);
      await db.createBet(currentRoundNo, winningNumber, 10);

      await db.finishCurrentRound(winningNumber);
      const betsCollection = db.getMongoDbConnection().collection('bets');
      const winningBets = await betsCollection.find({
          roundNo: currentRoundNo,
          time: { $gte: startTime, $lte: endTime },
          success: true,
      }).toArray();
      expect(winningBets).to.have.length(2);
      expect(winningBets[0].payout).to.equal(360);
      expect(winningBets[1].payout).to.equal(360);

      const lostBets = await betsCollection.find({
        roundNo: currentRoundNo,
        time: { $gte: startTime, $lte: endTime },
        success: false,
      }).toArray();
      expect(lostBets).to.have.length(1);
      expect(lostBets[0].payout).to.equal(-20);
    });
  });
});
