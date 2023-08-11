import {
    SecretsManagerClient,
    GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({
    region: 'us-east-1',
});

/**
 * Get a secret stored in AWSSM as a string. Client is responsible for parsing if it's JSON.
 * @param {string} secretName - the name of the secret, usually $SERVICENAME/$ENVIRONMENT/secrets
 * @returns {Promise<string>}
 */
export async function getSecretsManagerSecret(secretName: string): Promise<string> {

    const command = new GetSecretValueCommand({ SecretId: secretName });
    const response = await client.send(command);
    let secret;

    if (response.SecretString) secret = response.SecretString;
    else if (response.SecretBinary) secret = Buffer.from(response.SecretBinary).toString('utf8');
    else throw new Error(`Couldn't load secret from AWSSM`);
    return secret;
}