import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export interface Note {
  noteId: string;
  title?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type LambdaHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;