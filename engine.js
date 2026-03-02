/* 
    engine.js
    Логика игры, математика и управление интерфейсом.
*/

const GameEngine = {
    state: {
        scenarioId: null,
        roundIdx: 0,
        indicators: {},
        history: { labels: [], usd: [], inflation: [], reserves: [], gdp: [] },
        lagQueue: [],
        flags: {
            isFreeFloat: false,
            capitalControls: false,
            reservesFrozen: false
        },
        score: { hawk: 0, dove: 0, market: 0, statist: 0 }
    },
    chart: null,

    // --- Навигация ---

    startScenario(id) {
        document.getElementById('screen-menu').classList.add('hidden');
        document.getElementById('screen-scenario-end').classList.add('hidden');
        document.getElementById('screen-game').classList.remove('hidden');
        
        this.initChart();
        this.loadScenarioData(id);
    },

    loadScenarioData(id) {
        this.state.scenarioId = id;
        this.state.roundIdx = 0;
        const scenario = GAME_DATA.scenarios[id];
        
        // Инициализация состояния
        this.state.indicators = { ...scenario.initialState };
        this.state.flags = {
            isFreeFloat: scenario.initialState.isFreeFloat || false,
            capitalControls: scenario.initialState.capitalControls || false,
            reservesFrozen: scenario.initialState.reservesFrozen || false
        };
        this.state.lagQueue = [];
        this.state.score = { hawk: 0, dove: 0, market: 0, statist: 0 };
        
        // Сброс истории
        this.state.history = { labels: [], usd: [], inflation: [], reserves: [], gdp: [] };

        // UI
        document.getElementById('scenario-title').innerText = scenario.title;
        document.getElementById('alert-box').classList.add('hidden');
        
        this.startRound();
    },

    // --- Игровой цикл ---

    startRound() {
        const scenario = GAME_DATA.scenarios[this.state.scenarioId];
        // Проверка на конец игры
        if (this.state.roundIdx >= scenario.rounds.length) {
            this.endScenario();
            return;
        }

        const round = scenario.rounds[this.state.roundIdx];

        // 1. Применение шоков сценария
        this.applyShocks(round.shocks);

        // 2. Пассивное сжигание резервов (если кризис и курс фиксирован)
        if (round.passiveDrain && !this.state.flags.isFreeFloat && !this.state.flags.capitalControls) {
            this.state.indicators.reserves -= round.passiveDrain;
            this.state.indicators.usd += round.passiveDrain * 0.1; // Небольшое давление на курс
        }

        // 3. Логика "Нейтральной ставки" (накопительный эффект)
        this.applyNeutralRateLogic();

        // 4. Обработка лагов от прошлых решений
        this.processLagQueue();

        // 5. Проверка триггеров (исчерпание резервов)
        this.checkTriggers();

        // 6. Обновление UI
        this.updateDashboard();
        this.updateChart(round.date);
        this.renderBriefing(round);
        this.renderDecisions(round);

        document.getElementById('round-num').innerText = `${this.state.roundIdx + 1}/${scenario.roundsTotal}`;
    },

    applyShocks(shocks) {
        if (!shocks) return;
        const i = this.state.indicators;
        
        // Если включены Capital Controls, шок на курс действует слабее
        let usdShock = shocks.usd || 0;
        if (this.state.flags.capitalControls && usdShock > 0) usdShock *= 0.2;

        i.inflation += shocks.inflation || 0;
        i.usd += usdShock;
        i.gdp += shocks.gdp || 0;
    },

    applyNeutralRateLogic() {
        const i = this.state.indicators;
        // Нейтральная ставка грубо = Инфляция + 2%
        // Если ставка выше -> давим инфляцию, давим ВВП
        // Если ставка ниже -> разгоняем инфляцию, разгоняем ВВП
        
        const realRate = i.rate - i.inflation;
        const neutralRealRate = 2.0; 
        const diff = realRate - neutralRealRate;

        // Эффект накапливается каждый раунд
        if (Math.abs(diff) > 0.5) {
            i.inflation -= diff * 0.1; // Жесткая ставка снижает инфляцию
            i.gdp -= diff * 0.05;      // И тормозит ВВП
            i.usd -= diff * 0.2;       // И укрепляет рубль (carry trade)
        }
    },

    processLagQueue() {
        const newQueue = [];
        this.state.lagQueue.forEach(item => {
            item.roundsLeft--;
            if (item.roundsLeft <= 0) {
                const i = this.state.indicators;
                if (item.effect.inflation) i.inflation += item.effect.inflation;
                if (item.effect.usd) i.usd += item.effect.usd;
                if (item.effect.gdp) i.gdp += item.effect.gdp;
            } else {
                newQueue.push(item);
            }
        });
        this.state.lagQueue = newQueue;
    },

    checkTriggers() {
        const i = this.state.indicators;
        const alertBox = document.getElementById('alert-box');
        
        // Исчерпание резервов
        if (i.reserves < 10 && !this.state.flags.isFreeFloat) {
            this.state.flags.isFreeFloat = true;
            alertBox.innerText = "⚠ РЕЗЕРВЫ ИСЧЕРПАНЫ! ЦБ вынужден отпустить курс рубля.";
            alertBox.classList.remove('hidden');
            i.usd += 15; // Резкий обвал при принудительном переходе
            i.inflation += 2;
        }
        
        // Ограничители
        if (i.inflation < 0.1) i.inflation = 0.1;
        if (i.reserves < 0) i.reserves = 0;
        if (i.rate < 0) i.rate = 0;
    },

    // --- Решения ---

    makeDecision(key) {
        const d = GAME_DATA.decisions[key];
        const i = this.state.indicators;
        let comment = "";
        let changes = { inf: 0, usd: 0, res: 0, gdp: 0 };

        // 1. Ставка
        if (d.type === "rate") {
            const oldRate = i.rate;
            i.rate += d.val;
            
            // Профиль
            if (d.val > 0) this.state.score.hawk++;
            if (d.val < 0) this.state.score.dove++;

            // Эффекты (с лагом)
            const delta = d.val;
            this.state.lagQueue.push({ roundsLeft: 1, effect: { usd: -delta * 1.2 } });
            this.state.lagQueue.push({ roundsLeft: 2, effect: { inflation: -delta * 0.3 } });
            this.state.lagQueue.push({ roundsLeft: 3, effect: { gdp: -delta * 0.15 } });

            if (delta === 0) {
                comment = `Ставка сохранена (${i.rate}%). Текущая денежно-кредитная политика продолжает действовать на экономику.`;
            } else {
                comment = `Ставка ${delta > 0 ? "повышена" : "снижена"} до ${i.rate}%. Это повлияет на инфляцию через 2 месяца.`;
            }
        }

        // 2. Валютные интервенции
        else if (d.type === "fx") {
            const vol = d.val; // <0 продажа, >0 покупка
            i.reserves += vol;
            this.state.score.statist++;

            // Эффект мгновенный, но зависит от FreeFloat
            let multiplier = 0.5;
            if (this.state.flags.isFreeFloat) multiplier = 0.8; // На тонком рынке влияние сильнее
            
            const kursChange = vol * multiplier; 
            i.usd += kursChange;
            
            changes.usd = kursChange;
            changes.res = vol;
            comment = `Интервенция на $${Math.abs(vol)} млрд. Курс скорректирован.`;
        }

        // 3. Спец. действия
        else if (d.type === "special") {
            if (d.effect === "float") {
                this.state.flags.isFreeFloat = true;
                this.state.score.market += 2;
                comment = "Рубль в свободном плавании. Резервы больше не тратятся, но курс может скакать.";
            }
            else if (d.effect === "cap_on") {
                this.state.flags.capitalControls = true;
                this.state.score.statist += 2;
                i.usd -= 15; // Резкое укрепление
                i.gdp -= 1.5; // Удар по бизнесу
                changes.usd = -15;
                comment = "Введены жесткие ограничения. Курс искусственно укреплен, но инвестиции остановлены.";
            }
            else if (d.effect === "cap_off") {
                this.state.flags.capitalControls = false;
                this.state.score.market += 1;
                i.usd += 5; // Откат
                i.gdp += 0.5;
                comment = "Ограничения сняты. Рынок вздохнул свободно.";
            }
            else if (d.effect === "print") {
                i.gdp += 0.8;
                this.state.lagQueue.push({ roundsLeft: 1, effect: { inflation: 1.5, usd: 3.0 } });
                this.state.score.dove += 2;
                comment = "Денежная эмиссия поддержала ВВП, но ждите скачка инфляции.";
            }
        }
        
        // Вербальные
        else if (d.type === "verbal") {
            i.usd -= d.val * 0.5;
            comment = "Рынок услышал сигнал ЦБ. Курс немного скорректировался на ожиданиях.";
        }

        this.showRoundResult(comment, changes);
    },

    // --- UI Рендеринг ---

    updateDashboard() {
        const i = this.state.indicators;
        const setVal = (id, val, suffix="") => {
            const el = document.getElementById(id);
            el.innerText = val.toFixed(1) + suffix;
            el.className = "dash-val mono";
            
            if (id === "val-inf") {
                if (val > 8) el.classList.add("color-red");
                else if (val >= 3.5 && val <= 4.5) el.classList.add("color-green");
                else el.classList.add("color-yellow");
            }
            if (id === "val-res" && val < 100) el.classList.add("color-red");
        };

        setVal("val-usd", i.usd);
        setVal("val-inf", i.inflation, "%");
        document.getElementById("val-rate").innerText = i.rate.toFixed(2) + "%";
        setVal("val-res", i.reserves);
        setVal("val-gdp", i.gdp, "%");
    },

    renderBriefing(round) {
        document.getElementById('briefing-title').innerText = round.date;
        document.getElementById('briefing-text').innerText = round.briefing;
        
        const pBox = document.getElementById('pressure-box');
        if (round.pressure) {
            pBox.classList.remove('hidden');
            document.getElementById('pressure-text').innerText = round.pressure;
        } else {
            pBox.classList.add('hidden');
        }

        const mBox = document.getElementById('myth-moment-box');
        if (round.mythMoment) mBox.classList.remove('hidden');
        else mBox.classList.add('hidden');
        
        // Проверка заморозки (для алерта в 2022)
        if (round.frozenReserves) {
             this.state.flags.reservesFrozen = true;
             const alert = document.getElementById('alert-box');
             alert.innerText = "⛔ РЕЗЕРВЫ ЗАМОРОЖЕНЫ! Интервенции невозможны.";
             alert.classList.remove('hidden');
        }
    },

    renderDecisions(round) {
        const container = document.getElementById('decisions-container');
        container.innerHTML = '';
        
        round.choices.forEach(key => {
            const d = GAME_DATA.decisions[key];
            if (!d) return;

            const btn = document.createElement('button');
            btn.className = "decision-btn";
            if (key.includes('emergency') || key === 'free_float') btn.classList.add('danger');
            
            // Логика блокировки кнопок
            let disabled = false;
            
            // Если резервы заморожены (2022) -> нельзя продавать
            if (this.state.flags.reservesFrozen && d.type === 'fx' && d.val < 0) disabled = true;
            
            // Если резервы кончились -> нельзя продавать
            if (this.state.indicators.reserves < 5 && d.type === 'fx' && d.val < 0) disabled = true;

            // Если уже FreeFloat -> кнопка FreeFloat не нужна (или неактивна)
            if (key === 'free_float' && this.state.flags.isFreeFloat) disabled = true;

            // Тумблер Capital Controls
            if (key === 'capital_controls' && this.state.flags.capitalControls) {
                // Если уже включено, не показываем кнопку включения (сценарий должен дать кнопку выключения)
                disabled = true; 
            }

            if (disabled) btn.disabled = true;
            
            btn.innerHTML = `<strong>${d.text}</strong><span>${d.desc}</span>`;
            btn.onclick = () => this.makeDecision(key);
            container.appendChild(btn);
        });
    },

    showRoundResult(comment, changes) {
        const screen = document.getElementById('screen-round-result');
        document.getElementById('result-comment').innerText = comment;
        
        const fmt = (val, suffix="") => (val > 0 ? "+" : "") + val.toFixed(1) + suffix;
        
        document.getElementById('res-inf').innerText = changes.inf ? fmt(changes.inf, "%") : "—";
        document.getElementById('res-usd').innerText = changes.usd ? fmt(changes.usd) : "—";
        document.getElementById('res-res').innerText = changes.res ? fmt(changes.res, " млрд") : "—";
        document.getElementById('res-gdp').innerText = "с лагом";

        screen.classList.remove('hidden');
    },

    nextRound() {
        document.getElementById('screen-round-result').classList.add('hidden');
        this.state.roundIdx++;
        this.startRound();
    },

    endScenario() {
        document.getElementById('screen-game').classList.add('hidden');
        document.getElementById('screen-scenario-end').classList.remove('hidden');
        
        const scenario = GAME_DATA.scenarios[this.state.scenarioId];
        
        // Определение профиля
        const s = this.state.score;
        let profile = "Прагматик";
        if (s.hawk > s.dove && s.hawk > 3) profile = "Ястреб (Жесткий борец с инфляцией)";
        else if (s.dove > s.hawk && s.dove > 3) profile = "Голубь (Сторонник роста ВВП)";
        else if (s.statist > s.market) profile = "Государственник (Любитель контроля)";
        else if (s.market > s.statist) profile = "Рыночник (Либерал)";

        document.getElementById('end-verdict').innerText = `Ваш профиль: ${profile}`;
        document.getElementById('real-history').innerText = scenario.final.realHistory;
        document.getElementById('myth-debunk').innerText = scenario.final.mythDebunk;
    },

    // --- График ---
    initChart() {
        if (this.chart) this.chart.destroy();
        const ctx = document.getElementById('mainChart').getContext('2d');
        Chart.defaults.color = '#5a7090';
        Chart.defaults.font.family = 'IBM Plex Mono';
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Показатель',
                    data: [],
                    borderColor: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Цель 4%',
                    data: [],
                    borderColor: '#39ff6e',
                    borderDash: [5, 5],
                    borderWidth: 1,
                    pointRadius: 0,
                    hidden: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' } }
                },
                animation: false // Отключаем анимацию для быстродействия
            }
        });
    },

    updateChart(label) {
        this.state.history.labels.push(label);
        this.state.history.usd.push(this.state.indicators.usd);
        this.state.history.inflation.push(this.state.indicators.inflation);
        this.state.history.reserves.push(this.state.indicators.reserves);
        this.state.history.gdp.push(this.state.indicators.gdp);

        if (this.state.roundIdx === 0) this.switchChart('usd');
        else this.renderChartData();
    },

    currentChartMode: 'usd',

    switchChart(mode) {
        this.currentChartMode = mode;
        document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
        const btnMap = { 'usd': 0, 'inflation': 1, 'reserves': 2, 'gdp': 3 };
        document.querySelectorAll('.chart-btn')[btnMap[mode]].classList.add('active');
        this.renderChartData();
    },

    renderChartData() {
        if (!this.chart) return;
        const h = this.state.history;
        this.chart.data.labels = h.labels;
        let ds = this.chart.data.datasets[0];
        let target = this.chart.data.datasets[1];
        
        target.hidden = true;

        if (this.currentChartMode === 'usd') {
            ds.data = h.usd;
            ds.borderColor = '#00e5ff';
            ds.backgroundColor = 'rgba(0, 229, 255, 0.1)';
        } else if (this.currentChartMode === 'inflation') {
            ds.data = h.inflation;
            ds.borderColor = '#ff4d6d';
            ds.backgroundColor = 'rgba(255, 77, 109, 0.1)';
            target.hidden = false;
            target.data = new Array(h.labels.length).fill(4);
        } else if (this.currentChartMode === 'reserves') {
            ds.data = h.reserves;
            ds.borderColor = '#ffd166';
            ds.backgroundColor = 'rgba(255, 209, 102, 0.1)';
        } else if (this.currentChartMode === 'gdp') {
            ds.data = h.gdp;
            ds.borderColor = '#39ff6e';
            ds.backgroundColor = 'rgba(57, 255, 110, 0.1)';
        }
        this.chart.update();
    },

    // --- Модалка ---
    showEducation() { document.getElementById('modal-education').classList.remove('hidden'); },
    hideEducation() { document.getElementById('modal-education').classList.add('hidden'); }
};