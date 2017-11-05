export default class Round {

  constructor(db) {
    if (!db) {
      throw new Error('Invalid DB connection provided.');
    }
    this.db = db;
    this.currentRound = null;
    this.ROUND_DURATION = 30 * 1000;
  }

  async createNextRound() {
    const roundNo = this.currentRound ? this.currentRound.roundNo + 1 : 1;
    const startTime = Date.now();
    const nextRound = {
      roundNo,
      startTime,
      endTime: startTime + this.ROUND_DURATION,
    };

    const result = await this.db.collection('rounds').insertOne(nextRound);
    if (result.insertedCount === 1) {
      this.currentRound = nextRound;
    } else {
      throw new Error('Failed to create next round');
    }

    return this.currentRound;
  }

  async getCurrentRound() {
    if (!this.currentRound) { // First round is yet to be started.
      this.currentRound = await this.createNextRound();
    }

    return this.currentRound;
  }
}
