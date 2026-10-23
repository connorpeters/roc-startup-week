import copy
import importlib.util
import os
import sys
from pathlib import Path
import unittest
from unittest.mock import Mock, patch
import json

os.environ.update(TABLE_NAME='roc-startup-week-test', AWS_DEFAULT_REGION='us-east-1',
    AWS_ACCESS_KEY_ID='testing', AWS_SECRET_ACCESS_KEY='testing', AWS_EC2_METADATA_DISABLED='true',
    EVENTS_FILE=str(Path('backend/reminders/build/events.json').resolve()), FEEDBACK_TOPIC='test-topic',
    SCHEDULE_FILE=str(Path('backend/reminders/build/schedule.json').resolve()),
    SENDING_ENABLED='true', FROM_EMAIL='reminders@remind.rocstartupweek.com', CONFIGURATION_SET='roc-startup-week-reminders')
sys.path.insert(0, str(Path('backend/reminders').resolve()))
spec = importlib.util.spec_from_file_location('app', 'backend/reminders/app.py')
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)
from boto3.dynamodb.types import TypeDeserializer
from botocore.exceptions import ClientError


class MemoryTable:
    name = 'roc-startup-week-test'

    def __init__(self):
        self.rows = {}

    def get_item(self, Key, **kwargs):
        row = self.rows.get(Key['pk'])
        return {'Item': copy.deepcopy(row)} if row else {}

    def put_item(self, Item, **kwargs):
        self.rows[Item['pk']] = copy.deepcopy(Item)

    def update_item(self, Key, UpdateExpression, ExpressionAttributeValues, **kwargs):
        row = self.rows.setdefault(Key['pk'], {'pk': Key['pk']})
        v = ExpressionAttributeValues
        if kwargs.get('ConditionExpression') and ':lease' in v and ('sentAt' in row or row.get('leaseUntil', 0) >= v[':now'] or row.get('attempts', 0) >= v[':maximum']):
            raise ClientError({'Error': {'Code': 'ConditionalCheckFailedException'}}, 'UpdateItem')
        if ':limit' in v and row.get('hits', 0) >= v[':limit']:
            raise ClientError({'Error': {'Code': 'ConditionalCheckFailedException'}}, 'UpdateItem')
        if ':one' in v and 'hits' in UpdateExpression:
            row['hits'] = row.get('hits', 0) + v[':one']
        if ':off' in v:
            row.update(active=False, revision=row.get('revision', 0) + 1)
        if ':lease' in v:
            row['leaseUntil'] = v[':lease']
            row['attempts'] = row.get('attempts', 0) + v[':one']
        if 'sentAt' in UpdateExpression:
            row['sentAt'] = v[':now']
        return {'Attributes': copy.deepcopy(row)}

    def scan(self, **kwargs):
        return {'Items': [copy.deepcopy(v) for k, v in self.rows.items() if k.startswith('SUB#') and v.get('active')]}


