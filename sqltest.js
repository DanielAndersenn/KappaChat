var db = require('./database.js');

try{
  db.connect();
//  db.send("s134542: Hej Rasmus");
    db.aggTest('s130022',function(err,result){
      console.log(result);
    });
// db.getMsgsByUser("s134542",function(err,result){
} catch(err){
  console.error("error: "+err);
}

//db.send("s134542","Hello, this is test");
//db.close();
