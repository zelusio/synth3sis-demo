const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const {SecretsManagerClient, GetSecretValueCommand} = require('@aws-sdk/client-secrets-manager')

const app = express();

// Secrets manager config
const secretsManagerClient = new SecretsManagerClient({region: 'us-east-1'})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('short'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.get('/hello-world', (request, response, next) => {
    console.log(`Received Hello`)
    return response.status(200).json({message: 'Hello, world!'})
})

app.get('/easter-egg', (request, response, next) => {
    console.log(`Surprise!`)
    return response.status(200).json({message: 'Surprise!'})
})

app.get('/', (request, response, next) => {
  console.log('/')
  return response.status(200).json({message: 'hello, world! I\'m on prod.'})
})

app.get('/example-secret', async (request, response, next) => {

    try {
        const env = process.env.ENVIRONMENT
        const serviceName = process.env.SERVICENAME
        const secretName = `${serviceName}/${env}/example-secret`
        console.log(`trying to get secret`, secretName)
        const command = new GetSecretValueCommand({
            SecretId: secretName
        })
        const secretResponse = await secretsManagerClient.send(command);
        let secret;
        if (secretResponse.SecretString) secret = secretResponse.SecretString
        else if (secretResponse.SecretBinary) secret = Buffer.from(secretResponse.SecretBinary).toString('utf8')
        else secret = 'Error! could not find secret'
        return response.status(200).json({
            env,
            serviceName,
            secret
        })
    }
    catch (err) {
        response.status(500).json({
            error: err.message
        })
    }
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // render the error page
    res.status(err.status || 500).json({error: err.message})
});

module.exports = {app}

// If the file is being run via Node CLI
if (require.main === module) {
    const server = app.listen(8000, '0.0.0.0', () => {
        console.log(`App running on ${server.address().address}:${server.address().port}`)
    });

}