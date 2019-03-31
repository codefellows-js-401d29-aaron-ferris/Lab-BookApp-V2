'use strict';

/** 
 * Start point for app 
 * @module /
 */

require('dotenv').config();

// App Dependencies
const PORT = process.env.PORT;
const mongoose = require('mongoose');
const mongooseOptions = {
  useNewUrlParser:true,
  useCreateIndex: true,
};
mongoose.connect(process.env.MONGODB_URI, mongooseOptions);

require('./src/run.js').start(PORT);
