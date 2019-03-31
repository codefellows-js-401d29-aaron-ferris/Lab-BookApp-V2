'use strict';

const Model = require('../mongo-model.js')
const schema = require('./books-schema.js');

class Books extends Model {}

module.exports = new Books(schema);