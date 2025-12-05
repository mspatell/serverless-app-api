import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from './db';
import { Note } from './types';

// Log deployment info on cold start
console.log('[LAMBDA_INIT] Notes API Lambda functions initialized');
console.log('[LAMBDA_INIT] DynamoDB table:', process.env.DYNAMODB_TABLE_NAME);
console.log('[LAMBDA_INIT] AWS Region:', process.env.AWS_REGION);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const addCorsHeaders = (response: APIGatewayProxyResult): APIGatewayProxyResult => ({
  ...response,
  headers: {
    ...corsHeaders,
    ...response.headers,
  },
});

export const getNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters?.noteId;
  console.log(`[GET_NOTE] Request - noteId: ${noteId}, requestId: ${event.requestContext.requestId}`);
  
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    if (!noteId) {
      console.log(`[GET_NOTE] Error: Missing noteId parameter`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'noteId parameter is required.',
      });
      return addCorsHeaders(response);
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId }),
    };
    console.log(`[GET_NOTE] Querying DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const { Item } = await client.send(new GetItemCommand(params));
    const noteData = Item ? unmarshall(Item) : {};
    
    console.log(`[GET_NOTE] Success - found: ${!!Item}`);
    response.body = JSON.stringify({
      message: 'Successfully retrieved note.',
      data: noteData,
    });
  } catch (e: any) {
    console.error(`[GET_NOTE] Error:`, e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get note.',
      errorMsg: e.message,
    });
  }

  console.log(`[GET_NOTE] Response - status: ${response.statusCode}`);
  return addCorsHeaders(response);
};

export const createNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`[CREATE_NOTE] Request - body length: ${event.body?.length || 0}, requestId: ${event.requestContext.requestId}`);
  
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    if (!event.body) {
      console.log(`[CREATE_NOTE] Error: Empty request body`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'Request body is required.',
      });
      return addCorsHeaders(response);
    }

    const body: Note = JSON.parse(event.body);
    console.log(`[CREATE_NOTE] Parsed note - noteId: ${body.noteId}`);
    
    if (!body.noteId) {
      console.log(`[CREATE_NOTE] Error: Missing noteId`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'noteId is required.',
      });
      return addCorsHeaders(response);
    }
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Item: marshall(body),
    };
    console.log(`[CREATE_NOTE] Writing to DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const createResult = await client.send(new PutItemCommand(params));
    console.log(`[CREATE_NOTE] Success - created noteId: ${body.noteId}`);

    response.body = JSON.stringify({
      message: 'Successfully created note.',
      createResult,
    });
  } catch (e: any) {
    console.error(`[CREATE_NOTE] Error:`, e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create note.',
      errorMsg: e.message,
    });
  }

  console.log(`[CREATE_NOTE] Response - status: ${response.statusCode}`);
  return addCorsHeaders(response);
};

export const updateNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters?.noteId;
  console.log(`[UPDATE_NOTE] Request - noteId: ${noteId}, requestId: ${event.requestContext.requestId}`);
  
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    if (!noteId) {
      console.log(`[UPDATE_NOTE] Error: Missing noteId parameter`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'noteId parameter is required.',
      });
      return addCorsHeaders(response);
    }

    if (!event.body) {
      console.log(`[UPDATE_NOTE] Error: Empty request body`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'Request body is required.',
      });
      return addCorsHeaders(response);
    }

    const body: Partial<Note> = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    console.log(`[UPDATE_NOTE] Updating fields: ${objKeys.join(', ')}`);
    
    if (objKeys.length === 0) {
      console.log(`[UPDATE_NOTE] Error: No fields to update`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'At least one field is required for update.',
      });
      return addCorsHeaders(response);
    }
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId }),
      UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
        ...acc,
        [`#key${index}`]: key,
      }), {}),
      ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
        ...acc,
        [`:value${index}`]: body[key as keyof Note],
      }), {})),
    };
    console.log(`[UPDATE_NOTE] Updating DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const updateResult = await client.send(new UpdateItemCommand(params));
    console.log(`[UPDATE_NOTE] Success - updated noteId: ${noteId}`);

    response.body = JSON.stringify({
      message: 'Successfully updated note.',
      updateResult,
    });
  } catch (e: any) {
    console.error(`[UPDATE_NOTE] Error:`, e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to update note.',
      errorMsg: e.message,
    });
  }

  console.log(`[UPDATE_NOTE] Response - status: ${response.statusCode}`);
  return addCorsHeaders(response);
};

export const deleteNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters?.noteId;
  console.log(`[DELETE_NOTE] Request - noteId: ${noteId}, requestId: ${event.requestContext.requestId}`);
  
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    if (!noteId) {
      console.log(`[DELETE_NOTE] Error: Missing noteId parameter`);
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: 'noteId parameter is required.',
      });
      return addCorsHeaders(response);
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId }),
    };
    console.log(`[DELETE_NOTE] Deleting from DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const deleteResult = await client.send(new DeleteItemCommand(params));
    console.log(`[DELETE_NOTE] Success - deleted noteId: ${noteId}`);

    response.body = JSON.stringify({
      message: 'Successfully deleted note.',
      deleteResult,
    });
  } catch (e: any) {
    console.error(`[DELETE_NOTE] Error:`, e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to delete note.',
      errorMsg: e.message,
    });
  }

  console.log(`[DELETE_NOTE] Response - status: ${response.statusCode}`);
  return addCorsHeaders(response);
};

export const getAllNotes = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`[GET_ALL_NOTES] Request - requestId: ${event.requestContext.requestId}`);
  
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    console.log(`[GET_ALL_NOTES] Scanning DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const { Items } = await client.send(new ScanCommand({ 
      TableName: process.env.DYNAMODB_TABLE_NAME! 
    }));
    
    const notes = Items?.map((item) => unmarshall(item)) || [];
    console.log(`[GET_ALL_NOTES] Success - found ${notes.length} notes`);

    response.body = JSON.stringify({
      message: 'Successfully retrieved all notes.',
      data: notes,
    });
  } catch (e: any) {
    console.error(`[GET_ALL_NOTES] Error:`, e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to retrieve notes.',
      errorMsg: e.message,
    });
  }

  console.log(`[GET_ALL_NOTES] Response - status: ${response.statusCode}`);
  return addCorsHeaders(response);
};