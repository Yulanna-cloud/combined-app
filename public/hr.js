const HR = (function() {
// ── Default prompts ───────────────────────────────────────────────
const DEFAULT_PROMPTS = {
  resume: `РОЛЬ

Ты — опытный рекрутер.

Твоя задача — помочь принять решение по кандидату после просмотра резюме.

Не проводи глубокий assessment. Не строй DISC-профили. Не анализируй мышление. Не анализируй масштаб проектов. Не анализируй компании, где работал кандидат. Не пересказывай резюме.

Мне нужен вывод для рекрутера, а не аналитический отчет.

{VACANCY}

ГЛАВНЫЙ ВОПРОС: стоит ли связываться с кандидатом, есть ли критические риски, что нужно уточнить в первом звонке.

ФОРМАТ ОТВЕТА

РЕШЕНИЕ
Выбери только один вариант:
🟢 Приоритет — звонить первым, подходит хорошо
🟡 Звонить, но сначала уточнить один важный момент
🔴 Не рассматривать
Причина: не более 2 предложений.

СООТВЕТСТВИЕ ВАКАНСИИ
Оценка: X/10

СИЛЬНЫЕ СТОРОНЫ
Максимум 5 пунктов. Только короткие формулировки. Без пояснений.

РИСКИ
Максимум 5 пунктов. Только короткие формулировки. Только риски, которые реально влияют на решение. Без пояснений.

ВОПРОСЫ ДЛЯ ПЕРВОГО ЗВОНКА
Максимум 3 вопроса. Только вопросы, ответы на которые могут изменить решение. Если вопросов нет — так и напиши.

ВОПРОСЫ ДЛЯ СКРИНИНГА В ЧАТ HH
Заполняй ТОЛЬКО если решение 🟡 или если кандидат на границе 🔴 — то есть когда резюме не даёт полной картины, но опыт потенциально может быть релевантным.
Напиши 3-6 коротких вопросов которые можно отправить кандидату в чат HH до звонка. Вопросы должны быть конкретными — про конкретные функции, документы, инструменты. Формат: готовый текст сообщения который можно скопировать и отправить.
Если кандидат явно подходит (🟢) или явно не подходит (🔴 без сомнений) — этот блок пропусти.

ИТОГ
Одна строка: Рекомендуется / Не рекомендуется к дальнейшему рассмотрению.

ОГРАНИЧЕНИЯ
Максимум 200 слов. Не объясняй выводы. Не доказывай выводы. Не используй таблицы и длинные абзацы. Если кандидат явно подходит или явно не подходит — ответ должен быть ещё короче.`,

  questions: `# РОЛЬ

Ты — Senior Recruiter, Assessment Interviewer и Executive Search Consultant.

Твоя задача — построить интервью не по шаблону, а под конкретного кандидата.

У тебя есть:
* вакансия и её описание;
* информация о компании;
* комментарии рекрутера;
* резюме кандидата;
* предыдущий анализ кандидата.

{VACANCY}

Используй все эти данные одновременно.

---

# ГЛАВНОЕ ПРАВИЛО

Не составляй универсальные HR-вопросы.

Каждый вопрос должен проверять конкретную гипотезу, возникшую после анализа резюме.

Если вопрос не проверяет гипотезу — он не нужен.

---

# ЗАДАЧА

Построй структуру интервью именно под данного кандидата.

Цель интервью:
* подтвердить сильные стороны;
* проверить риски;
* проверить реальные компетенции;
* проверить глубину опыта;
* проверить самостоятельность;
* проверить масштаб ответственности;
* проверить совместимость с компанией.

---

# ФОРМАТ ОТВЕТА

## БЛОК 1. ОБЩАЯ СТРАТЕГИЯ ИНТЕРВЬЮ

Опиши: какой тип кандидата перед нами; какие основные риски необходимо проверить; какие сильные стороны требуют подтверждения; на что интервьюеру нужно обратить особое внимание.

## БЛОК 2. КЛЮЧЕВЫЕ ГИПОТЕЗЫ

Для каждой гипотезы укажи: гипотеза; почему возникла; каким вопросом проверяется; какой ответ будет сильным; какой ответ будет тревожным.

## БЛОК 3. СТРУКТУРА ИНТЕРВЬЮ

Сформируй интервью по этапам. Для каждого этапа: цель этапа; вопросы; что проверяет каждый вопрос; признаки сильного ответа; признаки слабого ответа.

## БЛОК 4. ВОПРОСЫ НА ГЛУБИНУ ОПЫТА

Составь вопросы, которые невозможно пройти общими словами. Вопросы должны заставлять кандидата раскрывать: реальные действия; реальные решения; реальные ошибки; реальные результаты.

## БЛОК 5. ВОПРОСЫ НА САМОСТОЯТЕЛЬНОСТЬ

Проверь: принимал ли решения сам; был ли лидером процесса; работал ли под контролем; мог ли решать проблемы без руководителя.

## БЛОК 6. ВОПРОСЫ НА МАСШТАБ

Проверь: бюджеты; количество объектов; численность участников; объем документации; количество подрядчиков; ответственность за результат.

## БЛОК 7. ВОПРОСЫ НА СОВМЕСТИМОСТЬ С КОМПАНИЕЙ

Проверь: отношение к давлению; отношение к контролю; отношение к конфликтам; отношение к ответственности; отношение к руководителям.

## БЛОК 8. КРАСНЫЕ ФЛАГИ

Перечисли: какие ответы должны насторожить; какие ответы могут говорить о завышении опыта; какие ответы могут говорить о зависимости от руководителя; какие ответы могут говорить о недостатке компетенции.

---

# ТРЕБОВАНИЯ

Не ограничивайся стандартными вопросами.

Копай в реальные действия кандидата.

Проверяй мышление, а не заученные ответы.

Проверяй не знания терминов, а способность применять опыт на практике.

Если резюме содержит слабые места — интервью должно быть построено вокруг их проверки.`,

  interview: `Ты опытный HR-аналитик. Разбираешь прошедшее интервью.

{VACANCY}

Структура разбора:

1. ОБЩЕЕ ВПЕЧАТЛЕНИЕ — подтвердились ли гипотезы из анализа резюме

2. СИЛЬНЫЕ СТОРОНЫ — что кандидат продемонстрировал хорошо

3. ТРЕВОЖНЫЕ СИГНАЛЫ — что насторожило, противоречия, уклончивые ответы

4. МОТИВАЦИЯ — что реально движет кандидатом (между строк)

5. УТОЧНЁННЫЙ DISC — профиль после интервью

6. РЕКОМЕНДАЦИЯ — оффер / следующий этап / отказ + чёткое обоснование

7. ОБРАТНАЯ СВЯЗЬ ПО ИНТЕРВЬЮЕРУ — что хорошо сработало, какие вопросы можно было задать иначе

Пиши конкретно, давай практические выводы.`
};

// ── State ─────────────────────────────────────────────────────────
let state = {
  apiKey: '',
  model: 'claude-sonnet-4-6',
  crmUrl: 'https://yulanna-cloud.github.io/crm/',
  vacancies: [],
  currentVacancyId: null,
  candidates: [],
  currentCandidateId: null,
  prompts: { ...DEFAULT_PROMPTS }
};

function save() { try { localStorage.setItem('hr_eps_v2', JSON.stringify(state)); } catch(e) {} }
function load() {
  try {
    const s = localStorage.getItem('hr_eps_v2');
    if (s) { const p = JSON.parse(s); state = { ...state, ...p }; if (!state.prompts) state.prompts = { ...DEFAULT_PROMPTS }; }
    const old = localStorage.getItem('hr_eps_v1');
    if (old && !s) {
      const p = JSON.parse(old);
      if (p.vacancy && p.vacancy.title) {
        const vid = 'v_' + Date.now();
        state.vacancies.push({ id: vid, ...p.vacancy });
        state.currentVacancyId = vid;
        state.apiKey = p.apiKey || '';
        state.candidates = (p.candidates || []).map(c => ({ ...c, vacancyId: vid }));
        save();
      }
    }
  } catch(e) {}
  applyLoaded();
}

function applyLoaded() {
  if (state.apiKey) document.getElementById('api-key').value = state.apiKey;
  if (state.model) document.getElementById('model-select').value = state.model;
  if (state.crmUrl) document.getElementById('crm-url').value = state.crmUrl;
  document.getElementById('prompt-resume').value = state.prompts.resume;
  document.getElementById('prompt-questions').value = state.prompts.questions;
  document.getElementById('prompt-interview').value = state.prompts.interview;
  renderVacancySelect();
  renderCandidates();
  if (state.vacancies.length === 0) { showPanel('vacancy'); document.getElementById('main-title').textContent = 'Создай первую вакансию'; }
}

// ── Toast ─────────────────────────────────────────────────────────
function toast(msg) {
  const el = document.getElementById('toast');
  el.innerHTML = `<i class="ti ti-check"></i> ${msg}`;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2200);
}

// ── PDF ───────────────────────────────────────────────────────────
function loadPDFJS() {
  return new Promise((resolve, reject) => {
    if (typeof pdfjsLib !== 'undefined') { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    s.onload = () => { pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; resolve(); };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function setPdfArea(status, text, sub) {
  const area = document.getElementById('pdf-area');
  area.className = 'pdf-upload-area' + (status ? ' ' + status : '');
  area.innerHTML = `<input type="file" id="pdf-input" accept=".pdf" style="display:none" onchange="HR.onFileSelected(event)">
<span class="pdf-icon">${status === 'loaded' ? '✅' : status === 'error' ? '⚠️' : '📄'}</span>
<p><strong>${text}</strong></p>
<p style="font-size:11px;color:var(--text3);margin-top:5px;">${sub}</p>`;
}

function extractNameFromText(text) {
  const first500 = text.substring(0, 600);
  const match = first500.match(/([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё]+)\s+([А-ЯЁ][а-яё]+)/);
  return match ? match[0] : '';
}

function extractPhoneFromText(text) {
  const m = text.match(/(?:\+7|8)[\s\-\(\)]*(\d{3})[\s\-\(\)]*(\d{3})[\s\-\(\)]*(\d{2})[\s\-\(\)]*(\d{2})/);
  if (m) return '+7' + m[1] + m[2] + m[3] + m[4];
  return '';
}

async function parsePDF(file) {
  setPdfArea('', '⏳ Читаю PDF...', 'Подожди секунду');
  try {
    await loadPDFJS();
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      text += tc.items.map(x => x.str).join(' ') + '\n';
    }
    const name = extractNameFromText(text);
    const phone = extractPhoneFromText(text);
    if (name) document.getElementById('c-name').value = name;
    document.getElementById('c-resume').value = text.trim();
    let subText = '';
    if (name && phone) subText = `${name} · ${phone}`;
    else if (name) subText = `Имя: ${name} · Телефон не найден`;
    else subText = 'Имя и телефон не найдены — заполни вручную';
    setPdfArea('loaded', file.name, subText);
  } catch(e) {
    setPdfArea('error', 'Ошибка чтения PDF', 'Вставь текст резюме вручную');
  }
}

function onFileSelected(e) { const f = e.target.files[0]; if (f) parsePDF(f); }
function onDragOver(e) { e.preventDefault(); document.getElementById('pdf-area').classList.add('dragging'); }
function onDragLeave(e) { document.getElementById('pdf-area').classList.remove('dragging'); }
function onDrop(e) { e.preventDefault(); document.getElementById('pdf-area').classList.remove('dragging'); const f = e.dataTransfer.files[0]; if (f && f.type === 'application/pdf') parsePDF(f); }

// ── Vacancies ─────────────────────────────────────────────────────
function renderVacancySelect() {
  const sel = document.getElementById('vacancy-select');
  sel.innerHTML = '<option value="">— Выбери вакансию —</option>';
  state.vacancies.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.id; opt.textContent = v.title;
    if (v.id === state.currentVacancyId) opt.selected = true;
    sel.appendChild(opt);
  });
}

function currentVacancy() { return state.vacancies.find(v => v.id === state.currentVacancyId); }

function onVacancyChange() {
  const id = document.getElementById('vacancy-select').value;
  state.currentVacancyId = id || null;
  save(); renderCandidates();
  if (id) { fillVacancyForm(); showPanel('vacancy'); }
}

function fillVacancyForm() {
  const v = currentVacancy(); if (!v) return;
  document.getElementById('v-title').value = v.title || '';
  document.getElementById('v-desc').value = v.desc || '';
  document.getElementById('v-company').value = v.company || '';
  document.getElementById('v-notes').value = v.notes || '';
}

function saveVacancy() {
  const title = document.getElementById('v-title').value.trim();
  if (!title) { alert('Укажи название вакансии'); return; }
  if (state.currentVacancyId) {
    const v = currentVacancy();
    if (v) { v.title = title; v.desc = document.getElementById('v-desc').value; v.company = document.getElementById('v-company').value; v.notes = document.getElementById('v-notes').value; }
  } else {
    const id = 'v_' + Date.now();
    state.vacancies.push({ id, title, desc: document.getElementById('v-desc').value, company: document.getElementById('v-company').value, notes: document.getElementById('v-notes').value });
    state.currentVacancyId = id;
  }
  save(); renderVacancySelect(); renderCandidates(); toast('Вакансия сохранена');
}

function newVacancy() {
  document.getElementById('modal-vac-name').value = '';
  document.getElementById('modal-new-vacancy').classList.add('open');
  setTimeout(() => document.getElementById('modal-vac-name').focus(), 100);
}

function createVacancy() {
  const name = document.getElementById('modal-vac-name').value.trim();
  if (!name) { alert('Введи название'); return; }
  const id = 'v_' + Date.now();
  state.vacancies.push({ id, title: name, desc: '', company: '', notes: '' });
  state.currentVacancyId = id;
  save(); closeModal(); renderVacancySelect(); fillVacancyForm();
  showPanel('vacancy'); document.getElementById('main-title').textContent = 'Вакансия: ' + name;
  renderCandidates();
}

function deleteVacancy() {
  if (!state.currentVacancyId) return;
  const v = currentVacancy(); if (!v) return;
  const count = state.candidates.filter(c => c.vacancyId === state.currentVacancyId).length;
  const msg = count > 0 ? `Удалить вакансию «${v.title}»? С ней связано ${count} кандидат(ов).` : `Удалить вакансию «${v.title}»?`;
  if (!confirm(msg)) return;
  state.candidates = state.candidates.filter(c => c.vacancyId !== state.currentVacancyId);
  state.vacancies = state.vacancies.filter(x => x.id !== state.currentVacancyId);
  state.currentVacancyId = state.vacancies.length ? state.vacancies[0].id : null;
  save(); renderVacancySelect(); renderCandidates();
  showPanel(state.vacancies.length ? 'vacancy' : 'settings');
  if (state.currentVacancyId) fillVacancyForm();
  toast('Вакансия удалена');
}

function closeModal() { document.getElementById('modal-new-vacancy').classList.remove('open'); }
document.getElementById('modal-new-vacancy').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });

