export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export const badge = '<b class="headliner-pill">HEADLINER</b>';

export function websiteSchedule(days) {
  const esc = escapeHtml;
  const icon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8M18 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></svg>';
  return days.map(day => `<div class="schedule__day-group"><div class="schedule__day">${esc(day.day.slice(0,3))} ${esc(day.date)}</div><ul class="schedule__events">${day.events.map(event => {
    const title = `<span>${esc(event.title)}</span>${event.headliner ? '<span class="schedule__headliner-pill">Headliner</span>' : ''}`;
    const logos = event.organizationLogos?.length ? `<div class="schedule__event-organizations" aria-label="Organizations">${event.organizationLogos.map(org => `<img src="/${esc(org.src)}" alt="${esc(org.name)}" title="${esc(org.name)}" loading="lazy">`).join('')}</div>` : '';
    const organizers = event.organizers?.length ? `<div class="schedule__organizer-chips" aria-label="Organizers">${event.organizers.map(org => `<span class="schedule__organizer-chip">${esc(org)}</span>`).join('')}</div>` : '';
    return `<li${event.headliner ? ' class="schedule__event--headliner"' : ''}>${event.url ? `<a class="schedule__event-title" href="${esc(event.url)}" target="_blank" rel="noopener">${title}${icon}</a>` : `<span class="schedule__event-title">${title}</span>`}${event.description ? `<p class="schedule__event-description">${esc(event.description)}</p>` : ''}<div class="schedule__event-meta"><span class="schedule__event-meta-time"><strong>Time</strong> ${esc(event.time)}</span><span class="schedule__event-meta-location"><strong>Location</strong><span class="schedule__location-full">${esc(event.location || event.detail)}</span><span class="schedule__location-short">${esc(event.shortLocation || event.location || event.detail)}</span></span>${Object.entries(event.meta || {}).map(([label,value]) => `<span${label === 'Cost' ? '' : ' class="schedule__event-meta-extra"'}><strong>${esc(label)}</strong> ${esc(value)}</span>`).join('')}${event.registration ? `<span><strong>Registration</strong> ${esc(event.registration)}</span>` : ''}</div>${event.note ? `<p class="schedule__event-note">${esc(event.note)}</p>` : ''}${organizers}${logos}</li>`;
  }).join('')}</ul></div>`).join('\n');
}

export function flyerSchedule(days) {
  return days.map(day => `<article class="schedule-day"><h2><span>${escapeHtml(day.day)}</span><span>${escapeHtml(day.date)}</span></h2><ul>${day.events.map(event => `<li class="${event.headliner ? 'headliner' : ''}"><time>${escapeHtml(event.time)}</time><strong>${escapeHtml(event.title)}</strong>${event.headliner ? ` ${badge}` : ''}<small>${escapeHtml(event.detail)}</small></li>`).join('')}</ul></article>`).join('\n');
}
