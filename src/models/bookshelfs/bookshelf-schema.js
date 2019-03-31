'use strict'

const mongoose = require('mongoose');
// require('mongoose-schema-jsonschema')(mongoose);

const bookshelves = mongoose.Schema({
  _id: { type:String, required:true, unique:true },
})

module.exports = mongoose.model('bookshelves', bookshelves);
