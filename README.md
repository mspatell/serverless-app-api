# AWS Notes API - TypeScript CDK Version

## Migration from Serverless Framework to AWS CDK

This branch contains the TypeScript + AWS CDK version of the Notes API, migrated from the original Node.js + Serverless Framework implementation.

### Architecture

- **Language**: TypeScript
- **Infrastructure**: AWS CDK
- **Runtime**: Node.js 20.x
- **Region**: Canada Central (ca-central-1)
- **Database**: DynamoDB (table: cdk-ts-notes-api)
- **API**: API Gateway REST API
- **Functions**: AWS Lambda

### Project Structure

```
├── src/                    # Lambda function source code (TypeScript)
│   ├── api.ts             # API handlers
│   ├── db.ts              # DynamoDB client
│   ├── types.ts           # TypeScript interfaces
│   └── package.json       # Lambda dependencies
├── infrastructure/         # CDK infrastructure code
│   ├── lib/
│   │   └── infrastructure-stack.ts  # Main CDK stack
│   └── bin/
│       └── infrastructure.ts        # CDK app entry point
└── .github/workflows/
    └── cdk-deploy.yml     # GitHub Actions for CDK deployment
```

### Setup Instructions

1. **Prerequisites**
   ```bash
   npm install -g aws-cdk
   ```
   
   **Important**: This stack deploys to Canada Central (ca-central-1) region. Make sure your AWS CLI is configured or you have the appropriate permissions for this region.

2. **Install Dependencies**
   ```bash
   # Lambda functions
   cd src && npm install && cd ..
   
   # CDK infrastructure
   cd infrastructure && npm install && cd ..
   ```

3. **Build and Deploy**
   ```bash
   ./deploy.sh
   ```

   Or manually:
   ```bash
   # Build Lambda functions
   cd src && npm run build && cd ..
   
   # Deploy CDK stack
   cd infrastructure && npx cdk deploy && cd ..
   ```

### API Endpoints

Same as the original implementation:

- `POST /note` - Create a note
- `GET /note/{noteId}` - Get a specific note
- `PUT /note/{noteId}` - Update a note
- `DELETE /note/{noteId}` - Delete a note
- `GET /notes` - Get all notes

### Key Differences from Serverless Framework

1. **Infrastructure as Code**: CDK provides programmatic infrastructure definition
2. **Type Safety**: Full TypeScript support for both infrastructure and Lambda code
3. **Better IDE Support**: IntelliSense and type checking
4. **Modular Architecture**: Cleaner separation of concerns
5. **AWS Native**: Direct integration with AWS services

### Development Commands

```bash
# Build Lambda functions
cd src && npm run build

# Build CDK stack
cd infrastructure && npm run build

# Synthesize CloudFormation template
cd infrastructure && npx cdk synth

# Deploy stack
cd infrastructure && npx cdk deploy

# Destroy stack
cd infrastructure && npx cdk destroy
```

### CI/CD

GitHub Actions workflow automatically deploys on push to `typescript-cdk-migration` branch.

Required secrets:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`