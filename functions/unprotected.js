/**
  * GET /unprotected
  *
  * This endpoint isunprotected - doesn't require authentication of clients
  * @returns {Array.Object}
  */
module.exports.handler = (event, context, callback) => {
  console.log('unprotected Endpoint accessed');
  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      someData: [
        {
          id: 1,
          name: 'Unprotected Content Sample',
          address: 'Just some garbage - ignore this',
        },
      ],
    }),
  };

  callback(null, response);
};