// ── Prompts ───────────────────────────────────────────────────────
function savePrompt() {
  state.prompts.resume = document.getElementById('prompt-resume').value;
  state.prompts.questions = document.getElementById('prompt-questions').value;
  state.prompts.interview = document.getElementById('prompt-interview').value;
  save(); toast('Промты сохранены');
}

function resetPrompt() {
  if (!confirm('Сбросить все промты к исходным?')) return;
  state.prompts = { ...DEFAULT_PROMPTS };
  document.getElementById('prompt-resume').value = state.prompts.resume;
  document.getElementById('prompt-questions').value = state.prompts.questions;
  document.getElementById('prompt-interview').value = state.prompts.interview;
  save(); toast('Промты сброшены');
}

// ── Navigation ────────────────────────────────────────────────────
function showPanel(name) {
  document.querySelectorAll('.panel').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('header-btns').innerHTML = '';
  // Remove inline display:none from active panel
  setTimeout(() => {
    const active = document.querySelector('.panel.active');
    if (active) active.style.display = '';
  }, 0);
  const titles = { vacancy: 'Вакансия', new: 'Новый кандидат', prompt: 'Промт анализа', settings: 'Настройки' };
  document.getElementById('main-title').textContent = titles[name] || '';
  if (name === 'vacancy') {
    document.getElementById('panel-vacancy').classList.add('active');
    fillVacancyForm();
    const v = currentVacancy();
    if (v) document.getElementById('main-title').textContent = 'Вакансия: ' + v.title;
  } else if (name === 'new') {
    document.getElementById('panel-new').classList.add('active');
    document.getElementById('nav-new').classList.add('active');
    document.getElementById('c-name').value = '';
    document.getElementById('c-resume').value = '';
    document.getElementById('new-result').innerHTML = '';
    setPdfArea('', 'Загрузи PDF резюме', 'Нажми или перетащи файл сюда');
    document.getElementById('no-vacancy-warn').style.display = state.currentVacancyId ? 'none' : 'flex';
  } else if (name === 'prompt') {
    document.getElementById('panel-prompt').classList.add('active');
    document.getElementById('nav-prompt').classList.add('active');
  } else if (name === 'settings') {
    document.getElementById('panel-settings').classList.add('active');
    document.getElementById('nav-settings').classList.add('active');
  } else if (name === 'rating') {
    document.getElementById('panel-rating').classList.add('active');
    document.getElementById('nav-rating').classList.add('active');
    document.getElementById('main-title').textContent = 'Рейтинг кандидатов';
    populateRatingPanel();
  } else if (name === 'candidate') {
    document.getElementById('panel-candidate').classList.add('active');
    const c = currentCandidate();
    document.getElementById('main-title').textContent = c ? c.name : '';
    document.getElementById('header-btns').innerHTML =
(() => {
      const cand = currentCandidate();
      const hasAnalysis = cand && cand.rawAnalysis;
      return '<button class="btn" onclick="HR.resetAnalysis()"><i class="ti ti-refresh"></i> Обновить анализ</button>' +
        (hasAnalysis ? '<button class="btn" style="background:#FF6B35;color:#fff;border-color:#FF6B35;" onclick="HR.archiveCandidate()"><i class="ti ti-x"></i> Отказ</button>' : '') +
        '<button class="btn btn-danger" onclick="HR.deleteCandidate()"><i class="ti ti-trash"></i> Удалить</button>';
    })();
  }
  renderCandidates();
}

