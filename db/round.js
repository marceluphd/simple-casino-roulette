import moment from 'moment';

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

    // Get timestamp in UTC to avoid edge case of daylight saving time.
    const currentTime = moment();
    const nextRound = {
      roundNo,
      startTime: currentTime.toDate(),
      endTime: currentTime.add(30, 's').toDate(),
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
