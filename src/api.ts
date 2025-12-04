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
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId: event.pathParameters!.noteId }),
    };
    const { Item } = await client.send(new GetItemCommand(params));

    response.body = JSON.stringify({
      message: 'Successfully retrieved note.',
      data: Item ? unmarshall(Item) : {},
    });
  } catch (e: any) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get note.',
      errorMsg: e.message,
    });
  }

  return addCorsHeaders(response);
};

export const createNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    const body: Note = JSON.parse(event.body || '{}');
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Item: marshall(body),
    };
    const createResult = await client.send(new PutItemCommand(params));

    response.body = JSON.stringify({
      message: 'Successfully created note.',
      createResult,
    });
  } catch (e: any) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create note.',
      errorMsg: e.message,
    });
  }

  return addCorsHeaders(response);
};

export const updateNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    const body: Partial<Note> = JSON.parse(event.body || '{}');
    const objKeys = Object.keys(body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId: event.pathParameters!.noteId }),
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
    const updateResult = await client.send(new UpdateItemCommand(params));

    response.body = JSON.stringify({
      message: 'Successfully updated note.',
      updateResult,
    });
  } catch (e: any) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to update note.',
      errorMsg: e.message,
    });
  }

  return addCorsHeaders(response);
};

export const deleteNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId: event.pathParameters!.noteId }),
    };
    const deleteResult = await client.send(new DeleteItemCommand(params));

    response.body = JSON.stringify({
      message: 'Successfully deleted note.',
      deleteResult,
    });
  } catch (e: any) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to delete note.',
      errorMsg: e.message,
    });
  }

  return addCorsHeaders(response);
};

export const getAllNotes = async (): Promise<APIGatewayProxyResult> => {
  const response: APIGatewayProxyResult = { statusCode: 200, body: '', headers: {} };

  try {
    const { Items } = await client.send(new ScanCommand({ 
      TableName: process.env.DYNAMODB_TABLE_NAME! 
    }));

    response.body = JSON.stringify({
      message: 'Successfully retrieved all notes.',
      data: Items?.map((item) => unmarshall(item)) || [],
    });
  } catch (e: any) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to retrieve notes.',
      errorMsg: e.message,
    });
  }

  return addCorsHeaders(response);
};