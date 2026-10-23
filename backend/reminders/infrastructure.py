"""CloudFormation template; all resources are owned by this dedicated stack."""
import json
from pathlib import Path

PREFIX = 'roc-startup-week'
ref = lambda name: {'Ref': name}
sub = lambda value: {'Fn::Sub': value}
arn = lambda name: {'Fn::GetAtt': [name, 'Arn']}
resources = {}


def resource(name, kind, properties, **extra):
    resources[name] = {'Type': kind, 'Properties': properties, **extra}


resource('Table', 'AWS::DynamoDB::Table', {
    'TableName': PREFIX + '-reminders', 'BillingMode': 'PAY_PER_REQUEST',
    'AttributeDefinitions': [{'AttributeName': 'pk', 'AttributeType': 'S'}],
    'KeySchema': [{'AttributeName': 'pk', 'KeyType': 'HASH'}],
    'TimeToLiveSpecification': {'AttributeName': 'expiresAt', 'Enabled': True},
    'PointInTimeRecoverySpecification': {'PointInTimeRecoveryEnabled': True},
    'SSESpecification': {'SSEEnabled': True}, 'Tags': [{'Key': 'Project', 'Value': PREFIX}]
}, DeletionPolicy='Retain', UpdateReplacePolicy='Retain')
resource('Identity', 'AWS::SES::EmailIdentity', {'EmailIdentity': 'remind.rocstartupweek.com'})
resource('Configuration', 'AWS::SES::ConfigurationSet', {'Name': PREFIX + '-reminders',
    'SuppressionOptions': {'SuppressedReasons': ['BOUNCE', 'COMPLAINT']}})
resource('Feedback', 'AWS::SNS::Topic', {'TopicName': PREFIX + '-email-feedback'})
resource('FeedbackPolicy', 'AWS::SNS::TopicPolicy', {'Topics': [ref('Feedback')], 'PolicyDocument': {
    'Version': '2012-10-17', 'Statement': [{'Effect': 'Allow', 'Principal': {'Service': 'ses.amazonaws.com'},
        'Action': 'sns:Publish', 'Resource': ref('Feedback'), 'Condition': {'StringEquals': {'AWS:SourceAccount': ref('AWS::AccountId')},
        'ArnEquals': {'AWS:SourceArn': sub('arn:${AWS::Partition}:ses:${AWS::Region}:${AWS::AccountId}:configuration-set/roc-startup-week-reminders')}}}]}})
resource('FeedbackDestination', 'AWS::SES::ConfigurationSetEventDestination', {'ConfigurationSetName': ref('Configuration'),
    'EventDestination': {'Name': PREFIX + '-feedback', 'Enabled': True, 'MatchingEventTypes': ['bounce', 'complaint'],
        'SnsDestination': {'TopicARN': ref('Feedback')}}}, DependsOn='FeedbackPolicy')
resource('Role', 'AWS::IAM::Role', {'RoleName': PREFIX + '-reminders-lambda',
    'AssumeRolePolicyDocument': {'Version': '2012-10-17', 'Statement': [{'Effect': 'Allow', 'Principal': {'Service': 'lambda.amazonaws.com'}, 'Action': 'sts:AssumeRole'}]},
    'Policies': [{'PolicyName': PREFIX + '-reminders', 'PolicyDocument': {'Version': '2012-10-17', 'Statement': [
        {'Effect': 'Allow', 'Action': ['dynamodb:GetItem', 'dynamodb:PutItem', 'dynamodb:UpdateItem', 'dynamodb:Scan', 'dynamodb:ConditionCheckItem'], 'Resource': arn('Table')},
        {'Effect': 'Allow', 'Action': ['ses:SendEmail'], 'Resource': [sub('arn:${AWS::Partition}:ses:${AWS::Region}:${AWS::AccountId}:identity/remind.rocstartupweek.com'), sub('arn:${AWS::Partition}:ses:${AWS::Region}:${AWS::AccountId}:configuration-set/roc-startup-week-reminders')]},
        {'Effect': 'Allow', 'Action': ['logs:CreateLogStream', 'logs:PutLogEvents'], 'Resource': sub('arn:${AWS::Partition}:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/roc-startup-week-*:*')}
    ]}}]})
for logical, suffix, handler, timeout, concurrency in [('Api', 'api', 'api', 30, 5), ('Sender', 'reminder-sender', 'sender', 240, 1)]:
    resource(logical + 'Logs', 'AWS::Logs::LogGroup', {'LogGroupName': '/aws/lambda/' + PREFIX + '-' + suffix, 'RetentionInDays': 30})
    resource(logical, 'AWS::Lambda::Function', {'FunctionName': PREFIX + '-' + suffix,
        'Runtime': 'python3.13', 'Handler': 'app.' + handler, 'Role': arn('Role'), 'Timeout': timeout,
        'MemorySize': 256, 'ReservedConcurrentExecutions': concurrency,
        'Code': {'S3Bucket': ref('CodeBucket'), 'S3Key': ref('CodeKey')},
        'Environment': {'Variables': {'TABLE_NAME': ref('Table'), 'FROM_EMAIL': 'Roc Startup Week <reminders@remind.rocstartupweek.com>',
            'CONFIGURATION_SET': ref('Configuration'), 'FEEDBACK_TOPIC': ref('Feedback'), 'SENDING_ENABLED': ref('SendingEnabled'), 'DAILY_SEND_LIMIT': '1000'}},
        'Tags': [{'Key': 'Project', 'Value': PREFIX}]}, DependsOn=logical + 'Logs')
    resource(logical + 'ErrorAlarm', 'AWS::CloudWatch::Alarm', {'AlarmName': PREFIX + '-' + suffix + '-errors',
        'Namespace': 'AWS/Lambda', 'MetricName': 'Errors', 'Dimensions': [{'Name': 'FunctionName', 'Value': ref(logical)}],
        'Statistic': 'Sum', 'Period': 300, 'EvaluationPeriods': 1, 'Threshold': 1, 'ComparisonOperator': 'GreaterThanOrEqualToThreshold', 'TreatMissingData': 'notBreaching'})
