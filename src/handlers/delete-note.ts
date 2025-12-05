import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DeleteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { client } from '../utils/db-client';
import { createResponse } from '../utils/response';

export const deleteNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters?.noteId;
  console.log(`[DELETE_NOTE] Request - noteId: ${noteId}, requestId: ${event.requestContext.requestId}`);

  try {
    if (!noteId) {
      console.log(`[DELETE_NOTE] Error: Missing noteId parameter`);
      return createResponse(400, 'noteId parameter is required.');
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId }),
    };
    console.log(`[DELETE_NOTE] Deleting from DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const deleteResult = await client.send(new DeleteItemCommand(params));
    console.log(`[DELETE_NOTE] Success - deleted noteId: ${noteId}`);

    return createResponse(200, 'Successfully deleted note.', deleteResult);
  } catch (e: any) {
    console.error(`[DELETE_NOTE] Error:`, e);
    return createResponse(500, 'Failed to delete note.', undefined, e.message);
  }
};