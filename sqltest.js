var db = require('./mongoose.js');

try{
  db.connect();
  db.send("s134542: Hej Rasmus");
  console.log("Succes");
} catch(err){
  console.error("error: "+err);
}

//db.send("s134542","Hello, this is test");
//db.close();
