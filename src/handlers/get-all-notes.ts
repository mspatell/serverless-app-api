import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { client } from '../utils/db-client';
import { createResponse } from '../utils/response';

export const getAllNotes = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log(`[GET_ALL_NOTES] Request - requestId: ${event.requestContext.requestId}`);

  try {
    console.log(`[GET_ALL_NOTES] Scanning DynamoDB - table: ${process.env.DYNAMODB_TABLE_NAME}`);
    
    const { Items } = await client.send(new ScanCommand({ 
      TableName: process.env.DYNAMODB_TABLE_NAME! 
    }));
    
    const notes = Items?.map((item) => unmarshall(item)) || [];
    console.log(`[GET_ALL_NOTES] Success - found ${notes.length} notes`);

    return createResponse(200, 'Successfully retrieved all notes.', notes);
  } catch (e: any) {
    console.error(`[GET_ALL_NOTES] Error:`, e);
    return createResponse(500, 'Failed to retrieve notes.', undefined, e.message);
  }
};