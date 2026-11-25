(function () {
  const SOURCES = { teamsnap: 'TeamSnap', sportsengine: 'SportsEngine' };
  const STORE_KEY = 'sports-week-rsvps';
  const $ = (id) => document.getElementById(id);

  // ---- Data: read every kid's feed and merge into one list ----
  const events = [];
  for (const kid of DEMO.kids) {
    for (const ev of ICS.parse(kid.ics)) {
      const m = /Arrive (\d+) min/.exec(ev.description || '');
      const early = m ? +m[1] : 0;
      events.push({
        ...ev,
        kid,
        arrive: early ? new Date(ev.start.getTime() - early * 60000) : null,
      });
    }
  }
  events.sort((a, b) => a.start - b.start);

  // ---- RSVP state (kept in this browser only) ----
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { saved = {}; }
  const rsvp = (ev) => saved[ev.uid] || DEMO.answered[ev.uid] || null;
  function setRsvp(ev, value) {
    saved[ev.uid] = value;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(saved)); } catch (e) { /* demo only */ }
  }

  // ---- View state ----
  let week = 0;
  let filter = 'all';

  // ---- Formatting ----
  const fmtTime = (d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const fmtShort = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  function weekBounds(w) {
    const start = new Date(DEMO.weekStart);
    start.setDate(start.getDate() + w * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return [start, end];
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  // ---- Clash check: two kids, overlapping (arrival to end), different places ----
  function clashes(list) {
    const out = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i], b = list[j];
        if (a.kid === b.kid || a.location === b.location) continue;
        const aStart = a.arrive || a.start, bStart = b.arrive || b.start;
        if (aStart < b.end && bStart < a.end) out.push([a, b]);
      }
    }
    return out;
  }

  // ---- Render ----
  function renderChips() {
    const opts = [{ key: 'all', label: 'All' }, ...DEMO.kids.map((k) => ({ key: k.name, label: k.name, color: k.color }))];
    $('chips').innerHTML = opts.map((o) =>
      `<button type="button" class="chip${filter === o.key ? ' on' : ''}" data-key="${esc(o.key)}" aria-pressed="${filter === o.key}">` +
      (o.color ? `<span class="dot" style="background:${o.color}"></span>` : '') + esc(o.label) + '</button>'
    ).join('');
  }

  function eventCard(ev, now) {
    const past = ev.end < now;
    const src = ev.kid.source;
    const answer = rsvp(ev);
    let action = '';
    if (src === 'teamsnap') {
      if (past) {
        action = `<div class="done">${answer ? 'You said: ' + labelFor(answer) : 'No reply sent'}</div>`;
      } else {
        action = '<div class="rsvp" role="group" aria-label="RSVP">' +
          ['going', 'maybe', 'no'].map((v) =>
            `<button type="button" class="b ${v}${answer === v ? ' on' : ''}" data-uid="${esc(ev.uid)}" data-v="${v}" aria-pressed="${answer === v}">${answer === v ? '✓ ' : ''}${labelFor(v)}</button>`
          ).join('') + '</div>';
      }
    } else if (!past) {
      action = `<button type="button" class="out" data-uid="${esc(ev.uid)}">RSVP in SportsEngine ↗</button>`;
    }
    const arrive = ev.arrive ? ` · arrive ${fmtTime(ev.arrive)}` : '';
    return `<article class="ev${past ? ' past' : ''}${!answer && src === 'teamsnap' && !past ? ' needs' : ''}" style="--kid:${ev.kid.color}" id="ev-${esc(ev.uid)}">
      <div class="row"><h3>${esc(ev.kid.name)} · ${esc(ev.title)}</h3><span class="time">${fmtTime(ev.start)}</span></div>
      <div class="meta">${esc(ev.location || '')}${arrive}</div>
      ${action}
      <div class="src">${SOURCES[src].toUpperCase()}</div>
    </article>`;
  }

  function labelFor(v) {
    return { going: 'Going', maybe: 'Maybe', no: "Can't" }[v];
  }

  function render() {
    const now = new Date();
    const [start, end] = weekBounds(week);
    const inWeek = events.filter((e) => e.start >= start && e.start < end);
    const shown = inWeek.filter((e) => filter === 'all' || e.kid.name === filter);
    const lastDay = new Date(end); lastDay.setDate(lastDay.getDate() - 1);

    $('weekTitle').textContent = week === 0 ? 'This week' : week === 1 ? 'Next week' : week === -1 ? 'Last week' : 'Week of ' + fmtShort(start);
    $('weekRange').textContent = `${fmtShort(start)} – ${fmtShort(lastDay)}`;
    $('prevWeek').disabled = week <= Math.min(...DEMO.weeks);
    $('nextWeek').disabled = week >= Math.max(...DEMO.weeks);
    renderChips();

    // RSVPs that still need an answer (upcoming TeamSnap events this week)
    const open = shown.filter((e) => e.kid.source === 'teamsnap' && e.end >= now && !rsvp(e));
    $('rsvpAlert').hidden = open.length === 0;
    $('rsvpCount').textContent = `${open.length} RSVP${open.length === 1 ? '' : 's'} need${open.length === 1 ? 's' : ''} you`;

    // Clashes are always checked across all kids, even when one is filtered
    const clashList = clashes(inWeek.filter((e) => e.end >= now));

    const days = [];
    for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
      const dayEvents = shown.filter((e) => sameDay(e.start, d));
      if (!dayEvents.length) continue;
      const dayClashes = clashList.filter(([a, b]) => sameDay(a.start, d) &&
        (filter === 'all' || a.kid.name === filter || b.kid.name === filter));
      const label = d.toLocaleDateString('en-US', { weekday: 'short' }) + ' · ' + fmtShort(d);
      const today = sameDay(d, now) ? '<span class="today">Today</span>' : '';
      const warn = dayClashes.map(([a, b]) => {
        const [first, second] = a.start <= b.start ? [a, b] : [b, a];
        return `<div class="clash">⚠ ${esc(first.kid.name)} ${fmtTime(first.start)} and ${esc(second.kid.name)} ${fmtTime(second.start)}, different places</div>`;
      }).join('');
      days.push(`<div class="day"><h2>${label}${today}</h2>${warn}${dayEvents.map((e) => eventCard(e, now)).join('')}</div>`);
    }
    $('days').innerHTML = days.length ? days.join('') : '<p class="empty">Nothing scheduled this week.</p>';
  }

  // ---- Toast ----
  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2800);
  }

  // ---- How it works sheet (phones) ----
  function openHow(open) {
    document.body.classList.toggle('how-open', open);
    $('scrim').hidden = !open;
  }

  // ---- Events ----
  $('chips').addEventListener('click', (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    filter = b.dataset.key;
    render();
  });
  $('prevWeek').addEventListener('click', () => { week--; render(); });
  $('nextWeek').addEventListener('click', () => { week++; render(); });
  $('days').addEventListener('click', (e) => {
    const b = e.target.closest('.b');
    if (b) {
      const ev = events.find((x) => x.uid === b.dataset.uid);
      setRsvp(ev, b.dataset.v);
      render();
      toast(`Saved: ${labelFor(b.dataset.v)}. The real app sends this to TeamSnap.`);
      return;
    }
    if (e.target.closest('.out')) {
      toast('The real app opens this event in SportsEngine.');
    }
  });
  $('rsvpAlert').addEventListener('click', () => {
    const first = document.querySelector('.ev.needs');
    if (!first) return;
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    first.classList.remove('flash');
    void first.offsetWidth;
    first.classList.add('flash');
  });
  $('howBtn').addEventListener('click', () => openHow(true));
  $('howClose').addEventListener('click', () => openHow(false));
  $('scrim').addEventListener('click', () => openHow(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') openHow(false); });

  render();
})();
