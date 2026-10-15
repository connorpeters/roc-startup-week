import fs from 'node:fs';
import { days, additionalDays } from '../collateral/data.mjs';
import { websiteSchedule, flyerSchedule } from '../collateral/schedule.mjs';

function sync(file, start, end, content) {
  const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  if (a < 0 || b < 0) throw new Error(`Missing schedule markers in ${file}`);
  fs.writeFileSync(new URL(`../${file}`, import.meta.url), source.slice(0,a + start.length) + '\n' + content + '\n' + source.slice(b));
}
sync('index.html', '<!-- SCHEDULE:START -->', '<!-- SCHEDULE:END -->', websiteSchedule(days));
sync('collateral/flyer-schedule.html', '<!-- SCHEDULE:START -->', '<!-- SCHEDULE:END -->', flyerSchedule(days));
sync('CONTENT.md', '<!-- SCHEDULE:START -->', '<!-- SCHEDULE:END -->', '| Day | Date | Events |\n| --- | --- | --- |\n' + days.map(day => `| ${day.day} | ${day.date} | ${day.events.map(event => `${event.headliner ? '**' : ''}${event.title}${event.headliner ? '**' : ''}, ${event.time}, ${event.detail}`).join('; ').replaceAll('|','\\|')} |`).join('\n'));
console.log('Synchronized website, content document, and schedule flyer from collateral/data.mjs.');
sync('index.html', '<!-- ADDITIONAL-EVENTS:START -->', '<!-- ADDITIONAL-EVENTS:END -->', websiteSchedule(additionalDays));
sync('CONTENT.md', '<!-- ADDITIONAL-EVENTS:START -->', '<!-- ADDITIONAL-EVENTS:END -->', additionalDays.flatMap(day => day.events.map(event => `- **${event.title}** — ${day.day}, ${day.date}, 2026 · ${event.time} · ${event.detail}\n  ${event.description}\n  Details and tickets: ${event.url}`)).join('\n'));
