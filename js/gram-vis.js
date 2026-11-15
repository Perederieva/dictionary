export const VIS = {
  pres: {
    vs: [
      { h: "Present Simple", d: "звички, розклади, факти", m: ["always", "usually", "often", "every day", "never"], e: "I work from home." },
      { h: "Present Continuous", d: "дія зараз або тимчасово", m: ["now", "at the moment", "today", "this week"], e: "I'm working from home this week." }
    ],
    f: [
      ["+", "{s I/you/we/they} {m work}"],
      ["+", "{s he/she/it} {m works}"],
      ["−", "{s he} {a doesn't} {m work}"],
      ["?", "{a Do} {s you} {m work}?"],
      ["+", "{s I} {a am} / {s she} {a is} {m working}"],
      ["?", "{a Are} {s you} {m working}?"]
    ],
    tl: [
      { c: "Present Simple — регулярно, завжди", m: [{ k: "dot", x: 50 }, { k: "dot", x: 90 }, { k: "dot", x: 130 }, { k: "dot", x: 170 }, { k: "dot", x: 230 }, { k: "dot", x: 270 }], l: "every day" },
      { c: "Present Continuous — саме зараз", m: [{ k: "wave", x: 175, x2: 225 }], l: "now" }
    ],
    chk: [
      { s: "Look! The bus ___.", o: ["is coming", "comes", "come"], w: "Look! — дія зараз." },
      { s: "I ___ this song. It's great!", o: ["love", "am loving", "loves"], w: "love — дієслово стану." }
    ]
  },
  past: {
    vs: [
      { h: "Past Simple", d: "завершена дія, послідовність дій", m: ["yesterday", "ago", "last week", "in 2020", "when"], e: "I called her yesterday." },
      { h: "Past Continuous", d: "дія тривала в момент минулого, фон", m: ["while", "at 8 pm yesterday", "all evening"], e: "I was cooking when she called." }
    ],
    f: [
      ["+", "{s I} {m worked} / {m went}"],
      ["−", "{s I} {a didn't} {m work}"],
      ["?", "{a Did} {s you} {m work}?"],
      ["+", "{s I/he} {a was} / {s you/we} {a were} {m working}"],
      ["?", "{a Were} {s you} {m working}?"]
    ],
    tl: [
      { c: "Довга дія (Continuous) і коротка подія (Simple)", m: [{ k: "wave", x: 50, x2: 150 }, { k: "dot", x: 110, big: true }], l: "I was cooking … the phone rang" }
    ],
    chk: [
      { s: "She ___ TV when I came in.", o: ["was watching", "watched", "watches"], w: "Дія тривала, коли я зайшов." },
      { s: "We ___ to the cinema last night.", o: ["went", "were going", "have gone"], w: "last night — завершена дія." }
    ]
  },
  pperf: {
    vs: [
      { h: "Present Perfect", d: "досвід, результат зараз, без точного часу", m: ["ever", "never", "already", "yet", "just", "so far"], e: "I've been to Rome." },
      { h: "Past Simple", d: "названо, коли саме", m: ["yesterday", "ago", "last year", "in 2019", "when"], e: "I went to Rome in 2019." }
    ],
    f: [
      ["+", "{s I/you/we} {a have} {m worked}"],
      ["+", "{s he/she/it} {a has} {m worked}"],
      ["−", "{s I} {a haven't} {m seen} it {w yet}"],
      ["?", "{a Have} {s you} {w ever} {m been} there?"]
    ],
    tl: [
      { c: "Present Perfect — колись, але важливо зараз", m: [{ k: "arc", x: 90, x2: 200 }], l: "I've lost my keys" },
      { c: "Past Simple — конкретний момент у минулому", m: [{ k: "dot", x: 90, big: true }], l: "in 2019" }
    ],
    chk: [
      { s: "I ___ my homework. Can I go out?", o: ["have done", "did yesterday", "do"], w: "Результат важливий зараз." },
      { s: "She ___ him two days ago.", o: ["met", "has met", "meets"], w: "ago — Past Simple." }
    ]
  },
  ppc: {
    vs: [
      { h: "for", d: "скільки часу", m: ["for two hours", "for ages", "for a week"], e: "I've been waiting for an hour." },
      { h: "since", d: "відколи (точка)", m: ["since 2020", "since Monday", "since I was a child"], e: "I've been waiting since 9." }
    ],
    f: [
      ["+", "{s I/you} {a have been} {m working}"],
      ["+", "{s she} {a has been} {m working}"],
      ["?", "{w How long} {a have} {s you} {a been} {m working}?"]
    ],
    tl: [
      { c: "Почалося в минулому і триває досі", m: [{ k: "wave", x: 80, x2: 200 }, { k: "dot", x: 80 }], l: "since 2020" }
    ],
    chk: [
      { s: "I've lived here ___ five years.", o: ["for", "since", "from"], w: "Період — for." },
      { s: "How long ___ for me?", o: ["have you been waiting", "are you waiting", "do you wait"], w: "How long + триває досі." }
    ]
  },
  pastperf: {
    vs: [
      { h: "Past Perfect", d: "що сталося раніше", m: ["already", "before", "by the time", "after"], e: "The film had started…" },
      { h: "Past Simple", d: "що сталося потім", m: ["when", "then"], e: "…when we arrived." }
    ],
    f: [
      ["+", "{s I/she/they} {a had} {m left}"],
      ["−", "{s he} {a hadn't} {m finished}"],
      ["+", "{s we} {a had been} {m waiting}"]
    ],
    tl: [
      { c: "1 — раніше (had + V3), 2 — потім (Past Simple)", m: [{ k: "dot", x: 60, n: "1" }, { k: "dot", x: 140, n: "2", big: true }], l: "had left … arrived" }
    ],
    chk: [
      { s: "When I got home, my sister ___ dinner.", o: ["had already made", "already made", "has made"], w: "Вечеря була готова раніше." },
      { s: "He told me he ___ the book.", o: ["had read", "has read", "reads"], w: "Прочитав раніше, ніж сказав." }
    ]
  },
  usedto: {
    vs: [
      { h: "used to + V", d: "раніше було, тепер ні", m: ["used to live", "didn't use to"], e: "I used to smoke." },
      { h: "be used to + -ing", d: "звиклий", m: ["I'm used to", "she isn't used to"], e: "I'm used to working late." },
      { h: "get used to + -ing", d: "звикати", m: ["get used to", "got used to"], e: "You'll get used to it." }
    ],
    f: [
      ["+", "{s I} {a used to} {m live} here"],
      ["−", "{s I} {a didn't use to} {m like} it"],
      ["+", "{s I'm} {a used to} {m getting up} early"]
    ],
    tl: [
      { c: "used to — колись регулярно, тепер ні", m: [{ k: "dot", x: 40 }, { k: "dot", x: 70 }, { k: "dot", x: 100 }, { k: "dot", x: 130 }, { k: "stop", x: 155 }], l: "I used to swim" }
    ],
    chk: [
      { s: "I ___ have a dog when I was a child.", o: ["used to", "am used to", "was used to"], w: "Колишній стан — used to." },
      { s: "She's used to ___ early.", o: ["getting up", "get up", "got up"], w: "be used to + -ing." }
    ]
  },
  future: {
    vs: [
      { h: "will", d: "рішення зараз, обіцянка, думка", m: ["I think", "probably", "I promise"], e: "I'll help you." },
      { h: "be going to", d: "план або видно ознаки", m: ["next week", "look!"], e: "I'm going to move." },
      { h: "Present Continuous", d: "домовленість, є час і місце", m: ["at 6", "on Friday"], e: "I'm meeting Anna at 6." }
    ],
    f: [
      ["+", "{s I} {a will} {m help} / {s I}{a 'll} {m help}"],
      ["−", "{s I} {a won't} {m tell}"],
      ["+", "{s I} {a am going to} {m buy}"],
      ["+", "{s I} {a am} {m meeting} her {w tomorrow}"]
    ],
    tl: [
      { c: "going to — план, вирішений раніше", m: [{ k: "arc", x: 150, x2: 260, dir: 1 }], l: "decided → will happen" },
      { c: "will — вирішую зараз", m: [{ k: "arc", x: 200, x2: 260, dir: 1 }], l: "I'll get it!" }
    ],
    chk: [
      { s: "Careful! You ___ drop the plates!", o: ["'re going to", "will", "drop"], w: "Видно ознаки — going to." },
      { s: "I'm thirsty. — I ___ get you some water.", o: ["'ll", "'m going to", "get"], w: "Рішення зараз — will." }
    ]
  },
  futcont: {
    vs: [
      { h: "Future Continuous", d: "триватиме в момент у майбутньому", m: ["this time tomorrow", "at 8 tonight"], e: "I'll be flying." },
      { h: "Future Perfect", d: "буде зроблено до моменту", m: ["by Friday", "by then", "by the time"], e: "I'll have finished." }
    ],
    f: [
      ["+", "{s I} {a will be} {m working}"],
      ["+", "{s I} {a will have} {m finished}"],
      ["−", "{s I} {a won't have} {m finished}"]
    ],
    tl: [
      { c: "Future Continuous — процес у момент майбутнього", m: [{ k: "wave", x: 235, x2: 295 }, { k: "ref", x: 265 }], l: "this time tomorrow" },
      { c: "Future Perfect — готово до моменту", m: [{ k: "dot", x: 240, big: true }, { k: "ref", x: 280 }], l: "by Friday" }
    ],
    chk: [
      { s: "By 2030 I ___ my degree.", o: ["will have got", "will be getting", "get"], w: "by — Future Perfect." },
      { s: "At 9 tomorrow we ___ the exam.", o: ["will be taking", "will have taken", "take"], w: "Процес у момент — Future Continuous." }
    ]
  },
  modab: {
    vs: [
      { h: "can / could", d: "вмію зараз / вмів колись", m: ["can swim", "could read at 4"], e: "I can drive." },
      { h: "be able to", d: "в інших часах і один успіх у минулому", m: ["will be able to", "have been able to", "was able to"], e: "I'll be able to help." },
      { h: "may / might", d: "можливо", m: ["might rain", "may be late"], e: "It might snow." }
    ],
    f: [
      ["+", "{s I} {a can} {m swim}"],
      ["+", "{s I} {a will be able to} {m come}"],
      ["+", "{s It} {a might} {m rain}"],
      ["−", "{s I} {a couldn't} {m sleep}"]
    ],
    chk: [
      { s: "I'm sorry, I ___ come tomorrow.", o: ["won't be able to", "can't to", "couldn't"], w: "Майбутнє — won't be able to." },
      { s: "Take a coat — it ___ get cold.", o: ["might", "can't", "must"], w: "Можливість — might." }
    ]
  },
  modob: {
    vs: [
      { h: "must / have to", d: "треба", m: ["must go", "have to work", "had to wait"], e: "I have to wear a uniform." },
      { h: "mustn't", d: "не можна, заборонено", m: ["mustn't smoke"], e: "You mustn't park here." },
      { h: "don't have to", d: "не обов'язково", m: ["don't have to pay"], e: "You don't have to come." }
    ],
    f: [
      ["+", "{s I} {a must} {m go}"],
      ["+", "{s she} {a has to} {m work}"],
      ["−", "{s you} {a mustn't} {m touch}"],
      ["−", "{s you} {a don't have to} {m pay}"],
      ["+", "{s you} {a should} {m rest}"]
    ],
    chk: [
      { s: "It's free — you ___ pay.", o: ["don't have to", "mustn't", "have to"], w: "Не обов'язково — don't have to." },
      { s: "You ___ smoke on the plane.", o: ["mustn't", "don't have to", "should"], w: "Заборона — mustn't." }
    ]
  },
  deduc: {
    vs: [
      { h: "must", d: "майже напевно так", m: ["must be", "must have done"], e: "He must be tired." },
      { h: "might / may / could", d: "можливо", m: ["might be", "might have left"], e: "She might be at home." },
      { h: "can't", d: "точно ні", m: ["can't be", "can't have seen"], e: "It can't be true." }
    ],
    f: [
      ["+", "{s He} {a must} {m be} tired"],
      ["+", "{s She} {a might have} {m left}"],
      ["−", "{s It} {a can't} {m be} Tom"]
    ],
    chk: [
      { s: "The lights are off. They ___ be asleep.", o: ["must", "can't", "mustn't"], w: "Логічний висновок — must." },
      { s: "That ___ be Anna — she's in Paris.", o: ["can't", "mustn't", "must"], w: "Точно ні — can't." }
    ]
  },
  cond01: {
    vs: [
      { h: "Zero", d: "завжди так, факти", m: ["if/when + Present, Present"], e: "If you heat ice, it melts." },
      { h: "First", d: "реально в майбутньому", m: ["if/unless/when + Present, will"], e: "If it rains, I'll stay home." }
    ],
    f: [
      ["0", "{w If} {s you} {m heat} ice, {s it} {m melts}"],
      ["1", "{w If} {s it} {m rains}, {s I} {a will} {m stay} home"],
      ["1", "{w when / as soon as / unless} + {m Present}"]
    ],
    chk: [
      { s: "If you ___ late, I'll wait.", o: ["are", "will be", "were"], w: "Після if — Present." },
      { s: "I'll call you when I ___ home.", o: ["get", "will get", "got"], w: "Після when — Present." }
    ]
  },
  cond2: {
    vs: [
      { h: "First", d: "реально", m: ["If I have…, I will…"], e: "If I have time, I'll come." },
      { h: "Second", d: "уявно, малоймовірно зараз", m: ["If I had…, I would…"], e: "If I had time, I'd come." }
    ],
    f: [
      ["2", "{w If} {s I} {m had} money, {s I} {a would} {m travel}"],
      ["2", "{w If} {s I} {m were} you, {s I}{a 'd} {m go}"],
      ["wish", "{s I} {w wish} {s I} {m lived} closer"]
    ],
    chk: [
      { s: "If I ___ rich, I'd buy an island.", o: ["were", "am", "would be"], w: "if + Past Simple." },
      { s: "I wish I ___ French.", o: ["spoke", "speak", "will speak"], w: "wish + Past Simple." }
    ]
  },
  cond3: {
    vs: [
      { h: "Second", d: "уявне зараз", m: ["If I knew, I'd tell you"], e: "Не знаю зараз" },
      { h: "Third", d: "уявне минуле, не змінити", m: ["If I had known, I'd have told you"], e: "Тоді не знала" }
    ],
    f: [
      ["3", "{w If} {s I} {a had} {m known}, {s I} {a would have} {m come}"],
      ["wish", "{s I} {w wish} {s I} {a hadn't} {m said} that"]
    ],
    tl: [
      { c: "Уявна інша версія минулого", m: [{ k: "dot", x: 80, big: true }, { k: "alt", x: 80, x2: 150 }], l: "if I had left earlier…" }
    ],
    chk: [
      { s: "If we had hurried, we ___ the train.", o: ["would have caught", "would catch", "caught"], w: "would have + V3." },
      { s: "I wish I ___ that.", o: ["hadn't said", "didn't say", "don't say"], w: "Про минуле — had + V3." }
    ]
  },
  passive: {
    vs: [
      { h: "Активний", d: "хто робить", m: ["They built it."], e: "Someone stole my bike." },
      { h: "Пасивний", d: "що з цим сталося", m: ["It was built."], e: "My bike was stolen." }
    ],
    f: [
      ["is", "{s English} {a is} {m spoken} here"],
      ["was", "{s It} {a was} {m built} in 1900"],
      ["has", "{s My car} {a has been} {m stolen}"],
      ["will", "{s It} {a will be} {m done}"],
      ["must", "{s It} {a must be} {m signed}"]
    ],
    chk: [
      { s: "The museum ___ in 1850.", o: ["was opened", "opened", "is opened"], w: "Минуле в пасиві — was + V3." },
      { s: "The room ___ now.", o: ["is being cleaned", "is cleaning", "cleans"], w: "Процес зараз — is being + V3." }
    ]
  },
  repst: {
    vs: [
      { h: "Пряма мова", d: "що сказали", m: ["am / is", "will", "can", "did / have done"], e: "\"I'm tired.\"" },
      { h: "Непряма мова", d: "крок назад у минуле", m: ["was", "would", "could", "had done"], e: "She said she was tired." }
    ],
    f: [
      ["say", "{s She} {m said} (that) {s she} {a was} tired"],
      ["tell", "{s She} {m told} {w me} (that) …"],
      ["⏱", "{w today → that day}, {w tomorrow → the next day}"]
    ],
    chk: [
      { s: "\"I will call.\" → He said he ___ call.", o: ["would", "will", "can"], w: "will → would." },
      { s: "She ___ me she was busy.", o: ["told", "said", "say"], w: "tell + кому." }
    ]
  },
  repq: {
    vs: [
      { h: "Питання", d: "прямий порядок, без do", m: ["asked where I lived", "asked if I was ready"], e: "She asked where I lived." },
      { h: "Прохання / наказ", d: "to + V / not to + V", m: ["told me to wait", "asked me not to go"], e: "He told me not to be late." }
    ],
    f: [
      ["?", "{s She} {m asked} {w where} {s I} {m lived}"],
      ["?", "{s He} {m asked} {w if} {s I} {a was} ready"],
      ["!", "{s She} {m told} {w me} {a to} {m wait}"]
    ],
    chk: [
      { s: "He asked me where ___.", o: ["I worked", "did I work", "do I work"], w: "Прямий порядок слів." },
      { s: "She told me ___ worry.", o: ["not to", "don't", "to not"], w: "not to + V." }
    ]
  },
  rel: {
    vs: [
      { h: "who / that", d: "люди", m: ["the man who…"], e: "the girl who lives next door" },
      { h: "which / that", d: "речі, тварини", m: ["the car which…"], e: "the book that I read" },
      { h: "where / whose", d: "місце / чий", m: ["the town where…", "the man whose…"], e: "the café where we met" }
    ],
    f: [
      ["", "{s The man} {w who} {m lives} here …"],
      ["", "{s The book} ({w that}) {s I} {m read} …"],
      [",", "{s Lviv}, {w which} {m is} …, …"]
    ],
    chk: [
      { s: "The woman ___ called you is my aunt.", o: ["who", "which", "where"], w: "Людина — who." },
      { s: "That's the hotel ___ we stayed.", o: ["where", "which", "who"], w: "Місце — where." }
    ]
  },
  gerinf: {
    vs: [
      { h: "+ -ing", d: "після цих дієслів і прийменників", m: ["enjoy", "finish", "avoid", "mind", "suggest", "look forward to"], e: "I enjoy cooking." },
      { h: "+ to + V", d: "після цих дієслів", m: ["want", "decide", "hope", "plan", "afford", "manage"], e: "I decided to stay." }
    ],
    f: [
      ["-ing", "{s I} {m enjoy} {a reading}"],
      ["to", "{s I} {m want} {a to read}"],
      ["prep", "{w interested in} {a learning}"]
    ],
    chk: [
      { s: "I avoid ___ in traffic.", o: ["driving", "to drive", "drive"], w: "avoid + -ing." },
      { s: "We hope ___ soon.", o: ["to arrive", "arriving", "arrive"], w: "hope + to." }
    ]
  },
  comp: {
    vs: [
      { h: "коротке слово", d: "-er / the -est", m: ["cheap → cheaper", "big → bigger", "easy → easier"], e: "the cheapest" },
      { h: "довге слово", d: "more / the most", m: ["more expensive", "the most interesting"], e: "the most beautiful" },
      { h: "винятки", d: "запам'ятати", m: ["good → better → best", "bad → worse → worst", "far → further"], e: "the best" }
    ],
    f: [
      [">", "{s A} {a is} {m bigger} {w than} B"],
      ["=", "{s A} {a is} {w as} {m big} {w as} B"],
      ["!", "{w too} {m cold} / {m old} {w enough}"]
    ],
    chk: [
      { s: "This is ___ day of the year.", o: ["the hottest", "the most hot", "hotter"], w: "hot → the hottest." },
      { s: "She isn't old ___ to drive.", o: ["enough", "too", "as"], w: "прикметник + enough." }
    ]
  },
  art: {
    vs: [
      { h: "a / an", d: "один із багатьох, перша згадка, професія", m: ["a car", "an hour", "she's a doctor"], e: "I saw a dog." },
      { h: "the", d: "відоме, єдине, вже згадане", m: ["the sun", "the cinema", "the best"], e: "The dog was big." },
      { h: "—", d: "загалом, їжа, go to work/bed", m: ["I love cats", "have lunch", "by bus"], e: "Life is short." }
    ],
    f: [
      ["a", "{w a} + приголосний звук: {m a uniform}"],
      ["an", "{w an} + голосний звук: {m an hour}"]
    ],
    chk: [
      { s: "I need ___ umbrella.", o: ["an", "a", "the"], w: "Голосний звук — an." },
      { s: "___ sun is very bright today.", o: ["The", "A", "— (без артикля)"], w: "Єдиний — the." }
    ]
  },
  quant: {
    vs: [
      { h: "злічувані", d: "можна порахувати", m: ["many", "a few", "few"], e: "many people" },
      { h: "незлічувані", d: "не рахуються", m: ["much", "a little", "little"], e: "much time" },
      { h: "обидва", d: "", m: ["some (+, прохання)", "any (− ?)", "a lot of"], e: "a lot of money" }
    ],
    f: [
      ["?", "{w How many} {m books}? / {w How much} {m water}?"],
      ["+", "{w a few} = кілька (ок) · {w few} = мало"]
    ],
    chk: [
      { s: "How ___ money do you need?", o: ["much", "many", "few"], w: "money — незлічуване." },
      { s: "There aren't ___ chairs.", o: ["any", "some", "much"], w: "Заперечення — any." }
    ]
  },
  qtags: {
    vs: [
      { h: "+ речення", d: "− хвостик", m: ["It's cold, isn't it?", "You went, didn't you?"], e: "She's nice, isn't she?" },
      { h: "− речення", d: "+ хвостик", m: ["You can't, can you?", "He doesn't, does he?"], e: "You don't smoke, do you?" }
    ],
    f: [
      ["tag", "{s It}{a 's} cold, {a isn't} {s it}?"],
      ["?", "{w Do you know} {w where} {s the station} {a is}?"]
    ],
    chk: [
      { s: "You like coffee, ___?", o: ["don't you", "do you", "aren't you"], w: "+ речення, Present Simple — don't you." },
      { s: "Do you know what time ___?", o: ["it is", "is it", "does it be"], w: "Прямий порядок." }
    ]
  },
  sosuch: {
    vs: [
      { h: "so", d: "+ прикметник / прислівник", m: ["so cold", "so fast"], e: "It was so cold." },
      { h: "such", d: "+ (a) прикметник + іменник", m: ["such a cold day", "such nice people"], e: "It was such a cold day." },
      { h: "мета", d: "щоб", m: ["to + V", "in order to", "so that + can"], e: "I came to help." }
    ],
    f: [
      ["so", "{w so} {m tired} {w that} …"],
      ["such", "{w such a} {m good} {s film} {w that} …"]
    ],
    chk: [
      { s: "It was ___ a nice day!", o: ["such", "so", "too"], w: "such a + прикм. + ім." },
      { s: "He's ___ funny!", o: ["so", "such", "such a"], w: "so + прикметник." }
    ]
  }
};
