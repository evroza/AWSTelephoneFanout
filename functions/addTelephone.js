
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();


module.exports.handler = (event, context, callback) => {
	const timestamp = new Date().getTime();
	try {
	// Extract the telephone data sent in the request body
	var data = JSON.parse(event.body);
	} catch(err){
		console.error("Body of request couldn't be parsed as a JSON - Recheck the formating of your payload!");
		let errorReturn = {
	        'statusCode': 401,
	        'headers': { 'Content-Type': 'application/json' },
	        'body': JSON.stringify(event)
	    }
		callback(null, testReturn);
		return;
	}
	
	// Validate the data before input to DB
	
	if(typeof data.telephoneSerial !== 'string' || typeof data.password !== 'string') {
		console.error("Validation check failed during telephone creation");
		console.log(data);
		let errorReturn = {
	        'statusCode': 401,
	        'headers': { 'Content-Type': 'application/json' },
	        'body': JSON.stringify({error: "The JSON request in your payload must have, the fields: 'telephoneSerial' and 'password'"})
	    }
		callback(errorReturn);
		return;
	}
	
	/**
		Expected MINIMUM composition of records(with data type) input into out Telephone table when registering
		  - AttributeName: TelephoneSerial
            AttributeType: S
          - AttributeName: Password
            AttributeType: S
          - AttributeName: Active
            AttributeType: B
          - AttributeName: CreatedAt
            AttributeType: S
          - AttributeName: LastLogin
            AttributeType: S
	**/
	
	const params = {
		TableName: 'serverless-auth-dev-AuthStatusTable-v1.1', //TODO: Store and etch this name from config file everywhere it's accessed
		Item: {
			TelephoneSerial: data.telephoneSerial,
			Password: data.password,
			Active: false,
			groups: data.groups,
			CreatedAt: timestamp, // Remember to correctly implement this to store correct timestamp of creation time
			LastLogin: timestamp // Remember to correctly implement this to store correct timestamp of last access
			
		},
		ConditionExpression: "TelephoneSerial <> :TelephoneSerialVal",
		ExpressionAttributeValues: {
			':TelephoneSerialVal' : `${data.telephoneSerial}`
		}
		
	};
	
	dynamoDB.put(params, (error, result) => {
		if(error) {
			console.error("Couldn't create the new Telephone Item entry");
			console.log(error);
			callback(new Error("Couldn't create the new Telephone Item entry"));
			return;
		}
		
		const response = {
			statusCode: 200,
			body: JSON.stringify(result.Item),
			headers: {
			  'Access-Control-Allow-Origin': '*', // Required for CORS support to work
			},
		};
		
	callback(null, response);
	return;		
	});
};





