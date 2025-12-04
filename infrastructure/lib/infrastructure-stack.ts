import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as path from 'path';

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const notesTable = new dynamodb.Table(this, 'NotesTable', {
      tableName: 'cdk-ts-notes-api',
      partitionKey: { name: 'noteId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda Functions
    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../../src')),
      environment: {
        DYNAMODB_TABLE_NAME: notesTable.tableName,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
    };

    const getNoteLambda = new lambda.Function(this, 'GetNoteFunction', {
      ...lambdaProps,
      functionName: 'get-note',
      handler: 'api.getNote',
    });

    const createNoteLambda = new lambda.Function(this, 'CreateNoteFunction', {
      ...lambdaProps,
      functionName: 'create-note',
      handler: 'api.createNote',
    });

    const updateNoteLambda = new lambda.Function(this, 'UpdateNoteFunction', {
      ...lambdaProps,
      functionName: 'update-note',
      handler: 'api.updateNote',
    });

    const deleteNoteLambda = new lambda.Function(this, 'DeleteNoteFunction', {
      ...lambdaProps,
      functionName: 'delete-note',
      handler: 'api.deleteNote',
    });

    const getAllNotesLambda = new lambda.Function(this, 'GetAllNotesFunction', {
      ...lambdaProps,
      functionName: 'get-all-notes',
      handler: 'api.getAllNotes',
    });

    // Grant DynamoDB permissions
    notesTable.grantReadData(getNoteLambda);
    notesTable.grantWriteData(createNoteLambda);
    notesTable.grantReadWriteData(updateNoteLambda);
    notesTable.grantWriteData(deleteNoteLambda);
    notesTable.grantReadData(getAllNotesLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, 'NotesApi', {
      restApiName: 'Notes Service',
      description: 'This service serves notes.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type'],
      },
    });

    // API Gateway Integrations
    const noteResource = api.root.addResource('note');
    const noteIdResource = noteResource.addResource('{noteId}');
    const notesResource = api.root.addResource('notes');

    noteResource.addMethod('POST', new apigateway.LambdaIntegration(createNoteLambda));
    noteIdResource.addMethod('GET', new apigateway.LambdaIntegration(getNoteLambda));
    noteIdResource.addMethod('PUT', new apigateway.LambdaIntegration(updateNoteLambda));
    noteIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteNoteLambda));
    notesResource.addMethod('GET', new apigateway.LambdaIntegration(getAllNotesLambda));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'TableName', {
      value: notesTable.tableName,
      description: 'DynamoDB Table Name',
    });
  }
}