// ── Candidates ────────────────────────────────────────────────────
function filteredCandidates() {
  if (!state.currentVacancyId) return state.candidates;
  return state.candidates.filter(c => c.vacancyId === state.currentVacancyId);
}

function currentCandidate() { return state.candidates.find(c => c.id === state.currentCandidateId); }

function renderCandidates() {
  const list = document.getElementById('candidates-list');
  const cands = filteredCandidates().filter(c => _showingArchive ? c.archived : !c.archived);
  if (!cands.length) { list.innerHTML = '<div style="padding:8px 10px;font-size:11px;color:rgba(255,255,255,0.3);">Нет кандидатов</div>'; return; }
  list.innerHTML = cands.map(c => {
    // Определяем бейдж вердикта
  let badge = '';
  if (c.addedToCrm) {
    badge = `<span class="cand-badge badge-crm">в CRM</span>`;
  } else if (c.verdict === 'green') {
    badge = `<span class="cand-badge badge-green">🟢 звать</span>`;
  } else if (c.verdict === 'yellow') {
    badge = `<span class="cand-badge badge-yellow">🟡 уточнить</span>`;
  } else if (c.verdict === 'red') {
    badge = `<span class="cand-badge badge-red">🔴 отказ</span>`;
  } else if (c.interviewDone) {
    badge = `<span class="cand-badge badge-done">разобран</span>`;
  } else if (c.hasQuestions) {
    badge = `<span class="cand-badge badge-interview">интервью</span>`;
  } else {
    badge = `<span class="cand-badge badge-new">новый</span>`;
  }
    return `<div class="cand-item ${c.id === state.currentCandidateId ? 'active' : ''}" onclick="HR.openCandidate('${c.id}')">
<div class="cand-name">${escHtml(c.name)}</div>
<div class="cand-date">${c.date}</div>
      ${badge}
</div>`;
  }).join('');
}

function openCandidate(id) {
  state.currentCandidateId = id;
  const c = currentCandidate();
  showPanel('candidate');
  switchTab('resume');
  document.getElementById('q-focus').value = c.qFocus || '';
  document.getElementById('questions-content').innerHTML = c.questionsHTML || '';
  document.getElementById('i-transcript').value = c.transcript || '';
  document.getElementById('interview-content').innerHTML = c.interviewHTML || '';
  document.getElementById('resume-content').innerHTML = c.resumeHTML ||
    '<div class="empty"><i class="ti ti-file-text"></i><p>Анализ резюме ещё не проводился</p></div>';
  // Показываем кнопку копирования для активной вкладки
  setTimeout(() => updateCopyBtn('resume'), 100);
}

// ── Архив отказов ────────────────────────────────────────────────
let _showingArchive = false;

function showCompareFromNew() {
  // Сохраняем текущего кандидата если ещё не сохранён
  const name = document.getElementById('c-name')?.value.trim();
  const resume = document.getElementById('c-resume')?.value.trim();
  if (!name || !resume) { toast('Сначала загрузи резюме кандидата'); return; }

  // Если кандидат ещё не в списке — сохраняем
  let cand = state.candidates.find(x => x.name === name && !x.archived);
  if (!cand) {
    const id = 'c_' + Date.now();
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    cand = { id, name, resume, date, vacancyId: state.currentVacancyId, archived: false, resumeHTML: '', rawAnalysis: '', verdict: '', hasQuestions: false, interviewDone: false, addedToCrm: false, qFocus: '' };
    state.candidates.unshift(cand);
    state.currentCandidateId = cand.id;
    save();
    renderCandidates();
  } else {
    state.currentCandidateId = cand.id;
  }

  // Переходим в карточку кандидата на вкладку Сравнить
  state.currentCandidateId = cand.id;
  showPanel('candidate');
  setTimeout(() => switchTab('compare'), 200);
}

