"""Roc Startup Week reminders. AWS SDK is supplied by the Lambda Python runtime."""
import base64
import hashlib
import json
import os
import re
import secrets
import time
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.types import TypeSerializer
from email_template import LOGO, LOGO_CID, render_email, render_welcome

TABLE = boto3.resource('dynamodb').Table(os.environ['TABLE_NAME'])
SES = boto3.client('sesv2')
DDB = boto3.client('dynamodb')
SERIALIZER = TypeSerializer()
EVENTS = {e['id']: e for e in json.loads(Path(os.environ.get('EVENTS_FILE', Path(__file__).with_name('events.json'))).read_text())}
SCHEDULE = json.loads(Path(os.environ.get('SCHEDULE_FILE', Path(__file__).with_name('schedule.json'))).read_text())
SITE = 'https://rocstartupweek.com'
PDF_URL = SITE + '/assets/pdf/roc-startup-week-full-schedule.pdf'
EXPIRY = int(max(datetime.fromisoformat(e['startsAt']).timestamp() for e in EVENTS.values())) + 90 * 86400
ZONE = ZoneInfo('America/New_York')


def digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def get(key):
    return TABLE.get_item(Key={'pk': key}, ConsistentRead=True).get('Item')


def put(item, **kwargs):
    TABLE.put_item(Item=item, **kwargs)


def conditional(error):
    return error.response['Error']['Code'] == 'ConditionalCheckFailedException'


def reply(code, message):
    return {'statusCode': code, 'headers': {'content-type': 'application/json', 'cache-control': 'no-store'}, 'body': json.dumps(message)}


def rate_limit(key, limit, seconds=3600):
    now = int(time.time())
    result = TABLE.update_item(Key={'pk': f'RATE#{digest(key)}#{now // seconds}'},
        UpdateExpression='SET expiresAt = :expiry ADD hits :one',
        ExpressionAttributeValues={':expiry': now + seconds * 2, ':one': 1}, ReturnValues='UPDATED_NEW')
    return result['Attributes']['hits'] <= limit


def send(email, subject, text, html=None):
    if os.environ.get('SENDING_ENABLED') != 'true':
        raise RuntimeError('Email sending is awaiting sender verification')
    now = int(time.time())
    day = datetime.fromtimestamp(now, ZONE).date().isoformat()
    try:
        TABLE.update_item(Key={'pk': 'BUDGET#' + day},
            UpdateExpression='SET expiresAt = :expiry ADD hits :one',
            ConditionExpression='attribute_not_exists(hits) OR hits < :limit',
            ExpressionAttributeValues={':expiry': now + 3 * 86400, ':one': 1, ':limit': int(os.environ.get('DAILY_SEND_LIMIT', '1000'))})
    except ClientError as error:
        if conditional(error):
            raise RuntimeError('Roc Startup Week daily email limit reached') from None
        raise
    message = {'Subject': {'Data': subject, 'Charset': 'UTF-8'}, 'Body': {'Text': {'Data': text, 'Charset': 'UTF-8'}}}
    if html:
        message['Body']['Html'] = {'Data': html, 'Charset': 'UTF-8'}
        message['Attachments'] = [{'RawContent': LOGO, 'FileName': 'roc-startup-week.png',
            'ContentDisposition': 'INLINE', 'ContentId': LOGO_CID,
            'ContentTransferEncoding': 'BASE64', 'ContentType': 'image/png'}]
    return SES.send_email(FromEmailAddress=os.environ['FROM_EMAIL'], Destination={'ToAddresses': [email]},
        ConfigurationSetName=os.environ['CONFIGURATION_SET'],
        Content={'Simple': message})


