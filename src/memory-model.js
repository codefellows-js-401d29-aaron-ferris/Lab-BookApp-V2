'use strict';

/** 
 * This modlue normalizes the model, and creates require model for appropriate model where needed
 */
module.exports = (req,res,next) => {
  let modelName = req.params.model.replace(/[^a-z0-9-_]/gi, '');
  req.model = require(`../models/${modelName}/${modelName}-model.js`);
  next();
};
