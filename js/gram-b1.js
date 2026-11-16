export const LEVEL = "B1";

export const GROUPS = [
  { id: "now", t: "Теперішні часи", ids: ["pres", "pperf", "ppc"] },
  { id: "past", t: "Минулі часи", ids: ["past", "pastperf", "usedto"] },
  { id: "fut", t: "Майбутнє", ids: ["future", "futcont"] },
  { id: "modal", t: "Модальні дієслова", ids: ["modab", "modob", "deduc"] },
  { id: "cond", t: "Умовні речення і wish", ids: ["cond01", "cond2", "cond3"] },
  { id: "voice", t: "Пасив і непряма мова", ids: ["passive", "repst", "repq"] },
  { id: "build", t: "Будова речення", ids: ["rel", "gerinf", "qtags", "sosuch"] },
  { id: "words", t: "Порівняння, артиклі, кількість", ids: ["comp", "art", "quant"] }
];

export const TOPICS = [
  {
    id: "pres",
    t: "Present Simple vs Present Continuous",
    s: "Звички та факти проти дій «зараз»",
    rule: [
      "Present Simple: I/you/we/they + дієслово, he/she/it + дієслово з -s (works, goes, watches, studies). Питання і заперечення — через do/does: Do you work? She doesn't work. Після does дієслово вже без -s.",
      "Present Simple вживаємо для звичок і регулярних дій (I go to the gym twice a week), постійних ситуацій (She lives in Lviv), фактів і загальних правд (Water boils at 100°C), розкладів (The train leaves at 7.15). Маркери: always, usually, often, sometimes, rarely, never, every day, on Mondays.",
      "Present Continuous: am/is/are + -ing (I'm working, she's reading). Питання — переставляємо am/is/are: Are you working? Заперечення: I'm not working, he isn't working.",
      "Present Continuous вживаємо для дії, що відбувається саме зараз (Look, it's snowing!), для тимчасової ситуації в цей період (I'm working from home this week), для змін і тенденцій (Prices are rising), для домовленостей на майбутнє (I'm meeting Anna tomorrow). Маркери: now, right now, at the moment, today, this week, currently, Look!, Listen!",
      "Дієслова стану (know, like, love, hate, want, need, prefer, believe, understand, remember, mean, belong, own, seem, cost) зазвичай не вживаються в Continuous: I know him, I don't understand. Деякі мають два значення: I think it's good (думка) / I'm thinking about it (процес); She has a car (має) / She's having lunch (дія); The soup tastes great / The chef is tasting the soup.",
      "Порівняй: I live in Kyiv (постійно) — I'm living with my parents for now (тимчасово). He usually drives to work, but today he's taking the bus."
    ],
    ex: [
      ["She usually walks to work, but today she's taking a taxi.", "Зазвичай вона ходить на роботу пішки, але сьогодні їде на таксі."],
      ["Water boils at 100 degrees.", "Вода кипить при 100 градусах."],
      ["The museum opens at 10 on Sundays.", "У неділю музей відчиняється о 10."],
      ["I'm reading a great book at the moment.", "Зараз я читаю чудову книжку."],
      ["Look! It's raining again.", "Дивись! Знову дощ."],
      ["More and more people are working remotely.", "Дедалі більше людей працює віддалено."],
      ["Do you understand what I mean?", "Ти розумієш, що я маю на увазі?"],
      ["What are you thinking about?", "Про що ти думаєш?"],
      ["He doesn't eat meat.", "Він не їсть м'яса."]
    ],
    err: [
      ["I am knowing the answer.", "I know the answer."],
      ["She work in a bank.", "She works in a bank."],
      ["Look! It rains.", "Look! It's raining."],
      ["Does she works here?", "Does she work here?"],
      ["I'm usually getting up at 7.", "I usually get up at 7."],
      ["What do you do now? (саме зараз)", "What are you doing now?"]
    ],
    q: [
      { k: "p", s: "Listen! Somebody ___ at the door.", o: ["is knocking", "knocks", "knock"], w: "Listen! показує, що дія відбувається саме зараз — Present Continuous." },
      { k: "p", s: "I ___ coffee every morning.", o: ["drink", "am drinking", "drinks"], w: "every morning — звичка, тому Present Simple." },
      { k: "p", s: "This bag ___ to my sister.", o: ["belongs", "is belonging", "belong"], w: "belong — дієслово стану, у Continuous не вживається." },
      { k: "p", s: "We ___ in a hotel this week because our flat is being repaired.", o: ["are staying", "stay", "stays"], w: "Тимчасова ситуація (this week) — Present Continuous." },
      { k: "p", s: "What ___ this word ___?", o: ["does … mean", "is … meaning", "do … mean"], w: "mean — дієслово стану; питання в Present Simple з does для третьої особи." },
      { k: "p", s: "She ___ a shower right now, can she call you back?", o: ["is having", "has", "have"], w: "have у значенні дії (have a shower) може бути в Continuous; right now — зараз." },
      { k: "t", s: "My brother ___ (not / like) horror films.", a: ["doesn't like", "does not like"], w: "Заперечення в Present Simple для he/she/it: doesn't + дієслово без -s." },
      { k: "t", s: "Be quiet, please. The baby ___ (sleep).", a: ["is sleeping", "'s sleeping"], w: "Дія відбувається зараз — is sleeping." },
      { k: "t", s: "The train ___ (leave) at 7.15 every day.", a: ["leaves"], w: "Розклад — Present Simple, третя особа з -s." },
      { k: "t", s: "I ___ (think) about changing my job.", a: ["am thinking", "'m thinking"], w: "think about = обмірковувати (процес), тому Continuous." },
      { k: "t", s: "___ (you / need) any help?", a: ["do you need"], w: "need — дієслово стану, питання в Present Simple." },
      { k: "t", s: "Prices ___ (rise) very fast these days.", a: ["are rising", "'re rising"], w: "Зміна, що триває зараз (these days) — Present Continuous." }
    ]
  },
  {
    id: "past",
    t: "Past Simple vs Past Continuous",
    s: "Завершені дії та фон у минулому",
    rule: [
      "Past Simple: правильні дієслова + -ed (worked, played, stopped), неправильні мають власну другу форму (go – went, see – saw, buy – bought). Питання і заперечення — через did + базова форма: Did you call? I didn't call.",
      "Past Simple — завершена дія в минулому, часто з точним часом (I called her yesterday), послідовність подій (He got up, had a shower and left), завершений період (I lived in Odesa for two years). Маркери: yesterday, last week, ago, in 2020, when I was young, then, after that.",
      "Past Continuous: was/were + -ing (I was working, they were sleeping). Питання — Were you working? Заперечення — I wasn't working.",
      "Past Continuous — дія, що тривала в конкретний момент минулого (At 8 pm I was watching TV), фон історії (The sun was shining and the birds were singing), дві тривалі дії одночасно (While I was cooking, he was setting the table).",
      "Найчастіше вони працюють разом: довга дія (Past Continuous) і коротка подія, що її перервала (Past Simple). I was cooking when the phone rang. When — перед короткою подією, while — перед довгою дією: While I was walking home, I saw an old friend.",
      "Порівняй: When she arrived, we had dinner (спочатку прийшла, потім вечеряли) — When she arrived, we were having dinner (вечеря вже тривала). Дієслова стану (know, want, like) у Continuous не вживаються: I knew the answer."
    ],
    ex: [
      ["I was walking home when I saw an old friend.", "Я йшов додому, коли побачив старого друга."],
      ["We didn't go out because it was raining.", "Ми не виходили, бо йшов дощ."],
      ["What were you doing at ten last night?", "Що ти робив учора о десятій вечора?"],
      ["She bought a ticket, packed her bag and left.", "Вона купила квиток, спакувала сумку й поїхала."],
      ["While I was studying, my brother was playing games.", "Поки я вчилася, брат грав у ігри."],
      ["I lost my keys three days ago.", "Я загубила ключі три дні тому."],
      ["Did you enjoy the concert?", "Тобі сподобався концерт?"],
      ["The children were sleeping when we got home.", "Діти спали, коли ми прийшли додому."]
    ],
    err: [
      ["I was see him yesterday.", "I saw him yesterday."],
      ["Did you went there?", "Did you go there?"],
      ["When I arrived, they had dinner. (вечеря вже тривала)", "When I arrived, they were having dinner."],
      ["I was knowing the answer.", "I knew the answer."],
      ["While I cooked, the phone was ringing.", "While I was cooking, the phone rang."],
      ["She didn't went to work.", "She didn't go to work."]
    ],
    q: [
      { k: "p", s: "I ___ my keys while I was running for the bus.", o: ["lost", "was losing", "lose"], w: "Коротка завершена дія на фоні довшої — Past Simple." },
      { k: "p", s: "At 6 o'clock yesterday we ___ dinner.", o: ["were having", "had", "have"], w: "Дія тривала в конкретний момент минулого — Past Continuous." },
      { k: "p", s: "She ___ to Spain three times last year.", o: ["went", "was going", "has gone"], w: "Завершений період (last year) — Past Simple." },
      { k: "p", s: "While I ___ a shower, someone called.", o: ["was having", "had", "have had"], w: "while + тривала дія — Past Continuous." },
      { k: "p", s: "___ you see the match last night?", o: ["Did", "Were", "Have"], w: "Питання в Past Simple будується з did." },
      { k: "p", s: "The sun ___ and the birds were singing.", o: ["was shining", "shone", "shines"], w: "Опис фону, кілька дій одночасно — Past Continuous." },
      { k: "t", s: "We ___ (not / see) the film because we were late.", a: ["didn't see", "did not see"], w: "Заперечення в Past Simple: didn't + базова форма." },
      { k: "t", s: "When I woke up, it ___ (snow).", a: ["was snowing"], w: "Сніг уже йшов, коли я прокинувся — Past Continuous." },
      { k: "t", s: "He ___ (fall) off his bike and broke his arm.", a: ["fell"], w: "fall — неправильне дієслово: fall – fell – fallen." },
      { k: "t", s: "What ___ (you / do) when the lights went out?", a: ["were you doing"], w: "Дія, що тривала в момент іншої події, — Past Continuous." },
      { k: "t", s: "I ___ (buy) this jacket in Lviv two years ago.", a: ["bought"], w: "ago — завжди Past Simple; buy – bought – bought." },
      { k: "t", s: "They ___ (play) tennis when it started to rain.", a: ["were playing"], w: "Довша дія, яку перервав дощ, — Past Continuous." }
    ]
  },
  {
    id: "pperf",
    t: "Present Perfect vs Past Simple",
    s: "Досвід і результат проти «коли саме»",
    rule: [
      "Present Perfect = have/has + третя форма (worked, seen, been). Він зв'язує минуле з теперішнім: досвід за життя (I've been to Italy), результат, важливий зараз (I've lost my keys — їх і досі немає), свіжі новини (They've opened a new café), період, що ще триває (I've drunk three coffees today), і стан, що почався раніше й триває (I've known her for years).",
      "been чи gone: She's been to Paris — була й повернулася. She's gone to Paris — поїхала й досі там.",
      "Past Simple = друга форма: правильні дієслова з -ed (worked, lived), неправильні — окрема форма (went, saw, bought). Питання і заперечення — через did + базова форма: Did you see it? I didn't see it.",
      "Past Simple вживаємо, коли дія завершена і відомо або важливо, коли саме: I went to Italy in 2019. Також для історії, послідовності подій і періоду, який уже закінчився: I lived in Kharkiv for five years (тепер не живу). Питання з When…? і What time…? — завжди Past Simple.",
      "Маркери Present Perfect: ever, never, already, yet, just, so far, recently, today, this week. already і just стоять перед третьою формою, yet — у кінці заперечень і питань. Маркери Past Simple: yesterday, last week, ago, in 2020, when I was a child, then.",
      "У розмові часто починаємо з Present Perfect, а подробиці кажемо в Past Simple: I've been to Rome. — Really? When did you go? — I went there last spring."
    ],
    ex: [
      ["Have you ever been to London?", "Ти колись був у Лондоні?"],
      ["I've lived here since 2020.", "Я живу тут з 2020 року."],
      ["She's gone to the shop — she'll be back soon.", "Вона пішла в магазин — скоро повернеться."],
      ["I've just finished my homework.", "Я щойно закінчив домашнє завдання."],
      ["She hasn't replied yet.", "Вона ще не відповіла."],
      ["We met in 2018.", "Ми познайомилися у 2018 році."],
      ["I lived in Kharkiv for five years.", "Я п'ять років жила в Харкові (тепер ні)."],
      ["What time did you get up?", "О котрій ти встав?"],
      ["Have you ever tried sushi? — Yes, I tried it last summer.", "Ти колись куштував суші? — Так, я пробував минулого літа."]
    ],
    err: [
      ["I have seen him yesterday.", "I saw him yesterday."],
      ["When have you arrived?", "When did you arrive?"],
      ["Did you ever eat snails?", "Have you ever eaten snails?"],
      ["I already have done it.", "I have already done it."],
      ["I live here since 2020.", "I've lived here since 2020."],
      ["Shakespeare has written many plays.", "Shakespeare wrote many plays. (його вже немає)"]
    ],
    q: [
      { k: "p", s: "I ___ this film three times.", o: ["have seen", "saw", "see"], w: "Досвід без точного часу — Present Perfect." },
      { k: "p", s: "We ___ to Paris in 2018.", o: ["went", "have gone", "have been"], w: "in 2018 — конкретний час, тому Past Simple." },
      { k: "p", s: "Have you finished your report ___?", o: ["yet", "already", "ago"], w: "yet — у питаннях і запереченнях, у кінці речення." },
      { k: "p", s: "Oh no! I ___ my phone. I can't find it anywhere.", o: ["have lost", "lost", "was losing"], w: "Результат важливий зараз (телефону немає) — Present Perfect." },
      { k: "p", s: "When ___ you ___ your driving test?", o: ["did … pass", "have … passed", "do … pass"], w: "Питання з when стосується конкретного часу — Past Simple." },
      { k: "p", s: "She has ___ left — you missed her by a minute.", o: ["just", "yet", "ever"], w: "just = щойно, стоїть між has і третьою формою." },
      { k: "t", s: "I ___ (never / be) to Japan.", a: ["have never been", "'ve never been"], w: "Досвід: have never been." },
      { k: "t", s: "He ___ (buy) a new car last month.", a: ["bought"], w: "last month — Past Simple." },
      { k: "t", s: "They ___ (already / book) the tickets.", a: ["have already booked", "'ve already booked"], w: "already стоїть між have і третьою формою." },
      { k: "t", s: "___ (you / ever / meet) a famous person?", a: ["have you ever met"], w: "ever у питаннях про досвід — Present Perfect." },
      { k: "t", s: "I ___ (not / speak) to her since Monday.", a: ["haven't spoken", "have not spoken"], w: "since Monday — період до сьогодні, Present Perfect; speak – spoke – spoken." },
      { k: "t", s: "We ___ (move) here two years ago.", a: ["moved"], w: "ago — Past Simple." }
    ]
  },
  {
    id: "ppc",
    t: "Present Perfect Continuous: for and since",
    s: "Як довго триває дія",
    rule: [
      "Present Perfect Continuous: have/has been + -ing (I've been working, she's been studying). Питання: Have you been waiting long? Заперечення: I haven't been sleeping well.",
      "Вживаємо, коли дія почалася в минулому і триває досі, а важливо, як довго: I've been learning English for three years. Типове питання — How long have you been…?",
      "Також для дії, яка щойно скінчилася і має видимий наслідок: You look tired — have you been running? It's been raining (земля мокра).",
      "for + період (for two hours, for ages, for a long time), since + точка початку (since 2020, since Monday, since 9 o'clock, since I was a child). Після since може йти ціле речення в Past Simple: since we moved here.",
      "Simple чи Continuous? Present Perfect Simple — результат, кількість, завершене: I've written three emails. I've painted the room (готово). Continuous — процес і тривалість: I've been writing emails all morning. I've been painting the room (ще фарбую або щойно закінчив, руки в фарбі).",
      "Дієслова стану (know, be, have у значенні «мати», like, believe) — тільки Present Perfect Simple: I've known her for years, We've been married since 2015."
    ],
    ex: [
      ["How long have you been waiting?", "Скільки ти вже чекаєш?"],
      ["It's been raining since morning.", "Дощ іде з ранку."],
      ["I've been learning to drive for two months.", "Я вчуся водити вже два місяці."],
      ["She's been working here since she left school.", "Вона працює тут відтоді, як закінчила школу."],
      ["Why are you out of breath? — I've been running.", "Чому ти задихаєшся? — Я бігла."],
      ["I've read 50 pages. / I've been reading all afternoon.", "Я прочитала 50 сторінок. / Я читаю весь день."],
      ["I've known Max since school.", "Я знаю Макса ще зі школи."],
      ["They haven't been sleeping well lately.", "Останнім часом вони погано сплять."]
    ],
    err: [
      ["I am living here for five years.", "I have been living here for five years."],
      ["I've been knowing her for years.", "I've known her for years."],
      ["since three hours", "for three hours"],
      ["How long are you waiting?", "How long have you been waiting?"],
      ["I've been writing three letters today.", "I've written three letters today."],
      ["She works here since 2019.", "She has worked / has been working here since 2019."]
    ],
    q: [
      { k: "p", s: "I've been working here ___ 2021.", o: ["since", "for", "from"], w: "2021 — точка початку, тому since." },
      { k: "p", s: "She's been studying ___ six hours.", o: ["for", "since", "during"], w: "six hours — період, тому for." },
      { k: "p", s: "Your hands are dirty. What ___?", o: ["have you been doing", "did you do", "are you doing"], w: "Видно наслідок нещодавнього процесу — Present Perfect Continuous." },
      { k: "p", s: "I ___ him for ten years.", o: ["have known", "have been knowing", "know"], w: "know — дієслово стану, тільки Present Perfect Simple." },
      { k: "p", s: "I've ___ four chapters of the book so far.", o: ["read", "been reading", "reading"], w: "Кількість (four chapters) — Present Perfect Simple." },
      { k: "p", s: "How long ___ English?", o: ["have you been learning", "are you learning", "do you learn"], w: "How long + дія, що триває досі — Present Perfect Continuous." },
      { k: "t", s: "We ___ (wait) for the bus for 20 minutes.", a: ["have been waiting", "'ve been waiting"], w: "Тривалість до цього моменту — have been waiting." },
      { k: "t", s: "It ___ (rain) all day.", a: ["has been raining", "'s been raining"], w: "all day — процес, що триває, Present Perfect Continuous." },
      { k: "t", s: "I haven't seen him ___ last Christmas. (for / since)", a: ["since"], w: "last Christmas — точка в часі, since." },
      { k: "t", s: "They ___ (be) married for 25 years.", a: ["have been", "'ve been"], w: "be — дієслово стану, Present Perfect Simple: have been." },
      { k: "t", s: "She ___ (learn) to drive since May.", a: ["has been learning", "'s been learning"], w: "Процес, що почався в травні і триває досі." },
      { k: "t", s: "I've lived in this city ___ ten years. (for / since)", a: ["for"], w: "ten years — період, for." }
    ]
  },
  {
    id: "pastperf",
    t: "Past Perfect",
    s: "Що сталося раніше в минулому",
    rule: [
      "Past Perfect = had + третя форма для всіх осіб (I had left, she had seen). Заперечення: hadn't. Питання: Had you met before? Скорочення: I'd, she'd.",
      "Він показує, що одна дія в минулому відбулася раніше за іншу: When I arrived, the film had already started (фільм почався до мого приходу). Порівняй: When I arrived, the film started (почався, щойно я прийшов).",
      "Типові слова: before, after, by the time, already, just, never … before, until: By the time we got there, everyone had left. I had never seen snow before that winter.",
      "Часто після дієслів, які переказують думки чи слова: I realised I had left my phone at home. He told me he had lost his job. She remembered that she hadn't locked the door.",
      "Past Perfect Continuous = had been + -ing: тривала дія до моменту в минулому. She was tired because she had been working all day. They had been waiting for an hour when the bus finally came.",
      "Якщо порядок подій і так зрозумілий з after або before, можна вжити Past Simple: After I finished work, I went home. Не варто ставити Past Perfect, коли події просто йдуть одна за одною: I got up, had breakfast and left."
    ],
    ex: [
      ["I had never flown before that trip.", "До тієї поїздки я ніколи не літав."],
      ["He realised he had left his wallet at home.", "Він зрозумів, що залишив гаманець удома."],
      ["By the time the police arrived, the thieves had escaped.", "Поки приїхала поліція, злодії вже втекли."],
      ["She was nervous because she hadn't done this before.", "Вона нервувала, бо раніше цього не робила."],
      ["They had been waiting for an hour when the bus came.", "Вони чекали вже годину, коли приїхав автобус."],
      ["Had you met him before the party?", "Ти був знайомий з ним до вечірки?"],
      ["It was the best meal I had ever eaten.", "Це була найкраща їжа, яку я будь-коли їв."]
    ],
    err: [
      ["When I came, they already left.", "When I came, they had already left."],
      ["I had went there before.", "I had gone there before."],
      ["She said she has lost her phone.", "She said she had lost her phone."],
      ["I had got up, had had breakfast and had left. (просто послідовність)", "I got up, had breakfast and left."],
      ["He was tired because he worked all day.", "He was tired because he had been working all day."]
    ],
    q: [
      { k: "p", s: "When we arrived at the station, the train ___.", o: ["had already left", "already left", "has already left"], w: "Поїзд поїхав раніше, ніж ми прибули — Past Perfect." },
      { k: "p", s: "She was nervous because she ___ on a plane before.", o: ["had never been", "has never been", "never was"], w: "Досвід до моменту в минулому — Past Perfect." },
      { k: "p", s: "By the time I got home, my parents ___ to bed.", o: ["had gone", "went", "have gone"], w: "by the time + дія, що вже завершилася раніше — Past Perfect." },
      { k: "p", s: "His eyes were red. He ___.", o: ["had been crying", "has been crying", "cried"], w: "Тривала дія до моменту в минулому, видно наслідок — Past Perfect Continuous." },
      { k: "p", s: "I couldn't get in because I ___ my keys.", o: ["had lost", "have lost", "was losing"], w: "Ключі загубилися раніше, ніж я не зміг увійти." },
      { k: "p", s: "After she ___ the letter, she posted it.", o: ["had written", "has written", "writes"], w: "Спочатку написала, потім надіслала — Past Perfect (можна й Past Simple, але не Present Perfect)." },
      { k: "t", s: "I recognised him because I ___ (see) his photo before.", a: ["had seen", "'d seen"], w: "Бачив раніше за момент упізнавання — had seen." },
      { k: "t", s: "The shop ___ (close) when we got there.", a: ["had closed", "'d closed"], w: "Магазин закрився раніше — Past Perfect." },
      { k: "t", s: "She ___ (not / finish) her work when the boss came in.", a: ["hadn't finished", "had not finished"], w: "Заперечення: hadn't + третя форма." },
      { k: "t", s: "We ___ (walk) for hours before we found a café.", a: ["had been walking", "'d been walking"], w: "Тривалий процес до моменту в минулому — had been walking." },
      { k: "t", s: "He told me he ___ (lose) his job.", a: ["had lost", "'d lost"], w: "Втрата роботи сталася раніше, ніж розповідь." },
      { k: "t", s: "It was the best meal I ___ (ever / eat).", a: ["had ever eaten", "'d ever eaten"], w: "Найкраще за весь досвід до того моменту — Past Perfect." }
    ]
  },
  {
    id: "usedto",
    t: "used to, would, be/get used to",
    s: "Колишні звички та звикання",
    rule: [
      "used to + дієслово — те, що було регулярно або постійно в минулому, а тепер ні: I used to smoke (тепер не палю). There used to be a cinema here (тепер немає).",
      "Питання і заперечення — через did, і тоді use без -d: Did you use to play football? I didn't use to like coffee. Теперішньої форми немає: про звички зараз кажемо Present Simple з usually.",
      "would + дієслово — теж повторювані дії в минулому, часто в спогадах: When I was a child, we would spend every summer at my grandma's. Але лише для дій. Для станів (be, have, live, like, know) — тільки used to: I used to have long hair (не «would have»).",
      "be used to + іменник або -ing = бути звиклим, для тебе це нормально: I'm used to getting up early. She isn't used to the cold.",
      "get used to + іменник або -ing = звикати, процес: You'll soon get used to the noise. It took me a month to get used to driving on the left. Може бути в будь-якому часі: I've got used to it, I'm getting used to it.",
      "Головна пастка: після be/get used to стоїть прийменник to, тож далі іменник або -ing, а не базова форма: I'm used to work (робота), I'm used to working (працювати) — але не «I'm used to work hard»."
    ],
    ex: [
      ["I used to live in Kharkiv.", "Раніше я жила в Харкові."],
      ["Did you use to have a pet?", "У тебе раніше була тварина?"],
      ["We didn't use to have a car.", "Раніше в нас не було машини."],
      ["My grandpa would tell us stories every evening.", "Дідусь щовечора розповідав нам історії."],
      ["She isn't used to driving on the left.", "Вона не звикла їздити лівою смугою."],
      ["I'm used to working late.", "Я звикла працювати допізна."],
      ["It took me a month to get used to my new job.", "Мені знадобився місяць, щоб звикнути до нової роботи."],
      ["You'll get used to it.", "Ти звикнеш."]
    ],
    err: [
      ["I am used to get up early.", "I am used to getting up early."],
      ["Did you used to play?", "Did you use to play?"],
      ["I use to go there when I was young.", "I used to go there when I was young."],
      ["When I was a child, I would have a dog.", "When I was a child, I used to have a dog."],
      ["I used to get up at 7 every day now.", "I usually get up at 7 now."],
      ["I can't get used to live here.", "I can't get used to living here."]
    ],
    q: [
      { k: "p", s: "I ___ have long hair, but now it's short.", o: ["used to", "am used to", "would"], w: "Стан у минулому (have long hair) — used to; would зі станами не вживається." },
      { k: "p", s: "Don't worry, you'll soon get used to ___ here.", o: ["living", "live", "lived"], w: "get used to + -ing." },
      { k: "p", s: "Did you ___ play the piano?", o: ["use to", "used to", "using to"], w: "Після did — use to без -d." },
      { k: "p", s: "Every summer my dad ___ take us fishing.", o: ["would", "was used to", "is used to"], w: "Повторювана дія в минулому — would (або used to)." },
      { k: "p", s: "He's a nurse, so he's used to ___ at night.", o: ["working", "work", "worked"], w: "be used to + -ing = звиклий робити." },
      { k: "p", s: "We ___ live in a small village.", o: ["used to", "would", "are used to"], w: "live — стан, тому тільки used to." },
      { k: "t", s: "I ___ (not / use to) like coffee, but now I love it.", a: ["didn't use to", "did not use to"], w: "Заперечення: didn't use to (без -d)." },
      { k: "t", s: "She isn't used to ___ (wear) a uniform.", a: ["wearing"], w: "be used to + -ing." },
      { k: "t", s: "There ___ (use to) be a cinema here.", a: ["used to"], w: "Колишній стан: there used to be." },
      { k: "t", s: "It's hard to get used to ___ (sleep) in a new bed.", a: ["sleeping"], w: "get used to + -ing." },
      { k: "t", s: "I can't get used to ___ (drive) on the left.", a: ["driving"], w: "get used to + -ing." },
      { k: "t", s: "When I was little, my grandma ___ (would / tell) me stories every night.", a: ["would tell"], w: "Повторювана дія в минулому — would tell." }
    ]
  },
  {
    id: "future",
    t: "Future: will, going to, Present Continuous",
    s: "Рішення, плани і домовленості",
    rule: [
      "will + дієслово (I'll, won't) — рішення, прийняте в момент мовлення (It's cold. — I'll close the window), обіцянки (I'll call you), пропозиції й прохання (I'll help you. Will you open the door?), прогнози-думки (I think it will be fine). Часто з I think, probably, I'm sure, maybe.",
      "be going to + дієслово — план або намір, вирішений заздалегідь: I'm going to visit my parents next weekend. Також прогноз, коли бачимо ознаки зараз: Look at those clouds — it's going to rain.",
      "Present Continuous — домовленість із конкретним часом, часто з іншими людьми або вже заброньована: I'm meeting Anna at 6. We're flying to Rome on Saturday.",
      "Present Simple — розклади й програми: The train leaves at 7.30. The film starts at 8.",
      "Після when, as soon as, before, after, until, if у майбутньому — Present Simple, не will: I'll call you when I arrive.",
      "Порівняй: I'll buy some milk (вирішила щойно) — I'm going to buy a car (давно планую) — I'm buying a car tomorrow (уже домовилася з продавцем)."
    ],
    ex: [
      ["I'm seeing the dentist on Friday.", "У п'ятницю я йду до стоматолога."],
      ["We're going to paint the kitchen this summer.", "Цього літа ми збираємося пофарбувати кухню."],
      ["It's cold. — I'll close the window.", "Холодно. — Я зачиню вікно."],
      ["I think it will be sunny tomorrow.", "Думаю, завтра буде сонячно."],
      ["Look out! You're going to fall!", "Обережно! Ти зараз впадеш!"],
      ["The concert starts at 8 pm.", "Концерт починається о 20:00."],
      ["I promise I won't tell anyone.", "Обіцяю, я нікому не скажу."],
      ["What are you doing tonight?", "Що ти робиш сьогодні ввечері?"]
    ],
    err: [
      ["I will meet my friend tonight, we booked a table.", "I'm meeting my friend tonight."],
      ["Look out! You will fall!", "Look out! You're going to fall!"],
      ["I go to call you later.", "I'll call you later."],
      ["I'll tell you when I will know.", "I'll tell you when I know."],
      ["Are you going to help me? — Yes, I help you.", "Yes, I'll help you."]
    ],
    q: [
      { k: "p", s: "The phone's ringing. — OK, I ___ it.", o: ["'ll answer", "'m going to answer", "answer"], w: "Рішення в момент мовлення — will." },
      { k: "p", s: "We ___ a new car next month. We've already chosen the model.", o: ["are going to buy", "will buy", "buy"], w: "План, вирішений заздалегідь — going to." },
      { k: "p", s: "Look at that man! He ___ fall off the ladder.", o: ["is going to", "will", "is"], w: "Прогноз на основі того, що бачимо — going to." },
      { k: "p", s: "I ___ my boss at 10 tomorrow. It's in my diary.", o: ["am meeting", "will meet", "meet"], w: "Домовленість із часом — Present Continuous." },
      { k: "p", s: "The train ___ at 5.30 tomorrow morning.", o: ["leaves", "is leaving", "will be leave"], w: "Розклад — Present Simple." },
      { k: "p", s: "I think Ukraine ___ the match.", o: ["will win", "is winning", "wins"], w: "Прогноз-думка з I think — will." },
      { k: "t", s: "Don't worry, I ___ (not / tell) anyone.", a: ["won't tell", "will not tell"], w: "Обіцянка — will; заперечення won't." },
      { k: "t", s: "What ___ (you / do) this weekend? — We're visiting my aunt.", a: ["are you doing"], w: "Питання про домовленості — Present Continuous." },
      { k: "t", s: "She ___ (have) a baby in March. (going to)", a: ["is going to have", "'s going to have"], w: "Майбутня подія, ознаки якої видно вже зараз — going to." },
      { k: "t", s: "That bag looks heavy. I ___ (carry) it for you.", a: ["will carry", "'ll carry"], w: "Пропозиція допомоги — will." },
      { k: "t", s: "We ___ (fly) to Rome on Saturday — the tickets are booked.", a: ["are flying", "'re flying"], w: "Домовленість — Present Continuous." },
      { k: "t", s: "I'm sure you ___ (enjoy) the party.", a: ["will enjoy", "'ll enjoy"], w: "Прогноз з I'm sure — will." }
    ]
  },
  {
    id: "futcont",
    t: "Future Continuous and Future Perfect",
    s: "Що відбуватиметься і що вже буде зроблено",
    rule: [
      "Future Continuous = will be + -ing: дія, яка триватиме в певний момент у майбутньому. This time tomorrow I'll be lying on the beach. At 9 am I'll be having a meeting.",
      "Він також звучить м'якше й ввічливіше, коли питаємо про чужі плани: Will you be using the car tonight? Will you be coming to the party? І для подій, які відбудуться «самі собою», за звичним розкладом: I'll be seeing her at work tomorrow anyway.",
      "Future Perfect = will have + третя форма: дія завершиться до певного моменту в майбутньому. By 2030 I will have finished university. By the time you arrive, we'll have eaten.",
      "Типові слова для Future Perfect: by (by Friday, by then, by the end of the year), by the time + Present Simple, before. Заперечення: won't have finished.",
      "Порівняй: At 8 pm I'll be cooking (процес о 8-й) — By 8 pm I'll have cooked dinner (о 8-й вечеря вже готова).",
      "Після by the time, when, before у підрядній частині — Present Simple: By the time you get home (не «will get»), I'll have finished."
    ],
    ex: [
      ["Don't call at 8 — I'll be having dinner.", "Не дзвони о восьмій — я вечерятиму."],
      ["This time next week we'll be flying to Spain.", "Наступного тижня в цей час ми летітимемо до Іспанії."],
      ["Will you be working on Saturday?", "Ти працюватимеш у суботу?"],
      ["By Friday we'll have moved into the new flat.", "До п'ятниці ми вже переїдемо в нову квартиру."],
      ["By the end of the year, I'll have read 20 books.", "До кінця року я прочитаю 20 книжок."],
      ["The film will have started by the time we get there.", "Поки ми доберемося, фільм уже почнеться."],
      ["She won't have finished the report by Monday.", "До понеділка вона ще не закінчить звіт."]
    ],
    err: [
      ["By next year I will finish the course.", "By next year I will have finished the course."],
      ["At 9 tomorrow I will work.", "At 9 tomorrow I will be working."],
      ["By the time you will arrive, I'll have left.", "By the time you arrive, I'll have left."],
      ["I will have be working.", "I will be working."],
      ["This time tomorrow I'll lie on the beach.", "This time tomorrow I'll be lying on the beach."]
    ],
    q: [
      { k: "p", s: "This time next week I ___ in the mountains.", o: ["'ll be hiking", "'ll have hiked", "hike"], w: "Дія триватиме в момент у майбутньому — Future Continuous." },
      { k: "p", s: "By the end of the year, I ___ 20 books.", o: ["will have read", "will be reading", "read"], w: "by + завершення до моменту — Future Perfect." },
      { k: "p", s: "___ you be using your laptop this evening? Can I borrow it?", o: ["Will", "Are", "Do"], w: "Ввічливе питання про плани — Will you be + -ing." },
      { k: "p", s: "Don't come at 3. We ___ a meeting then.", o: ["'ll be having", "'ll have had", "have"], w: "Зустріч триватиме о третій — Future Continuous." },
      { k: "p", s: "By the time you arrive, I ___ dinner.", o: ["will have cooked", "will be cooked", "cook"], w: "Вечеря буде готова до твого приходу — Future Perfect." },
      { k: "p", s: "In ten years' time, they ___ married for 30 years.", o: ["will have been", "will be being", "are"], w: "Підсумок до моменту в майбутньому — Future Perfect." },
      { k: "t", s: "At midnight I ___ (sleep). (will be …)", a: ["will be sleeping", "'ll be sleeping"], w: "Процес у момент майбутнього — will be sleeping." },
      { k: "t", s: "By June she ___ (finish) her exams.", a: ["will have finished", "'ll have finished"], w: "by June — Future Perfect." },
      { k: "t", s: "Will you ___ (go) past the post office? Could you post this letter? (be + -ing)", a: ["be going"], w: "Ввічливе питання: Will you be going…?" },
      { k: "t", s: "The film ___ (start) by the time we get there. (will have …)", a: ["will have started", "'ll have started"], w: "Фільм почнеться до нашого приходу — Future Perfect." },
      { k: "t", s: "Tomorrow at 10 I ___ (fly) to London.", a: ["will be flying", "'ll be flying"], w: "Дія триватиме в момент майбутнього." },
      { k: "t", s: "I ___ (not / finish) the report by Monday, sorry.", a: ["won't have finished", "will not have finished"], w: "Заперечення Future Perfect: won't have + третя форма." }
    ]
  },
  {
    id: "modab",
    t: "Ability and possibility: can, could, be able to, may, might",
    s: "Вмію, зміг, можливо",
    rule: [
      "can — здатність і можливість у теперішньому (I can swim, You can park here), дозвіл і прохання (Can I sit here? Can you help me?). Після can — дієслово без to, і can не змінюється: she can, not «she cans».",
      "could — загальна здатність у минулому (I could read when I was four), а також ввічливе прохання (Could you open the window?) і можливість (It could be true).",
      "be able to — замінює can там, де can не має форми: майбутнє (I'll be able to help you tomorrow), Present Perfect (I've never been able to dance), після інших модальних і to (I'd like to be able to cook).",
      "Для одного конкретного успіху в минулому — was/were able to або managed to, а не could: The fire was big, but everyone was able to escape. I managed to find a parking space. У запереченні couldn't підходить завжди: I couldn't find it.",
      "may / might / could + дієслово — можливо, але не точно: It might rain later. She may be at home. That could be the answer. might трохи менш певне, ніж may. Заперечення: might not / may not (не «can't» — це вже «точно ні»).",
      "Про можливість у минулому: might / may / could have + третя форма: She might have missed the bus."
    ],
    ex: [
      ["I can speak three languages.", "Я розмовляю трьома мовами."],
      ["I couldn't sleep last night.", "Я не міг заснути минулої ночі."],
      ["Will you be able to come on Sunday?", "Ти зможеш прийти в неділю?"],
      ["I've never been able to whistle.", "Я ніколи не вміла свистіти."],
      ["After three hours, we managed to fix the car.", "Через три години ми таки полагодили машину."],
      ["Take an umbrella — it might rain.", "Візьми парасольку — може піти дощ."],
      ["She may not know about it.", "Вона може про це не знати."],
      ["Could you tell me the time, please?", "Не підкажете, котра година?"]
    ],
    err: [
      ["I will can help you.", "I will be able to help you."],
      ["She cans speak French.", "She can speak French."],
      ["I might to come.", "I might come."],
      ["The test was hard, but I could pass it.", "The test was hard, but I was able to / managed to pass it."],
      ["I'd like to can drive.", "I'd like to be able to drive."]
    ],
    q: [
      { k: "p", s: "I'm sorry, I ___ come to your party next week.", o: ["won't be able to", "can't to", "couldn't"], w: "Майбутнє — won't be able to." },
      { k: "p", s: "The exam was hard, but I ___ pass it.", o: ["was able to", "could", "can"], w: "Один конкретний успіх у минулому — was able to / managed to." },
      { k: "p", s: "When I was young, I ___ run very fast.", o: ["could", "can", "might"], w: "Загальна здатність у минулому — could." },
      { k: "p", s: "Take your coat. It ___ get cold later.", o: ["might", "can't", "must"], w: "Можливість у майбутньому — might." },
      { k: "p", s: "I haven't ___ to contact him yet.", o: ["been able", "could", "can"], w: "Present Perfect — been able to." },
      { k: "p", s: "___ I use your phone, please?", o: ["Could", "Might", "Am able to"], w: "Ввічливе прохання дозволу — Could I…?" },
      { k: "t", s: "I'd love to ___ (able) to play the guitar. (be + …)", a: ["be able"], w: "Після would love to — be able to." },
      { k: "t", s: "She ___ (not / can) find her keys yesterday.", a: ["couldn't", "could not"], w: "Минуле від can — could; заперечення couldn't." },
      { k: "t", s: "We ___ (might / go) to the beach tomorrow, it depends on the weather.", a: ["might go"], w: "might + базова форма без to." },
      { k: "t", s: "Nobody ___ (manage) to solve the problem. (minule)", a: ["managed"], w: "manage to = зуміти; Past Simple — managed." },
      { k: "t", s: "He may ___ (be) at work now.", a: ["be"], w: "may + базова форма." },
      { k: "t", s: "One day robots ___ (be able to) do all the housework. (will …)", a: ["will be able to", "'ll be able to"], w: "Майбутнє від can — will be able to." }
    ]
  },
  {
    id: "modob",
    t: "must, have to, should, mustn't, don't have to",
    s: "Обов'язок, заборона, порада",
    rule: [
      "must — обов'язок, який відчуває той, хто говорить, або письмові правила: I must call my mum. Passengers must wear seat belts. Після must — дієслово без to, і must не змінюється: she must.",
      "have to — обов'язок ззовні: закон, робота, розклад, обставини. I have to wear a uniform. She has to get up at 6. У минулому й майбутньому — тільки have to: I had to wait. You'll have to pay.",
      "mustn't = заборонено: You mustn't smoke here. don't have to = не обов'язково, можна, якщо хочеш: You don't have to come. Ці два «не» означають зовсім різне!",
      "should / shouldn't — порада або думка, що правильно: You should see a doctor. You shouldn't work so much. ought to = should, трохи формальніше: You ought to apologise.",
      "need to — потрібно; don't need to / needn't = не потрібно: I need to buy milk. You needn't worry.",
      "Питання: Do I have to…? (Чи мушу?), Should I…? (Чи варто?). У минулому: Did you have to…?"
    ],
    ex: [
      ["We had to leave early because of the storm.", "Нам довелося піти раніше через бурю."],
      ["You don't have to bring anything — we have everything.", "Не треба нічого приносити — у нас усе є."],
      ["You mustn't touch that — it's hot!", "Не можна це чіпати — гаряче!"],
      ["I must remember to call her.", "Мені треба не забути їй подзвонити."],
      ["She has to work on Saturdays.", "Вона мусить працювати по суботах."],
      ["You should try this cake.", "Тобі варто скуштувати цей торт."],
      ["Do we have to book in advance?", "Нам треба бронювати заздалегідь?"],
      ["You'll have to show your passport.", "Вам доведеться показати паспорт."]
    ],
    err: [
      ["I must to go.", "I must go."],
      ["Yesterday I must work late.", "Yesterday I had to work late."],
      ["You mustn't pay — it's free.", "You don't have to pay — it's free."],
      ["She have to work.", "She has to work."],
      ["Do I must come?", "Do I have to come?"],
      ["You should to rest.", "You should rest."]
    ],
    q: [
      { k: "p", s: "It's a free museum, so you ___ pay.", o: ["don't have to", "mustn't", "shouldn't"], w: "Не обов'язково — don't have to." },
      { k: "p", s: "You ___ use your phone during the exam. It's forbidden.", o: ["mustn't", "don't have to", "needn't"], w: "Заборона — mustn't." },
      { k: "p", s: "Last year I ___ work every Saturday.", o: ["had to", "must", "have to"], w: "Минуле — had to." },
      { k: "p", s: "You look tired. You ___ go to bed earlier.", o: ["should", "must not", "have"], w: "Порада — should." },
      { k: "p", s: "___ we wear a suit to the interview?", o: ["Do … have to", "Must … to", "Have … to"], w: "Питання з have to будується з do." },
      { k: "p", s: "She'll ___ take the bus because her car is broken.", o: ["have to", "must", "has to"], w: "Майбутнє — will have to." },
      { k: "t", s: "I ___ (have to) get up at 6 tomorrow. (will …)", a: ["will have to", "'ll have to"], w: "Майбутнє обов'язку — will have to." },
      { k: "t", s: "You ___ (not / should) eat so much sugar.", a: ["shouldn't", "should not"], w: "Порада не робити — shouldn't." },
      { k: "t", s: "He ___ (have to) wear glasses for reading. (теперішній, he)", a: ["has to"], w: "he/she/it — has to." },
      { k: "t", s: "We ___ (not / have to) hurry — we've got plenty of time.", a: ["don't have to", "do not have to"], w: "Не обов'язково — don't have to." },
      { k: "t", s: "Did you ___ (have) to show your passport?", a: ["have"], w: "Після did — базова форма have to." },
      { k: "t", s: "Children ___ (not / must) play with matches.", a: ["mustn't", "must not"], w: "Заборона — mustn't." }
    ]
  },
  {
    id: "deduc",
    t: "Deduction: must, might, can't",
    s: "Наскільки я впевнений",
    rule: [
      "Коли не знаємо напевно, а робимо висновок, вживаємо модальні дієслова. Вони показують, наскільки ми впевнені.",
      "must + дієслово — я майже впевнений, що так (логічний висновок): She's been working all day. She must be tired. That must be the postman.",
      "might / may / could — можливо так, я не впевнений: He might be in the kitchen. It could be true.",
      "can't — я впевнений, що ні: That can't be Tom — he's in Canada. Протилежність must у цьому значенні — саме can't, а не mustn't (mustn't = заборонено).",
      "Про минуле: must / might / could / can't + have + третя форма. You must have left your keys at home. She might have missed the bus. He can't have seen us — he didn't say hello.",
      "Про те, що відбувається саме зараз: must / might + be + -ing: She's not answering — she must be driving."
    ],
    ex: [
      ["The lights are off. They must be out.", "Світло вимкнене. Вони, мабуть, пішли."],
      ["You must be Anna's sister — you look just like her.", "Ти, мабуть, сестра Анни — ви дуже схожі."],
      ["She might be stuck in traffic.", "Можливо, вона застрягла в заторі."],
      ["That can't be right — check it again.", "Не може бути, щоб це було правильно — перевір ще раз."],
      ["I can't find my phone. I might have left it in the taxi.", "Не можу знайти телефон. Може, я залишила його в таксі."],
      ["The ground is wet. It must have rained.", "Земля мокра. Мабуть, ішов дощ."],
      ["He can't have finished already — he only started ten minutes ago.", "Не може бути, що він уже закінчив — він почав лише десять хвилин тому."],
      ["He isn't answering. He must be sleeping.", "Він не відповідає. Мабуть, спить."]
    ],
    err: [
      ["He mustn't be at home — the car isn't here.", "He can't be at home — the car isn't here."],
      ["She must forgot.", "She must have forgotten."],
      ["It can be true, but I'm not sure.", "It might / could be true, but I'm not sure."],
      ["They must had left.", "They must have left."],
      ["He can't seen us.", "He can't have seen us."]
    ],
    q: [
      { k: "p", s: "You've been travelling all night. You ___ be exhausted.", o: ["must", "can't", "mustn't"], w: "Логічний висновок «напевно так» — must." },
      { k: "p", s: "That ___ be his sister — she's much older than him. That's his mum.", o: ["can't", "mustn't", "must"], w: "Впевнений, що ні — can't." },
      { k: "p", s: "Where's Olena? — I'm not sure. She ___ be at the gym.", o: ["might", "must", "can't"], w: "Невпевнене припущення — might." },
      { k: "p", s: "The ground is wet. It ___ rained last night.", o: ["must have", "can't have", "must"], w: "Висновок про минуле — must have + третя форма." },
      { k: "p", s: "He ___ heard the news — he'd have called me.", o: ["can't have", "must have", "mustn't have"], w: "Впевнений, що ні, про минуле — can't have." },
      { k: "p", s: "I'm not sure where I parked. I ___ have left the car near the bank.", o: ["might", "must", "can't"], w: "Можливо — might have." },
      { k: "t", s: "She's not answering. She ___ (must / be) busy.", a: ["must be"], w: "must + be." },
      { k: "t", s: "You ___ (can't / be) serious! That's crazy!", a: ["can't be", "cannot be"], w: "Впевненість, що ні — can't be." },
      { k: "t", s: "They ___ (must / forget) about the meeting. Nobody came. (про минуле)", a: ["must have forgotten", "must've forgotten"], w: "must have + forgotten." },
      { k: "t", s: "I ___ (might / leave) my umbrella at the café. (про минуле)", a: ["might have left", "might've left"], w: "might have + left." },
      { k: "t", s: "That ___ (can't / be) the right answer — it's too easy.", a: ["can't be", "cannot be"], w: "can't be." },
      { k: "t", s: "She ___ (can't / see) us — she didn't say hello. (про минуле)", a: ["can't have seen", "cannot have seen", "couldn't have seen"], w: "can't have + seen." }
    ]
  },
  {
    id: "cond01",
    t: "Zero and First Conditional",
    s: "Реальні умови: завжди і в майбутньому",
    rule: [
      "Zero Conditional — загальні правди й закони природи, коли результат завжди однаковий: If + Present Simple, Present Simple. If you heat ice, it melts. If I drink coffee late, I can't sleep. if тут можна замінити на when.",
      "First Conditional — реальна умова, яка може справдитися в майбутньому: If + Present Simple, will + дієслово. If it rains, we'll stay at home. If you study, you'll pass.",
      "Головне правило: після if майбутнього часу не ставимо, навіть коли мова про майбутнє: If you come (не «will come»), we'll go together.",
      "Так само після when, as soon as, before, after, until, unless, in case: I'll call you when I arrive. We'll start as soon as everyone is here. I'll wait until you come back.",
      "unless = if not: You won't pass unless you study (= if you don't study). Не додавай ще одне not: Unless you hurry (не «unless you don't hurry»).",
      "У головній частині замість will може бути can, may, might, should або наказ: If you're tired, you can go home. If you see Max, tell him to call me. Частини можна поміняти місцями; кома потрібна, лише коли if стоїть першим."
    ],
    ex: [
      ["If you press this button, the machine stops.", "Якщо натиснути цю кнопку, машина зупиняється."],
      ["If I see Anna, I'll tell her.", "Якщо я побачу Анну, я їй скажу."],
      ["We'll start as soon as everyone arrives.", "Ми почнемо, щойно всі прийдуть."],
      ["You won't get a table unless you book.", "Ти не отримаєш столик, якщо не забронюєш."],
      ["If you're hungry, there's some soup in the fridge.", "Якщо голодна, в холодильнику є суп."],
      ["What will you do if they don't call?", "Що ти робитимеш, якщо вони не подзвонять?"],
      ["I'll wait here until you come back.", "Я чекатиму тут, поки ти не повернешся."],
      ["If it's sunny tomorrow, we might go to the lake.", "Якщо завтра буде сонячно, ми, можливо, поїдемо на озеро."]
    ],
    err: [
      ["If it will rain, I'll take a taxi.", "If it rains, I'll take a taxi."],
      ["I'll call you when I will get home.", "I'll call you when I get home."],
      ["Unless you don't hurry, you'll be late.", "Unless you hurry, you'll be late."],
      ["If you will need help, call me.", "If you need help, call me."],
      ["If I see him, I tell him.", "If I see him, I'll tell him."]
    ],
    q: [
      { k: "p", s: "If you ___ water to 100°C, it boils.", o: ["heat", "will heat", "heated"], w: "Загальна правда — Zero Conditional, Present Simple." },
      { k: "p", s: "If I ___ time tomorrow, I'll visit you.", o: ["have", "will have", "had"], w: "Після if — Present Simple, навіть про майбутнє." },
      { k: "p", s: "I'll wait here until you ___ back.", o: ["come", "will come", "came"], w: "Після until — Present Simple." },
      { k: "p", s: "You won't get a seat ___ you book in advance.", o: ["unless", "if", "when"], w: "unless = if not." },
      { k: "p", s: "If she misses the bus, she ___ late.", o: ["'ll be", "is being", "would be"], w: "Головна частина First Conditional — will." },
      { k: "p", s: "Call me as soon as you ___ the results.", o: ["get", "will get", "got"], w: "Після as soon as — Present Simple." },
      { k: "t", s: "If you ___ (not / hurry), you'll miss the train.", a: ["don't hurry", "do not hurry"], w: "Після if — Present Simple: don't hurry." },
      { k: "t", s: "If it's sunny tomorrow, we ___ (go) to the lake.", a: ["will go", "'ll go"], w: "Головна частина — will go." },
      { k: "t", s: "Plants die if they ___ (not / get) enough water.", a: ["don't get", "do not get"], w: "Zero Conditional — Present Simple в обох частинах." },
      { k: "t", s: "I'll send you a message when I ___ (arrive).", a: ["arrive"], w: "Після when — Present Simple." },
      { k: "t", s: "___ you study, you won't pass. (= If you don't study)", a: ["unless"], w: "unless = if not." },
      { k: "t", s: "What ___ (you / do) if they don't call?", a: ["will you do"], w: "Питання в головній частині First Conditional — will you do." }
    ]
  },
  {
    id: "cond2",
    t: "Second Conditional and wish",
    s: "Уявні ситуації зараз",
    rule: [
      "Second Conditional — уявна, нереальна або малоймовірна ситуація в теперішньому чи майбутньому: If + Past Simple, would + дієслово. If I had more money, I would travel more (але грошей немає). If I won the lottery, I'd buy a house (навряд чи виграю).",
      "Past Simple тут не про минуле — він лише показує «уявно». Після if з I/he/she/it часто вживають were: If I were rich… If she were here…",
      "If I were you, I'd… — найтиповіша порада: If I were you, I'd take the job.",
      "Замість would можна could (міг би) або might (можливо, б): If I had a car, I could drive to work.",
      "Порівняй First і Second: If I have time, I'll help you (реально можу мати час) — If I had time, I'd help you (часу немає, уявляю).",
      "wish + Past Simple — шкодуємо про теперішнє: I wish I lived closer to the sea. I wish I were taller. wish + could — шкода, що не вмію: I wish I could speak French. wish + would — хочемо, щоб хтось змінив поведінку: I wish you would stop talking. If only… — те саме, але емоційніше."
    ],
    ex: [
      ["If I won the lottery, I'd buy a house by the sea.", "Якби я виграла в лотерею, я купила б будинок біля моря."],
      ["What would you do if you lost your passport?", "Що б ти робив, якби загубив паспорт?"],
      ["If I were you, I wouldn't send that email.", "На твоєму місці я б не надсилала цей лист."],
      ["If we lived closer, we could see each other more often.", "Якби ми жили ближче, ми могли б частіше бачитися."],
      ["I wouldn't do that if I were you.", "Я б на твоєму місці цього не робила."],
      ["I wish I had more free time.", "Шкода, що в мене мало вільного часу."],
      ["I wish I could drive.", "Шкода, що я не вмію водити."],
      ["I wish it would stop raining.", "Хоч би вже дощ припинився."]
    ],
    err: [
      ["If I would have money, I would buy it.", "If I had money, I would buy it."],
      ["I wish I can swim.", "I wish I could swim."],
      ["If I am you, I would go.", "If I were you, I would go."],
      ["If I knew, I will tell you.", "If I knew, I would tell you."],
      ["I wish I have a dog.", "I wish I had a dog."]
    ],
    q: [
      { k: "p", s: "If I ___ a car, I would drive to work.", o: ["had", "have", "would have"], w: "Second Conditional: if + Past Simple." },
      { k: "p", s: "If I were you, I ___ that email.", o: ["wouldn't send", "won't send", "don't send"], w: "Головна частина — would." },
      { k: "p", s: "I wish I ___ taller.", o: ["were", "am", "will be"], w: "wish + Past Simple (were) — про теперішнє." },
      { k: "p", s: "What ___ you do if you saw a ghost?", o: ["would", "will", "did"], w: "Уявна ситуація — would." },
      { k: "p", s: "I wish I ___ speak Spanish.", o: ["could", "can", "will"], w: "wish + could — шкода, що не вмію." },
      { k: "p", s: "If she ___ harder, she would get better marks.", o: ["studied", "studies", "would study"], w: "Після if — Past Simple, не would." },
      { k: "t", s: "If I ___ (know) his number, I'd call him.", a: ["knew"], w: "if + Past Simple: knew." },
      { k: "t", s: "We ___ (buy) a bigger flat if we had the money.", a: ["would buy", "'d buy"], w: "would + дієслово." },
      { k: "t", s: "I wish it ___ (not / be) so cold today.", a: ["weren't", "wasn't", "were not", "was not"], w: "wish + Past Simple: weren't (або wasn't)." },
      { k: "t", s: "If I ___ (be) you, I'd apologise.", a: ["were", "was"], w: "If I were you — порада." },
      { k: "t", s: "I wish you ___ (stop) interrupting me. (would …)", a: ["would stop", "'d stop"], w: "wish + would — роздратування поведінкою іншого." },
      { k: "t", s: "Would you be happier if you ___ (live) in the countryside?", a: ["lived"], w: "if + Past Simple: lived." }
    ]
  },
  {
    id: "cond3",
    t: "Third Conditional and wish (past)",
    s: "Якби тоді…",
    rule: [
      "Third Conditional — уявна інша версія минулого, яку вже не змінити: If + Past Perfect, would have + третя форма. If I had known, I would have helped you (але я не знав і не допоміг).",
      "Обидві частини про минуле: умова не справдилася, тому й результату не було. If we had left earlier, we wouldn't have missed the train (вийшли пізно — і спізнилися).",
      "Замість would have можна could have (міг би) або might have (можливо, б): If you had asked, I could have helped. If we had taken a map, we might not have got lost.",
      "Скорочення в розмові: If I'd known, I'd have come. Тут перше 'd = had, друге 'd = would.",
      "wish + Past Perfect — шкодуємо про минуле: I wish I hadn't eaten so much. I wish I had studied harder at school. If only I had listened to you!",
      "Мішаний варіант (минула умова — теперішній результат): If I had taken that job, I would be rich now."
    ],
    ex: [
      ["If you had told me, I would have come.", "Якби ти мені сказав, я б прийшла."],
      ["We wouldn't have got lost if we had taken a map.", "Ми б не заблукали, якби взяли карту."],
      ["If she hadn't missed the bus, she wouldn't have been late.", "Якби вона не спізнилася на автобус, вона б не запізнилася."],
      ["If you had asked me, I could have helped.", "Якби ти мене попросив, я могла б допомогти."],
      ["What would you have done if you had lost your job?", "Що б ти робив, якби втратив роботу?"],
      ["I wish I had bought that jacket.", "Шкода, що я не купила ту куртку."],
      ["I wish I hadn't said that.", "Шкода, що я це сказала."],
      ["If I'd known it was your birthday, I'd have bought you a present.", "Якби я знала, що в тебе день народження, я б купила тобі подарунок."]
    ],
    err: [
      ["If I would have known, I would have come.", "If I had known, I would have come."],
      ["If she had studied, she would pass.", "If she had studied, she would have passed."],
      ["I wish I didn't say that yesterday.", "I wish I hadn't said that yesterday."],
      ["If he had came, we would have seen him.", "If he had come, we would have seen him."],
      ["We would have went if we had known.", "We would have gone if we had known."]
    ],
    q: [
      { k: "p", s: "If I ___ about the party, I would have gone.", o: ["had known", "knew", "would know"], w: "Third Conditional: if + Past Perfect." },
      { k: "p", s: "If she had taken a taxi, she ___ late.", o: ["wouldn't have been", "wouldn't be", "won't be"], w: "Головна частина — would have + третя форма." },
      { k: "p", s: "I wish I ___ that. I'm sorry.", o: ["hadn't said", "didn't say", "don't say"], w: "Шкода про минуле — wish + Past Perfect." },
      { k: "p", s: "We ___ the match if our best player hadn't been injured.", o: ["might have won", "might win", "won"], w: "might have + третя форма." },
      { k: "p", s: "If you ___ the alarm, you wouldn't have overslept.", o: ["had set", "set", "would set"], w: "Після if — Past Perfect." },
      { k: "p", s: "She wishes she ___ to university.", o: ["had gone", "went", "would go"], w: "Про минуле — had gone." },
      { k: "t", s: "If we ___ (leave) earlier, we would have caught the train.", a: ["had left", "'d left"], w: "if + Past Perfect: had left." },
      { k: "t", s: "I ___ (call) you if I had had your number. (would have …)", a: ["would have called", "'d have called", "would've called"], w: "would have + called." },
      { k: "t", s: "I wish I ___ (not / spend) all my money last weekend.", a: ["hadn't spent", "had not spent"], w: "wish + Past Perfect." },
      { k: "t", s: "If he ___ (not / drive) so fast, he wouldn't have crashed.", a: ["hadn't driven", "had not driven"], w: "if + Past Perfect: hadn't driven." },
      { k: "t", s: "What would you have done if you ___ (lose) your job?", a: ["had lost", "'d lost"], w: "if + Past Perfect." },
      { k: "t", s: "They ___ (not / meet) if she hadn't missed her flight. (would …)", a: ["wouldn't have met", "would not have met"], w: "wouldn't have + met." }
    ]
  },
  {
    id: "passive",
    t: "The Passive",
    s: "Коли важливо, що сталося, а не хто зробив",
    rule: [
      "Пасив вживаємо, коли важливіше, що сталося з предметом, а не хто це зробив: My bike was stolen (хто вкрав — невідомо або неважливо). Будова: be у потрібному часі + третя форма.",
      "Форми: Present Simple — is/are made; Past Simple — was/were made; Present Perfect — has/have been made; Future — will be made; Present Continuous — is/are being made; Past Continuous — was/were being made.",
      "Після модальних — be + третя форма: must be signed, can be done, should be checked. Після going to — going to be built.",
      "Хто виконав дію, додаємо через by, лише якщо це важливо або цікаво: The book was written by Lesya Ukrainka. Якщо це «люди загалом», by не потрібно: English is spoken here.",
      "Питання: Was it made in Italy? When was the bridge built? Заперечення: It wasn't finished.",
      "Пасив часто в новинах, інструкціях і формальних текстах: The road will be closed on Monday. Phones must be switched off. Типові вирази: be born (I was born in 1995), be made of/from, be called."
    ],
    ex: [
      ["Our office is cleaned every evening.", "Наш офіс прибирають щовечора."],
      ["The meeting has been cancelled.", "Зустріч скасовано."],
      ["The house is being painted at the moment.", "Будинок зараз фарбують."],
      ["This bridge was built in 1900.", "Цей міст збудували в 1900 році."],
      ["The winners will be announced tomorrow.", "Переможців оголосять завтра."],
      ["This form must be signed by your manager.", "Цю форму має підписати ваш керівник."],
      ["Where were you born?", "Де ти народився?"],
      ["The window was broken by a ball.", "Вікно розбили м'ячем."]
    ],
    err: [
      ["The letter was wrote yesterday.", "The letter was written yesterday."],
      ["This car made in Japan.", "This car was made in Japan."],
      ["The room is cleaning now.", "The room is being cleaned now."],
      ["I born in Lviv.", "I was born in Lviv."],
      ["It must signed today.", "It must be signed today."],
      ["The tickets have sold out by the agency.", "The tickets have been sold by the agency."]
    ],
    q: [
      { k: "p", s: "This castle ___ in the 15th century.", o: ["was built", "built", "is built"], w: "Минуле в пасиві — was + третя форма." },
      { k: "p", s: "Spanish ___ in many countries.", o: ["is spoken", "speaks", "is speaking"], w: "Загальний факт у пасиві — is + третя форма." },
      { k: "p", s: "My bike ___ ! I can't find it anywhere.", o: ["has been stolen", "has stolen", "was stealing"], w: "Результат зараз — has been + третя форма." },
      { k: "p", s: "The winners ___ next week.", o: ["will be announced", "will announce", "are announcing"], w: "Майбутнє в пасиві — will be + третя форма." },
      { k: "p", s: "This medicine must ___ after meals.", o: ["be taken", "take", "taken"], w: "Модальне + be + третя форма." },
      { k: "p", s: "Sorry, the lift ___ at the moment.", o: ["is being repaired", "is repairing", "repairs"], w: "Continuous у пасиві — is being + третя форма." },
      { k: "t", s: "The Mona Lisa ___ (paint) by Leonardo da Vinci.", a: ["was painted"], w: "Past Simple Passive: was painted." },
      { k: "t", s: "Breakfast ___ (serve) from 7 to 10 every day.", a: ["is served"], w: "Present Simple Passive: is served." },
      { k: "t", s: "The tickets ___ (already / sell) out. (has / have …)", a: ["have already been sold", "'ve already been sold"], w: "Present Perfect Passive: have already been sold." },
      { k: "t", s: "The new hospital ___ (open) next year. (will …)", a: ["will be opened"], w: "Future Passive: will be opened." },
      { k: "t", s: "Phones ___ (not / allow) in the exam room.", a: ["are not allowed", "aren't allowed"], w: "Present Simple Passive, заперечення." },
      { k: "t", s: "When ___ (this photo / take)?", a: ["was this photo taken"], w: "Питання в пасиві: was + підмет + третя форма." }
    ]
  },
  {
    id: "repst",
    t: "Reported speech: statements",
    s: "He said that…",
    rule: [
      "Непряма мова — коли переказуємо чужі слова. Якщо вводимо їх дієсловом у минулому (said, told), час у переказі зазвичай зсувається на крок назад.",
      "Зсув часів: Present Simple → Past Simple (I live → she lived); Present Continuous → Past Continuous (I'm working → he was working); Present Perfect і Past Simple → Past Perfect (I've seen / I saw → she had seen); will → would; can → could; must → had to; may → might.",
      "Змінюються займенники і слова часу та місця: I → he/she, my → his/her, today → that day, tomorrow → the next day, yesterday → the day before, now → then, here → there, this → that, ago → before.",
      "say something (to somebody), але tell somebody something. She said (that) she was tired. She told me (that) she was tired. Не кажуть «said me» і «told that». that можна пропустити.",
      "Якщо вводимо теперішнім часом (He says…) або те, що сказали, досі правда, час можна не змінювати: She said she lives in Lviv (досі живе).",
      "Інші дієслова для переказу: explain, mention, promise, admit, complain, reply: He promised he would help."
    ],
    ex: [
      ["\"I'm busy.\" → He said he was busy.", "«Я зайнятий». → Він сказав, що зайнятий."],
      ["\"We'll call you tomorrow.\" → They said they would call me the next day.", "«Ми подзвонимо тобі завтра». → Вони сказали, що подзвонять мені наступного дня."],
      ["\"I've lost my phone.\" → She told me she had lost her phone.", "«Я загубила телефон». → Вона сказала мені, що загубила телефон."],
      ["\"I can't swim.\" → He said he couldn't swim.", "«Я не вмію плавати». → Він сказав, що не вміє плавати."],
      ["\"I saw it yesterday.\" → She said she had seen it the day before.", "«Я бачила це вчора». → Вона сказала, що бачила це напередодні."],
      ["\"I must go.\" → He said he had to go.", "«Мені треба йти». → Він сказав, що йому треба йти."],
      ["She promised she would be on time.", "Вона пообіцяла, що прийде вчасно."]
    ],
    err: [
      ["She said me that she was ill.", "She told me that she was ill."],
      ["He told that he was tired.", "He said that he was tired."],
      ["He said he will come.", "He said he would come."],
      ["She said she is leaving tomorrow. (минула розмова)", "She said she was leaving the next day."],
      ["He said me he can't come.", "He told me he couldn't come."]
    ],
    q: [
      { k: "p", s: "\"I live in Kyiv.\" → She said she ___ in Kyiv.", o: ["lived", "lives", "has lived"], w: "Present Simple → Past Simple." },
      { k: "p", s: "He ___ me that he was hungry.", o: ["told", "said", "spoke"], w: "tell + кому: told me." },
      { k: "p", s: "\"I will help you.\" → She said she ___ help me.", o: ["would", "will", "can"], w: "will → would." },
      { k: "p", s: "\"I saw the film.\" → He said he ___ the film.", o: ["had seen", "has seen", "saw"], w: "Past Simple → Past Perfect." },
      { k: "p", s: "\"I can swim.\" → He said he ___ swim.", o: ["could", "can", "would"], w: "can → could." },
      { k: "p", s: "\"I'm leaving tomorrow.\" → She said she was leaving ___.", o: ["the next day", "tomorrow", "yesterday"], w: "tomorrow → the next day." },
      { k: "t", s: "\"I'm tired.\" → He said he ___ tired.", a: ["was"], w: "am → was." },
      { k: "t", s: "\"We have finished.\" → They said they ___ finished.", a: ["had"], w: "have finished → had finished." },
      { k: "t", s: "She ___ (say) that she didn't like the hotel.", a: ["said"], w: "say – said." },
      { k: "t", s: "\"I don't know the answer.\" → He said he ___ the answer.", a: ["didn't know", "did not know"], w: "don't know → didn't know." },
      { k: "t", s: "\"I'm working.\" → She said she ___ working.", a: ["was"], w: "Present Continuous → Past Continuous: was working." },
      { k: "t", s: "My teacher ___ us that the test would be easy.", a: ["told"], w: "tell + us: told." }
    ]
  },
  {
    id: "repq",
    t: "Reported speech: questions and requests",
    s: "She asked if… / He told me to…",
    rule: [
      "У непрямих питаннях порядок слів як у ствердженні і без do/does/did: \"Where do you live?\" → She asked me where I lived. \"What time is it?\" → He asked what time it was.",
      "Питання так/ні переказуємо через if або whether: \"Are you ready?\" → He asked if I was ready. \"Did you see it?\" → She asked whether I had seen it.",
      "Зсув часів такий самий, як у твердженнях: is → was, will → would, Past Simple → Past Perfect. Знак питання в кінці не ставимо.",
      "Прохання і накази: tell / ask + кому + to + дієслово. \"Close the door.\" → She told me to close the door. \"Please wait.\" → He asked us to wait. Заперечення — not to: He asked me not to be late.",
      "Ввічливі (непрямі) питання в теперішньому: Could you tell me where the station is? Do you know what time it starts? I wonder if she's at home. Тут теж прямий порядок слів і без do.",
      "Інші дієслова: want to know, wonder, enquire: He wanted to know how much it cost."
    ],
    ex: [
      ["She asked me what time it was.", "Вона спитала мене, котра година."],
      ["He wanted to know if I had a car.", "Він хотів знати, чи є в мене машина."],
      ["They asked where we had been.", "Вони спитали, де ми були."],
      ["The doctor told me not to eat sugar.", "Лікар сказав мені не їсти цукор."],
      ["She asked us to wait outside.", "Вона попросила нас почекати надворі."],
      ["Could you tell me how much this costs?", "Не підкажете, скільки це коштує?"],
      ["I wonder whether he'll come.", "Цікаво, чи він прийде."]
    ],
    err: [
      ["She asked me where did I live.", "She asked me where I lived."],
      ["He asked me that I was ready.", "He asked me if I was ready."],
      ["She told me don't go.", "She told me not to go."],
      ["Do you know where is the bank?", "Do you know where the bank is?"],
      ["He asked me what was I doing?", "He asked me what I was doing."]
    ],
    q: [
      { k: "p", s: "\"Where are you going?\" → He asked me where ___.", o: ["I was going", "was I going", "I am going"], w: "Прямий порядок слів + зсув часу." },
      { k: "p", s: "\"Do you like jazz?\" → She asked ___ I liked jazz.", o: ["if", "that", "do"], w: "Питання так/ні — if / whether." },
      { k: "p", s: "\"Don't touch it!\" → He told me ___ it.", o: ["not to touch", "don't touch", "to not touching"], w: "Заборона — not to + дієслово." },
      { k: "p", s: "\"Please wait here.\" → She asked us ___ there.", o: ["to wait", "wait", "waiting"], w: "ask + кому + to + дієслово." },
      { k: "p", s: "\"What did you buy?\" → He asked what I ___.", o: ["had bought", "did buy", "bought did"], w: "Past Simple → Past Perfect, без did." },
      { k: "p", s: "I wonder where ___.", o: ["the station is", "is the station", "does the station be"], w: "Непряме питання — прямий порядок слів." },
      { k: "t", s: "\"How old are you?\" → She asked me how old I ___.", a: ["was"], w: "are → was, прямий порядок." },
      { k: "t", s: "\"Can you help me?\" → He asked ___ I could help him.", a: ["if", "whether"], w: "Питання так/ні — if / whether." },
      { k: "t", s: "\"Sit down, please.\" → The teacher told us ___ (sit) down.", a: ["to sit"], w: "told + кому + to sit." },
      { k: "t", s: "\"Don't be late.\" → Mum told me ___ late.", a: ["not to be"], w: "not to be." },
      { k: "t", s: "\"Where does she work?\" → I asked where she ___.", a: ["worked"], w: "Без does, Present Simple → Past Simple." },
      { k: "t", s: "Could you tell me what time the shop ___ (open)?", a: ["opens"], w: "Непряме питання: what time the shop opens (без does)." }
    ]
  },
  {
    id: "rel",
    t: "Relative clauses: who, which, that, where, whose",
    s: "Людина, яка… / Місце, де…",
    rule: [
      "Підрядні означальні речення пояснюють, про кого чи про що йдеться. who — для людей, which — для речей і тварин, that — для людей і речей (у визначальних реченнях), where — для місць, whose — чий, when — для часу.",
      "Визначальні речення (без ком) кажуть, кого саме маємо на увазі: The woman who lives next door is a doctor. The phone that I bought is broken.",
      "Якщо who/which/that — це додаток (після нього є свій підмет), його можна пропустити: The book (that) I'm reading is great. The man (who) we met… Якщо це підмет — не можна: The man who called me (who обов'язкове).",
      "Невизначальні речення (з комами) додають зайву, додаткову інформацію: My brother, who lives in Lviv, is a teacher. Тут не вживаємо that і нічого не пропускаємо.",
      "which може стосуватися всього попереднього речення: He didn't call, which was strange.",
      "Не повторюй підмет чи додаток усередині підрядного: The hotel where we stayed (не «where we stayed in it»), The man who I saw (не «who I saw him»)."
    ],
    ex: [
      ["Is this the bag that you lost?", "Це та сумка, яку ти загубила?"],
      ["The people who live upstairs are very friendly.", "Люди, які живуть нагорі, дуже привітні."],
      ["Kyiv, which is the capital of Ukraine, is on the Dnipro.", "Київ, який є столицею України, стоїть на Дніпрі."],
      ["I know a girl whose father is a pilot.", "Я знаю дівчину, чий батько — пілот."],
      ["This is the café where we first met.", "Це кафе, де ми вперше зустрілися."],
      ["The film we watched last night was boring.", "Фільм, який ми дивилися вчора, був нудний."],
      ["I'll never forget the day when I got my first job.", "Я ніколи не забуду день, коли отримала першу роботу."],
      ["She passed the exam, which surprised everyone.", "Вона склала іспит, що всіх здивувало."]
    ],
    err: [
      ["The man which called you is here.", "The man who called you is here."],
      ["My car, that is red, is old.", "My car, which is red, is old."],
      ["The hotel where we stayed in it was nice.", "The hotel where we stayed was nice."],
      ["The man called me is my boss.", "The man who called me is my boss."],
      ["I have a friend who her brother is famous.", "I have a friend whose brother is famous."]
    ],
    q: [
      { k: "p", s: "The people ___ live upstairs are very noisy.", o: ["who", "which", "where"], w: "Люди — who (або that)." },
      { k: "p", s: "This is the café ___ we first met.", o: ["where", "which", "who"], w: "Місце — where." },
      { k: "p", s: "That's the girl ___ brother plays in a band.", o: ["whose", "who", "which"], w: "Приналежність — whose." },
      { k: "p", s: "The phone ___ I bought last week is already broken.", o: ["that", "who", "where"], w: "Річ — that / which (або без слова)." },
      { k: "p", s: "Lviv, ___ is in the west of Ukraine, is very beautiful.", o: ["which", "that", "where"], w: "Невизначальне речення з комами — which, не that." },
      { k: "p", s: "In which sentence can you leave out the relative pronoun?", o: ["The film we watched was boring.", "The man lives here is kind.", "The dog bit me was big."], w: "Можна пропустити, коли після слова йде інший підмет (we)." },
      { k: "t", s: "I have a friend ___ speaks five languages.", a: ["who", "that"], w: "Людина-підмет — who / that." },
      { k: "t", s: "Do you remember the hotel ___ we stayed last summer?", a: ["where"], w: "Місце — where." },
      { k: "t", s: "The book ___ you gave me is fantastic.", a: ["that", "which"], w: "Річ — that / which." },
      { k: "t", s: "He's the man ___ wife works with my mum.", a: ["whose"], w: "Чия дружина — whose." },
      { k: "t", s: "My grandmother, ___ is 90, still drives.", a: ["who"], w: "Невизначальне про людину — who." },
      { k: "t", s: "Is there a shop near here ___ sells batteries?", a: ["that", "which"], w: "Річ (магазин) як підмет — that / which." }
    ]
  },
  {
    id: "gerinf",
    t: "Gerund and infinitive",
    s: "enjoy doing чи want to do",
    rule: [
      "Після деяких дієслів стоїть форма на -ing: enjoy, finish, avoid, mind, suggest, keep, practise, consider, miss, imagine, admit, deny, can't stand, give up, put off. I enjoy cooking. Would you mind waiting?",
      "Після інших — to + дієслово: want, decide, hope, plan, agree, refuse, promise, manage, afford, learn, expect, offer, seem, would like, would love. I decided to stay. She managed to finish.",
      "Після прийменників — завжди -ing: interested in learning, good at swimming, tired of waiting, before leaving, after eating, without saying, instead of going, look forward to seeing (to тут прийменник!). Дієслово в ролі підмета — теж -ing: Swimming is good for you.",
      "Після прикметників і для мети — to: It's easy to learn. I'm happy to help. I went out to buy bread.",
      "Після like, love, hate, prefer, start, begin, continue можна і так, і так майже без різниці: I like reading / I like to read. Але would like — тільки to: I'd like to go.",
      "Деякі дієслова змінюють значення: stop smoking (кинути палити) / stop to smoke (зупинитися, щоб покурити); remember locking (пам'ятаю, що замкнула) / remember to lock (не забути замкнути); forget meeting / forget to call; try opening (спробувати як варіант) / try to open (намагатися); regret saying (шкодую, що сказала)."
    ],
    ex: [
      ["Would you mind closing the window?", "Ви не проти зачинити вікно?"],
      ["I can't afford to buy a new car.", "Я не можу дозволити собі нову машину."],
      ["I'm looking forward to hearing from you.", "З нетерпінням чекаю на вашу відповідь."],
      ["She's good at solving problems.", "Вона вміє розв'язувати проблеми."],
      ["We decided to take a taxi.", "Ми вирішили взяти таксі."],
      ["He suggested going for a walk.", "Він запропонував прогулятися."],
      ["Don't forget to lock the door.", "Не забудь замкнути двері."],
      ["I stopped eating sugar a year ago.", "Я перестала їсти цукор рік тому."]
    ],
    err: [
      ["I enjoy to read.", "I enjoy reading."],
      ["I decided going home.", "I decided to go home."],
      ["I'm interested in learn Spanish.", "I'm interested in learning Spanish."],
      ["I look forward to see you.", "I look forward to seeing you."],
      ["She suggested to go out.", "She suggested going out."],
      ["I'd like going home.", "I'd like to go home."]
    ],
    q: [
      { k: "p", s: "Have you finished ___ the report?", o: ["writing", "to write", "write"], w: "finish + -ing." },
      { k: "p", s: "We hope ___ you again soon.", o: ["to see", "seeing", "see"], w: "hope + to." },
      { k: "p", s: "She's very good at ___ problems.", o: ["solving", "to solve", "solve"], w: "Після прийменника at — -ing." },
      { k: "p", s: "Remember ___ the door when you leave!", o: ["to lock", "locking", "lock"], w: "remember to = не забути зробити." },
      { k: "p", s: "He gave up ___ last year.", o: ["smoking", "to smoke", "smoke"], w: "give up + -ing." },
      { k: "p", s: "They refused ___ for the damage.", o: ["to pay", "paying", "pay"], w: "refuse + to." },
      { k: "t", s: "I don't mind ___ (wait).", a: ["waiting"], w: "mind + -ing." },
      { k: "t", s: "She agreed ___ (help) me with the move.", a: ["to help"], w: "agree + to." },
      { k: "t", s: "Thank you for ___ (invite) me.", a: ["inviting"], w: "Після for — -ing." },
      { k: "t", s: "I'm looking forward to ___ (meet) you.", a: ["meeting"], w: "look forward to + -ing (to тут прийменник)." },
      { k: "t", s: "We can't afford ___ (go) on holiday this year.", a: ["to go"], w: "afford + to." },
      { k: "t", s: "He suggested ___ (take) a taxi.", a: ["taking"], w: "suggest + -ing." }
    ]
  },
  {
    id: "comp",
    t: "Comparatives: -er, more, as … as, too, enough",
    s: "Більший, найкращий, недостатньо",
    rule: [
      "Короткі прикметники (один склад): + -er / the + -est. cheap → cheaper → the cheapest; tall → taller → the tallest. Якщо закінчуються на «приголосна + голосна + приголосна», остання подвоюється: big → bigger, hot → the hottest. На -e — лише -r/-st: nice → nicer.",
      "Двоскладові на -y: y → i + -er/-est: easy → easier → the easiest; happy → happier. Інші довгі прикметники: more / the most: expensive → more expensive → the most expensive; interesting → the most interesting.",
      "Винятки треба запам'ятати: good → better → the best; bad → worse → the worst; far → further/farther → the furthest; little → less → the least; much/many → more → the most.",
      "Після порівняння — than: Kyiv is bigger than Lviv. Посилення: much / a lot / far bigger; трохи: a bit / slightly cheaper. Що більше…, то…: The sooner, the better.",
      "as … as — однаково: She's as tall as her mum. not as … as — менше: This film isn't as good as the book. Після as і than у розмові — me/him: She's taller than me.",
      "too + прикметник — надто, це проблема: It's too cold to swim. прикметник + enough — достатньо: He isn't old enough to drive. enough + іменник: We don't have enough time. Найвищий ступінь — з the і часто з in/of: the best player in the team, the longest day of the year."
    ],
    ex: [
      ["The train is much faster than the bus.", "Потяг набагато швидший за автобус."],
      ["It was the worst day of my life.", "Це був найгірший день у моєму житті."],
      ["This hotel is more expensive than the last one.", "Цей готель дорожчий за попередній."],
      ["My English is getting better and better.", "Моя англійська стає дедалі кращою."],
      ["Her flat isn't as big as ours.", "Її квартира не така велика, як наша."],
      ["The coffee is too hot to drink.", "Кава надто гаряча, щоб пити."],
      ["Is the room big enough for four people?", "Кімната достатньо велика для чотирьох?"],
      ["The more you practise, the easier it gets.", "Що більше практикуєш, то легше стає."]
    ],
    err: [
      ["She is more tall than me.", "She is taller than me."],
      ["It's the most good restaurant.", "It's the best restaurant."],
      ["He is enough old.", "He is old enough."],
      ["This is more easier.", "This is easier."],
      ["He's taller then his brother.", "He's taller than his brother."],
      ["It's very hot to drink. (проблема)", "It's too hot to drink."]
    ],
    q: [
      { k: "p", s: "This exercise is ___ than the last one.", o: ["easier", "more easy", "easyer"], w: "easy → easier." },
      { k: "p", s: "It's the ___ film I've ever seen.", o: ["worst", "baddest", "most bad"], w: "bad → worse → the worst." },
      { k: "p", s: "My flat isn't ___ big as yours.", o: ["as", "so much", "than"], w: "not as … as." },
      { k: "p", s: "The box is too heavy ___ lift.", o: ["to", "for", "that"], w: "too + прикметник + to." },
      { k: "p", s: "Are you old ___ to vote?", o: ["enough", "too", "very"], w: "Прикметник + enough." },
      { k: "p", s: "Kyiv is ___ bigger than Lviv.", o: ["much", "very", "more"], w: "Посилення порівняння — much." },
      { k: "t", s: "Mount Everest is the ___ (high) mountain in the world.", a: ["highest"], w: "high → the highest." },
      { k: "t", s: "This hotel is ___ (expensive) than the one we stayed in last year.", a: ["more expensive"], w: "Довгий прикметник — more expensive." },
      { k: "t", s: "I feel much ___ (good) today.", a: ["better"], w: "good → better." },
      { k: "t", s: "We don't have ___ chairs for everyone. (enough / too)", a: ["enough"], w: "enough + іменник." },
      { k: "t", s: "Her English is as ___ (good) as mine.", a: ["good"], w: "as + базова форма + as." },
      { k: "t", s: "The ___ (far) I've ever run is 10 km.", a: ["furthest", "farthest"], w: "far → the furthest / the farthest." }
    ]
  },
  {
    id: "art",
    t: "Articles: a/an, the, no article",
    s: "Перша згадка, відоме, загальне",
    rule: [
      "a / an — один із багатьох, вперше згадуємо, неважливо який: I saw a dog. Також для професії: She's an engineer. an — перед голосним звуком (не літерою!): an apple, an hour, an honest man; але a university, a European country, a one-way ticket.",
      "the — конкретне, відоме обом, уже згадане або єдине: I saw a dog. The dog was huge. Close the door, please (ту, що тут). The sun, the moon, the internet.",
      "the також: з найвищим ступенем (the best), з порядковими числівниками (the first time), з музичними інструментами (play the guitar), з річками, морями, горами-хребтами (the Dnipro, the Black Sea, the Alps), з країнами з states/kingdom/republic (the USA, the UK), з місцями в місті (the cinema, the theatre, the bank).",
      "Без артикля — загальні твердження у множині чи з незлічуваними іменниками: I love cats. Money isn't everything. Life is short.",
      "Без артикля також: більшість країн, міст, вулиць (Ukraine, Paris, Oxford Street), прийоми їжі (have breakfast), мови й предмети (I study history), go to work / school / bed / university, at home, by bus/car/train, next week, last year.",
      "Перед іменником в однині без означення артикль потрібен майже завжди: I need a car (не «I need car»)."
    ],
    ex: [
      ["I bought a jacket. The jacket was on sale.", "Я купила куртку. Куртка була зі знижкою."],
      ["Life is short.", "Життя коротке."],
      ["We went to the theatre on Saturday.", "У суботу ми ходили до театру."],
      ["She's an architect.", "Вона архітекторка."],
      ["I waited for an hour.", "Я чекала годину."],
      ["He plays the piano very well.", "Він дуже гарно грає на піаніно."],
      ["Children usually love animals.", "Діти зазвичай люблять тварин."],
      ["We had dinner at home and went to bed.", "Ми повечеряли вдома й пішли спати."]
    ],
    err: [
      ["She is doctor.", "She is a doctor."],
      ["The life is beautiful.", "Life is beautiful."],
      ["I go to the work by the bus.", "I go to work by bus."],
      ["It's a hour away.", "It's an hour away."],
      ["He is best player.", "He is the best player."],
      ["I love the dogs. (загалом)", "I love dogs."]
    ],
    q: [
      { k: "p", s: "My sister is ___ architect.", o: ["an", "a", "the"], w: "Професія + голосний звук — an." },
      { k: "p", s: "___ moon goes round the Earth.", o: ["The", "A", "— (без артикля)"], w: "Єдиний у своєму роді — the." },
      { k: "p", s: "I don't like ___ coffee very much.", o: ["— (без артикля)", "the", "a"], w: "Загальне твердження про незлічуване — без артикля." },
      { k: "p", s: "We had ___ lunch in a small café.", o: ["— (без артикля)", "a", "the"], w: "Прийоми їжі — без артикля." },
      { k: "p", s: "Can you play ___ piano?", o: ["the", "a", "— (без артикля)"], w: "Музичні інструменти — the." },
      { k: "p", s: "It's ___ university in the city centre.", o: ["a", "an", "— (без артикля)"], w: "university починається зі звуку [j], тому a." },
      { k: "t", s: "I waited for ___ hour. (a / an / the)", a: ["an"], w: "hour — h не читається, голосний звук: an." },
      { k: "p", s: "She goes to ___ bed at 11.", o: ["— (без артикля)", "the", "a"], w: "go to bed — без артикля." },
      { k: "t", s: "Yesterday I saw a film. ___ film was about space.", a: ["the"], w: "Друга згадка — the." },
      { k: "t", s: "He's ___ best player in the team.", a: ["the"], w: "Найвищий ступінь — the." },
      { k: "t", s: "They live in ___ United States.", a: ["the"], w: "Назви країн зі States, Kingdom, Republic — the." },
      { k: "p", s: "I usually go to work by ___ car.", o: ["— (без артикля)", "the", "a"], w: "by car — без артикля." }
    ]
  },
  {
    id: "quant",
    t: "Quantifiers: some, any, much, many, few, little",
    s: "Скільки чого",
    rule: [
      "Злічувані іменники можна порахувати (an apple, two apples), незлічувані — ні (water, money, time, information, advice, luggage, furniture, news). Незлічувані не мають множини: some advice, а не «advices».",
      "some — у ствердженнях і в проханнях/пропозиціях: I've got some friends here. Would you like some tea? Can I have some water? any — у запереченнях і питаннях: I don't have any money. Have you got any questions? Також any = будь-який: Take any seat.",
      "many — зі злічуваними (many people, how many?), much — з незлічуваними (much time, how much?). У ствердженнях природніше a lot of / lots of для обох: There were a lot of people. We have a lot of time. much і many частіше в питаннях і запереченнях.",
      "a few (злічувані) / a little (незлічувані) — небагато, але достатньо, позитивно: I have a few friends here. There's a little milk left.",
      "few / little без a — мало, майже немає, негативно: Few people came. There's little hope. very few, very little — ще сильніше.",
      "Похідні: something/anything, somebody/anybody, somewhere/anywhere — за тим самим правилом: I need something to eat. Is there anything I can do? no / none / nothing — замість not any: There's no milk. None of them came."
    ],
    ex: [
      ["There isn't much milk left.", "Молока лишилося небагато."],
      ["How many languages do you speak?", "Скількома мовами ти розмовляєш?"],
      ["Would you like some coffee?", "Хочеш кави?"],
      ["Have you got any plans for the weekend?", "У тебе є плани на вихідні?"],
      ["I need a little help with this.", "Мені потрібна невелика допомога з цим."],
      ["We have a few minutes before the train.", "У нас є кілька хвилин до потяга."],
      ["Very few people know about it.", "Про це знає дуже мало людей."],
      ["Can you give me some advice?", "Можеш дати мені пораду?"]
    ],
    err: [
      ["How much people were there?", "How many people were there?"],
      ["I don't have some money.", "I don't have any money."],
      ["There are a little apples.", "There are a few apples."],
      ["Can you give me an advice?", "Can you give me some advice?"],
      ["I have much friends.", "I have a lot of friends."],
      ["I didn't see nobody.", "I didn't see anybody. / I saw nobody."]
    ],
    q: [
      { k: "p", s: "How ___ water do you drink a day?", o: ["much", "many", "few"], w: "water — незлічуване: much." },
      { k: "p", s: "There aren't ___ eggs in the fridge.", o: ["any", "some", "much"], w: "Заперечення — any." },
      { k: "p", s: "Would you like ___ cake?", o: ["some", "any", "many"], w: "Пропозиція — some." },
      { k: "p", s: "I've got ___ friends in London, so I won't be lonely.", o: ["a few", "a little", "little"], w: "Злічувані, позитивно — a few." },
      { k: "p", s: "Hurry up! We have very ___ time.", o: ["little", "few", "many"], w: "Незлічуване, мало — little." },
      { k: "p", s: "There were ___ people at the concert — the hall was full.", o: ["a lot of", "much", "a little"], w: "Багато у ствердженні — a lot of." },
      { k: "t", s: "How ___ brothers and sisters do you have?", a: ["many"], w: "Злічувані — many." },
      { k: "t", s: "Is there ___ sugar in my tea? (some / any)", a: ["any"], w: "Питання — any." },
      { k: "t", s: "I don't have ___ free time this week. (much / many)", a: ["much"], w: "time — незлічуване: much." },
      { k: "t", s: "Can I ask you ___ questions? (a few / a little)", a: ["a few"], w: "questions — злічувані: a few." },
      { k: "t", s: "Add ___ salt, but not too much. (a few / a little)", a: ["a little"], w: "salt — незлічуване: a little." },
      { k: "t", s: "Very ___ students passed the exam — it was really hard. (few / little)", a: ["few"], w: "Злічувані, майже ніхто — few." }
    ]
  },
  {
    id: "qtags",
    t: "Question tags and indirect questions",
    s: "…isn't it? / Do you know where…?",
    rule: [
      "Розділове питання (question tag) — короткий «хвостик» у кінці, щоб перепитати або попросити погодитися: It's cold, isn't it? Українською — «правда ж?», «так?».",
      "Правило знаків: стверджувальне речення → заперечний хвостик (You're Ukrainian, aren't you?), заперечне речення → стверджувальний (You don't smoke, do you?).",
      "У хвостику повторюємо допоміжне або модальне дієслово з речення (is, are, have, can, will, would…). Якщо його немає — do/does/did: She lives here, doesn't she? They went home, didn't they? Підмет — займенником: Your sister is a doctor, isn't she?",
      "Особливі випадки: I'm late, aren't I? Let's go, shall we? Close the door, will you? There's a problem, isn't there? Nobody called, did they? (nobody/never уже роблять речення заперечним).",
      "Непрямі, ввічливіші питання починаються з Could you tell me…, Do you know…, I wonder…, Can you remember… — і далі прямий порядок слів без do/does/did: Do you know where the station is? Could you tell me what time it starts?",
      "Питання так/ні в непрямій формі — через if/whether: Do you know if she's at home?"
    ],
    ex: [
      ["You're coming tomorrow, aren't you?", "Ти ж прийдеш завтра?"],
      ["He can't swim, can he?", "Він не вміє плавати, так?"],
      ["She works in a bank, doesn't she?", "Вона ж працює в банку?"],
      ["They didn't call, did they?", "Вони ж не дзвонили?"],
      ["Let's have a break, shall we?", "Давай зробимо перерву?"],
      ["Do you know if she's at home?", "Ти не знаєш, вона вдома?"],
      ["Could you tell me how I can get to the station?", "Не підкажете, як дістатися до вокзалу?"],
      ["I wonder what time it is.", "Цікаво, котра зараз година."]
    ],
    err: [
      ["She likes jazz, isn't it?", "She likes jazz, doesn't she?"],
      ["Could you tell me where is the bank?", "Could you tell me where the bank is?"],
      ["You can swim, can you?", "You can swim, can't you?"],
      ["I'm right, amn't I?", "I'm right, aren't I?"],
      ["Do you know what time does it start?", "Do you know what time it starts?"]
    ],
    q: [
      { k: "p", s: "It's a lovely day, ___?", o: ["isn't it", "is it", "doesn't it"], w: "Стверджувальне з is — isn't it." },
      { k: "p", s: "You haven't seen my keys, ___?", o: ["have you", "haven't you", "did you"], w: "Заперечне — стверджувальний tag: have you." },
      { k: "p", s: "He works in a bank, ___?", o: ["doesn't he", "isn't he", "does he"], w: "Present Simple — doesn't he." },
      { k: "p", s: "I'm right, ___?", o: ["aren't I", "am I not", "isn't it"], w: "Особливий випадок — aren't I." },
      { k: "p", s: "Do you know what time ___?", o: ["the museum opens", "does the museum open", "opens the museum"], w: "Непряме питання — прямий порядок, без does." },
      { k: "p", s: "Let's take a break, ___?", o: ["shall we", "will we", "don't we"], w: "Let's … — shall we." },
      { k: "t", s: "They went to Italy, ___ they?", a: ["didn't"], w: "Past Simple — didn't." },
      { k: "t", s: "She can drive, ___ she?", a: ["can't", "cannot"], w: "can → can't." },
      { k: "t", s: "You won't forget, ___ you?", a: ["will"], w: "won't → will." },
      { k: "t", s: "Could you tell me where the toilets ___?", a: ["are"], w: "Прямий порядок: where the toilets are." },
      { k: "t", s: "You've met Oleh, ___ you?", a: ["haven't"], w: "have → haven't." },
      { k: "t", s: "I wonder ___ he'll come. (if / that)", a: ["if", "whether"], w: "Питання так/ні в непрямому — if / whether." }
    ]
  },
  {
    id: "sosuch",
    t: "so, such, so that, in order to",
    s: "Посилення і мета",
    rule: [
      "so + прикметник або прислівник — «такий», «так»: It was so cold. She speaks so fast. Також so much / so many: I have so much work.",
      "such + (a/an) + прикметник + іменник: It was such a cold day. They're such nice people. Для незлічуваних і множини — без a: such good weather, such beautiful flowers.",
      "so … that / such … that — наслідок «настільки…, що…»: It was so hot that we stayed inside. It was such a good film that I watched it twice. that у розмові можна пропустити.",
      "Мета «щоб»: to + дієслово (I went out to buy bread), in order to — формальніше (She saved money in order to buy a car), in order not to / so as not to — щоб не (I left early so as not to be late).",
      "so that + підмет + can/could/will/would — коли в мети свій підмет або потрібне модальне: I left early so that I could catch the train. Speak louder so that everyone can hear you.",
      "Не кажемо «for + дієслово» для мети: I came here to learn (не «for learn»). for + іменник — можна: I went out for a walk."
    ],
    ex: [
      ["The test was so easy!", "Тест був таким легким!"],
      ["It's such a beautiful city.", "Це таке гарне місто."],
      ["She was so tired that she fell asleep on the sofa.", "Вона так втомилася, що заснула на дивані."],
      ["It was such bad weather that the flight was cancelled.", "Була така погана погода, що рейс скасували."],
      ["She saved money in order to buy a car.", "Вона відкладала гроші, щоб купити машину."],
      ["I set two alarms so that I wouldn't oversleep.", "Я поставила два будильники, щоб не проспати."],
      ["We went to the market to buy some fruit.", "Ми пішли на ринок купити фруктів."],
      ["I have so many things to do today.", "У мене сьогодні стільки справ."]
    ],
    err: [
      ["It was so a nice day.", "It was such a nice day."],
      ["I came here for learn English.", "I came here to learn English."],
      ["They are so nice people.", "They are such nice people."],
      ["It's such cold today.", "It's so cold today."],
      ["It was such a good weather.", "It was such good weather."]
    ],
    q: [
      { k: "p", s: "It was ___ a boring film that I fell asleep.", o: ["such", "so", "too"], w: "such + a + прикметник + іменник." },
      { k: "p", s: "The music was ___ loud that we couldn't talk.", o: ["so", "such", "such a"], w: "so + прикметник." },
      { k: "p", s: "I went to the shop ___ some milk.", o: ["to buy", "for buy", "for buying"], w: "Мета — to + дієслово." },
      { k: "p", s: "She whispered ___ nobody could hear her.", o: ["so that", "such that", "in order to"], w: "so that + підмет + could." },
      { k: "p", s: "They have ___ lovely children.", o: ["such", "so", "such a"], w: "such + прикметник + іменник у множині (без a)." },
      { k: "p", s: "We left early in order ___ the traffic.", o: ["to avoid", "avoiding", "avoid"], w: "in order to + дієслово." },
      { k: "t", s: "I was ___ tired that I went to bed at 8. (so / such)", a: ["so"], w: "so + прикметник." },
      { k: "t", s: "It was ___ a long journey! (so / such)", a: ["such"], w: "such a + прикметник + іменник." },
      { k: "t", s: "I'm saving money ___ I can travel next year. (so that / to)", a: ["so that"], w: "so that + підмет + can." },
      { k: "t", s: "He called ___ (say) sorry.", a: ["to say"], w: "Мета — to say." },
      { k: "t", s: "She speaks ___ quickly that I can't understand her. (so / such)", a: ["so"], w: "so + прислівник." },
      { k: "t", s: "It's ___ nice weather today! (so / such)", a: ["such"], w: "weather — незлічуване: such + прикметник + іменник без a." }
    ]
  }
];
