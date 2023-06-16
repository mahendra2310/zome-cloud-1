/*Testing case for 'cpowerdispatchSetPointTest' function 
  in dispatch.controller.js file 
*/
var log = require('zome-server').logger.log;
const cpowerdispatchSetPointTest = require('./dispatch.controller').cpowerdispatchSetPointTest;

//Defining jest test case called 'cpowerdispatchSetPointTest'
describe('cpowerdispatchSetPointTest', () => {

  //Declaring req and res variables to be used in testing case 
  let req, res;

  //Defining testing hook function to run before each testing case 
  beforeEach(() => {

    //intializing req to empty object
    req = {};

    //intializing res variable to object with status and json methods that have been mocked 
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

 
  //defining jest testing case 
  it('should return a response with a status of 200 and a message of "cpowerdispatchSetPointTest Process Started"', async () => {
    
    //calling function with req and res that have been mocked 
    await cpowerdispatchSetPointTest(req, res);
    //Asserting that status method of res object was called with arguemnt of 200 
    expect(res.status).toHaveBeenCalledWith(200);
    //Asserting that the json method of the res object was called with an object with expected status and message
    expect(res.json).toHaveBeenCalledWith({
      status: true,
      message: 'cpowerdispatchSetPointTest Process Started'
    });
  });
});