document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const checkButton = document.getElementById('checkButton');
    const clearButton = document.getElementById('clearButton');
    const resultsArea = document.getElementById('resultsArea');
    const resultsList = document.getElementById('resultsList');
    const totalCountSpan = document.getElementById('totalCount');
    const summaryStats = document.getElementById('summaryStats');
    const mostFrequentProblem = document.getElementById('mostFrequentProblem');

    const CATEGORIES = {
        'undesirable': 'Нежелательные формулировки',
        'weak-style': 'Слабый научный стиль',
        'risky': 'Рискованные утверждения',
        'repetition': 'Повторы слов',
        'colloquial': 'Разговорные выражения'
    };

    // Helper to create regex with Cyrillic-safe boundaries
    const createRegex = (phrase) => {
        // Escapes special characters and adds lookarounds to ensure whole word/phrase matching
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return new RegExp(`(?<![а-яёА-ЯЁ])${escaped}(?![а-яёА-ЯЁ])`, 'gi');
    };

    const checkRules = [
        // Undesirable formulations
        { pattern: createRegex("дипломная работа"), label: "дипломная работа", category: "undesirable", type: "Штамп", reason: "В тексте работы лучше использовать 'данная работа' или 'настоящее исследование' (хотя и это следует ограничивать).", replacement: "настоящее исследование / работа" },
        { pattern: createRegex("в данной работе"), label: "в данной работе", category: "undesirable", type: "Штамп", reason: "Избыточная конструкция. Лучше использовать 'в исследовании' или 'в статье'.", replacement: "в настоящем исследовании / в рамках работы" },
        { pattern: createRegex("данная работа"), label: "данная работа", category: "undesirable", type: "Указательное местоимение", reason: "Частое повторение 'данный' считается признаком плохого стиля.", replacement: "настоящее исследование / проводимый анализ" },
        { pattern: createRegex("цель достигнута"), label: "цель достигнута", category: "undesirable", type: "Канцелярит", reason: "Звучит как констатация факта без аналитического подтекста.", replacement: "поставленная цель реализована / задачи исследования выполнены" },
        { pattern: createRegex("задачи выполнены"), label: "задачи выполнены", category: "undesirable", type: "Штамп", reason: "Слишком формальная и пустая фраза.", replacement: "задачи исследования решены / цели достигнуты" },

        // Weak scientific style
        { pattern: createRegex("очень актуально"), label: "очень актуально", category: "weak-style", type: "Усилительное наречие", reason: "В научном стиле следует избегать слова 'очень'.", replacement: "характеризуется высокой значимостью" },
        { pattern: createRegex("очень важно"), label: "очень важно", category: "weak-style", type: "Усилительное наречие", reason: "Избегайте эмоционально-усилительных слов. Важность должна следовать из аргументации.", replacement: "представляет значительный интерес / имеет принципиальное значение" },
        { pattern: createRegex("крайне актуально"), label: "крайне актуально", category: "weak-style", type: "Гипербола", reason: "Избыточное усиление актуальности.", replacement: "представляет особый научно-практический интерес" },
        { pattern: createRegex("в настоящее время"), label: "в настоящее время", category: "weak-style", type: "Клише", reason: "Лишние слова, не несущие конкретики.", replacement: "сегодня / в текущих условиях" },
        { pattern: createRegex("в современном мире"), label: "в современном мире", category: "weak-style", type: "Клише", reason: "Слишком широкая и неопределенная фраза.", replacement: "в современных социально-экономических условиях" },
        { pattern: createRegex("на сегодняшний день"), label: "на сегодняшний день", category: "weak-style", type: "Канцелярит", reason: "Избыточная конструкция.", replacement: "в настоящее время / сейчас" },
        { pattern: createRegex("играет огромную роль"), label: "играет огромную роль", category: "weak-style", type: "Метафора", reason: "Избегайте художественных метафор и преувеличений.", replacement: "имеет существенное значение / определяет вектор развития" },
        { pattern: createRegex("имеет большое значение"), label: "имеет большое значение", category: "weak-style", type: "Клише", reason: "Фраза часто является избыточной. Попробуйте более конкретные формулировки.", replacement: "является определяющим фактором / играет важную роль" },

        // Risky statements
        { pattern: createRegex("научная новизна"), label: "научная новизна", category: "risky", type: "Рискованное утверждение", reason: "Требует очень веских доказательств. Убедитесь в уникальности результатов.", replacement: "авторский вклад заключается в... / впервые предложено..." },
        { pattern: createRegex("уникальный вклад"), label: "уникальный вклад", category: "risky", type: "Рискованное утверждение", reason: "Излишне самоуверенное заявление. В науке лучше использовать более скромные формулировки.", replacement: "результаты расширяют представление о... / предложенный подход позволяет..." },
        { pattern: createRegex("было доказано"), label: "было доказано", category: "risky", type: "Избыточная уверенность", reason: "Если это не математическая теорема, лучше использовать более мягкие формы.", replacement: "полученные данные подтверждают / результаты позволяют сделать вывод" },
        { pattern: createRegex("полностью доказано"), label: "полностью доказано", category: "risky", type: "Избыточная уверенность", reason: "Научное знание часто носит вероятностный характер.", replacement: "результаты позволяют сделать вывод о..." },
        { pattern: createRegex("безусловно"), label: "безусловно", category: "risky", type: "Наречие уверенности", reason: "Избегайте слов, закрывающих дискуссию.", replacement: "можно утверждать, что... / с высокой долей вероятности" },
        { pattern: createRegex("неоспоримо"), label: "неоспоримо", category: "risky", type: "Безапелляционность", reason: "Любое научное утверждение может быть оспорено.", replacement: "представляется очевидным, что... / анализ показывает" },

        // Colloquial expressions
        { pattern: createRegex("я считаю"), label: "я считаю", category: "colloquial", type: "Субъективность", reason: "Используйте 'мы' или безличные конструкции.", replacement: "по нашему мнению / представляется, что..." },
        { pattern: createRegex("мне кажется"), label: "мне кажется", category: "colloquial", type: "Неуверенность", reason: "Слишком разговорная форма.", replacement: "можно предположить / анализ позволяет сделать вывод" },
        { pattern: createRegex("по моему мнению"), label: "по моему мнению", category: "colloquial", type: "Субъективность", reason: "Лучше заменить на более формальные аналоги.", replacement: "с нашей точки зрения / на наш взгляд" },
        { pattern: createRegex("искусственный интеллект"), label: "искусственный интеллект", category: "colloquial", type: "Общий термин", reason: "Слишком широкое понятие. В научной работе лучше уточнять (Мл, нейронные сети и т.д.).", replacement: "методы машинного обучения / нейросетевые модели" },
        { pattern: createRegex("как бы"), label: "как бы", category: "colloquial", type: "Слово-паразит", reason: "Недопустимо в письменной научной речи.", replacement: "(удалить)" },
        { pattern: createRegex("ну"), label: "ну", category: "colloquial", type: "Междометие", reason: "Разговорная частица.", replacement: "(удалить)" },
        { pattern: createRegex("вообще"), label: "вообще", category: "colloquial", type: "Разговорное слово", reason: "Слишком неопределенное и разговорное слово.", replacement: "в целом / в общем смысле" }
    ];

    function checkText() {
        const text = textInput.value;
        if (!text.trim()) {
            alert('Пожалуйста, вставьте текст для проверки.');
            return;
        }

        const issues = [];
        const stats = {};
        Object.keys(CATEGORIES).forEach(cat => stats[cat] = 0);

        // 1. Check predefined rules
        checkRules.forEach(rule => {
            let match;
            // Reset regex index for safety
            rule.pattern.lastIndex = 0;
            while ((match = rule.pattern.exec(text)) !== null) {
                issues.push({
                    ...rule,
                    found: match[0],
                    index: match.index
                });
                stats[rule.category]++;
            }
        });

        // 2. Check for word repetitions
        const words = text.toLowerCase().match(/[а-яёa-z]{4,}/g) || [];
        const wordCounts = {};
        words.forEach(word => {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        });

        for (const [word, count] of Object.entries(wordCounts)) {
            if (count >= 3) {
                issues.push({
                    label: word,
                    category: 'repetition',
                    type: 'Частый повтор',
                    reason: `Слово "${word}" встречается ${count} раз. Частые повторы перегружают текст.`,
                    replacement: 'используйте синонимы или перефразируйте предложение',
                    found: word
                });
                stats['repetition']++;
            }
        }

        displayResults(issues, stats);
    }

    function displayResults(issues, stats) {
        resultsList.innerHTML = '';
        totalCountSpan.textContent = issues.length;

        if (issues.length === 0) {
            resultsList.innerHTML = '<p class="no-issues">Замечаний не найдено. Ваш текст выглядит отлично!</p>';
            renderSummary(stats, null);
        } else {
            // Sort issues by appearance in text (if index available)
            issues.sort((a, b) => (a.index || 0) - (b.index || 0));

            issues.forEach(issue => {
                const card = document.createElement('div');
                card.className = `card category-${issue.category}`;

                const title = document.createElement('h3');
                title.textContent = `Найдено: "${issue.label}"`;
                card.appendChild(title);

                const details = [
                    { label: 'Категория', value: CATEGORIES[issue.category] },
                    { label: 'Тип', value: issue.type },
                    { label: 'Почему это плохо', value: issue.reason },
                    { label: 'Рекомендация', value: issue.replacement, isHighlight: true }
                ];

                details.forEach(detail => {
                    const p = document.createElement('p');
                    const b = document.createElement('b');
                    b.textContent = `${detail.label}: `;
                    p.appendChild(b);

                    if (detail.isHighlight) {
                        const span = document.createElement('span');
                        span.className = 'replacement';
                        span.textContent = detail.value;
                        p.appendChild(span);
                    } else {
                        const textNode = document.createTextNode(detail.value);
                        p.appendChild(textNode);
                    }
                    card.appendChild(p);
                });

                resultsList.appendChild(card);
            });

            // Calculate most frequent problem
            const frequencyMap = {};
            issues.forEach(i => {
                frequencyMap[i.label] = (frequencyMap[i.label] || 0) + 1;
            });
            const mostFreq = Object.entries(frequencyMap).sort((a, b) => b[1] - a[1])[0];

            renderSummary(stats, mostFreq);
        }

        resultsArea.classList.remove('hidden');
        resultsArea.scrollIntoView({ behavior: 'smooth' });
    }

    function renderSummary(stats, mostFreq) {
        summaryStats.innerHTML = '';
        Object.entries(stats).forEach(([cat, count]) => {
            const div = document.createElement('div');
            div.className = 'summary-item';
            div.innerHTML = `<span>${CATEGORIES[cat]}:</span> <strong>${count}</strong>`;
            summaryStats.appendChild(div);
        });

        if (mostFreq) {
            mostFrequentProblem.textContent = `${mostFreq[0]} (${mostFreq[1]} раз)`;
        } else {
            mostFrequentProblem.textContent = '—';
        }
    }

    function clearText() {
        textInput.value = '';
        resultsArea.classList.add('hidden');
        resultsList.innerHTML = '';
        totalCountSpan.textContent = '0';
    }

    checkButton.addEventListener('click', checkText);
    clearButton.addEventListener('click', clearText);
});
