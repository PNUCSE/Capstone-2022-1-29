var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

router.get('/control_send_page', (req, res, next) => {
    res.send(__dirname + '/control_send_page.html')
})
router.post('/control_send_page', (req, res, next) => {
  var x = req.body.control_x;
  var y = req.body.control_y;

  console.log(x, y);
  res.redirect('/default/control');
});

module.exports = router;