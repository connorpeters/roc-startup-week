"""Table-based email wrapper using the website's approved logo, colors, and type."""
from datetime import datetime
from html import escape
from pathlib import Path
from itertools import groupby
from urllib.parse import urlsplit
from zoneinfo import ZoneInfo

LOGO_CID = 'roc-startup-week-logo'
logo_path = Path(__file__).with_name('email-logo.png')
if not logo_path.exists():
    logo_path = Path(__file__).resolve().parents[2] / 'images/brand/roc-startup-week-full-color.png'
LOGO = logo_path.read_bytes()
SITE = 'https://rocstartupweek.com'
BODY_FONT = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif"
HEADING_FONT = "Abel, 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif"


def safe_url(value):
    parsed = urlsplit(str(value))
    return escape(str(value) if parsed.scheme == 'https' and parsed.netloc else SITE, quote=True)


def render_email(category, events, unsubscribe_url, testing=False):
    events = sorted(events, key=lambda event: event['startsAt'])
    first = datetime.fromisoformat(events[0]['startsAt']).astimezone(ZoneInfo('America/New_York'))
    date = f'{first:%A}, {first:%B} {first.day}'
    is_headliners = category == 'headliners'
    title = 'Today’s <span style="color:#ed1c24;">headliners.</span>' if is_headliners else 'Your plans for <span style="color:#ed1c24;">tomorrow.</span>'
    intro = 'A friendly reminder of today’s headliner events:' if is_headliners else 'A friendly reminder of your selected events tomorrow:'
    count = f'{len(events)} ' + ('headliner' if is_headliners else 'selected event') + ('' if len(events) == 1 else 's')
    cards = []
    for event in events:
        description = f'<p style="margin:0 0 16px;color:#555555;font-size:14px;line-height:23px;">{escape(event["description"])}</p>' if event.get('description') else ''
        badge = ' <span style="display:inline-block;background-color:#ed1c24;color:#fffdf9;border-radius:2px;padding:3px 6px;font-size:10px;line-height:14px;letter-spacing:.06em;font-weight:700;vertical-align:middle;white-space:nowrap;">HEADLINER</span>' if event.get('headliner') else ''
        cards.append(f'''<tr><td style="padding:0 0 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e8e4df;border-radius:2px;background-color:#fffdf9;">
<tr><td class="event-padding" style="padding:24px;">
<p style="margin:0 0 10px;color:#555555;font-size:13px;line-height:20px;font-weight:600;">{escape(event['time'])} &nbsp;·&nbsp; Rochester time</p>
<h2 style="margin:0 0 12px;color:#1a1a1a;font-family:{BODY_FONT};font-size:20px;line-height:28px;font-weight:700;">{escape(event['title'])}{badge}</h2>
{description}
<p style="margin:0 0 18px;color:#555555;font-size:14px;line-height:23px;">{escape(event['location'])}</p>
<a href="{safe_url(event['url'])}" style="color:#1a1a1a;font-size:13px;line-height:20px;font-weight:600;text-decoration:underline;text-underline-offset:4px;">Event details &amp; registration &#8599;</a>
</td></tr></table></td></tr>''')
    return wrap_email(title, intro, date, count, cards, unsubscribe_url, testing=testing)


def render_welcome(schedule, pdf_url, unsubscribe_url):
    cards = []
    for (additional, day), entries in groupby(schedule, key=lambda e: (e['additional'], e['dayLabel'])):
        entries = list(entries)
        if additional and not any('After Startup Week' in card for card in cards):
            cards.append('<tr><td style="padding:24px 0 8px;font-size:20px;font-weight:600;">After Startup Week</td></tr>')
        rows = []
        for entry in entries:
            badge = ' <span style="display:inline-block;background-color:#ed1c24;color:#fffdf9;border-radius:2px;padding:2px 5px;font-size:9px;line-height:14px;font-weight:700;white-space:nowrap;">HEADLINER</span>' if entry.get('headliner') else ''
            extra = ' · '.join(value for value in [entry.get('cost'), entry.get('registration')] if value)
            rows.append(f'''<tr><td style="padding:16px 20px;border-top:1px solid #e8e4df;">
<p style="margin:0 0 6px;font-size:12px;line-height:19px;color:#555555;font-weight:600;">{escape(entry['time'])}</p>
<p style="margin:0 0 6px;font-size:15px;line-height:23px;font-weight:600;"><a href="{safe_url(entry['url'])}" style="color:#1a1a1a;text-decoration:underline;">{escape(entry['title'])}</a>{badge}</p>
<p style="margin:0;color:#555555;font-size:12px;line-height:20px;">{escape(entry['location'])}</p>
{f'<p style="margin:6px 0 0;color:#555555;font-size:12px;line-height:20px;">{escape(extra)}</p>' if extra else ''}
</td></tr>''')
        cards.append(f'''<tr><td style="padding:0 0 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fffdf9;border:1px solid #e8e4df;border-radius:2px;">
<tr><td style="padding:16px 20px;color:#ed1c24;font-family:{HEADING_FONT};font-size:24px;line-height:30px;font-weight:400;">{escape(day)}</td></tr>{''.join(rows)}</table></td></tr>''')
    return wrap_email('You’re <span style="color:#ed1c24;">signed up.</span>',
        'Here’s the full schedule. Save this email for reference, or use the link below for the latest schedule PDF. All times are Rochester time.',
        'November 2–7, 2026', f'{len(schedule)} events, including after-week additions', cards, unsubscribe_url,
        button_url=pdf_url, button_label='View the latest schedule PDF')


