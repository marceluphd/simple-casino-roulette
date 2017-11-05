const expect = require("chai").expect;
import * as db from '../../db';

describe('Bet', function() {
  describe('#create()', async () => {
    it('should return a valid bet when inputs are valid', async () => {
      const {data: newBet, errors} = await db.createBet(1, 7, 10);
      expect(newBet).to.include({
        roundNo: 1,
        number: 7,
        amount: 10,
        success: false,
      });
      expect(newBet).to.have.property('time');
      expect(errors).to.be.null;
    });
  });
});
