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

// Defines the URL from which the emotes are fetdched
var url = " https://twitchemotes.com/api_cache/v2/global.json";

// Define request function
request({url: url, json: true},
   function (error, response, body) { // body is out .json object

     // Javascript object
     var obj = {
       table: []
     };

     // Fetch url
     if (!error && response.statusCode === 200) { // If no error occurs...

       for (x in body) { // For each element in the .json (body)
         //document.getElementById("demo").innerHTML += myObj[x];
         console.log(body[x]);
         // Write element x to obj
         obj.table.push(body[x]);
       }

      // Convert object to string
      var json = JSON.stringify(obj);

      // Make file
      fs.writeFile('myjsonfile.json', json, 'utf8');

        // console.log(body) // Print the json response
    }
});
