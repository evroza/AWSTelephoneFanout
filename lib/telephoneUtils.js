// Disclaimer: This is not ready for production, obviously.
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const jwt = require('jsonwebtoken');

const _ = require('lodash');

const UsersDB = [
  {
    username: 'Cthon98',
    password: 'hunter2', // User password
    scopes: ['pangolins'], // Authorized actions
  },
  {
    username: 'AzureDiamond',
    password: '*********',
    scopes: [],
  },
];

/**
  * Returns a user, given a username and valid password.
  *
  * @method login
  * @param {String} telephoneSerial - telephone Serial number
  * @param {String} password  - Allow / Deny
  * @throws Will throw an error if telephoneSerial is not found or if the password is wrong.
  * @returns {Object} telephone
  */
const login = (telephoneSerial, password) => {
    
  ///////////////////////////
  const params = {
		TableName: "serverless-auth-dev-AuthStatusTable-v1.1",
		Key: {
			TelephoneSerial: telephoneSerial
		}
	};
	
	return new Promise(function(resolve, reject){
		dynamoDB.get(params, (error, result) => {
			if(error){
				console.error(error);
				reject(error);
			}
			console.error(result);
			//Work with result here
			// Check if password matches
			if(result.Item.Password !== password){
				// Wrong password
				reject(new Error("Password Mismatch!"));
			}
			//At this point, telephone data was successfully fetch
			//Successfully fetch Telephone data - resolve promise
			resolve(_.omit(result.Item, 'Password'));
		});
	})
	/////////////////////////
};

/**
  * This Function verifies whether passed in telephoneSerial exists
  * @method telephoneExists
  * @param {String} telephoneSerial - The telephone to check for
  * @return Promise - true if found, false if not, reject on error
  * 
**/
const telephoneExists = (telephoneSerial) => {
	///////////////////////////
	const params = {
		TableName: "serverless-auth-dev-AuthStatusTable-v1.1",
		Key: {
			TelephoneSerial: telephoneSerial
		}
	};
	
	return new Promise(function(resolve, reject){
		dynamoDB.get(params, (error, result) => {
			if(error){
				console.error(error);
				reject(error);
			}
			console.error(result);
			
			// There was no result - Telephone doesn't esits - resolve promise with false
			if(!result.Item){
				console.log("No telephone with serial:", telephoneSerial, " could be found");
				resolve(false);
			}
			//At this point, a telephone matching input serial was found - resolve promise ewith true
			console.log("SUCCESS: Telephone with serial:", telephoneSerial, " found!");
			resolve(true);
		});
	})
	/////////////////////////
};

/**
  * This Function Updates the new token generated after successfully login
  * Also Sets Active status of telephone to value passed in by 'status' param
  * MUST provide valid token to perform update
  * NOTE: VALID tokens contain the telephone Serial number as part of payload data. This is required to sucessfully update
  * @method updateStatTok
  * @param {String} token - telephone current auth token
  * @param {String} status  - true / false
  * 
**/
const updateStatTok = (token, status = null) => {
	let telephoneFound = false;
	
	//first decode Token to verify it is valid:
	jwt.verify(token, process.env.JWT_SECRET, function(err, decoded) {
		// If invalid token --> decoded undefined, also have 'err'
		if(decoded.telephoneSerial){
			let telephoneSerial = decoded.telephoneSerial;
			// Token valid - Decode successful
			console.log(telephoneSerial) // the telephone serial in payload
						
			// Check provided telephone serial exists in database
			telephoneExists(telephoneSerial).then(function(result){
				if( result === true){
					//found telephone with matching serial
					// Now Check whether valid 'status' parameter was also passed in
					// Valid status param would be boolean -- so ...
					if( typeof status === 'boolean'){
						// Build body of Update object based on passed in params
						const params = {
							TableName: 'serverless-auth-dev-AuthStatusTable-v1.1', //TODO: Store and etch this name from config file everywhere it's accessed
							Key:{
								"TelephoneSerial": telephoneSerial
							},
							UpdateExpression: "set Token = :t, Active=:a, LastLogin=:ll",
							ExpressionAttributeValues: {
								":t": token,
								":a": status,
								":ll": new Date().getTime()
								
							},
							ReturnValues:"UPDATED_NEW"
						};
							
						
					} else {
						// Status wasn't passed in or has invalid value
						// Just update the Token, can ignore status field
						if(status !== null) {
							// Passed in 'status' but value is invalid
							// Will get here if passed in status, but it has a non-bolean value
							throw new Error("Invalid value passed in for Status");
						} else {
							// No value was passed in for status - or null was passed in
							// Perform update of token without updating status
							const params = {
								TableName: 'serverless-auth-dev-AuthStatusTable-v1.1', //TODO: Store and etch this name from config file everywhere it's accessed
								Key:{
									"TelephoneSerial": telephoneSerial
								},
								UpdateExpression: "set Token = :t, LastLogin=:ll",
								ExpressionAttributeValues: {
									":t": token,
									":ll": new Date().getTime()									
								},
								ReturnValues:"UPDATED_NEW"
							};
						}
						
					}
					
					// Update
					
					console.log("Updating Telephone Details...");
					dynamoDB.update(params, function(err, data) {
						if (err) {
							console.error("Unable to Telephone. Error JSON:", JSON.stringify(err, null, 2));
							// Throw update error
							throw new Error("ERROR: Update of Telephone data FAILED");
						} else {
							console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
						}
					});
					
				} else{
					//not found telephone with matching serial
					telephoneFound = false;			
				}
			}).catch(function(error){
				//Handle Error!
				console.error("Telephone with provided details couldn't be found!");
				console.log(error);
				throw new Error("ERROR: Telephone Serial in token is invalid - Couldn't find telephone entry with that Serial!");
				return;
			});
		
			
		} else {
			console.error("ERROR: Provided Token could be invalid or expired");
			throw new Error("Invalid token provided, please recheck your token and try again!");
		}
		
	  
	});
	
	
};




module.exports = {
  login,
  updateStatTok
};

