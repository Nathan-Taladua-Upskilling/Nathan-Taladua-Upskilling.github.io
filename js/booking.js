/* Booking form: tutor pre-select, availability-aware time list, submit. */
(function () {
  'use strict';
  var el = ABC.el;

  var form = document.getElementById('booking-form');
  var tutorSelect = form.tutor;
  var subjectSelect = form.subject;
  var subjectOther = document.getElementById('subject-other');
  var dateInput = form.date;
  var timeSelect = form.time;
  var panel = document.getElementById('tutor-panel');
  var timeHint = document.getElementById('time-hint');
  var submitBtn = document.getElementById('submit-btn');
  var errorBox = document.getElementById('form-error');

  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var tutorsById = {};
  var config = {};
  var ABC_BUSINESS = 'ABC Tutoring';

  function selectedTutor() { return tutorsById[tutorSelect.value]; }

  function fillTutorSelect(tutors) {
    tutors.forEach(function (t) {
      tutorsById[t.id] = t;
      tutorSelect.appendChild(el('option', { value: t.id, text: t.name + ' — ' + t.gradeLevels }));
    });
    var pre = new URLSearchParams(location.search).get('tutor');
    if (pre && tutorsById[pre]) tutorSelect.value = pre;
  }

  function renderPanel() {
    var t = selectedTutor();
    if (!t) { panel.classList.add('hidden'); return; }
    panel.classList.remove('hidden');
    panel.innerHTML = '';
    panel.appendChild(el('h3', { text: t.name + '  ·  ' + t.gradeLevels }));
    panel.appendChild(el('div', { class: 'chips' },
      t.subjects.map(function (s) { return el('span', { class: 'chip', text: s }); })));
    var ul = el('ul', { class: 'availability' });
    t.availability.forEach(function (a) {
      ul.appendChild(el('li', {}, [
        el('span', { class: 'day', text: a.day + ': ' }),
        document.createTextNode(a.slots.join(', '))
      ]));
    });
    panel.appendChild(el('div', { style: 'margin-top:.4rem' }, [el('strong', { text: 'Availability' }), ul]));
    panel.appendChild(el('p', { class: 'contact-line', style: 'margin:.4rem 0 0' }, [
      el('a', { href: 'mailto:' + t.email, text: t.email }),
      document.createTextNode('  ·  ' + t.phone)
    ]));
  }

  function fillSubjects() {
    var t = selectedTutor();
    var current = subjectSelect.value;
    subjectSelect.innerHTML = '';
    subjectSelect.appendChild(el('option', { value: '', text: 'Select a subject…' }));
    (t ? t.subjects : []).forEach(function (s) {
      subjectSelect.appendChild(el('option', { value: s, text: s }));
    });
    subjectSelect.appendChild(el('option', { value: '__other', text: 'Other…' }));
    if (current) subjectSelect.value = current;
    toggleOther();
  }

  function toggleOther() {
    var other = subjectSelect.value === '__other';
    subjectOther.classList.toggle('hidden', !other);
    subjectOther.required = other;
  }

  function fillTimes() {
    var t = selectedTutor();
    timeSelect.innerHTML = '';
    var dayName = '';
    if (dateInput.value) {
      var p = dateInput.value.split('-');
      dayName = WEEKDAYS[new Date(+p[0], +p[1] - 1, +p[2]).getDay()];
    }

    if (!t || !dateInput.value) {
      timeSelect.appendChild(el('option', { value: '', text: 'Pick a tutor and date first' }));
      timeHint.textContent = '';
      return;
    }
    var match = t.availability.filter(function (a) { return a.day === dayName; })[0];
    if (!match) {
      timeSelect.appendChild(el('option', { value: '', text: 'No sessions on ' + dayName } ));
      timeHint.textContent = t.name.split(' ')[0] + ' tutors on ' +
        t.availability.map(function (a) { return a.day; }).join(', ') + '.';
      return;
    }
    timeSelect.appendChild(el('option', { value: '', text: 'Select a time…' }));
    match.slots.forEach(function (s) {
      timeSelect.appendChild(el('option', { value: s, text: s }));
    });
    timeHint.textContent = 'Times shown are ' + dayName + ' openings for ' + t.name.split(' ')[0] + '.';
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  function onTutorChange() { renderPanel(); fillSubjects(); fillTimes(); }

  function collect() {
    return {
      parentName: form.parentName.value.trim(),
      parentEmail: form.parentEmail.value.trim(),
      studentFirstName: form.studentFirstName.value.trim(),
      studentEmail: form.studentEmail.value.trim(),
      subject: subjectSelect.value === '__other' ? subjectOther.value.trim() : subjectSelect.value,
      tutor: selectedTutor() ? selectedTutor().name : '',
      date: dateInput.value,
      time: timeSelect.value,
      notes: form.notes.value.trim()
    };
  }

  function send(payload) {
    if (!config.formEndpoint || config.formEndpoint.indexOf('REPLACE_WITH') !== -1) {
      return Promise.resolve('unconfigured');
    }
    var body = Object.assign({
      _subject: 'New booking request — ' + ABC_BUSINESS,
      _template: 'table',
      _captcha: 'false'
    }, payload);
    return fetch(config.formEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body)
    }).then(function (r) { return r.ok ? 'sent' : 'error'; })
      .catch(function () { return 'error'; });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    errorBox.classList.add('hidden');

    if (!timeSelect.value) {
      errorBox.textContent = 'Please choose an available date and time for this tutor.';
      errorBox.classList.remove('hidden');
      timeSelect.focus();
      return;
    }

    var payload = collect();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    send(payload).then(function (status) {
      var q = new URLSearchParams(payload);
      q.set('status', status);
      location.href = 'booking-confirmed.html?' + q.toString();
    });
  });

  tutorSelect.addEventListener('change', onTutorChange);
  subjectSelect.addEventListener('change', toggleOther);
  dateInput.addEventListener('change', fillTimes);

  Promise.all([ABC.getConfig(), ABC.loadJSON('data/tutors.json')])
    .then(function (res) {
      config = res[0];
      ABC_BUSINESS = config.businessName || ABC_BUSINESS;
      dateInput.min = todayISO();
      fillTutorSelect(res[1].tutors || []);
      onTutorChange();
    })
    .catch(function () {
      errorBox.textContent = 'Could not load tutor data. If previewing locally, use a small web server (see docs/SETUP.md).';
      errorBox.classList.remove('hidden');
    });
})();
