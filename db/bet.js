export default class Bet {

  constructor(db) {
    if (!db) {
      throw new Error('Invalid DB connection provided.');
    }
    this.db = db;
    this.MIN_NUMBER = 0;
    this.MAX_NUMBER = 36;
    this.MIN_AMOUNT = 0;
    this.MAX_AMOUNT = 100;
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
        success: false, // We'll update success with true if a user wins
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
    const errors = [];
    if (currentRound.roundNo !== roundNo) {
      errors.push('Bet placed is not for the active round.');
    }
    if (number < this.MIN_NUMBER || number > this.MAX_NUMBER) {
      errors.push(`Number chosen must be between ${this.MIN_NUMBER} `
        + `and ${this.MAX_NUMBER} inclusive.`)
    }
    if (amount < this.MIN_AMOUNT || amount > this.MAX_AMOUNT) {
      errors.push(`Amount must be between ${this.MIN_AMOUNT} `
        + `and ${this.MAX_AMOUNT} inclusive.`);
    }

    return errors;
  }
}
