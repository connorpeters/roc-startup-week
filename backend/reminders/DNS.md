# Reminder sender DNS

Sender: `Roc Startup Week <reminders@remind.rocstartupweek.com>`

Cloudflare zone: `rocstartupweek.com`. TTL: Auto. All CNAMEs: DNS only (proxy off).

## CNAME 1

Name:
```text
xhokgjsoboaptu7s7b6fimg2ru6up3dy._domainkey.remind
```

Target:
```text
xhokgjsoboaptu7s7b6fimg2ru6up3dy.dkim.amazonses.com
```

## CNAME 2

Name:
```text
neu62qqe2bqb42kwgspxzec52oxmzmcd._domainkey.remind
```

Target:
```text
neu62qqe2bqb42kwgspxzec52oxmzmcd.dkim.amazonses.com
```

## CNAME 3

Name:
```text
gvft6tslkqvdrnrjeccwkv7tjfh5rmwo._domainkey.remind
```

Target:
```text
gvft6tslkqvdrnrjeccwkv7tjfh5rmwo.dkim.amazonses.com
```

## TXT

Name:
```text
_dmarc.remind
```

Content:
```text
v=DMARC1; p=none;
```

SES verified the identity and DKIM on October 23, 2026. Sending is enabled. No root-domain MX or SPF changes are required; SES uses its default MAIL FROM.
