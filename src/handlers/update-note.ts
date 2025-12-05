import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { client } from '../utils/db-client';
import { createResponse } from '../utils/response';
import { Note } from '../types';

export const updateNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters?.noteId;
  console.log(`[UPDATE_NOTE] Request - noteId: ${noteId}, requestId: ${event.requestContext.requestId}`);

  try {
    if (!noteId) {
      console.log(`[UPDATE_NOTE] Error: Missing noteId parameter`);
      return createResponse(400, 'noteId parameter is required.');
    }

    if (!event.body) {
      console.log(`[UPDATE_NOTE] Error: Empty request body`);
      return createResponse(400, 'Request body is required.');
    }

    const body: Partial<Note> = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    console.log(`[UPDATE_NOTE] Updating fields: ${objKeys.join(', ')}`);
    
    if (objKeys.length === 0) {
      console.log(`[UPDATE_NOTE] Error: No fields to update`);
      return createResponse(400, 'At least one field is required for update.');
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

    return createResponse(200, 'Successfully updated note.', updateResult);
  } catch (e: any) {
    console.error(`[UPDATE_NOTE] Error:`, e);
    return createResponse(500, 'Failed to update note.', undefined, e.message);
  }
};