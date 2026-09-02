/* Shared helpers used on every page. Exposes window.ABC. */
(function () {
  'use strict';

  var DEFAULT_CONFIG = {
    businessName: 'ABC Tutoring',
    tagline: 'Friendly, focused tutoring for every grade.',
    danaEmail: 'REPLACE_WITH_DANA_EMAIL@example.com',
    formEndpoint: '',
    sessionLengthMinutes: 60,
    googleCalendarEmbedSrc: '',
    googleCalendarShareLink: ''
  };

  var configPromise = null;

  function getConfig() {
    if (!configPromise) {
      configPromise = fetch('data/config.json')
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; })
        .then(function (c) {
          return Object.assign({}, DEFAULT_CONFIG, c);
        });
    }
    return configPromise;
  }

  function loadJSON(path) {
    return fetch(path).then(function (r) {
      if (!r.ok) throw new Error('Could not load ' + path);
      return r.json();
    });
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }

  /* Mark the current page in the nav. */
  function markActiveNav() {
    var here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(function (a) {
      var target = a.getAttribute('href');
      if (target === here || (here === 'index.html' && target === './')) {
        a.setAttribute('aria-current', 'page');
      }
    });
  }

  function setYear() {
    var y = document.querySelector('[data-year]');
    if (y) y.textContent = new Date().getFullYear();
  }

  document.addEventListener('DOMContentLoaded', function () {
    markActiveNav();
    setYear();
  });

  window.ABC = {
    getConfig: getConfig,
    loadJSON: loadJSON,
    el: el,
    initials: initials
  };
})();
