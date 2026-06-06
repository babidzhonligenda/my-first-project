const checkRules = [
    {
        phrase: "дипломная работа",
        type: "Стилистическая ошибка",
        explanation: "В академической среде рекомендуется использовать термин 'выпускная квалификационная работа' (ВКР).",
        replacement: "выпускная квалификационная работа"
    },
    {
        phrase: "цель достигнута",
        type: "Канцелярит / Штамп",
        explanation: "Звучит как констатация факта без аналитического подтекста. Лучше использовать более строгие формулировки.",
        replacement: "поставленная цель реализована / задачи исследования выполнены"
    },
    {
        phrase: "научная новизна",
        type: "Штамп",
        explanation: "Часто используется избыточно. Убедитесь, что далее следует конкретное описание того, что именно является новым.",
        replacement: "авторский вклад заключается в... / впервые предложено..."
    },
    {
        phrase: "уникальный вклад",
        type: "Субъективная оценка",
        explanation: "Слово 'уникальный' несет эмоциональную окраску, нежелательную в научном тексте.",
        replacement: "значимый вклад / теоретическая значимость"
    },
    {
        phrase: "в настоящее время",
        type: "Лишние слова",
        explanation: "Часто является 'водой'. Можно заменить на более конкретное указание времени или опустить.",
        replacement: "сегодня / в текущих условиях / (удалить)"
    },
    {
        phrase: "очень актуально",
        type: "Усилительное наречие",
        explanation: "В научном стиле следует избегать эмоционально-усилительных слов типа 'очень'.",
        replacement: "представляет особый интерес / характеризуется высокой значимостью"
    },
    {
        phrase: "в современном мире",
        type: "Клише",
        explanation: "Слишком широкая и неопределенная фраза. Лучше конкретизировать область.",
        replacement: "в современных социально-экономических условиях / в условиях цифровизации"
    },
    {
        phrase: "данная работа",
        type: "Указательное местоимение",
        explanation: "Частое повторение 'данный' считается признаком плохого стиля. Лучше заменять на 'настоящий', 'представленный' или перефразировать.",
        replacement: "настоящее исследование / проводимый анализ"
    },
    {
        phrase: "я считаю",
        type: "Субъективность",
        explanation: "В российской научной традиции принято использовать 'мы' (авторское мы) или безличные конструкции.",
        replacement: "по нашему мнению / представляется, что..."
    },
    {
        phrase: "мне кажется",
        type: "Неуверенность / Субъективность",
        explanation: "Слишком разговорная и неуверенная форма для научного труда.",
        replacement: "можно предположить / анализ позволяет сделать вывод"
    },
    {
        phrase: "искусственный интеллект",
        type: "Терминологическая точность",
        explanation: "Часто используется как общий термин. В научной работе стоит уточнять, о каких именно методах (машинное обучение, нейросети) идет речь.",
        replacement: "технологии машинного обучения / алгоритмы ИИ"
    },
    {
        phrase: "играет огромную роль",
        type: "Метафора / Преувеличение",
        explanation: "Избегайте художественных метафор и эмоциональных преувеличений.",
        replacement: "имеет существенное значение / определяет вектор развития"
    },
    {
        phrase: "имеет большое значение",
        type: "Штамп",
        explanation: "Слишком общая фраза. Желательно уточнить, какое именно значение.",
        replacement: "является определяющим фактором / вносит вклад в..."
    },
    {
        phrase: "на сегодняшний день",
        type: "Канцелярит",
        explanation: "Избыточная конструкция. Можно заменить более лаконичным вариантом.",
        replacement: "в настоящее время / сегодня"
    },
    {
        phrase: "было доказано",
        type: "Безличность / Требует ссылки",
        explanation: "Если это доказано не вами, необходима ссылка на источник. Если вами — лучше описать процесс.",
        replacement: "в ходе исследования установлено / подтверждено результатами"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const checkButton = document.getElementById('checkButton');
    const resultsSection = document.getElementById('resultsSection');
    const totalIssues = document.getElementById('totalIssues');
    const issuesList = document.getElementById('issuesList');

    checkButton.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            alert('Пожалуйста, введите текст для проверки.');
            return;
        }

        const issues = checkText(text);
        displayResults(issues);
    });

    function checkText(text) {
        let issues = [];
        const lowerText = text.toLowerCase();

        // Проверка фраз
        checkRules.forEach(rule => {
            let index = lowerText.indexOf(rule.phrase.toLowerCase());
            while (index !== -1) {
                issues.push({
                    found: text.substr(index, rule.phrase.length),
                    ...rule
                });
                index = lowerText.indexOf(rule.phrase.toLowerCase(), index + 1);
            }
        });

        // Проверка повторов слов
        const repetitions = checkRepetitions(text);
        issues = issues.concat(repetitions);

        return issues;
    }

    function checkRepetitions(text) {
        const words = text.toLowerCase()
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/);

        const wordCounts = {};
        const stopWords = ['и', 'в', 'во', 'не', 'на', 'с', 'по', 'что', 'как', 'из', 'к', 'о', 'об', 'для', 'от', 'за', 'при', 'бы', 'же', 'то', 'а', 'но', 'да', 'или'];

        words.forEach(word => {
            if (word.length > 3 && !stopWords.includes(word)) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });

        const repetitions = [];
        for (const word in wordCounts) {
            if (wordCounts[word] > 3) { // Порог повторов - 4 и более раз
                repetitions.push({
                    found: word,
                    type: "Частый повтор",
                    explanation: `Слово "${word}" встречается ${wordCounts[word]} раз. Частые повторы перегружают текст.`,
                    replacement: "используйте синонимы или перефразируйте предложение",
                    isRepetition: true
                });
            }
        }
        return repetitions;
    }

    function displayResults(issues) {
        issuesList.innerHTML = '';
        resultsSection.classList.remove('hidden');
        totalIssues.textContent = `Найдено замечаний: ${issues.length}`;

        if (issues.length === 0) {
            const noIssues = document.createElement('p');
            noIssues.textContent = 'Замечаний не найдено. Ваш текст выглядит отлично!';
            issuesList.appendChild(noIssues);
            return;
        }

        issues.forEach(issue => {
            const card = document.createElement('div');
            card.className = `issue-card ${issue.isRepetition ? 'repetition' : ''}`;

            const title = document.createElement('h3');
            title.textContent = `Найдено: "${issue.found}"`;
            card.appendChild(title);

            const typeP = document.createElement('p');
            typeP.innerHTML = `<span class="issue-label">Тип:</span> ${issue.type}`;
            card.appendChild(typeP);

            const explanationP = document.createElement('p');
            explanationP.innerHTML = `<span class="issue-label">Почему это плохо:</span> ${issue.explanation}`;
            card.appendChild(explanationP);

            const replacementP = document.createElement('p');
            replacementP.innerHTML = `<span class="issue-label">Рекомендация:</span> <span class="issue-replacement">${issue.replacement}</span>`;
            card.appendChild(replacementP);

            issuesList.appendChild(card);
        });

        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
});
