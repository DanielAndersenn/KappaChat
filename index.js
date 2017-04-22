var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs')

app.get('/', function(req, res) {

  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});

// request is a node.js module that makes us capable of making http calls
var request = require("request");

// Defines the URL from which the emotes is fetched
var url = " https://twitchemotes.com/api_cache/v2/global.json";

// Define request function
request({url: url, json: true},
   function (error, response, body) { // body is out .json object

     // Javascript object
     var obj = {
       table: []
     };

     if (!error && response.statusCode === 200) {

       for (x in body) {
         //document.getElementById("demo").innerHTML += myObj[x];
         console.log(body[x]);
         obj.table.push(body[x]);
       }

      var json = JSON.stringify(obj);

      fs.writeFile('myjsonfile.json', json, 'utf8');

        // console.log(body) // Print the json response
    }
});