def signup(data, ip):
    if not rate_limit('ip:' + ip, 20):
        return reply(429, {'message': 'Please try again later.'})
    email = str(data.get('email', '')).strip().lower()
    now = int(time.time())
    ids = data.get('eventIds', [event_id for event_id, details in EVENTS.items()
        if datetime.fromisoformat(details['startsAt']).timestamp() > now])
    if (not re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+', email) or len(email) > 254
            or data.get('consent') is not True or not isinstance(ids, list) or not 0 <= len(ids) <= len(EVENTS)
            or any(not isinstance(i, str) or i not in EVENTS or datetime.fromisoformat(EVENTS[i]['startsAt']).timestamp() <= now for i in ids)):
        return reply(400, {'message': 'Enter a valid email, agree to receive notifications, and select only upcoming events.'})
    # Generic response avoids disclosing subscriber or suppression status.
    result = reply(202, {'message': 'You’re signed up for Roc Startup Week notifications.'})
    if get('BLOCK#' + digest(email)) or not rate_limit('email:' + email, 3):
        return result
    subkey = 'SUB#' + digest(email)
    sub = get(subkey) or {}
    # Public signup cannot silently reactivate an unsubscribed address.
    if sub and not sub.get('active'):
        return result
    unsub = sub.get('unsubscribeToken') or secrets.token_urlsafe(32)
    selections = dict(sub.get('selections', {}))
    for event_id in ids:
        selections.setdefault(event_id, now)
    subscriber = {'pk': subkey, 'email': email, 'active': True, 'selections': selections,
         'unsubscribeToken': unsub, 'subscribedAt': sub.get('subscribedAt', now), 'consentAt': now, 'consentVersion': '2026-10-23-single-opt-in',
         'expiresAt': EXPIRY, 'revision': sub.get('revision', 0) + 1}
    if not sub or 'welcomeRequestedAt' in sub:
        subscriber['welcomeRequestedAt'] = sub.get('welcomeRequestedAt', now)
    encode = lambda item: {k: SERIALIZER.serialize(v) for k, v in item.items()}
    condition = {'ConditionExpression': 'attribute_not_exists(pk)'} if not sub else {
        'ConditionExpression': 'revision = :revision', 'ExpressionAttributeValues': encode({':revision': sub.get('revision', 0)})}
    try:
        DDB.transact_write_items(TransactItems=[
            {'ConditionCheck': {'TableName': TABLE.name, 'Key': encode({'pk': 'BLOCK#' + digest(email)}), 'ConditionExpression': 'attribute_not_exists(pk)'}},
            {'Put': {'TableName': TABLE.name, 'Item': encode(subscriber), **condition}},
            {'Put': {'TableName': TABLE.name, 'Item': encode({'pk': 'TOKEN#' + digest(unsub), 'kind': 'unsubscribe', 'email': email, 'expiresAt': EXPIRY})}}
        ])
    except ClientError as error:
        if error.response['Error']['Code'] == 'TransactionCanceledException':
            return reply(409, {'message': 'Your preferences changed. Please try again.'})
        raise
    deliver_welcome(subscriber)
    return result


def unsubscribe(data):
    token = data.get('token', '')
    if not isinstance(token, str) or not 32 <= len(token) <= 128:
        return reply(400, {'message': 'Invalid or expired link.'})
    record = get('TOKEN#' + digest(token))
    if not record or record['kind'] != 'unsubscribe' or record['expiresAt'] <= int(time.time()):
        return reply(400, {'message': 'Invalid or expired link.'})
    TABLE.update_item(Key={'pk': 'SUB#' + digest(record['email'])}, UpdateExpression='SET active = :off ADD revision :one', ExpressionAttributeValues={':off': False, ':one': 1})
    return reply(200, {'message': 'You have unsubscribed from all Roc Startup Week reminders.'})


def feedback(event):
    for record in event['Records']:
        if record.get('EventSource') != 'aws:sns' or record['Sns']['TopicArn'] != os.environ['FEEDBACK_TOPIC']:
            raise ValueError('Unexpected feedback source')
        message = json.loads(record['Sns']['Message'])
        kind = message.get('eventType', message.get('notificationType'))
        if kind == 'Bounce' and message.get('bounce', {}).get('bounceType') == 'Permanent':
            recipients = message['bounce']['bouncedRecipients']
        elif kind == 'Complaint':
            recipients = message['complaint']['complainedRecipients']
        else:
            continue
        for recipient in recipients:
            email = recipient['emailAddress'].strip().lower()
            put({'pk': 'BLOCK#' + digest(email), 'reason': kind, 'expiresAt': EXPIRY})
            TABLE.update_item(Key={'pk': 'SUB#' + digest(email)}, UpdateExpression='SET active = :off ADD revision :one', ExpressionAttributeValues={':off': False, ':one': 1})


