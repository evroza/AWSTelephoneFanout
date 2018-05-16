/**
  * GET /pangolins
  *
  * Returns a collection, random data that requires authentication to aaccess - in this case, a collection of pangolins
  * @returns {Array.Object}
  */
module.exports.handler = (event, context, callback) => {
  console.log('getProected endoint accessed');
  console.log(event);

  const user = JSON.parse(event.requestContext.authorizer.user);
  console.log(user);

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      pangolins: [
        {
          id: 2,
          name: 'Protected data I have here',
          address: 'Some Special Address',
        },
      ],
    }),
  };

  callback(null, response);
};
