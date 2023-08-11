const { Stack, Duration } = require('aws-cdk-lib');
const ecr = require("aws-cdk-lib/aws-ecr");

class EcrRepositoryStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);
        const repository = new ecr.Repository(
            this,
            props.repositoryName + '-' + props.version,
            {
                imageScanOnPush: true,
                repositoryName: props.repositoryName
            }
        )
    }
}

module.exports = { EcrRepositoryStack}