resource('FeedbackPermission', 'AWS::Lambda::Permission', {'Action': 'lambda:InvokeFunction', 'FunctionName': ref('Api'), 'Principal': 'sns.amazonaws.com', 'SourceArn': ref('Feedback')})
resource('FeedbackSubscription', 'AWS::SNS::Subscription', {'TopicArn': ref('Feedback'), 'Protocol': 'lambda', 'Endpoint': arn('Api')}, DependsOn='FeedbackPermission')
resource('Schedule', 'AWS::Events::Rule', {'Name': PREFIX + '-reminders-every-minute', 'ScheduleExpression': 'rate(1 minute)',
    'State': 'ENABLED', 'Targets': [{'Arn': arn('Sender'), 'Id': PREFIX + '-sender', 'RetryPolicy': {'MaximumEventAgeInSeconds': 300, 'MaximumRetryAttempts': 2}}]})
resource('SchedulePermission', 'AWS::Lambda::Permission', {'Action': 'lambda:InvokeFunction', 'FunctionName': ref('Sender'), 'Principal': 'events.amazonaws.com', 'SourceArn': arn('Schedule')})
resource('ScheduleAlarm', 'AWS::CloudWatch::Alarm', {'AlarmName': PREFIX + '-schedule-failures', 'Namespace': 'AWS/Events', 'MetricName': 'FailedInvocations',
    'Dimensions': [{'Name': 'RuleName', 'Value': ref('Schedule')}], 'Statistic': 'Sum', 'Period': 300, 'EvaluationPeriods': 1, 'Threshold': 1,
    'ComparisonOperator': 'GreaterThanOrEqualToThreshold', 'TreatMissingData': 'notBreaching'})
resource('HttpApi', 'AWS::ApiGatewayV2::Api', {'Name': PREFIX + '-reminders', 'ProtocolType': 'HTTP',
    'CorsConfiguration': {'AllowOrigins': ['https://rocstartupweek.com', 'https://www.rocstartupweek.com', 'https://roc-startup-week.design-06d.workers.dev'],
        'AllowMethods': ['GET', 'POST'], 'AllowHeaders': ['content-type'], 'MaxAge': 3600}})
resource('Integration', 'AWS::ApiGatewayV2::Integration', {'ApiId': ref('HttpApi'), 'IntegrationType': 'AWS_PROXY', 'IntegrationUri': arn('Api'), 'PayloadFormatVersion': '2.0'})
for index, route in enumerate(['GET /events', 'POST /reminders', 'POST /reminders/unsubscribe']):
    resource('Route' + str(index), 'AWS::ApiGatewayV2::Route', {'ApiId': ref('HttpApi'), 'RouteKey': route, 'Target': {'Fn::Join': ['/', ['integrations', ref('Integration')]]}})
resource('Stage', 'AWS::ApiGatewayV2::Stage', {'ApiId': ref('HttpApi'), 'StageName': '$default', 'AutoDeploy': True,
    'DefaultRouteSettings': {'ThrottlingBurstLimit': 20, 'ThrottlingRateLimit': 5}})
resource('ApiPermission', 'AWS::Lambda::Permission', {'Action': 'lambda:InvokeFunction', 'FunctionName': ref('Api'), 'Principal': 'apigateway.amazonaws.com',
    'SourceArn': sub('arn:${AWS::Partition}:execute-api:${AWS::Region}:${AWS::AccountId}:${HttpApi}/*')})

template = {'AWSTemplateFormatVersion': '2010-09-09', 'Description': 'Dedicated Roc Startup Week reminder infrastructure',
    'Parameters': {'CodeBucket': {'Type': 'String'}, 'CodeKey': {'Type': 'String'}, 'SendingEnabled': {'Type': 'String', 'Default': 'false', 'AllowedValues': ['true', 'false']}},
    'Resources': resources, 'Outputs': {'ApiUrl': {'Value': {'Fn::GetAtt': ['HttpApi', 'ApiEndpoint']}},
        **{f'Dkim{n}{field}': {'Value': {'Fn::GetAtt': ['Identity', f'DkimDNSToken{field}{n}']}} for n in [1, 2, 3] for field in ['Name', 'Value']}}}
if __name__ == '__main__':
    Path('backend/reminders/build').mkdir(exist_ok=True)
    Path('backend/reminders/build/template.json').write_text(json.dumps(template, indent=2) + '\n')