def api(event, context):
    if 'Records' in event:
        feedback(event)
        return
    try:
        method = event.get('requestContext', {}).get('http', {}).get('method')
        path = event.get('rawPath', '')
        if method == 'GET' and path == '/events':
            return reply(200, list(EVENTS.values()))
        if method != 'POST' or path not in ['/reminders', '/reminders/unsubscribe']:
            return reply(404, {'message': 'Not found.'})
        body = event.get('body') or '{}'
        if event.get('isBase64Encoded'):
            body = base64.b64decode(body).decode()
        if len(body) > 8192:
            return reply(413, {'message': 'Request is too large.'})
        data = json.loads(body)
        if not isinstance(data, dict):
            return reply(400, {'message': 'Invalid request.'})
        if path == '/reminders':
            return signup(data, event['requestContext']['http']['sourceIp'])
        return unsubscribe(data)
    except (ValueError, UnicodeError):
        return reply(400, {'message': 'Invalid request.'})
    except Exception:
        # CloudWatch gets an error class, never subscriber data or request bodies.
        print('Reminder API request failed')
        return reply(503, {'message': 'Reminders are temporarily unavailable. Please try again.'})


def sender(event, context):
    if os.environ.get('SENDING_ENABLED') != 'true':
        return {'enabled': False}
    # Administrative preview: this function has no HTTP route/function URL.
    # Only IAM-authorized Lambda invocations can request a test send.
    if event.get('action') == 'send-test':
        return send_test(event)
    now = int(time.time())
    cursor = None
    failures = 0
    while True:
        args = {'FilterExpression': 'begins_with(pk, :prefix) AND active = :active',
                'ExpressionAttributeValues': {':prefix': 'SUB#', ':active': True}}
        if cursor:
            args['ExclusiveStartKey'] = cursor
        page = TABLE.scan(**args)
        for subscriber in page['Items']:
            if not deliver_welcome(subscriber):
                failures += 1
            for category, day, details, due, deadline in notifications(subscriber):
                    if not due <= now < deadline:
                        continue
                    key = f'DELIVERY#{subscriber["pk"]}#{category}#{day}'
                    if not claim_delivery(key, now):
                        continue
                    # Recheck state immediately before sending, including recent unsubscribes.
                    current = get(subscriber['pk'])
                    if not current or not current.get('active') or get('BLOCK#' + digest(subscriber['email'])):
                        continue
                    try:
                        send_digest(subscriber, category, details)
                        TABLE.update_item(Key={'pk': key}, UpdateExpression='SET sentAt = :now', ExpressionAttributeValues={':now': now})
                        time.sleep(0.1)  # Remain below the account's SES send rate.
                    except Exception:
                        failures += 1
                        print('Reminder delivery failed; retry after lease expires')
        cursor = page.get('LastEvaluatedKey')
        if not cursor:
            break
    if failures:
        raise RuntimeError(f'{failures} reminder deliveries failed')
    return {'enabled': True}


def claim_delivery(key, now):
    try:
        TABLE.update_item(Key={'pk': key}, UpdateExpression='SET leaseUntil = :lease, expiresAt = :expiry ADD attempts :one',
            ConditionExpression='attribute_not_exists(sentAt) AND (attribute_not_exists(leaseUntil) OR leaseUntil < :now) AND (attribute_not_exists(attempts) OR attempts < :maximum)',
            ExpressionAttributeValues={':lease': now + 300, ':expiry': EXPIRY, ':now': now, ':one': 1, ':maximum': 3})
        return True
    except ClientError as error:
        if conditional(error):
            return False
        raise


def deliver_welcome(subscriber):
    now = int(time.time())
    if (os.environ.get('SENDING_ENABLED') != 'true' or 'welcomeRequestedAt' not in subscriber
            or now >= int(subscriber['welcomeRequestedAt']) + 3600):
        return True
    key = 'DELIVERY#' + subscriber['pk'] + '#welcome'
    current = get(subscriber['pk'])
    if not current or not current.get('active') or get('BLOCK#' + digest(subscriber['email'])):
        return True
    if not claim_delivery(key, now):
        return True
    try:
        unsubscribe_url = f'{SITE}/reminders.html#unsubscribe={subscriber["unsubscribeToken"]}'
        lines = ['You’re signed up for Roc Startup Week notifications.', '', 'Full schedule (Rochester time):']
        previous_day = None
        for entry in SCHEDULE:
            group = (entry['additional'], entry['dayLabel'])
            if group != previous_day:
                lines += ['', ('After Startup Week — ' if entry['additional'] else '') + entry['dayLabel']]
                previous_day = group
            lines += [f'{entry["time"]} — {entry["title"]}', entry['location']]
            extra = ' · '.join(v for v in [entry.get('cost'), entry.get('registration')] if v)
            if extra:
                lines.append(extra)
        lines += ['', 'Latest schedule PDF: ' + PDF_URL, '', 'Unsubscribe: ' + unsubscribe_url]
        send(subscriber['email'], 'You’re signed up — Roc Startup Week schedule', '\n'.join(lines),
             html=render_welcome(SCHEDULE, PDF_URL, unsubscribe_url))
        TABLE.update_item(Key={'pk': key}, UpdateExpression='SET sentAt = :now', ExpressionAttributeValues={':now': now})
        return True
    except Exception:
        print('Welcome delivery failed; bounded retry will run in the sender')
        return False


