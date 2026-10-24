/* Табло: сетка 6×22 split-flap ячеек + синтез звука щелчков. */
(function (G) {
  'use strict';
  var ROWS = 6, COLS = 22;
  var COLORS = { r: '#d6262f', o: '#ef7f22', y: '#f4c20d', g: '#169b4f', b: '#1667d0', v: '#7b3db6', w: '#ffffff', k: '#111111' };
  var DRUM = (' ABCDEFGHIJKLMNOPQRSTUVWXYZАБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ1234567890!@#$()-+&=;:\'"%,./?°<>|' + 'roygbvwk').split('');
  var DRUM_IDX = {};
  DRUM.forEach(function (c, i) { DRUM_IDX[c] = i; });

  // ---------------- Звук ----------------
  // Шелест флажков: короткий отфильтрованный шум (основа) + яркий «тсс»-слой для чёткости
  // + изредка глухой удар корпуса. Стерео по колонке.
  function Sound() { this.ctx = null; this.level = 2; this.win = 0; this.cnt = 0; }
  Sound.LEVELS = [0, 0.25, 0.55, 1.0];
  Sound.prototype.init = function () {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    var AC = G.AudioContext || G.webkitAudioContext;
    if (!AC) return;
    var c = this.ctx = this.offline || new AC();
    var len = Math.floor(c.sampleRate * 0.6);
    var buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.noise = buf;
    this.comp = c.createDynamicsCompressor();
    this.comp.threshold.value = -18; this.comp.ratio.value = 4; this.comp.attack.value = 0.001; this.comp.release.value = 0.06;
    this.master = c.createGain();
    this.master.gain.value = Sound.LEVELS[this.level];
    this.comp.connect(this.master); this.master.connect(c.destination);
  };
  Sound.prototype.setLevel = function (l) {
    this.level = l;
    if (this.master) this.master.gain.value = Sound.LEVELS[l];
  };
  Sound.prototype._burst = function (t, type, freq, q, peak, attack, decay, out) {
    var c = this.ctx, s = c.createBufferSource(); s.buffer = this.noise;
    var f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; if (q) f.Q.value = q;
    var g = c.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    s.connect(f); f.connect(g); g.connect(out);
    s.start(t, Math.random() * 0.5, attack + decay + 0.01);
  };
  // col — колонка 0..21 (для стерео)
  Sound.prototype.click = function (col) {
    var c = this.ctx;
    if (!c || !this.level || (c.state !== 'running' && !this.offline)) return;
    var now = c.currentTime;
    if (now - this.win < 0.010) { if (++this.cnt > 5) return; } else { this.win = now; this.cnt = 0; }
    var t = now + Math.random() * 0.005, out = this.comp;
    if (c.createStereoPanner && col !== undefined) {
      var p = c.createStereoPanner(); p.pan.value = (col / 21 - 0.5) * 1.1; p.connect(this.comp); out = p;
    }
    // основа шелеста
    this._burst(t, 'bandpass', 2600 + Math.random() * 2800, 1.0, 0.38 + Math.random() * 0.22, 0.0006, 0.018, out);
    // чёткость: яркий короткий верх
    this._burst(t, 'highpass', 5500 + Math.random() * 2500, 0.7, 0.22 + Math.random() * 0.14, 0.0003, 0.006, out);
    if (Math.random() < 0.35) // глухой «тук» корпуса
      this._burst(t, 'lowpass', 600 + Math.random() * 300, 0, 0.32, 0.002, 0.03, out);
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

  Board.Sound = Sound;
  G.FlapBoard = Board;
})(this);
