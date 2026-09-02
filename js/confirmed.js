/* Confirmation page: shows the request summary and "add to calendar" links.
   The calendar links are how a booking gets onto ABC Tutoring's shared
   calendar when there is no backend — Dana (or the parent) clicks once. */
(function () {
  'use strict';
  var el = ABC.el;
  var q = new URLSearchParams(location.search);

  var FIELDS = [
    ['parentName', 'Parent name'],
    ['parentEmail', 'Parent email'],
    ['studentFirstName', "Student's first name"],
    ['studentEmail', "Student's email"],
    ['subject', 'Requested subject'],
    ['tutor', 'Tutor'],
    ['date', 'Date'],
    ['time', 'Time'],
    ['notes', 'Notes']
  ];

  var data = {};
  FIELDS.forEach(function (f) { data[f[0]] = (q.get(f[0]) || '').trim(); });
  var status = q.get('status') || 'unknown';

  /* ---- status message ---- */
  var statusBox = document.getElementById('status-box');
  if (status === 'sent') {
    statusBox.className = 'notice notice-ok';
    statusBox.textContent = 'Dana has been notified of this request and will confirm by email.';
  } else {
    statusBox.className = 'notice notice-warn';
    statusBox.innerHTML = 'We could not send the notification automatically. ' +
      'Please forward these details to Dana: ';
    ABC.getConfig().then(function (cfg) {
      var subject = 'Booking request — ' + (data.tutor || 'ABC Tutoring');
      var lines = FIELDS.filter(function (f) { return data[f[0]]; })
        .map(function (f) { return f[1] + ': ' + data[f[0]]; }).join('\n');
      var a = el('a', {
        href: 'mailto:' + encodeURIComponent(cfg.danaEmail) +
          '?subject=' + encodeURIComponent(subject) +
          '&body=' + encodeURIComponent(lines),
        text: 'email ' + cfg.danaEmail
      });
      statusBox.appendChild(a);
    });
  }

  /* ---- summary table ---- */
  var tbody = document.getElementById('summary-body');
  FIELDS.forEach(function (f) {
    if (!data[f[0]]) return;
    tbody.appendChild(el('tr', {}, [
      el('th', { scope: 'row', text: f[1] }),
      el('td', { text: data[f[0]] })
    ]));
  });

  /* ---- calendar links ---- */
  function parseStart(dateStr, timeStr) {
    var m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!dateStr || !m) return null;
    var h = parseInt(m[1], 10) % 12;
    if (/pm/i.test(m[3])) h += 12;
    var p = dateStr.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2], h, parseInt(m[2], 10), 0);
  }

  function stamp(d) {
    function pad(n) { return String(n).padStart(2, '0'); }
    return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) +
      'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  }

  ABC.getConfig().then(function (cfg) {
    var start = parseStart(data.date, data.time);
    var actions = document.getElementById('calendar-actions');
    if (!start) { actions.classList.add('hidden'); return; }

    var end = new Date(start.getTime() + (cfg.sessionLengthMinutes || 60) * 60000);
    var title = (cfg.businessName || 'ABC Tutoring') + ': ' + (data.subject || 'Tutoring') +
      ' with ' + (data.studentFirstName || 'student');
    var details =
      'Tutor: ' + data.tutor + '\n' +
      'Subject: ' + data.subject + '\n' +
      'Student: ' + data.studentFirstName + ' (' + data.studentEmail + ')\n' +
      'Parent: ' + data.parentName + ' (' + data.parentEmail + ')' +
      (data.notes ? '\nNotes: ' + data.notes : '');

    var gcal = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(title) +
      '&dates=' + stamp(start) + '/' + stamp(end) +
      '&details=' + encodeURIComponent(details) +
      '&location=' + encodeURIComponent(cfg.businessName || 'ABC Tutoring');
    document.getElementById('gcal-link').href = gcal;

    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ABC Tutoring//Booking//EN',
      'BEGIN:VEVENT',
      'UID:' + stamp(start) + '-' + Math.random().toString(36).slice(2) + '@abctutoring',
      'DTSTAMP:' + stamp(new Date()),
      'DTSTART:' + stamp(start),
      'DTEND:' + stamp(end),
      'SUMMARY:' + title.replace(/\n/g, ' '),
      'DESCRIPTION:' + details.replace(/\n/g, '\\n'),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var icsLink = document.getElementById('ics-link');
    icsLink.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    icsLink.download = 'abc-tutoring-session.ics';
  });
})();
