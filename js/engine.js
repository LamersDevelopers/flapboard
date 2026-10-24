/* Генерация карточек: раскладка текста, картинки, интернет-источники, ИИ. */
(function (G) {
  'use strict';
  var C = G.FlapContent, B = G.FlapBoard;
  var ROWS = B.ROWS, COLS = B.COLS;
  var ALLOWED = {};
  B.DRUM.forEach(function (c) { if (!/[a-z]/.test(c)) ALLOWED[c] = true; });
  var CHIP = { r: 1, o: 1, y: 1, g: 1, b: 1, v: 1, w: 1, k: 1 };
  var RAINBOW = ['r', 'o', 'y', 'g', 'b', 'v'];

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function blank() { var g = []; for (var r = 0; r < ROWS; r++) { var row = []; for (var c = 0; c < COLS; c++) row.push(' '); g.push(row); } return g; }

  // ---------- Текст ----------
  function normalize(s) {
    s = String(s).replace(/[«»“”„]/g, '"').replace(/[‘’`´]/g, '\'').replace(/[—–‑]/g, '-')
      .replace(/…/g, '...').replace(/№/g, '#').replace(/\t/g, ' ').replace(/ /g, ' ');
    s = s.toUpperCase().replace(/Ё/g, 'Е');
    return s;
  }
  // Строка -> массив токенов (символы и цветные плашки)
  function tokenize(line) {
    var out = [], i = 0;
    line = String(line);
    while (i < line.length) {
      var m = /^\{([a-zA-Z])\}/.exec(line.substr(i, 3));
      if (m && CHIP[m[1].toLowerCase()]) { out.push(m[1].toLowerCase()); i += 3; continue; }
      var ch = normalize(line[i]);
      for (var k = 0; k < ch.length; k++) out.push(ALLOWED[ch[k]] ? ch[k] : (ch[k] === ' ' ? ' ' : ''));
      i++;
    }
    return out.filter(function (t) { return t !== ''; });
  }
  function wrap(tokens, width) {
    var words = [], cur = [];
    tokens.forEach(function (t) { if (t === ' ') { if (cur.length) words.push(cur); cur = []; } else cur.push(t); });
    if (cur.length) words.push(cur);
    var lines = [], line = [];
    words.forEach(function (w) {
      while (w.length > width) { if (line.length) { lines.push(line); line = []; } lines.push(w.slice(0, width)); w = w.slice(width); }
      if (!w.length) return;
      if (!line.length) line = w.slice();
      else if (line.length + 1 + w.length <= width) line = line.concat([' '], w);
      else { lines.push(line); line = w.slice(); }
    });
    if (line.length) lines.push(line);
    return lines;
  }
  function textLines(text, width, maxRows) {
    var paras = String(text).split('\n'), lines = [];
    paras.forEach(function (p) { var w = wrap(tokenize(p), width); if (!w.length) lines.push([]); else lines.push.apply(lines, w); });
    if (lines.length > maxRows) { lines = lines.filter(function (l) { return l.length; }); }
    if (lines.length > maxRows) lines = wrap(tokenize(String(text).replace(/\n/g, ' ')), width);
    return lines;
  }
  function fits(text, width, rows) { return textLines(text, width || COLS, rows || ROWS).length <= (rows || ROWS); }
  function putText(g, text, x0, y0, w, h) {
    var lines = textLines(text, w, h);
    if (lines.length > h) { lines = lines.slice(0, h); }
    var top = y0 + Math.floor((h - lines.length) / 2);
    lines.forEach(function (l, i) {
      var left = x0 + Math.floor((w - l.length) / 2);
      for (var k = 0; k < l.length; k++) g[top + i][left + k] = l[k];
    });
    return g;
  }
  function textCard(text) { return putText(blank(), text, 0, 0, COLS, ROWS); }

  // ---------- Картинки ----------
  function resolveArt(name, accent, style) {
    var a = C.ART[name];
    return a.map(function (row) {
      return row.split('').map(function (ch) {
        if (ch === '.') return ' ';
        if (ch === '*') return style === 'black' ? 'w' : 'k';
        if (ch === 'c') return accent;
        return ch;
      });
    });
  }
  function artWidth(name) { return C.ART[name][0].length; }
  function blit(g, art, x0, y0) {
    art.forEach(function (row, r) { row.forEach(function (ch, c) { if (ch !== ' ' && g[y0 + r] && x0 + c < COLS) g[y0 + r][x0 + c] = ch; }); });
    return g;
  }
  function accentColor() { return pick(['r', 'b', 'g', 'o', 'v', 'y']); }
  // Картинка + подпись справа (или одна картинка по центру)
  function artCard(name, caption, style) {
    var art = resolveArt(name, accentColor(), style), w = artWidth(name), g = blank();
    var boxW = COLS - w - 2;
    if (caption && boxW >= 6 && fits(caption, boxW, ROWS)) {
      var left = Math.random() < 0.5;
      if (left) { blit(g, art, 1, 0); putText(g, caption, w + 2, 0, COLS - w - 3, ROWS); }
      else { blit(g, art, COLS - w - 1, 0); putText(g, caption, 1, 0, COLS - w - 3, ROWS); }
      return g;
    }
    if (w * 2 + 3 <= COLS && Math.random() < 0.6) { // повтор картинки
      var n = Math.floor((COLS + 1) / (w + 1)), total = n * w + (n - 1), x = Math.floor((COLS - total) / 2);
      for (var i = 0; i < n; i++) blit(g, resolveArt(name, accentColor(), style), x + i * (w + 1), 0);
      return g;
    }
    return blit(g, art, Math.floor((COLS - w) / 2), 0);
  }
  function bigSupported(word) {
    word = normalize(word);
    if (!word.length || word.length * 4 - 1 > COLS) return false;
    for (var i = 0; i < word.length; i++) { var ch = C.CYR2LAT[word[i]] || word[i]; if (!C.BIG[ch]) return false; }
    return true;
  }
  function bigCard(word) {
    word = normalize(word);
    var g = blank(), total = word.length * 4 - 1, x = Math.floor((COLS - total) / 2), y = Math.random() < 0.5 ? 0 : 1;
    var multi = Math.random() < 0.55, one = accentColor(), shift = rnd(6);
    for (var i = 0; i < word.length; i++) {
      var glyph = C.BIG[C.CYR2LAT[word[i]] || word[i]], col = multi ? RAINBOW[(i + shift) % 6] : one;
      for (var r = 0; r < 5; r++) for (var c = 0; c < 3; c++) if (glyph[r][c] === '#') g[y + r][x + i * 4 + c] = col;
    }
    return g;
  }
  // Абстрактные узоры
  var PATTERNS = {
    rainbow: function () { var g = blank(), s = rnd(6); for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) g[r][c] = RAINBOW[(Math.floor((c + r) / 2) + s) % 6]; return g; },
    stripes: function () { var g = blank(), s = rnd(6); for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) g[r][c] = RAINBOW[(r + s) % 6]; return g; },
    confetti: function () { var g = blank(); for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) if (Math.random() < 0.33) g[r][c] = pick(RAINBOW); return g; },
    fireworks: function () {
      var g = blank(), n = 3 + rnd(3);
      for (var i = 0; i < n; i++) {
        var cx = 2 + rnd(COLS - 4), cy = 1 + rnd(ROWS - 2), col = pick(RAINBOW);
        [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1], [0, -2], [0, 2], [-2, 0], [2, 0]].forEach(function (d) {
          var y = cy + d[0], x = cx + d[1]; if (y >= 0 && y < ROWS && x >= 0 && x < COLS) g[y][x] = col;
        });
      }
      return g;
    },
    sea: function () {
      var g = blank(), sx = 3 + rnd(16);
      for (var c = 0; c < COLS; c++) { g[0][c] = ' '; }
      g[0][sx] = 'y'; g[0][sx + 1] = 'y'; g[1][sx] = 'y'; g[1][sx + 1] = 'y';
      for (var r = 2; r < ROWS; r++) for (var cc = 0; cc < COLS; cc++) g[r][cc] = ((cc + r * 2) % 7 === 0) ? 'w' : (r < 4 ? 'b' : (Math.random() < 0.3 ? 'g' : 'b'));
      for (var c2 = 0; c2 < COLS; c2++) g[ROWS - 1][c2] = Math.random() < 0.5 ? 'y' : 'o';
      return g;
    },
    checker: function () { var a = pick(RAINBOW), b = pick(RAINBOW), g = blank(); for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) g[r][c] = (r + c) % 2 ? a : b; return g; },
    sunset: function () { var cols = ['v', 'v', 'r', 'o', 'y', 'b'], g = blank(); for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) g[r][c] = (r === 3 && c > 8 && c < 13) ? 'y' : cols[r]; return g; },
    hearts: function () { var g = blank(); for (var i = 0; i < 3; i++) blit(g, resolveArt('heart'), 0 + i * 8, 0); return g; }
  };
  function patternCard(name) { return PATTERNS[name || pick(Object.keys(PATTERNS))](); }
  // Рамка из цвета + текст внутри (4 строки × 20)
  function framedCard(text) {
    if (!fits(text, 20, 4)) return null;
    var g = blank(), mode = rnd(3), s = rnd(6), col = pick(RAINBOW);
    for (var c = 0; c < COLS; c++) {
      g[0][c] = mode === 0 ? col : RAINBOW[(c + s) % 6];
      g[ROWS - 1][c] = mode === 0 ? col : RAINBOW[(c + s + 3) % 6];
    }
    if (mode === 2) for (var r = 1; r < ROWS - 1; r++) { g[r][0] = RAINBOW[(r + s) % 6]; g[r][COLS - 1] = RAINBOW[(r + s + 2) % 6]; }
    return putText(g, text, 1, 1, 20, 4);
  }

  // ---------- Интернет ----------
  function getJSON(url, opts) {
    return new Promise(function (resolve, reject) {
      var ctl = G.AbortController ? new AbortController() : null;
      var to = setTimeout(function () { if (ctl) ctl.abort(); reject(new Error('timeout')); }, 25000);
      opts = opts || {};
      if (ctl) opts.signal = ctl.signal;
      fetch(url, opts).then(function (r) {
        clearTimeout(to);
        if (!r.ok) return r.text().then(function (t) { reject(new Error('HTTP ' + r.status + ' ' + t.slice(0, 200))); });
        return r.json().then(resolve);
      }).catch(function (e) { clearTimeout(to); reject(e); });
    });
  }
  function cleanSentence(s) {
    return s.replace(/\s*\([^()]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').replace(/\s+/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  }
  function sentences(text) {
    var m = String(text).replace(/\n+/g, ' ').match(/[^.!?]+(?:[.!?]+|$)/g) || [];
    var out = [], buf = '';
    m.forEach(function (s) { // склеиваем ложные разрывы вида «г.», «т. е.»
      buf += s;
      if (/(\s[А-ЯA-Zа-яa-z]{1,2}\.|\d\.)$/.test(buf.trim()) && buf.length < 200) return;
      out.push(buf.trim()); buf = '';
    });
    if (buf.trim()) out.push(buf.trim());
    return out;
  }
  function wikiFacts(topic, lang) {
    var url = 'https://' + lang + '.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=8&prop=extracts&exintro=1&explaintext=1&exlimit=8&gsrsearch=' + encodeURIComponent(topic);
    return getJSON(url).then(function (d) {
      var pages = d && d.query && d.query.pages ? Object.keys(d.query.pages).map(function (k) { return d.query.pages[k]; }) : [];
      pages.sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
      var cards = [];
      pages.forEach(function (p) {
        var title = String(p.title || '').replace(/\s*\(.*\)$/, '');
        sentences(cleanSentence(p.extract || '')).slice(0, 6).forEach(function (s) {
          if (s.length < 25) return;
          var withTitle = '{b} ' + title + '\n' + s;
          if (title.length <= 18 && fits(withTitle, COLS, ROWS)) cards.push(withTitle);
          else if (fits(s, COLS, ROWS)) cards.push(s);
        });
      });
      return cards;
    });
  }
  function onThisDay(lang) {
    var d = new Date(), mm = ('0' + (d.getMonth() + 1)).slice(-2), dd = ('0' + d.getDate()).slice(-2);
    var head = lang === 'en' ? C.MONTHS_EN[d.getMonth()] + ' ' + d.getDate() : d.getDate() + ' ' + C.MONTHS_RU[d.getMonth()];
    function load(kind) { return getJSON('https://' + lang + '.wikipedia.org/api/rest_v1/feed/onthisday/' + kind + '/' + mm + '/' + dd); }
    return load('selected').catch(function () { return load('events'); }).then(function (data) {
      var items = (data.selected || data.events || []).concat(data.events || []), out = [], seen = {};
      items.forEach(function (it) {
        var t = cleanSentence(it.text || ''); if (seen[t]) return; seen[t] = 1;
        var card = '{o} ' + head + ', ' + it.year + '\n' + t;
        if (fits(card)) out.push(card);
      });
      return out;
    });
  }
  var WMO_RU = { 0: ['ЯСНО', 'y'], 1: ['ПОЧТИ ЯСНО', 'y'], 2: ['ОБЛАЧНО', 'w'], 3: ['ПАСМУРНО', 'w'], 45: ['ТУМАН', 'w'], 48: ['ТУМАН', 'w'], 51: ['МОРОСЬ', 'b'], 53: ['МОРОСЬ', 'b'], 55: ['МОРОСЬ', 'b'], 61: ['ДОЖДЬ', 'b'], 63: ['ДОЖДЬ', 'b'], 65: ['ЛИВЕНЬ', 'b'], 71: ['СНЕГ', 'w'], 73: ['СНЕГ', 'w'], 75: ['СНЕГОПАД', 'w'], 80: ['ЛИВЕНЬ', 'b'], 81: ['ЛИВЕНЬ', 'b'], 82: ['ЛИВЕНЬ', 'b'], 95: ['ГРОЗА', 'v'], 96: ['ГРОЗА', 'v'], 99: ['ГРОЗА', 'v'] };
  var WMO_EN = { 0: 'CLEAR', 1: 'MOSTLY CLEAR', 2: 'CLOUDY', 3: 'OVERCAST', 45: 'FOG', 48: 'FOG', 51: 'DRIZZLE', 53: 'DRIZZLE', 55: 'DRIZZLE', 61: 'RAIN', 63: 'RAIN', 65: 'HEAVY RAIN', 71: 'SNOW', 73: 'SNOW', 75: 'SNOW', 80: 'SHOWERS', 81: 'SHOWERS', 82: 'SHOWERS', 95: 'STORM', 96: 'STORM', 99: 'STORM' };
  function weather(city, lang) {
    var geo = 'https://geocoding-api.open-meteo.com/v1/search?count=1&language=' + lang + '&name=' + encodeURIComponent(city);
    return getJSON(geo).then(function (g) {
      if (!g.results || !g.results.length) throw new Error('город не найден');
      var p = g.results[0];
      var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + p.latitude + '&longitude=' + p.longitude +
        '&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=3';
      return getJSON(url).then(function (w) {
        function t(v) { v = Math.round(v); return (v > 0 ? '+' : '') + v + '°'; }
        function desc(code) { var r = WMO_RU[code] || ['', 'w']; return { txt: lang === 'en' ? (WMO_EN[code] || '') : r[0], col: r[1] }; }
        var now = desc(w.current.weather_code), tm = desc(w.daily.weather_code[1]), d2 = desc(w.daily.weather_code[2]);
        var name = p.name;
        var en = lang === 'en';
        var c1 = '{' + now.col + '} ' + name + ' {' + now.col + '}\n\n' + (en ? 'NOW ' : 'СЕЙЧАС ') + t(w.current.temperature_2m) + '\n' + now.txt +
          '\n' + (en ? 'WIND ' : 'ВЕТЕР ') + Math.round(w.current.wind_speed_10m) + (en ? ' KM/H' : ' КМ/Ч');
        var c2 = name + '\n' + (en ? 'TODAY ' : 'СЕГОДНЯ ') + t(w.daily.temperature_2m_max[0]) + '/' + t(w.daily.temperature_2m_min[0]) +
          '\n{' + tm.col + '} ' + (en ? 'TOMORROW ' : 'ЗАВТРА ') + t(w.daily.temperature_2m_max[1]) + '/' + t(w.daily.temperature_2m_min[1]) + '\n' + tm.txt +
          '\n{' + d2.col + '} ' + (en ? 'DAY AFTER ' : 'ПОСЛЕЗАВТРА ') + t(w.daily.temperature_2m_max[2]);
        return [c1, c2];
      });
    });
  }

  // ---------- ИИ (Claude API) ----------
  function aiGenerate(topic, lang, key, model, useSearch) {
    var ru = lang !== 'en';
    var prompt = (ru ?
      'Ты пишешь сообщения для механического табло Vestaboard (6 строк по 22 символа). Тема: «' + topic + '».\n' +
      'Сочини 12 разных коротких сообщений на русском: тёплые пожелания, остроумные высказывания, интересные и точные факты, шутки, цитаты (с автором).' +
      (useSearch ? ' Сначала найди в интернете свежие интересные факты по теме и используй их.' : '') + '\n' +
      'Правила: каждое сообщение не длиннее 6 строк по 22 символа, строки разделяй \\n. Только ЗАГЛАВНЫЕ буквы, кириллица/латиница, цифры и знаки !@#$()-+&=;:\'"%,./?°. ' +
      'Можно добавлять цветные квадраты: {r} красный, {o} оранжевый, {y} жёлтый, {g} зелёный, {b} синий, {v} фиолетовый, {w} белый, {k} чёрный.\n' +
      'Добавь также 2 пиксельные картинки по теме: объекты {"art":["6 строк ровно по 22 символа"]}, где . — пусто, r o y g b v w k — цвета.\n' +
      'Ответь ТОЛЬКО JSON-массивом (строки и объекты art), без пояснений.'
      :
      'You write messages for a Vestaboard split-flap display (6 rows x 22 characters). Topic: "' + topic + '".\n' +
      'Write 12 varied short messages in English: warm wishes, witty sayings, interesting accurate facts, jokes, attributed quotes.' +
      (useSearch ? ' First search the web for fresh interesting facts on the topic and use them.' : '') + '\n' +
      'Rules: max 6 lines of 22 chars each, separate lines with \\n. UPPERCASE only, letters, digits and !@#$()-+&=;:\'"%,./?°. ' +
      'You may add color squares: {r} red, {o} orange, {y} yellow, {g} green, {b} blue, {v} violet, {w} white, {k} black.\n' +
      'Also add 2 pixel-art pictures for the topic: objects {"art":["6 rows of exactly 22 chars"]} where . is empty and r o y g b v w k are colors.\n' +
      'Reply ONLY with a JSON array (strings and art objects), no explanations.');
    var body = { model: model || 'claude-sonnet-5-5', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] };
    if (useSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }];
    return getJSON('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify(body)
    }).then(function (res) {
      var txt = (res.content || []).filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('');
      var a = txt.indexOf('['), z = txt.lastIndexOf(']');
      if (a < 0 || z < a) throw new Error('ИИ вернул неожиданный ответ');
      var arr = JSON.parse(txt.slice(a, z + 1)), cards = [];
      arr.forEach(function (it) {
        if (typeof it === 'string') { if (fits(it)) cards.push({ text: it }); }
        else if (it && it.art && it.art.length) {
          var g = blank();
          it.art.slice(0, ROWS).forEach(function (row, r) {
            String(row).slice(0, COLS).split('').forEach(function (ch, c) { if (CHIP[ch]) g[r][c] = ch; });
          });
          cards.push({ grid: g });
        }
      });
      return cards;
    });
  }

  // ---------- Сборка колоды ----------
  function findTheme(id) { for (var i = 0; i < C.THEMES.length; i++) if (C.THEMES[i].id === id) return C.THEMES[i]; return null; }
  function matchTheme(topic) {
    var t = topic.toLowerCase();
    for (var i = 0; i < C.THEMES.length; i++) {
      var th = C.THEMES[i];
      if ((th.kw || []).some(function (k) { return t.indexOf(k) >= 0; })) return th;
    }
    return null;
  }
  var aiCache = {};

  /* opts: {themeId, custom, mode, lang, style, city, apiKey, model, search}
     Возвращает Promise<{cards: [() => grid], live: bool, notes: [string]}> */
  function buildDeck(o) {
    var lang = o.lang === 'en' ? 'en' : 'ru';
    var custom = (o.custom || '').trim();
    var th = custom ? matchTheme(custom) : findTheme(o.themeId);
    var mode = o.mode || 'mix';
    var texts = [], arts = [], nets = [], notes = [];
    var style = o.style;

    function addText(t) { texts.push(function () { var f = Math.random() < 0.25 && framedCard(t); return f || textCard(t); }); }
    function addArtCaption(name, cap) { arts.push(function () { return artCard(name, cap, style); }); }

    // Живые темы
    if (!custom && th && th.id === 'clock') {
      var clockCard = function () { return textCard(th.dyn(lang)[0]); };
      var live = { live: true, cards: [clockCard], notes: [] };
      live.refresh = function () {
        return weather(o.city || 'Hadera', lang).then(function (c) {
          var w = c.map(function (t) { return function () { return textCard(t); }; });
          var cards = [clockCard];
          w.forEach(function (f) { cards.push(f, clockCard); });
          cards.pop();
          live.cards = cards;
        }).catch(function (e) { live.notes.push((lang === 'en' ? 'Weather: ' : 'Погода: ') + e.message); });
      };
      return live.refresh().then(function () { return live; });
    }

    // Тексты из библиотеки
    if (th && th.msgs) {
      var list = th.msgs[lang] && th.msgs[lang].length ? th.msgs[lang] : th.msgs.ru;
      list.forEach(addText);
    }
    if (th && th.dyn) th.dyn(lang).forEach(addText);
    if (custom) {
      var T = normalize(custom);
      C.TEMPLATES[lang].forEach(function (tpl) { var s = tpl.replace(/\{T\}/g, T); if (fits(s)) addText(s); });
    }

    // Картинки
    var artNames = (th && th.arts) || [];
    if (!artNames.length && custom) {
      var kwArt = { 'солн': 'sun', 'sun': 'sun', 'лет': 'sun', 'море': 'sun', 'кот': 'smile', 'цвет': 'flower', 'flower': 'flower', 'сад': 'flower', 'дом': 'house', 'home': 'house', 'самол': 'plane', 'plane': 'plane', 'путеш': 'plane', 'travel': 'plane', 'ноч': 'moon', 'night': 'moon', 'вин': 'wine', 'wine': 'wine', 'подар': 'gift', 'звезд': 'star' };
      Object.keys(kwArt).forEach(function (k) { if (custom.toLowerCase().indexOf(k) >= 0) artNames.push(kwArt[k]); });
    }
    if (!th || !th.noArt) {
      var shortCaps = [];
      if (th && th.msgs) (th.msgs[lang] || th.msgs.ru).forEach(function (m) { shortCaps.push(m); });
      if (custom) shortCaps.push(normalize(custom));
      artNames.forEach(function (n) {
        addArtCaption(n, null);
        for (var i = 0; i < 2; i++) addArtCaption(n, pick(shortCaps.length ? shortCaps : ['']));
      });
      var bigs = ((th && th.big) || []).slice();
      if (th && th.bigDyn) bigs.push(th.bigDyn());
      if (custom && bigSupported(custom)) bigs.push(custom, custom);
      bigs.filter(bigSupported).forEach(function (w) { arts.push(function () { return bigCard(w); }); });
      var pats = ['rainbow', 'confetti', 'fireworks', 'sea', 'sunset', 'stripes', 'checker'];
      if (th && th.hearts) pats.push('hearts', 'hearts');
      if (th && th.confetti) pats.push('confetti', 'fireworks');
      shuffle(pats).slice(0, th && th.artOnly ? 7 : 2).forEach(function (p) { arts.push(function () { return patternCard(p); }); });
      if (th && th.artOnly) {
        Object.keys(C.ART).forEach(function (n) { addArtCaption(n, null); });
        ['SAAB', 'LOVE', 'HELLO', 'WOW'].forEach(function (w) { arts.push(function () { return bigCard(w); }); });
      }
    }

    // Интернет
    var pending = [];
    var wantNet = mode === 'net' || mode === 'mix';
    if (th && th.net === 'weather') {
      pending.push(weather(o.city || 'Hadera', lang).then(function (c) { c.forEach(function (t) { texts.push(function () { return textCard(t); }); }); })
        .catch(function (e) { notes.push((lang === 'en' ? 'Weather: ' : 'Погода: ') + e.message); }));
    } else if (th && th.net === 'onthisday') {
      pending.push(onThisDay(lang).then(function (c) { shuffle(c).slice(0, 20).forEach(function (t) { nets.push(function () { return textCard(t); }); }); })
        .catch(function (e) { notes.push('Wikipedia: ' + e.message); }));
    } else if (wantNet && custom) {
      pending.push(wikiFacts(custom, lang).then(function (c) {
        if (!c.length && lang === 'ru') return wikiFacts(custom, 'en');
        return c;
      }).then(function (c) { c.slice(0, 16).forEach(function (t) { nets.push(function () { return textCard(t); }); }); })
        .catch(function (e) { notes.push('Wikipedia: ' + e.message); }));
    } else if (wantNet && th && !th.artOnly && th.id !== 'clock') {
      var q = { saab: 'Saab Automobile', cars: lang === 'en' ? 'automobile history' : 'история автомобиля', newyear: lang === 'en' ? 'New Year traditions' : 'Новый год традиции', birthday: lang === 'en' ? 'birthday traditions' : 'день рождения традиции', kitchen: lang === 'en' ? 'coffee' : 'кофе', israel: lang === 'en' ? 'Jewish holidays' : 'еврейские праздники' }[th.id];
      if (q) pending.push(wikiFacts(q, lang).then(function (c) { c.slice(0, 10).forEach(function (t) { nets.push(function () { return textCard(t); }); }); }).catch(function () { }));
    }

    // ИИ
    var useAI = o.apiKey && (mode === 'ai' || mode === 'mix');
    if (useAI) {
      var topicName = custom || (th ? (lang === 'en' ? th.en : th.ru) : '');
      var key = lang + ':' + topicName;
      var p = aiCache[key] ? Promise.resolve(aiCache[key]) : aiGenerate(topicName, lang, o.apiKey, o.model, o.search);
      pending.push(p.then(function (cards) {
        aiCache[key] = cards;
        cards.forEach(function (cd) { nets.push(function () { return cd.grid || textCard(cd.text); }); });
        if (mode === 'ai') setTimeout(function () { delete aiCache[key]; }, 1000); // в режиме «ИИ» каждый круг — новые тексты
      }).catch(function (e) { notes.push((lang === 'en' ? 'AI: ' : 'ИИ: ') + e.message); }));
    } else if (mode === 'ai') {
      notes.push(lang === 'en' ? 'Add a Claude API key in settings' : 'Добавьте ключ Claude API в настройках');
    }

    return Promise.all(pending).then(function () {
      var cards;
      if (mode === 'text') cards = shuffle(texts);
      else if (mode === 'art') cards = shuffle(arts);
      else if (mode === 'net' || mode === 'ai') cards = shuffle(nets);
      else { // микс: чередуем
        var t = shuffle(texts), a = shuffle(arts), n = shuffle(nets);
        cards = [];
        while (t.length || a.length || n.length) {
          if (t.length) cards.push(t.shift());
          if (n.length) cards.push(n.shift());
          if (a.length && Math.random() < 0.7) cards.push(a.shift());
          if (!t.length && !n.length && a.length) cards.push(a.shift());
        }
      }
      if (!cards.length) cards = shuffle(texts.concat(arts, nets));
      if (!cards.length) cards = [function () { return patternCard(); }];
      return { live: false, cards: cards, notes: notes };
    });
  }

  G.FlapEngine = {
    buildDeck: buildDeck, textCard: textCard, fits: fits, findTheme: findTheme, bigCard: bigCard,
    artCard: artCard, patternCard: patternCard, framedCard: framedCard, normalize: normalize, textLines: textLines
  };
})(this);
