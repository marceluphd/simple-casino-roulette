var express = require('express');
var router = express.Router();
var game = require('../game');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/balance', function(req, res, next) {
  res.json({balance: game.getCurrentBalance()});
});

module.exports = router;
