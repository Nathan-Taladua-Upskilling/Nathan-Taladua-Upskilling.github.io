/* Renders the tutor list and the subject filter. */
(function () {
  'use strict';
  var el = ABC.el, initials = ABC.initials;

  var listEl = document.getElementById('tutor-list');
  var filterEl = document.getElementById('subject-filter');
  var allTutors = [];

  function availabilitySummary(tutor) {
    return tutor.availability.map(function (a) { return a.day.slice(0, 3); }).join(' · ');
  }

  function tutorCard(t) {
    var card = el('article', { class: 'card tutor-card' });

    card.appendChild(el('div', { class: 'tutor-head' }, [
      el('div', { class: 'avatar', style: 'background:' + t.color, 'aria-hidden': 'true', text: initials(t.name) }),
      el('div', {}, [
        el('h3', { text: t.name }),
        el('div', { class: 'grade', text: t.gradeLevels })
      ])
    ]));

    if (t.blurb) card.appendChild(el('p', { class: 'muted mt-0', text: t.blurb }));

    card.appendChild(el('div', { class: 'chips' },
      t.subjects.map(function (s) { return el('span', { class: 'chip', text: s }); })
    ));

    var avail = el('ul', { class: 'availability' });
    t.availability.forEach(function (a) {
      avail.appendChild(el('li', {}, [
        el('span', { class: 'day', text: a.day + ': ' }),
        document.createTextNode(a.slots.join(', '))
      ]));
    });
    card.appendChild(el('div', {}, [el('strong', { text: 'Availability' }), avail]));

    card.appendChild(el('p', { class: 'contact-line' }, [
      el('a', { href: 'mailto:' + t.email, text: t.email }),
      document.createTextNode('  ·  ' + t.phone)
    ]));

    card.appendChild(el('a', {
      class: 'btn btn-primary',
      href: 'book.html?tutor=' + encodeURIComponent(t.id),
      text: 'Book ' + t.name.split(' ')[0]
    }));

    return card;
  }

  function render(tutors) {
    listEl.innerHTML = '';
    if (!tutors.length) {
      listEl.appendChild(el('p', { class: 'muted', text: 'No tutors match that subject yet.' }));
      return;
    }
    tutors.forEach(function (t) { listEl.appendChild(tutorCard(t)); });
  }

  function buildFilter(tutors) {
    var subjects = {};
    tutors.forEach(function (t) { t.subjects.forEach(function (s) { subjects[s] = true; }); });
    Object.keys(subjects).sort().forEach(function (s) {
      filterEl.appendChild(el('option', { value: s, text: s }));
    });
    filterEl.addEventListener('change', function () {
      var v = filterEl.value;
      render(v ? tutors.filter(function (t) { return t.subjects.indexOf(v) !== -1; }) : tutors);
    });
  }

  ABC.loadJSON('data/tutors.json')
    .then(function (data) {
      allTutors = data.tutors || [];
      buildFilter(allTutors);
      render(allTutors);
    })
    .catch(function () {
      listEl.innerHTML = '';
      listEl.appendChild(el('p', { class: 'notice notice-warn',
        text: 'Could not load the tutor list. If you are previewing locally, run a small web server (see docs/SETUP.md) rather than opening the file directly.' }));
    });
})();
