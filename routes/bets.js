const express = require('express');
const router = express.Router();
import * as _ from 'lodash';
import * as game from '../game';

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

export default router;
