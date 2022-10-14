var express = require('express');
var app = express();
var fs = require('fs');
var {spawn, spawnSync} = require('child_process');

const bodyParser = require('body-parser'); 
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json());

app.get('*', function(request, response, next){
    fs.readdir('./data', function(error, filelist){
      request.list = filelist;
      next();
    });
  });

app.use('/default', require('./html/option'));

// app.use(function(req, res, next) {
//   res.status(404).send('Sorry cant find that!');
// });

app.use('/', express.static('./temp'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, + '/temp/index.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(__dirname + '/html/map.json');
});

app.get('/final', (req, res) => {
  res.sendFile(__dirname + '/html/map.json');
});

app.use('/json', express.static('./json'));



var server = app.listen(8000, () => {
    console.log('app listening on port : 8000');
});
