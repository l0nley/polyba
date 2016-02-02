var express = require("express");
var app = express();
var api = require("./routes/api");


app.use("/bower_components", express.static(__dirname+"/bower_components"));
app.use("/", express.static(__dirname+"/public/static"));
app.use("/api", api);


app.listen(3000, function() {
    console.log("app is listening on the 3000 port");
});