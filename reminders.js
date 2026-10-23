/* Tokens remain in URL fragments and are never sent to static hosting or referrers. */
window.addEventListener('hashchange', () => {
  if (location.hash.startsWith('#unsubscribe=')) location.reload();
});
(async () => {
  const status = document.querySelector('#status');
  const form = document.querySelector('#signup');
  const fragment = new URLSearchParams(location.hash.slice(1));
  const action = fragment.has('unsubscribe') ? 'unsubscribe' : null;
  const token = action && fragment.get(action);
  if (action) history.replaceState(null, '', location.pathname);
  try {
    const configResponse = await fetch('/reminders-config.json', { cache: 'no-store' });
    if (!configResponse.ok) throw new Error('Unable to load reminder settings. Please try again.');
    const { apiUrl } = await configResponse.json();
    if (!apiUrl || !/^https:\/\/[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com$/.test(apiUrl)) {
      throw new Error('Email reminders will be available soon.');
    }
    async function post(path, data) {
      const response = await fetch(apiUrl + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Please try again.');
      status.textContent = result.message;
    }
    if (action) {
      const section = document.querySelector('#token-action');
      const button = document.querySelector('#action-button');
      section.hidden = false;
      document.querySelector('#action-title').textContent = 'Stop all event reminders';
      button.textContent = 'Unsubscribe';
      status.textContent = 'Use the button below to complete your request.';
      button.addEventListener('click', async () => {
        button.disabled = true;
        try { await post('/reminders/' + action, { token }); section.hidden = true; }
        catch (error) { status.textContent = error.message; button.disabled = false; }
      });
      return;
    }
    const response = await fetch(apiUrl + '/events');
    if (!response.ok) throw new Error('Unable to load events. Please try again.');
    const events = (await response.json()).filter(event => new Date(event.startsAt) > new Date());
    if (!events.length) { status.textContent = 'There are no upcoming events with confirmed start times.'; return; }
    const container = document.querySelector('#events');
    for (const event of events) {
      const label = document.createElement('label');
      label.className = 'choice';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox'; checkbox.name = 'eventIds'; checkbox.value = event.id;
      const text = document.createElement('span');
      text.textContent = event.title;
      const details = document.createElement('small');
      details.textContent = `${event.date} · ${event.time} · ${event.location}`;
      text.append(details); label.append(checkbox, text); container.append(label);
    }
    const button = form.querySelector('button');
    const consent = form.querySelector('[name=consent]');
    let submitting = false;
    const updateButton = () => { button.disabled = submitting || !consent.checked; };
    consent.addEventListener('change', updateButton);
    updateButton();
    form.hidden = false; status.textContent = '';
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(form);
      const ids = data.getAll('eventIds');
      if (!ids.length) { status.textContent = 'Choose at least one event.'; return; }
      if (submitting) return;
      submitting = true; updateButton(); form.setAttribute('aria-busy', 'true');
      try { await post('/reminders', { email: data.get('email'), eventIds: ids, consent: data.has('consent') }); form.hidden = true; }
      catch (error) { status.textContent = error.message; }
      finally { submitting = false; updateButton(); form.removeAttribute('aria-busy'); }
    });
  } catch (error) { status.textContent = error.message || 'Reminders are temporarily unavailable.'; }
})();
