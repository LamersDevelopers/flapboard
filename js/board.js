/* Табло: сетка 6×22 split-flap ячеек + синтез звука щелчков. */
(function (G) {
  'use strict';
  var ROWS = 6, COLS = 22;
  var COLORS = { r: '#d6262f', o: '#ef7f22', y: '#f4c20d', g: '#169b4f', b: '#1667d0', v: '#7b3db6', w: '#ffffff', k: '#111111' };
  var DRUM = (' ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ1234567890!@#$()-+&=;:\'"%,./?°<>|' + 'roygbvwk').split('');
  var DRUM_IDX = {};
  DRUM.forEach(function (c, i) { DRUM_IDX[c] = i; });

  // ---------------- Звук ----------------
  // Модальный синтез щелчка пластикового флажка: удар + отскок, резонансы пластика,
  // глухой удар корпуса. Банк вариантов рендерится один раз, потом только проигрывается.
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function renderClick(sr, seed) {
    var R = rng(seed * 7919 + 13), len = Math.floor(sr * 0.11), out = new Float32Array(len), TAU = Math.PI * 2;
    var base = 0.9 + R() * 0.22;
    var modes = [[820, 0.020, 0.35], [1650, 0.016, 0.7], [2900, 0.011, 1.0], [4400, 0.007, 0.75], [6800, 0.004, 0.45], [9600, 0.0025, 0.25]];
    var t1 = 0.0035 + R() * 0.006, t2 = t1 + 0.003 + R() * 0.004;
    var hits = [[0, 1], [t1, 0.32 + R() * 0.25], [t2, 0.08 + R() * 0.1]];
    hits.forEach(function (h, hi) {
      var s0 = Math.floor(h[0] * sr);
      modes.forEach(function (m) {
        var f = m[0] * base * (0.96 + R() * 0.08) * (hi ? 1.03 : 1), dec = m[1] * (0.8 + R() * 0.4), a = m[2] * h[1] * (0.7 + R() * 0.6), ph = R() * TAU;
        var n = Math.min(len - s0, Math.floor(dec * sr * 7));
        for (var k = 0; k < n; k++) { var t = k / sr; out[s0 + k] += a * Math.exp(-t / dec) * Math.sin(TAU * f * t + ph); }
      });
      // короткий шумовой транзиент — «сухость» пластика
      var tn = Math.floor(sr * 0.0006);
      for (var q = 0; q < tn && s0 + q < len; q++) out[s0 + q] += (R() * 2 - 1) * 0.9 * h[1] * (1 - q / tn);
    });
    // глухой удар по корпусу
    var tf = (170 + R() * 90) * base, td = 0.010 + R() * 0.006, ta = 0.45 + R() * 0.3;
    for (var k2 = 0; k2 < len; k2++) { var tt = k2 / sr; out[k2] += ta * Math.exp(-tt / td) * Math.sin(TAU * tf * tt); }
    var peak = 0; for (var z = 0; z < len; z++) peak = Math.max(peak, Math.abs(out[z]));
    for (z = 0; z < len; z++) out[z] *= 0.9 / peak;
    return out;
  }
  function Sound() { this.ctx = null; this.level = 2; this.win = 0; this.cnt = 0; this.bank = []; }
  Sound.LEVELS = [0, 0.3, 0.6, 1.0];
  Sound.prototype.init = function () {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    var AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return;
    var c = this.ctx = new AC(), sr = c.sampleRate;
    for (var v = 0; v < 18; v++) {
      var data = renderClick(sr, v + 1), b = c.createBuffer(1, data.length, sr);
      b.getChannelData(0).set(data); this.bank.push(b);
    }
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -14; this.comp.ratio.value = 4; this.comp.attack.value = 0.002; this.comp.release.value = 0.08;
    this.master = c.createGain(); this.master.gain.value = Sound.LEVELS[this.level];
    // короткое «эхо» стены/кухни
    var irLen = Math.floor(sr * 0.14), ir = c.createBuffer(2, irLen, sr);
    for (var ch = 0; ch < 2; ch++) { var d = ir.getChannelData(ch); for (var i = 0; i < irLen; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / irLen, 3) * (i < sr * 0.004 ? 0 : 1); }
    this.verb = c.createConvolver(); this.verb.buffer = ir;
    this.wet = c.createGain(); this.wet.gain.value = 0.16;
    this.bus = c.createGain();
    this.bus.connect(this.comp); this.bus.connect(this.verb); this.verb.connect(this.wet); this.wet.connect(this.comp);
    this.comp.connect(this.master); this.master.connect(c.destination);
  };
  Sound.prototype.setLevel = function (l) {
    this.level = l;
    if (this.master) this.master.gain.value = Sound.LEVELS[l];
  };
  // col — номер колонки 0..21, для стереопанорамы
  Sound.prototype.click = function (col) {
    var c = this.ctx;
    if (!c || !this.level || c.state !== 'running' || !this.bank.length) return;
    var now = c.currentTime;
    if (now - this.win < 0.008) { if (++this.cnt > 5) return; } else { this.win = now; this.cnt = 0; }
    var t = now + Math.random() * 0.004;
    var s = c.createBufferSource();
    s.buffer = this.bank[Math.floor(Math.random() * this.bank.length)];
    s.playbackRate.value = 0.93 + Math.random() * 0.14;
    var g = c.createGain(); g.gain.value = 0.35 + Math.random() * 0.4;
    s.connect(g);
    if (c.createStereoPanner && col !== undefined) {
      var p = c.createStereoPanner(); p.pan.value = (col / 21 - 0.5) * 1.2; g.connect(p); p.connect(this.bus);
    } else g.connect(this.bus);
    s.start(t);
  };

  // ---------------- Ячейка ----------------
  function mkHalf(cls) {
    var h = document.createElement('div');
    h.className = 'half ' + cls;
    var s = document.createElement('span');
    h.appendChild(s);
    h._s = s;
    return h;
  }
  function paint(h, ch) {
    var col = COLORS[ch];
    if (col) { h.style.backgroundColor = col; h._s.textContent = ''; h.className = h.className.replace(' chip', '') + ' chip'; }
    else { h.style.backgroundColor = ''; h._s.textContent = ch === ' ' ? '' : ch; h.className = h.className.replace(' chip', ''); }
  }

  function Cell(board) {
    this.board = board;
    var el = this.el = document.createElement('div');
    el.className = 'cell';
    this.top = mkHalf('top'); this.bot = mkHalf('bottom');
    this.ft = mkHalf('top flap'); this.fb = mkHalf('bottom flap');
    el.appendChild(this.top); el.appendChild(this.bot); el.appendChild(this.ft); el.appendChild(this.fb);
    this.cur = ' '; this.queue = []; this.busy = false;
  }
  Cell.prototype.setNow = function (ch) {
    this.queue = []; this.cur = ch;
    paint(this.top, ch); paint(this.bot, ch);
  };
  Cell.prototype.path = function (to) {
    var a = DRUM_IDX[this.cur], b = DRUM_IDX[to];
    if (a === undefined) a = 0;
    if (b === undefined) { to = ' '; b = 0; }
    var N = DRUM.length, d = (b - a + N) % N;
    if (d === 0) return [];
    var max = 5 + Math.floor(Math.random() * 9), out = [], i;
    var start = d <= max ? a + 1 : b - max + 1;
    for (i = 0; i < Math.min(d, max); i++) out.push(DRUM[(start + i + N) % N]);
    return out;
  };
  Cell.prototype.flipTo = function (to, delay) {
    var p = this.path(to);
    if (!p.length) { this.queue = []; return; }
    this.queue = p;
    var self = this;
    if (!this.busy) {
      this.busy = true;
      this.board.active++;
      setTimeout(function () { self.step(); }, delay || 0);
    }
  };
  Cell.prototype.step = function () {
    var self = this;
    if (!this.queue.length) {
      this.busy = false;
      if (--this.board.active === 0) this.board._done();
      return;
    }
    var next = this.queue.shift(), prev = this.cur;
    var dur = this.board.flipMs * (0.85 + Math.random() * 0.3);
    var ft = this.ft, fb = this.fb;
    paint(this.top, next); paint(this.bot, prev);
    paint(ft, prev); paint(fb, next);
    if (!ft.animate) { // запасной вариант без Web Animations
      this.cur = next; paint(this.bot, next); this.board.sound.click(this.col);
      setTimeout(function () { self.step(); }, dur);
      return;
    }
    ft.style.visibility = 'visible'; fb.style.visibility = 'visible';
    var h = dur / 2;
    var a1 = ft.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }],
      { duration: h, easing: 'ease-in', fill: 'forwards' });
    var a2 = fb.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }],
      { duration: h, delay: h, easing: 'cubic-bezier(.3,1.6,.6,1)', fill: 'both' });
    a2.onfinish = function () {
      self.cur = next;
      paint(self.bot, next);
      ft.style.visibility = 'hidden'; fb.style.visibility = 'hidden';
      a1.cancel(); a2.cancel();
      self.board.sound.click(self.col);
      self.step();
    };
  };

  // ---------------- Табло ----------------
  function Board(root) {
    this.root = root;
    this.sound = new Sound();
    this.flipMs = 80;
    this.active = 0;
    this.cells = [];
    this.onDone = null;
    var grid = this.gridEl = document.createElement('div');
    grid.className = 'grid';
    for (var r = 0; r < ROWS; r++) {
      var row = [];
      for (var c = 0; c < COLS; c++) {
        var cell = new Cell(this);
        cell.col = c;
        grid.appendChild(cell.el);
        row.push(cell);
      }
      this.cells.push(row);
    }
    root.appendChild(grid);
  }
  Board.ROWS = ROWS; Board.COLS = COLS; Board.COLORS = COLORS; Board.DRUM = DRUM;
  Board.prototype._done = function () { if (this.onDone) { var f = this.onDone; this.onDone = null; f(); } };
  // Показать сетку (массив 6 строк × 22 символа). Возвращает Promise по окончании анимации.
  Board.prototype.show = function (g) {
    var self = this;
    var patterns = ['wave', 'random', 'diag', 'center', 'rows', 'rwave'];
    var p = patterns[Math.floor(Math.random() * patterns.length)];
    return new Promise(function (resolve) {
      var any = false;
      self.onDone = resolve;
      for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
        var ch = (g[r] && g[r][c]) || ' ', d;
        switch (p) {
          case 'wave': d = c * 45; break;
          case 'rwave': d = (COLS - 1 - c) * 45; break;
          case 'diag': d = (c + r * 2) * 35; break;
          case 'center': d = Math.abs(c - 10.5) * 55 + Math.abs(r - 2.5) * 30; break;
          case 'rows': d = r * 160 + c * 12; break;
          default: d = Math.random() * 900;
        }
        var cell = self.cells[r][c];
        if (cell.cur !== ch || cell.busy) { any = true; cell.flipTo(ch, d + Math.random() * 60); }
      }
      if (!any || self.active === 0) { self.onDone = null; resolve(); }
    });
  };
  Board.prototype.clearNow = function () {
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) this.cells[r][c].setNow(' ');
  };

  Board.renderClick = renderClick;
  G.FlapBoard = Board;
})(this);
