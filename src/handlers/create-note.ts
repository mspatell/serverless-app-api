import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { client } from '../utils/db-client';
import { createResponse } from '../utils/response';
import { Note } from '../types';

export const createNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`[CREATE_NOTE] Request - body length: ${event.body?.length || 0}, requestId: ${event.requestContext.requestId}`);

  try {
    if (!event.body) {
      console.log(`[CREATE_NOTE] Error: Empty request body`);
      return createResponse(400, 'Request body is required.');
    }

    const body: Note = JSON.parse(event.body);
    console.log(`[CREATE_NOTE] Parsed note - noteId: ${body.noteId}`);
    
    if (!body.noteId) {
      console.log(`[CREATE_NOTE] Error: Missing noteId`);
      return createResponse(400, 'noteId is required.');
    }
    
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Item: marshall(body),
    };
    console.log(`[CREATE_NOTE] Writing to DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const createResult = await client.send(new PutItemCommand(params));
    console.log(`[CREATE_NOTE] Success - created noteId: ${body.noteId}`);

    return createResponse(200, 'Successfully created note.', createResult);
  } catch (e: any) {
    console.error(`[CREATE_NOTE] Error:`, e);
    return createResponse(500, 'Failed to create note.', undefined, e.message);
  }
};