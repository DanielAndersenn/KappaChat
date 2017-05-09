
// ## Initial
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var dateSchema = mongoose.Schema({
  date: Date,
  messages: [{
    name: String,
    message: String
  }]
});

var Dates = mongoose.model('Dates', dateSchema);
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

  //Format YYYY-MM-DD
  getMsgsByInterval: function(startDate, endDate, callback){
    inputEndDate = new Date(endDate); console.log(inputEndDate);
    inputStartDate = new Date(startDate); console.log(inputStartDate);

    Dates.find({date:{ $lte: inputEndDate, $gte: inputStartDate } }, function(err,result){
        callback(err,result);
    })


  }

  getMsgsByUser: function(studentID,callback){
    Dates.aggregate(
      {$unwind: "$messages"},
      {$match: {'messages.name': studentID}},
      {$group: {_id : '$date', messages: {$push: "$messages.message"} } }
    ).exec(function(err,result){callback(err,result)});
  }

} // ## External Interface END

// ## Internal Helper methods
function storeMessage(name,message){
  Dates.findOneAndUpdate(
    {"date": calcDay()}, //Query
    {$push: //Operation
      {"messages": //Which array to push
        { name: name,
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

  return date.getFullYear()+"-"+mm+"-"+dd
  //return dd+"/"+mm+"/"+date.getFullYear();
}
