const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const page = require('../DbModels/DbPage');
const PageSchema = page.PageSchema;

const ChapterSchema = new Schema({
  chapterID:String,
  number:Number,
  title:String,
  colour:String,
  child_pages:[PageSchema],
  parent_pages:[PageSchema],
  width:Number,
  height:Number,
  position_x:Number,
  position_y:Number
});

const ChapterDb = mongoose.model('Chapter', ChapterSchema);
module.exports.ChapterDb = ChapterDb;
module.exports.ChapterSchema = ChapterSchema;
