const express = require('express');
const router = express.Router();
import * as _ from 'lodash';
import * as game from '../game';

// Create a bet
router.post('/', async (req, res, next) => {
  const roundNo = _.get(req.body, 'roundNo', null);
  const number = _.get(req.body, 'number', null);
  const amount = _.get(req.body, 'amount', null);

  let result = await game.createBet(roundNo, number, amount);
  if (!result) {
    result = { data: null, errors: ['Server failed to create bet.'] };
  } else if (result.data) {
    console.log(JSON.stringify(result, null, 4));
    result = {
      data: _.get(result.data, '_id', null),
      errors: result.errors,
    }
  }

  res.json(result);
});

// Get all bets - full history
router.get('/', async (req, res, next) => {
  let result = { data: null, errors: null };
  const allBets = await game.getAllBets();
  if (allBets) {
    result.data = allBets;
  } else {
    result.errors = ['Failed to get all bets'];
  }
  res.json(result);
});

export default router;
