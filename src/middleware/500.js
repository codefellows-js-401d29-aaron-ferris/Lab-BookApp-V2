'use strict';
/**
 * this module is used render the page when another page defines when to thow error
 */


function handleError(error, response) {
  response.render('pages/error', { error: error });
}

module.exports = (err, req,res,next) => {
  let error = { error: 'Resource not found' };
  handleError(error, res)
  res.status(500).json(error).end();
};
