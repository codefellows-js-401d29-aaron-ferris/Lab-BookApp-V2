'use strict';
/** 
 * Creats the book class extended for mongo-model, and uses books shcema to define it
 */

const Model = require('../mongo-model.js')
const schema = require('./books-schema.js');

class Books extends Model {}

module.exports = new Books(schema);