export const RULE_GROUPS = [
  { id: 'spell', t: 'Правопис' },
  { id: 'words', t: 'Прийменники і сталі вирази' }
];

export const RULES = [
  {
    g: 'words',
    t: 'Прийменник після дієслова чи прикметника',
    p: ['Багато слів вимагають свого прийменника, і його треба вчити разом зі словом. Після прийменника дієслово завжди має закінчення -ing.'],
    ex: ['depend on, rely on, keen on', 'afraid of, think of / about, dream of / about', 'apply for, differ from, cope with', 'I look forward to seeing you. (не «to see»)', 'She is afraid of flying.']
  },
  {
    g: 'words',
    t: 'arrive in, arrive at',
    p: ['arrive in — місто чи країна. arrive at — будівля, станція, подія. Зі словами home, here, there прийменник не потрібен. «arrive to» не кажуть.'],
    ex: ['We arrived in London.', 'The train arrives at the station at five.', 'When did you arrive here?']
  },
  {
    g: 'words',
    t: 'Фразові дієслова: де ставити додаток',
    p: ['У роздільних фразових дієсловах іменник може стояти в середині або в кінці, а займенник (me, it, them) — тільки в середині. Нероздільні не розриваються ніколи.'],
    ex: ['pick up the kids = pick the kids up', 'pick them up (не «pick up them»)', 'write it down, drop me off, see her off', 'нероздільні: look after him, cope with it, keep up with them']
  },
  {
    g: 'spell',
    t: 'Подвоєння приголосної перед -ed, -ing',
    p: ['Якщо коротке слово закінчується на «приголосна + голосна + приголосна» і наголос падає на цей склад, остання літера подвоюється. У британській англійській кінцеве l подвоюється завжди.'],
    ex: ['stop → stopped, plan → planning, run → running', 'prefer → preferred, але visit → visited', 'travel → travelled (US: traveled)']
  },
  {
    g: 'spell',
    t: 'Кінцева -e та -ie перед -ing',
    p: ['Німа -e зникає перед -ing. Якщо слово закінчується на -ee, нічого не зникає. -ie змінюється на -y.'],
    ex: ['make → making, arrive → arriving, drive → driving', 'see → seeing, agree → agreeing', 'lie → lying, die → dying']
  },
  {
    g: 'spell',
    t: 'Кінцева -y',
    p: ['Після приголосної -y змінюється на -ie перед -s та на -i перед -ed. Після голосної -y лишається. Перед -ing -y лишається завжди.'],
    ex: ['study → studies, studied, studying', 'rely → relies, relied, relying', 'play → plays, played; stay → stays, stayed']
  },
  {
    g: 'spell',
    t: 'Множина: -s, -es, -ves',
    p: ['Після s, ss, sh, ch, x додається -es. У частини слів на -f / -fe закінчення змінюється на -ves.'],
    ex: ['bus → buses, watch → watches, box → boxes', 'shelf → shelves, knife → knives, life → lives', 'але: roof → roofs, belief → beliefs']
  },
  {
    g: 'words',
    t: 'make, do, take, have: сталі пари',
    p: ['Ці дієслова не перекладаються дослівно, тож пари треба запам\'ятовувати.'],
    ex: ['make: a decision, a mistake, an arrangement, your way', 'do: homework, business, your best, sth by accident', 'take: a trip, a tour, a route, a holiday, a photo', 'have: an accident, a holiday, a look, lunch']
  },
  {
    g: 'spell',
    t: 'ie чи ei',
    p: ['Зазвичай пишеться ie, але після c — ei. Є винятки, які треба запам\'ятати.'],
    ex: ['believe, field, achieve, friend', 'receive, ceiling, deceive', 'винятки: weird, their, foreign, neighbour']
  },
  {
    g: 'spell',
    t: 'Британське й американське написання',
    p: ['Обидва варіанти правильні, головне не змішувати їх в одному тексті. Словничок приймає тільки той варіант, який записано в картці.'],
    ex: ['recognise / recognize, organise / organize', 'favourite / favorite, colour / color, neighbour / neighbor', 'travelled / traveled, centre / center, cosy / cozy']
  }
];
