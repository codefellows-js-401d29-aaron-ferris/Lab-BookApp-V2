'use strict'

const mongoose = require('mongoose');
// require('mongoose-schema-jsonschema')(mongoose);
const bookshelf = require('../bookshelfs/bookshelf-schema.js');

const books = mongoose.Schema({
  title: { type:String, required:true },
  author: { type:String, required:true },
  isbn: { type:Number, required:true },
  image_url: {type:String, required:true},
  description: {type:String, required:true},
  id: {type:String, required:true},
}, {toObject:{virtuals:true}, toJson:{virtuals:true}});

books.virtual('bookshelves', {
  ref:'bookshelves',
  localField:'bookshelf',
  foreignField:'_id',
  justOne: false,
});

books.pre('find', function(){
  try {
    this.populate('books');
  }
  catch(e) {console.log('did not work', e); }
});

module.exports = mongoose.model('books', books);
