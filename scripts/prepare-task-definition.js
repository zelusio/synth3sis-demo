const fs = require('fs');
require('dotenv').config()


function getECRConfiguration() {
    try {
        return JSON.parse(fs.readFileSync('./artifacts/aws/ecr.json'))
    }
    catch (err) {
        console.error(`Unable to read artifacts/aws/ecr.json - did you run npm run bootstrap:ecr?`)
    }
}

async function createTaskDefinition() {

    const taskTemplate = JSON.parse(fs.readFileSync('./task-definition.template.json').toString())
    const ecrConfig = getECRConfiguration()

    // Update the task template
    taskTemplate.containerDefinitions.name = process.env.SERVICENAME
    taskTemplate.containerDefinitions.image = `${process.env.SERVICENAME}:0`
}

createTaskDefinition().then(() => process.exit(0))