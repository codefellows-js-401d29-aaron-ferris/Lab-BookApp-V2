'use strict';
/**
 * this defines the CRUD capablities of every class created for the model used for each of the models
 */
class Model {

  constructor(schema) {
    this.schema = schema;
  }

/** 
* get method that calls by ID
*/
  get(_id) {
    let queryObject = _id ? {_id} : {}
    return this.schema.find(queryObject);
  }

/** 
* post method that calls by ID
*/
  post(record) {
    let newRecord = new this.schema(record);
    return newRecord.save();
  }

/** 
* put method that calls by ID
*/
  put(_id, record) {
    return this.schema.findByIdAndUpdate(_id, record, {new:true});
  }  

/** 
* delete method that calls by ID
*/
  delete(_id) {
    return this.schema.findByIdAndDelete(_id);
  }
}

module.exports = Model;
