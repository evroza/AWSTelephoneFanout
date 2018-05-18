// Disclaimer: This is not ready for production, obviously.
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

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

module.exports = {
  login,
};