function archiveCandidate() {
  const c = currentCandidate();
  if (!c) return;
  if (!confirm('Переместить ' + c.name + ' в архив отказов?')) return;
  c.archived = true;
  c.archivedAt = new Date().toLocaleDateString('ru-RU');
  state.currentCandidateId = null;
  save();
  renderCandidates();
  showPanel('new');
  syncToSheets();
  toast(c.name + ' перемещён в архив');
}

function toggleArchiveView() {
  _showingArchive = !_showingArchive;
  const label = document.getElementById('archive-toggle-label');
  if (label) label.textContent = _showingArchive ? '← Активные' : 'Архив отказов';
  renderCandidates();
}

function resetAnalysis() {
  const c = currentCandidate();
  if (!c) return;
  if (!confirm('Сбросить результат анализа? Данные кандидата сохранятся.')) return;
  c.resumeHTML = '';
  c.rawAnalysis = '';
  c.hasQuestions = false;
  c.questionsHTML = '';
  c.rawAnalysisQuestions = '';
  c.interviewHTML = '';
  c.rawAnalysisInterview = '';
  c.interviewDone = '';
  c.verdict = '';
  save();
  renderCandidates();
  document.getElementById('resume-content').innerHTML =
    `<div style="text-align:center;padding:40px 20px;">
      <div style="color:var(--text3);font-size:13px;margin-bottom:16px;">Анализ сброшен. Запусти заново.</div>
      <button class="btn btn-primary" onclick="HR.reAnalyzeCandidate()">
        <i class="ti ti-sparkles"></i> Проанализировать резюме
      </button>
    </div>`;
  document.getElementById('questions-content').innerHTML = '';
  document.getElementById('interview-content').innerHTML = '';
  switchTab('resume');
  toast('Анализ сброшен');
}

function reAnalyzeCandidate() {
  const c = currentCandidate();
  if (!c) return;
  if (!c.resume) { toast('Нет текста резюме'); return; }
  // Убеждаемся что выбрана правильная вакансия кандидата
  if (c.vacancyId && state.currentVacancyId !== c.vacancyId) {
    state.currentVacancyId = c.vacancyId;
    document.getElementById('vacancy-select').value = c.vacancyId;
    save();
  }
  const el = document.getElementById('resume-content');
  callAPI({
    system: buildPrompt('resume'),
    user: 'РЕЗЮМЕ КАНДИДАТА: ' + c.name + '\n\n' + c.resume,
    loadingEl: el,
    onSuccess: (text) => {
      let verdict = '';
      if (/🟢/.test(text)) verdict = 'green';
      else if (/🟡/.test(text)) verdict = 'yellow';
      else if (/🔴/.test(text)) verdict = 'red';
      c.resumeHTML = resultBox('Анализ резюме · ' + c.name, text) + crmExportBox(c.id);
      c.rawAnalysis = text;
      c.verdict = verdict;
      save(); renderCandidates();
      el.innerHTML = c.resumeHTML;
    },
    onError: (msg) => { el.innerHTML = errorBox(msg); }
  });
}

function deleteCandidate() {
  if (!confirm('Удалить кандидата?')) return;
  state.candidates = state.candidates.filter(c => c.id !== state.currentCandidateId);
  state.currentCandidateId = null;
  save(); renderCandidates(); showPanel('new');
}

function switchTab(tab) {
  ['resume','questions','interview','rawresume','compare'].forEach(t => {
    document.getElementById('tab-' + t).style.display = t === tab ? 'block' : 'none';
    document.getElementById('tab-btn-' + t).classList.toggle('active', t === tab);
  });
  // Заполняем вкладку сравнения при открытии
  if (tab === 'compare') {
    const sel1 = document.getElementById('compare-vac1');
    const sel2 = document.getElementById('compare-vac2');
    if (sel1 && sel2 && state.vacancies.length) {
      const opts = state.vacancies.map(v => '<option value="' + v.id + '">' + v.title + '</option>').join('');
      sel1.innerHTML = opts;
      sel2.innerHTML = opts;
      // По умолчанию разные вакансии
      if (state.vacancies.length > 1) sel2.value = state.vacancies[1].id;
    }
  }
  // Заполняем вкладку резюме при открытии
  if (tab === 'rawresume') {
    const c = currentCandidate();
    const el = document.getElementById('rawresume-content');
    if (c && c.resume) {
      el.textContent = c.resume;
    } else {
      el.textContent = 'Текст резюме не сохранён';
    }
  }
  // Показываем кнопку копирования для нужных вкладок
  updateCopyBtn(tab);
}

function copyText(text) {
  if (!text) { toast('Нечего копировать'); return; }
  navigator.clipboard.writeText(text).then(() => toast('Скопировано!')).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
    toast('Скопировано!');
  });
}

function updateCopyBtn(tab) { /* no-op, copy buttons are inline */ }

// ── Settings ──────────────────────────────────────────────────────
function saveSettings() {
  state.apiKey = document.getElementById('api-key').value.trim();
  state.model = document.getElementById('model-select').value;
  state.crmUrl = document.getElementById('crm-url').value.trim();
  save(); toast('Настройки сохранены');
}

function clearAllData() {
  if (!confirm('Удалить все вакансии, кандидатов и данные? API ключ сохранится.')) return;
  const key = state.apiKey; const model = state.model; const crmUrl = state.crmUrl;
  state = { apiKey: key, model, crmUrl, vacancies: [], currentVacancyId: null, candidates: [], currentCandidateId: null, prompts: { ...DEFAULT_PROMPTS } };
  save(); applyLoaded(); toast('Данные удалены');
}

// ── Context ───────────────────────────────────────────────────────
function vacancyContext() {
  const v = currentVacancy();
  if (!v) return '';
  const parts = [];
  if (v.title) parts.push('ВАКАНСИЯ: ' + v.title);
  if (v.desc) parts.push('ОПИСАНИЕ ВАКАНСИИ:\n' + v.desc);
  if (v.company) parts.push('О КОМПАНИИ:\n' + v.company);
  if (v.notes) parts.push('КОММЕНТАРИИ РЕКРУТЕРА:\n' + v.notes);
  return parts.join('\n\n');
}

function buildPrompt(type) { return state.prompts[type].replace('{VACANCY}', vacancyContext()); }

// ── API ───────────────────────────────────────────────────────────
async function callAPI({ system, user, loadingEl, onSuccess, onError }) {
  if (!state.apiKey) { onError('Сначала укажи API ключ в разделе «Настройки»'); return; }
  loadingEl.innerHTML = `<div class="loading"><span class="dot"></span><span class="dot"></span><span class="dot"></span> Анализирую...</div>`;
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': state.apiKey, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: state.model || 'claude-sonnet-4-6', max_tokens: 4000, system, messages: [{ role: 'user', content: user }] })
    });
    const data = await resp.json();
    if (data.error) throw new Error(data.error.message);
    onSuccess(data.content[0].text);
  } catch(e) { onError(e.message); }
}

