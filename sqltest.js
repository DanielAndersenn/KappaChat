var db = require('./scripts/database.js');

try{
  db.connect();
  //db.send("s134542: Test af Dates");
  /*
  db.getMsgsByUser("s134542",function(err,result){
    console.log(result);
  });
  */

  db.getMsgsByInterval("2017-05-08","2017-05-10",function(err,result){
    console.log(result);
  })

} catch(err){
  console.error("error: "+err);
}

//db.send("s134542","Hello, this is test");
//db.close();
