const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const page = require('../DbModels/DbPage');
const PageSchema = page.PageSchema;

const OperatorSchema = new Schema({
  operatorID:String,
  type:String,
  pages_in:[PageSchema],
  page_out:PageSchema,
  position_x:Number,
  position_y:Number
});

const OperatorDb = mongoose.model('Operator', OperatorSchema);
module.exports.OperatorDb = OperatorDb;
module.exports.OperatorSchema = OperatorSchema;
