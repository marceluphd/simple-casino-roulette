const expect = require("chai").expect;
import * as db from '../../db';

describe('Bet', function() {
  describe('#create()', async () => {
    it('should return a valid bet when inputs are valid', async () => {
      const { roundNo: currentRoundNo } = await db.startNextRound();
      const {data: newBet, errors} = await db.createBet(currentRoundNo, 7, 10);
      expect(newBet).to.include({
        roundNo: 1,
        number: 7,
        amount: 10,
        success: false,
      });
      expect(newBet).to.have.property('time');
      expect(errors).to.be.null;
    });

    it('should not create bet when given round is not the active one', async () => {
      const previousRound = await db.startNextRound();
      const currentRound = await db.startNextRound();
      const {data: newBet, errors} = await db.createBet(previousRound.roundNo, 7, 10);
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
  });
});
