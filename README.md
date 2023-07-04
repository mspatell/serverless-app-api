# AWS API Gateway CRUD REST API using AWS Lambda, Node.js with AWS-SDK V3

## Serverless Notes App Api by Meetkumar Patel

#About this project
-It has 5 APIs: createNote, getNote, updateNote, deleteNote, getAllNotes
-As it is severless configured with AWS Cloud - it will create same API Gateway endpoints with respected HTTP requests
-When the ci/cd pipeline completes deployment, it will create Lamda functions in AWS Lamda (AWS Mgt consol)
-I used AWS CloudWatch to see logs(bug fixing)
-The project deals with AWS Dynamodb for storing REST API's reponse. So, it will instanciated when db.js files runs and will create an object called "client" from "DynamoDBClient" w/ AWS-SDK
-It will create a table and store data. when CRUD operations will be performed it will be managed automatically using DynamnoDB Commands. (Since the project is serverless, there is no need to congfigure server for managing database)
-The project is automated using ci/cd pipeline w/ GitHub Actions, when the code will be pushed/commited to 'master/ branch, it will start its deployment automatically.
-In backend the serverless framework runs, AWS CloudFormation, AWS Lamda, .yml file, .js files, .json file, etc. will be packaged in .zip file and completes further deployment process

#Steps to create IAM Policies - AWS Management Consol
follow this doc. https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started.html
1. Create a role: aws iam create-role
2. Attach a managed permissions policy to the role: aws iam attach-role-policy

#Steps to create roles (add roles)
1. Sign in to the AWS Management Console and open the IAM console at https://console.aws.amazon.com/iam/.
2. In the navigation pane of the console, choose Roles and then choose Create role.
3. Choose AWS account role type
4. Create a role: CreateRole
5. Attach a managed permission policy to the role: AttachRolePolicy

#Step for   Serverless framework setup/congfiguration 
1. npm install serverless -g
2. mkdir serverless-notes-app-api 
3. cd serverless-notes-app-api
4. serverless create --template aws-nodejs --path serverless-notes-app-api-dev --name api
5. configure & update the serverless.yml file 
6. create rest apis in api.js file
7. install necessary dependencies 
8. sls deploy

#Steps for Unit test - Jest Framework
1. yarn add --dev jest
2. create new file api.test.js
3. create unit test using jest framework
4. install necessary dependencies
5. yarn jest api.test.js

#Steps for CI/CD pipelines using GitHub Actions
1. Clone the project from the AWS code samples repository.
2. Deploy the AWS CloudFormation template to create the required services.
3. Update the source code.
4. Setup GitHub secrets.
5. Integrate CodeDeploy with GitHub.
6. Trigger the GitHub Action to build and deploy the code.
7. Verify the deployment.
