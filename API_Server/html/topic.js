var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');

router.get('/:pageId', function(request, response, next) { 
    var filteredId = path.parse(request.params.pageId).base;
    exports.Id = filteredId;

    // console.log(`${filteredId}`);
    
    router.use('/index', require('../data/start'));
    next();
  });


module.exports = router;