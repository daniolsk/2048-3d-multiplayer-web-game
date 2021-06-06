const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  nick: {
    type: String,
  },
  date: {
    type: Date,
  },
  score: {
    type: Number
  }
});

module.exports = Score = mongoose.model('score', ScoreSchema);