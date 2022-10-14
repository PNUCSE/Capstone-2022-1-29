var express = require('express');
const { fstat } = require('fs');
var router = express.Router();
var path = require('path');

console.log(__dirname);
var title = '/temp'
router.use(express.static(__dirname + `${title}`));


module.exports = router;
