# Template Node/TypeScript + Docker Microservice
This repository is a template node.js/TypeScript + Docker microservice for deployment
to Zelus's Microservices environment. Follow this guide to get started.

## Prereqs
1. Install Node.js and NPM (preferable via NVM)
2. Install docker
3. Install the AWS CLI

## Getting Started

### GitHub Setup
1. Create a new GitHub repository using this repository as a template
2. Clone the repository

### Environment Setup
1. Copy `cdk/TEMPLATE.env` to `cdk/.env` and fill out the configurations
2. Install AWS CDK: `npm install aws-cdk -g`

# Deploy all the things
## Using CDK to Bootstrap an ECR Repository
Questions? Refer to https://www.npmjs.com/package/aws-cdk
1. `cd domainname-balanced-microservice`
2. `cdk bootstrap` (may be able to skip this one, not sure)
3. Deploy the stack for the ECR Repository
```shell
# change the service name to your service name
export SERVICENAME=hello-world
export SERVICENAME=hello-world
cdk deploy $SERVICENAME-ecr-repository-stack
```

## Build your Docker Image and push it to the Registry
Next, you'll need to build your `Dockerfile` and push it to ECS. 
This has to be done manually _once_ so that we have a contianer in the repository to use
when we create the ECS service in the next steps, and a "Hello world" container is provided.

In the future, this will be automagically triggered by merging PRs into `master`, `staging`, and `develop` 
using GitHub actions. 

Make sure to change the configured service name, `hello-world` in the example below
```shell
# change the service name to your service name, e.g. bridge
export SERVICENAME=hello-world

# 1. Login docker to AWS
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 357845657976.dkr.ecr.us-east-1.amazonaws.com

# 2. Build the docker image for dev, staging, and prod once your source code and docker file is configured
for TAG in dev staging prod
do docker build -t $SERVICENAME:$TAG .
done

# 3 Release the docker image and push - repeat for staging and prod
for TAG in dev staging prod
do
docker tag $SERVICENAME:$TAG 357845657976.dkr.ecr.us-east-1.amazonaws.com/$SERVICENAME:$TAG
docker push 357845657976.dkr.ecr.us-east-1.amazonaws.com/$SERVICENAME:$TAG
done
```
## Create the Task Definitions for dev, staging, prod
Update `task-definition.dev.json`, `task-definition.staging.json`, and `task-definition.prod.json` to configure tags, resource amounts, etc. 
Make sure to replace `hello-world` with your service name in all of them.
This is **very important** for the github action to be able to find your service to update it afterwards

## Create Dev (optionally, staging and prod too) services on ECS
```shell
# update this
export SERVICENAME=hello-world

# or, do just one at a time. Note that this will almost certainly take a long time. 
for STAGE in dev staging prod
do cdk deploy $SERVICENAME-domainname-balanced-microservice-$STAGE
done
```

## Some Assembly required
- Environment variables - these must be created iN AWS Secrets manager and managed by the app. Non-secret ones may go
in `task-definition.*.json`
- Cert currently must be created + validated manually, then can include the `certificateArn` on the props to automatically update TLS listener

This can be automated in the future but is not necessary now