class ReminderTests(unittest.TestCase):
    def setUp(self):
        self.table = MemoryTable()
        self.now = int(app.datetime.fromisoformat('2026-11-01T17:00:00-05:00').timestamp())
        self.events = {key: dict(id=key, title=key, startsAt=f'2026-11-02T{hour}:00:00-05:00',
            date='Nov 2', time=f'{hour}:00', location='Rochester', url='https://example.com', headliner=headliner)
            for key, hour, headliner in [('event-one', '09', False), ('headliner-one', '11', True), ('headliner-two', '17', True)]}
        for p in [patch.object(app, 'TABLE', self.table), patch.object(app, 'SES', Mock()), patch.object(app, 'DDB', Mock()),
                  patch.object(app, 'EVENTS', self.events), patch.object(app.time, 'sleep'), patch.object(app.time, 'time', return_value=self.now)]:
            p.start()
            self.addCleanup(p.stop)

    def signup(self, **changes):
        data = dict(email='Person@example.com', eventIds=['event-one'], consent=True)
        data.update(changes)
        return app.signup(data, '127.0.0.1')

    def subscribe(self, active=True):
        key = 'SUB#' + app.digest('person@example.com')
        self.table.rows[key] = dict(pk=key, email='person@example.com', active=active,
            subscribedAt=self.now, selections={'event-one': self.now}, unsubscribeToken='abc', revision=1)
        return key

    def at(self, iso):
        return patch.object(app.time, 'time', return_value=int(app.datetime.fromisoformat(iso).timestamp()))

    def test_signup_requires_checkbox_and_valid_upcoming_events(self):
        for changes in [{'consent': False}, {'eventIds': None}, {'eventIds': ['unknown']}, {'email': 'invalid'}, {'eventIds': [{}]}]:
            self.assertEqual(self.signup(**changes)['statusCode'], 400)
        app.DDB.transact_write_items.assert_not_called()

    def test_signup_activates_immediately_without_email_confirmation(self):
        self.assertEqual(self.signup()['statusCode'], 202)
        operations = app.DDB.transact_write_items.call_args.kwargs['TransactItems']
        self.assertEqual(len(operations), 3)
        decode = TypeDeserializer().deserialize
        sub = {k: decode(v) for k, v in operations[1]['Put']['Item'].items()}
        self.assertTrue(sub['active'])
        self.assertEqual(sub['email'], 'person@example.com')
        self.assertEqual(sub['selections'], {'event-one': self.now})
        self.assertIn('consentAt', sub)
        app.SES.send_email.assert_not_called()

    def test_signup_accepts_while_sender_awaits_dns(self):
        with patch.dict(os.environ, SENDING_ENABLED='false'):
            self.assertEqual(self.signup()['statusCode'], 202)
            self.assertEqual(app.sender({}, None), {'enabled': False})
        app.SES.send_email.assert_not_called()

    def test_general_signup_needs_only_email_and_consent(self):
        result = app.signup({'email': 'person@example.com', 'consent': True}, '127.0.0.1')
        self.assertEqual(result['statusCode'], 202)
        operations = app.DDB.transact_write_items.call_args.kwargs['TransactItems']
        decode = TypeDeserializer().deserialize
        subscriber = {k: decode(v) for k, v in operations[1]['Put']['Item'].items()}
        self.assertEqual(set(subscriber['selections']), set(self.events))
        self.assertTrue(subscriber['active'])
        notifications = list(app.notifications(subscriber))
        self.assertEqual([n[0] for n in notifications], ['itinerary', 'headliners'])

    def test_rate_limit_and_no_silent_resubscribe(self):
        for _ in range(4):
            self.assertEqual(self.signup()['statusCode'], 202)
        self.assertEqual(app.DDB.transact_write_items.call_count, 3)
        app.DDB.reset_mock()
        self.subscribe(active=False)
        self.signup()
        app.DDB.transact_write_items.assert_not_called()

    def test_unsubscribe_and_invalid_tokens(self):
        key = self.subscribe()
        token = 'a' * 43
        self.table.rows['TOKEN#' + app.digest(token)] = dict(kind='unsubscribe', expiresAt=self.now + 100, email='person@example.com')
        self.assertEqual(app.unsubscribe({'token': token})['statusCode'], 200)
        self.assertFalse(self.table.rows[key]['active'])
        self.assertEqual(app.unsubscribe({'token': 'unknown'})['statusCode'], 400)
        self.table.rows['TOKEN#' + app.digest(token)]['expiresAt'] = self.now - 1
        self.assertEqual(app.unsubscribe({'token': token})['statusCode'], 400)

    def test_evening_digest_bundles_selected_events_and_deduplicates(self):
        key = self.subscribe()
        self.table.rows[key]['selections']['headliner-two'] = self.now
        with self.at('2026-11-01T18:00:00-05:00'):
            app.sender({}, None)
            app.sender({}, None)
        self.assertEqual(app.SES.send_email.call_count, 1)
        body = app.SES.send_email.call_args.kwargs['Content']['Simple']['Body']['Text']['Data']
        self.assertIn('event-one', body)
        self.assertIn('headliner-two', body)
        self.assertNotIn('headliner-one', body)

    def test_morning_roundup_includes_all_headliners_for_all_opted_in(self):
        self.subscribe()
        with self.at('2026-11-02T08:00:00-05:00'):
            app.sender({}, None)
            app.sender({}, None)
        # Only one headliner email; no late evening catch-up or per-event sends.
        self.assertEqual(app.SES.send_email.call_count, 1)
        body = app.SES.send_email.call_args.kwargs['Content']['Simple']['Body']['Text']['Data']
        self.assertIn('headliner-one', body)
        self.assertIn('headliner-two', body)

    def test_late_signup_has_no_retroactive_notifications(self):
        key = self.subscribe()
        late = int(app.datetime.fromisoformat('2026-11-02T08:01:00-05:00').timestamp())
        self.table.rows[key].update(subscribedAt=late, selections={'event-one': late})
        with self.at('2026-11-02T08:02:00-05:00'):
            app.sender({}, None)
        app.SES.send_email.assert_not_called()

    def test_no_notifications_after_events_start(self):
        self.subscribe()
        with self.at('2026-11-02T12:00:00-05:00'):
            app.sender({}, None)
        app.SES.send_email.assert_not_called()

    def test_administrative_preview_sends_two_samples_and_honors_unsubscribe(self):
        key = self.subscribe()
        app.SES.send_email.return_value = {'MessageId': 'test-message'}
        result = app.sender({'action': 'send-test', 'email': 'person@example.com', 'day': '2026-11-02'}, None)
        self.assertEqual(result['sent'], 2)
        self.assertTrue(all(call.kwargs['Content']['Simple']['Subject']['Data'].startswith('[TEST]') for call in app.SES.send_email.call_args_list))
        self.table.rows[key]['active'] = False
        result = app.sender({'action': 'send-test', 'email': 'person@example.com', 'day': '2026-11-02'}, None)
        self.assertEqual(result['sent'], 0)
        self.assertEqual(app.SES.send_email.call_count, 2)

    def test_html_email_contains_matching_inline_logo_and_text_fallback(self):
        key = self.subscribe()
        app.send_digest(self.table.rows[key], 'itinerary', list(self.events.values()))
        message = app.SES.send_email.call_args.kwargs['Content']['Simple']
        self.assertIn('Html', message['Body'])
        self.assertIn('Text', message['Body'])
        attachment = message['Attachments'][0]
        self.assertEqual(attachment['ContentDisposition'], 'INLINE')
        self.assertEqual(attachment['ContentTransferEncoding'], 'BASE64')
        self.assertTrue(attachment['RawContent'].startswith(b'\x89PNG'))
        html = message['Body']['Html']['Data']
        self.assertIn('cid:' + attachment['ContentId'], html)
        self.assertNotIn('src="https:', html)
        self.assertIn('#f7f4f0', html)
        self.assertIn('#ed1c24', html)
        self.assertIn('HEADLINER', html)
        self.assertIn('border-radius:2px', html)
        self.assertIn('Unsubscribe from all notifications', html)
        self.assertLess(len(html.encode()), 90000)
        from botocore.validate import validate_parameters
        model = app.boto3.client('sesv2').meta.service_model.operation_model('SendEmail').input_shape
        validate_parameters(app.SES.send_email.call_args.kwargs, model)

    def test_email_template_escapes_content_and_rejects_non_https_links(self):
        bad = dict(self.events['event-one'], title='<script>alert(1)</script>', location='A & B', url='javascript:alert(1)')
        html = app.render_email('itinerary', [bad], 'https://example.com/#unsubscribe=token')
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
        self.assertIn('A &amp; B', html)
        self.assertNotIn('javascript:', html)

    def test_retry_waits_for_lease(self):
        self.subscribe()
        app.SES.send_email.side_effect = RuntimeError('temporary')
        with self.at('2026-11-01T18:00:00-05:00'):
            with self.assertRaises(RuntimeError):
                app.sender({}, None)
            app.sender({}, None)
        app.SES.send_email.side_effect = None
        with self.at('2026-11-01T18:06:00-05:00'):
            app.sender({}, None)
        self.assertEqual(app.SES.send_email.call_count, 2)

    def test_feedback_suppresses_and_validates_source(self):
        key = self.subscribe()
        message = {'eventType': 'Complaint', 'complaint': {'complainedRecipients': [{'emailAddress': 'person@example.com'}]}}
        record = {'EventSource': 'aws:sns', 'Sns': {'TopicArn': 'test-topic', 'Message': json.dumps(message)}}
        app.feedback({'Records': [record]})
        self.assertFalse(self.table.rows[key]['active'])
        self.assertIn('BLOCK#' + app.digest('person@example.com'), self.table.rows)
        self.signup()
        app.DDB.transact_write_items.assert_not_called()
        record['Sns']['TopicArn'] = 'other-topic'
        with self.assertRaises(ValueError):
            app.feedback({'Records': [record]})

    def test_api_rejects_malformed_body_and_has_no_confirmation_route(self):
        event = {'rawPath': '/reminders', 'requestContext': {'http': {'method': 'POST', 'sourceIp': '127.0.0.1'}}}
        for body in ['{', '[]', 'null']:
            self.assertEqual(app.api(dict(event, body=body), None)['statusCode'], 400)
        self.assertEqual(app.api(dict(event, rawPath='/reminders/confirm'), None)['statusCode'], 404)

    def test_first_signup_sends_full_schedule_once_and_duplicate_does_not_resend(self):
        decode = TypeDeserializer().deserialize
        def commit(TransactItems):
            for operation in TransactItems:
                if 'Put' in operation:
                    item = {k: decode(v) for k, v in operation['Put']['Item'].items()}
                    self.table.put_item(Item=item)
        app.DDB.transact_write_items.side_effect = commit
        self.assertEqual(self.signup()['statusCode'], 202)
        self.assertEqual(app.SES.send_email.call_count, 1)
        message = app.SES.send_email.call_args.kwargs['Content']['Simple']
        self.assertIn('signed up', message['Subject']['Data'])
        html = message['Body']['Html']['Data']
        text = message['Body']['Text']['Data']
        for entry in app.SCHEDULE:
            self.assertIn(entry['title'], text)
        self.assertIn('After the competition', text)
        self.assertIn('Time TBD', text)
        self.assertIn(app.PDF_URL, html)
        self.assertIn(app.PDF_URL, text)
        self.assertIn('After Startup Week', html)
        self.assertLess(len(html.encode()), 90000)
        self.assertEqual(self.signup()['statusCode'], 202)
        app.sender({}, None)
        self.assertEqual(app.SES.send_email.call_count, 1)

    def test_welcome_stops_after_three_attempts(self):
        key = self.subscribe()
        self.table.rows[key]['welcomeRequestedAt'] = self.now
        app.SES.send_email.side_effect = RuntimeError('temporary')
        for offset in (0, 301, 602):
            with patch.object(app.time, 'time', return_value=self.now + offset):
                self.assertFalse(app.deliver_welcome(self.table.rows[key]))
        with patch.object(app.time, 'time', return_value=self.now + 903):
            self.assertTrue(app.deliver_welcome(self.table.rows[key]))
        self.assertEqual(app.SES.send_email.call_count, 3)

    def test_daily_budget_blocks_all_email_types_and_resets_next_day(self):
        with patch.dict(os.environ, DAILY_SEND_LIMIT='1'):
            app.send('person@example.com', 'test', 'test')
            with self.assertRaisesRegex(RuntimeError, 'daily email limit'):
                app.send('other@example.com', 'test', 'test')
            self.assertEqual(app.SES.send_email.call_count, 1)
            with patch.object(app.time, 'time', return_value=self.now + 86400):
                app.send('person@example.com', 'test', 'test')
        self.assertEqual(app.SES.send_email.call_count, 2)

    def test_welcome_respects_unsubscribe_and_expiry(self):
        key = self.subscribe(active=False)
        self.table.rows[key]['welcomeRequestedAt'] = self.now
        self.assertTrue(app.deliver_welcome(self.table.rows[key]))
        self.table.rows[key]['active'] = True
        with patch.object(app.time, 'time', return_value=self.now + 3600):
            self.assertTrue(app.deliver_welcome(self.table.rows[key]))
        app.SES.send_email.assert_not_called()


if __name__ == '__main__':
    unittest.main()
