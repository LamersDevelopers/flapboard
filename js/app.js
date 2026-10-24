/* Приложение: плеер карточек, меню, пульт. */
(function (G) {
  'use strict';
  var E = G.FlapEngine, C = G.FlapContent, Board = G.FlapBoard;

  // ---------- Настройки ----------
  var OPTS = {
    mode: [['mix', 'Микс', 'Mix'], ['text', 'Тексты', 'Texts'], ['art', 'Картинки', 'Pictures'], ['net', 'Интернет', 'Internet']],
    interval: [[15, '15 сек'], [30, '30 сек'], [60, '1 мин'], [120, '2 мин'], [300, '5 мин'], [600, '10 мин'], [1800, '30 мин']],
    sound: [[0, 'Выкл', 'Off'], [1, 'Тихо', 'Low'], [2, 'Средне', 'Medium'], [3, 'Громко', 'Loud']],
    style: [['white', 'Белая', 'White'], ['black', 'Чёрная', 'Black']],
    lang: [['ru', 'Русский'], ['en', 'English']],
    search: [[true, 'Да', 'Yes'], [false, 'Нет', 'No']]
  };
  var DEFAULTS = { themeId: 'saab', themes: ['saab'], custom: '', mode: 'mix', interval: 30, sound: 2, style: 'white', lang: 'ru', city: 'Hadera', apiKey: '', model: 'claude-sonnet-5-5', search: true };
  var S = {};
  function load() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('flapboard.v1') || '{}') || {}; } catch (e) { saved = {}; }
    var cfg = G.FLAPBOARD_CONFIG || {};
    Object.keys(DEFAULTS).forEach(function (k) { S[k] = saved[k] !== undefined ? saved[k] : (cfg[k] !== undefined ? cfg[k] : DEFAULTS[k]); });
    if (!S.apiKey && cfg.apiKey) S.apiKey = cfg.apiKey;
    if (S.themeId === 'weather') S.themeId = 'clock';
    if (!Array.isArray(S.themes) || !S.themes.length) S.themes = [S.themeId];
    S.themes = S.themes.map(function (id) { return id === 'weather' ? 'clock' : id; }).filter(function (id, i, a) { return E.findTheme(id) && a.indexOf(id) === i; });
    if (!S.themes.length) S.themes = ['saab'];
    S.themeId = S.themes[0];
  }
  function save() { try { localStorage.setItem('flapboard.v1', JSON.stringify(S)); } catch (e) { } }
  function optLabel(k, v) {
    var o = OPTS[k].filter(function (x) { return x[0] === v; })[0] || OPTS[k][0];
    return S.lang === 'en' && o[2] ? o[2] : o[1];
  }
  function cycle(k) {
    var list = OPTS[k], i = 0;
    for (var j = 0; j < list.length; j++) if (list[j][0] === S[k]) i = j;
    S[k] = list[(i + 1) % list.length][0];
  }

  // ---------- Табло ----------
  var board = new Board(document.getElementById('frame'));
  function layout() {
    var vv = G.visualViewport, W = Math.min(G.innerWidth, vv ? vv.width * vv.scale : 1e9), H = Math.min(G.innerHeight, vv ? vv.height * vv.scale : 1e9);
    // ширина: 22*cw + 21*gap*0.55 + 2*1.8*gap; высота: 6*ch + 5*gap + 2*1.6*gap; ch = 1.34*cw; gap = 0.22*cw
    var g = 0.22, k = 1.34;
    var small = Math.min(W, H) < 600;
    var cwW = (W * (small ? 0.97 : 0.95)) / (22 + 21 * g * 0.55 + 3.6 * g);
    var cwH = (H * (small ? 0.80 : 0.86)) / (6 * k + 5 * g + 3.2 * g);
    var cw = Math.floor(Math.min(cwW, cwH));
    var root = document.documentElement.style;
    root.setProperty('--cw', cw + 'px');
    root.setProperty('--ch', Math.round(cw * k) + 'px');
    root.setProperty('--gap', Math.round(cw * g) + 'px');
    root.setProperty('--fs', Math.round(cw * k * 0.66) + 'px');
  }
  layout();
  G.addEventListener('resize', layout);
  G.addEventListener('orientationchange', function () { setTimeout(layout, 250); });

  // ---------- Плеер ----------
  var deck = null, queue = [], history = [], hpos = -1, timer = null, paused = false, showing = false, gen = 0, liveTimer = null;
  var statusEl = document.getElementById('status'), statusText = document.getElementById('statusText');
  var statusHide = null;
  function themeTitle(id) { var th = E.findTheme(id); return th ? (S.lang === 'en' ? th.en : th.ru) : ''; }
  function topicName() {
    if (S.custom) return S.custom;
    if (S.themes.length === 1) return themeTitle(S.themes[0]);
    var names = S.themes.map(themeTitle).join(', ');
    return (S.lang === 'en' ? 'Mix: ' : 'Микс: ') + (names.length > 48 ? S.themes.length + (S.lang === 'en' ? ' themes' : ' тем') : names);
  }
  function status(msg, loading, sticky) {
    statusText.textContent = msg;
    statusEl.className = 'show' + (loading ? ' loading' : '');
    clearTimeout(statusHide);
    if (!sticky) statusHide = setTimeout(function () { statusEl.className = ''; }, 3500);
  }
  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.className = 'show';
    setTimeout(function () { t.className = ''; }, 7000);
  }
  function showGrid(g) {
    showing = true;
    return board.show(g).then(function () { showing = false; });
  }
  function schedule() {
    clearTimeout(timer);
    if (paused || (deck && deck.live)) return;
    timer = setTimeout(function () { next(); }, S.interval * 1000);
  }
  function rebuild() {
    var my = ++gen;
    clearTimeout(timer); clearInterval(liveTimer);
    queue = [];
    status(topicName() + ' · ' + optLabel('mode', S.mode), true, true);
    return E.buildMulti({ themeIds: S.themes, themeId: S.themes[0], custom: S.custom, mode: S.mode, lang: S.lang, style: S.style, city: S.city, apiKey: '', model: S.model, search: S.search })
      .then(function (d) {
        if (my !== gen) return false;
        deck = d; queue = avoidRecent(d.cards.slice());
        status(topicName() + ' · ' + optLabel('mode', S.mode), false);
        if (d.notes.length) toast(d.notes.join(' · '));
        if (d.live) {
          var last = '', idx = 0, since = Date.now(), refreshed = Date.now();
          var tick = function () {
            var now = Date.now();
            if (!paused && now - since >= S.interval * 1000) { idx++; since = now; }
            if (d.refresh && now - refreshed > 15 * 60000) { refreshed = now; d.refresh(); }
            idx = idx % d.cards.length;
            var g = d.cards[idx](), s = JSON.stringify(g);
            if (s !== last && !showing) { last = s; showGrid(g); }
          };
          d.step = function (k) { idx = (idx + k + d.cards.length) % d.cards.length; since = Date.now(); last = ''; tick(); };
          tick(); liveTimer = setInterval(tick, 1000);
        }
        return true;
      }).catch(function (e) { status('Ошибка: ' + e.message, false); return false; });
  }
  var recent = [];
  function avoidRecent(cards) {
    var fresh = [], old = [];
    cards.forEach(function (f) { (f.key && recent.indexOf(f.key) >= 0 ? old : fresh).push(f); });
    return fresh.concat(old);
  }
  function next() {
    if (deck && deck.live) { if (deck.step) deck.step(1); return; }
    if (hpos < history.length - 1) { hpos++; showGrid(history[hpos]).then(schedule); return; }
    var p = queue.length ? Promise.resolve(true) : rebuild();
    p.then(function (ok) {
      if (!ok && !queue.length) { schedule(); return; }
      if (deck && deck.live) return;
      var g;
      var fn = queue.shift();
      try { g = fn(); } catch (e) { g = E.patternCard(); }
      if (fn && fn.key) { recent.push(fn.key); if (recent.length > 60) recent.shift(); }
      history.push(g); if (history.length > 40) history.shift();
      hpos = history.length - 1;
      showGrid(g).then(schedule);
    });
  }
  function prev() {
    if (deck && deck.live) { if (deck.step) deck.step(-1); return; }
    if (hpos > 0) { hpos--; showGrid(history[hpos]).then(schedule); }
  }
  function restart() {
    history = []; hpos = -1; deck = null;
    rebuild().then(function (ok) { if (ok && !deck.live) next(); });
  }
  function applyStyle() { document.body.className = S.style === 'black' ? 'black' : 'white'; }

  // ---------- Меню ----------
  var menu = document.getElementById('menu'), themeList = document.getElementById('themeList');
  var cols = [[], []], fc = 0, fi = 0, menuOpen = false;
  var customInput = document.getElementById('customInput'), cityInput = document.getElementById('cityInput');
  function buildThemeList() {
    themeList.innerHTML = '';
    C.THEMES.forEach(function (th) {
      var d = document.createElement('div');
      d.className = 'item theme';
      d.setAttribute('data-theme', th.id);
      d.innerHTML = '<span class="lbl"></span>';
      d.firstChild.textContent = S.lang === 'en' ? th.en : th.ru;
      themeList.appendChild(d);
    });
    cols[0] = [].slice.call(document.querySelectorAll('#colThemes > form .item, #colThemes > .item')).concat([].slice.call(themeList.children));
    cols[1] = [].slice.call(document.querySelectorAll('#colSettings .item'));
    cols.forEach(function (col, ci) {
      col.forEach(function (el, ii) {
        el.onclick = function (ev) { if (ev.target.tagName === 'INPUT') { fc = ci; fi = ii; render(); return; } fc = ci; fi = ii; activate(); };
      });
    });
  }
  function render() {
    [].forEach.call(document.querySelectorAll('.item'), function (el) { el.classList.remove('focus'); el.classList.remove('current'); });
    var el = cols[fc][fi]; if (el) el.classList.add('focus');
    [].forEach.call(themeList.children, function (el) { el.classList.toggle('checked', sel.indexOf(el.getAttribute('data-theme')) >= 0); });
    if (S.custom) customInput.parentNode.classList.add('current');
    // прокрутка списка тем
    if (fc === 0 && fi <= 4) themeList.scrollTop = 0;
    else if (fc === 0) {
      var it = cols[0][fi], top = it.offsetTop, h = themeList.clientHeight;
      if (top + it.offsetHeight > themeList.scrollTop + h) themeList.scrollTop = top + it.offsetHeight - h;
      if (top < themeList.scrollTop) themeList.scrollTop = top;
    }
    cols[1].forEach(function (el) {
      var k = el.getAttribute('data-k'), v = el.querySelector('.val');
      if (v) v.textContent = optLabel(k, S[k]);
    });
  }
  function openMenu() {
    menuOpen = true; menu.className = '';
    customInput.value = S.custom; cityInput.value = S.city;
    fc = 0; fi = 0;
    sel = S.custom ? [] : S.themes.slice();
    if (!S.custom) { for (var q = cols[0].length - 1; q >= 0; q--) if (sel.indexOf(cols[0][q].getAttribute('data-theme')) >= 0) fi = q; }
    render();
  }
  function closeMenu() { menuOpen = false; menu.className = 'hidden'; blurInputs(); }
  function blurInputs() { [customInput, cityInput].forEach(function (i) { i.blur(); }); }
  var settingsDirty = false, sel = [];
  // Применить отмеченные темы. force — нажата кнопка «Показать выбранные».
  function applyThemes(force) {
    if (!sel.length) { if (force) toast(S.lang === 'en' ? 'Tick at least one theme' : 'Отметьте хотя бы одну тему'); return false; }
    var same = !S.custom && sel.length === S.themes.length && sel.every(function (id) { return S.themes.indexOf(id) >= 0; });
    if (same && !force) return false;
    var order = C.THEMES.map(function (t) { return t.id; });
    S.themes = sel.slice().sort(function (a, b) { return order.indexOf(a) - order.indexOf(b); });
    S.themeId = S.themes[0]; S.custom = ''; save();
    return true;
  }
  function activate() {
    var el = cols[fc][fi]; if (!el) return;
    var k = el.getAttribute('data-k'), th = el.getAttribute('data-theme');
    if (th) { var at = sel.indexOf(th); if (at >= 0) sel.splice(at, 1); else sel.push(th); render(); return; }
    if (k === 'themesAll') { var all = C.THEMES.map(function (t) { return t.id; }); sel = sel.length === all.length ? [] : all; render(); return; }
    if (k === 'themesGo') { if (applyThemes(true)) { closeMenu(); restart(); } return; }
    if (k === 'customGo') { commitInput(customInput); return; }
    if (k === 'close') { var ch = applyThemes(false); closeMenu(); if (settingsDirty || ch) { settingsDirty = false; restart(); } return; }
    var inp = el.querySelector('input');
    if (inp) { inp.focus(); return; }
    if (OPTS[k]) {
      cycle(k); save(); settingsDirty = true;
      if (k === 'sound') board.sound.setLevel(S.sound);
      if (k === 'style') applyStyle();
      if (k === 'lang') buildThemeList();
      render();
    }
  }
  function commitInput(inp) {
    var v = inp.value.trim();
    if (inp === customInput) {
      inp.blur();
      if (v) { S.custom = v; save(); closeMenu(); restart(); }
      else toast(S.lang === 'en' ? 'Type a topic first' : 'Сначала впишите тему');
      return;
    }
    if (inp === cityInput) S.city = v || DEFAULTS.city;
    save(); settingsDirty = true; inp.blur(); render();
  }
  [customInput, cityInput].forEach(function (inp) {
    inp.addEventListener('keydown', function (e) {
      var c = e.keyCode;
      if (c === 13 || c === 65376) { e.preventDefault(); e.stopPropagation(); commitInput(inp); }
      else if (c === 65385 || c === 10009 || c === 27) { e.preventDefault(); e.stopPropagation(); inp.blur(); }
      else if (c === 38 || c === 40) { e.preventDefault(); inp.blur(); handleMenuKey(c); e.stopPropagation(); }
      else e.stopPropagation();
    });
    inp.addEventListener('change', function () { if (inp !== customInput) commitInput(inp); });
  });
  // кнопка «Перейти/Go» на экранной клавиатуре телефона/ТВ отправляет форму
  document.getElementById('customForm').addEventListener('submit', function (e) { e.preventDefault(); commitInput(customInput); });
  customInput.addEventListener('keyup', function (e) { if (e.key === 'Enter') { e.preventDefault(); commitInput(customInput); } });
  function handleMenuKey(c) {
    switch (c) {
      case 38: fi = Math.max(0, fi - 1); break;
      case 40: fi = Math.min(cols[fc].length - 1, fi + 1); break;
      case 37: case 39:
        fc = fc ? 0 : 1; fi = Math.min(fi, cols[fc].length - 1);
        break;
      case 13: activate(); return;
      case 10009: case 27: case 8: var ch2 = applyThemes(false); closeMenu(); if (settingsDirty || ch2) { settingsDirty = false; restart(); } return;
      default: return;
    }
    render();
  }

  // ---------- Пульт ----------
  var KEYS = ['MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaFastForward', 'MediaRewind', 'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue', 'ChannelUp', 'ChannelDown',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  try { if (G.tizen && tizen.tvinputdevice) tizen.tvinputdevice.registerKeyBatch(KEYS); } catch (e) { try { KEYS.forEach(function (k) { try { tizen.tvinputdevice.registerKey(k); } catch (e2) { } }); } catch (e3) { } }
  try { if (G.webapis && webapis.appcommon) webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF); } catch (e) { }

  var hint = document.getElementById('hint');
  var hintTimer = setTimeout(function () { hint.className = 'off'; }, 8000);
  function stepTheme(d) {
    var ids = C.THEMES.map(function (t) { return t.id; });
    var i = S.custom ? 0 : Math.max(0, ids.indexOf(S.themes[0]));
    S.custom = ''; S.themeId = ids[(i + d + ids.length) % ids.length]; S.themes = [S.themeId]; save(); restart();
  }
  document.addEventListener('keydown', function (e) {
    board.sound.init();
    var c = e.keyCode;
    if (menuOpen) { e.preventDefault(); handleMenuKey(c); return; }
    hint.className = ''; clearTimeout(hintTimer); hintTimer = setTimeout(function () { hint.className = 'off'; }, 4000);
    switch (c) {
      case 13: openMenu(); break;
      case 39: case 427: case 417: next(); break;
      case 37: case 428: case 412: prev(); break;
      case 38: stepTheme(-1); break;
      case 40: stepTheme(1); break;
      case 10252: case 415: case 19: case 405: case 32:
        paused = !paused; status(paused ? (S.lang === 'en' ? 'PAUSED' : 'ПАУЗА') : (S.lang === 'en' ? 'PLAY' : 'ВОСПРОИЗВЕДЕНИЕ'));
        if (!paused) next(); else clearTimeout(timer);
        break;
      case 403: S.sound = S.sound ? 0 : 2; board.sound.setLevel(S.sound); save(); status((S.lang === 'en' ? 'Sound: ' : 'Звук: ') + optLabel('sound', S.sound)); break;
      case 404: cycle('mode'); save(); restart(); break;
      case 406: cycle('style'); applyStyle(); save(); break;
      case 10009: case 27:
        if (!isApp) return;
        try { tizen.application.getCurrentApplication().exit(); } catch (err) { }
        break;
      default:
        if (c >= 48 && c <= 57) { var n = c === 48 ? 9 : c - 49; if (C.THEMES[n]) { S.custom = ''; S.themeId = C.THEMES[n].id; S.themes = [S.themeId]; save(); restart(); } }
        else return;
    }
    e.preventDefault();
  });
  // ---------- Режим браузера (курсор пульта / мышь) ----------
  var isApp = !!(G.tizen && G.tizen.application);
  var bar = document.getElementById('bar'), barTimer = null, wakeLock = null;
  function showBar() {
    if (menuOpen) return;
    bar.className = 'show'; clearTimeout(barTimer);
    barTimer = setTimeout(function () { bar.className = ''; }, 5000);
  }
  function keepAwake() {
    try {
      if (navigator.wakeLock && !wakeLock) navigator.wakeLock.request('screen').then(function (l) {
        wakeLock = l; l.addEventListener('release', function () { wakeLock = null; });
      }).catch(function () { });
    } catch (e) { }
  }
  function toggleFull() {
    var d = document, el = d.documentElement;
    try {
      if (d.fullscreenElement || d.webkitFullscreenElement) (d.exitFullscreen || d.webkitExitFullscreen).call(d);
      else {
        var pr = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
        var lock = function () { try { if (screen.orientation && screen.orientation.lock && Math.min(screen.width, screen.height) < 900) screen.orientation.lock('landscape').catch(function () { }); } catch (e) { } };
        if (pr && pr.then) pr.then(lock).catch(function () { }); else lock();
      }
    } catch (e) { }
  }
  var firstTap = true;
  document.addEventListener('click', function (e) {
    board.sound.init(); keepAwake();
    if (menuOpen || (e.target.closest && e.target.closest('#menu'))) return;
    var btn = e.target.closest && e.target.closest('#bar button');
    if (btn) {
      var a = btn.getAttribute('data-a');
      if (a === 'prev') prev();
      else if (a === 'next') next();
      else if (a === 'menu') { bar.className = ''; openMenu(); return; }
      else if (a === 'full') toggleFull();
      else if (a === 'pause') { paused = !paused; status(paused ? 'ПАУЗА' : 'ВОСПРОИЗВЕДЕНИЕ'); if (!paused) next(); else clearTimeout(timer); }
      showBar(); return;
    }
    if (firstTap && !isApp) { firstTap = false; toggleFull(); }
    showBar();
  });
  document.addEventListener('mousemove', showBar);
  var touch = ('ontouchstart' in G) || (navigator.maxTouchPoints > 0);
  if (!isApp) { hint.textContent = touch ? 'Коснитесь доски — появятся кнопки' : 'Нажмите на доску — появятся кнопки · ☰ — темы и настройки'; }
  menu.addEventListener('click', function (e) { if (e.target === menu) closeMenu(); });

  // ---------- Старт ----------
  load();
  board.sound.setLevel(S.sound);
  applyStyle();
  buildThemeList();
  board.sound.init(); // на ТВ звук разрешён сразу; в браузере включится после первого нажатия
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { clearTimeout(timer); } else { board.sound.init(); keepAwake(); schedule(); }
  });
  setTimeout(restart, 400);

  G.FlapApp = { S: S, next: next, prev: prev, openMenu: openMenu, restart: restart, board: board };
})(this);
