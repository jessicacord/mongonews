var express = require("express");
var router = express.Router();

var moment = require('moment');

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Models
var db = require("../models");
// Connect to the Mongo DB
var mongoose = require("mongoose");
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongonews";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

//Index
router.get("/", function(req, res) {
  //After scrape, send all articles in DB to index
  db.Article.find({}).sort({date: -1}).limit(25)
  .then(function(dbArticle) {
    var hbsObject = {
      articles: dbArticle
    }
    res.render("index", hbsObject);
  })
  .catch(function(err) {
    res.json(err);
  });
})

// GET route for scraping 
router.get("/scrape", function(req, res) {
  axios.get("https://www.theatlantic.com/latest/").then(function(response) {
    var $ = cheerio.load(response.data);

    // Scrape headings
    $(".blog-article").each(function(i, element) {
      var result = {};

      result.title = $(this)
        .children("a")
        .children("h2")
        .text();
      result.link = "https://www.theatlantic.com" + $(this)
        .children("a")
        .attr("href");
      result.summary = $(this)
        .children("p")
        .text().trim();
      result.image = $(this)
        .children("a")
        .children("figure")
        .children("img")
        .attr("data-src");
      result.date = moment($(this)
        .children("ul")
        .children(".date")
        .children("time")
        .attr("datetime"), "YYYY-MM-DD").valueOf();
      result.dateDisplay = moment(result.date).format("MM/DD/YY");
      
      //Check if article is already in DB
      db.Article.findOne({link: result.link})
      .then(function(dbArticle) {
        if(dbArticle === null) {
          // Create a new Article using the `result` object built from scraping
          db.Article.create(result)
          .then(function(dbArticle) {
            console.log(dbArticle);
          })
          .catch(function(err) {
            return res.json(err);
          });
        }
      })
      .catch(function(err){
        res.json(err);
      });

    });
    res.json(response.data);
  });
});

//Route for Saved Articles Page
router.get("/saved/", function(req, res) {
  db.Article.find({saved: true})
  .then(function(dbArticle) {
    var hbsObject = {
      articles: dbArticle
    }
    res.render("saved", hbsObject)
  })
  .catch(function(err) {
    res.json(err);
  })
})

// Route for updating Article as saved=true
router.post("/save-article/:id", function(req, res) {
  db.Article.findOneAndUpdate({_id: req.params.id}, {saved: true}, {new: true})
  .then(function(dbArticle) {
    res.json(dbArticle);
  })
  .catch(function(err) {
    res.json(err);
  })
});

// Route for updating Article as saved=false
router.post("/unsave-article/:id", function(req, res) {
  db.Article.findOneAndUpdate({_id: req.params.id}, {saved: false}, {new: true})
  .then(function(dbArticle) {
    res.json(dbArticle)
  })
  .catch(function(err) {
    res.json(err);
  })
});

//Route for displaying notes
router.get("/notes/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("notes")
    .then(function(dbArticle) {
      console.log(dbArticle);
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log(dbNote);
      return db.Article.findOneAndUpdate({_id: req.params.id}, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

//Route for deleting note
router.delete("/notes/:id", function(req, res, next) {
  db.Note.findById(req.params.id, function (err, note) {
    if(err) { return next(err); }
    if(!note) { return res.send(404); }
    note.remove(function(err) {
      if(err) { return handleError(res, err); }
      return res.send(204);
    });
  });
});



module.exports = router;