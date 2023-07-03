const { DynamoDBClient } = require("@aws-sdk/client-dynamodb"); //importing class from AWS-SDK for Javascript and interaction methods with DynamoDB
const client = new DynamoDBClient({}); //no parameter constructor will use default configuration as we're working on Serverless Framework

module.exports = client; //This allows other parts of the application to import and use the same instance of the DynamoDBClient class
