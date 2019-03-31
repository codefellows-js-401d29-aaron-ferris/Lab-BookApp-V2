'use strict';
/**
 * This module calls all of the separat e modules that have been used to define the app.
 */
const cwd = process.cwd();

// Application Dependencies
const express = require('express');

// const routes = require( `${cwd}/src/API/pg.js` );
const routes = require( `${cwd}/src/API/mongo.js` );

const notFound = require( `${cwd}/src/middleware/500.js` );

// Application Setup
const app = express();

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/docs', express.static('docs'));
app.set('view engine', 'ejs');

// Set the view engine for server-side templating

// API Routes
app.use(routes);

app.use(notFound);

let start = (port = process.env.PORT) => {
  app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
  });
};

module.exports = {app, start};