def wrap_email(title, intro, date, count, cards, unsubscribe_url, testing=False, button_url=SITE + '/#schedule', button_label='View the full schedule'):
    preheader = escape(f'{date} · {count}. All times are Rochester time.')
    preview = '<tr><td style="padding:12px 32px;background-color:#ece8e3;color:#555555;font-size:12px;line-height:18px;text-align:center;">TEST EMAIL · Preview of the published event schedule</td></tr>' if testing else ''
    return f'''<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light"><title>Roc Startup Week — {escape(date)}</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
<style>@import url('https://fonts.googleapis.com/css2?family=Abel&family=Montserrat:wght@400;500;600;700&display=swap');
body,table,td,a{{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}}table,td{{mso-table-lspace:0pt;mso-table-rspace:0pt}}img{{border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic}}body{{margin:0!important;padding:0!important;width:100%!important}}a[x-apple-data-detectors]{{color:inherit!important;text-decoration:none!important}}
@media screen and (max-width:620px){{.outer-padding{{padding:12px 8px!important}}.content-padding{{padding-left:22px!important;padding-right:22px!important}}.hero-title{{font-size:36px!important;line-height:40px!important}}.event-padding{{padding:20px!important}}}}
</style></head>
<body style="margin:0;padding:0;background-color:#ece8e3;color:#1a1a1a;font-family:{BODY_FONT};">
<div style="display:none;font-size:1px;color:#ece8e3;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">{preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ece8e3"><tr><td class="outer-padding" align="center" style="padding:32px 16px;">
<!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#f7f4f0;border:1px solid #d8d2cb;">
{preview}
<tr><td align="center" class="content-padding" style="padding:36px 32px 28px;border-bottom:1px solid #e8e4df;">
<a href="{SITE}" style="color:#1a1a1a;text-decoration:none;"><img src="cid:{LOGO_CID}" width="190" height="101" alt="Roc Startup Week" style="display:block;width:190px;height:101px;max-width:100%;color:#1a1a1a;font-family:Arial,sans-serif;font-size:20px;"></a>
<p style="margin:18px 0 0;color:#555555;font-size:11px;line-height:18px;font-weight:600;letter-spacing:.12em;">NOVEMBER 2–7, 2026 &nbsp;·&nbsp; ROCHESTER, NY</p>
</td></tr>
<tr><td class="content-padding" style="padding:36px 32px 28px;">
<h1 class="hero-title" style="margin:0 0 20px;font-family:{HEADING_FONT};font-weight:400;font-size:44px;line-height:48px;letter-spacing:-.02em;">{title}</h1>
<p style="margin:0 0 16px;color:#1a1a1a;font-size:14px;line-height:22px;font-weight:600;">{escape(date)} &nbsp;·&nbsp; {escape(count)}</p>
<p style="margin:0;color:#555555;font-size:15px;line-height:25px;font-weight:400;">{intro}</p>
</td></tr>
<tr><td class="content-padding" style="padding:0 32px 12px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{''.join(cards)}</table></td></tr>
<tr><td class="content-padding" style="padding:0 32px 36px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#1a1a1a" style="border-radius:2px;mso-padding-alt:14px 22px;"><a href="{safe_url(button_url)}" style="display:inline-block;padding:14px 22px;color:#fffdf9;font-size:13px;line-height:20px;font-weight:600;text-decoration:none;">{escape(button_label)}</a></td></tr></table>
<p style="margin:18px 0 0;color:#555555;font-size:12px;line-height:20px;">Your reminders don’t reserve a seat. Follow each organizer’s registration instructions.</p>
</td></tr>
<tr><td class="content-padding" bgcolor="#222222" style="padding:32px;color:#fffdf9;">
<p style="margin:0 0 16px;color:#cccccc;font-size:12px;line-height:20px;">You’re receiving this because you signed up for Roc Startup Week notifications.</p>
<p style="margin:0;font-size:12px;line-height:20px;"><a href="{escape(unsubscribe_url, quote=True)}" style="color:#fffdf9;text-decoration:underline;">Unsubscribe from all notifications</a> &nbsp;·&nbsp; <a href="{SITE}" style="color:#fffdf9;text-decoration:underline;">rocstartupweek.com</a></p>
</td></tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr></table></body></html>'''
