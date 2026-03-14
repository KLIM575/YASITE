/**
 * script.js — скрипты личного сайта
 * Плавный скролл, реакция фона на курсор, блок «Мои навыки»
 */

// Плавный скролл при клике на CTA «Мои навыки»
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Реакция фона на курсор: передаём позицию мыши в CSS-переменные
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  function setMousePosition(x, y) {
    hero.style.setProperty('--mouse-x', x);
    hero.style.setProperty('--mouse-y', y);
  }

  hero.addEventListener('mousemove', function (e) {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition(x, y);
  });

  hero.addEventListener('mouseleave', function () {
    setMousePosition(0.5, 0.5);
  });
})();

// ========== Блок «Мои навыки» ==========

const SKILLS_STORAGE_KEY = 'my-site-skills';

/** Список навыков: массив { id, title, description } */
let skillsList = [];

/**
 * Загружает навыки из localStorage.
 */
function loadSkills() {
  try {
    const raw = localStorage.getItem(SKILLS_STORAGE_KEY);
    if (raw) {
      skillsList = JSON.parse(raw);
      skillsList.forEach(function (s) {
        if (s.learned === undefined) s.learned = false;
      });
    } else {
      skillsList = [];
    }
  } catch (e) {
    skillsList = [];
  }
}

/**
 * Сохраняет навыки в localStorage.
 */
function saveSkills() {
  localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skillsList));
}

/**
 * Экранирует HTML, чтобы вставить текст в разметку без XSS.
 */
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Отрисовывает карточки навыков в #skills-grid.
 */
function renderSkills() {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;

  grid.innerHTML = skillsList
    .map(
      (skill) =>
        '<div class="skills__card' +
        (skill.learned ? ' skills__card--learned' : '') +
        '" data-id="' +
        skill.id +
        '" tabindex="0" role="button">' +
        '<div class="skills__card-header">' +
        '<h3 class="skills__card-title">' +
        escapeHtml(skill.title) +
        '</h3>' +
        '<div class="skills__card-actions">' +
        '<button type="button" class="skills__card-done' +
        (skill.learned ? ' skills__card-done--active' : '') +
        '" aria-label="' +
        (skill.learned ? 'Отметить как не изученный' : 'Отметить как изученный') +
        '">✓</button>' +
        '<button type="button" class="skills__card-delete" aria-label="Удалить навык">×</button>' +
        '</div>' +
        '</div>' +
        '<p class="skills__card-desc">' +
        escapeHtml(skill.description) +
        '</p>' +
        '</div>'
    )
    .join('');

  grid.querySelectorAll('.skills__card').forEach(function (card) {
    card.addEventListener('click', function (e) {
      if (e.target.closest('.skills__card-delete') || e.target.closest('.skills__card-done')) return;
      card.classList.toggle('skills__card--expanded');
    });
    card.addEventListener('keydown', function (e) {
      if (e.target.closest('.skills__card-delete') || e.target.closest('.skills__card-done')) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('skills__card--expanded');
      }
    });

    var doneBtn = card.querySelector('.skills__card-done');
    if (doneBtn) {
      doneBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var id = Number(card.dataset.id);
        var skill = skillsList.find(function (s) {
          return s.id === id;
        });
        if (skill) {
          skill.learned = !skill.learned;
          saveSkills();
          renderSkills();
        }
      });
    }

    var deleteBtn = card.querySelector('.skills__card-delete');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var ok = confirm('Удалить этот навык? Вы уверены?');
        if (!ok) return;
        var id = Number(card.dataset.id);
        skillsList = skillsList.filter(function (s) {
          return s.id !== id;
        });
        saveSkills();
        renderSkills();
      });
    }
  });
}

/**
 * Добавляет новый навык: запрашивает название и описание через prompt, сохраняет и перерисовывает.
 */
function addSkill() {
  var title = prompt('Название навыка:');
  if (title === null || title.trim() === '') return;

  var description = prompt('Краткое описание:');
  var desc = description === null ? '' : description.trim();

  skillsList.push({
    id: Date.now(),
    title: title.trim(),
    description: desc,
    learned: false
  });

  saveSkills();
  renderSkills();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function () {
  loadSkills();
  renderSkills();

  var addBtn = document.querySelector('.skills__add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', addSkill);
  }

  initSkillIndex();
});

// ========== Блок «Мой индекс навыков» ==========

var INDEX_STORAGE_KEY = 'my-site-skill-index';

var INDEX_IDS = ['html', 'css', 'js', 'react', 'llm'];

var INDEX_LABELS = {
  html: 'HTML',
  css: 'CSS',
  js: 'JS',
  react: 'React/Vue',
  llm: 'LLM/Нейросети'
};

var INDEX_DESCRIPTIONS = [
  { min: 0, max: 25, text: 'Начинающий, верный старт' },
  { min: 26, max: 50, text: 'Прогрессируешь, держи темп' },
  { min: 51, max: 75, text: 'Уверенно растёшь, почти junior' },
  { min: 76, max: 100, text: 'Сильная база — готов к портфолио' }
];

function getIndexDescription(percent) {
  var p = Math.round(percent);
  for (var i = 0; i < INDEX_DESCRIPTIONS.length; i++) {
    var d = INDEX_DESCRIPTIONS[i];
    if (p >= d.min && p <= d.max) return d.text;
  }
  return INDEX_DESCRIPTIONS[0].text;
}

function loadIndexValues() {
  try {
    var raw = localStorage.getItem(INDEX_STORAGE_KEY);
    if (raw) {
      var data = JSON.parse(raw);
      return {
        html: clamp(data.html, 0, 100),
        css: clamp(data.css, 0, 100),
        js: clamp(data.js, 0, 100),
        react: clamp(data.react, 0, 100),
        llm: clamp(data.llm, 0, 100)
      };
    }
  } catch (e) {}
  return { html: 0, css: 0, js: 0, react: 0, llm: 0 };
}

function clamp(num, min, max) {
  return Math.min(max, Math.max(min, Number(num) || 0));
}

function saveIndexValues(values) {
  try {
    localStorage.setItem(INDEX_STORAGE_KEY, JSON.stringify(values));
  } catch (e) {}
}

function updateIndexUI(values) {
  INDEX_IDS.forEach(function (id) {
    var input = document.getElementById('index-' + id);
    var output = document.getElementById('output-' + id);
    if (input && output) {
      input.value = values[id];
      input.setAttribute('aria-valuenow', values[id]);
      output.textContent = values[id];
    }
  });

  var sum = values.html + values.css + values.js + values.react + values.llm;
  var average = Math.round(sum / 5);
  var fill = document.getElementById('index-gauge-fill');
  var percentEl = document.getElementById('index-percent');
  var descEl = document.getElementById('index-desc');

  if (fill) fill.style.width = average + '%';
  if (percentEl) percentEl.textContent = average;
  if (descEl) descEl.textContent = getIndexDescription(average);
}

function initSkillIndex() {
  var values = loadIndexValues();
  updateIndexUI(values);

  INDEX_IDS.forEach(function (id) {
    var input = document.getElementById('index-' + id);
    if (!input) return;
    input.addEventListener('input', function () {
      values[id] = clamp(Number(input.value), 0, 100);
      saveIndexValues(values);
      updateIndexUI(values);
    });
  });
}
