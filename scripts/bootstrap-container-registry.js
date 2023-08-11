require('dotenv').config()
const execSync = require('child_process').execSync

const command = `aws ecr create-repository --output json --tags Key=project,Value=microservices --image-scanning-configuration scanOnPush=true --repository-name ${process.env.SERVICENAME} > artifacts/aws/ecr.json`
execSync(command)