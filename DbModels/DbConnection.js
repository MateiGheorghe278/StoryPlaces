const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConnectionSchema = new Schema({
  connectionID:String,
  type:String,
  direction:String,
  element_From:String,
  element_To:String,
});

const ConnectionDb = mongoose.model('Connection', ConnectionSchema);
module.exports.ConnectionDb = ConnectionDb;
module.exports.ConnectionSchema = ConnectionSchema;
