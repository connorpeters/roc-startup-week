"""Send two IAM-authorized Lambda previews to an explicitly supplied test recipient."""
import argparse
import hashlib
import json
from pathlib import Path
import ssl
import time
from urllib.request import Request, urlopen

import boto3
import botocore

parser = argparse.ArgumentParser()
parser.add_argument('--email', required=True)
parser.add_argument('--day', default='2026-11-02')
parser.add_argument('--welcome-only', action='store_true', help='Test first-registration delivery without sending reminder previews')
args = parser.parse_args()
email = args.email.strip().lower()
api = json.loads(Path('reminders-config.json').read_text())['apiUrl']
tls = ssl.create_default_context(cafile=str(Path(botocore.__file__).with_name('cacert.pem')))
table = boto3.resource('dynamodb', region_name='us-east-1').Table('roc-startup-week-reminders')
client = boto3.client('lambda', region_name='us-east-1')
subkey = 'SUB#' + hashlib.sha256(email.encode()).hexdigest()
if table.get_item(Key={'pk': subkey}, ConsistentRead=True).get('Item'):
    raise SystemExit('Address already has a subscription record; use a fresh test address to preserve existing preferences.')
test_rate_key = f'RATE#{hashlib.sha256(("email:" + email).encode()).hexdigest()}#{int(time.time()) // 3600}'
# This IAM-only test harness owns its temporary signup and counters. The public
# API never bypasses rate limits; repeated developer previews need fresh fixtures.
table.delete_item(Key={'pk': test_rate_key})


def request(path, data=None):
    req = Request(api + path, data=json.dumps(data).encode() if data is not None else None,
                  headers={'content-type': 'application/json'})
    with urlopen(req, context=tls, timeout=30) as response:
        return json.loads(response.read())


def invoke():
    response = client.invoke(FunctionName='roc-startup-week-reminder-sender', Payload=json.dumps({'action': 'send-test', 'email': email, 'day': args.day}).encode())
    result = json.loads(response['Payload'].read())
    if 'FunctionError' in response:
        raise RuntimeError(result)
    return result


welcome_key = 'DELIVERY#' + subkey + '#welcome'
cleanup = [subkey, welcome_key]
try:
    events = request('/events')
    ids = [e['id'] for e in events if e['startsAt'].startswith(args.day)]
    assert ids, 'No events on the selected test day'
    request('/reminders', {'email': email, 'eventIds': ids, 'consent': True})
    subscriber = table.get_item(Key={'pk': subkey}, ConsistentRead=True)['Item']
    token = subscriber['unsubscribeToken']
    cleanup.append('TOKEN#' + hashlib.sha256(token.encode()).hexdigest())
    welcome = table.get_item(Key={'pk': welcome_key}, ConsistentRead=True)['Item']
    assert 'sentAt' in welcome and welcome['attempts'] == 1, 'First signup must send the welcome email'
    request('/reminders', {'email': email, 'eventIds': ids, 'consent': True})
    assert table.get_item(Key={'pk': welcome_key}, ConsistentRead=True)['Item'] == welcome, 'Duplicate signup must not send another welcome email'
    if not args.welcome_only:
        result = invoke()
        assert result['sent'] == 2, result
        print(json.dumps(result, indent=2))
    request('/reminders/unsubscribe', {'token': token})
    result = invoke()
    assert result['sent'] == 0, result
    print('PASS: welcome sent once; duplicate signup did not resend; unsubscribe blocks further delivery. Check the recipient inbox to confirm receipt.')
finally:
    for key in cleanup:
        table.delete_item(Key={'pk': key})
    table.delete_item(Key={'pk': f'RATE#{hashlib.sha256(("email:" + email).encode()).hexdigest()}#{int(time.time()) // 3600}'})
