(() => {
  let config;
  const pending = new Set();
  const completed = new Set();
  function apiUrl() {
    if (!config) config = fetch('/reminders-config.json', { cache: 'no-store' }).then(async response => {
      if (!response.ok) throw new Error('Unable to load signup. Please try again.');
      const { apiUrl } = await response.json();
      if (!/^https:\/\/[a-z0-9]+\.execute-api\.[a-z0-9-]+\.amazonaws\.com$/.test(apiUrl || '')) {
        throw new Error('Email signup will be available soon.');
      }
      return apiUrl;
    }).catch(error => { config = null; throw error; });
    return config;
  }
  for (const form of document.querySelectorAll('[data-inline-signup]')) {
    const button = form.querySelector('button');
    const consent = form.querySelector('[name=consent]');
    let submitting = false;
    const updateButton = () => { button.disabled = submitting || !consent.checked; };
    consent.addEventListener('change', updateButton);
    updateButton();
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (submitting || !form.reportValidity()) return;
      const status = form.querySelector('[role=status]');
      const data = new FormData(form);
      const email = String(data.get('email')).trim().toLowerCase();
      if (completed.has(email)) { status.textContent = 'You’re already signed up. Check your inbox for the schedule.'; return; }
      if (pending.has(email)) { status.textContent = 'Your signup is being saved…'; return; }
      pending.add(email); submitting = true; updateButton(); form.setAttribute('aria-busy', 'true'); status.textContent = 'Signing you up…';
      try {
        const response = await fetch((await apiUrl()) + '/reminders', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, consent: data.has('consent') })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to sign up. Please try again.');
        completed.add(email);
        status.textContent = 'You’re signed up. Check your inbox for the schedule.';
      } catch (error) { status.textContent = error.message || 'Unable to sign up. Please try again.'; }
      finally { pending.delete(email); submitting = false; updateButton(); form.removeAttribute('aria-busy'); }
    });
  }
})();
