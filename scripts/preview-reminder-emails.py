"""Generate browser previews; data URLs substitute for email-only CID references here."""
import base64
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path('backend/reminders').resolve()))
from email_template import LOGO, LOGO_CID, render_email, render_welcome

events = json.loads(Path('backend/reminders/build/events.json').read_text())
events = [e for e in events if e['startsAt'].startswith('2026-11-02')]
for category in ['itinerary', 'headliners']:
    selected = [e for e in events if e.get('headliner')] if category == 'headliners' else events
    html = render_email(category, selected, 'https://rocstartupweek.com/reminders.html#unsubscribe=preview', testing=True)
    html = html.replace('cid:' + LOGO_CID, 'data:image/png;base64,' + base64.b64encode(LOGO).decode())
    filename = Path(f'backend/reminders/build/email-{category}.html')
    filename.write_text(html)
    print(f'{filename} ({len(html.encode())} bytes)')
schedule = json.loads(Path('backend/reminders/build/schedule.json').read_text())
html = render_welcome(schedule, 'https://rocstartupweek.com/assets/pdf/roc-startup-week-full-schedule.pdf', 'https://rocstartupweek.com/reminders.html#unsubscribe=preview')
html = html.replace('cid:' + LOGO_CID, 'data:image/png;base64,' + base64.b64encode(LOGO).decode())
Path('backend/reminders/build/email-welcome.html').write_text(html)
print(f'backend/reminders/build/email-welcome.html ({len(html.encode())} bytes)')
