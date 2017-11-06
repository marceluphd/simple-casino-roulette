export default class Bet {

  constructor(db) {
    if (!db) {
      throw new Error('Invalid DB connection provided.');
    }
    this.db = db;
    this.MIN_NUMBER = 0;
    this.MAX_NUMBER = 36;
    this.MIN_AMOUNT = 1;
    this.MAX_AMOUNT = 100;
    this.BETS_COLLECTION_NAME = 'bets';
  }

  async create(currentRound, currentBalance, roundNo, number, amount) {
    // TODO Concurrency issue:
    // What if Node.js event loop starts next round while we wait for the bet
    // to be inserted?
    // Tentative solution to implement:
    // - Set a timer for 30 seconds when a new round is started.
    // - At the start of creating a new bet, cancel the timer.
    // - At the end of creating bet, set again the timer for the remaining
    // time.
    // - We track when current round will end. So, we can get the difference
    // between end time and now and set a timer for that.
    // - If we have just passed end time of current round while saving the
    // bet, then start next round immediately.

    const result = {data: null, errors: null};

    const errors = await this.checkValidity(currentRound, currentBalance, roundNo, number, amount);
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

      const opResult = await this.db.collection(this.BETS_COLLECTION_NAME).insertOne(bet);
      if (opResult.insertedCount === 1) {
        result.data = bet;
      } else {
        throw new Error('Failed to save bet');
      }
    }

    return result;
  }

  async checkValidity(currentRound, currentBalance, roundNo, number, amount) {
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

    // QUESTION: Can a player place several bets with the same number in the
    // same round?
    // Assumption: Yes. So, not checking against this here.
    // If that's not the case, should add a check here.

    // Player's current balance should cover past bets for current round
    // as well as this new bet.
    const betsPlacedSoFar = await this.readAllBets(
      currentRound.roundNo,
      currentRound.startTime,
      currentRound.endTime
    );

    const totalAmount = betsPlacedSoFar.reduce(
      (totalForRound, bet) => totalForRound + bet.amount, 0);
    if (currentBalance < totalAmount + amount) {
      errors.push('Bet amount exceeds available balance.');
    }

    return errors;
  }

  async readAllBets(roundNo, startTime, endTime) {
    // Assumption (toArray): The bets placed in a round can be stored in memory.
    // Good for now, but not a good idea if we've got a million or several
    // hundred thousands players - all placing bets.
    return await this.db
      .collection(this.BETS_COLLECTION_NAME)
      .find({
        roundNo,
        time: { $gte: startTime, $lte: endTime }
      })
      .toArray();
  }
}
