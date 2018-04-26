var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  body: String,
  author: String,
  date: {
      type: Date,
      default: Date.now
  }
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
