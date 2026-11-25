// Sample calendar feeds for the demo. They are written in the same iCalendar
// format the real TeamSnap and SportsEngine subscription links use, with dates
// built around the current week so the demo always looks current.
(function () {
  function mondayOf(d) {
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const back = (m.getDay() + 6) % 7; // days since Monday
    m.setDate(m.getDate() - back);
    return m;
  }

  const pad = (n) => String(n).padStart(2, '0');
  function stamp(base, week, day, hhmm) {
    const d = new Date(base);
    d.setDate(d.getDate() + week * 7 + day);
    const [h, m] = hhmm.split(':');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(h)}${pad(m)}00`;
  }

  function addMinutes(hhmm, mins) {
    const [h, m] = hhmm.split(':').map(Number);
    const t = h * 60 + m + mins;
    return `${pad(Math.floor(t / 60))}:${pad(t % 60)}`;
  }

  function feed(name, base, items) {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', `X-WR-CALNAME:${name}`];
    for (const it of items) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:${it.uid}`,
        `DTSTART:${stamp(base, it.week, it.day, it.time)}`,
        `DTEND:${stamp(base, it.week, it.day, addMinutes(it.time, it.mins))}`,
        `SUMMARY:${it.title}`,
        `LOCATION:${it.place.replace(/,/g, '\\,')}`,
        `DESCRIPTION:Arrive ${it.arrive} min early.`,
        'END:VEVENT'
      );
    }
    lines.push('END:VCALENDAR');
    return lines.join('\r\n');
  }

  const base = mondayOf(new Date());
  // day: 0 = Monday ... 6 = Sunday
  const ava = [];
  const leo = [];
  for (const w of [-1, 0, 1, 2]) {
    ava.push(
      { uid: `ts-ava-${w}-mon`, week: w, day: 0, time: '17:30', mins: 90, arrive: 15, title: 'Soccer practice', place: 'Torguson Park, Field 2' },
      { uid: `ts-ava-${w}-wed`, week: w, day: 2, time: '17:30', mins: 90, arrive: 15, title: 'Soccer practice', place: 'Torguson Park, Field 2' }
    );
    leo.push(
      { uid: `se-leo-${w}-tue`, week: w, day: 1, time: '18:15', mins: 60, arrive: 30, title: 'Hockey practice', place: 'Cascade Ice Arena, Rink B' },
      { uid: `se-leo-${w}-thu`, week: w, day: 3, time: '18:15', mins: 60, arrive: 30, title: 'Hockey practice', place: 'Cascade Ice Arena, Rink B' }
    );
  }
  ava.push(
    { uid: 'ts-ava--1-game', week: -1, day: 5, time: '10:00', mins: 90, arrive: 30, title: 'Game vs Ridge SC', place: 'Torguson Park, Field 1' },
    { uid: 'ts-ava-0-game', week: 0, day: 5, time: '09:00', mins: 90, arrive: 30, title: 'Game vs Lakeside FC', place: 'Pickering Farm, Field 4' },
    { uid: 'ts-ava-1-game', week: 1, day: 5, time: '11:00', mins: 90, arrive: 30, title: 'Game vs Eastside United', place: 'Torguson Park, Field 1' },
    { uid: 'ts-ava-1-party', week: 1, day: 6, time: '16:00', mins: 120, arrive: 0, title: 'Team party', place: 'Coach Dana\'s house' },
    { uid: 'ts-ava-2-game', week: 2, day: 5, time: '09:00', mins: 90, arrive: 30, title: 'Game vs Valley FC', place: 'Centennial Fields, Field 3' }
  );
  leo.push(
    { uid: 'se-leo--1-game', week: -1, day: 5, time: '12:00', mins: 60, arrive: 45, title: 'Game vs Everett', place: 'Cascade Ice Arena, Rink A' },
    { uid: 'se-leo-0-game', week: 0, day: 5, time: '09:30', mins: 60, arrive: 45, title: 'Game vs Kent', place: 'Kent Valley Ice' },
    { uid: 'se-leo-1-clinic', week: 1, day: 2, time: '17:45', mins: 60, arrive: 15, title: 'Skating clinic', place: 'Cascade Ice Arena, Rink A' },
    { uid: 'se-leo-1-game', week: 1, day: 5, time: '13:30', mins: 60, arrive: 45, title: 'Game vs Bellevue', place: 'Cascade Ice Arena, Rink A' },
    { uid: 'se-leo-2-game', week: 2, day: 6, time: '11:00', mins: 60, arrive: 45, title: 'Game vs Seattle', place: 'Lynnwood Ice Center' }
  );

  // RSVPs already answered in TeamSnap before the parent opens the app.
  const answered = {
    'ts-ava--1-mon': 'going', 'ts-ava--1-wed': 'going', 'ts-ava--1-game': 'going',
    'ts-ava-0-game': 'going',
  };

  window.DEMO = {
    weekStart: base,
    kids: [
      { name: 'Ava', color: '#e8743b', source: 'teamsnap', team: 'Hawks U12 Soccer', ics: feed('Hawks U12 Soccer', base, ava) },
      { name: 'Leo', color: '#2f7fd1', source: 'sportsengine', team: 'Squirts Hockey', ics: feed('Squirts Hockey', base, leo) },
    ],
    answered,
    weeks: [-1, 0, 1, 2],
  };
})();