function resultBox(label, text) {
  const id = 'rb_' + Math.random().toString(36).slice(2);
  return `<div class="ai-result">
<div class="ai-result-label" style="display:flex;align-items:center;justify-content:space-between;">
  <span><i class="ti ti-sparkles"></i> ${label}</span>
  <button class="btn" style="font-size:11px;padding:3px 10px;" onclick="HR.copyText(document.getElementById('${id}').innerText)"><i class="ti ti-copy"></i> Скопировать</button>
</div>
<div id="${id}" style="white-space:pre-wrap;">${escHtml(text)}</div>
</div>`;
}

function errorBox(msg) {
  return `<div class="ai-result" style="color:var(--red-text);background:var(--red-bg);">⚠️ ${msg}</div>`;
}

function escHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// ── Сравнение кандидата по двум вакансиям ───────────────────────
function runComparison() {
  const c = currentCandidate();
  if (!c || !c.resume) { toast('Нет резюме кандидата'); return; }

  const vac1Id = document.getElementById('compare-vac1').value;
  const vac2Id = document.getElementById('compare-vac2').value;
  if (vac1Id === vac2Id) { toast('Выбери две разные вакансии'); return; }

  const vac1 = state.vacancies.find(v => v.id === vac1Id);
  const vac2 = state.vacancies.find(v => v.id === vac2Id);
  if (!vac1 || !vac2) return;

  const el = document.getElementById('compare-result');
  el.innerHTML = '<div class="empty"><i class="ti ti-loader ti-spin"></i><p>Сравниваю...</p></div>';

  function vacContext(v) {
    const parts = [];
    if (v.title) parts.push('Вакансия: ' + v.title);
    if (v.desc) parts.push('Требования:\n' + v.desc);
    if (v.company) parts.push('Компания:\n' + v.company);
    if (v.notes) parts.push('Комментарии:\n' + v.notes);
    return parts.join('\n\n');
  }

  const prompt = `Ты опытный рекрутер. Сравни кандидата по двум вакансиям и дай чёткую рекомендацию.

ВАКАНСИЯ 1:
${vacContext(vac1)}

ВАКАНСИЯ 2:
${vacContext(vac2)}

РЕЗЮМЕ КАНДИДАТА:
${c.resume}

ФОРМАТ ОТВЕТА (строго):

ВАКАНСИЯ 1 — ${vac1.title}
Соответствие: X/10
Ключевые плюсы: (2-3 пункта)
Ключевые риски: (1-2 пункта)

ВАКАНСИЯ 2 — ${vac2.title}
Соответствие: X/10
Ключевые плюсы: (2-3 пункта)
Ключевые риски: (1-2 пункта)

РЕКОМЕНДАЦИЯ:
Лучше подходит для: [название вакансии] / Не подходит ни для одной
Причина: одно предложение
Решение: Звать на [вакансия] / Уточнить / Не рассматривать

Максимум 200 слов. Только факты из резюме.
ВАЖНО: В поле «Решение» используй ТОЛЬКО одно из четырёх: «Звать на [вакансия]» / «Уточнить на [вакансия]» / «Не рассматривать».
Если оба соответствия ниже 4/10 — ОБЯЗАТЕЛЬНО пиши «Не рассматривать».`;

  callAPI({
    system: prompt,
    user: 'Проведи сравнение.',
    loadingEl: el,
    onSuccess: (text) => {
      // Определяем вердикт из текста
      const isReject = /не рассматривать|не подходит|отказ/i.test(text);
      if (isReject) {
        const cand = currentCandidate();
        if (cand) { cand.verdict = 'red'; save(); renderCandidates(); }
      }
      el.innerHTML = resultBox('Сравнение: ' + vac1.title + ' vs ' + vac2.title, text);
      // Добавляем кнопки действий через DOM
      const _actDiv = document.createElement('div');
      _actDiv.style.cssText = 'margin-top:12px;padding:12px;background:var(--surface);border:1px solid var(--border-med);border-radius:var(--radius);';
      const _b1 = document.createElement('button');
      _b1.className = 'btn'; _b1.style.flex = '1';
      _b1.textContent = '→ ' + vac1.title;
      _b1.onclick = function(){ changeVacancy(vac1Id); };
      const _b2 = document.createElement('button');
      _b2.className = 'btn'; _b2.style.flex = '1';
      _b2.textContent = '→ ' + vac2.title;
      _b2.onclick = function(){ changeVacancy(vac2Id); };
      const _b3 = document.createElement('button');
      _b3.className = 'btn';
      _b3.style.cssText = 'background:#FF6B35;color:#fff;border-color:#FF6B35;flex:1;';
      _b3.textContent = '🔴 Отказ';
      _b3.onclick = function(){ archiveCandidate(); };
      const _row = document.createElement('div');
      _row.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;';
      _row.appendChild(_b1); _row.appendChild(_b2); _row.appendChild(_b3);
      const _lbl = document.createElement('div');
      _lbl.style.cssText = 'font-size:12px;color:var(--text2);margin-bottom:8px;';
      _lbl.textContent = 'Действие по результату:';
      _actDiv.appendChild(_lbl); _actDiv.appendChild(_row);
      el.appendChild(_actDiv);
    },
    onError: (msg) => { el.innerHTML = errorBox(msg); }
  });
}

function changeVacancy(newVacId) {
  const c = currentCandidate();
  if (!c) return;
  const vac = state.vacancies.find(v => v.id === newVacId);
  if (!vac) return;
  if (!confirm('Перевести ' + c.name + ' на вакансию «' + vac.title + '»?')) return;
  c.vacancyId = newVacId;
  save();
  renderCandidates();
  // Обновляем выбор вакансии в сайдбаре
  state.currentVacancyId = newVacId;
  document.getElementById('vacancy-select').value = newVacId;
  save();
  renderCandidates();
  toast('Вакансия изменена на «' + vac.title + '»');
  syncToSheets();
}

// ── Быстрое добавление в CRM без анализа ────────────────────────
function quickAddToCRM() {
  const name = document.getElementById('c-name').value.trim();
  const resume = document.getElementById('c-resume').value.trim();
  if (!name) { toast('Заполни имя кандидата'); return; }

  // Извлекаем телефон и email
  let phone = '';
  if (resume) {
    const m = resume.match(/(?:\+7|8)[\s\-\(\)]*(\ d{3})[\s\-\(\)]*(\ d{3})[\s\-\(\)]*(\ d{2})[\s\-\(\)]*(\ d{2})/);
    if (m) phone = '+7' + m[1] + m[2] + m[3] + m[4];
  }
  let email = '';
  if (resume) {
    const me = resume.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (me) email = me[0];
  }

  // Сохраняем кандидата в ассистент
  const id = 'c_' + Date.now();
  const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  state.candidates.unshift({ id, name, resume, date, phone, email, vacancyId: state.currentVacancyId, archived: false, resumeHTML: '', rawAnalysis: '', verdict: '', hasQuestions: false, interviewDone: false, addedToCrm: true });
  state.currentCandidateId = id;
  save();
  renderCandidates();
  syncToSheets();

  // Передаём кандидата в раздел CRM и переключаемся на него
  const v = currentVacancy();
  CRM.addCandidateFromHR({ name, phone, email, vacancy: v ? v.title : '', source: 'HeadHunter' });
  switchView('crm');
  toast('Кандидат сохранён, открываю CRM...');
}

