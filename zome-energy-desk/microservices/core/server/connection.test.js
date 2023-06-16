/* 
  Testing Suite to check mongoDB connection using function 
  connection.js 
*/ 

const Connection = require('./connection');
var mongoose = require('mongoose')
let MONGO_URL = process.env.MONGO_URL

//defining testing suite called 'Connection'
describe('Connection', () => {

  //defining a test case called 'connects to MongoDB'
  it('connects to MongoDB', async () => {
    //Creating a jest spy on the 'mongoose.connect()' method and implement empty resolved promise 
    const spy = jest.spyOn(mongoose, 'connect').mockImplementation(() => Promise.resolve());
    //calling connection functions which estblishes connection to mongo
    await Connection();

    //asserting that function was called with expected arguemnts 
    expect(spy).toHaveBeenCalledWith(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    //restoring original implementation of the function
    spy.mockRestore();
  });
});