'use strict';
/** 
 * Handles the mongo routes
 * @module /
 * Exports all of the methods used in the module
 */

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

/** 
 * Handles the get route for books.
 * Takes in parameters request resonse next.
 * renders the new page if the book is found, otherwise renders the index
 */
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

/** 
 * Handles the search from the google books api, giving us the information to store in our own api.
 * Takes in parameters request and response
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
 * Handles the rendering of a new page upon a search
 * uses response
 */
function newSearch(request, response) {
  response.render('pages/searches/new');
}

/** 
 * Handles the get method from our own saved database to retrieve a particular book.
 * Takes in request and response. Imports getBookshelves. Renders the show page
 */
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

/** 
 * Handles the get method from our own saved database to retrieve the bookshelves so we may look through them to apply to the particular book .
 * exported to getBook
 */
function getBookshelves() {
  bookshelfDb.get()
    .then(results => {
      return results;
    })
}

/** 
 * Handles the post method for bookshelves to our own saved database to create bookshelves for the user if the bookshelf does not already exist
 */
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

/** 
 * Handles the post method to our own saved database to save books for the user.
 * Has the crewteshelf if the shelf specified does not already exist
 * renders individual book page when done
 */
function createBook(request, response) {
  console.log(request.body.bookshelf);
  createShelf(request.body.bookshelf)
    .then(bookshelf => {
      request.body.shelf = bookshelf._id;
      bookDb.post(request.body)
        .then(result => response.redirect(`/books/${result._id}`))
        .catch(err => handleError(err, response));
    })

}

/** 
 * Handles the put method for books. Used to update book information for the user should it be wrong.
 * Renders specific book shen its done
 */
function updateBook(request, response, next) {
  bookDb.put(request.params.id, request.body)
    .then(() => {
      response.redirect(`/books/${request.params.id}`);
    })
    .catch( next );
}

/** 
 * Handles the delete method to our own saved database to delete saved books for the user
 * renders home page when run
 */
function deleteBook(request, response, next) {
  bookDb.delete(request.params.id)
    .then(() => {
      response.redirect('/');
    })
    .catch( next );
}

/** 
 * Handles the error running it whenever there is an issue
 */
function handleError(error, response) {
  response.render('pages/error', { error: error });
}

module.exports = router;