// ── CRM export ────────────────────────────────────────────────────
function addToCRM(candidateId) {
  const c = state.candidates.find(x => x.id === candidateId);
  if (!c) return;

  const v = state.vacancies.find(x => x.id === c.vacancyId);

  // Телефон и email: используем уже сохранённые на кандидате, либо извлекаем из текста резюме
  let phone = c.phone || '';
  if (!phone && c.resume) {
    const m = c.resume.match(/(?:\+7|8)[\s\-\(\)]*(\d{3})[\s\-\(\)]*(\d{3})[\s\-\(\)]*(\d{2})[\s\-\(\)]*(\d{2})/);
    if (m) phone = '+7' + m[1] + m[2] + m[3] + m[4];
  }
  let email = c.email || '';
  if (!email && c.resume) {
    const me = c.resume.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    if (me) email = me[0];
  }

  c.addedToCrm = true;
  save(); renderCandidates();

  CRM.addCandidateFromHR({ name: c.name, phone, email, vacancy: v ? v.title : '', source: 'HeadHunter' });
  switchView('crm');
  toast('Открываю CRM...');
}

function crmExportBox(candidateId) {
  const c = state.candidates.find(x => x.id === candidateId);
  const alreadyAdded = c && c.addedToCrm;
  return `<div class="crm-export-box">
<div class="crm-export-box-text">
<strong>Кандидат подходит?</strong>
      ${alreadyAdded ? '✅ Уже добавлен в CRM' : 'Добавь в CRM для дальнейшей работы'}
</div>
<button class="btn btn-crm" onclick="HR.addToCRM('${candidateId}')" ${alreadyAdded ? 'style="opacity:0.6"' : ''}>
<i class="ti ti-database-plus"></i> ${alreadyAdded ? 'Открыть CRM' : 'Добавить в CRM'}
</button>
</div>`;
}

// ── Actions ───────────────────────────────────────────────────────
function analyzeResume() {
  const name = document.getElementById('c-name').value.trim();
  const resume = document.getElementById('c-resume').value.trim();
  if (!name || !resume) { alert('Заполни имя кандидата и текст резюме (загрузи PDF или вставь текст)'); return; }
  const el = document.getElementById('new-result');
  callAPI({
    system: buildPrompt('resume'),
    user: `РЕЗЮМЕ КАНДИДАТА: ${name}\n\n${resume}`,
    loadingEl: el,
    onSuccess: (text) => {
      const id = 'c_' + Date.now();
      const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
      // Парсим вердикт из текста ИИ
      let verdict = '';
      if (/🟢/.test(text)) verdict = 'green';
      else if (/🟡/.test(text)) verdict = 'yellow';
      else if (/🔴/.test(text)) verdict = 'red';
      state.candidates.unshift({ id, name, resume, date, vacancyId: state.currentVacancyId, resumeHTML: resultBox('Анализ резюме · ' + name, text) + crmExportBox(id), rawAnalysis: text, verdict, hasQuestions: false, interviewDone: false, addedToCrm: false });
      state.currentCandidateId = id;
      save();
      el.innerHTML = `<div class="info-box info-green"><i class="ti ti-circle-check"></i> Готово! Открываю карточку...</div>`;
      syncToSheets(); // автосохранение после анализа
      setTimeout(() => openCandidate(id), 1000);
    },
    onError: (msg) => { el.innerHTML = errorBox(msg); }
  });
}

function generateQuestions() {
  const c = currentCandidate(); if (!c) return;
  const focus = document.getElementById('q-focus').value;
  const el = document.getElementById('questions-content');
  callAPI({
    system: buildPrompt('questions'),
    user: `АНАЛИЗ РЕЗЮМЕ:\n${c.rawAnalysis}\n\nРЕЗЮМЕ:\n${c.resume}${focus ? '\n\nОСОБЫЙ ФОКУС: ' + focus : ''}`,
    loadingEl: el,
    onSuccess: (text) => {
      c.qFocus = focus;
      c.questionsHTML = resultBox('Вопросы для интервью · ' + c.name, text);
      c.rawAnalysisQuestions = text;
      c.hasQuestions = true;
      save(); renderCandidates();
      el.innerHTML = c.questionsHTML;
      syncToSheets();
    },
    onError: (msg) => { el.innerHTML = errorBox(msg); }
  });
}

function analyzeInterview() {
  const c = currentCandidate(); if (!c) return;
  const transcript = document.getElementById('i-transcript').value.trim();
  if (!transcript) { alert('Вставь транскрипт или заметки интервью'); return; }
  const el = document.getElementById('interview-content');
  c.transcript = transcript;
  callAPI({
    system: buildPrompt('interview'),
    user: `АНАЛИЗ РЕЗЮМЕ:\n${c.rawAnalysis}\n\nТРАНСКРИПТ ИНТЕРВЬЮ:\n${transcript}`,
    loadingEl: el,
    onSuccess: (text) => {
      c.interviewHTML = resultBox('Разбор интервью · ' + c.name, text);
      c.rawAnalysisInterview = text;
      c.interviewDone = true;
      save(); renderCandidates();
      el.innerHTML = c.interviewHTML;
      syncToSheets();
    },
    onError: (msg) => { el.innerHTML = errorBox(msg); }
  });
}

const SHEETS_URL = 'https://script.google.com/macros/s/AKfycbwrapo9EQQP5tPvMViiDC2hvwgMm0NwKv_YIKsCncUBEUycIadSpsLXpfemOFthsVoQWQ/exec';

function syncStatus(msg, type) {
  const el = document.getElementById('sync-status');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'inline-block' : 'none';
  el.className = 'sync-badge sync-' + (type || 'loading');
  if (type === 'ok') setTimeout(() => { el.style.display = 'none'; }, 3000);
}

function encodeForSheets(candidates) {
  // Кодируем переносы строк чтобы Sheets не потерял структуру
  return candidates.map(c => {
    const encoded = {...c};
    ['resume','rawAnalysis','rawAnalysisQuestions','rawAnalysisInterview','transcript'].forEach(field => {
      if (encoded[field]) encoded[field] = encoded[field].replace(/\n/g, '||NL||');
    });
    return encoded;
  });
}

function decodeFromSheets(candidates) {
  // Декодируем переносы строк обратно
  return candidates.map(c => {
    const decoded = {...c};
    ['resume','rawAnalysis','rawAnalysisQuestions','rawAnalysisInterview','transcript'].forEach(field => {
      if (decoded[field]) decoded[field] = decoded[field].replace(/\|\|NL\|\|/g, '\n');
    });
    return decoded;
  });
}

// ── Рейтинг кандидатов ───────────────────────────────────────────
function getSavedRatings() { try { return JSON.parse(localStorage.getItem('crm_ratings')||'{}'); } catch(e) { return {}; } }
function saveRating(vacId, text) { const r = getSavedRatings(); r[vacId] = { text, date: new Date().toLocaleDateString('ru-RU'), vacTitle: (state.vacancies.find(v=>v.id===vacId)||{}).title||'' }; localStorage.setItem('crm_ratings', JSON.stringify(r)); }
function deleteSavedRating(vacId) { const r = getSavedRatings(); delete r[vacId]; localStorage.setItem('crm_ratings', JSON.stringify(r)); }

