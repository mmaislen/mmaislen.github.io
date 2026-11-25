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

// Sample team emails, and the to-dos an AI pulled out of them. In the real
// app the parent forwards team emails to their own Sports Week address and
// a language model does this step; the demo ships the results so it runs
// without a server. Each to-do keeps the exact words it came from.
(function () {
  window.DEMO.emails = [
    {
      id: 'e-hawks-sat', kid: 'Ava', source: 'teamsnap', from: 'Coach Dana', week: 0, day: 0,
      subject: 'Saturday game + snack duty',
      body: 'Hi Hawks families! Great practice tonight.\n\nSaturday we play Lakeside FC at Pickering Farm, Field 4. Please have players there by 8:30. We are the home team, so wear white jerseys.\n\nSnack this week: Ava\'s family. Orange slices and water for 14, please!\n\nHeads up: team photos are next Wednesday. Arrive at 5:00 so we can shoot before practice.\n\nCoach Dana',
    },
    {
      id: 'e-squirts-fee', kid: 'Leo', source: 'sportsengine', from: 'Manager Jordan', week: 0, day: 1,
      subject: 'Kent game and tournament fee',
      body: 'Squirts parents,\n\nSaturday vs Kent at Kent Valley Ice. Puck drop 9:30, locker room opens at 8:45. Dark jerseys.\n\nThe holiday tournament fee is $40 per player, due Friday in SportsEngine.\n\nThanks!\nJordan',
    },
    {
      id: 'e-hawks-party', kid: 'Ava', source: 'teamsnap', from: 'Coach Dana', week: 0, day: 2,
      subject: 'End of season party!',
      body: 'Hawks families,\n\nWhat a season! Party is Sunday the 6th at 4:00 at my house. Bring a dish to share. If you would like to chip in for the coaches\' gift, bring $10 in an envelope.\n\nSee you there,\nCoach Dana',
    },
  ];

  window.DEMO.todos = [
    { id: 't-snack', email: 'e-hawks-sat', kid: 'Ava', event: 'ts-ava-0-game', text: 'Bring orange slices and water for 14', quote: 'Orange slices and water for 14' },
    { id: 't-white', email: 'e-hawks-sat', kid: 'Ava', event: 'ts-ava-0-game', text: 'Wear white jersey', quote: 'wear white jerseys' },
    { id: 't-photos', email: 'e-hawks-sat', kid: 'Ava', event: 'ts-ava-1-wed', text: 'Team photos: arrive at 5:00', quote: 'Arrive at 5:00 so we can shoot before practice' },
    { id: 't-fee', email: 'e-squirts-fee', kid: 'Leo', due: { week: 0, day: 4 }, text: 'Pay $40 tournament fee', quote: '$40 per player, due Friday in SportsEngine', action: 'pay' },
    { id: 't-dark', email: 'e-squirts-fee', kid: 'Leo', event: 'se-leo-0-game', text: 'Pack dark jersey', quote: 'Dark jerseys' },
    { id: 't-dish', email: 'e-hawks-party', kid: 'Ava', event: 'ts-ava-1-party', text: 'Bring a dish to share', quote: 'Bring a dish to share' },
    { id: 't-gift', email: 'e-hawks-party', kid: 'Ava', event: 'ts-ava-1-party', text: '$10 for the coaches\' gift', quote: 'bring $10 in an envelope' },
  ];
})();
