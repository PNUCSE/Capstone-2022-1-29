const { json } = require('express');
var express = require('express');
var fs = require('fs');
var router = express.Router();
var path = require('path');
var request = require('request');
var template = require('../template/template.js');
var control_tempalte = require('../template/control.js');
var qs = require('querystring');
const e = require('express');
let {PythonShell} = require('python-shell')
var {spawn, spawnSync} = require('child_process');
const { syncBuiltinESMExports } = require('module');
var query = require(process.cwd() + '/support/query');
var fsExtra = require('fs-extra');

router.get('/', (req, res, next) => res.sendFile(__dirname + '/main.html'));
router.post('/', (req, res, next) => {
  var post = req.body;
  var title = post.title;

  // var jsonDataObj = { name : `${title}`};
  // request.post({
  //   url: 'http://13.125.205.44:3000/index',
  //   body: jsonDataObj,
  //   json: true
  // }, function(error, response, body){
  //   res.json(body);
  //   console.log("success to send!");
  // })

  const options = {
    url: 'http://112.153.143.250:8000/index',
    qs:{
      name:title
    }
  };
  request(options,function(err,response,body){
    console.log("success to send!");
  })

  if(!fs.existsSync(`./data/${title}`)) fs.mkdirSync(`./data/${title}`);

  var description = `
  var express = require('express');
  const { fstat } = require('fs');
  var router = express.Router();
  var path = require('path');

  var way = path.join(__dirname, 'temp');
  console.log(way);
  router.use(express.static(way));

  module.exports = router;
  `;
  fs.writeFile(`./data/${title}/${title}.js`, description, 'utf8', function(err){});

  res.redirect('/default');
  
  next();
 

});

router.get('/send', function (req, res) {

  res.sendFile(__dirname + '/send.html')

});

class Stack {
  constructor(){
    this._x = [];
    this._y = [];
  }
  push(x, y) {
    this._x.push(x);
    this._y.push(y);
  }
  pop() {
    return [this._x.pop(), this._y.pop()];
  }
  empty() {
    if(this._dp.length == 0) return true;
    else return false;
  }
  length() {
    return this._dp.length;
  }
  find(x, y) {
    for(var i=0; i<this._x.length; i++){
      if(this._x[i] == x && this._y[i] == y) return true;
      else return false;
    }
  }
}

const stack_xy = new Stack;
const stack_location = new Stack;

var location_x = 0;
var location_y = 0;
var index = 0;
var finish = 0;

let date = new Date()
function formatDate(_date) {
  return _date.getFullYear() + '-' + 
    (_date.getMonth() + 1) + '-' + 
    _date.getDate() + '_' + 
    _date.getHours() + ':' + 
    _date.getMinutes();
}

