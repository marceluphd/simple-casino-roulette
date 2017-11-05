export default class Bet {

  constructor(db) {
    if (!db) {
      throw new Error('Invalid DB connection provided.');
    }
    this.db = db;
  }

  async create(currentRound, roundNo, number, amount) {
    const result = {data: null, errors: null};

    const errors = this.checkValidity(currentRound, roundNo, number, amount);
    if (errors.length) {
      result.errors = errors;
    } else {
      const bet = {
        roundNo,
        time: Date.now(),
        number,
        amount,
        success: false, // We'll update bet only when a user wins
      };

      const opResult = await this.db.collection('bets').insertOne(bet);
      if (opResult.insertedCount === 1) {
        result.data = bet;
      } else {
        throw new Error('Failed to save bet');
      }
    }

    return result;
  }

  checkValidity(currentRound, roundNo, number, amount) {
    return [];
  }
}
