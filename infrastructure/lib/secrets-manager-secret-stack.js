require('dotenv').config()
const {Stack} = require('aws-cdk-lib')
const secretsManager = require('aws-cdk-lib/aws-secretsmanager')

class SecretsManagerSecretStack extends Stack {

    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {stackProps} props
     */
    constructor(scope, id, props) {

        super(scope, id, props)

        // Create a Secret in AWSSM
        const secret = new secretsManager.Secret(
            this,
            'secret', {
                description: `Secrets for ${props.serviceName} (${props.environmentName})`,
                secretName: `${props.serviceName}/${props.environmentName}/secrets`,
                secretObjectValue: {}
            }
        )
    }

}

module.exports = {SecretsManagerSecretStack}