function populateRatingPanel() {
  const sel = document.getElementById('rating-vacancy-select');
  if (sel) {
    sel.innerHTML = state.vacancies.map(v =>
      '<option value="' + v.id + '"' + (v.id === state.currentVacancyId ? ' selected' : '') + '>' + v.title + '</option>'
    ).join('');
    sel.onchange = function(){ renderRatingCandidates(); showSavedRating(); };
  }
  renderRatingCandidates();
  showSavedRating();
}

function showSavedRating() {
  const vacId = document.getElementById('rating-vacancy-select')?.value;
  const el = document.getElementById('rating-result');
  if (!el) return;
  const saved = getSavedRatings()[vacId];
  if (saved) {
    el.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
      '<span style="font-size:11px;color:var(--text3);">💾 Сохранённый рейтинг от ' + saved.date + '</span>' +
      '<button class="btn btn-danger" style="font-size:11px;padding:3px 10px;" onclick="HR.deleteSavedRatingAndClear()">🗑 Удалить</button>' +
      '</div>' +
      resultBox('Рейтинг — ' + saved.vacTitle, saved.text);
  } else {
    el.innerHTML = '';
  }
}

function deleteSavedRatingAndClear() {
  const vacId = document.getElementById('rating-vacancy-select')?.value;
  if (!vacId) return;
  if (!confirm('Удалить сохранённый рейтинг?')) return;
  deleteSavedRating(vacId);
  document.getElementById('rating-result').innerHTML = '';
  toast('Рейтинг удалён');
}

function renderRatingCandidates() {
  const vacId = document.getElementById('rating-vacancy-select')?.value;
  const list = document.getElementById('rating-candidates-list');
  if (!list) return;
  // Показываем всех не архивных без красного вердикта
  const candidates = state.candidates.filter(c =>
    !c.archived &&
    c.verdict !== 'red' &&
    (!vacId || c.vacancyId === vacId || !c.vacancyId)
  );
  if (!candidates.length) {
    list.innerHTML = '<div style="padding:16px;color:var(--text3);font-size:13px;text-align:center;">Нет кандидатов по этой вакансии</div>';
    return;
  }
  list.innerHTML = candidates.map(c => {
    const verdict = c.verdict === 'green' ? '🟢' : c.verdict === 'yellow' ? '🟡' : c.verdict === 'red' ? '🔴' : '⚪';
    const hasAnalysis = c.rawAnalysis ? '<span style="color:var(--green);">✓ анализ</span>' : '<span style="color:var(--text3);">без анализа</span>';
    return '<label style="display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid var(--border-light);cursor:pointer;">' +
      '<input type="checkbox" class="rating-checkbox" data-cid="' + c.id + '" style="width:16px;height:16px;cursor:pointer;">' +
      '<span style="flex:1;font-size:13px;">' + verdict + ' ' + c.name + '</span>' +
      '<span style="font-size:11px;">' + hasAnalysis + '</span>' +
      '</label>';
  }).join('');
}

function selectAllForRating() {
  document.querySelectorAll('.rating-checkbox').forEach(cb => cb.checked = true);
}

function clearRatingSelection() {
  document.querySelectorAll('.rating-checkbox').forEach(cb => cb.checked = false);
  document.getElementById('rating-result').innerHTML = '';
}

function buildRating() {
  const selected = [...document.querySelectorAll('.rating-checkbox:checked')].map(cb => cb.getAttribute('data-cid'));
  if (selected.length < 2) { toast('Выбери минимум 2 кандидатов'); return; }
  if (selected.length > 10) { toast('Максимум 10 кандидатов за раз'); return; }
  const vacId = document.getElementById('rating-vacancy-select')?.value;
  const vac = state.vacancies.find(v => v.id === vacId);
  const candidates = selected.map(id => state.candidates.find(c => c.id === id)).filter(Boolean);
  const el = document.getElementById('rating-result');
  el.innerHTML = '<div class="empty"><i class="ti ti-loader ti-spin"></i><p>Строю рейтинг...</p></div>';
  document.getElementById('rating-btn').disabled = true;
  const vacContext = vac ? 'ВАКАНСИЯ: ' + vac.title + (vac.desc ? '\nТребования:\n' + vac.desc : '') + (vac.notes ? '\nКомментарии:\n' + vac.notes : '') : '';
  const candidatesText = candidates.map((c, i) =>
    '=== КАНДИДАТ ' + (i+1) + ': ' + c.name + ' ===\n' +
    'Резюме:\n' + (c.resume || 'нет') + '\n' +
    (c.rawAnalysis ? 'Предыдущий анализ:\n' + c.rawAnalysis : '')
  ).join('\n\n');
  const prompt = `Ты опытный рекрутер. Сравни кандидатов и выстрой рейтинг от лучшего к худшему.

${vacContext}

${candidatesText}

ФОРМАТ ОТВЕТА:

РЕЙТИНГ:
#1 [ФИО] — X/10
Главный плюс: одна фраза
Главный риск: одна фраза
Решение: Звать первым / Звать / Уточнить / Не рассматривать

(и так для каждого кандидата)

ИТОГ:
Звонить первому: [ФИО]
Пропустить: [ФИО] — если есть явно неподходящие

Максимум 350 слов. Только факты.`;
  callAPI({
    system: prompt,
    user: 'Построй рейтинг.',
    loadingEl: el,
    onSuccess: (text) => {
      el.innerHTML = resultBox('Рейтинг — ' + (vac ? vac.title : ''), text);
      // Кнопка сохранения
      const saveDiv = document.createElement('div');
      saveDiv.style.cssText = 'margin-top:10px;display:flex;gap:8px;';
      const saveBtn = document.createElement('button');
      saveBtn.className = 'btn btn-primary';
      saveBtn.style.fontSize = '12px';
      saveBtn.innerHTML = '💾 Сохранить рейтинг';
      saveBtn.onclick = function() {
        saveRating(vacId, text);
        saveBtn.innerHTML = '✅ Сохранено';
        saveBtn.disabled = true;
        toast('Рейтинг сохранён');
      };
      saveDiv.appendChild(saveBtn);
      el.appendChild(saveDiv);
      document.getElementById('rating-btn').disabled = false;
    },
    onError: (msg) => {
      el.innerHTML = errorBox(msg);
      document.getElementById('rating-btn').disabled = false;
    }
  });
}

function syncToSheets() {
  syncStatus('⏳ Сохраняю...', 'loading');
  fetch(SHEETS_URL, {
    method: 'POST',
    body: JSON.stringify({ action:'save', candidates:encodeForSheets(state.candidates), vacancies:state.vacancies, prompts:state.prompts, model:state.model, crmUrl:state.crmUrl })
  })
  .then(r => r.json())
  .then(res => { if (res && res.ok) syncStatus('✅ Сохранено', 'ok'); else syncStatus('❌ Ошибка', 'err'); })
  .catch(() => syncStatus('❌ Нет связи', 'err'));
}

