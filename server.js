'use strict';

/** 
 * Start point for app 
 * @module /
 */

require('dotenv').config();

// App Dependencies
const PORT = process.env.PORT;

require('./src/run.js').start(PORT);