def send_digest(subscriber, category, events, testing=False):
    heading = 'Tomorrow at Roc Startup Week' if category == 'itinerary' else 'Today’s Roc Startup Week headliners'
    subject = ('[TEST] ' if testing else '') + heading
    note = 'Sample notification using the published event schedule. This is a test.\n\n' if testing else ''
    unsubscribe_url = f'{SITE}/reminders.html#unsubscribe={subscriber["unsubscribeToken"]}'
    html = render_email(category, events, unsubscribe_url, testing=testing)
    return send(subscriber['email'], subject,
                f'{note}{heading}\n\n{itinerary(events)}\n\n'
                'All times are Rochester time. Organizer registration is separate.\n\n'
                f'Unsubscribe from all reminders: {unsubscribe_url}', html=html)


def send_test(event):
    email = str(event.get('email', '')).strip().lower()
    subscriber = get('SUB#' + digest(email))
    if not subscriber or not subscriber.get('active') or get('BLOCK#' + digest(email)):
        return {'sent': 0, 'reason': 'No active subscription'}
    day = datetime.fromisoformat(event['day']).date()
    events = [e for e in EVENTS.values() if datetime.fromisoformat(e['startsAt']).astimezone(ZONE).date() == day]
    messages = []
    for category, details in [('itinerary', [e for e in events if e['id'] in subscriber['selections']]),
                              ('headliners', [e for e in events if e.get('headliner')])]:
        if details:
            response = send_digest(subscriber, category, details, testing=True)
            messages.append({'category': category, 'messageId': response['MessageId']})
    return {'sent': len(messages), 'messages': messages}


def itinerary(events):
    return '\n\n'.join(f'{details["title"]}\n' + (details['description'] + '\n' if details.get('description') else '') + f'{details["date"]}, {details["time"]} (America/New_York)\n'
                       f'{details["location"]}\nEvent information and organizer registration: {details["url"]}'
                       for details in sorted(events, key=lambda e: e['startsAt']))


def notifications(subscriber):
    """At most one prior-evening itinerary and one same-day headliner roundup."""
    groups = {}
    for details in EVENTS.values():
        start = datetime.fromisoformat(details['startsAt']).astimezone(ZONE)
        groups.setdefault(start.date(), []).append(details)
    for day, events in groups.items():
        midnight = datetime(day.year, day.month, day.day, tzinfo=ZONE)
        evening_due = int((midnight - timedelta(hours=6)).timestamp())
        selected = [e for e in events if e['id'] in subscriber.get('selections', {})
                    and int(subscriber['selections'][e['id']]) <= evening_due]
        if selected:
            deadline = min(evening_due + 3600, min(int(datetime.fromisoformat(e['startsAt']).timestamp()) for e in selected))
            yield 'itinerary', day.isoformat(), selected, evening_due, deadline
        morning_due = int((midnight + timedelta(hours=8)).timestamp())
        headliners = [e for e in events if e.get('headliner')]
        if os.environ.get('HEADLINER_AUDIENCE', 'all') == 'selected':
            headliners = [e for e in headliners if e['id'] in subscriber.get('selections', {})
                          and int(subscriber['selections'][e['id']]) <= morning_due]
        if headliners and int(subscriber.get('subscribedAt', morning_due + 1)) <= morning_due:
            deadline = min(morning_due + 3600, min(int(datetime.fromisoformat(e['startsAt']).timestamp()) for e in headliners))
            yield 'headliners', day.isoformat(), headliners, morning_due, deadline
