'use strict';

/** 
 * Handles the PSQL routes
 * @module /
 * Exports all of the methods used in the module
 */
const superagent = require('superagent');
const Book = require('../models/books/books.js');

//Express Setup/Router Setup
const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');

//Postgres setup
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

router.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

//Routes
router.get('/', getBooks);
router.post('/searches', createSearch);
router.get('/searches/new', newSearch);
router.get('/books/:id', getBook);
router.post('/books', createBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

/** 
 * Handles get for the books in our database.
 * Takes request and response. 
 * Outputs all books and renders them to index, or renders new if there are no books.
 */
function getBooks(request, response) {
  let SQL = 'SELECT * FROM books;';

  return client.query(SQL)
    .then(results => {
      if (results.rows.rowCount === 0) {
        response.render('pages/searches/new');
      } else {
        response.render('pages/index', { books: results.rows })
      }
    })
    .catch(err => handleError(err, response));
}

/** 
 * Handles call to google books api.
 * Takes request and response. 
 * Outputs all from search query and renders to show page.
 */
function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { results: results }))
    .catch(err => handleError(err, response));
}

/** 
 * Renders the new search to a new page
 */
function newSearch(request, response) {
  response.render('pages/searches/new');
}

/** 
 * Handles retrieval of an individual of our books in our database.
 * Calls the bookshelves.
 * Renders on the show page
 */
function getBook(request, response) {
  getBookshelves()
    .then(shelves => {

      let SQL = 'SELECT books.*, bookshelves.name FROM books INNER JOIN bookshelves on books.bookshelf_id=bookshelves.id WHERE books.id=$1;';
      let values = [request.params.id];
      client.query(SQL, values)
        .then(result => {
          console.log(shelves.rows)
          response.render('pages/books/show', { book: result.rows[0], bookshelves: shelves.rows })
        })
        .catch(err => handleError(err, response));
    })
}

/** 
 * Retrieves all bookshelves. Used in getBook
 */
function getBookshelves() {
  // let SQL = 'SELECT DISTINCT bookshelf FROM books ORDER BY bookshelf;';
  let SQL = 'SELECT DISTINCT id, name FROM bookshelves ORDER BY name;';

  return client.query(SQL);
}
/** 
 * Handles what happenes if a shelf doesnt exist. usually used when a new book is created
 */
function createShelf(shelf) {
  let normalizedShelf = shelf.toLowerCase();
  let SQL1 = `SELECT id from bookshelves where name=$1;`;
  let values1 = [normalizedShelf];

  return client.query(SQL1, values1)
    .then(results => {
      if (results.rowCount) {
        return results.rows[0].id;
      } else {
        let INSERT = `INSERT INTO bookshelves(name) VALUES($1) RETURNING id;`;
        let insertValues = [shelf];

        return client.query(INSERT, insertValues)
          .then(results => {
            return results.rows[0].id;
          })
      }
    })
}
/** 
 * Handles post for a new book in PSQL. Utilizes createbooks
 * Inputs of request and resonse
 * renders output book o individual ID page
 */
function createBook(request, response) {
  console.log(request.body.bookshelf);
  createShelf(request.body.bookshelf)
    .then(id => {
      let { title, author, isbn, image_url, description } = request.body;
      let SQL = 'INSERT INTO books(title, author, isbn, image_url, description, bookshelf_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id;';
      let values = [title, author, isbn, image_url, description, id];

      client.query(SQL, values)
        .then(result => response.redirect(`/books/${result.rows[0].id}`))
        .catch(err => handleError(err, response));
    })

}

/** 
 * Handles put request for a book
 * takes input of request and response
 * renders onto individual book page
 */
function updateBook(request, response) {
  let { title, author, isbn, image_url, description, bookshelf_id } = request.body;
  // let SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bo okshelf=$6 WHERE id=$7;`;
  let SQL = `UPDATE books SET title=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf_id=$6 WHERE id=$7;`;
  let values = [title, author, isbn, image_url, description, bookshelf_id, request.params.id];

  client.query(SQL, values)
    .then(response.redirect(`/books/${request.params.id}`))
    .catch(err => handleError(err, response));
}

/** 
 * Handles delete method for PSQL
 * renders on error pages
 */
function deleteBook(request, response) {
  let SQL = 'DELETE FROM books WHERE id=$1;';
  let values = [request.params.id];

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(err => handleError(err, response));
}

function handleError(error, response) {
  response.render('pages/error', { error: error });
}

module.exports = router;
