/* Southern Downs 4x4 — site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;
  var header = $('.site-header');
  var root = document.documentElement;

  /* ---------- Mobile menu ---------- */
  var menu = $('[data-menu]');
  function setMenu(open) {
    if (!menu) return;
    menu.setAttribute('data-open', open ? '1' : '0');
    body.classList.toggle('menu-open', open);
    $$('[data-on="toggleMenu"]').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  }
  $$('[data-on="toggleMenu"]').forEach(function (b) { b.addEventListener('click', function () { setMenu(menu.getAttribute('data-open') !== '1'); }); });
  $$('[data-on="closeMenu"]').forEach(function (b) { b.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveals ---------- */
  var io = null;
  function observe(els, cls, opts) {
    if (!els.length) return;
    if (reduce || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add(cls); }); return; }
    var o = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add(cls); o.unobserve(en.target); } });
    }, opts);
    els.forEach(function (el) { o.observe(el); });
    setTimeout(function () { els.forEach(function (el) { el.classList.add(cls); }); }, 7000);
  }
  observe($$('[data-reveal]'), 'is-in', { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  observe($$('[data-reveal-tile]'), 'is-in-tile', { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
  if (!body.classList.contains('page-home')) {
    var vh0 = window.innerHeight || 800;
    var secs = $$('main section').filter(function (el) {
      return !el.parentElement.closest('section') && !el.querySelector(':scope > [data-parallax]') && el.getBoundingClientRect().top >= vh0;
    });
    secs.forEach(function (el) { el.classList.add('rv'); });
    observe(secs, 'is-in', { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  }

  /* ---------- Scroll effects ---------- */
  var heroText = $('[data-hero-text]');
  var story = $('[data-story]');
  var heroSection = body.classList.contains('page-home') ? $('main > section') : null;
  var raf = null;
  function applyScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    var vh = window.innerHeight || 800;
    var threshold = heroSection ? heroSection.offsetHeight - 72 : 40;
    if (header) header.classList.toggle('is-solid', y > threshold);
    if (reduce) return;
    if (heroText) {
      heroText.style.transform = 'translate3d(0,' + (y * 0.28).toFixed(1) + 'px,0)';
      heroText.style.opacity = String(Math.max(0, 1 - y / 520));
    }
    $$('[data-parallax]').forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.16;
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var offset = (r.top + r.height / 2 - vh / 2) * -speed;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0) scale(1.18)';
    });
    if (story) {
      var r = story.getBoundingClientRect();
      var span = Math.max(1, r.height - vh);
      var p = Math.max(0, Math.min(0.9999, -r.top / span));
      var idx = Math.min(2, Math.floor(p * 3));
      var local = p * 3 - idx;
      $$('[data-story-img]', story).forEach(function (el, i) {
        var on = i === idx;
        el.style.opacity = on ? '1' : '0';
        var im = el.firstElementChild;
        if (im) im.style.transform = on ? 'scale(1.0)' : 'scale(1.08)';
      });
      $$('[data-story-txt]', story).forEach(function (el, i) {
        var on = i === idx;
        el.style.opacity = on ? '1' : '0';
        el.style.transform = on ? 'translateY(0)' : (i < idx ? 'translateY(-40px)' : 'translateY(40px)');
        el.style.pointerEvents = on ? 'auto' : 'none';
      });
      $$('[data-story-dot]', story).forEach(function (el, i) {
        var fill = el.firstElementChild;
        if (fill) fill.style.transform = 'scaleX(' + (i < idx ? 1 : i === idx ? local : 0).toFixed(3) + ')';
      });
      var num = $('[data-story-num]', story);
      if (num) num.textContent = '0' + (idx + 1);
    }
  }
  function onScroll() { if (raf) return; raf = requestAnimationFrame(function () { raf = null; applyScroll(); }); }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  applyScroll();

  /* ---------- Conditional blocks + text slots ---------- */
  function setIf(name, on) { $$('[data-if="' + name + '"]').forEach(function (el) { el.hidden = !on; }); }
  function setText(name, v) { $$('[data-text="' + name + '"]').forEach(function (el) { el.textContent = v; }); }

  /* ---------- Builds page ---------- */
  var BUILDS = {
    tradie: { title: 'Tradie work and weekend rig', story: "Built to work Monday to Friday and switch to weekend mode without missing a beat. A tough canopy and alloy tray for the tools, with enough lighting and storage to tow the boat or camp on the way home." },
    river: { title: 'River-ready off-road tourer', story: "Set up for forestry tracks, river crossings and the kind of country that doesn't forgive a soft setup. Recovery points, a bar built for the job and driving lights for getting home after dark." },
    fishing: { title: 'Weekend fishing and towing rig', story: "A dual-cab that works as hard on the boat ramp as it does on the daily commute. Roof rack for the gear, a canopy for security, and a setup strong enough to tow with confidence." },
    highcountry: { title: 'High-country touring build', story: "Planned around long days in the ranges — bar and recovery gear up front, a roof rack for the extra gear, and driving lights for the drive back out in the dark." },
    camping: { title: 'Family touring and camping set-up', story: "A tourer built for family trips away — drawers and a fridge setup that turns the tray into a basecamp, with the protection and lighting to get there and back." },
    sxs: { title: 'SXS and buggy fit-outs', story: "Side-by-sides get the same treatment as our 4WDs. Light bars and driving lights for early starts, UHF and 12V wired properly, plus a winch and protection for when the track gets rough — whether it's working the property or out for the weekend." }
  };
  var buildKeys = Object.keys(BUILDS);
  function selectBuild(key) {
    var b = BUILDS[key];
    setIf('hasSelection', !!b);
    setIf('isGalleryView', !b);
    buildKeys.forEach(function (k) { setIf('is' + k.charAt(0).toUpperCase() + k.slice(1), k === key); });
    setText('selectedTitle', b ? b.title : '');
    setText('selectedStory', b ? b.story : '');
    if (b) { history.replaceState(null, '', '#' + key); window.scrollTo(0, 0); }
    else if (location.hash) history.replaceState(null, '', location.pathname);
    applyScroll();
  }
  buildKeys.forEach(function (k) {
    var fn = 'select' + k.charAt(0).toUpperCase() + k.slice(1);
    $$('[data-on="' + fn + '"]').forEach(function (el) {
      el.setAttribute('role', 'button'); el.tabIndex = 0;
      el.addEventListener('click', function (e) { e.preventDefault(); selectBuild(k); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectBuild(k); } });
    });
  });
  $$('[data-on="clearSelection"]').forEach(function (el) { el.addEventListener('click', function () { selectBuild(null); }); });
  if (body.classList.contains('page-builds')) {
    var h = location.hash.replace('#', '');
    if (BUILDS[h]) selectBuild(h);
  }
  var rail = $('[data-ref="igRailRef"]');
  $$('[data-on="igNext"]').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!rail) return;
      var step = rail.clientWidth * 0.8;
      var atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 8;
      rail.scrollTo({ left: atEnd ? 0 : rail.scrollLeft + step, behavior: 'smooth' });
    });
  });

  /* ---------- Google reviews (reviews.json) ---------- */
  var tpl = $('template[data-for="visibleReviews"]');
  if (tpl) {
    var expanded = false, reviews = [];
    function renderReviews() {
      var host = tpl.parentElement;
      $$('.review-item', host).forEach(function (n) { n.remove(); });
      var list = expanded ? reviews : reviews.slice(0, 8);
      list.forEach(function (r) {
        var frag = tpl.content.cloneNode(true);
        var el = frag.firstElementChild; el.classList.add('review-item');
        var name = r.name || 'Google user';
        setTextIn(el, 'initial', name.trim().charAt(0).toUpperCase());
        setTextIn(el, 'name', name);
        setTextIn(el, 'date', r.date || '');
        setTextIn(el, 'text', r.text || '');
        var stars = $('[data-stars]', el);
        if (stars) { var n = Math.max(0, Math.min(5, Number(r.stars) || 5)); while (stars.children.length > n) stars.lastElementChild.remove(); }
        host.appendChild(frag);
      });
      setIf('hasReviews', reviews.length > 0);
      setIf('noReviews', reviews.length === 0);
      setIf('showLoadMore', !expanded && reviews.length > 8);
    }
    function setTextIn(el, f, v) { $$('[data-field="' + f + '"]', el).forEach(function (n) { n.textContent = v; }); }
    $$('[data-on="loadMore"]').forEach(function (b) { b.addEventListener('click', function () { expanded = true; renderReviews(); }); });
    fetch('reviews.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (d) {
      reviews = Array.isArray(d.reviews) ? d.reviews : [];
      var count = d.count || reviews.length;
      setText('ratingText', d.rating ? Number(d.rating).toFixed(1) : '5.0');
      setText('countText', count ? count + ' reviews on Google' : 'Reviews on Google');
      if (d.reviewUrl) $$('[data-href="reviewUrl"]').forEach(function (a) { a.href = d.reviewUrl; });
      renderReviews();
    }).catch(function () {});
  }

  /* ---------- Book: guided quote form ---------- */
  var form = $('[data-ref="formRef"]');
  if (form) {
    var state = { step: 1, chips: [], pref: 'Call me', sending: false, mountedAt: Date.now(), captchaId: undefined };
    var CHIPS_MAX = 16;
    function setError(msg) {
      setIf('hasError', !!msg); setText('errorMsg', msg || '');
    }
    function goStep(n) {
      state.step = n; setError('');
      $$('.pane', form).forEach(function (p) {
        var k = Number(p.getAttribute('data-pane'));
        p.classList.toggle('is-active', k === n);
        p.classList.toggle('is-prev', k < n);
      });
      $$('.prog-fill', form).forEach(function (p) { p.classList.toggle('is-done', Number(p.getAttribute('data-prog')) <= n); });
      $$('.step-tab', form).forEach(function (t) { t.classList.toggle('is-active', Number(t.getAttribute('data-tab')) === n); });
      var top = form.getBoundingClientRect().top + window.scrollY - 90;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduce ? 'auto' : 'smooth' });
    }
    function field(n) { return form.elements[n]; }
    function updateSummary() {
      var f = { make: field('field[15]').value, model: field('field[16]').value, year: field('field[18]').value };
      var v = [f.year, f.make, f.model].filter(Boolean).join(' ') || 'Your vehicle';
      setText('summaryVehicle', v);
      var t = $('template[data-for="summaryChips"]');
      if (t) {
        var host = t.parentElement;
        $$('.summary-chip', host).forEach(function (n) { n.remove(); });
        state.chips.forEach(function (c) {
          var frag = t.content.cloneNode(true); var el = frag.firstElementChild; el.classList.add('summary-chip');
          $$('[data-field="c"]', el).forEach(function (n) { n.textContent = c; }); if (!$('[data-field="c"]', el)) el.textContent = c;
          host.insertBefore(frag, t);
        });
      }
      setIf('summaryEmpty', state.chips.length === 0);
    }
    $$('[data-on="goStep1"]', form).forEach(function (b) { b.addEventListener('click', function () { goStep(1); }); });
    $$('[data-on="goStep2"]', form).forEach(function (b) { b.addEventListener('click', function () { goStep(2); }); });
    $$('[data-on="goStep3"]', form).forEach(function (b) { b.addEventListener('click', function () { goStep(3); }); });
    $$('[data-on="next1"]', form).forEach(function (b) { b.addEventListener('click', function () {
      var req = ['field[15]', 'field[16]'];
      for (var i = 0; i < req.length; i++) { if (!field(req[i]).value.trim()) { field(req[i]).focus(); return setError('Make and model help us quote the right parts.'); } }
      goStep(2);
    }); });
    $$('[data-on="next2"]', form).forEach(function (b) { b.addEventListener('click', function () {
      if (!field('field[21]').value.trim() && !state.chips.length) { field('field[21]').focus(); return setError('Pick a few options or tell us what you have in mind.'); }
      goStep(3);
    }); });
    $$('[data-on="toggleChip"]', form).forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-chip');
        var i = state.chips.indexOf(v);
        if (i > -1) state.chips.splice(i, 1); else if (state.chips.length < CHIPS_MAX) state.chips.push(v);
        b.classList.toggle('is-on', i === -1); b.setAttribute('aria-pressed', i === -1 ? 'true' : 'false');
        updateSummary();
      });
    });
    form.addEventListener('input', function (e) { if (['field[15]', 'field[16]', 'field[18]'].indexOf(e.target.name) > -1) updateSummary(); });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'field[22]') {
        state.pref = e.target.value;
        $$('.seg', form).forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-seg') === state.pref); });
      }
    });
    goStep(1); updateSummary();
    $$('.seg', form).forEach(function (s) { s.classList.toggle('is-on', s.getAttribute('data-seg') === state.pref); });

    /* reCAPTCHA (explicit render) */
    var capEl = $('[data-ref="captchaRef"]', form);
    function initCaptcha() {
      if (state.captchaId !== undefined) return;
      if (!capEl || !window.grecaptcha || !window.grecaptcha.render) { setTimeout(initCaptcha, 300); return; }
      state.captchaId = window.grecaptcha.render(capEl, { sitekey: '6LcwIw8TAAAAACP1ysM08EhCgzd6q5JAOUR1a0Go' });
    }
    initCaptcha();

    function serialize() {
      var q = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled) return;
        if (el.name === 'website_url') return;
        if (el.type === 'radio' && el.name === 'field[22]') { if (el.value !== state.pref) return; q.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value)); return; }
        if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
        if (el.type === 'submit' || el.type === 'button' || el.type === 'file') return;
        var v = el.value;
        if (el.name === 'field[21]' && state.chips.length) v = 'Interested in: ' + state.chips.join(', ') + '\n\n' + v;
        q.push(encodeURIComponent(el.name) + '=' + encodeURIComponent(v));
      });
      return q.join('&');
    }
    var submitBtn = $('button[type="submit"]', form);
    function setSending(on) {
      state.sending = on;
      if (submitBtn) { submitBtn.disabled = on; setText('submitLabel', on ? 'Sending…' : 'Send quote request'); }
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fail = function (msg) { setError(msg); setSending(false); };
      if (field('website_url') && field('website_url').value) return;
      if (Date.now() - state.mountedAt < 3000) return fail('Please take a moment to check your details, then send again.');
      var req = [['field[15]', 1], ['field[16]', 1], ['fullname', 3], ['phone', 3], ['email', 3]];
      for (var i = 0; i < req.length; i++) {
        var el = field(req[i][0]);
        if (!el || !el.value.trim()) { goStep(req[i][1]); setTimeout(function () { el && el.focus(); }, 450); return fail('Please fill in all required fields.'); }
      }
      if (!field('field[21]').value.trim() && !state.chips.length) { goStep(2); return fail('Tell us what you want the vehicle to do.'); }
      var email = field('email').value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) { field('email').focus(); return fail('Please enter a valid email address.'); }
      var phone = field('phone').value.replace(/\s+/g, '');
      if (!/^(\+?61|0)[2-9]\d{8}$/.test(phone)) { field('phone').focus(); return fail('Please enter a valid Australian phone number.'); }
      var token = window.grecaptcha && state.captchaId !== undefined ? window.grecaptcha.getResponse(state.captchaId) : '';
      if (!token) return fail("Please tick the \"I'm not a robot\" box.");
      setSending(true); setError('');
      var serialized = serialize();
      var make = field('field[15]').value, model = field('field[16]').value, year = field('field[18]').value;
      window._show_thank_you = function () {
        setSending(false);
        setText('confirmMake', make); setText('confirmModel', model); setText('confirmYear', year);
        setIf('isFormView', false); setIf('isSubmitted', true);
        window.scrollTo(0, 0);
      };
      window._show_error = function (id, message) {
        fail((message || 'Sorry, your request could not be sent. Please call us on 07 4548 9580.').replace(/<[^>]+>/g, ''));
        if (window.grecaptcha) window.grecaptcha.reset(state.captchaId);
      };
      window._show_unsubscribe = window._show_thank_you; window._show_pc_confirmation = window._show_thank_you;
      var sc = document.createElement('script');
      sc.src = 'https://toptwomc.activehosted.com/proc.php?' + serialized + '&jsonp=true';
      sc.onerror = function () { window._show_error(9, serialized.length > 10000 ? 'Sorry, your submission failed. Please shorten your responses and try again.' : ''); };
      document.head.appendChild(sc);
    });
  }
})();
