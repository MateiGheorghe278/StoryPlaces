const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const story = require('../DbModels/DbStory');
const StorySchema = story.StorySchema;

const UserSchema = new Schema({
  username:String,
  password:String,
  stories:[StorySchema]
});

const UserDb = mongoose.model('User', UserSchema);
module.exports.UserDb = UserDb;
module.exports.UserSchema = UserSchema;
