import { getSecretsManagerSecret } from './awssm.service';
import dotenv from 'dotenv'


dotenv.config()

export interface ISecrets {
    ENVIRONMENT: string;
    SERVICENAME: string;
    AWS_ACCESS_KEY_ID?: string;
    AWS_SECRET_ACCESS_KEY?: string;
}

export interface IRemoteSecrets {
    SYNTH3SIS_API_KEY: string
    SYNTH3SIS_API_URL: string
}


/**
 * Retrieve a variable from the process environment, throwing an exception if it isn't there
 * @param variableName - the name of the variable to retrieve from the environment
 */
function requireEnv(variableName: string): string {
    const value = process.env[variableName];
    if (!value) throw new Error(`Missing environment variable ${variableName}!`);
    return value;
}


/**
 * This object is responsible for pulling in all of the environment secrets and making them available to the rest
 * of the app in a strongly-typed, centralized way so that we aren't pulling in secrets from the env in multiple files.
 * Additionally, this will ensure an exception is always thrown if we're missing keys. Finally, this handles all
 * environment-related (prod/dev/staging) issues
 */
export const secrets: ISecrets = {
    ENVIRONMENT: requireEnv('ENVIRONMENT'),
    SERVICENAME: requireEnv('SERVICENAME'),
};
export default secrets;

let _remoteSecrets: IRemoteSecrets | undefined;

/**
 * Get secrets that are loaded remotely
 * @returns {Promise<IRemoteSecrets>}
 */
export const remoteSecrets = async (
    resync: boolean = false
): Promise<IRemoteSecrets> => {
    if (_remoteSecrets && !resync) return _remoteSecrets;
    else {
        // Load the config
        const [
            GENERIC_SECRETS,
        ] = await Promise.all([

            getSecretsManagerSecret(
                `${secrets.SERVICENAME}/${
                    secrets.ENVIRONMENT === 'local' ? 'dev' : secrets.ENVIRONMENT
                }/secrets`
            ),
        ]);

        // Save out the config so it's cached for next time
        _remoteSecrets = {
            ...JSON.parse(GENERIC_SECRETS),
            ...process.env, // Override with local configs if applicable
        };

        return <IRemoteSecrets>_remoteSecrets;
    }
};