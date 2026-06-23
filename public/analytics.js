const ANALYTICS = (function () {

  const STAGE_LEVELS = [
    { stage: 'Отклик', level: 0 },
    { stage: 'Интервью HR — назначено', level: 1 },
    { stage: 'Интервью HR — проведено', level: 2 },
    { stage: 'Интервью с РОП — назначено', level: 3 },
    { stage: 'Интервью с РОП — проведено', level: 4 },
    { stage: 'Оффер', level: 5 },
    { stage: 'Обучение', level: 6 },
    { stage: 'Работает', level: 7 }
  ];
  const LEVEL_MAP = { 'Отклик':0,'Интервью HR — назначено':1,'Интервью HR':2,'Интервью HR — проведено':2,'Интервью с РОП — назначено':3,'Интервью с руководителем':4,'Финал':4,'Интервью с РОП — проведено':4,'Оффер':5,'Обучение':6,'Работает':7,'Выход':7 };
  const HIRED_STATUSES = ['Вышел', 'Оффер'];

  function levelOf(stage) {
    return LEVEL_MAP[stage] ?? 0;
  }

  function loadCandidates() {
    try {
      const raw = localStorage.getItem('crm_candidates');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem('crm_history');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function escHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function parseDate(s) {
    if (!s) return null;
    const p = String(s).split('-');
    if (p.length !== 3) return null;
    const d = new Date(parseInt(p[0]), parseInt(p[1]) - 1, parseInt(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  // ── Воронка: сколько кандидатов когда-либо достигли каждого этапа ──
  function computeFunnel(candidates) {
    const total = candidates.length;
    return STAGE_LEVELS.map(({ stage, level }) => {
      const count = candidates.filter(c => levelOf(c.stage) >= level).length;
      const pct = total ? Math.round((count / total) * 100) : 0;
      return { stage, count, pct };
    });
  }

  // ── Эффективность источников ──
  function computeSources(candidates) {
    const map = {};
    candidates.forEach(c => {
      const src = (c.source || '').trim() || 'Без источника';
      if (!map[src]) map[src] = { source: src, total: 0, hired: 0 };
      map[src].total++;
      if (levelOf(c.stage) >= 7 || HIRED_STATUSES.includes(c.status)) map[src].hired++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  // ── Разбивка по вакансиям ──
  function computeVacancies(candidates) {
    const map = {};
    candidates.forEach(c => {
      const vac = c.vacancy || 'Без вакансии';
      if (!map[vac]) map[vac] = { vacancy: vac, total: 0, active: 0, hired: 0 };
      map[vac].total++;
      if (!c.archived) map[vac].active++;
      if (levelOf(c.stage) >= 7) map[vac].hired++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }

  // ── Среднее время до выхода на работу ──
  function computeTimeToHire(candidates, history) {
    const hired = candidates.filter(c => levelOf(c.stage) >= 7 && c.added);
    const diffs = [];
    hired.forEach(c => {
      const addedDate = parseDate(c.added);
      if (!addedDate) return;
      const events = history.filter(h => h.cid === c.id && /Работает/.test(h.event || ''));
      let hireDate = null;
      events.forEach(h => {
        const d = parseDate(h.date);
        if (d && (!hireDate || d > hireDate)) hireDate = d;
      });
      if (hireDate) {
        const days = Math.round((hireDate - addedDate) / 86400000);
        if (days >= 0) diffs.push(days);
      }
    });
    if (!diffs.length) return null;
    return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }

  function bar(label, count, pct, colorClass) {
    return '<div class="an-bar-row">' +
      '<div class="an-bar-label">' + escHtml(label) + '</div>' +
      '<div class="an-bar-track"><div class="an-bar-fill ' + (colorClass || '') + '" style="width:' + pct + '%"></div></div>' +
      '<div class="an-bar-value">' + count + ' (' + pct + '%)</div>' +
      '</div>';
  }

  function render() {
    const root = document.getElementById('analytics-content');
    if (!root) return;

    const candidates = loadCandidates();
    const history = loadHistory();

    if (!candidates.length) {
      root.innerHTML = '<div class="an-empty">Нет данных — открой раздел CRM и нажми «Загрузить», затем вернись сюда.</div>';
      return;
    }

    const total = candidates.length;
    const active = candidates.filter(c => !c.archived).length;
    const hired = candidates.filter(c => levelOf(c.stage) >= 7).length;
    const funnel = computeFunnel(candidates);
    const sources = computeSources(candidates);
    const vacancies = computeVacancies(candidates);
    const avgDays = computeTimeToHire(candidates, history);

    let html = '';

    html += '<div class="an-stats">' +
      '<div class="an-stat"><div class="an-stat-n">' + total + '</div><div class="an-stat-l">Всего кандидатов</div></div>' +
      '<div class="an-stat"><div class="an-stat-n">' + active + '</div><div class="an-stat-l">Активных</div></div>' +
      '<div class="an-stat"><div class="an-stat-n">' + hired + '</div><div class="an-stat-l">Вышли на работу</div></div>' +
      '<div class="an-stat"><div class="an-stat-n">' + (avgDays != null ? avgDays + ' дн.' : '—') + '</div><div class="an-stat-l">Среднее время найма</div></div>' +
      '</div>';

    html += '<div class="an-section-title">📊 Воронка по этапам</div><div class="an-card">';
    funnel.forEach(f => html += bar(f.stage, f.count, f.pct, 'an-fill-funnel'));
    html += '</div>';

    html += '<div class="an-section-title">📥 Источники кандидатов</div><div class="an-card">';
    sources.forEach(s => {
      const pct = s.total ? Math.round((s.hired / s.total) * 100) : 0;
      html += bar(s.source + ' — нанято ' + s.hired + ' из ' + s.total, s.total, pct, 'an-fill-source');
    });
    html += '</div>';

    html += '<div class="an-section-title">💼 По вакансиям</div><div class="an-card"><table class="an-table">' +
      '<thead><tr><th>Вакансия</th><th>Всего</th><th>Активных</th><th>Вышли на работу</th></tr></thead><tbody>';
    vacancies.forEach(v => {
      html += '<tr><td>' + escHtml(v.vacancy) + '</td><td>' + v.total + '</td><td>' + v.active + '</td><td>' + v.hired + '</td></tr>';
    });
    html += '</tbody></table></div>';

    root.innerHTML = html;
  }

  return { render };
})();
