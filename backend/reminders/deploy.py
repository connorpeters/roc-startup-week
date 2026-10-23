"""Deploy only dedicated roc-startup-week resources using the current AWS CLI profile."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import zipfile


def aws(*args):
    return subprocess.check_output(['aws', *args, '--output', 'json'], text=True)


subprocess.run(['node', 'scripts/build-reminder-events.mjs'], check=True)
subprocess.run(['python3', 'backend/reminders/infrastructure.py'], check=True)
region = os.environ.get('AWS_REGION') or subprocess.check_output(['aws', 'configure', 'get', 'region'], text=True).strip() or 'us-east-1'
os.environ['AWS_DEFAULT_REGION'] = region
account = json.loads(aws('sts', 'get-caller-identity'))['Account']
bucket = f'roc-startup-week-deploy-{account}-{region}'
exists = subprocess.run(['aws', 's3api', 'head-bucket', '--bucket', bucket], capture_output=True).returncode == 0
if not exists:
    args = ['s3api', 'create-bucket', '--bucket', bucket]
    if region != 'us-east-1':
        args += ['--create-bucket-configuration', f'LocationConstraint={region}']
    aws(*args)
    aws('s3api', 'put-public-access-block', '--bucket', bucket, '--public-access-block-configuration', json.dumps({k: True for k in ['BlockPublicAcls', 'IgnorePublicAcls', 'BlockPublicPolicy', 'RestrictPublicBuckets']}))
    aws('s3api', 'put-bucket-tagging', '--bucket', bucket, '--tagging', json.dumps({'TagSet': [{'Key': 'Project', 'Value': 'roc-startup-week'}]}))
archive = Path('backend/reminders/build/lambda.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as zip_file:
    zip_file.write('backend/reminders/app.py', 'app.py')
    zip_file.write('backend/reminders/email_template.py', 'email_template.py')
    zip_file.write('images/brand/roc-startup-week-full-color.png', 'email-logo.png')
    zip_file.write('backend/reminders/build/events.json', 'events.json')
    zip_file.write('backend/reminders/build/schedule.json', 'schedule.json')
key = 'reminders/' + hashlib.sha256(archive.read_bytes()).hexdigest() + '.zip'
aws('s3api', 'put-object', '--bucket', bucket, '--key', key, '--body', str(archive), '--server-side-encryption', 'AES256')
existing = subprocess.run(['aws', 'cloudformation', 'describe-stacks', '--stack-name', 'roc-startup-week-reminders', '--output', 'json'], capture_output=True, text=True)
previous_enabled = 'false'
if existing.returncode == 0:
    params = json.loads(existing.stdout)['Stacks'][0]['Parameters']
    previous_enabled = next((p['ParameterValue'] for p in params if p['ParameterKey'] == 'SendingEnabled'), 'false')
enabled = os.environ.get('SENDING_ENABLED', previous_enabled)
if enabled == 'true':
    identity = json.loads(aws('sesv2', 'get-email-identity', '--email-identity', 'remind.rocstartupweek.com'))
    if not identity.get('VerifiedForSendingStatus'):
        raise SystemExit('Verify remind.rocstartupweek.com DNS before enabling sending.')
subprocess.run(['aws', 'cloudformation', 'deploy', '--stack-name', 'roc-startup-week-reminders',
    '--template-file', 'backend/reminders/build/template.json', '--capabilities', 'CAPABILITY_NAMED_IAM',
    '--parameter-overrides', f'CodeBucket={bucket}', f'CodeKey={key}', f'SendingEnabled={enabled}',
    '--tags', 'Project=roc-startup-week', '--no-fail-on-empty-changeset'], check=True)
stack = json.loads(aws('cloudformation', 'describe-stacks', '--stack-name', 'roc-startup-week-reminders'))['Stacks'][0]
outputs = {item['OutputKey']: item['OutputValue'] for item in stack['Outputs']}
Path('reminders-config.json').write_text(json.dumps({'apiUrl': outputs['ApiUrl']}, indent=2) + '\n')
Path('backend/reminders/build/deployment.json').write_text(json.dumps(outputs, indent=2) + '\n')
print(json.dumps(outputs, indent=2))
