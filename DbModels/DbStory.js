const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const page = require('../DbModels/DbPage');
const PageSchema = page.PageSchema;

const chapter = require('../DbModels/DbChapter');
const ChapterSchema = chapter.ChapterSchema;

const operator = require('../DbModels/DbOperator');
const OperatorSchema = operator.OperatorSchema;

const connection = require('../DbModels/DbConnection');
const ConnectionSchema = connection.ConnectionSchema;

const StorySchema = new Schema({
  storyID:String,
  title:String,
  last_modified:Date,
  pages:[PageSchema],
  chapters:[ChapterSchema],
  operators:[OperatorSchema],
  connections:[ConnectionSchema]
});

const StoryDb = mongoose.model('Story', StorySchema);
module.exports.StoryDb = StoryDb;
module.exports.StorySchema = StorySchema;
