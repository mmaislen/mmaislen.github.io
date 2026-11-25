// Minimal iCalendar (.ics) reader: enough for the subscription feeds that
// TeamSnap and SportsEngine publish (VEVENT with start, end, title, place).
(function () {
  function unfold(text) {
    // Long lines continue on the next line, which starts with a space or tab.
    return text.replace(/\r?\n[ \t]/g, '');
  }

  function unescapeText(v) {
    return v.replace(/\\n/gi, '\n').replace(/\\([,;\\])/g, '$1');
  }

  function parseDate(v) {
    // 20261130T173000 (local), 20261130T013000Z (UTC) or 20261130 (all day)
    const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/.exec(v.trim());
    if (!m) return null;
    const [, y, mo, d, h = '0', mi = '0', s = '0', z] = m;
    return z
      ? new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +s))
      : new Date(+y, +mo - 1, +d, +h, +mi, +s);
  }

  function parse(text) {
    const events = [];
    let cur = null;
    for (const line of unfold(text).split(/\r?\n/)) {
      if (line === 'BEGIN:VEVENT') { cur = {}; continue; }
      if (line === 'END:VEVENT') { if (cur && cur.start) events.push(cur); cur = null; continue; }
      if (!cur) continue;
      const i = line.indexOf(':');
      if (i < 0) continue;
      const key = line.slice(0, i).split(';')[0].toUpperCase();
      const val = line.slice(i + 1);
      if (key === 'UID') cur.uid = val;
      else if (key === 'SUMMARY') cur.title = unescapeText(val);
      else if (key === 'LOCATION') cur.location = unescapeText(val);
      else if (key === 'DESCRIPTION') cur.description = unescapeText(val);
      else if (key === 'URL') cur.url = val;
      else if (key === 'DTSTART') cur.start = parseDate(val);
      else if (key === 'DTEND') cur.end = parseDate(val);
    }
    return events;
  }

  window.ICS = { parse };
})();
