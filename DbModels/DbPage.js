const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PageSchema = new Schema({
  pageID:String,
  number:Number,
  title:String,
  content:String,
  position_x:Number,
  position_y:Number
});

const PageDb = mongoose.model('Page', PageSchema);
module.exports.PageDb = PageDb;
module.exports.PageSchema = PageSchema;
