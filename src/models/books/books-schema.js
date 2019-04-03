'use strict'
/**
 * this defines the shape of the books object for mongo. adds the bookshelf appropriate from the bookshelves object to the book capablities of every class created for the model used for each of the models
 */
const mongoose = require('mongoose');
// require('mongoose-schema-jsonschema')(mongoose);
const bookshelf = require('../bookshelfs/bookshelf-schema.js');

/**
 * defines base book object
 */
const books = mongoose.Schema({
  title: { type:String, required:true },
  author: { type:String, required:true },
  isbn: { type:String, required:true },
  image_url: {type:String, required:true},
  description: {type:String, required:true},
  id: {type:String, required:true},
}, {toObject:{virtuals:true}, toJson:{virtuals:true}});

/**
 * adds bookshelf to it
 */
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
