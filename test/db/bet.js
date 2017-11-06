const expect = require("chai").expect;
import * as game from '../../game';

describe('game', function() {
  describe('#createBet()', async () => {
    it('should create bet when all inputs are valid', async () => {
      const { roundNo: currentRoundNo } = await game.startNextRound();
      const {data: newBet, errors} = await game.createBet(currentRoundNo, 7, 10);
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
      const { roundNo: currentRoundNo } = await game.startNextRound();
      const {data: newBet} = await game.createBet(currentRoundNo, 7, 10);
      expect(newBet).to.have.property('_id');
    });

    it('should not create bet when given round is not the active one',
        async () => {
      const previousRound = await game.startNextRound();
      const currentRound = await game.startNextRound();
      const {data: newBet, errors} =
          await game.createBet(previousRound.roundNo, 7, 10);
      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });

    it('should not create bet when chosen number is out of range', async () => {
      const { roundNo: currentRoundNo } = await game.startNextRound();
      const invalidNumber = 40;
      const {data: newBet, errors} = await game.createBet(
        currentRoundNo,
        invalidNumber,
        10
      );

      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });

    it('should not create bet when amount is out of range', async () => {
      const { roundNo: currentRoundNo } = await game.startNextRound();
      const invalidAmount = 200;
      const {data: newBet, errors} = await game.createBet(
        currentRoundNo,
        20,
        invalidAmount
      );

      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });

    it('should not create bet when amount together with bets placed'
        + 'so far for the current round exceeds current balance', async () => {
      const { roundNo: currentRoundNo } = await game.startNextRound();

      // Place 10 bets in the first round and exhaust starting balance 1000.
      for (let i = 0; i < 10; i++) {
        const {data: newBet, errors} =
            await game.createBet(currentRoundNo, i, 100);
        expect(newBet).not.to.be.null;
        expect(errors).to.be.null;
      }

      const {data: newBet, errors} =
        await game.createBet(currentRoundNo, 20, 100);
      expect(newBet).to.be.null;
      expect(errors).to.have.length(1);
    });
  });

  describe('#finishCurrentRound()', async () => {
    it('should update winning and losing bets', async () => {
      const { roundNo: currentRoundNo, startTime, endTime } = await game.startNextRound();

      const winningNumber = 16;
      await game.createBet(currentRoundNo, winningNumber, 10);
      await game.createBet(currentRoundNo, 9, 20);
      await game.createBet(currentRoundNo, winningNumber, 10);
      await game.finishCurrentRound(winningNumber);

      const winningBets =
        await game.getWinningBets(currentRoundNo, startTime, endTime);
      expect(winningBets).to.have.length(2);
      expect(winningBets[0].payout).to.equal(360);
      expect(winningBets[1].payout).to.equal(360);

      const lostBets =
        await game.getLostBets(currentRoundNo, startTime, endTime);
      expect(lostBets).to.have.length(1);
      expect(lostBets[0].payout).to.equal(-20);
    });

    it('should update player balance', async () => {
      const { roundNo: currentRoundNo, startTime, endTime } = await game.startNextRound();
      game.resetBalance();

      const winningNumber = 16;
      await game.createBet(currentRoundNo, winningNumber, 10);
      await game.createBet(currentRoundNo, 9, 20);
      await game.createBet(currentRoundNo, winningNumber, 10);
      await game.finishCurrentRound(winningNumber);

      expect(game.getCurrentBalance()).to.equal(1680);
    });
  });
});
