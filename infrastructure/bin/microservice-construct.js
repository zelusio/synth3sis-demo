#!/usr/bin/env node
require('dotenv').config()
const cdk = require('aws-cdk-lib');
const {DomainnameBalancedFargateService} = require('../lib/domainname-balanced-fargate-service');
const {EcrRepositoryStack} = require('../lib/ecr-repository-stack')
const {SecretsManagerSecretStack} = require('../lib/secrets-manager-secret-stack')
const app = new cdk.App();

const ecrProps = {
    version: 'v1',
    repositoryName: process.env.SERVICENAME,
}

// Stack for ECR Repository
new EcrRepositoryStack(app, `${process.env.SERVICENAME}-ecr-repository-stack`, {
    env: {account: '357845657976', region: 'us-east-1'},
    ...ecrProps,
})

// Stacks for Staging ECS Service
new SecretsManagerSecretStack(app, `${process.env.SERVICENAME}-awssm-secret-staging`, {
    environmentName: `staging`,
    serviceName: process.env.SERVICENAME
})
new DomainnameBalancedFargateService(app, `${process.env.SERVICENAME}-domainname-balanced-microservice-staging`, {
    env: {account: '357845657976', region: 'us-east-1'},
    vpcName: 'vpc-prod',
    ...{

        // global config
        environmentName: 'staging',

        // VPC Information
        vpcName: 'vpc-prod',

        // ECS Information
        clusterName: 'microservices-fargate-cluster-staging',
        serviceName: process.env.SERVICENAME, // name of the service to create on the cluster
        desiredContainerCount: 1, // desired container count

        // Load Balance Information
        loadBalancerArn: 'arn:aws:elasticloadbalancing:us-east-1:357845657976:loadbalancer/app/microservices-elb-staging/0936e82ab11cda11',
        domainNames: [`demo.synth3sis.io`],
        domainZone: 'synth3sis.io',
        certificateArn: 'arn:aws:acm:us-east-1:357845657976:certificate/198f9c43-ad8a-4bd7-a982-54004a4b7c24',
    }
});


