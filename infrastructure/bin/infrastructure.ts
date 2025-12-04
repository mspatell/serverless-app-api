#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { InfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new InfrastructureStack(app, 'InfrastructureStack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'ca-central-1' // Canada Central region
  },
  description: 'Notes API infrastructure deployed in Canada Central region'
});
