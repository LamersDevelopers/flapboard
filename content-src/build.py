#!/usr/bin/env python3
"""Собирает content-src/*.txt в js/library.js. Одна строка — одно сообщение, '|' — перенос строки."""
import json, os, glob
here = os.path.dirname(os.path.abspath(__file__))
lib = {}
for f in sorted(glob.glob(os.path.join(here, '*.txt'))):
    tid = os.path.splitext(os.path.basename(f))[0]
    seen, out = set(), []
    for line in open(f, encoding='utf-8'):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        msg = line.replace('|', '\n')
        if msg.upper() in seen:
            continue
        seen.add(msg.upper()); out.append(msg)
    lib[tid] = out
js = ('/* Сгенерировано content-src/build.py — не редактировать вручную. */\n'
      '(function (G) {\n  var L = ' + json.dumps(lib, ensure_ascii=False, indent=0) + ';\n'
      '  G.FlapContent.THEMES.forEach(function (t) {\n'
      '    if (!t.msgs || !L[t.id]) return;\n'
      '    var have = {}; t.msgs.ru.forEach(function (m) { have[m.toUpperCase()] = 1; });\n'
      '    L[t.id].forEach(function (m) { if (!have[m.toUpperCase()]) { have[m.toUpperCase()] = 1; t.msgs.ru.push(m); } });\n'
      '  });\n})(this);\n')
open(os.path.join(here, '..', 'js', 'library.js'), 'w', encoding='utf-8').write(js)
print({k: len(v) for k, v in lib.items()})