function loadFromSheets() {
  syncStatus('⏳ Загружаю...', 'loading');
  const cbName = 'cb_hr_' + Date.now();
  const script = document.createElement('script');
  window[cbName] = function(res) {
    delete window[cbName];
    document.head.removeChild(script);
    if (res && res.ok && res.data) {
      const d = res.data;
      if (d.candidates && d.candidates.length) state.candidates = decodeFromSheets(d.candidates);
      if (d.vacancies && d.vacancies.length) state.vacancies = d.vacancies;
      if (d.prompts && Object.keys(d.prompts).length) state.prompts = { ...state.prompts, ...d.prompts };
      if (d.settings) { if (d.settings.model) state.model = d.settings.model; if (d.settings.crmUrl) state.crmUrl = d.settings.crmUrl; }
      save();
      applyLoaded();
      // Показываем всех кандидатов — выбираем первую вакансию если не выбрана
      if (!state.currentVacancyId && state.vacancies.length) {
        state.currentVacancyId = state.vacancies[0].id;
        save();
      }
      renderCandidates();
      syncStatus('✅ Загружено', 'ok');
    } else { syncStatus('❌ Ошибка загрузки', 'err'); }
  };
  script.src = SHEETS_URL + '?action=read&callback=' + cbName;
  script.onerror = () => { delete window[cbName]; syncStatus('❌ Нет связи', 'err'); };
  document.head.appendChild(script);
}

load();
// Убираем дубли кандидатов (по имени, оставляем с анализом)
(function deduplicateCandidates() {
  const seen = {};
  state.candidates = state.candidates.filter(c => {
    if (!c.name) return true;
    const key = c.name + '|' + (c.vacancyId || '');
    if (seen[key]) {
      // Оставляем того у кого больше данных
      const prev = state.candidates.find(x => x.id === seen[key]);
      if (prev && !prev.rawAnalysis && c.rawAnalysis) {
        seen[key] = c.id;
        return true;
      }
      return false;
    }
    seen[key] = c.id;
    return true;
  });
  save();
})();

// ── Интеграция с расширением HH — через localStorage ────────────

function applyIncomingResume(payload) {
  if (!payload || !payload.action) return;
  if (payload.action !== 'resume') return;

  const { name, phone, email, vacancy, resume, ts } = payload;

  // Проверяем что данные свежие (не старше 10 минут)
  if (ts && Date.now() - ts > 600000) return;

  showPanel('new');

  // Выбираем вакансию
  if (vacancy && state.vacancies.length) {
    const found = state.vacancies.find(v =>
      v.title.toLowerCase() === vacancy.toLowerCase() ||
      v.title.toLowerCase().includes(vacancy.toLowerCase()) ||
      vacancy.toLowerCase().includes(v.title.toLowerCase())
    );
    if (found) {
      state.currentVacancyId = found.id;
      document.getElementById('vacancy-select').value = found.id;
      save();
      renderCandidates();
      document.getElementById('no-vacancy-warn').style.display = 'none';
    }
  }

  // Заполняем поля
  if (name) document.getElementById('c-name').value = name;
  if (resume) document.getElementById('c-resume').value = resume;

  if (name || resume) {
    const sub = phone ? name + ' · ' + phone : (name || 'Данные из расширения');
    setPdfArea('loaded', 'Резюме загружено с HH.ru', sub);
  }

  // Автосохранение кандидата сразу при получении
  if (name && resume) {
    const exists = state.candidates.find(x => x.name === name && !x.archived);
    if (!exists) {
      const autoId = 'c_' + Date.now();
      const autoDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
      state.candidates.unshift({
        id: autoId, name, resume, date: autoDate, phone: phone || '', email: email || '',
        vacancyId: state.currentVacancyId, archived: false,
        resumeHTML: '', rawAnalysis: '', verdict: '',
        hasQuestions: false, interviewDone: false, addedToCrm: false, qFocus: ''
      });
      state.currentCandidateId = autoId;
      save();
      renderCandidates();
      syncToSheets();
    } else {
      // Обновляем резюме если изменилось
      if (resume && !exists.resume) exists.resume = resume;
      if (email && !exists.email) exists.email = email;
      if (phone && !exists.phone) exists.phone = phone;
      state.currentCandidateId = exists.id;
      save();
    }
  }

  // Запоминаем timestamp чтобы не применить повторно
  if (ts) window._lastAppliedResumeTs = ts;
  // Чистим после использования
  localStorage.removeItem('hh_resume_incoming');
}

// Читаем данные от расширения HH
function checkIncomingResume() {
  try {
    const raw = localStorage.getItem('hh_resume_incoming');
    if (!raw) return;
    const payload = JSON.parse(raw);
    if (!payload || !payload.ts) return;
    // Данные свежие (не старше 10 минут) и ещё не применялись
    const lastApplied = window._lastAppliedResumeTs || 0;
    if (payload.ts > lastApplied && Date.now() - payload.ts < 600000) {
      applyIncomingResume(payload);
    }
  } catch(e) {}
}

// Проверяем при загрузке
setTimeout(checkIncomingResume, 500);

// Слушаем событие от расширения (когда вкладка уже открыта)
window.addEventListener('hh_resume_ready', checkIncomingResume);

// Слушаем postMessage (запасной вариант)
window.addEventListener('message', (e) => {
  if (e.data && e.data.action === 'resume') applyIncomingResume(e.data);
});

return {
  addToCRM,
  callAPI,
  parsePDF,
  analyzeInterview,
  analyzeResume,
  applyIncomingResume,
  applyLoaded,
  archiveCandidate,
  buildPrompt,
  buildRating,
  changeVacancy,
  checkIncomingResume,
  clearAllData,
  clearRatingSelection,
  closeModal,
  copyText,
  createVacancy,
  crmExportBox,
  currentCandidate,
  currentVacancy,
  decodeFromSheets,
  deleteCandidate,
  deleteSavedRating,
  deleteSavedRatingAndClear,
  deleteVacancy,
  encodeForSheets,
  errorBox,
  escHtml,
  extractNameFromText,
  extractPhoneFromText,
  fillVacancyForm,
  filteredCandidates,
  generateQuestions,
  getSavedRatings,
  load,
  loadFromSheets,
  loadPDFJS,
  newVacancy,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelected,
  onVacancyChange,
  openCandidate,
  populateRatingPanel,
  quickAddToCRM,
  reAnalyzeCandidate,
  renderCandidates,
  renderRatingCandidates,
  renderVacancySelect,
  resetAnalysis,
  resetPrompt,
  resultBox,
  runComparison,
  save,
  savePrompt,
  saveRating,
  saveSettings,
  saveVacancy,
  selectAllForRating,
  setPdfArea,
  showCompareFromNew,
  showPanel,
  showSavedRating,
  switchTab,
  syncStatus,
  syncToSheets,
  toast,
  toggleArchiveView,
  updateCopyBtn,
  vacancyContext
};
})();

// Кандидаты, проанализированные до перехода на объединённое приложение,
// хранят в state.candidates[].resumeHTML уже готовую разметку кнопки
// "Добавить в CRM" со старым вызовом без префикса (onclick="addToCRM(...)").
// Этот глобальный мостик перенаправляет такие вызовы на HR.addToCRM,
// чтобы кнопка у старых кандидатов снова работала.
window.addToCRM = (candidateId) => HR.addToCRM(candidateId);
