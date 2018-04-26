var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 3000;

var app = express();
app.use(express.static("public"));

// Setup Body Parser
var bodyparser = require("body-parser");
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// Setup Handlebars Engine
var hbs = exphbs.create({defaultLayout: "main"});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Import Routes
var routes = require("./controllers/mongonewsController");
app.use("/", routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
