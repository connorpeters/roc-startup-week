"""Integration checks on the dedicated stack. Never sends an email; cleans up test rows."""
import hashlib
import json
from pathlib import Path
import secrets
import ssl
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen

import boto3
import botocore

api = json.loads(Path('reminders-config.json').read_text())['apiUrl']
table = boto3.resource('dynamodb', region_name='us-east-1').Table('roc-startup-week-reminders')
lambda_client = boto3.client('lambda', region_name='us-east-1')
email = f'roc-startup-week-smoke-{secrets.token_hex(6)}@example.com'
subkey = 'SUB#' + hashlib.sha256(email.encode()).hexdigest()
cleanup = [subkey]
tls = ssl.create_default_context(cafile=str(Path(botocore.__file__).with_name('cacert.pem')))


def request(path, data=None, method=None, headers=None):
    req = Request(api + path, data=json.dumps(data).encode() if data is not None else None,
                  headers={'content-type': 'application/json', **(headers or {})}, method=method)
    try:
        with urlopen(req, timeout=30, context=tls) as response:
            return response.status, response.headers, json.loads(response.read() or b'null')
    except HTTPError as error:
        return error.code, error.headers, json.loads(error.read())


try:
    for name in ['roc-startup-week-api', 'roc-startup-week-reminder-sender']:
        config = lambda_client.get_function_configuration(FunctionName=name)
        assert config['Environment']['Variables']['SENDING_ENABLED'] == 'false', 'Smoke tests require sending disabled'
    status, headers, events = request('/events', headers={'origin': 'https://rocstartupweek.com'})
    assert status == 200 and len(events) == 18
    assert sum(event['headliner'] for event in events) == 8
    assert headers['access-control-allow-origin'] == 'https://rocstartupweek.com'
    status, _, _ = request('/reminders', {'email': email, 'eventIds': [events[0]['id']], 'consent': False})
    assert status == 400
    status, _, _ = request('/reminders', {'email': email, 'eventIds': [events[0]['id']], 'consent': True})
    assert status == 202, status
    subscriber = table.get_item(Key={'pk': subkey}, ConsistentRead=True)['Item']
    assert subscriber['active'] and events[0]['id'] in subscriber['selections']
    token = subscriber['unsubscribeToken']
    cleanup.append('TOKEN#' + hashlib.sha256(token.encode()).hexdigest())
    status, _, _ = request('/reminders/unsubscribe', {'token': token})
    assert status == 200
    assert table.get_item(Key={'pk': subkey}, ConsistentRead=True)['Item']['active'] is False
    request('/reminders', {'email': email, 'eventIds': [events[0]['id']], 'consent': True})
    assert table.get_item(Key={'pk': subkey}, ConsistentRead=True)['Item']['active'] is False
    response = lambda_client.invoke(FunctionName='roc-startup-week-reminder-sender', Payload=b'{}')
    assert 'FunctionError' not in response
    assert json.loads(response['Payload'].read()) == {'enabled': False}
    print('PASS: deployed catalog, CORS, checkbox-only activation, DynamoDB transaction, unsubscribe, no silent reactivation, disabled sender.')
finally:
    for key in cleanup:
        table.delete_item(Key={'pk': key})
    table.delete_item(Key={'pk': f'RATE#{hashlib.sha256(("email:" + email).encode()).hexdigest()}#{int(time.time()) // 3600}'})
