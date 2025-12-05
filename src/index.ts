// Log deployment info on cold start
console.log('[LAMBDA_INIT] Notes API Lambda functions initialized');
console.log('[LAMBDA_INIT] DynamoDB table:', process.env.DYNAMODB_TABLE_NAME);
console.log('[LAMBDA_INIT] AWS Region:', process.env.AWS_REGION);

export { getNote } from './handlers/get-note';
export { createNote } from './handlers/create-note';
export { updateNote } from './handlers/update-note';
export { deleteNote } from './handlers/delete-note';
export { getAllNotes } from './handlers/get-all-notes';