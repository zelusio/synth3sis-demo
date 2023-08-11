require('dotenv').config()
const {Stack, Duration, RemovalPolicy} = require('aws-cdk-lib');
const ec2 = require("aws-cdk-lib/aws-ec2");
const ecr = require("aws-cdk-lib/aws-ecr");
const ecs = require("aws-cdk-lib/aws-ecs");
const iam = require('aws-cdk-lib/aws-iam')
const elb = require('aws-cdk-lib/aws-elasticloadbalancingv2')
const logs = require('aws-cdk-lib/aws-logs')
const secretsmanager = require('aws-cdk-lib/aws-secretsmanager')
const fs = require('fs')
const route53 = require('aws-cdk-lib/aws-route53')
const route53Targets = require('aws-cdk-lib/aws-route53-targets')

class DomainnameBalancedFargateService extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        // Get the VPC
        const vpc = ec2.Vpc.fromLookup(
            this,
            props.vpcName,
            {
                region: 'us-east-1',
                vpcName: props.vpcName
            }
        )

        // Get the ECS Cluster
        const cluster = ecs.Cluster.fromClusterAttributes(
            this,
            props.clusterName,
            {
                clusterName: props.clusterName,
                securityGroups: [],
                vpc: vpc
            }
        )

        const loadBalancer = elb.ApplicationLoadBalancer.fromLookup(
            this,
            `${props.serviceName}-application-load-balancer-${props.environmentName}`,
            {
                loadBalancerArn: props.loadBalancerArn
            }
        )

        // Create an execution role for the ECS Task / Service
        const executionRole = new iam.Role(
            this,
            `ecs-${props.serviceName}-execution-role-${props.environmentName}`,
            {
                roleName: `ecs-${props.serviceName}-execution-role-${props.environmentName}`,
                assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
            }
        )

        // Add necessary policy
        executionRole.addToPolicy(
            new iam.PolicyStatement(
                {
                    effect: iam.Effect.ALLOW,
                    resources: ['*'],
                    actions: [
                        "ecr:GetAuthorizationToken",
                        "ecr:BatchCheckLayerAvailability",
                        "ecr:GetDownloadUrlForLayer",
                        "ecr:BatchGetImage",
                        "logs:CreateLogStream",
                        "logs:PutLogEvents"
                    ]
                }
            )
        );


        // create the task role, grants containers to exeucte AWS APIs on my behalf
        const taskRole = new iam.Role(
            this,
            `ecs-${props.serviceName}-task-role-${props.environmentName}`,
            {
                roleName: `ecs-${props.serviceName}-task-role-${props.environmentName}`,
                assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com')
            }
        )
        taskRole.addToPolicy(
            new iam.PolicyStatement(
                {
                    actions: [
                        "logs:CreateLogStream",
                        "logs:DescribeLogGroups",
                        "logs:DescribeLogStreams",
                        "logs:PutLogEvents",
                        "ssmmessages:CreateControlChannel",
                        "ssmmessages:CreateDataChannel",
                        "ssmmessages:OpenControlChannel",
                        "ssmmessages:OpenDataChannel"
                    ],
                    resources: '*',
                    effect: iam.Effect.ALLOW
                }
            )
        )
        taskRole.addToPolicy(
            new iam.PolicyStatement(
                {
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'secretsmanager:GetResourcePolicy',
                        'secretsmanager:GetSecretValue',
                        'secretsmanager:DescribeSecret',
                        'secretsmanager:ListSecretVersionIds'
                    ],
                    resources: [
                        `arn:aws:secretsmanager:*:*:secret:${props.serviceName}/${props.environmentName}/*`
                    ]
                }
            )
        )
        taskRole.addToPolicy(
            new iam.PolicyStatement(
                {
                    effect: iam.Effect.ALLOW,
                    actions: [
                        'secretsmanager:ListSecrets'
                    ],
                    resources: [
                        `*`,
                    ]
                }
            )
        )


        // Create the task Definition
        const fargateTaskDefinition = JSON.parse(fs.readFileSync(`../task-definition.${props.environmentName}.json`))
        const taskDefinition = new ecs.FargateTaskDefinition(
            this,
            `ecs-${props.serviceName}-task-definition-${props.environmentName}`,
            {
                cpu: Number(fargateTaskDefinition.cpu),
                family: `ecs-${props.serviceName}-task-definition-${props.environmentName}`,
                memoryLimitMiB: Number(fargateTaskDefinition.memory),
                volumes: fargateTaskDefinition.volumes,
                runtimePlatform: {
                    operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
                },
                executionRole: executionRole,
                taskRole: taskRole,
            }
        )

        // Add containers from task definitions file
        fargateTaskDefinition.containerDefinitions.forEach((containerDefinition) => {

            console.log(`Adding definition for `)
            console.log(containerDefinition)

            // Get ECR Repository for container
            const repo = ecr.Repository.fromRepositoryName(
                this,
                `Repository-${containerDefinition.name}`,
                containerDefinition.name
            )

            // create service log group
            const serviceLogGroup = new logs.LogGroup(
                this,
                `log-group-${props.serviceName}-${props.environmentName}`,
                {
                    logGroupName: `/ecs/${props.serviceName}/${props.environmentName}`,
                    removalPolicy: RemovalPolicy.DESTROY
                }
            )

            // Create log driver
            const logDriver = new ecs.AwsLogDriver({
                    logGroup: serviceLogGroup,
                    streamPrefix: `${props.serviceName}-${props.environmentName}`
                }
            )

            // Get the container and add it to the task definition
            console.log(`container environment definition`, containerDefinition.environment)
            const environment = {}
            containerDefinition.environment.forEach(secret => {
                environment[secret.name] = secret.value
            })
            console.log(`environment:`, environment)
            const container = taskDefinition.addContainer(
                containerDefinition.name,
                {
                    image: ecs.ContainerImage.fromEcrRepository(repo, props.environmentName),
                    essential: containerDefinition.essential,
                    portMappings: containerDefinition.portMappings,
                    logging: logDriver,
                    environment,
                }
            )

        })


        // Create the service
        const service = new ecs.FargateService(
            this,
            `service-${props.serviceName}-${props.environmentName}`,
            {
                cluster: cluster, // The fargate cluster
                taskDefinition: taskDefinition, // The task to run
                assignPublicIp: false,
                circuitBreaker: {rollback: true},
                deploymentController: {
                    type: ecs.DeploymentControllerType.ECS,
                },
                desiredCount: props.desiredContainerCount,
                enableExecuteCommand: true,
                serviceName: `Service-${props.serviceName}-${props.environmentName}`,
                vpcSubnets: {
                    subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
                    availabilityZones: [
                        'us-east-1b',
                        'us-east-1f'
                    ]
                },

                healthCheckGracePeriod: Duration.seconds(10),
                maxHealthyPercent: 200,
                minHealthyPercent: 50,
            }
        );
        // configure service with autoscaling
        const scalableServiceTarget = service.autoScaleTaskCount({
            minCapacity: props.desiredContainerCount,
            maxCapacity: props.desiredContainerCount * 4
        })
        scalableServiceTarget.scaleOnCpuUtilization('CpuScaling', {
            targetUtilizationPercent: 60
        })
        scalableServiceTarget.scaleOnMemoryUtilization('MemoryScaling', {
            targetUtilizationPercent: 60
        })


        // Set up connections with load balancer
        console.log(`Container port for container: `, service.taskDefinition.defaultContainer.containerName, ` is `, service.taskDefinition.defaultContainer.containerPort)
        service.connections.allowFrom(loadBalancer, ec2.Port.tcp(
            service.taskDefinition.defaultContainer.containerPort
        ))
        loadBalancer.connections.allowTo(service, ec2.Port.tcp(
            service.taskDefinition.defaultContainer.containerPort
        ))

        console.log(`default container port mappings`, service.taskDefinition.defaultContainer.portMappings)

        // Get the HTTP Listener
        const httpListener = elb.ApplicationListener.fromLookup(
            this,
            `alb-listener-${props.serviceName}-${props.environmentName}`,
            {
                listenerPort: 80,
                loadBalancerArn: loadBalancer.loadBalancerArn
            }
        )


        const targetGroupForService = new elb.ApplicationTargetGroup(
            this,
            `target-group-${props.serviceName}-${props.environmentName}`,
            {
                port: 8000,
                protocol: elb.Protocol.HTTP,
                vpc,
                targetType: elb.TargetType.IP,
                targets: [
                    service
                ]
            }
        )

        // Add the target group to the service\
        httpListener.addTargetGroups(
            `rule-${props.serviceName}-${props.environmentName}`,
            {
                targetGroups: [
                    targetGroupForService
                ],
                conditions: [
                    elb.ListenerCondition.hostHeaders(props.domainNames)
                ],
                priority: 2
            }
        )

        // Get the hosted zone
        const hostedZone = route53.HostedZone.fromLookup(
            this,
            `hosted-zone-${props.domainZone.replaceAll('.', '-')}`,
            {
                domainName: props.domainZone
            }
        )

        // Add DNS For Service
        props.domainNames.forEach(domainName => {
            console.log(`Create domain name ${domainName} pointing to ELB :) in zone ${props.domainZone}`)

            const aRecord = new route53.ARecord(
                this,
                `A-record-${domainName.replaceAll('.', '-')}`,
                {
                    zone: hostedZone,
                    recordName: domainName.replaceAll(`.${props.domainZone}`, ''), // dev.hello-world.zelus.io -> dev.hello-world
                    target: route53.RecordTarget.fromAlias(
                        new route53Targets.LoadBalancerTarget(
                            loadBalancer
                        )
                    ),
                    deleteExisting: true
                }
            )
        })

        // If a cert ARN is configured, add a hTTPS listener
        if (props.certificateArn) {

            console.log(`Adding Certificate ${props.certificateArn}`)

            // Get the HTTPS listener
            const httpsListener = elb.ApplicationListener.fromLookup(
                this,
                `alb-https-listener-${props.serviceName}-${props.environmentName}`,
                {
                    listenerPort: 443,
                    loadBalancerArn: loadBalancer.loadBalancerArn
                }
            )

            // Get the certificate
            // Add the Certificate to the listener
            httpsListener.addCertificates(
                `certificate-${props.serviceName}-${props.environmentName}`,
                [
                    {
                        certificateArn: props.certificateArn
                    }
                ]
            )

            // Add the target group to the listener
            httpsListener.addTargetGroups(
                `rule-https-${props.serviceName}-${props.environmentName}`,
                {
                    targetGroups: [
                        targetGroupForService
                    ],
                    conditions: [
                        elb.ListenerCondition.hostHeaders(props.domainNames)
                    ],
                    priority: 2
                }
            )
        }

    }
}

module.exports = {DomainnameBalancedFargateService}
