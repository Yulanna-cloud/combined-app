const ANALYTICS = (function () {

  const LEVEL_MAP = {
    'Скрининг': 0,
    'Интервью HR назначено': 1,
    'Интервью HR проведено': 2,
    'Интервью заказчика назначено': 3,
    'Интервью заказчика проведено': 4,
    'Оффер': 5,
    'Обучение': 6,
    'Работает': 7
  };
  const STAGE_ORDER = Object.keys(LEVEL_MAP);
  const HIRED_STATUS = 'Трудоустроен';

  // Текущее состояние фильтров (живёт между перерисовками)
  let filters = { customerId: '', vacancy: '', period: 'all', from: '', to: '' };

  function levelOf(stage) { return LEVEL_MAP[stage] ?? 0; }

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      const v = raw ? JSON.parse(raw) : fallback;
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }

  function loadCandidates() { const a = loadJSON('crm_candidates', []); return Array.isArray(a) ? a : []; }
  function loadHistory() { const a = loadJSON('crm_history', []); return Array.isArray(a) ? a : []; }
  function loadVacancies() { const a = loadJSON('crm_vacancies', []); return Array.isArray(a) ? a : []; }
  function loadVacMeta() { return loadJSON('crm_vac_meta', {}); }
  function loadCustomers() { const a = loadJSON('crm_customers', []); return Array.isArray(a) ? a : [{ id: 'cust_default', name: 'ЭнергоПромСервис' }]; }

  function getMeta(vacMeta, vac) {
    return vacMeta[vac] || { hhLink: '', siteUrl: '', customerId: '', status: 'В работе', openedDate: '', closedDate: '', planHires: '' };
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

  function fmtDate(s) {
    const d = parseDate(s);
    return d ? d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  }

  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ── Вычисление диапазона дат для выбранного периода ──
  function periodRange(period) {
    const now = new Date();
    let from = null, to = null;
    if (period === 'month') {
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'quarter') {
      const q = Math.floor(now.getMonth() / 3);
      from = new Date(now.getFullYear(), q * 3, 1);
      to = new Date(now.getFullYear(), q * 3 + 3, 0);
    } else if (period === 'year') {
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31);
    } else if (period === 'custom') {
      from = parseDate(filters.from);
      to = parseDate(filters.to);
    }
    return { from, to };
  }

  function toISO(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  // ── Применяем фильтры заказчик/вакансия/период к списку кандидатов ──
  function filterCandidates(candidates, vacMeta) {
    let pool = candidates;
    if (filters.vacancy) {
      pool = pool.filter(c => c.vacancy === filters.vacancy);
    } else if (filters.customerId) {
      pool = pool.filter(c => getMeta(vacMeta, c.vacancy).customerId === filters.customerId);
    }
    if (filters.period !== 'all') {
      const { from, to } = periodRange(filters.period);
      if (from) pool = pool.filter(c => c.added && c.added >= toISO(from));
      if (to) pool = pool.filter(c => c.added && c.added <= toISO(to));
    }
    return pool;
  }

  function vacanciesForCustomer(vacancies, vacMeta, customerId) {
    if (!customerId) return vacancies;
    return vacancies.filter(v => getMeta(vacMeta, v).customerId === customerId);
  }

  // ── Отчёт 1: сводка по заказчикам ──
  function reportCustomers(candidates, vacancies, vacMeta, customers) {
    return customers.map(cust => {
      const vacs = vacancies.filter(v => getMeta(vacMeta, v).customerId === cust.id);
      const active = vacs.filter(v => getMeta(vacMeta, v).status === 'В работе').length;
      const closed = vacs.filter(v => getMeta(vacMeta, v).status === 'Закрыта').length;
      const cands = candidates.filter(c => vacs.includes(c.vacancy));
      const hired = cands.filter(c => c.status === HIRED_STATUS).length;
      return { name: cust.name, vacCount: vacs.length, active, closed, candCount: cands.length, hired };
    });
  }

  // ── Отчёт 2: сводка по вакансиям ──
  function reportVacancies(candidates, vacancies, vacMeta, customers) {
    return vacancies.map(v => {
      const meta = getMeta(vacMeta, v);
      const cands = candidates.filter(c => c.vacancy === v);
      const interviews = cands.filter(c => levelOf(c.stage) >= 2).length;
      const offers = cands.filter(c => levelOf(c.stage) >= 5).length;
      const hires = cands.filter(c => c.status === HIRED_STATUS).length;
      const opened = parseDate(meta.openedDate);
      const closed = parseDate(meta.closedDate);
      let ageDays = '—';
      if (opened) {
        const end = closed || new Date();
        ageDays = Math.round((end - opened) / 86400000);
      }
      return {
        vacancy: v,
        customer: getCustomerNameById(customers, meta.customerId),
        status: meta.status || '—',
        opened: meta.openedDate ? fmtDate(meta.openedDate) : '—',
        closed: meta.closedDate ? fmtDate(meta.closedDate) : '—',
        ageDays,
        candCount: cands.length,
        interviews, offers, hires
      };
    });
  }
  function getCustomerNameById(customers, id) {
    const c = customers.find(x => x.id === id);
    return c ? c.name : '—';
  }

  // ── Отчёт 3: воронка — конверсия относительно предыдущего этапа ──
  function reportFunnel(pool) {
    const total = pool.length;
    let prevCount = total;
    const rows = [{ stage: 'Кандидаты', count: total, convPrev: null, convTotal: 100 }];
    STAGE_ORDER.forEach((stage) => {
      if (stage === 'Скрининг') return;
      const count = pool.filter(c => levelOf(c.stage) >= levelOf(stage)).length;
      const convPrev = prevCount > 0 ? Math.round((count / prevCount) * 100) : 0;
      const convTotal = total > 0 ? Math.round((count / total) * 100) : 0;
      rows.push({ stage, count, convPrev, convTotal });
      prevCount = count;
    });
    return rows;
  }

  // ── Отчёт 4: источники ──
  function reportSources(pool) {
    const map = {};
    pool.forEach(c => {
      const src = (c.source || '').trim() || 'Без источника';
      if (!map[src]) map[src] = { source: src, total: 0, hired: 0 };
      map[src].total++;
      if (c.status === HIRED_STATUS) map[src].hired++;
    });
    return Object.values(map).map(s => ({ ...s, conv: s.total ? Math.round((s.hired / s.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total);
  }

  // ── Отчёт 5: сроки закрытия ──
  function reportClosingTime(vacancies, vacMeta) {
    const closedVacs = vacancies.filter(v => getMeta(vacMeta, v).status === 'Закрыта' && getMeta(vacMeta, v).openedDate && getMeta(vacMeta, v).closedDate);
    const rows = closedVacs.map(v => {
      const meta = getMeta(vacMeta, v);
      const days = Math.round((parseDate(meta.closedDate) - parseDate(meta.openedDate)) / 86400000);
      return { vacancy: v, days };
    });
    const avg = rows.length ? Math.round(rows.reduce((a, b) => a + b.days, 0) / rows.length) : null;
    return { avg, rows };
  }

  function bar(label, count, pct, colorClass) {
    return '<div class="an-bar-row">' +
      '<div class="an-bar-label">' + escHtml(label) + '</div>' +
      '<div class="an-bar-track"><div class="an-bar-fill ' + (colorClass || '') + '" style="width:' + Math.min(pct, 100) + '%"></div></div>' +
      '<div class="an-bar-value">' + count + ' (' + pct + '%)</div>' +
      '</div>';
  }

  function renderFilters(vacancies, vacMeta, customers) {
    const custOpts = '<option value="">Все заказчики</option>' +
      customers.map(c => `<option value="${c.id}"${filters.customerId === c.id ? ' selected' : ''}>${escHtml(c.name)}</option>`).join('');
    const vacScope = vacanciesForCustomer(vacancies, vacMeta, filters.customerId);
    const vacOpts = '<option value="">Все вакансии</option>' +
      vacScope.map(v => `<option value="${escHtml(v)}"${filters.vacancy === v ? ' selected' : ''}>${escHtml(v)}</option>`).join('');
    const periods = [
      ['all', 'Всё время'], ['month', 'Этот месяц'], ['quarter', 'Этот квартал'], ['year', 'Этот год'], ['custom', 'Свой период']
    ];
    const periodOpts = periods.map(([v, l]) => `<option value="${v}"${filters.period === v ? ' selected' : ''}>${l}</option>`).join('');
    const customRange = filters.period === 'custom'
      ? `<input type="date" id="an-from" value="${filters.from}" class="an-filter-input"><input type="date" id="an-to" value="${filters.to}" class="an-filter-input">`
      : '';
    return '<div class="an-filters">' +
      '<select id="an-customer" class="an-filter-input">' + custOpts + '</select>' +
      '<select id="an-vacancy" class="an-filter-input">' + vacOpts + '</select>' +
      '<select id="an-period" class="an-filter-input">' + periodOpts + '</select>' +
      customRange +
      '</div>';
  }

  function wireFilters() {
    const cEl = document.getElementById('an-customer');
    const vEl = document.getElementById('an-vacancy');
    const pEl = document.getElementById('an-period');
    if (cEl) cEl.onchange = () => { filters.customerId = cEl.value; filters.vacancy = ''; render(); };
    if (vEl) vEl.onchange = () => { filters.vacancy = vEl.value; render(); };
    if (pEl) pEl.onchange = () => { filters.period = pEl.value; render(); };
    const fromEl = document.getElementById('an-from');
    const toEl = document.getElementById('an-to');
    if (fromEl) fromEl.onchange = () => { filters.from = fromEl.value; render(); };
    if (toEl) toEl.onchange = () => { filters.to = toEl.value; render(); };
  }

  function render() {
    const root = document.getElementById('analytics-content');
    if (!root) return;

    const candidates = loadCandidates();
    const vacancies = loadVacancies();
    const vacMeta = loadVacMeta();
    const customers = loadCustomers();
    const history = loadHistory();

    if (!candidates.length) {
      root.innerHTML = renderFilters(vacancies, vacMeta, customers) +
        '<div class="an-empty">Нет данных — открой раздел CRM и нажми «Загрузить», затем вернись сюда.</div>';
      wireFilters();
      return;
    }

    const pool = filterCandidates(candidates, vacMeta);
    const scopedVacancies = filters.customerId ? vacanciesForCustomer(vacancies, vacMeta, filters.customerId) : vacancies;
    const scopedVacanciesFinal = filters.vacancy ? [filters.vacancy] : scopedVacancies;

    const total = pool.length;
    const active = pool.filter(c => !c.archived).length;
    const hired = pool.filter(c => c.status === HIRED_STATUS).length;

    let html = renderFilters(vacancies, vacMeta, customers);

    html += '<div class="an-stats">' +
      '<div class="an-stat"><div class="an-stat-n">' + total + '</div><div class="an-stat-l">Кандидатов в выборке</div></div>' +
      '<div class="an-stat"><div class="an-stat-n">' + active + '</div><div class="an-stat-l">Активных</div></div>' +
      '<div class="an-stat"><div class="an-stat-n">' + hired + '</div><div class="an-stat-l">Трудоустроено</div></div>' +
      '</div>';

    // 1. Сводка по заказчикам
    if (!filters.customerId) {
      const custReport = reportCustomers(candidates, vacancies, vacMeta, customers);
      html += '<div class="an-section-title">🏛 Сводка по заказчикам</div><div class="an-card"><table class="an-table">' +
        '<thead><tr><th>Заказчик</th><th>Вакансий</th><th>Активных</th><th>Закрытых</th><th>Кандидатов</th><th>Выходов</th></tr></thead><tbody>';
      custReport.forEach(r => {
        html += '<tr><td>' + escHtml(r.name) + '</td><td>' + r.vacCount + '</td><td>' + r.active + '</td><td>' + r.closed + '</td><td>' + r.candCount + '</td><td>' + r.hired + '</td></tr>';
      });
      html += '</tbody></table></div>';
    }

    // 2. Сводка по вакансиям
    const vacReport = reportVacancies(candidates, scopedVacanciesFinal, vacMeta, customers);
    html += '<div class="an-section-title">💼 Сводка по вакансиям</div><div class="an-card" style="overflow-x:auto;"><table class="an-table">' +
      '<thead><tr><th>Вакансия</th><th>Заказчик</th><th>Статус</th><th>Открыта</th><th>Закрыта</th><th>Возраст, дн.</th><th>Кандидатов</th><th>Интервью</th><th>Офферов</th><th>Выходов</th></tr></thead><tbody>';
    vacReport.forEach(r => {
      html += '<tr><td>' + escHtml(r.vacancy) + '</td><td>' + escHtml(r.customer) + '</td><td>' + escHtml(r.status) + '</td><td>' + r.opened + '</td><td>' + r.closed + '</td><td>' + r.ageDays + '</td><td>' + r.candCount + '</td><td>' + r.interviews + '</td><td>' + r.offers + '</td><td>' + r.hires + '</td></tr>';
    });
    html += '</tbody></table></div>';

    // 3. Воронка с конверсией от предыдущего этапа
    const funnel = reportFunnel(pool);
    html += '<div class="an-section-title">📊 Воронка' + (filters.vacancy ? ' — ' + escHtml(filters.vacancy) : '') + '</div><div class="an-card" style="overflow-x:auto;"><table class="an-table">' +
      '<thead><tr><th>Этап</th><th>Кол-во</th><th>% от пред. этапа</th><th>% от общего</th></tr></thead><tbody>';
    funnel.forEach(f => {
      html += '<tr><td>' + escHtml(f.stage) + '</td><td>' + f.count + '</td><td>' + (f.convPrev == null ? '—' : f.convPrev + '%') + '</td><td>' + f.convTotal + '%</td></tr>';
    });
    html += '</tbody></table></div>';

    // 4. Источники
    const sources = reportSources(pool);
    html += '<div class="an-section-title">📥 Источники кандидатов</div><div class="an-card">';
    if (!sources.length) html += '<div class="an-empty" style="padding:20px;">Нет данных в выборке</div>';
    sources.forEach(s => {
      html += bar(s.source + ' — нанято ' + s.hired + ' из ' + s.total, s.total, s.conv, 'an-fill-source');
    });
    html += '</div>';

    // 5. Сроки закрытия
    const closing = reportClosingTime(scopedVacanciesFinal, vacMeta);
    html += '<div class="an-section-title">⏱ Сроки закрытия вакансий</div><div class="an-card">';
    html += '<div class="an-stats" style="margin-bottom:14px;"><div class="an-stat"><div class="an-stat-n">' + (closing.avg != null ? closing.avg + ' дн.' : '—') + '</div><div class="an-stat-l">Средний срок закрытия</div></div></div>';
    if (closing.rows.length) {
      html += '<table class="an-table"><thead><tr><th>Вакансия</th><th>Срок, дн.</th></tr></thead><tbody>';
      closing.rows.forEach(r => { html += '<tr><td>' + escHtml(r.vacancy) + '</td><td>' + r.days + '</td></tr>'; });
      html += '</tbody></table>';
    } else {
      html += '<div class="an-empty" style="padding:10px 0;">Нет закрытых вакансий с заполненными датами открытия/закрытия</div>';
    }
    html += '</div>';

    root.innerHTML = html;
    wireFilters();
  }

  return { render };
})();
