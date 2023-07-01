'use strict';

	
// const uuid = require('uuid');
// const AWS = require('aws-sdk'); 
 
// AWS.config.setPromisesDependency(require('bluebird'));

// const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.create = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Create --Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.read = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Read ----Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.update = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Read ---Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.delete = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Delete ----Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.submit = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: 'Submit --Go Serverless v1.0! Your function executed successfully!',
        input: event,
      },
      null,
      2
    ),
  };

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

	
// module.exports.submit = (event, context, callback) => {
//   const requestBody = JSON.parse(event.body);
//   const fullname = requestBody.fullname;
//   const email = requestBody.email;
//   const experience = requestBody.experience;

//   console.log("above if");
  
//   if (typeof fullname !== 'string' || typeof email !== 'string' || typeof experience !== 'number') {
//     console.error('Validation Failed');
//     callback(new Error('Couldn\'t submit candidate because of validation errors.'));
//     return;
//   }

//   console.log("below if");


//   submitCandidateP(candidateInfo(fullname, email, experience))
//     .then(res => {
//       callback(null, {
//         statusCode: 200,
//         body: JSON.stringify({
//           message: `Sucessfully submitted candidate with email ${email}`,
//           candidateId: res.id
//         })
//       });
//     })
//     .catch(err => {
//       console.log(err);
//       callback(null, {
//         statusCode: 500,
//         body: JSON.stringify({
//           message: `Unable to submit candidate with email ${email}`
//         })
//       })
//     });
// };
 
 
// const submitCandidateP = candidate => {
//   console.log('Submitting candidate');
//   const candidateInfo = {
//     TableName: process.env.CANDIDATE_TABLE,
//     Item: candidate,
//   };
//   return dynamoDb.put(candidateInfo).promise()
//     .then(res => candidate);
// };
 
// const candidateInfo = (fullname, email, experience) => {
//   const timestamp = new Date().getTime();
//   return {
//     id: uuid.v1(),
//     fullname: fullname,
//     email: email,
//     experience: experience,
//     submittedAt: timestamp,
//     updatedAt: timestamp,
//   };
// };

//   const response = {
//     statusCode: 200,
//     body: JSON.stringify({
//       message: 'Go Serverless v1.0! Your function executed successfully!',
//       input: event,
//     }),
//   };
 
//   callback(null, response);
 
// };