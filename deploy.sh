#!/bin/bash

echo "Building Lambda functions..."
cd src && npm run build && cd ..

echo "Deploying CDK stack..."
cd infrastructure && npm run build && npx cdk deploy --require-approval never && cd ..

echo "Deployment complete!"