# Roc Startup Week AWS reminders

The implementation plan is in [PLAN.md](PLAN.md). The static website remains on Cloudflare; AWS owns all subscriber data and email delivery. All new AWS names begin with `roc-startup-week-`. No Locke or UVC resources are changed.

## Behavior

- Email + an unchecked-by-default consent checkbox activates immediately. Embedded hero/footer forms need no event selection: omitting `eventIds` selects every upcoming timed event, enabling the welcome schedule, nightly event itineraries, and morning headliner roundups. The detailed form supports individual selections. No confirmation email or approval click.
- First registration sends one branded welcome email containing the full simple schedule (including unknown-time and after-week events) and the stable latest-PDF link. Duplicate submissions never reset its delivery record. Welcome delivery retries at most three times within one hour.
- At 6 p.m. Rochester time, send one combined itinerary for tomorrow's selected events.
- At 8 a.m. Rochester time, send one roundup of all today's headliners to every active subscriber, regardless of selections.
- Maximum two scheduled emails per calendar day. One delivery record per subscriber/day/category prevents per-event floods and concurrent duplication. A crash after SES accepts a message but before the delivery record commits can still result in a duplicate on retry (SES does not provide an idempotency key).
- A dedicated atomic daily budget caps this service at 1,000 SES send attempts per Rochester calendar day across welcome emails, reminders, and administrative previews. Failed attempts consume budget too. Each delivery record permits at most three attempts, with five-minute leases. Existing per-IP/per-email signup limits remain in force.
- No missed-send catch-up for late signups. Temporary delivery failures retry within a one-hour window, then expire.
- Every email has an unsubscribe link. The link opens a page with an explicit unsubscribe button, avoiding accidental action by email link scanners. It stops both kinds of email. Public signup never reactivates an unsubscribed address; a future reactivation flow would require separate work.
- Permanent bounces and complaints suppress an address through SES → dedicated SNS topic → restricted Lambda invocation. There is no public feedback endpoint.
- No accounts, passwords, contact export endpoint, tracking pixels, or promotional emails beyond the consented headliner roundups.
- The sender uses branded HTML emails with a plain text fallback. The approved logo is embedded as a CID inline PNG attachment, base64-encoded inside the message, with no external image fetch. Email-safe tables and inline styles preserve layout; brand fonts use system fallbacks in clients that block web fonts. Itinerary links point to event organizers. Notification signup does not register attendees with those organizers.

## Registration analysis

Open the [DynamoDB console](https://us-east-1.console.aws.amazon.com/dynamodbv2/home?region=us-east-1), choose **Explore items**, select `roc-startup-week-reminders`, and filter `pk` with **begins with** `SUB#`. These records include email, active status, signup/consent timestamps, and selected event IDs. Other row prefixes hold rate limits, delivery state, and unsubscribe tokens; they are not subscriber records. There is no public subscriber-list endpoint or analytics dashboard. These are email subscriptions, not verified event attendance or organizer registrations.

## API endpoints

| Method/path | Request |
| --- | --- |
| `GET /events` | Current event catalog, generated from `collateral/data.mjs` |
| `POST /reminders` | `{ "email": "person@example.com", "consent": true }`, optionally with `"eventIds": ["event-id"]` |
| `POST /reminders/unsubscribe` | `{ "token": "opaque-email-link-token" }` |

Signup is additive. It normalizes addresses, requires checkbox consent, rejects unknown/past events, limits requests by hashed IP/email, and uses a transaction with revision checks. Generic success responses do not disclose address status. Gateway throttling and Lambda concurrency limits apply too. CORS allows only the production and development website origins; CORS itself is not an authentication mechanism.

## Build and tests

```sh
node scripts/build-reminder-events.mjs
python3 -m venv backend/reminders/build/venv
backend/reminders/build/venv/bin/pip install -r backend/reminders/requirements-dev.txt
backend/reminders/build/venv/bin/python -m unittest discover -s tests/reminders -v
node tests/reminders/page.test.cjs
npm run check
```

The Lambda runtime includes boto3. There are no bundled runtime dependencies. Local Python tests need boto3. Python 3.13 is used in AWS. The event catalog supports the current November/December 2026 dates, validates Eastern standard time against America/New_York, and omits unknown start times. Extend the date conversion before reusing it for another year or dates before the DST transition.

## Deployment

```sh
python3 backend/reminders/deploy.py
```

Uses the current AWS CLI profile and configured region (`us-east-1` in this deployment). Creates a dedicated private deployment bucket and CloudFormation stack `roc-startup-week-reminders`. The stack includes two Lambdas, IAM, an HTTP API, DynamoDB with PITR/TTL, SES identity/configuration set, SNS feedback, EventBridge schedule, and CloudWatch error alarms. Logs retain 30 days; subscriber/token/delivery records expire 90 days after the last event. The table is retained if the stack is deleted. Alarms are visible in CloudWatch; no external notification subscription is installed.

After deployment, `reminders-config.json` receives the API URL. Rebuild the website with `npm run build:site`. AWS deployment does not publish the website. The production website requires explicit user authorization.

By default, sending is disabled; signups may still be saved. Add the DKIM CNAME records printed in the deployment outputs to Cloudflare with proxy **off** (DNS only), plus `_dmarc.remind` TXT `v=DMARC1; p=none;`. AWS's default MAIL FROM handles SPF; no changes to root-domain MX/SPF are needed. After SES verifies the sender:

```sh
SENDING_ENABLED=true python3 backend/reminders/deploy.py
```

The first deployment defaults sending to **false**. Later deployments preserve the existing setting unless `SENDING_ENABLED` is supplied. Enabling sending always checks the identity first. Check identity status with:

```sh
aws sesv2 get-email-identity --email-identity remind.rocstartupweek.com --region us-east-1
```

The sender scans the subscriber table once per minute, with pagination. This suits the current event's modest size. Monitor scan cost and execution duration; a larger recurring program should move to indexed due jobs and a queue. Redeploy AWS after editing event content or times so notifications use the updated source. The worker refreshes pending notification content/timing from its bundled catalog.

## Email delivery test

With explicit permission from the test recipient and sending enabled:

```sh
backend/reminders/build/venv/bin/python tests/reminders/send_test.py --email YOUR_TEST_ADDRESS
```

This creates a temporary subscription, invokes the actual sender Lambda through IAM to send `[TEST]` itinerary/headliner previews from the published November 2 schedule, unsubscribes through the public API, verifies the Lambda refuses further sends, and deletes its test subscriber/token records. It refuses to alter an existing subscriber. No HTTP route exposes the preview action. Preview messages do not consume the normal daily delivery records. SES acceptance does not prove inbox placement; confirm receipt with the recipient. Test unsubscribe links are invalid after test records are cleaned up. The ordinary production links become usable when the static reminder page is published.
