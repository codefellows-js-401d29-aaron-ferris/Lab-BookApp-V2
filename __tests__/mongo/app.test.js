'use strict';

const rootDir = process.cwd();
const supergoose = require('./supergoose.js');
// const {server} = require(`${rootDir}/src/app.js`);
const {app} = require(`${rootDir}/server.js`);
const mockRequest = supergoose.server(app);

beforeAll(supergoose.startDB);
afterAll(supergoose.stopDB);

describe('Should fail', () => {
  it('should respond with 404', () => {
    return mockRequest
      .get('/fdsjklafjlekwqjiopfhzcxpvkl')
      .then(results => {
        expect(results.status).toBe(404);
      })
  });

  it('should respond with a 404 on an invalid method', () => {

    return mockRequest
      .post('/books/100')
      .then(results => {
        expect(results.status).toBe(404);
      });

  });
});

describe('post(book) and get(book)', () => {
  it('posts and gets that id', () => {

    let obj = {title:'stuff', author:'stuff', isbn:'stuff', image_url:'stuff', description:'stuff', bookshelf_id:'stuff'};

    return mockRequest
      .post('/books')
      .send(obj)
      .then(() => {
        return mockRequest
          .get('/books/1')
          .then(response => {
            console.log(response.body);
            expect(response.status).toBe(200);
            expect(response.body).toEqual(obj);
          });
      });
  });

});
