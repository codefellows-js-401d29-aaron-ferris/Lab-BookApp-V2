'use strict';
/** 
 * Creats the bookshelf class extended for mongo-model, and uses bookshelf shcema to define it
 */
const Model = require('../mongo-model.js');
const schema = require('./bookshelf-schema.js')

class Bookshelf extends Model {}

module.exports = new Bookshelf(schema);
