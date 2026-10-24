/* Библиотека тем, фраз и пиксельных картинок для табло.
   В тексте: \n — перенос строки, {r}{o}{y}{g}{b}{v}{w}{k} — цветные плашки.
   В картинках: '.' пусто, r o y g b v w k — цвета, '*' — контрастный (чёрный/белый),
   'c' — акцентный цвет (случайный), прочие символы — буквы. */
(function (G) {
  'use strict';

  // ---------- Пиксельные картинки (6 строк, произвольная ширина) ----------
  var ART = {
    heart: [
      '.rr.rr.',
      'rrrrrrr',
      'rrrrrrr',
      '.rrrrr.',
      '..rrr..',
      '...r...'],
    hearts2: [
      '.rr.rr...vv.vv.',
      'rrrrrrr.vvvvvvv',
      'rrrrrrr.vvvvvvv',
      '.rrrrr...vvvvv.',
      '..rrr.....vvv..',
      '...r.......v...'],
    tree: [
      '....y....',
      '...ggg...',
      '..grggg..',
      '.gggggbg.',
      'ggyggggrg',
      '....o....'],
    cake: [
      '.y..y..y.',
      '.b..g..v.',
      'rrrrrrrrr',
      'ooooooooo',
      'rrrrrrrrr',
      'ooooooooo'],
    car: [
      '....cccccc....',
      '...cbbcbbbc...',
      '.cccccccccccc.',
      'yccccccccccccr',
      '.c**cccccc**c.',
      '..**......**..'],
    car2: [
      '.....ccccc.......',
      '...ccbbbcbbcc....',
      '.ccccccccccccccc.',
      'ycccccccccccccccr',
      '.cc**ccccccc**cc.',
      '...**.......**...'],
    sun: [
      '.......',
      'y..y..y',
      '.yyyyy.',
      'yyoyoyy',
      '.yyyyy.',
      'y..y..y'],
    cup: [
      '.o..o...',
      '..o..o..',
      '******..',
      '*oooo***',
      '*oooo*.*',
      '.****...'],
    menorah: [
      'y.y.y.y.y.y.y.y.y',
      'b.b.b.b.b.b.b.b.b',
      'b.b.b.b.b.b.b.b.b',
      'yyyyyyyyyyyyyyyyy',
      '........y........',
      '......yyyyy......'],
    candles: [
      '.y...y.',
      '.y...y.',
      '.*...*.',
      '.*...*.',
      '.*...*.',
      'ooooooo'],
    gift: [
      '.r...r.',
      '..r.r..',
      'bbbrbbb',
      'bbbrbbb',
      'bbbrbbb',
      'bbbrbbb'],
    star: [
      '...y...',
      '..yyy..',
      'yyyyyyy',
      '.yyyyy.',
      '.yy.yy.',
      'y.....y'],
    flower: [
      '.v.v.',
      'vvyvv',
      '.v.v.',
      '..g..',
      'g.g.g',
      '.ggg.'],
    smile: [
      '.yyyyy.',
      'yy*y*yy',
      'yyyyyyy',
      'y*yyy*y',
      'yy***yy',
      '.yyyyy.'],
    house: [
      '...r...',
      '..rrr..',
      '.rrrrr.',
      '.ob.bo.',
      '.oooo*.',
      '.oooo*.'],
    plane: [
      '......b......',
      '.....bb......',
      'b...bbb......',
      'bbbbbbbbbbbb.',
      'b...bbb......',
      '.....bb......'],
    moon: [
      '..yyy..',
      '.yy....',
      'yy....y',
      'yy.....',
      '.yy....',
      '..yyy..'],
    wine: [
      'r....r',
      'rr..rr',
      '.r..r.',
      '..**..',
      '..**..',
      '.****.']
  };

  // ---------- 3x5 пиксельный шрифт для «больших букв» ----------
  var BIG = {
    A: ['.#.', '#.#', '###', '#.#', '#.#'], B: ['##.', '#.#', '##.', '#.#', '##.'],
    C: ['.##', '#..', '#..', '#..', '.##'], D: ['##.', '#.#', '#.#', '#.#', '##.'],
    E: ['###', '#..', '##.', '#..', '###'], F: ['###', '#..', '##.', '#..', '#..'],
    G: ['.##', '#..', '#.#', '#.#', '.##'], H: ['#.#', '#.#', '###', '#.#', '#.#'],
    I: ['###', '.#.', '.#.', '.#.', '###'], J: ['..#', '..#', '..#', '#.#', '.#.'],
    K: ['#.#', '#.#', '##.', '#.#', '#.#'], L: ['#..', '#..', '#..', '#..', '###'],
    M: ['#.#', '###', '###', '#.#', '#.#'], N: ['##.', '#.#', '#.#', '#.#', '#.#'],
    O: ['.#.', '#.#', '#.#', '#.#', '.#.'], P: ['##.', '#.#', '##.', '#..', '#..'],
    Q: ['.#.', '#.#', '#.#', '##.', '.##'], R: ['##.', '#.#', '##.', '#.#', '#.#'],
    S: ['.##', '#..', '.#.', '..#', '##.'], T: ['###', '.#.', '.#.', '.#.', '.#.'],
    U: ['#.#', '#.#', '#.#', '#.#', '###'], V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
    W: ['#.#', '#.#', '###', '###', '#.#'], X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
    Y: ['#.#', '#.#', '.#.', '.#.', '.#.'], Z: ['###', '..#', '.#.', '#..', '###'],
    '0': ['###', '#.#', '#.#', '#.#', '###'], '1': ['.#.', '##.', '.#.', '.#.', '###'],
    '2': ['##.', '..#', '.#.', '#..', '###'], '3': ['##.', '..#', '.#.', '..#', '##.'],
    '4': ['#.#', '#.#', '###', '..#', '..#'], '5': ['###', '#..', '##.', '..#', '##.'],
    '6': ['.##', '#..', '###', '#.#', '###'], '7': ['###', '..#', '.#.', '.#.', '.#.'],
    '8': ['###', '#.#', '###', '#.#', '###'], '9': ['###', '#.#', '###', '..#', '##.'],
    'Г': ['###', '#..', '#..', '#..', '#..'], 'П': ['###', '#.#', '#.#', '#.#', '#.#'],
    'Л': ['.##', '#.#', '#.#', '#.#', '#.#'], 'Д': ['.#.', '#.#', '#.#', '###', '#.#'],
    'И': ['#.#', '#.#', '#.#', '##.', '#.#'], 'Я': ['.##', '#.#', '.##', '#.#', '#.#'],
    'Ь': ['#..', '#..', '##.', '#.#', '##.'], 'З': ['##.', '..#', '.#.', '..#', '##.'],
    'Б': ['###', '#..', '##.', '#.#', '##.'], 'Ш': ['#.#', '#.#', '#.#', '###', '###'],
    'Ч': ['#.#', '#.#', '.##', '..#', '..#'], 'Э': ['##.', '..#', '.##', '..#', '##.'],
    'Й': ['#.#', '#.#', '#.#', '##.', '#.#'], 'Ы': ['#.#', '#.#', '###', '#.#', '###'],
    '!': ['.#.', '.#.', '.#.', '...', '.#.'], '?': ['##.', '..#', '.#.', '...', '.#.'],
    '-': ['...', '...', '###', '...', '...'], '+': ['...', '.#.', '###', '.#.', '...'],
    ' ': ['...', '...', '...', '...', '...']
  };
  var CYR2LAT = { 'А': 'A', 'В': 'B', 'Е': 'E', 'Ё': 'E', 'К': 'K', 'М': 'M', 'Н': 'H', 'О': 'O', 'Р': 'P', 'С': 'C', 'Т': 'T', 'Х': 'X', 'У': 'Y' };

  // ---------- Темы ----------
  var MONTHS_RU = ['ЯНВАРЯ', 'ФЕВРАЛЯ', 'МАРТА', 'АПРЕЛЯ', 'МАЯ', 'ИЮНЯ', 'ИЮЛЯ', 'АВГУСТА', 'СЕНТЯБРЯ', 'ОКТЯБРЯ', 'НОЯБРЯ', 'ДЕКАБРЯ'];
  var MONTHS_EN = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  var DAYS_RU = ['ВОСКРЕСЕНЬЕ', 'ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА'];
  var DAYS_EN = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  function plural(n, a, b, c) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return a;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return b;
    return c;
  }
  function daysTo(month, day) {
    var now = new Date(), y = now.getFullYear();
    var t = new Date(y, month, day);
    var today = new Date(y, now.getMonth(), now.getDate());
    if (t < today) t = new Date(y + 1, month, day);
    return Math.round((t - today) / 86400000);
  }

  var THEMES = [
    {
      id: 'clock', ru: 'Часы и погода', en: 'Clock & weather', live: true, noArt: true,
      dyn: function (lang) {
        var d = new Date();
        var t = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
        if (lang === 'en') return ['{b}{b}{b} ' + DAYS_EN[d.getDay()] + ' {b}{b}{b}\n\n' + MONTHS_EN[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() + '\n\n' + t];
        return ['{b}{b}{b} ' + DAYS_RU[d.getDay()] + ' {b}{b}{b}\n\n' + d.getDate() + ' ' + MONTHS_RU[d.getMonth()] + ' ' + d.getFullYear() + '\n\n' + t];
      }
    },
    {
      id: 'morning', ru: 'Доброе утро', en: 'Good morning', kw: ['утро', 'morning', 'кофе'],
      arts: ['sun', 'cup'], big: ['HI', 'УТРО'],
      msgs: {
        ru: ['ДОБРОЕ УТРО!\n{y}{y}{y}{y}{y}{y}\nСЕГОДНЯ БУДЕТ\nОТЛИЧНЫЙ ДЕНЬ',
          'СНАЧАЛА КОФЕ,\nПОТОМ ВЕЛИКИЕ ДЕЛА',
          'ПРОСЫПАЙСЯ!\nМИР ЖДЁТ ТЕБЯ {y}',
          'УЛЫБНИСЬ —\nЭТО САМЫЙ БЫСТРЫЙ\nСПОСОБ ПОЧИНИТЬ УТРО',
          'КАЖДОЕ УТРО —\nНОВАЯ ЧИСТАЯ\nСТРАНИЦА',
          'ЗАВТРАК ГОТОВ?\nТОГДА ВПЕРЁД! {g}',
          'ЛУЧШЕЕ ВРЕМЯ\nНАЧАТЬ — СЕЙЧАС',
          'ДОБРОЕ УТРО,\nСЕМЬЯ! {r}{o}{y}{g}{b}{v}',
          'ПУСТЬ СЕГОДНЯ\nВСЁ ПОЛУЧИТСЯ\nС ПЕРВОГО РАЗА',
          'СОЛНЦЕ ВСТАЛО.\nТВОЯ ОЧЕРЕДЬ {y}'],
        en: ['GOOD MORNING!\n{y}{y}{y}{y}{y}{y}\nTODAY IS GOING\nTO BE GREAT',
          'COFFEE FIRST,\nTHEN GREATNESS',
          'RISE AND SHINE {y}',
          'EVERY MORNING IS\nA FRESH START',
          'THE BEST TIME TO\nSTART IS NOW']
      }
    },
    {
      id: 'birthday', ru: 'День рождения', en: 'Birthday', kw: ['рожд', 'birthday', 'др', 'юбилей', 'торт'],
      arts: ['cake', 'gift', 'star'], big: ['HAPPY', 'B-DAY', 'УРА!'], confetti: true,
      msgs: {
        ru: ['С ДНЁМ РОЖДЕНИЯ!\n{r}{o}{y}{g}{b}{v}{r}{o}{y}{g}{b}{v}',
          'ПУСТЬ ВСЕ МЕЧТЫ\nСБЫВАЮТСЯ\nБЫСТРЕЕ, ЧЕМ\nЗАДУВАЮТСЯ СВЕЧИ',
          'ЕЩЁ ОДИН ГОД\nМУДРОСТИ, СМЕХА\nИ ПРИКЛЮЧЕНИЙ!',
          'ТОРТ. СВЕЧИ.\nЖЕЛАНИЕ.\n{y} {y} {y}\nТЫ ЗНАЕШЬ, ЧТО ДЕЛАТЬ',
          'С ДНЁМ РОЖДЕНИЯ!\nЗДОРОВЬЯ, СЧАСТЬЯ\nИ ПОЛНОГО БАКА {g}',
          'ГОДЫ — ЭТО НЕ\nВОЗРАСТ, А ОПЫТ',
          'ПОЗДРАВЛЯЕМ!\nТЫ ЛУЧШИЙ\nПОДАРОК ДЛЯ НАС',
          'ПУСТЬ ЭТОТ ГОД\nБУДЕТ САМЫМ\nЯРКИМ {r}{y}{b}',
          'ЖЕЛАЕМ ТЕПЛА,\nДОБРА, ЛЮБВИ\nИ ВКУСНОГО ТОРТА',
          'С ДР!\nНЕ СЧИТАЙ ГОДЫ —\nСЧИТАЙ РАДОСТИ'],
        en: ['HAPPY BIRTHDAY!\n{r}{o}{y}{g}{b}{v}{r}{o}{y}{g}{b}{v}',
          'MAKE A WISH\nAND BLOW OUT\nTHE CANDLES {y}{y}{y}',
          'ANOTHER YEAR OF\nLAUGHS AND ADVENTURES',
          'CHEERS TO YOU!\nHAPPY BIRTHDAY']
      }
    },
    {
      id: 'newyear', ru: 'Новый год', en: 'New Year', kw: ['новый год', 'new year', 'ёлка', 'елка', 'рождество', 'christmas'],
      arts: ['tree', 'star', 'gift'], confetti: true,
      bigDyn: function () { var d = new Date(); return String(d.getMonth() >= 9 ? d.getFullYear() + 1 : d.getFullYear()); },
      dyn: function (lang) {
        var n = daysTo(0, 1);
        if (n === 0) return [lang === 'en' ? 'HAPPY NEW YEAR!' : 'С НОВЫМ ГОДОМ!\n{r}{g}{r}{g}{r}{g}{r}{g}'];
        return [lang === 'en' ? 'NEW YEAR IN\n' + n + ' DAYS' : 'ДО НОВОГО ГОДА\nОСТАЛОСЬ\n' + n + ' ' + plural(n, 'ДЕНЬ', 'ДНЯ', 'ДНЕЙ') + '\n{g}{r}{g}{r}{g}'];
      },
      msgs: {
        ru: ['С НОВЫМ ГОДОМ!\n{g}{r}{g}{r}{g}{r}{g}{r}',
          'ПУСТЬ НОВЫЙ ГОД\nПРИНЕСЁТ ТО,\nО ЧЁМ МЕЧТАЕШЬ',
          'МАНДАРИНЫ {o}{o}{o}\nЁЛКА {g}{g}{g}\nЧУДО — ВКЛЮЧЕНО',
          'ВРЕМЯ ЗАГАДЫВАТЬ\nЖЕЛАНИЯ {y}',
          'НОВЫЙ ГОД —\nНОВЫЕ ДОРОГИ\nИ НОВЫЕ МЕЧТЫ',
          'ЗДОРОВЬЯ, ТЕПЛА\nИ ВОЛШЕБСТВА\nВ КАЖДОМ ДНЕ',
          'ДЕД МОРОЗ\nУЖЕ В ПУТИ {r}',
          'ПУСТЬ ВСЁ ПЛОХОЕ\nОСТАНЕТСЯ\nВ СТАРОМ ГОДУ'],
        en: ['HAPPY NEW YEAR!\n{g}{r}{g}{r}{g}{r}{g}{r}',
          'NEW YEAR\nNEW ADVENTURES',
          'MAKE A WISH {y}',
          'CHEERS TO A\nBRAND NEW YEAR']
      }
    },
    {
      id: 'love', ru: 'Любовь', en: 'Love', kw: ['люб', 'love', 'сердц', 'валентин', 'heart'],
      arts: ['heart', 'hearts2', 'wine', 'flower'], big: ['LOVE', 'XOXO'], hearts: true,
      msgs: {
        ru: ['ЛЮБЛЮ ТЕБЯ\n{r}{r}{r}',
          'ТЫ — МОЁ\nЛЮБИМОЕ\nМЕСТО В МИРЕ',
          'ЛЮБОВЬ — ЭТО\nКОГДА ТЕБЕ\nОСТАВИЛИ\nПОСЛЕДНИЙ КУСОЧЕК',
          'С ТОБОЙ ДАЖЕ\nПОНЕДЕЛЬНИК —\nПРАЗДНИК {r}',
          'ВСЁ, ЧТО НАМ\nНУЖНО, — ЭТО\nЛЮБОВЬ\n(И НЕМНОГО КОФЕ)',
          'ДОМ ТАМ,\nГДЕ ТЫ {r}',
          'ОБНИМАШКИ\nБЕСПЛАТНО\n{r}{v}{r}{v}{r}'],
        en: ['I LOVE YOU\n{r}{r}{r}',
          'YOU ARE MY\nFAVORITE PLACE',
          'HOME IS\nWHEREVER YOU ARE {r}',
          'ALL YOU NEED\nIS LOVE']
      }
    },
    {
      id: 'motivation', ru: 'Мотивация', en: 'Motivation', kw: ['мотив', 'успех', 'motivation', 'цел'],
      arts: ['star', 'plane'], big: ['GO!', 'YES!'],
      msgs: {
        ru: ['ДЕЛАЙ СЕГОДНЯ ТО,\nЗА ЧТО ЗАВТРА\nСКАЖЕШЬ СЕБЕ\nСПАСИБО',
          'МАЛЕНЬКИЕ ШАГИ —\nТОЖЕ ДВИЖЕНИЕ\nВПЕРЁД {g}',
          'НЕ ЖДИ\nВДОХНОВЕНИЯ.\nНАЧНИ — И ОНО\nПРИДЁТ',
          'ТЫ МОЖЕШЬ\nБОЛЬШЕ,\nЧЕМ ДУМАЕШЬ',
          'ОШИБКИ —\nДОКАЗАТЕЛЬСТВО,\nЧТО ТЫ ПРОБУЕШЬ',
          'ПЛАН НА СЕГОДНЯ:\n{g} УСПЕВАТЬ\n{g} УЛЫБАТЬСЯ\n{g} НЕ СДАВАТЬСЯ',
          'ДОРОГУ ОСИЛИТ\nИДУЩИЙ',
          'ЛУЧШЕ СДЕЛАТЬ\nИ ПОЖАЛЕТЬ,\nЧЕМ ЖАЛЕТЬ,\nЧТО НЕ СДЕЛАЛ'],
        en: ['DO SOMETHING TODAY\nYOUR FUTURE SELF\nWILL THANK YOU FOR',
          'SMALL STEPS\nARE STILL\nPROGRESS {g}',
          'YOU CAN DO\nMORE THAN\nYOU THINK',
          'DONE IS BETTER\nTHAN PERFECT']
      }
    },
    {
      id: 'cars', ru: 'Автомобили', en: 'Cars', kw: ['авто', 'машин', 'car', 'мотор', 'гонк', 'turbo', 'турбо'],
      arts: ['car', 'car2'], big: ['TURBO', 'V8', 'GT'],
      msgs: {
        ru: ['ЛЮБИМЫЕ МАШИНЫ\nНАХОДЯТ ДОРОГУ\nПРЯМО В СЕРДЦЕ {r}',
          'ЖИЗНЬ — ЭТО\nДОРОГА.\nНАСЛАЖДАЙСЯ\nКАЖДЫМ ПОВОРОТОМ',
          'БЕНЗИН В КРОВИ\n{r}{r}{r}{r}{r}{r}',
          'ЛУЧШАЯ ТЕРАПИЯ —\nДОРОГА\nИ ХОРОШАЯ МУЗЫКА',
          'ФАКТ: ПЕРВЫЙ\nАВТОМОБИЛЬ БЕНЦА\nПОЯВИЛСЯ В 1886',
          'ФАКТ: FORD MODEL T\nВЫПУСКАЛСЯ\nС 1908 ПО 1927',
          'НЕ ВСЕ, КТО\nСТОИТ В ГАРАЖЕ,\nПОТЕРЯНЫ',
          'ДЕНЬГИ НЕ КУПЯТ\nСЧАСТЬЕ, НО\nКУПЯТ ЗАПЧАСТИ',
          'САМЫЙ КРАСИВЫЙ\nЗВУК — ХОЛОДНЫЙ\nЗАПУСК МОТОРА',
          'МАСЛО ПРОВЕРЕНО?\nШИНЫ ПОДКАЧАНЫ?\nПОЕХАЛИ! {g}'],
        en: ['BELOVED CARS\nFIND THEIR WAY\nINTO YOUR HEART {r}',
          'LIFE IS A ROAD.\nENJOY THE CURVES',
          'GASOLINE\nIN MY VEINS',
          'NOT ALL WHO\nWANDER ARE LOST.\nSOME ARE DRIVING']
      }
    },
    {
      id: 'saab', ru: 'SAAB', en: 'SAAB', exclude: ['SPYKER', 'СПАЙКЕР', 'СПАЙКЕРА'], kw: ['saab', 'сааб', 'trollh', 'тролльх'],
      arts: ['car', 'car2', 'plane'], big: ['SAAB', '900', '9000', '99', 'TURBO'],
      msgs: {
        ru: [
          'SAAB —\nЭТО НЕ МАШИНА,\nЭТО ХАРАКТЕР',
          'BORN FROM JETS\n{b}{b}{b}{b}{b}{b}{b}{b}',
          'КЛЮЧ ЗАЖИГАНИЯ\nМЕЖДУ СИДЕНИЙ.\nТАК НАДО.',
          'ТРОЛЛЬХЕТТАН —\nНАШ ВТОРОЙ ДОМ {b}{y}',
          'TURBO: ВКЛ {g}\nНАСТРОЕНИЕ: ВКЛ {g}',
          'ОДИН РАЗ SAAB —\nНАВСЕГДА SAAB',
          'НАСТОЯЩИЕ\nСААБОВОДЫ\nНЕ СДАЮТСЯ\n{b}{y}{b}{y}{b}',
          'SAAB НЕ СТАРЕЕТ.\nОН ПРИОБРЕТАЕТ\nПАТИНУ',
          'NIGHT PANEL:\nЛИШНИЕ ПРИБОРЫ\nПОГАСЛИ.\nТОЛЬКО ДОРОГА.',
          'ЕСЛИ НЕ ЗАВЁЛСЯ —\nПРОВЕРЬ,\nВСТАВЛЕН ЛИ КЛЮЧ\nМЕЖДУ СИДЕНИЙ',
          'ДРУГИЕ ЕЗДЯТ.\nМЫ ЛЕТАЕМ\nНИЗКО {b}',
          'ВСЁ ЛОГИЧНО.\nПРОСТО ЛОГИКА\nШВЕДСКАЯ',
          'ШВЕДСКИЙ ДИЗАЙН:\nКРАСИВО,\nНАДЁЖНО\nИ НЕМНОГО СТРАННО',
          'ЛУЧШИЙ ЗВУК\nВ МИРЕ —\nСВИСТ ТУРБИНЫ',
          'ПАРКУЕМСЯ\nКАПОТОМ ВПЕРЁД.\nОН ЭТО ЗАСЛУЖИЛ',
          'ГАРАЖ: SAAB\nСЕРДЦЕ: SAAB\nЗАПЧАСТИ: ИЩЕМ',
          'ДЕНЬ БЕЗ SAAB —\nДЕНЬ, ПРОЖИТЫЙ\nНА АВТОБУСЕ',
          'ХОРОШИЙ SAAB\nНЕ ПРОДАЮТ.\nЕГО ПЕРЕДАЮТ',
          'ЛОБОВОЕ СТЕКЛО\nКАК У КАБИНЫ\nСАМОЛЁТА {b}',
          'ДОБРОЕ УТРО!\nTURBO ПРОГРЕТ,\nКОФЕ ГОТОВ {o}',
          'SAAB-КЛУБ\nСОБИРАЕТСЯ\nПО ПЯТНИЦАМ.\nИ В ОСТАЛЬНЫЕ ДНИ',
          'НЕ ТАКОЙ,\nКАК ВСЕ.\nИ ЭТО\nКОМПЛИМЕНТ',
          'ПРИБОРНАЯ ПАНЕЛЬ\nКАК В КАБИНЕ\nПИЛОТА',
          'ВЗЛЁТ\nРАЗРЕШАЮ {g}\n— ДИСПЕТЧЕР SAAB',
          'ТИШЕ ЕДЕШЬ —\nДОЛЬШЕ СЛЫШИШЬ\nТУРБИНУ',
          'СИДЕНЬЯ С\nПОДОГРЕВОМ —\nЭТО ОЧЕНЬ\nПО-ШВЕДСКИ',
          'ЗИМА НЕ СТРАШНА.\nSAAB РОДОМ\nИЗ ШВЕЦИИ {w}{b}',
          'ГРИФОН НА\nРУЛЕ —\nКАК ГЕРБ\nНА ЩИТЕ',
          'ФАКТ: SAAB\nНАЧИНАЛСЯ С\nСАМОЛЁТОВ В 1937',
          'ФАКТ: ПЕРВЫЙ\nСЕРИЙНЫЙ SAAB —\nМОДЕЛЬ 92, 1949',
          'ФАКТ: ПРОТОТИП\nURSAAB ПОКАЗАЛИ\nВ 1947 ГОДУ',
          'ФАКТ: КУЗОВ\nSAAB 92 РИСОВАЛ\nСИКСТЕН САСОН',
          'ФАКТ: ПЕРВЫЕ\nSAAB 92 БЫЛИ\nТОЛЬКО\nТЁМНО-ЗЕЛЁНЫМИ {g}',
          'ФАКТ: У РАННИХ\nSAAB БЫЛ\nДВУХТАКТНЫЙ\nМОТОР',
          'ФАКТ: SAAB 96\nВЫПУСКАЛИ\nС 1960 ПО 1980',
          'ФАКТ: ЭРИК\nКАРЛССОН ТРИЖДЫ\nПОДРЯД ВЫИГРАЛ\nRAC РАЛЛИ НА SAAB',
          'ФАКТ: ЭРИК\nКАРЛССОН ДВАЖДЫ\nВЫИГРАЛ\nРАЛЛИ МОНТЕ-КАРЛО',
          'ФАКТ: ПРОЗВИЩЕ\nКАРЛССОНА —\n«НА КРЫШЕ»',
          'ФАКТ: SAAB 99\nПОЯВИЛСЯ\nВ 1968 ГОДУ',
          'ФАКТ: SAAB 99 TURBO\nСДЕЛАЛ ТУРБО\nМОДНЫМ ДЛЯ\nОБЫЧНЫХ МАШИН',
          'ФАКТ: КЛАССИЧЕСКИЙ\nSAAB 900\nВЫПУСКАЛИ\nС 1978 ПО 1993',
          'ФАКТ: SAAB 900\nКАБРИОЛЕТ\nПОЯВИЛСЯ\nВ 1986 ГОДУ',
          'ФАКТ: SAAB 9000\nВЫПУСКАЛИ\nС 1984 ПО 1998',
          'ФАКТ: SAAB 9000\nДЕЛИЛ ПЛАТФОРМУ\nС FIAT CROMA\nИ LANCIA THEMA',
          'ФАКТ: SAAB 9-3\nVIGGEN НАЗВАН\nВ ЧЕСТЬ\nИСТРЕБИТЕЛЯ',
          'ФАКТ: SAAB\nОДНИМ ИЗ ПЕРВЫХ\nСТАВИЛ\nПОДОГРЕВ СИДЕНИЙ',
          'ФАКТ: SAAB\nВЫПУСКАЛ\nСПОРТКАРЫ\nSONETT',
          'ФАКТ: ЗАВОД SAAB\nСТОЯЛ В ГОРОДЕ\nТРОЛЛЬХЕТТАН',
          'ФАКТ: СЕГОДНЯ\nSAAB AB ДЕЛАЕТ\nИСТРЕБИТЕЛИ\nGRIPEN {b}',
          'ФАКТ: SAAB 900\nСТАЛ ИКОНОЙ\nВОСЬМИДЕСЯТЫХ',
          'SAAB 99, 900,\n9000, 9-3, 9-5.\nВЫБЕРИ\nЛЮБИМЫЙ',
          'ЛЮБИМЫЕ МАШИНЫ\nНАХОДЯТ ДОРОГУ\nПРЯМО В СЕРДЦЕ\n{r} SAAB {r}',
          'КОГДА-НИБУДЬ\nВСЕ МАШИНЫ\nБУДУТ КАК SAAB.\nНО НЕ СЕГОДНЯ',
          'ЕДЕМ НА\nВСТРЕЧУ КЛУБА.\nКОЛОННОЙ {b}{b}{b}',
          'СЛОВАРЬ:\nСААБОВОД —\nСЧАСТЛИВЫЙ\nЧЕЛОВЕК'],
        en: [
          'SAAB:\nNOT A CAR,\nA CHARACTER',
          'BORN FROM JETS\n{b}{b}{b}{b}{b}{b}{b}{b}',
          'IGNITION BETWEEN\nTHE SEATS.\nOF COURSE.',
          'ONCE A SAAB,\nALWAYS A SAAB',
          'TURBO: ON {g}\nMOOD: ON {g}',
          'OTHERS DRIVE.\nWE FLY LOW {b}',
          'BEST SOUND\nIN THE WORLD:\nTURBO WHISTLE',
          'GOOD SAABS\nARE NOT SOLD.\nTHEY ARE\nPASSED ON',
          'NIGHT PANEL ON.\nJUST YOU AND\nTHE ROAD',
          'FACT: SAAB\nSTARTED WITH\nAIRCRAFT IN 1937',
          'FACT: THE FIRST\nPRODUCTION SAAB\nWAS THE 92, 1949',
          'FACT: ERIK\nCARLSSON WON\nTHE RAC RALLY\nTHREE TIMES',
          'FACT: CLASSIC\nSAAB 900:\n1978 - 1993',
          'FACT: SAAB 99\nTURBO MADE\nTURBO COOL',
          'FACT: TODAY\nSAAB AB BUILDS\nGRIPEN JETS {b}']
      }
    },
    {
      id: 'kitchen', ru: 'Кухня и кофе', en: 'Kitchen & coffee', kw: ['кухн', 'кофе', 'еда', 'coffee', 'food', 'обед', 'ужин'],
      arts: ['cup', 'cake'], big: ['КОФЕ', 'YUM', 'EAT'],
      msgs: {
        ru: ['КУХНЯ ОТКРЫТА.\nШЕФ В ХОРОШЕМ\nНАСТРОЕНИИ {g}',
          'СЕГОДНЯ В МЕНЮ:\nЧТО ЕСТЬ\nВ ХОЛОДИЛЬНИКЕ',
          'УРОВЕНЬ КОФЕ:\n{o}{o}{o}{o}{o}{o}{o}..\nЗАРЯД: 70%',
          'ГОТОВИМ С\nЛЮБОВЬЮ.\nМОЕМ — ПО\nОЧЕРЕДИ',
          'ПОСУДОМОЙКА\nЗАГРУЖЕНА?\nТЫ ГЕРОЙ!',
          'ЛУЧШИЕ РАЗГОВОРЫ\nСЛУЧАЮТСЯ\nНА КУХНЕ',
          'УЖИН В 19:00.\nНЕ ОПАЗДЫВАТЬ! {r}',
          'НЕ ЗАБУДЬ\nПОПИТЬ ВОДЫ {b}{b}'],
        en: ['KITCHEN IS OPEN.\nCHEF IS HAPPY {g}',
          'TODAY\'S MENU:\nWHATEVER IS\nIN THE FRIDGE',
          'BUT FIRST,\nCOFFEE {o}',
          'DINNER AT 7.\nDON\'T BE LATE {r}']
      }
    },
    {
      id: 'family', ru: 'Семья и дети', en: 'Family', kw: ['семь', 'дет', 'family', 'kids', 'малыш', 'сын', 'доч'],
      arts: ['house', 'heart', 'smile'], big: ['MAMA', 'ПАПА', 'HOME'],
      msgs: {
        ru: ['СЕМЬЯ — ЭТО\nКОГДА ВСЕ ДОМА\n{r}{o}{y}{g}{b}{v}',
          'ДОМ, МИЛЫЙ ДОМ',
          'ПРАВИЛА ДОМА:\nОБНИМАТЬСЯ,\nСМЕЯТЬСЯ,\nУБИРАТЬ ИГРУШКИ',
          'ЗУБЫ ПОЧИСТИЛ?\nТОГДА СЛАДКИХ\nСНОВ {v}',
          'ТЫ СЕГОДНЯ\nМОЛОДЕЦ!\nПАПА ГОРДИТСЯ {y}',
          'ЛУЧШЕЕ, ЧТО У\nНАС ЕСТЬ, — ЭТО\nДРУГ ДРУГ',
          'ОБЪЯВЛЕНИЕ:\nВЕЧЕРОМ —\nСЕМЕЙНОЕ КИНО'],
        en: ['HOME SWEET HOME',
          'FAMILY: WHERE\nLIFE BEGINS AND\nLOVE NEVER ENDS',
          'HOUSE RULES:\nHUG, LAUGH,\nPICK UP TOYS',
          'SWEET DREAMS {v}']
      }
    },
    {
      id: 'humor', ru: 'Юмор', en: 'Humor', kw: ['юмор', 'шутк', 'смеш', 'joke', 'fun'],
      arts: ['smile'], big: ['LOL', 'ХА-ХА'],
      msgs: {
        ru: ['Я НЕ ЛЕНИВЫЙ.\nЯ В РЕЖИМЕ\nЭНЕРГОСБЕРЕЖЕНИЯ',
          'ДИЕТА\nНАЧИНАЕТСЯ\nС ПОНЕДЕЛЬНИКА.\nКАКОГО — НЕ ЯСНО',
          'ВСЁ ИДЁТ ПО\nПЛАНУ. ПЛАНА\nНЕТ.',
          'ВЫХОДНЫЕ —\nСЛИШКОМ КОРОТКИЕ,\nЧТОБЫ БЫТЬ\nСЕРЬЁЗНЫМ',
          'ЕСЛИ ЧТО-ТО НЕ\nРАБОТАЕТ —\nВЫКЛЮЧИ\nИ ВКЛЮЧИ',
          'КОТ ЗАНЯЛ\nДИВАН.\nПЕРЕГОВОРЫ\nИДУТ',
          'Я ПРОСНУЛСЯ.\nЭТО УЖЕ\nДОСТИЖЕНИЕ {g}'],
        en: ['I AM NOT LAZY.\nI AM IN\nENERGY SAVING MODE',
          'EVERYTHING IS\nGOING TO PLAN.\nTHERE IS NO PLAN.',
          'TURN IT OFF\nAND ON AGAIN']
      }
    },
    {
      id: 'wisdom', ru: 'Мудрость', en: 'Wisdom', kw: ['мудр', 'цитат', 'quote', 'wisdom', 'философ'],
      arts: ['moon', 'star'],
      msgs: {
        ru: ['ПОЗНАЙ\nСАМОГО СЕБЯ.\n— СОКРАТ',
          'Я ЗНАЮ, ЧТО\nНИЧЕГО НЕ ЗНАЮ.\n— СОКРАТ',
          'ВСЁ ТЕЧЁТ,\nВСЁ МЕНЯЕТСЯ.\n— ГЕРАКЛИТ',
          'ПУТЬ В ТЫСЯЧУ\nЛИ НАЧИНАЕТСЯ\nС ПЕРВОГО ШАГА.\n— ЛАО-ЦЗЫ',
          'КРАТКОСТЬ —\nСЕСТРА ТАЛАНТА.\n— А. ЧЕХОВ',
          'ТЕРПЕНИЕ И ТРУД\nВСЁ ПЕРЕТРУТ',
          'ТИШЕ ЕДЕШЬ —\nДАЛЬШЕ БУДЕШЬ',
          'ЛУЧШЕ ЗАЖЕЧЬ\nСВЕЧУ, ЧЕМ\nПРОКЛИНАТЬ\nТЕМНОТУ',
          'СЧАСТЬЕ — ЭТО\nКОГДА ТЕБЯ\nПОНИМАЮТ'],
        en: ['KNOW THYSELF.\n- SOCRATES',
          'THE JOURNEY OF\nA THOUSAND MILES\nBEGINS WITH\nONE STEP. - LAO TZU',
          'BREVITY IS THE\nSOUL OF WIT.\n- SHAKESPEARE',
          'NOTHING IS\nPERMANENT EXCEPT\nCHANGE. - HERACLITUS']
      }
    },
    {
      id: 'weekend', ru: 'Пятница и выходные', en: 'Weekend', kw: ['пятниц', 'выходн', 'weekend', 'friday', 'отдых'],
      arts: ['sun', 'wine', 'plane'], big: ['FRI', 'YAY!'],
      dyn: function (lang) {
        var d = new Date().getDay();
        var left = (5 - d + 7) % 7;
        if (lang === 'en') return [left === 0 ? 'IT\'S FRIDAY!\n{y}{o}{r}{v}{b}{g}' : 'FRIDAY IN ' + left + ' DAY' + (left > 1 ? 'S' : '')];
        return [left === 0 ? 'УРА, ПЯТНИЦА!\n{y}{o}{r}{v}{b}{g}' : 'ДО ПЯТНИЦЫ\nОСТАЛОСЬ ' + left + ' ' + plural(left, 'ДЕНЬ', 'ДНЯ', 'ДНЕЙ')];
      },
      msgs: {
        ru: ['ПЯТНИЦА!\nВРЕМЯ ВЫКЛЮЧИТЬ\nБУДИЛЬНИК {g}',
          'ВЫХОДНЫЕ:\nРЕЖИМ ОТДЫХА\nВКЛЮЧЁН',
          'ПЛАНЫ НА\nВЫХОДНЫЕ:\nНИКАКИХ ПЛАНОВ',
          'ШАББАТ ШАЛОМ!\n{b}{b}{b}{b}{b}{b}{b}{b}',
          'ПОЕХАЛИ\nКУДА-НИБУДЬ\nК МОРЮ? {b}{b}{y}'],
        en: ['FRIDAY!\nTURN OFF\nTHE ALARM {g}',
          'WEEKEND MODE:\nON',
          'WEEKEND PLANS:\nNO PLANS']
      }
    },
    {
      id: 'onthisday', ru: 'Этот день в истории', en: 'On this day', net: 'onthisday', noArt: true
    },
    {
      id: 'art', ru: 'Только картинки', en: 'Pictures only', artOnly: true
    }
  ];

  // Шаблоны для произвольной темы (имя темы — в именительном падеже)
  var TEMPLATES = {
    ru: ['ТЕМА ДНЯ:\n{T}', '{T} —\nЭТО НЕ ХОББИ,\nЭТО ОБРАЗ ЖИЗНИ', '{T}\nДЕЛАЕТ МИР\nЛУЧШЕ {g}',
      'ВСЁ, ЧТО НУЖНО:\nКОФЕ И {T}', 'СЕГОДНЯ\nВ ЦЕНТРЕ ВНИМАНИЯ:\n{T} {y}', '{T}\n{r}{o}{y}{g}{b}{v}\nНАВСЕГДА',
      'МЫСЛИ ВСЛУХ:\n{T}', 'ЛЮБЛЮ, КОГДА\nВ ЖИЗНИ ЕСТЬ\n{T} {r}', 'НЕ ВАЖНО, ЧТО\nГОВОРЯТ. ВАЖНО —\n{T}'],
    en: ['TOPIC OF THE DAY:\n{T}', '{T}:\nNOT A HOBBY,\nA LIFESTYLE', '{T}\nMAKES THE WORLD\nBETTER {g}',
      'ALL YOU NEED:\nCOFFEE AND {T}', '{T}\n{r}{o}{y}{g}{b}{v}\nFOREVER', 'I LOVE {T} {r}']
  };

  G.FlapContent = {
    ART: ART, BIG: BIG, CYR2LAT: CYR2LAT, THEMES: THEMES, TEMPLATES: TEMPLATES,
    MONTHS_RU: MONTHS_RU, MONTHS_EN: MONTHS_EN
  };
})(this);