router.post('/send', (req, res, next) => {  

  stack_location.push(location_x, location_y);

  var LidarData = req.body.LidarData;
  var LidarData_x = [];
  var LidarData_y = [];

  if(LidarData[0] == -1) {
    finish = 0; 
    index = 0;
    location_x = 0;
    location_y = 0;
    date = new Date();
    var description = `${finish}\n${location_x}\n${location_y}`;
    fs.writeFile(`data/coordinate`, description, 'utf8', function(err){ //여기서 적은걸로
      res.write("<script>window.location=\"../default\"</script>");
    });
    // 동기 방식으로 파일 체크
    try {

      fs.statSync(`html/map.json`);
      fs.unlinkSync(`html/map.json`);

    } catch (error) {}
    console.log("Init global char");
    res.send('Inti success!');
  }
  else if(LidarData[0] == -2){
    if(stack_xy.empty()){
      console.log("stack empty!!!");
      finish == 1;
    }
    else{
      var xy = stack_xy.pop();
      location_x = xy[0];
      location_y = xy[1];
      if(stack_location.find(location_x, location_y)){
        finish = -1;
      }
      else finish = 0;
    }

    var description = `${finish}\n${location_x}\n${location_y}`;
    console.log(finish, location_x, location_y);
    fs.writeFile(`data/coordinate`, description, 'utf8', function(err){ //여기서 적은걸로
      res.write("<script>window.location=\"../default\"</script>");
    //next();
    });
    res.send('send success!');
  }
  else{
    // 길찾기 알고리즘 부분
    // 아두이노 측정값으로 직각좌표계 환산
    for(var i = 0; i< LidarData.length; i++){
      if(LidarData[i] == 0){
        LidarData_x[i] = 0;
        LidarData_y[i] = 0;
        continue;
      }
      LidarData_x[i] = location_x + Math.round(LidarData[i] * (Math.cos(Math.PI * ((360 * i / LidarData.length)) / 180)));
      LidarData_y[i] = location_y + Math.round(LidarData[i] * (Math.sin(Math.PI * ((360 * i / LidarData.length)) / 180)));
    }

    // 파이썬으로 직각좌표계 데이터를 넘기기 위한 json 생성
    var lidar = {Location: [location_x, location_y], Lidar_x: LidarData_x, Lidar_y: LidarData_y};
    var des = JSON.stringify(lidar);

    fs.writeFileSync(`html/words.json`, des, 'utf8', function(err){
      if(err) throw err;
    });
    fs.closeSync(2);
    
    console.log(des);
    console.log("finish file write");

    // python shell
    var chilePython = spawn('python3', ['html/main.py']);

    chilePython.stdout.on('data', (data) => {
      console.log(`${data}`);

      // 파이썬에서 계산된 다음 측정 위치 반환
      // var st_x = -1;
      // var st_y = -1;
      // `html/read.json`
      var jsonFile = fs.readFileSync(`html/map.json`, (err, data) => {
        if(err) throw err;
        console.log("read data");
        console.log(data);  
      });
      var jsonData = JSON.parse(jsonFile);
      var st_x = jsonData.st_x;
      var st_y = jsonData.st_y;
      console.log(">>st_x : " + st_x);
      console.log(">>st_y : " + st_y);

      // 다음 측정이 불필요한 경우 st, location
      if(st_x.length == 0 || st_y.length == 0){
       finish = 1;
      }
      else{
        for(var i=st_x.length - 1; i>=0; i--){
          if(!stack_xy.find(st_x[i], st_y[i])){
            stack_xy.push(location_x, location_y);
            stack_xy.push(st_x[i], st_y[i]);
          }
        }
      }

      // 다음 측정이 불필요한 경우 st, location
      // if(st_x == -1 && st_y == -1){
      //   finish = 1;
      // }

      var timestr = formatDate(date);
      var lidarobj = {Finish: finish, Index: index, Location: [location_x, location_y], Lidar_x: LidarData_x, Lidar_y: LidarData_y};
      var description = JSON.stringify(lidarobj);
      console.log(description);
      console.log("data length: " + LidarData.length + " , x length : " + LidarData_x.length + " , y length : " + LidarData_y.length);
      // console.log("Send Json : ");
      // console.log(description);
      fs.writeFile(`html/index/${timestr}_${index}.json`, description, 'utf8', function(err){
          if(err) throw err;
          // res.send('성공!');
          //res.send("<script>alert('your alert message'); window.location.href = \"/\"; </script>");
      })

      index++;
      if(finish == 1){
        console.log("Finish!");
        fsExtra.emptyDirSync('html/index');
      }
      else{
        // location_x = st_x;
        // location_y = st_y;
        var xy = stack_xy.pop();
        location_x = xy[0];
        location_y = xy[1];
        if(stack_location.find(location_x, location_y)){
         finish = -1;
        }
      }

      var description = `${finish}\n${location_x}\n${location_y}`;
      console.log(finish, location_x, location_y);
      fs.writeFile(`data/coordinate`, description, 'utf8', function(err){ //여기서 적은걸로
        res.write("<script>window.location=\"../default\"</script>");
      //next();
      });
      res.send('send success!');
    });
    
    chilePython.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`)
    });
  }
});

router.get('/modeling', function(req, res) { 
    var title = 'Modeling List';

    var list = template.list(req.list);
    var html = template.HTML(title, list); 
    res.send(html);
    
  });
router.post('/modeling', (req, res, next) => {
    
});

router.get('/index', (req, res, next) => {
  res.redirect('/');
});

router.use('/control', require('./control'));
router.get('/control', (req, res, next) => {
  
  var data = fs.readFileSync('data/coordinate', 'utf8');
  const lines = data.split(/\r?\n/);

  var finish = lines[0];
  var x = lines[1];
  var y = lines[2];
  
  var cor = control_tempalte.Coordinates(finish, x, y);
  var html = control_tempalte.HTML(cor);
  res.send(html);
  // res.sendFile(__dirname + '/control.html');
});
router.post('/control', (req, res, next) => {
  var finish = req.body.finish;
  var x = req.body.control_x;
  var y = req.body.control_y;
  var description = `${finish}\n${x}\n${y}`;
  fs.writeFile(`data/coordinate`, description, 'utf8', function(err){ //여기서 적은걸로
    res.redirect('/default/control');  
  })
});

router.get('/answer', (req, res, next) => {
  var data = fs.readFileSync('data/coordinate', 'utf8');
  const lines = data.split(/\r?\n/);
    
  var x = lines[0];
  var y = lines[1];
  var text = `X: ${x} Y: ${y}\n`;
  console.log("send text");
  res.send(text);
});

router.get('/get_data/:id', (req, res, next) => {
  let id = req.params.id;
  console.log(id);
  query.get_data(id)
    .then(data => {
      let name = data.name;
      let jsonData = data.data;
      console.log("connection");
      res.json(jsonData);
    })
    .catch((e) => {
      console.log(e.message);
    })
});

router.get('/get_list', (req, res, next) => {
  console.log("get list");
  query.get_list()
    .then(data => {
      console.log("connection");
      console.log(data);
      res.send(data);
    })
    .catch((e) => {
      console.log(e.message);
    })
});

router.get('/post_data/:id', (req, res, next) => {
  console.log("post data");
  let id = req.params.id;
  let jsonData = fs.readFileSync('html/final.json', (err, data) => {
    if(err) throw err;
    console.log("read data");
    console.log(data);  
  })
  query.post_data(id, jsonData)
    .then(data => {
    })
    .catch((e) => {
      console.log(e.message);
    })
});

module.exports = router;
