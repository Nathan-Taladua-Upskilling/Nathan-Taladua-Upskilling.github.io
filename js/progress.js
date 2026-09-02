/* Dana's private view: each student's grade trend, drawn as a small SVG chart. */
(function () {
  'use strict';
  var el = ABC.el;
  var SVGNS = 'http://www.w3.org/2000/svg';

  function svg(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  function fmt(n) { return Number.isInteger(n) ? String(n) : n.toFixed(1); }

  function chart(records) {
    var W = 320, H = 120, padX = 28, padY = 16;
    var grades = records.map(function (r) { return r.grade; });
    var lo = Math.min.apply(null, grades);
    var hi = Math.max.apply(null, grades);
    if (hi === lo) { hi += 1; lo -= 1; }
    var span = hi - lo;

    function x(i) { return padX + (W - 2 * padX) * (records.length === 1 ? 0.5 : i / (records.length - 1)); }
    function y(g) { return padY + (H - 2 * padY) * (1 - (g - lo) / span); }

    var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'chart', role: 'img' });
    s.appendChild(svg('line', {
      x1: padX, y1: H - padY, x2: W - padX, y2: H - padY,
      stroke: '#F0E6D9', 'stroke-width': 1
    }));

    var pts = records.map(function (r, i) { return x(i) + ',' + y(r.grade); }).join(' ');
    s.appendChild(svg('polyline', {
      points: pts, fill: 'none', stroke: '#2FA8A0', 'stroke-width': 2.5,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round'
    }));

    records.forEach(function (r, i) {
      s.appendChild(svg('circle', { cx: x(i), cy: y(r.grade), r: 3.5, fill: '#2FA8A0' }));
      var t = svg('text', {
        x: x(i), y: H - padY + 12, 'text-anchor': 'middle',
        'font-size': 9, fill: '#6B7280', 'font-family': 'Nunito, sans-serif'
      });
      t.textContent = r.label;
      s.appendChild(t);
      var g = svg('text', {
        x: x(i), y: y(r.grade) - 7, 'text-anchor': 'middle',
        'font-size': 9, fill: '#3D4551', 'font-family': 'Nunito, sans-serif'
      });
      g.textContent = fmt(r.grade);
      s.appendChild(g);
    });
    return s;
  }

  function studentCard(stu) {
    var first = stu.records[0].grade;
    var last = stu.records[stu.records.length - 1].grade;
    var diff = last - first;
    var card = el('article', { class: 'card progress-card' });
    card.appendChild(el('h3', { text: stu.alias + '  ·  ' + stu.subject }));
    card.appendChild(el('div', { class: 'muted', style: 'font-size:.88rem',
      text: 'Tutor: ' + (stu.tutor || '—') }));
    var badge = el('span', {
      class: 'delta' + (diff < 0 ? ' down' : ''),
      text: (diff >= 0 ? '+' : '') + fmt(diff) + ' since ' + stu.records[0].label
    });
    card.appendChild(el('p', { style: 'margin:.4rem 0 0' }, [badge]));
    card.appendChild(chart(stu.records));
    return card;
  }

  ABC.loadJSON('data/progress.json')
    .then(function (data) {
      var students = data.students || [];
      var improved = students.filter(function (s) {
        return s.records[s.records.length - 1].grade > s.records[0].grade;
      }).length;

      var banner = document.getElementById('progress-banner');
      banner.innerHTML = '';
      banner.appendChild(el('div', {}, [
        el('strong', { text: improved + ' of ' + students.length }),
        el('div', { text: 'students improved since their first recorded grade' })
      ]));

      var grid = document.getElementById('progress-grid');
      students.forEach(function (s) { grid.appendChild(studentCard(s)); });

      if (data.note) {
        document.getElementById('progress-note').textContent = data.note;
      }
    })
    .catch(function () {
      document.getElementById('progress-grid').appendChild(el('p', {
        class: 'notice notice-warn',
        text: 'Could not load progress data. If previewing locally, use a small web server (see docs/SETUP.md).'
      }));
    });
})();
