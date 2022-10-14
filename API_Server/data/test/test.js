
  var express = require('express');
  const { fstat } = require('fs');
  var router = express.Router();
  var path = require('path');

  var way = path.join(__dirname, 'temp');
  console.log(way);
  router.use(express.static(way));

  module.exports = router;
  