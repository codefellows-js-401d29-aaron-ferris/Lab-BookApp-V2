'use strict';

const superagent = require('superagent');

//Express Setup/Router Setup
const express = require('express');
const router = express.Router();
const methodOverride = require('method-override');

const bookDb = require('../models/books/books-model.js');
const bookshelfDb = require('../models/bookshelfs/bookshelf-model.js');

const Book = require('../models/books/books.js');

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

function getBooks(request, response,next) {
  bookDb.get()
    .then(results => {
      if(results.length === 0){
        response.render('pages/searches/new');
      }else{
        response.render('pages/index', {books: results})
      }
    })
    .catch( next );
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  if (request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if (request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { results: results }))
    .catch(err => handleError(err, response));
}

function newSearch(request, response) {
  response.render('pages/searches/new');
}

function getBook(request, response) {
  //get bookshelves
  getBookshelves()
  //using returned values
    .then(shelves => {
      bookDb.get(request.params.id)
        .then(result => {
          response.render('pages/books/show', { book: result[0], bookshelves: shelves })
        })
        .catch(err => handleError(err, response));
    })
}

function getBookshelves() {
  // // let SQL = 'SELECT DISTINCT bookshelf FROM books ORDER BY bookshelf;';
  // let SQL = 'SELECT DISTINCT id, name FROM bookshelves ORDER BY name;';

  // return client.query(SQL);
  bookshelfDb.get()
    .then(results => {
      return results;
    })
}
// instantiate books function
// get all bookshelves
// with these shelves
// join the bookshelves  and books WHERE THE BOOK ID MATCHES
// with the request parameters
// 

// function getBook(request, response) {
//   getBookshelves()
//     .then(shelves => {

//       let SQL = 'SELECT books.*, bookshelves.name FROM books INNER JOIN bookshelves on books.bookshelf_id=bookshelves.id WHERE books.id=$1;';
//       let values = [request.params.id];
//       client.query(SQL, values)
//         .then(result => {
//           console.log(shelves.rows)
//           response.render('pages/books/show', { book: result.rows[0], bookshelves: shelves.rows })
//         })
//         .catch(err => handleError(err, response));
//     })
// }

// function getBookshelves() {
//   // let SQL = 'SELECT DISTINCT bookshelf FROM books ORDER BY bookshelf;';
//   let SQL = 'SELECT DISTINCT id, name FROM bookshelves ORDER BY name;';

//   return client.query(SQL);
// }




function createShelf(shelf) {
  let normalizedShelf = shelf.toLowerCase();

  return bookshelfDb.get(normalizedShelf)
    .then(results => {
      if (results.length) {
        return results[0];
      } else {
        bookshelfDb.post({_id:normalizedShelf})
      }
    })
}

function createBook(request, response) {
  console.log(request.body.bookshelf);
  createShelf(request.body.bookshelf)
    .then(bookshelf => {
      request.body.shelf = bookshelf._id;
      bookDb.post(request.body)
        .then(result => response.redirect(`/books/${result.id}`))
        .catch(err => handleError(err, response));
    })

}

function updateBook(request, response, next) {
  bookDb.put(request.params.id, request.body)
    .then(() => {
      response.redirect(`/books/${request.params.id}`);
    })
    .catch( next );
}

function deleteBook(request, response, next) {
  bookDb.delete(request.params.id)
    .then(() => {
      response.redirect('/');
    })
    .catch( next );
}

function handleError(error, response) {
  response.render('pages/error', { error: error });
}

module.exports = router;
