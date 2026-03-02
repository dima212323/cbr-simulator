/* 
    gameData.js
    База данных: Сценарии, События, Решения.
    Версия 2.0 (С обучением, кризисами и мобильным балансом)
*/

const GAME_DATA = {
    scenarios: {
        "2019": {
            id: "2019",
            title: "Тонкая настройка (2019)",
            roundsTotal: 10,
            initialState: {
                usd: 67.0,
                inflation: 5.0, // Выше цели из-за НДС
                rate: 7.75,
                reserves: 468,
                gdp: 1.5,
                oil: 60,
                isFreeFloat: true,
                capitalControls: false
            },
            rounds: [
                {
                    date: "Январь 2019",
                    briefing: "🎓 ОБУЧЕНИЕ: Инфляция 5.0% (цель 4%). Цены растут из-за налогов.\n\nСОВЕТ: Чтобы сбить цены, деньги должны стать «дороже». Попробуй сохранить высокую ставку или даже поднять её.",
                    shocks: { inflation: 0.1, usd: 0, gdp: 0 },
                    choices: ["raise025", "hold", "cut025", "verbal_hawkish"]
                },
                {
                    date: "Март 2019",
                    briefing: "🎓 ОБУЧЕНИЕ: Инфляция остановилась. Рубль стабилен.\n\nСОВЕТ: Резкие движения сейчас не нужны. Можно просто наблюдать (Сохранить ставку) или дать сигнал рынку словами.",
                    shocks: { inflation: 0, usd: -1.0, gdp: 0 },
                    choices: ["hold", "cut025", "verbal_dovish", "intervention_buy"]
                },
                {
                    date: "Май 2019",
                    briefing: "Инфляция замедляется быстрее прогноза. Есть риск, что экономика слишком охладится. Пора думать о снижении ставки.",
                    shocks: { inflation: -0.2, usd: -0.5, gdp: 0.1 },
                    choices: ["cut025", "cut050", "hold", "intervention_buy"]
                },
                {
                    date: "Июль 2019",
                    briefing: "ФРС США снижает ставку. Это дает нам пространство для маневра. Можно снижать смелее, чтобы поддержать ВВП.",
                    shocks: { inflation: -0.1, usd: -0.5, gdp: 0 },
                    choices: ["cut025", "cut050", "hold", "verbal_dovish"]
                },
                {
                    date: "Август 2019",
                    briefing: "Торговая война США и Китая. Нефть падает. Рубль слабеет. Бизнес жалуется на дорогие кредиты.",
                    shocks: { inflation: 0.1, usd: 2.0, gdp: -0.1 },
                    pressure: "Бизнес: «Ставка слишком высокая, нам не на что развиваться!»",
                    choices: ["hold", "cut025", "verbal_hawkish", "intervention_sell"]
                },
                {
                    date: "Сентябрь 2019",
                    briefing: "Инфляция упала до 4.0%. Мы у цели! Но экономика растет вяло (+0.9%). Нужно искать баланс.",
                    shocks: { inflation: -0.1, usd: 0.5, gdp: 0 },
                    choices: ["cut025", "cut050", "hold", "verbal_dovish"]
                },
                {
                    date: "Октябрь 2019",
                    briefing: "Инфляция 3.8% (ниже цели). Реальная ставка (Ставка минус Инфляция) слишком высока. Это душит спрос.",
                    shocks: { inflation: -0.2, usd: 0, gdp: 0 },
                    choices: ["cut050", "cut025", "hold", "verbal_dovish"]
                },
                {
                    date: "Ноябрь 2019",
                    briefing: "Конец года. Инфляция 3.5%. Мы рискуем 'пережать' экономику. Нужно стимулировать спрос дешевыми деньгами.",
                    shocks: { inflation: -0.2, usd: -0.5, gdp: 0.1 },
                    choices: ["cut050", "cut025", "hold", "intervention_buy"]
                },
                {
                    date: "Декабрь 2019",
                    briefing: "Финальное заседание. Подводим итоги года. Инфляция низкая, курс стабилен.",
                    shocks: { inflation: -0.1, usd: 0, gdp: 0.1 },
                    choices: ["cut025", "hold", "verbal_dovish", "intervention_buy"]
                },
                {
                    date: "Итоги 2019",
                    briefing: "Год завершен. Сравним ваши результаты с историей.",
                    shocks: { inflation: 0, usd: 0, gdp: 0 },
                    choices: ["hold", "hold", "hold", "hold"]
                }
            ],
            final: {
                realHistory: "В 2019 году ЦБ снизил ставку с 7.75% до 6.25%. Инфляция составила 3.0% (ниже цели), ВВП вырос на 1.3%.",
                mythDebunk: "Вы увидели, что ЦБ снижал ставку не по приказу правительства, а потому что инфляция падала. Это называется 'Таргетирование инфляции'."
            }
        },

        "2014": {
            id: "2014",
            title: "Нефтяной крах (2014)",
            roundsTotal: 12,
            initialState: {
                usd: 35.0,
                inflation: 6.5,
                rate: 7.5,
                reserves: 510,
                gdp: 0.6,
                oil: 105,
                isFreeFloat: false, // Валютный коридор
                capitalControls: false
            },
            rounds: [
                {
                    date: "Январь 2014",
                    briefing: "Нефть $105. Всё спокойно. ЦБ держит курс в валютном коридоре, продавая понемногу валюту.",
                    shocks: { inflation: 0, usd: 0.5, gdp: 0 },
                    passiveDrain: 2, // Пассивный отток резервов
                    choices: ["hold", "raise025", "intervention_sell", "verbal_hawkish"]
                },
                {
                    date: "Март 2014",
                    briefing: "Крымская весна. Первые санкции. Рынок нервничает. Капитал начинает утекать.",
                    shocks: { inflation: 0.2, usd: 2.0, gdp: -0.1 },
                    passiveDrain: 10,
                    choices: ["raise100", "intervention_sell", "hold", "verbal_hawkish"]
                },
                {
                    date: "Июнь 2014",
                    briefing: "Затишье. Нефть всё еще высокая ($110). Но инфляция растет из-за ослабления рубля.",
                    shocks: { inflation: 0.1, usd: 0.5, gdp: 0 },
                    passiveDrain: 5,
                    choices: ["hold", "raise050", "intervention_sell", "verbal_hawkish"]
                },
                {
                    date: "Сентябрь 2014",
                    briefing: "Рынок падает. Нефть рухнула до $90. Санкции закрыли доступ к кредитам. Рубль под ударом.",
                    shocks: { inflation: 0.3, usd: 3.0, gdp: -0.2 },
                    passiveDrain: 15,
                    urgent: true, // Красная панель
                    pressure: "Рынок: «ЦБ должен держать курс 38 любой ценой!»",
                    choices: ["intervention_sell_large", "raise050", "free_float", "hold"]
                },
                {
                    date: "Октябрь 2014",
                    briefing: "Нефть $85. Мы тратим по $2-3 млрд в день (!) на удержание курса. Резервы тают на глазах.",
                    shocks: { inflation: 0.5, usd: 4.0, gdp: -0.3 },
                    passiveDrain: 30, // Огромный отток
                    mythMoment: true,
                    choices: ["intervention_sell_large", "raise100", "free_float", "verbal_hawkish"]
                },
                {
                    date: "Ноябрь 2014",
                    briefing: "Нефть $75. Спекулянты атакуют рубль, зная, что мы продаем валюту. Либо сдаемся (Free Float), либо теряем резервы.",
                    shocks: { inflation: 0.8, usd: 5.0, gdp: -0.4 },
                    passiveDrain: 30,
                    choices: ["free_float", "intervention_sell_large", "raise100", "capital_controls"]
                },
                {
                    date: "Декабрь 2014 (начало)",
                    briefing: "Нефть $60. Паника. Население штурмует обменники. Курс летит в космос.",
                    shocks: { inflation: 1.0, usd: 10.0, gdp: -0.5 },
                    passiveDrain: 20,
                    urgent: true,
                    choices: ["raise100", "raise200", "intervention_sell", "verbal_hawkish"]
                },
                {
                    date: "16 Декабря 2014",
                    briefing: "«ЧЕРНЫЙ ВТОРНИК». Курс на бирже достигал 80. Нужны экстренные меры, иначе банковская система рухнет.",
                    shocks: { inflation: 2.0, usd: 15.0, gdp: -1.0 },
                    passiveDrain: 10,
                    urgent: true,
                    choices: ["raise_emergency", "capital_controls", "intervention_sell_large", "hold"]
                },
                {
                    date: "Январь 2015",
                    briefing: "После шокового повышения ставки ситуация стабилизируется. Рубль откатился к 65. Инфляция 12%.",
                    shocks: { inflation: 1.5, usd: -5.0, gdp: -0.5 },
                    passiveDrain: 5,
                    choices: ["hold", "cut100", "verbal_hawkish", "intervention_buy"]
                },
                {
                    date: "Март 2015",
                    briefing: "Экономика привыкает к новой реальности. Ставка 17% слишком высока для бизнеса, пора снижать.",
                    shocks: { inflation: 0.5, usd: -2.0, gdp: 0.1 },
                    passiveDrain: 0,
                    choices: ["cut100", "cut200", "hold", "intervention_buy"]
                },
                {
                    date: "Июнь 2015",
                    briefing: "Инфляция замедляется. Мы прошли пик кризиса. Резервы сохранены (если вы их не сожгли).",
                    shocks: { inflation: -0.2, usd: 0, gdp: 0.2 },
                    choices: ["cut100", "cut050", "hold", "intervention_buy"]
                },
                {
                    date: "Финал 2015",
                    briefing: "Подводим итоги. Это был тяжелейший кризис.",
                    shocks: { inflation: 0, usd: 0, gdp: 0 },
                    choices: ["hold", "hold", "hold", "hold"]
                }
            ],
            final: {
                realHistory: "В 2014 году ЦБ отпустил рубль в свободное плавание (спас резервы) и поднял ставку до 17% (сбил панику). Это позволило экономике адаптироваться.",
                mythDebunk: "Миф разрушен: попытка держать курс 'по приказу' привела бы к полному исчерпанию резервов и дефолту страны."
            }
        },

        "2022": {
            id: "2022",
            title: "Санкционный шторм (2022)",
            roundsTotal: 12,
            initialState: {
                usd: 75.0,
                inflation: 8.4,
                rate: 9.5,
                reserves: 630,
                gdp: 4.7,
                oil: 90,
                isFreeFloat: true,
                capitalControls: false,
                reservesFrozen: false
            },
            rounds: [
                {
                    date: "Февраль 2022 (конец)",
                    briefing: "САНКЦИИ. Половина резервов ЦБ ($300 млрд) заморожена Западом. Интервенции невозможны. Курс 100+. Банкоматы пустеют.",
                    shocks: { inflation: 2.0, usd: 30.0, gdp: -2.0 },
                    frozenReserves: true, // Блокировка кнопки продажи валюты
                    urgent: true,
                    choices: ["raise_emergency_20", "capital_controls", "verbal_hawkish", "hold"]
                },
                {
                    date: "Март 2022",
                    briefing: "Ставка 20% остановила набег на банки. Но курс всё еще нестабилен. Экспортеры не продают валюту.",
                    shocks: { inflation: 5.0, usd: 10.0, gdp: -3.0 },
                    choices: ["capital_controls", "hold", "verbal_hawkish", "print_money"]
                },
                {
                    date: "Апрель 2022",
                    briefing: "Жесткие ограничения (комиссия 12%, запрет вывода) работают. Импорт обвалился, валюта не тратится. Рубль начал укрепляться.",
                    shocks: { inflation: 2.0, usd: -20.0, gdp: -1.0 },
                    choices: ["cut200", "cut100", "hold", "capital_controls_off"]
                },
                {
                    date: "Май 2022",
                    briefing: "ПАРАДОКС. Рубль слишком крепкий (60)! Это убивает бюджет. Инфляция остановилась.",
                    shocks: { inflation: 0, usd: -10.0, gdp: -0.5 },
                    pressure: "Минфин: «Нам нужен курс 70-80, иначе нечем платить пенсии!»",
                    choices: ["cut300", "capital_controls_off", "hold", "print_money"]
                },
                {
                    date: "Июнь 2022",
                    briefing: "Дефляция! Цены падают. Ставка 14% всё еще высока. Нужно срочно смягчать условия.",
                    shocks: { inflation: -0.5, usd: -5.0, gdp: -0.5 },
                    choices: ["cut300", "cut100", "capital_controls_off", "verbal_dovish"]
                },
                {
                    date: "Август 2022",
                    briefing: "Ситуация выравнивается. Курс 60. Ставка 8%. Экономика падает меньше, чем ожидали.",
                    shocks: { inflation: -0.1, usd: 2.0, gdp: 0.2 },
                    choices: ["cut050", "hold", "verbal_dovish", "intervention_buy"]
                },
                {
                    date: "Сентябрь 2022",
                    briefing: "Частичная мобилизация. Новая волна тревожности. Отток денег населения.",
                    shocks: { inflation: 0.2, usd: 3.0, gdp: -0.2 },
                    urgent: true,
                    choices: ["hold", "verbal_hawkish", "intervention_sell", "print_money"]
                },
                {
                    date: "Ноябрь 2022",
                    briefing: "Инфляция около 12% (год к году). Бюджетный дефицит растет.",
                    shocks: { inflation: 0.1, usd: 1.0, gdp: 0 },
                    choices: ["hold", "raise050", "intervention_sell", "verbal_hawkish"]
                },
                {
                    date: "Декабрь 2022",
                    briefing: "Потолок цен на нефть. Риски для экспорта. Рубль начинает слабеть к 70.",
                    shocks: { inflation: 0.2, usd: 5.0, gdp: -0.1 },
                    choices: ["hold", "raise050", "verbal_hawkish", "intervention_sell"]
                },
                {
                    date: "Финал 2022",
                    briefing: "Мы пережили шторм. Спад ВВП всего 2.1% (прогноз был 10%). Финансовая система устояла.",
                    shocks: { inflation: 0, usd: 0, gdp: 0 },
                    choices: ["hold", "hold", "hold", "hold"]
                }
            ],
            final: {
                realHistory: "ЦБ поднял ставку до 20%, ввел жесткие валютные ограничения, а затем быстро снизил ставку до 7.5%. Это спасло банки и не дало раскрутиться спирали инфляции.",
                mythDebunk: "В 2022 году ЦБ показал чудеса эквилибристики: сначала задушил панику жесткостью, а потом спас экономику мягкостью."
            }
        }
    },

    decisions: {
        "hold": { text: "Сохранить ставку", type: "rate", val: 0, desc: "Оставить всё как есть." },
        
        "raise025": { text: "Повысить ставку +0.25%", type: "rate", val: 0.25, desc: "Легкое охлаждение." },
        "raise050": { text: "Повысить ставку +0.50%", type: "rate", val: 0.50, desc: "Сигнал рынку." },
        "raise100": { text: "Повысить ставку +1.00%", type: "rate", val: 1.00, desc: "Борьба с инфляцией." },
        "raise200": { text: "Повысить ставку +2.00%", type: "rate", val: 2.00, desc: "Жесткая мера." },
        "raise_emergency": { text: "ЭКСТРЕННО: до 17%", type: "rate", val: 9.5, desc: "Остановить панику." },
        "raise_emergency_20": { text: "ЭКСТРЕННО: до 20%", type: "rate", val: 10.5, desc: "Спасти банки." },
        
        "cut025": { text: "Снизить ставку -0.25%", type: "rate", val: -0.25, desc: "Поддержка роста." },
        "cut050": { text: "Снизить ставку -0.50%", type: "rate", val: -0.50, desc: "Стимул для ВВП." },
        "cut100": { text: "Снизить ставку -1.00%", type: "rate", val: -1.00, desc: "Активное смягчение." },
        "cut200": { text: "Снизить ставку -2.00%", type: "rate", val: -2.00, desc: "Быстрый возврат." },
        "cut300": { text: "Снизить ставку -3.00%", type: "rate", val: -3.00, desc: "Агрессивное смягчение." },

        "intervention_sell": { text: "Продать валюту ($2 млрд)", type: "fx", val: -2, desc: "Поддержать рубль." },
        "intervention_sell_large": { text: "Продать валюту ($10 млрд)", type: "fx", val: -10, desc: "Удержать курс силой." },
        "intervention_buy": { text: "Купить валюту ($2 млрд)", type: "fx", val: 2, desc: "Пополнить резервы." },
        
        "free_float": { text: "Отпустить рубль", type: "special", effect: "float", desc: "Сберечь резервы." },
        "capital_controls": { text: "Запрет на вывод валюты", type: "special", effect: "cap_on", desc: "Остановить отток." },
        "capital_controls_off": { text: "Снять ограничения", type: "special", effect: "cap_off", desc: "Вернуть свободу." },
        "print_money": { text: "Печать денег (QE)", type: "special", effect: "print", desc: "Рост ВВП ценой инфляции." },

        "verbal_hawkish": { text: "Жесткая риторика", type: "verbal", val: 1, desc: "Пообещать повышение." },
        "verbal_dovish": { text: "Мягкая риторика", type: "verbal", val: -1, desc: "Пообещать поддержку." }
    }
};