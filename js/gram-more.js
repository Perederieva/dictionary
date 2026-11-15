export const MORE = {
  pres: [
    { k: "e", s: "My sister work in a big hospital.", bad: "work", fix: "works", w: "she — дієслово з -s: works." },
    { k: "e", s: "I am needing a new phone.", bad: "am needing", fix: "need", w: "need — дієслово стану, без Continuous." },
    { k: "o", s: "What are you doing right now?", uk: "Що ти робиш просто зараз?", w: "Питання в Present Continuous: What + are + you + doing." },
    { k: "o", s: "She doesn't usually drink coffee.", uk: "Вона зазвичай не п'є каву.", w: "usually стоїть після допоміжного doesn't." },
    { k: "r", s: "I usually walk to work. (today / take the bus)", p: "Today I ___", a: ["am taking the bus", "'m taking the bus", "am taking the bus to work", "'m taking the bus to work"], w: "Тимчасова дія сьогодні — Present Continuous." },
    { k: "r", s: "He plays tennis. (питання з Does)", p: "___", a: ["does he play tennis"], w: "Питання: Does + he + play." },
    { k: "y", s: "Water boils at 100 degrees.", ok: true, w: "Загальний факт — Present Simple." },
    { k: "y", s: "Listen! Somebody sings.", ok: false, fix: "Listen! Somebody is singing.", w: "Listen! — дія зараз, Present Continuous." }
  ],
  past: [
    { k: "e", s: "Did you went to the party?", bad: "went", fix: "go", w: "Після did — базова форма." },
    { k: "e", s: "While I was cooking, the phone was ringing once.", bad: "was ringing", fix: "rang", w: "Коротка подія — Past Simple." },
    { k: "o", s: "What were you doing at eight?", uk: "Що ти робив о восьмій?", w: "Питання в Past Continuous: were + you + doing." },
    { k: "o", s: "We didn't see the end of the film.", uk: "Ми не бачили кінця фільму.", w: "Заперечення: didn't + see." },
    { k: "r", s: "I was reading. Then the lights went out. (when)", p: "I was reading ___", a: ["when the lights went out"], w: "Довга дія + when + коротка подія." },
    { k: "r", s: "She buys bread every day. (yesterday)", p: "Yesterday she ___", a: ["bought bread"], w: "buy – bought." },
    { k: "y", s: "I was knowing the answer.", ok: false, fix: "I knew the answer.", w: "know — без Continuous." },
    { k: "y", s: "They were playing cards when we arrived.", ok: true, w: "Довга дія перервана подією — правильно." }
  ],
  pperf: [
    { k: "e", s: "I have visited Rome last year.", bad: "have visited", fix: "visited", w: "last year — Past Simple." },
    { k: "e", s: "She hasn't finished it already.", bad: "already", fix: "yet", w: "У запереченнях — yet." },
    { k: "o", s: "Have you ever been to Italy?", uk: "Ти колись був в Італії?", w: "Have + you + ever + been." },
    { k: "o", s: "I have just finished my report.", uk: "Я щойно закінчила звіт.", w: "just — між have і третьою формою." },
    { k: "r", s: "I lost my keys and I still can't find them. (Present Perfect)", p: "I ___", a: ["have lost my keys", "'ve lost my keys"], w: "Результат зараз — have lost." },
    { k: "r", s: "Have you seen this film? — Yes, … (last week)", p: "Yes, I ___", a: ["saw it last week"], w: "last week — Past Simple." },
    { k: "y", s: "When have you arrived?", ok: false, fix: "When did you arrive?", w: "when — Past Simple." },
    { k: "y", s: "I've never tried sushi.", ok: true, w: "Досвід — Present Perfect." }
  ],
  ppc: [
    { k: "e", s: "I have been knowing her for years.", bad: "have been knowing", fix: "have known", w: "know — дієслово стану." },
    { k: "e", s: "We've been waiting since two hours.", bad: "since", fix: "for", w: "Період — for." },
    { k: "o", s: "How long have you been learning English?", uk: "Як довго ти вчиш англійську?", w: "How long + have + you + been + -ing." },
    { k: "o", s: "It has been raining since morning.", uk: "Дощ іде з ранку.", w: "has been raining + since." },
    { k: "r", s: "I started working here in 2021. I still work here. (since)", p: "I have been ___", a: ["working here since 2021"], w: "since + точка початку." },
    { k: "r", s: "She started reading two hours ago. She's still reading. (for)", p: "She has been ___", a: ["reading for two hours"], w: "for + період." },
    { k: "y", s: "I'm living here for five years.", ok: false, fix: "I've been living here for five years.", w: "Триває досі — Present Perfect Continuous." },
    { k: "y", s: "They've been married since 2015.", ok: true, w: "be — стан, Present Perfect Simple + since." }
  ],
  pastperf: [
    { k: "e", s: "When we arrived, the film already started.", bad: "already started", fix: "had already started", w: "Почався раніше — Past Perfect." },
    { k: "e", s: "I had went there before.", bad: "went", fix: "gone", w: "had + третя форма: gone." },
    { k: "o", s: "She had never seen the sea before.", uk: "Вона ніколи раніше не бачила моря.", w: "had + never + seen." },
    { k: "o", s: "By the time we got there, everyone had left.", uk: "Поки ми дісталися, всі вже пішли.", w: "By the time + Past Simple, Past Perfect." },
    { k: "r", s: "He lost his wallet. Then he called the bank. (after)", p: "After he ___", a: ["had lost his wallet, he called the bank", "had lost his wallet he called the bank"], w: "Раніша дія — Past Perfect." },
    { k: "r", s: "I didn't know her before the party. (never)", p: "I had ___", a: ["never met her before the party", "never seen her before the party", "never known her before the party"], w: "had never + третя форма." },
    { k: "y", s: "She was tired because she had been working all day.", ok: true, w: "Тривала дія до моменту в минулому." },
    { k: "y", s: "I realised I have left my bag on the bus.", ok: false, fix: "I realised I had left my bag on the bus.", w: "Залишила раніше — Past Perfect." }
  ],
  usedto: [
    { k: "e", s: "I am used to get up early.", bad: "get", fix: "getting", w: "be used to + -ing." },
    { k: "e", s: "Did you used to live here?", bad: "used", fix: "use", w: "Після did — use to." },
    { k: "o", s: "We used to go camping every summer.", uk: "Раніше ми щоліта їздили в похід.", w: "used to + дієслово." },
    { k: "o", s: "She isn't used to driving in the city.", uk: "Вона не звикла їздити містом.", w: "isn't used to + -ing." },
    { k: "r", s: "I smoked before, but I don't now. (used to)", p: "I ___", a: ["used to smoke"], w: "Колишня звичка — used to." },
    { k: "r", s: "Working at night is normal for me now. (used to)", p: "I'm ___", a: ["used to working at night"], w: "be used to + -ing." },
    { k: "y", s: "When I was a child, I would have a dog.", ok: false, fix: "When I was a child, I used to have a dog.", w: "have (стан) — лише used to." },
    { k: "y", s: "You'll soon get used to the noise.", ok: true, w: "get used to + іменник." }
  ],
  future: [
    { k: "e", s: "Look at those clouds! It will rain.", bad: "will rain", fix: "is going to rain", w: "Видно ознаки — going to." },
    { k: "e", s: "I'll meet my dentist at 3 tomorrow, it's booked.", bad: "I'll meet", fix: "I'm meeting", w: "Домовленість — Present Continuous." },
    { k: "o", s: "What are you going to do tonight?", uk: "Що ти збираєшся робити сьогодні ввечері?", w: "are + you + going to + do." },
    { k: "o", s: "I think it will be sunny tomorrow.", uk: "Думаю, завтра буде сонячно.", w: "I think + will." },
    { k: "r", s: "My plan: visit Kyiv next month. (going to)", p: "I ___", a: ["am going to visit Kyiv next month", "'m going to visit Kyiv next month"], w: "План — going to." },
    { k: "r", s: "Offer to help with the bags. (will)", p: "I ___", a: ["will help you with the bags", "'ll help you with the bags", "will help with the bags", "'ll help with the bags"], w: "Пропозиція — will." },
    { k: "y", s: "The train leaves at 7.30 tomorrow.", ok: true, w: "Розклад — Present Simple." },
    { k: "y", s: "I promise I am not telling anyone.", ok: false, fix: "I promise I won't tell anyone.", w: "Обіцянка — will." }
  ],
  futcont: [
    { k: "e", s: "By June I will finish the course.", bad: "will finish", fix: "will have finished", w: "by June — Future Perfect." },
    { k: "e", s: "At 10 tomorrow I will work.", bad: "will work", fix: "will be working", w: "Процес у момент — Future Continuous." },
    { k: "o", s: "This time tomorrow I'll be lying on the beach.", uk: "Завтра в цей час я лежатиму на пляжі.", w: "will be + -ing." },
    { k: "o", s: "By the time you arrive, we will have eaten.", uk: "Поки ти приїдеш, ми вже поїмо.", w: "will have + третя форма." },
    { k: "r", s: "Ask politely if she needs the car tonight. (Future Continuous)", p: "Will you ___", a: ["be using the car tonight", "be needing the car tonight"], w: "Will you be + -ing — ввічливо." },
    { k: "r", s: "The film starts at 8. We'll arrive at 8.30. (already)", p: "When we arrive, the film ___", a: ["will have already started", "will already have started"], w: "Future Perfect." },
    { k: "y", s: "Don't call at 7 — we'll be having dinner.", ok: true, w: "Процес у момент майбутнього." },
    { k: "y", s: "By 2030 I will be finishing university.", ok: false, fix: "By 2030 I will have finished university.", w: "by — Future Perfect." }
  ],
  modab: [
    { k: "e", s: "I will can help you tomorrow.", bad: "can", fix: "be able to", w: "Майбутнє — will be able to." },
    { k: "e", s: "She can to speak French.", bad: "to", fix: "—", w: "Після can — без to: can speak." },
    { k: "o", s: "I couldn't sleep last night.", uk: "Я не міг заснути вчора вночі.", w: "couldn't + дієслово." },
    { k: "o", s: "Will you be able to come on Friday?", uk: "Ти зможеш прийти в п'ятницю?", w: "Will + you + be able to." },
    { k: "r", s: "Perhaps it will rain later. (might)", p: "It ___", a: ["might rain later"], w: "might + дієслово." },
    { k: "r", s: "I managed to fix the bike yesterday. (was able to)", p: "I ___", a: ["was able to fix the bike yesterday"], w: "Один успіх — was able to." },
    { k: "y", s: "I've never been able to dance.", ok: true, w: "Present Perfect — been able to." },
    { k: "y", s: "He might comes later.", ok: false, fix: "He might come later.", w: "might + базова форма." }
  ],
  modob: [
    { k: "e", s: "You mustn't pay — the museum is free.", bad: "mustn't", fix: "don't have to", w: "Не обов'язково — don't have to." },
    { k: "e", s: "Yesterday I must work late.", bad: "must", fix: "had to", w: "Минуле — had to." },
    { k: "o", s: "Do we have to wear a uniform?", uk: "Нам треба носити форму?", w: "Do + we + have to." },
    { k: "o", s: "You shouldn't eat so late.", uk: "Тобі не варто їсти так пізно.", w: "shouldn't + дієслово." },
    { k: "r", s: "Smoking here is forbidden. (mustn't)", p: "You ___", a: ["mustn't smoke here", "must not smoke here"], w: "Заборона — mustn't." },
    { k: "r", s: "It's necessary for her to work on Saturdays. (has to)", p: "She ___", a: ["has to work on Saturdays"], w: "Обов'язок ззовні — has to." },
    { k: "y", s: "You don't have to come if you're busy.", ok: true, w: "Не обов'язково — правильно." },
    { k: "y", s: "She musts finish it today.", ok: false, fix: "She must finish it today.", w: "must не змінюється: she must." }
  ],
  deduc: [
    { k: "e", s: "He mustn't be at home — his car isn't here.", bad: "mustn't", fix: "can't", w: "Впевненість, що ні — can't." },
    { k: "e", s: "She must forgot about it.", bad: "forgot", fix: "have forgotten", w: "Про минуле — must have + третя форма." },
    { k: "o", s: "You must be very tired after the flight.", uk: "Ти, мабуть, дуже втомилася після перельоту.", w: "must + be." },
    { k: "o", s: "They might have missed the bus.", uk: "Вони, можливо, запізнилися на автобус.", w: "might have + третя форма." },
    { k: "r", s: "I'm sure he isn't at work — it's Sunday. (can't)", p: "He ___", a: ["can't be at work", "cannot be at work"], w: "can't be." },
    { k: "r", s: "I'm sure she saw the message. (must)", p: "She ___", a: ["must have seen the message", "must've seen the message"], w: "must have seen." },
    { k: "y", s: "That can't be true!", ok: true, w: "Впевненість, що ні." },
    { k: "y", s: "He might has left already.", ok: false, fix: "He might have left already.", w: "might have + третя форма." }
  ],
  cond01: [
    { k: "e", s: "If it will rain, we'll stay at home.", bad: "will rain", fix: "rains", w: "Після if — Present Simple." },
    { k: "e", s: "I'll call you when I will arrive.", bad: "will arrive", fix: "arrive", w: "Після when — Present Simple." },
    { k: "o", s: "If you heat ice, it melts.", uk: "Якщо нагріти лід, він тане.", w: "Zero Conditional." },
    { k: "o", s: "We'll be late unless we leave now.", uk: "Ми запізнимося, якщо не вийдемо зараз.", w: "unless = if not." },
    { k: "r", s: "Hurry, or you'll miss the bus. (If you don't…)", p: "If you don't hurry, ___", a: ["you'll miss the bus", "you will miss the bus"], w: "First Conditional: will." },
    { k: "r", s: "If you don't study, you won't pass. (unless)", p: "You won't pass ___", a: ["unless you study"], w: "unless = if not." },
    { k: "y", s: "As soon as I get home, I'll text you.", ok: true, w: "Після as soon as — Present." },
    { k: "y", s: "If you will need help, call me.", ok: false, fix: "If you need help, call me.", w: "Після if — без will." }
  ],
  cond2: [
    { k: "e", s: "If I would have money, I'd buy a car.", bad: "would have", fix: "had", w: "Після if — Past Simple." },
    { k: "e", s: "I wish I can speak Spanish.", bad: "can", fix: "could", w: "wish + could." },
    { k: "o", s: "If I were you, I would apologise.", uk: "На твоєму місці я б вибачилася.", w: "If I were you, I would…" },
    { k: "o", s: "What would you do if you won the lottery?", uk: "Що б ти зробив, якби виграв у лотерею?", w: "would + you + do; if + Past Simple." },
    { k: "r", s: "I don't have a car, so I can't drive to work. (If I had…)", p: "If I had a car, ___", a: ["I would drive to work", "I'd drive to work", "I could drive to work"], w: "would/could + дієслово." },
    { k: "r", s: "I'm sorry I don't live near the sea. (wish)", p: "I wish ___", a: ["I lived near the sea"], w: "wish + Past Simple." },
    { k: "y", s: "If I knew her number, I would call her.", ok: true, w: "Second Conditional — правильно." },
    { k: "y", s: "If I am you, I would go.", ok: false, fix: "If I were you, I would go.", w: "If I were you." }
  ],
  cond3: [
    { k: "e", s: "If I would have known, I would have come.", bad: "would have known", fix: "had known", w: "Після if — Past Perfect." },
    { k: "e", s: "If she had studied, she would pass.", bad: "would pass", fix: "would have passed", w: "would have + третя форма." },
    { k: "o", s: "If we had left earlier, we wouldn't have missed the train.", uk: "Якби ми вийшли раніше, ми б не спізнилися на потяг.", w: "Third Conditional." },
    { k: "o", s: "I wish I hadn't said that.", uk: "Шкода, що я це сказала.", w: "wish + Past Perfect." },
    { k: "r", s: "I didn't know about the party, so I didn't go. (If I had…)", p: "If I had known about the party, ___", a: ["I would have gone", "I'd have gone", "I would've gone"], w: "would have + gone." },
    { k: "r", s: "I'm sorry I didn't buy that jacket. (wish)", p: "I wish ___", a: ["I had bought that jacket", "I'd bought that jacket"], w: "wish + had + третя форма." },
    { k: "y", s: "If he had asked me, I would have helped him.", ok: true, w: "Third Conditional — правильно." },
    { k: "y", s: "I wish I didn't eat so much yesterday.", ok: false, fix: "I wish I hadn't eaten so much yesterday.", w: "Про минуле — had + третя форма." }
  ],
  passive: [
    { k: "e", s: "The letter was wrote yesterday.", bad: "wrote", fix: "written", w: "was + третя форма." },
    { k: "e", s: "The room is cleaning right now.", bad: "is cleaning", fix: "is being cleaned", w: "Процес у пасиві — is being + третя форма." },
    { k: "o", s: "English is spoken all over the world.", uk: "Англійською розмовляють у всьому світі.", w: "is + spoken." },
    { k: "o", s: "My bike has been stolen.", uk: "Мій велосипед вкрали.", w: "has been + третя форма." },
    { k: "r", s: "They built this bridge in 1900.", p: "This bridge ___", a: ["was built in 1900"], w: "Past Simple Passive." },
    { k: "r", s: "Someone will deliver the parcel tomorrow.", p: "The parcel ___", a: ["will be delivered tomorrow"], w: "will be + третя форма." },
    { k: "y", s: "This form must be signed by the manager.", ok: true, w: "must be + третя форма." },
    { k: "y", s: "The car was repair last week.", ok: false, fix: "The car was repaired last week.", w: "was + третя форма." }
  ],
  repst: [
    { k: "e", s: "She said me that she was tired.", bad: "said me", fix: "told me", w: "tell + кому." },
    { k: "e", s: "He said he will call later.", bad: "will", fix: "would", w: "will → would." },
    { k: "o", s: "She told me she was leaving the next day.", uk: "Вона сказала мені, що їде наступного дня.", w: "told me + зсув часу." },
    { k: "o", s: "He said he had lost his keys.", uk: "Він сказав, що загубив ключі.", w: "Past Perfect у непрямій мові." },
    { k: "r", s: "\"I'm hungry,\" Tom said.", p: "Tom said he ___", a: ["was hungry"], w: "am → was." },
    { k: "r", s: "\"We can't come,\" they said.", p: "They said they ___", a: ["couldn't come", "could not come"], w: "can't → couldn't." },
    { k: "y", s: "She said she didn't like the hotel.", ok: true, w: "don't → didn't — правильно." },
    { k: "y", s: "He told that he was busy.", ok: false, fix: "He said that he was busy.", w: "tell потребує кому; без кому — said." }
  ],
  repq: [
    { k: "e", s: "She asked me where did I live.", bad: "did I live", fix: "I lived", w: "Прямий порядок, без did." },
    { k: "e", s: "He told me don't be late.", bad: "don't", fix: "not to", w: "Наказ — not to + дієслово." },
    { k: "o", s: "She asked me if I was ready.", uk: "Вона спитала, чи я готова.", w: "asked + if + прямий порядок." },
    { k: "o", s: "Could you tell me where the station is?", uk: "Не підкажете, де вокзал?", w: "Непряме питання — прямий порядок." },
    { k: "r", s: "\"Where do you work?\" she asked me.", p: "She asked me where ___", a: ["I worked"], w: "Без do, зсув часу." },
    { k: "r", s: "\"Please close the window,\" he said to me.", p: "He asked me ___", a: ["to close the window"], w: "ask + to + дієслово." },
    { k: "y", s: "I wonder what time it is.", ok: true, w: "Прямий порядок — правильно." },
    { k: "y", s: "He asked me what was I doing.", ok: false, fix: "He asked me what I was doing.", w: "Прямий порядок слів." }
  ],
  rel: [
    { k: "e", s: "The man which lives next door is a pilot.", bad: "which", fix: "who", w: "Люди — who." },
    { k: "e", s: "My brother, that lives in Lviv, is a teacher.", bad: "that", fix: "who", w: "Невизначальне з комами — без that." },
    { k: "o", s: "This is the café where we first met.", uk: "Це кафе, де ми вперше зустрілися.", w: "where — місце." },
    { k: "o", s: "I know a girl whose father is a doctor.", uk: "Я знаю дівчину, чий тато лікар.", w: "whose — чий." },
    { k: "r", s: "I bought a phone. It is already broken. (which)", p: "The phone ___", a: ["which i bought is already broken", "that i bought is already broken", "i bought is already broken"], w: "Підрядне з which/that або без нього." },
    { k: "r", s: "She has a friend. The friend speaks Chinese. (who)", p: "She has a friend ___", a: ["who speaks chinese", "that speaks chinese"], w: "who — людина-підмет." },
    { k: "y", s: "The book I'm reading is great.", ok: true, w: "Додаток — слово можна пропустити." },
    { k: "y", s: "The hotel where we stayed in it was nice.", ok: false, fix: "The hotel where we stayed was nice.", w: "where вже означає «в якому»." }
  ],
  gerinf: [
    { k: "e", s: "I enjoy to cook for my friends.", bad: "to cook", fix: "cooking", w: "enjoy + -ing." },
    { k: "e", s: "We decided staying at home.", bad: "staying", fix: "to stay", w: "decide + to." },
    { k: "o", s: "I'm looking forward to seeing you.", uk: "Я з нетерпінням чекаю на зустріч з тобою.", w: "look forward to + -ing." },
    { k: "o", s: "She can't afford to buy a car.", uk: "Вона не може дозволити собі машину.", w: "afford + to." },
    { k: "r", s: "Please don't forget to lock the door. (remember)", p: "Remember ___", a: ["to lock the door"], w: "remember to = не забути." },
    { k: "r", s: "Why don't we take a taxi? (suggest)", p: "She suggested ___", a: ["taking a taxi"], w: "suggest + -ing." },
    { k: "y", s: "Would you mind waiting a minute?", ok: true, w: "mind + -ing." },
    { k: "y", s: "I'm interested in learn Spanish.", ok: false, fix: "I'm interested in learning Spanish.", w: "Після прийменника — -ing." }
  ],
  comp: [
    { k: "e", s: "She is more tall than her brother.", bad: "more tall", fix: "taller", w: "Короткий прикметник — -er." },
    { k: "e", s: "He isn't enough old to drive.", bad: "enough old", fix: "old enough", w: "Прикметник + enough." },
    { k: "o", s: "This is the best pizza in town.", uk: "Це найкраща піца в місті.", w: "the best." },
    { k: "o", s: "My flat isn't as big as yours.", uk: "Моя квартира не така велика, як твоя.", w: "not as … as." },
    { k: "r", s: "The bus is slower than the train. (not as … as)", p: "The bus isn't ___", a: ["as fast as the train", "as quick as the train"], w: "not as + прикметник + as." },
    { k: "r", s: "It's very cold. We can't swim. (too)", p: "It's ___", a: ["too cold to swim"], w: "too + прикметник + to." },
    { k: "y", s: "Today is much hotter than yesterday.", ok: true, w: "much + порівняння." },
    { k: "y", s: "It's the most good film I've seen.", ok: false, fix: "It's the best film I've seen.", w: "good → the best." }
  ],
  art: [
    { k: "e", s: "She is doctor.", bad: "doctor", fix: "a doctor", w: "Професія — a/an." },
    { k: "e", s: "The life is short.", bad: "The", fix: "—", w: "Загальне про незлічуване — без артикля." },
    { k: "o", s: "I go to work by bus.", uk: "Я їжджу на роботу автобусом.", w: "go to work, by bus — без артикля." },
    { k: "o", s: "The sun rises in the east.", uk: "Сонце сходить на сході.", w: "Єдине — the." },
    { k: "r", s: "I bought new car. (додай артикль)", p: "I bought ___", a: ["a new car"], w: "Одна з багатьох, перша згадка — a." },
    { k: "r", s: "She plays guitar. (додай артикль перед guitar)", p: "She plays ___", a: ["the guitar"], w: "Інструменти — the." },
    { k: "y", s: "We had lunch in a small café.", ok: true, w: "Їжа без артикля; одне з багатьох кафе — a." },
    { k: "y", s: "I waited for a hour.", ok: false, fix: "I waited for an hour.", w: "hour — голосний звук, an." }
  ],
  quant: [
    { k: "e", s: "How much people came to the party?", bad: "much", fix: "many", w: "people — злічувані." },
    { k: "e", s: "There are a little apples left.", bad: "a little", fix: "a few", w: "apples — злічувані: a few." },
    { k: "o", s: "There isn't much milk in the fridge.", uk: "У холодильнику мало молока.", w: "much + незлічуване." },
    { k: "o", s: "Would you like some tea?", uk: "Хочеш чаю?", w: "Пропозиція — some." },
    { k: "r", s: "I have some money. (заперечення)", p: "I don't have ___", a: ["any money"], w: "Заперечення — any." },
    { k: "r", s: "There are not many tourists here, but some. (a few)", p: "There are ___", a: ["a few tourists here"], w: "a few + злічувані." },
    { k: "y", s: "We have very little time.", ok: true, w: "little + незлічуване." },
    { k: "y", s: "Have you got some questions?", ok: false, fix: "Have you got any questions?", w: "Звичайне питання — any." }
  ],
  qtags: [
    { k: "e", s: "She likes jazz, isn't it?", bad: "isn't it", fix: "doesn't she", w: "Present Simple, she — doesn't she." },
    { k: "e", s: "Could you tell me where is the bank?", bad: "is the bank", fix: "the bank is", w: "Непряме питання — прямий порядок." },
    { k: "o", s: "You haven't seen my keys, have you?", uk: "Ти ж не бачив моїх ключів?", w: "− речення, + хвостик." },
    { k: "o", s: "Do you know what time it starts?", uk: "Ти не знаєш, о котрій це починається?", w: "Прямий порядок після what time." },
    { k: "r", s: "Where is the toilet? (Could you tell me…)", p: "Could you tell me where ___", a: ["the toilet is"], w: "Прямий порядок." },
    { k: "r", s: "It's a nice day. (додай хвостик)", p: "It's a nice day, ___", a: ["isn't it"], w: "is → isn't it." },
    { k: "y", s: "Let's go, shall we?", ok: true, w: "Let's — shall we." },
    { k: "y", s: "You can swim, can you?", ok: false, fix: "You can swim, can't you?", w: "+ речення — − хвостик." }
  ],
  sosuch: [
    { k: "e", s: "It was so a beautiful day.", bad: "so a", fix: "such a", w: "such a + прикметник + іменник." },
    { k: "e", s: "I came here for learn English.", bad: "for learn", fix: "to learn", w: "Мета — to + дієслово." },
    { k: "o", s: "It was such a good film that I watched it twice.", uk: "Фільм був такий гарний, що я подивилася його двічі.", w: "such a … that." },
    { k: "o", s: "She left early so that she could catch the train.", uk: "Вона пішла раніше, щоб встигнути на потяг.", w: "so that + could." },
    { k: "r", s: "The film was very boring. I fell asleep. (so … that)", p: "The film was so boring ___", a: ["that i fell asleep", "i fell asleep"], w: "so … that." },
    { k: "r", s: "I went to the shop. I wanted to buy milk. (to)", p: "I went to the shop ___", a: ["to buy milk"], w: "Мета — to." },
    { k: "y", s: "They are such nice people.", ok: true, w: "such + прикметник + іменник у множині." },
    { k: "y", s: "It's such cold today.", ok: false, fix: "It's so cold today.", w: "Лише прикметник — so." }
  ]
};
