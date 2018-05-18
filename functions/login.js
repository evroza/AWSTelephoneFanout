const jwt = require('jsonwebtoken');
const telephoneUtils = require('../lib/users');


const JWT_EXPIRATION_TIME = '5m';

/**
  * POST /sessions
  *
  * Returns a JWT, given a telephoneSerial and password.
  * @method login
  * @param {String} event.body.telephoneSerial
  * @param {String} event.body.password
  * @throws Returns 401 if the telephoneSerial is not found or password is invalid.
  * @returns {Object} jwt that expires in 5 mins
  */
module.exports.handler = (event, context, callback) => {
  console.log('login');
  try {
  var { telephoneSerial, password } = JSON.parse(event.body);
  } catch(err){
	  console.error("Post data not correct - Check your request and try again");
	  const response = { // Error response
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: err.message,
		moreInfo: "Post data not correct - Check your request and try again"
      }),
    };
    callback(null, response);
  }

  try {
    // Authenticate telephone
	// Check in dynamoDB if the telephone exists and password correct
	// telephoneUtils.login returns a promise!
	telephoneUtils.login(telephoneSerial, password).then(function(result){
		// telephone Succesfully logged in/ fetched data
		const telephone = result;	
	
		console.log(telephone);

		if(telephone){
			console.log("Telephone successfully logged in");
			// Issue JWT
			const token = jwt.sign({ telephone }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRATION_TIME });
			console.log(`JWT issued: ${token}`);
			// Before Submitting response, Log the new token to the user's Record in DynamoDB
			// Also set Active status to 'true'
			
			
			const response = { // Success response
			  statusCode: 200,
			  headers: {
				'Access-Control-Allow-Origin': '*',
			  },
			  body: JSON.stringify({
				token,
			  }),
			};

			// Return response
			console.log(response);
			callback(null, response);																									
		} else{
			console.log("Unspecified Error occured - Telephone details are missing in result!")
		}		
		
	}).catch(function(error){
		//Handle Error!
		console.error("Telephone with provided details couldn't be found!");
		console.log(error);
		callback(new Error("Telephone with provided details couldn't be found!"));	
		return; 
	});
    
  } catch (e) {
    console.log(`Error logging in: ${e.message}`);
    const response = { // Error response
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: e.message,
      }),
    };
    callback(null, response);
  }
};
