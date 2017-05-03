
// ## Initial
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var daySchema = mongoose.Schema({
  day: String,
  messages: [{
    time: String,
    name: String,
    message: String
  }]
});

var Days = mongoose.model('Days', daySchema);
// ## Initial end

// ## External Interface
module.exports = {

  connect: function(){
    mongoose.connect('mongodb://ubuntu4.javabog.dk:34542/KappaChat',
                     function(err){
                       if(err) throw err;
                     });
  }, //connect END

  send: function(msg){

    //Split message
    var res = msg.split(":");
    var name = res[0];
    var message = ""
    var i;
    for(i = 1 ; i < res.length ; i++){
      message = message+res[i];
    }
    // ## Split message END

    //Dawn of times
    storeMessage(name,message,function(err){
      if (err) throw err;
    });
    //End of new logic

  }, //send END

  close: function(){
    db.close();
  }, //close END


  getMsgsByUser: function(studentID,callback){
    Days.aggregate(
      {$unwind: "$messages"},
      {$match: {'messages.name': studentID}},
      {$group: {_id : '$day', messages: {$push: "$messages.message"} } }
    ).exec(function(err,result){callback(err,result)});
  }

} // ## External Interface END

// ## Internal Helper methods
function storeMessage(name,message){
  Days.findOneAndUpdate(
    {"day": calcDay()}, //Query
    {$push: //Operation
      {"messages": //Which array to push
        { time: calcTime(),
          name: name,
          message: message
        } //Object
      }  //Array end
    }, //Operation end
    { upsert: true }, //THIS SHIT IS MAGIC
    function(err){ //Callback
      if(err){
        console.error("Error in storeMessage: " + err);
        throw err;
      }
    } //Callback End
  );
}


function calcDay(){
  var date = new Date()
  var dd = date.getDate();
  var mm = date.getMonth()+1;

  if(dd<10) dd= "0"+dd;
  if(mm<10) mm = "0"+mm;

  return dd+"/"+mm+"/"+date.getFullYear();
}

function calcTime(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}
