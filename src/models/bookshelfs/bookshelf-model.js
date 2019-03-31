'use strict';

const Model = require('../mongo-model.js');
const schema = require('./bookshelf-schema.js')

class Bookshelf extends Model {}

module.exports = new Bookshelf(schema);
