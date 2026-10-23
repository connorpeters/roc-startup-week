import fs from 'node:fs';
import { days, additionalDays } from '../collateral/data.mjs';

export function eventCatalog() {
  return [...days, ...additionalDays].flatMap(day => day.events.flatMap(event => {
    const match = event.time.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
    if (!match) return [];
    const meridiem = match[3] || event.time.match(/\b(AM|PM)\b/i)?.[1];
    if (!meridiem) throw new Error(`Ambiguous start time: ${event.id}`);
    let hour = Number(match[1]) % 12 + (meridiem.toUpperCase() === 'PM' ? 12 : 0);
    const month = { Nov: '11', Dec: '12' }[day.date.split(' ')[0]];
    if (!month) throw new Error(`Unknown month: ${day.date}`);
    // All 2026 November/December events occur after the November 1 DST transition.
    const startsAt = `2026-${month}-${day.date.split(' ')[1].padStart(2, '0')}T${String(hour).padStart(2, '0')}:${match[2]}:00-05:00`;
    const display = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: false }).format(new Date(startsAt));
    if (display !== `${String(hour).padStart(2, '0')}:${match[2]}`) throw new Error(`Timezone mismatch: ${event.id}`);
    return [{ id: event.id, title: event.title, description: event.description || '', headliner: event.headliner === true, startsAt, time: event.time, date: day.date, location: event.location || event.detail, url: event.url || 'https://rocstartupweek.com/#schedule' }];
  }));
}
const events = eventCatalog();
fs.mkdirSync('backend/reminders/build', { recursive: true });
fs.writeFileSync('backend/reminders/build/events.json', JSON.stringify(events, null, 2) + '\n');
const schedule = [...days, ...additionalDays].flatMap(day => day.events.map(event => ({
  id: event.id, title: event.title, time: event.time, location: event.location || event.detail,
  dayLabel: `${day.day}, ${day.date}`, additional: additionalDays.includes(day),
  headliner: event.headliner === true, cost: event.meta?.Cost || '', registration: event.registration || '',
  url: event.url || 'https://rocstartupweek.com/#schedule'
})));
fs.writeFileSync('backend/reminders/build/schedule.json', JSON.stringify(schedule, null, 2) + '\n');
console.log(`Built ${events.length} timed reminder events.`);
