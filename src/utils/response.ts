import { APIGatewayProxyResult } from 'aws-lambda';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST, GET, PUT, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export const createResponse = (
  statusCode: number,
  message: string,
  data?: any,
  errorMsg?: string
): APIGatewayProxyResult => ({
  statusCode,
  body: JSON.stringify({
    message,
    ...(data && { data }),
    ...(errorMsg && { errorMsg }),
  }),
  headers: corsHeaders,
});