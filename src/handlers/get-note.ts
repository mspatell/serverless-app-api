import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GetItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '../utils/db-client';
import { createResponse } from '../utils/response';

export const getNote = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const noteId = event.pathParameters?.noteId;
  console.log(`[GET_NOTE] Request - noteId: ${noteId}, requestId: ${event.requestContext.requestId}`);

  try {
    if (!noteId) {
      console.log(`[GET_NOTE] Error: Missing noteId parameter`);
      return createResponse(400, 'noteId parameter is required.');
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME!,
      Key: marshall({ noteId }),
    };
    console.log(`[GET_NOTE] Querying DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const { Item } = await client.send(new GetItemCommand(params));
    const noteData = Item ? unmarshall(Item) : {};
    
    console.log(`[GET_NOTE] Success - found: ${!!Item}`);
    return createResponse(200, 'Successfully retrieved note.', noteData);
  } catch (e: any) {
    console.error(`[GET_NOTE] Error:`, e);
    return createResponse(500, 'Failed to get note.', undefined, e.message);
  }
};