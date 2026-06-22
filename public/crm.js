const CRM = (function() {
const SHEETS_URL='https://script.google.com/macros/s/AKfycbzLAnP96uykzXSoaB0LvTAw-_rRQmlhb79mx73ertJnqCPLz-mgwy-DIoKCKISbKbOo/exec';
function toggleSettingsMenu(){
  const m=document.getElementById('settingsMenu');
  m.style.display=m.style.display==='block'?'none':'block';
}
function closeSettingsMenu(){
  document.getElementById('settingsMenu').style.display='none';
}
document.addEventListener('click',function(e){
  if(!e.target.closest('.dd-wrap')&&!e.target.closest('#stageDD')&&!e.target.closest('#statusDD')){
    document.getElementById('stageDD').style.display='none';
    document.getElementById('statusDD').style.display='none';
  }
  if(!e.target.closest('[onclick*="toggleSettingsMenu"]')&&!e.target.closest('#settingsMenu')){
    const m=document.getElementById('settingsMenu');if(m)m.style.display='none';
  }
});
let VACANCIES=JSON.parse(localStorage.getItem('crm_vacancies')||'null')||['Менеджер по продажам','РОП (Далер)','инженер-сметчик','РОП','Project Manager','инженер-энергетик'];
let VAC_COLORS=JSON.parse(localStorage.getItem('crm_vac_colors')||'null')||{'РОП (Далер)':'#E3F2FD|#0D47A1','инженер-сметчик':'#E8F5E9|#1B5E20','инженер-энергетик':'#E8F5E9|#1B5E20'};
const COLOR_PRESETS=[
  {bg:'#E3F2FD',fg:'#0D47A1',name:'Синий'},
  {bg:'#E8F5E9',fg:'#1B5E20',name:'Зелёный'},
  {bg:'#FFF3E0',fg:'#E65100',name:'Оранжевый'},
  {bg:'#F3E5F5',fg:'#6A1B9A',name:'Фиолетовый'},
  {bg:'#FCE4EC',fg:'#880E4F',name:'Розовый'},
  {bg:'#E0F7FA',fg:'#006064',name:'Бирюзовый'},
  {bg:'#FFFDE7',fg:'#F57F17',name:'Жёлтый'},
  {bg:'#FBE9E7',fg:'#BF360C',name:'Красный'},
  {bg:'#F1F8E9',fg:'#33691E',name:'Лайм'},
  {bg:'#EDE7F6',fg:'#311B92',name:'Индиго'},
];
let VAC_META=JSON.parse(localStorage.getItem('crm_vac_meta')||'{}');
function saveVacancies(){localStorage.setItem('crm_vacancies',JSON.stringify(VACANCIES));localStorage.setItem('crm_vac_colors',JSON.stringify(VAC_COLORS));localStorage.setItem('crm_vac_meta',JSON.stringify(VAC_META));}
function getVacMeta(vac){return VAC_META[vac]||{hhLink:'',siteUrl:''};}
function setVacMeta(vac,field,val){if(!VAC_META[vac])VAC_META[vac]={};VAC_META[vac][field]=val;saveVacancies();}
function getVacStyle(v){
  const c=VAC_COLORS[v];
  if(!c)return null;
  const parts=c.split('|');
  return{bg:parts[0],fg:parts[1]};
}
function vacBadge(v){
  const s=getVacStyle(v);
  if(!s)return v;
  return `<span style="background:${s.bg};color:${s.fg};font-weight:600;border-radius:12px;padding:3px 10px;display:inline-block;font-size:12px">${v}</span>`;
}
function updateFVSelect(){
  const fv=document.getElementById('fV');if(!fv)return;
  const cur=fv.value;
  fv.innerHTML=`<option value="">Все вакансии</option>`+VACANCIES.map(v=>`<option${v===cur?' selected':''}>${v}</option>`).join('');
}
function openVacancySettings(){
  modal(`<h2>🏢 Управление вакансиями</h2>
<p style="font-size:13px;color:#666;margin-bottom:12px">Добавляй, переименовывай, задавай цвет или удаляй вакансии.</p>
<div id="vacList"></div>
<div class="fr" style="margin-top:12px">
<label>Добавить новую вакансию</label>
<div style="display:flex;gap:8px">
<input id="newVacName" placeholder="Название вакансии" style="flex:1;padding:8px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px">
<button class="btn btn-primary" onclick="CRM.addVacancy()">Добавить</button>
</div>
</div>
<div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Закрыть</button></div>`);
  renderVacList();
}
function renderVacList(){
  const el=document.getElementById('vacList');if(!el)return;
  el.innerHTML=VACANCIES.map((v,i)=>{
    const s=getVacStyle(v);
    const colorDots=COLOR_PRESETS.map(p=>`<span class="color-swatch" style="background:${p.bg};border-color:${p.fg}${s&&s.bg===p.bg?';outline:2px solid #333':''}" title="${p.name}" onclick="CRM.setVacColor(${i},'${p.bg}|${p.fg}')"></span>`).join('');
    const clearBtn=s?`<span class="color-swatch" style="background:#fff;border-color:#ccc" title="Без цвета" onclick="CRM.clearVacColor(${i})">✕</span>`:'';
    return `<div style="padding:8px 0;border-bottom:1px solid #f0f0f0">
<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
<input value="${v}" id="vac_${i}" style="flex:1;padding:6px 10px;border:1px solid #ddd;border-radius:6px;font-size:13px">
<button class="btn btn-sm" onclick="CRM.saveVacancyName(${i})">💾</button>
<button class="btn btn-sm" style="color:#c62828;border-color:#ef9a9a" onclick="CRM.removeVacancy(${i})">🗑</button>
</div>
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;padding-left:4px">
<span style="font-size:11px;color:#888">Цвет:</span>
        ${colorDots}${clearBtn}
        ${s?`<span style="background:${s.bg};color:${s.fg};border-radius:8px;padding:2px 8px;font-size:11px;font-weight:600">${v}</span>`:''}
</div>
</div>\n<div style="display:flex;gap:6px;margin-top:6px;padding:0 4px;" class="vac-meta-row"><input type="text" placeholder="Ссылка HH (заполни один раз)" class="vac-meta-input" data-vac="${v}" data-field="hhLink" value="${getVacMeta(v).hhLink}" style="flex:1;font-size:11px;padding:4px 6px;border:1px solid #ddd;border-radius:4px;"><input type="text" placeholder="Сайт компании" class="vac-meta-input" data-vac="${v}" data-field="siteUrl" value="${getVacMeta(v).siteUrl}" style="flex:1;font-size:11px;padding:4px 6px;border:1px solid #ddd;border-radius:4px;"></div>`;
  }).join('');
}
function setVacColor(i,colorStr){
  VAC_COLORS[VACANCIES[i]]=colorStr;
  saveVacancies();renderVacList();render();
}
function clearVacColor(i){
  delete VAC_COLORS[VACANCIES[i]];
  saveVacancies();renderVacList();render();
}
function addVacancy(){
  const input=document.getElementById('newVacName');const name=input?.value.trim();
  if(!name){alert('Введите название');return;}
  if(VACANCIES.includes(name)){alert('Такая вакансия уже есть');return;}
  VACANCIES.push(name);saveVacancies();updateFVSelect();input.value='';renderVacList();
}
function saveVacancyName(i){
  const input=document.getElementById(`vac_${i}`);const name=input?.value.trim();
  if(!name){alert('Введите название');return;}
  const old=VACANCIES[i];
  if(VAC_COLORS[old]){VAC_COLORS[name]=VAC_COLORS[old];delete VAC_COLORS[old];}
  D.candidates.forEach(c=>{if(c.vacancy===old)c.vacancy=name;});
  VACANCIES[i]=name;saveVacancies();updateFVSelect();saveLocal();renderVacList();render();
}
function removeVacancy(i){
  const vac=VACANCIES[i];const count=D.candidates.filter(c=>c.vacancy===vac).length;
  if(count>0&&!confirm(`По вакансии "${vac}" есть ${count} кандидатов. Удалить вакансию из списка?`))return;
  delete VAC_COLORS[vac];VACANCIES.splice(i,1);saveVacancies();updateFVSelect();renderVacList();
}
function setSyncStatus(msg,type){
  const el=document.getElementById('syncStatus');
  el.style.display='inline-block';el.className='sync-status sync-'+type;el.textContent=msg;
  if(type==='ok')setTimeout(()=>el.style.display='none',3000);
}
function syncToSheets(){
  setSyncStatus('⏳ Сохраняю...','loading');
  fetch(SHEETS_URL,{method:'POST',body:JSON.stringify({candidates:D.candidates,history:D.history})})
    .then(r=>r.json()).then(res=>{res&&res.ok?setSyncStatus('✅ Сохранено!','ok'):setSyncStatus('❌ Ошибка','err');})
    .catch(()=>setSyncStatus('❌ Нет соединения','err'));
}
function loadFromSheets(){
  setSyncStatus('⏳ Загружаю...','loading');
  const script=document.createElement('script'),cbName='cb_read_'+Date.now();
  window[cbName]=function(res){
    delete window[cbName];document.head.removeChild(script);
    if(res&&res.ok&&res.data){
      if(res.data.candidates){
        const localMap={};D.candidates.forEach(c=>{if(c.archived)localMap[c.id]=true;});
        D.candidates=res.data.candidates.map(c=>({...c,status:normalizeStatus(c.status),archived:localMap[c.id]||c.archived||false}));
      }
      if(res.data.history)D.history=res.data.history;
      saveLocal();render();setSyncStatus('✅ Загружено!','ok');
    }else setSyncStatus('❌ Ошибка загрузки','err');
  };
  script.src=SHEETS_URL+'?action=read&callback='+cbName;
  script.onerror=()=>{delete window[cbName];setSyncStatus('❌ Нет соединения','err');};
  document.head.appendChild(script);
}
function normalizeStatus(s){
  if(!s)return s;
  if(s==='Отказался сам'||s==='Отказалась сама')return 'Отказался сам (кандидат)';
  if(s==='Не вышла на собес')return 'Не вышел на собеседование';
  return s;
}
const STAGES=['Отклик','Интервью HR — назначено','Интервью HR — проведено','Интервью с РОП — назначено','Интервью с РОП — проведено','Оффер','Обучение','Работает'];
const STATUSES=['В работе','Перенос собеседования','Недозвон','Перезвон','Отказался сам (кандидат)','Отказ','Оффер','Вышел','Не вышел на собеседование','Вакансия закрыта'];
const EVENTS=['Добавлен кандидат','Интервью HR — назначено','Интервью HR — проведено','Интервью с РОП — назначено','Интервью с РОП — проведено','Оффер отправлен','Оффер принят','Отказался сам (кандидат)','Отказ компании','Выход на работу'];
const REFUSE_REASONS=['','Слабый','Не пришёл на интервью','Не подходит доход','Принял другой оффер','Нерелевантный опыт','Другое'];
const INACTIVE=['Отказ','Отказался сам (кандидат)','Вышел','Не вышел на собеседование','Вакансия закрыта'];
const REFUSE_STATUSES=['Отказ','Отказался сам (кандидат)','Не вышел на собеседование'];
function stageLevel(stage){
  const map={'Отклик':0,'Интервью HR — назначено':1,'Интервью HR':2,'Интервью HR — проведено':2,'Интервью с РОП — назначено':3,'Интервью с руководителем':4,'Финал':4,'Интервью с РОП — проведено':4,'Оффер':5,'Обучение':6,'Работает':7,'Выход':7};
  return map[stage]??0;
}
let D={candidates:[],history:[]};
function loadLocal(){
  try{const s=localStorage.getItem('crm_candidates');if(s){const p=JSON.parse(s);if(Array.isArray(p))D.candidates=p.map(c=>({...c,status:normalizeStatus(c.status)}));}}catch(e){D.candidates=[];}
  try{const s=localStorage.getItem('crm_history');if(s){const p=JSON.parse(s);if(Array.isArray(p))D.history=p;}}catch(e){D.history=[];}
}
function saveLocal(){localStorage.setItem('crm_candidates',JSON.stringify(D.candidates));localStorage.setItem('crm_history',JSON.stringify(D.history));}
function saveData(){saveLocal();syncToSheets();}
function todayStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function parseDate(s){if(!s)return null;const p=s.split('-');if(p.length!==3)return null;return new Date(parseInt(p[0]),parseInt(p[1])-1,parseInt(p[2]));}
function isSameDay(ds){const d=parseDate(ds);if(!d)return false;const t=new Date();return d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&d.getDate()===t.getDate();}
function nextId(){if(!D.candidates.length)return 'K-001';const nums=D.candidates.map(c=>parseInt(c.id.replace(/\D/g,''))||0);return 'K-'+String(Math.max(...nums)+1).padStart(3,'0');}
function sel(opts,val){return opts.map(o=>`<option${o===val?' selected':''}>${o}</option>`).join('');}
function selStage(val){const opts=[...STAGES];if(val&&!opts.includes(val))opts.push(val);return opts.map(o=>`<option${o===val?' selected':''}>${o}</option>`).join('');}
function toggleRefuse(s,divId){const d=document.getElementById(divId);if(d)d.style.display=['Отказ','Отказался сам (кандидат)'].includes(s.value)?'block':'none';}
function sbadge(s){
  const m={'В работе':'bw','Перенос собеседования':'bpurple','Оффер':'bo','Вышел':'bout','Отказ':'br','Отказался сам (кандидат)':'brs','Не вышел на собеседование':'bnv','Недозвон':'bnedozvon','Перезвон':'bperezv','Вакансия закрыта':'bvclosed'};
  return `<span class="badge ${m[s]||'bdef'}">${s}</span>`;
}
function dlabel(ds){const d=parseDate(ds);if(!d)return '';const today=new Date();today.setHours(0,0,0,0);d.setHours(0,0,0,0);const diff=Math.round((d-today)/86400000);const cls=diff<0?'dr':diff===0?'dy':'dg';return `<span class="dot ${cls}"></span>${d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'})}`;}
function rclass(c){if(INACTIVE.includes(c.status))return 'row-done';if(!c.nextDate)return '';const d=parseDate(c.nextDate);if(!d)return '';const today=new Date();today.setHours(0,0,0,0);d.setHours(0,0,0,0);const diff=Math.round((d-today)/86400000);return diff<0?'row-overdue':diff===0?'row-today':'';}
let sortCol='id',sortDir=1;
function sortBy(col){sortCol===col?sortDir*=-1:(sortCol=col,sortDir=1);renderTable();}
function arrow(col){return sortCol===col?(sortDir===1?' ↑':' ↓'):'';}
function getChecked(ddId){return[...document.querySelectorAll(`#${ddId} input[type=checkbox]:checked`)].map(x=>x.value);}
function applyStageFilter(){const c=getChecked('stageDD');document.getElementById('stageBtnLabel').textContent=c.length?c.join(', ')+' ▾':'Все этапы ▾';renderTable();}
function applyStatusFilter(){const c=getChecked('statusDD');document.getElementById('statusBtnLabel').textContent=c.length?c.join(', ')+' ▾':'Все статусы ▾';renderTable();}
function clearStageFilter(){document.querySelectorAll('#stageDD input').forEach(x=>x.checked=false);document.getElementById('stageBtnLabel').textContent='Все этапы ▾';document.getElementById('stageDD').style.display='none';renderTable();}
function clearStatusFilter(){document.querySelectorAll('#statusDD input').forEach(x=>x.checked=false);document.getElementById('statusBtnLabel').textContent='Все статусы ▾';document.getElementById('statusDD').style.display='none';renderTable();}
function toggleDD(id){['stageDD','statusDD'].filter(x=>x!==id).forEach(x=>document.getElementById(x).style.display='none');const dd=document.getElementById(id);dd.style.display=dd.style.display==='none'?'block':'none';}
function setToday(){document.getElementById('fDate').value=todayStr();renderTable();}
function clearDate(){document.getElementById('fDate').value='';renderTable();}
function renderStats(){
  const active=D.candidates.filter(x=>!x.archived&&x.status==='В работе').length;
  const offers=D.candidates.filter(x=>!x.archived&&x.status==='В работе'&&x.stage==='Оффер').length;
  const tod=D.candidates.filter(x=>!x.archived&&!INACTIVE.includes(x.status)&&isSameDay(x.nextDate)).length;
  const ref=D.candidates.filter(x=>!x.archived&&REFUSE_STATUSES.includes(x.status)).length;
  document.getElementById('stats').innerHTML=`
<div class="stat"><div class="stat-n">${active}</div><div class="stat-l">В работе</div></div>
<div class="stat"><div class="stat-n">${offers}</div><div class="stat-l">На стадии оффера</div></div>
<div class="stat" onclick="CRM.setToday()"><div class="stat-n">${tod}</div><div class="stat-l">Встреч сегодня 👆</div></div>
<div class="stat"><div class="stat-n">${ref}</div><div class="stat-l">Отказов</div></div>`;
}
function renderHeaders(){
  const cols=[{key:'id',label:'ID',w:'60px'},{key:'name',label:'ФИО',w:'180px'},{key:'vacancy',label:'Вакансия',w:'170px'},{key:'stage',label:'Этап',w:'170px'},{key:'status',label:'Статус',w:'165px'},{key:'',label:'Следующий шаг',w:'160px'},{key:'date',label:'Дата',w:'90px'},{key:'',label:'Время',w:'70px'},{key:'',label:'Телефон',w:'130px'},{key:'',label:'Причина отказа',w:'120px'},{key:'',label:'Комментарий',w:'200px'},{key:'',label:'Резюме',w:'70px'},{key:'',label:'HH',w:'70px'},{key:'',label:'',w:'50px'}];
  document.getElementById('thead-row').innerHTML=cols.map(c=>`<th${c.key?` onclick="CRM.sortBy('${c.key}')"`:''} style="width:${c.w};padding:10px 12px;background:#1F3864;color:#fff;font-weight:700;border-bottom:2px solid #162a4a;white-space:nowrap${c.key?';cursor:pointer':''}">${c.label}${c.key?arrow(c.key):''}</th>`).join('');
}
function renderTable(){
  const tb=document.getElementById('tb');renderHeaders();
  const q=(document.getElementById('srch').value||'').toLowerCase();
  const fv=document.getElementById('fV').value;
  const stages=getChecked('stageDD');const statuses=getChecked('statusDD');
  const activeOnly=document.getElementById('activeOnly').checked;
  const fDate=document.getElementById('fDate').value;
  let rows=D.candidates.filter(c=>{
    if(c.archived)return false;
    if(q&&!c.name.toLowerCase().includes(q))return false;
    if(fv&&c.vacancy!==fv)return false;
    if(stages.length&&!stages.includes(c.stage))return false;
    if(statuses.length&&!statuses.includes(c.status))return false;
    if(activeOnly&&!statuses.length&&INACTIVE.includes(c.status))return false;
    if(fDate&&c.nextDate!==fDate)return false;
    return true;
  });
  rows.sort((a,b)=>{
    if(sortCol==='id')return sortDir*(parseInt(a.id.replace(/\D/g,''))-parseInt(b.id.replace(/\D/g,'')));
    if(sortCol==='date'){const ad=a.nextDate||'9999',bd=b.nextDate||'9999';if(ad!==bd)return sortDir*ad.localeCompare(bd);return sortDir*(a.meetTime||'').localeCompare(b.meetTime||'');}
    const av=(sortCol==='name'?a.name:sortCol==='stage'?a.stage:sortCol==='status'?a.status:sortCol==='vacancy'?a.vacancy:'')||'';
    const bv=(sortCol==='name'?b.name:sortCol==='stage'?b.stage:sortCol==='status'?b.status:sortCol==='vacancy'?b.vacancy:'')||'';
    return sortDir*av.localeCompare(bv,'ru');
  });
  if(!rows.length){tb.innerHTML=`<tr><td colspan="14" class="empty">Нет кандидатов</td></tr>`;return;}
  tb.innerHTML=rows.map(c=>{
    let phone='';if(c.contacts){for(let p of c.contacts.split(' / ')){if(p.match(/[\d\+]/)){phone=p;break;}}}
    const resume=c.resumeLink?`<a href="${c.resumeLink}" target="_blank" style="color:#185FA5">Открыть</a>`:'—';
    const hh=c.hhLink?`<a href="${c.hhLink}" target="_blank" style="color:#d6001c">HH ↗</a>`:'—';
    const refReason=REFUSE_STATUSES.includes(c.status)&&c.refuseReason?`<span class="badge br">${c.refuseReason}</span>`:'';
    return `<tr class="${rclass(c)}"><td>${c.id}</td><td><b>${c.name}</b></td><td>${vacBadge(c.vacancy)}</td><td>${c.stage}</td><td>${sbadge(c.status)}</td><td>${c.next||'—'}</td><td>${dlabel(c.nextDate)}</td><td>${c.meetTime||''}</td><td>${phone||'—'}</td><td>${refReason}</td><td style="max-width:200px;white-space:normal">${c.comment||''}</td><td>${resume}</td><td>${hh}</td><td><button class="btn btn-sm" onclick="CRM.openEdit('${c.id}')">✏️</button></td></tr>`;
  }).join('');
}
function renderHistory(){
  const hb=document.getElementById('hb');
  const items=[...D.history].reverse();
  if(!items.length){hb.innerHTML=`<div class="empty">История пуста</div>`;return;}
  hb.innerHTML=items.map(h=>`<div class="hist-item"><div>${h.date?new Date(h.date+'T12:00:00').toLocaleDateString('ru-RU'):''}</div><div><b>${h.name||''}</b><br><small>${h.cid||''}</small></div><div><b>${h.event||''}</b><br>${h.desc||''}${h.result?`<br><small>${h.result}</small>`:''}</div><div>${h.resp||''}</div></div>`).join('');
}
function renderArchive(){
  const atb=document.getElementById('atb');const athead=document.getElementById('athead-row');if(!atb||!athead)return;
  const archived=D.candidates.filter(c=>c.archived);
  athead.innerHTML='<th style="background:#1F3864;color:#fff;padding:10px 12px">ID</th><th style="background:#1F3864;color:#fff;padding:10px 12px">ФИО</th><th style="background:#1F3864;color:#fff;padding:10px 12px">Вакансия</th><th style="background:#1F3864;color:#fff;padding:10px 12px">Этап</th><th style="background:#1F3864;color:#fff;padding:10px 12px">Статус</th><th style="background:#1F3864;color:#fff;padding:10px 12px">Причина</th><th style="background:#1F3864;color:#fff;padding:10px 12px">Добавлен</th><th style="background:#1F3864;color:#fff;padding:10px 12px"></th>';
  if(!archived.length){atb.innerHTML=`<tr><td colspan="8" class="empty">Архив пуст</td></tr>`;return;}
  atb.innerHTML=archived.map(c=>`<tr class="row-done"><td>${c.id}</td><td><b>${c.name}</b></td><td>${c.vacancy}</td><td>${c.stage}</td><td>${sbadge(c.status)}</td><td>${c.refuseReason?`<span class="badge br">${c.refuseReason}</span>`:''}</td><td>${c.added||''}</td><td><button class="btn btn-sm" onclick="CRM.unarchiveCandidate('${c.id}')" title="Вернуть">↩️</button></td></tr>`).join('');
}
function render(){renderStats();renderTable();renderHistory();renderArchive();}
function switchTab(t,el){document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));el.classList.add('active');document.getElementById('tc').style.display=t==='c'?'block':'none';document.getElementById('th').style.display=t==='h'?'block':'none';document.getElementById('ta').style.display=t==='a'?'block':'none';}
document.getElementById('srch').addEventListener('input',renderTable);
document.getElementById('fV').addEventListener('input',renderTable);
function closeModal(){document.getElementById('mdl').style.display='none';}
function modal(html,wide){const m=document.getElementById('mdl');m.style.display='flex';m.className='modal-bg';m.innerHTML=`<div class="modal${wide?' modal-wide':''}">${html}</div>`;}
document.getElementById('mdl').addEventListener('click',function(e){if(e.target===this)closeModal();});
function archiveCandidate(id){const c=D.candidates.find(x=>x.id===id);if(!c)return;if(!confirm(`Архивировать ${c.name}?`))return;c.archived=true;saveData();closeModal();render();}
function unarchiveCandidate(id){const c=D.candidates.find(x=>x.id===id);if(!c)return;c.archived=false;saveData();render();}

// ── Вспомогательные функции ──────────────────────────────────────
function copyText(text){
  navigator.clipboard.writeText(text).then(function(){alert('Скопировано!');})
  .catch(function(){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);alert('Скопировано!');});
}

// ── Слоты для встреч ─────────────────────────────────────────────
const ZOOM_LINK='https://us05web.zoom.us/j/8208122054?pwd=SHAzL1kwTmcyYm1PdkdzNVNLNUZ6dz09';
function getSlots(){try{return JSON.parse(localStorage.getItem('crm_slots')||'[]');}catch(e){return[];}}
function saveSlots(slots){localStorage.setItem('crm_slots',JSON.stringify(slots));}


// ── Руководители ─────────────────────────────────────────────────
function getManagers(){try{return JSON.parse(localStorage.getItem('crm_managers')||'[]');}catch(e){return[];}}
function saveManagers(m){localStorage.setItem('crm_managers',JSON.stringify(m));}

function openManagersSettings(){
  var mgrs=getManagers();
  var rows=mgrs.length?mgrs.map(function(m,i){
    return '<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">'+
      '<input class="mgr-name" data-i="'+i+'" type="text" value="'+m.name+'" placeholder="ФИО руководителя" style="flex:2;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;">'+
      '<input class="mgr-phone" data-i="'+i+'" type="text" value="'+m.phone+'" placeholder="Телефон" style="flex:1;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;">'+
      '<input class="mgr-company" data-i="'+i+'" type="text" value="'+m.company+'" placeholder="Компания" style="flex:1;padding:5px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;">'+
      '<button class="btn btn-sm" style="color:#c62828;border-color:#ef9a9a;flex-shrink:0;" onclick="CRM.deleteManager('+i+')">✕</button>'+
      '</div>';
  }).join(''):'<p style="color:#aaa;font-size:13px;margin-bottom:10px;">Нет руководителей.</p>';

  modal('<h2>👤 Руководители</h2>'+
    '<p style="font-size:12px;color:#666;margin-bottom:14px">Добавь руководителей которые проводят встречи. В приглашении можно будет выбрать нужного.</p>'+
    '<div id="mgrList">'+rows+'</div>'+
    '<div style="display:flex;gap:6px;margin-top:8px;margin-bottom:16px;">'+
    '<input id="newMgrName" type="text" placeholder="ФИО руководителя" style="flex:2;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;">'+
    '<input id="newMgrPhone" type="text" placeholder="Телефон" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;">'+
    '<input id="newMgrCompany" type="text" placeholder="Компания" style="flex:1;padding:6px 8px;border:1px solid #ddd;border-radius:4px;font-size:13px;">'+
    '<button class="btn btn-primary" onclick="CRM.addManager()" style="flex-shrink:0;">+ Добавить</button>'+
    '</div>'+
    '<div class="mfoot"><button class="btn" onclick="CRM.saveManagerEdits();CRM.closeModal()">Сохранить и закрыть</button></div>');
}

function addManager(){
  var name=document.getElementById('newMgrName').value.trim();
  var phone=document.getElementById('newMgrPhone').value.trim();
  var company=document.getElementById('newMgrCompany').value.trim();
  if(!name){alert('Введи ФИО');return;}
  var mgrs=getManagers();
  mgrs.push({name:name,phone:phone,company:company});
  saveManagers(mgrs);
  document.getElementById('newMgrName').value='';
  document.getElementById('newMgrPhone').value='';
  document.getElementById('newMgrCompany').value='';
  openManagersSettings();
}

function deleteManager(i){
  var mgrs=getManagers();mgrs.splice(i,1);saveManagers(mgrs);openManagersSettings();
}

function saveManagerEdits(){
  var mgrs=getManagers();
  document.querySelectorAll('.mgr-name').forEach(function(el){
    var i=parseInt(el.getAttribute('data-i'));
    if(mgrs[i])mgrs[i].name=el.value;
  });
  document.querySelectorAll('.mgr-phone').forEach(function(el){
    var i=parseInt(el.getAttribute('data-i'));
    if(mgrs[i])mgrs[i].phone=el.value;
  });
  document.querySelectorAll('.mgr-company').forEach(function(el){
    var i=parseInt(el.getAttribute('data-i'));
    if(mgrs[i])mgrs[i].company=el.value;
  });
  saveManagers(mgrs);
}

// ── Автозаполнение следующего шага ───────────────────────────────
function autoFillNextStep(stage, dateRaw) {
  const nextEl = document.getElementById('fnx'); // поле следующий шаг
  if (!nextEl) return;

  // Форматируем дату если есть
  let dateStr = '';
  if (dateRaw) {
    const d = new Date(dateRaw + 'T12:00:00');
    dateStr = ' ' + d.toLocaleDateString('ru-RU', {day:'2-digit', month:'2-digit', year:'numeric'});
  }

  const map = {
    'Отклик':                      'Назначить видео-интервью с HR',
    'Интервью HR — назначено':     'Видео-интервью' + dateStr,
    'Интервью HR — проведено':     'Назначить встречу с РОП',
    'Интервью с РОП — назначено':  'Встреча в офисе' + dateStr,
    'Интервью с РОП — проведено':  'Решение по кандидату, ОС',
    'Оффер':                       'Дата выхода:' + dateStr,
    'Обучение':                    'Дата начала обучения:' + dateStr,
    'Работает':                    ''
  };

  if (stage in map) {
    nextEl.value = map[stage];
  }
}

function openSlotsManager(){
  var slots=getSlots();
  var today=todayStr();
  // Последняя выбранная дата или завтра
  var lastDate=localStorage.getItem('crm_last_slot_date')||'';
  if(!lastDate||lastDate<today){
    // Вычисляем завтра
    var tm=new Date();tm.setDate(tm.getDate()+1);
    lastDate=tm.toISOString().slice(0,10);
  }
  // Разделяем на актуальные и прошедшие
  var future=slots.filter(function(s){return s.dateRaw>=today;});
  var past=slots.filter(function(s){return s.dateRaw<today;});
  var rows=future.length?future.map(function(s,i){
    var realIdx=slots.indexOf(s);
    return '<div class="slot-item '+(s.taken?'taken':'free')+'"><div><span class="slot-time">'+s.time+'</span> <span style="color:#555;margin-left:8px;">'+s.date+'</span>'+(s.taken?' <span style="font-size:11px;color:#a02020;margin-left:6px;">занят: '+s.takenBy+'</span>':'')+'</div><button class="btn btn-sm" style="color:#c62828;border-color:#ef9a9a;" onclick="CRM.deleteSlot('+realIdx+')">✕</button></div>';
  }).join(''):'<p style="color:#aaa;font-size:13px;padding:8px 0;">Нет предстоящих слотов.</p>';
  var pastInfo=past.length?'<div style="font-size:11px;color:#aaa;margin-top:8px;">Прошедших слотов: '+past.length+' <button class="btn btn-sm" style="font-size:11px;" onclick="CRM.clearPastSlots()">Удалить прошедшие</button></div>':'';
  modal('<h2>📅 Мои слоты для встреч</h2>'+
    '<p style="font-size:12px;color:#666;margin-bottom:12px">Добавляй своё время (Уфа +5). В карточке кандидата нажми «Назначить встречу» чтобы выбрать слот.</p>'+
    '<div class="f2" style="margin-bottom:8px;">'+
    '<div class="fr"><label>Дата</label><input type="date" id="slotDate" value="'+lastDate+'"></div>'+
    '<div class="fr"><label>Время (Уфа +5)</label><input type="time" id="slotTime" value="10:00"></div>'+
    '</div>'+
    '<button class="btn btn-primary" style="width:100%;margin-bottom:14px;" onclick="CRM.addSlot()">+ Добавить слот</button>'+
    '<div id="slotsList">'+rows+'</div>'+
    pastInfo+
    '<div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Закрыть</button></div>');
}

function clearPastSlots(){
  var today=todayStr();
  var slots=getSlots().filter(function(s){return s.dateRaw>=today;});
  saveSlots(slots);openSlotsManager();
}

function addSlot(){
  var date=document.getElementById('slotDate').value,time=document.getElementById('slotTime').value;
  if(!date||!time){alert('Выбери дату и время');return;}
  localStorage.setItem('crm_last_slot_date',date); // запоминаем дату
  var slots=getSlots();
  var d=new Date(date+'T12:00:00');
  var ds=d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
  slots.push({date:ds,dateRaw:date,time:time,taken:false,takenBy:''});
  slots.sort(function(a,b){return (a.dateRaw+a.time).localeCompare(b.dateRaw+b.time);});
  saveSlots(slots);openSlotsManager();
}

function deleteSlot(i){var s=getSlots();s.splice(i,1);saveSlots(s);openSlotsManager();}

function openBookSlot(candidateId){
  var cand=D.candidates.find(function(x){return x.id===candidateId;});
  if(!cand)return;
  var now=new Date();
  var todayDate=todayStr();
  var currentTime=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  // Только свободные И будущие слоты
  var slots=getSlots().filter(function(s){
    if(s.taken)return false;
    if(s.dateRaw<todayDate)return false;
    if(s.dateRaw===todayDate&&s.time<=currentTime)return false;
    return true;
  });
  if(!slots.length){alert('Нет свободных предстоящих слотов.\nДобавь их в Настройки → Мои слоты');return;}
  var allSlots=getSlots();
  var rows=slots.map(function(s){
    // Ищем по dateRaw+time чтобы получить правильный индекс
    var realIdx=allSlots.findIndex(function(x){return x.dateRaw===s.dateRaw&&x.time===s.time&&!x.taken;});
    return '<div class="slot-item free" data-cid="'+candidateId+'" data-si="'+realIdx+'"><div><span class="slot-time">'+s.time+'</span> <span style="font-size:13px;color:#555;margin-left:8px;">'+s.date+'</span></div><span style="color:#2e7d32;font-size:13px;">✓ выбрать</span></div>';
  }).join('');
  modal('<h2>📅 Выбери время встречи</h2><p style="font-size:12px;color:#666;margin-bottom:12px">'+cand.name+'</p>'+rows+'<div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Отмена</button></div>');
}

function bookSlot(cid,si){
  var cand=D.candidates.find(function(x){return x.id===cid;});if(!cand)return;
  var all=getSlots();
  // si теперь реальный индекс в массиве
  var slot=all[si];if(!slot)return;
  all[si].taken=true;all[si].takenBy=cand.name;saveSlots(all);
  cand.nextDate=slot.dateRaw;cand.meetTime=slot.time;cand.next='Видео-интервью';
  saveData();closeModal();render();openSendInvite(cid,slot);
}

function mskTime(timeStr){
  if(!timeStr||timeStr==='--:--')return '';
  var p=timeStr.split(':'),h=parseInt(p[0])-2;if(h<0)h+=24;
  return String(h).padStart(2,'0')+':'+p[1]+' (МСК)';
}

function openSendInvite(cid,slot){
  var cand=D.candidates.find(function(x){return x.id===cid;});if(!cand)return;
  var mt=mskTime(slot.time);
  var text='Добрый день!\nПриглашаю Вас на видео-встречу по вакансии '+(cand.vacancy||'')+'\nДата и время: '+slot.date+' в '+mt+'\nСсылка-приглашение: '+ZOOM_LINK+'\n\nСообщите заранее, пожалуйста, если не сможете подключиться.';
  var phone=(cand.contacts||'').replace(/\D/g,'');
  var waLink='https://wa.me/'+(phone||'')+'?text='+encodeURIComponent(text);
  var tgLink=phone?'https://t.me/+'+phone:'https://t.me/';
  modal('<h2>📨 Отправить приглашение</h2><div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:12px;margin-bottom:14px;"><strong>Текст:</strong><br><br><div id="inviteText" style="white-space:pre-wrap;font-size:12px;color:#333;line-height:1.7;">'+text.replace(/\n/g,'<br>')+'</div></div><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px;"><button id="tgInvBtn" class="btn btn-primary" style="background:#229ED9;border-color:#229ED9;">📱 Telegram</button><a href="'+waLink+'" target="_blank" class="btn btn-primary" style="background:#25D366;border-color:#25D366;text-align:center;text-decoration:none;">💬 WhatsApp</a><button class="btn btn-primary" style="background:#FF5C00;border-color:#FF5C00;" id="copyInvBtn1">📋 Скопировать</button></div><p style="font-size:11px;color:#888;">Telegram — скопирует текст и откроет чат. WhatsApp — текст вставится автоматически.</p><div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Закрыть</button></div>');
  setTimeout(function(){
    var b=document.getElementById('tgInvBtn');if(b)b.onclick=function(){copyText(document.getElementById('inviteText').innerText);window.open(tgLink,'_blank');};
    var cb=document.getElementById('copyInvBtn1');if(cb)cb.onclick=function(){copyText(document.getElementById('inviteText').innerText);};
  },100);
}

function insertManager(){
  var sel=document.getElementById('mgrSelect');
  if(!sel||!sel.value)return;
  var mgrs=getManagers();
  var m=mgrs[parseInt(sel.value)];
  if(!m)return;
  var ta=document.getElementById('officeText');
  if(!ta)return;
  // Replace placeholder lines
  ta.value=ta.value
    .replace('ФИО руководителя: ', 'ФИО руководителя: '+m.name)
    .replace('Телефон: ', 'Телефон: '+(m.phone||''));
}

function openSendInviteAgain(cid){
  var cand=D.candidates.find(function(x){return x.id===cid;});if(!cand||!cand.meetTime)return;
  var all=getSlots(),slot=all.find(function(s){return s.taken&&s.takenBy===cand.name;});
  if(!slot)slot={date:cand.nextDate||'',time:cand.meetTime};
  openSendInvite(cid,slot);
}

function releaseSlot(cid){
  var cand=D.candidates.find(function(x){return x.id===cid;});if(!cand)return;
  var all=getSlots(),i=all.findIndex(function(s){return s.taken&&s.takenBy===cand.name;});
  if(i>-1){all[i].taken=false;all[i].takenBy='';saveSlots(all);}
  cand.meetTime='';cand.nextDate='';cand.next='';
  saveData();closeModal();render();
  setTimeout(function(){openBookSlot(cid);},300);
}

function openOfficeInvite(cid){
  var cand=D.candidates.find(function(x){return x.id===cid;});if(!cand)return;
  var dateStr='';
  if(cand.nextDate){var d=new Date(cand.nextDate+'T12:00:00');dateStr=d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});}
  var mt=mskTime(cand.meetTime||'');
  var dateTime=(dateStr||'дата')+(mt?' в '+mt:'');
  var address='ул. Баки Урманче, 11к1';
  var meta=getVacMeta(cand.vacancy||'');
  var hhLine=meta.hhLink?'\nВакансия: '+meta.hhLink:'';
  var siteLine=meta.siteUrl?'\nСайт компании: '+meta.siteUrl:'';
  var text='Добрый день!\n\nПриглашаем Вас на встречу с руководителем по вакансии '+(cand.vacancy||'')+'.'+hhLine+siteLine+'\n\nДата и время: '+dateTime+'\nАдрес: '+address+'\n\nФИО руководителя: \nТелефон: \n\nПодтвердите встречу, пожалуйста.\nЕсли что-то изменится, сообщите нам. Спасибо!';
  var phone=(cand.contacts||'').replace(/\D/g,'');
  var tgLink=phone?'https://t.me/+'+phone:'https://t.me/';
  // Build manager selector
  var mgrs=getManagers();
  var mgrOptions='<option value="">— без руководителя —</option>'+mgrs.map(function(m,i){return '<option value="'+i+'">'+m.name+(m.company?' ('+m.company+')':'')+'</option>';}).join('');
  var emailBtnHtml='<button id="offEmailBtn" class="btn btn-primary"'+(cand.email?'':' disabled')+' style="background:'+(cand.email?'#D32F2F':'#ccc')+';border-color:'+(cand.email?'#D32F2F':'#ccc')+';'+(cand.email?'':'cursor:not-allowed;')+'" title="'+(cand.email?('Отправить на '+cand.email):'У кандидата не указан email — добавь его в карточке кандидата')+'">📧 Email</button>';

  modal('<h2>🏢 Приглашение в офис</h2>'+
    (mgrs.length?'<div style="display:flex;gap:10px;align-items:center;margin-bottom:12px;"><label style="font-size:13px;font-weight:600;white-space:nowrap;">Руководитель:</label><select id="mgrSelect" style="flex:1;padding:6px 8px;border:1px solid #c8d4e8;border-radius:6px;font-size:13px;">'+mgrOptions+'</select><button class="btn btn-primary" style="white-space:nowrap;" onclick="CRM.insertManager()">Вставить</button></div>':''+
    '<p style="font-size:12px;color:#aaa;margin-bottom:10px;">Добавь руководителей в Настройки → Руководители</p>')+
    '<p style="font-size:12px;color:#666;margin-bottom:8px;">Отредактируй текст при необходимости.</p>'+
    '<textarea id="officeText" style="width:100%;height:220px;font-size:13px;line-height:1.7;border:1px solid #c8d4e8;border-radius:6px;padding:12px;resize:vertical;font-family:inherit;">'+text+'</textarea><div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:10px;"><button id="offTgBtn" class="btn btn-primary" style="background:#229ED9;border-color:#229ED9;">📱 Telegram</button><button id="offWaBtn" class="btn btn-primary" style="background:#25D366;border-color:#25D366;">💬 WhatsApp</button>'+emailBtnHtml+'<button class="btn btn-primary" style="background:#FF5C00;border-color:#FF5C00;" id="copyOffBtn1">📋 Скопировать</button></div><div id="offEmailStatus" style="font-size:12px;color:#888;margin-top:6px;"></div><div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Закрыть</button></div>');
  setTimeout(function(){
    var wb=document.getElementById('offWaBtn');if(wb)wb.onclick=function(){var t=document.getElementById('officeText').value;window.open('https://wa.me/'+(phone||'')+'?text='+encodeURIComponent(t),'_blank');};
    var tb=document.getElementById('offTgBtn');if(tb)tb.onclick=function(){copyText(document.getElementById('officeText').value);window.open(tgLink,'_blank');};
    var cb=document.getElementById('copyOffBtn1');if(cb)cb.onclick=function(){copyText(document.getElementById('officeText').value);};
    var eb=document.getElementById('offEmailBtn');if(eb)eb.onclick=function(){
      var subject='Приглашение на встречу — вакансия '+(cand.vacancy||'');
      emailInvite(cand.id, document.getElementById('officeText').value, subject, 'offEmailStatus');
    };
  },100);
}

// ── Отправка приглашения на email через Google Apps Script (GmailApp.sendEmail) ──
function emailInvite(cid, body, subject, statusElId){
  var statusEl=statusElId?document.getElementById(statusElId):null;
  var cand=D.candidates.find(function(x){return x.id===cid;});
  if(!cand) return;
  if(!cand.email){
    if(statusEl) statusEl.innerHTML='<span style="color:#c62828;">❌ У кандидата не указан email — добавь его в карточке кандидата.</span>';
    else alert('У кандидата не указан email. Добавь его в карточке кандидата.');
    return;
  }
  if(statusEl) statusEl.innerHTML='<span style="color:#888;">⏳ Отправляю на '+cand.email+'...</span>';
  var emailBody=body+'\n\n---\nЭто автоматическое уведомление, отвечать на него не нужно.';
  fetch(SHEETS_URL,{method:'POST',body:JSON.stringify({action:'sendEmail',to:cand.email,subject:subject,body:emailBody})})
    .then(function(r){return r.json();})
    .then(function(res){
      if(res&&res.ok){
        if(statusEl) statusEl.innerHTML='<span style="color:#2e7d32;">✅ Письмо отправлено на '+cand.email+'</span>';
        else alert('✅ Письмо отправлено на '+cand.email);
        D.history.unshift({date:todayStr(),cid:cand.id,name:cand.name,vacancy:cand.vacancy||'',event:'Письмо отправлено',desc:'На '+cand.email+' · '+subject,result:'',resp:'Я'});
        saveData();
        renderHistory();
      } else {
        if(statusEl) statusEl.innerHTML='<span style="color:#c62828;">❌ Не удалось отправить: '+((res&&res.error)||'ошибка сервера')+'</span>';
        else alert('❌ Не удалось отправить письмо');
      }
    })
    .catch(function(){
      if(statusEl) statusEl.innerHTML='<span style="color:#c62828;">❌ Нет связи с сервером отправки</span>';
      else alert('❌ Нет связи с сервером отправки');
    });
}

// ── Закрыть вакансию ─────────────────────────────────────────────
function openCloseVacancy(){
  modal('<h2>🔒 Закрыть вакансию</h2><p style="font-size:13px;color:#666;margin-bottom:16px">Все активные кандидаты получат статус «Вакансия закрыта» и будут заархивированы.</p><div class="fr"><label>Вакансия</label><select id="closeVacSel">'+VACANCIES.map(function(v){return '<option>'+v+'</option>';}).join('')+'</select></div><div id="closeVacCount" style="font-size:13px;color:#888;margin-bottom:12px;padding:8px;background:#f5f5f5;border-radius:6px;"></div><div class="mfoot" style="justify-content:space-between"><button class="btn" onclick="CRM.closeModal()">Отмена</button><button class="btn" style="background:#546E7A;color:#fff;" onclick="CRM.closeVacancy()">🔒 Закрыть вакансию</button></div>');
  var sel=document.getElementById('closeVacSel');
  function upd(){var v=sel.value,a=D.candidates.filter(function(c){return !c.archived&&!INACTIVE.includes(c.status)&&c.vacancy===v;}).length,t=D.candidates.filter(function(c){return c.vacancy===v;}).length;var el=document.getElementById('closeVacCount');if(el)el.textContent='Активных: '+a+' из '+t;}
  sel.addEventListener('change',upd);upd();
}

function closeVacancy(){
  var vac=document.getElementById('closeVacSel')&&document.getElementById('closeVacSel').value;if(!vac)return;
  var active=D.candidates.filter(function(c){return !c.archived&&!INACTIVE.includes(c.status)&&c.vacancy===vac;});
  if(!active.length){alert('Нет активных кандидатов.');return;}
  if(!confirm('Закрыть «'+vac+'»? '+active.length+' кандидатов будут заархивированы.'))return;
  active.forEach(function(c){c.status='Вакансия закрыта';c.archived=true;});
  D.history.push({date:todayStr(),cid:'',name:'Вакансия: '+vac,vacancy:vac,event:'Вакансия закрыта',desc:'Закрыто '+active.length+' кандидатов',result:'',resp:'Я'});
  saveData();closeModal();render();
}

// ── Делегирование событий ─────────────────────────────────────────
document.addEventListener('input',function(e){
  var mi=e.target.closest('.vac-meta-input');
  if(mi){setVacMeta(mi.getAttribute('data-vac'),mi.getAttribute('data-field'),mi.value);}
});

document.addEventListener('click',function(e){
  var slotEl=e.target.closest('[data-cid][data-si]');
  if(slotEl){bookSlot(slotEl.getAttribute('data-cid'),parseInt(slotEl.getAttribute('data-si')));return;}
  var fEl=e.target.closest('[data-fkey]');
  if(fEl){showFunnelList(fEl.getAttribute('data-fkey'),fEl.getAttribute('data-flabel'));return;}
  var mb=e.target.closest('.month-btn');
  if(mb){setReportMonth(mb.getAttribute('data-from'),mb.getAttribute('data-to'));return;}
});

// ── Воронка ───────────────────────────────────────────────────────
window._funnelData={};

function showFunnelList(key,label){
  var cands=window._funnelData[key]||[];if(!cands.length)return;
  var ov=document.getElementById('funnelOverlay');
  if(!ov){ov=document.createElement('div');ov.id='funnelOverlay';ov.style.cssText='position:fixed;inset:0;background:rgba(13,31,53,0.5);z-index:500;display:flex;align-items:center;justify-content:center;';document.body.appendChild(ov);}
  ov.style.display='flex';
  var rows=cands.map(function(c){return '<tr style="border-bottom:1px solid #eee"><td style="padding:8px 12px">'+(c.name||'')+'</td><td style="padding:8px 12px">'+(c.vacancy||'')+'</td><td style="padding:8px 12px">'+(c.status||'')+'</td><td style="padding:8px 12px;white-space:nowrap">'+(c.added||'')+'</td></tr>';}).join('');
  ov.innerHTML='<div style="background:#fff;border-radius:10px;padding:22px;width:820px;max-width:94vw;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.18);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;"><h2 style="font-size:16px;font-weight:700;color:#1F3864;">'+label+' — '+cands.length+' чел.</h2><button id="closeFOv" style="background:none;border:none;font-size:24px;cursor:pointer;color:#888;">&times;</button></div><div style="overflow-y:auto;flex:1;border:1px solid #e0e0e0;border-radius:6px;"><table style="width:100%;font-size:13px;border-collapse:collapse;"><thead><tr style="background:#1F3864;color:#fff;"><th style="padding:9px 12px;text-align:left;">ФИО</th><th style="padding:9px 12px;text-align:left;">Вакансия</th><th style="padding:9px 12px;text-align:left;">Статус</th><th style="padding:9px 12px;text-align:left;">Добавлен</th></tr></thead><tbody>'+rows+'</tbody></table></div><div style="padding-top:14px;text-align:right;"><button class="btn btn-primary" id="closeFOv2">Закрыть</button></div></div>';
  function cl(){ov.style.display='none';}
  document.getElementById('closeFOv').onclick=cl;document.getElementById('closeFOv2').onclick=cl;
  ov.onclick=function(e){if(e.target===ov)cl();};
}

function setReportMonth(from,to){var f=document.getElementById('rFrom');var t=document.getElementById('rTo');if(f)f.value=from;if(t)t.value=to;}

function buildFunnel(){
  window._funnelData={};
  const pool=getReportPool();
  const from=document.getElementById('rFrom').value,to=document.getElementById('rTo').value;
  const selVacs=[...document.querySelectorAll('[name=rVac]:checked')].map(x=>x.value);
  const allVac=selVacs.includes('__all__')||selVacs.length===0;
  const period=(from?'с '+from.split('-').reverse().join('.')+' ':'')+(to?'по '+to.split('-').reverse().join('.'):'');
  const vacLabel=allVac?'Все вакансии':selVacs.filter(x=>x!=='__all__').join(', ');
  const total=pool.length;
  function reached(c,level){return stageLevel(c.stage)>=level;}
  function pct(a,b){return b>0?Math.round(a/b*100)+'%':'—';}
  function mkKey(cands){var k='fk_'+Math.random().toString(36).slice(2,9);window._funnelData[k]=cands;return k;}
  function fRow(icon,label,n,prev,base,green,cands){
    var nc=cands&&cands.length?'<span data-fkey="'+mkKey(cands)+'" data-flabel="'+label.replace(/"/g,'&quot;')+'" style="cursor:pointer;color:#1565c0;font-size:20px;font-weight:700;text-decoration:underline dotted;">'+n+' 👁</span>':'<span style="font-size:20px;font-weight:700;color:#1F3864;">'+n+'</span>';
    return '<tr style="border-bottom:1px solid #e8ecf0'+(green?';background:#f0fff4':'')+'"><td style="padding:11px 14px;font-weight:600;font-size:13px">'+icon+' '+label+'</td><td style="padding:11px 14px;text-align:center;">'+nc+'</td><td style="padding:11px 14px;text-align:center;font-size:13px;color:#888">'+pct(n,base)+'</td><td style="padding:11px 14px;text-align:center;font-size:13px;color:#555">'+(prev>0?pct(n,prev):'—')+'</td></tr>';
  }
  const hrAC=pool.filter(c=>reached(c,1)),hrA=hrAC.length;
  const hrNS=pool.filter(c=>stageLevel(c.stage)===1&&c.status==='Не вышел на собеседование').length;
  const hrDC=pool.filter(c=>reached(c,2)),hrD=hrDC.length;
  const ropAC=pool.filter(c=>reached(c,3)),ropA=ropAC.length;
  const ropNS=pool.filter(c=>stageLevel(c.stage)===3&&c.status==='Не вышел на собеседование').length;
  const ropDC=pool.filter(c=>reached(c,4)),ropD=ropDC.length;
  const ofC=pool.filter(c=>reached(c,5)),ofN=ofC.length;
  const trC=pool.filter(c=>reached(c,6)),trN=trC.length;
  const wkC=pool.filter(c=>reached(c,7)),wkN=wkC.length;
  const totalRefuse=pool.filter(c=>REFUSE_STATUSES.includes(c.status)).length;
  document.getElementById('reportResult').innerHTML=
    '<div class="section-title" style="margin-top:0">📈 Воронка '+(period?'— '+period:'')+' | '+vacLabel+'</div>'+
    '<div style="background:#fff;border:1px solid #c8d4e8;border-radius:8px;overflow:hidden;margin-bottom:12px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#1F3864;color:#fff"><th style="padding:10px 14px;text-align:left">Этап</th><th style="padding:10px 14px;text-align:center">Кол-во</th><th style="padding:10px 14px;text-align:center">% от откликов</th><th style="padding:10px 14px;text-align:center">% от пред. этапа</th></tr></thead><tbody>'+
    '<tr style="background:#e3f2fd;border-bottom:1px solid #e8ecf0"><td style="padding:11px 14px;font-weight:700">📥 Отклики</td><td style="padding:11px 14px;text-align:center;font-size:22px;font-weight:700;color:#1F3864">'+total+'</td><td style="padding:11px 14px;text-align:center;color:#888">100%</td><td style="padding:11px 14px;text-align:center;color:#888">—</td></tr>'+
    fRow('🗣️','Интервью HR — назначено',hrA,total,total,false,hrAC)+fRow('✅','Интервью HR — проведено',hrD,hrA,total,true,hrDC)+
    fRow('👔','Интервью с РОП — назначено',ropA,hrD,total,false,ropAC)+fRow('✅','Интервью с РОП — проведено',ropD,ropA,total,true,ropDC)+
    fRow('📄','Оффер',ofN,ropD,total,false,ofC)+fRow('🎓','Обучение — начали',trN,ofN,total,false,trC)+fRow('🏆','Вышел на работу',wkN,trN,total,true,wkC)+
    '</tbody></table></div>'+
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px">'+
    '<div class="report-card red"><div class="report-card-n">'+totalRefuse+'</div><div class="report-card-l">Всего отказов</div></div>'+
    '<div class="report-card red"><div class="report-card-n">'+(hrNS+ropNS)+'</div><div class="report-card-l">Не вышли на собес</div></div>'+
    '<div class="report-card green"><div class="report-card-n">'+wkN+'</div><div class="report-card-l">Вышли на работу ✅</div></div>'+
    '</div>';
}

function archiveAllInactive(){const count=D.candidates.filter(c=>!c.archived&&INACTIVE.includes(c.status)).length;if(!count){alert('Нет неактивных кандидатов.');return;}if(!confirm(`Архивировать всех неактивных (${count} чел.)?`))return;D.candidates.forEach(c=>{if(!c.archived&&INACTIVE.includes(c.status))c.archived=true;});saveData();render();}
function deleteCandidate(id){const c=D.candidates.find(x=>x.id===id);if(!c)return;if(!confirm(`Удалить ${c.name} навсегда?`))return;D.candidates=D.candidates.filter(x=>x.id!==id);D.history=D.history.filter(x=>x.cid!==id);saveData();closeModal();render();}
function openBulkDelete(){
  modal(`<h2>🗑 Удалить кандидатов по вакансии</h2>
<p style="font-size:13px;color:#666;margin-bottom:16px">Все кандидаты по выбранной вакансии будут удалены навсегда.</p>
<div class="fr"><label>Вакансия</label><select id="delVac">${VACANCIES.map(v=>`<option>${v}</option>`).join('')}</select></div>
<div id="delCount" style="font-size:13px;color:#888;margin-bottom:12px"></div>
<div class="mfoot" style="justify-content:space-between"><button class="btn" onclick="CRM.closeModal()">Отмена</button><button class="btn" style="background:#ffebee;border-color:#ef9a9a;color:#c62828;font-weight:600" onclick="CRM.bulkDelete()">🗑 Удалить всех</button></div>`);
  document.getElementById('delVac').addEventListener('change',updateDelCount);updateDelCount();
}
function updateDelCount(){const vac=document.getElementById('delVac')?.value;const count=D.candidates.filter(c=>c.vacancy===vac).length;const el=document.getElementById('delCount');if(el)el.textContent=`Будет удалено: ${count} кандидатов`;}
function bulkDelete(){const vac=document.getElementById('delVac')?.value;const count=D.candidates.filter(c=>c.vacancy===vac).length;if(!count){alert('Нет кандидатов.');return;}if(!confirm(`Удалить ${count} кандидатов по "${vac}"?`))return;const ids=D.candidates.filter(c=>c.vacancy===vac).map(c=>c.id);D.candidates=D.candidates.filter(c=>c.vacancy!==vac);D.history=D.history.filter(h=>!ids.includes(h.cid));saveData();closeModal();render();}
function openReport(){
  var now2=new Date(),mba=[];
  for(var mi=0;mi<6;mi++){var md=new Date(now2.getFullYear(),now2.getMonth()-mi,1);var my=md.getFullYear(),mm=String(md.getMonth()+1).padStart(2,'0');var ml=md.toLocaleDateString('ru-RU',{month:'long',year:'numeric'});var mf=my+'-'+mm+'-01';var mld=new Date(my,md.getMonth()+1,0).getDate();var mt=my+'-'+mm+'-'+String(mld).padStart(2,'0');mba.push('<button class="btn month-btn" style="font-size:11px;padding:5px 10px;" data-from="'+mf+'" data-to="'+mt+'">'+ml+'</button>');}
  var mbh=mba.join('');

  const vacOpts=`<label class="rdd-row" style="background:#f5f5f5;font-weight:600"><input type="checkbox" name="rVac" value="__all__" checked onchange="CRM.rVacAll(this)"> ✅ Все вакансии</label>`+VACANCIES.map(v=>`<label class="rdd-row"><input type="checkbox" name="rVac" value="${v}" onchange="CRM.rVacOne()"> ${v}</label>`).join('');
  const stageOpts=STAGES.map(s=>`<label class="rdd-row"><input type="checkbox" name="rStage" value="${s}" onchange="CRM.rUpdateLbl('rStage','rStage_lbl','Все этапы')"> ${s}</label>`).join('');
  const statusOpts=STATUSES.map(s=>`<label class="rdd-row"><input type="checkbox" name="rStatus" value="${s}" onchange="CRM.rUpdateLbl('rStatus','rStatus_lbl','Все статусы')"> ${s}</label>`).join('')+`<label class="rdd-row" style="background:#fff5f5;font-weight:600"><input type="checkbox" name="rStatus" value="__all_refuse__" onchange="CRM.rUpdateLbl('rStatus','rStatus_lbl','Все статусы')"> 🔴 Все отказы вместе</label>`;
  modal(`<h2>📊 Отчёт по кандидатам</h2>
<div style="margin-bottom:10px;"><div style="font-size:11px;color:#888;font-weight:600;text-transform:uppercase;margin-bottom:6px;">Быстрый выбор периода:</div><div style="display:flex;gap:6px;flex-wrap:wrap;">${mbh}</div></div>
<div class="f2" style="margin-bottom:12px"><div class="fr"><label>Период от</label><input type="date" id="rFrom"></div><div class="fr"><label>Период до</label><input type="date" id="rTo" value="${todayStr()}"></div></div>
<div class="fr"><label>Вакансии</label><div style="border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-top:4px"><div style="max-height:180px;overflow-y:auto;padding:4px 0">${vacOpts}</div><div style="border-top:1px solid #eee;padding:4px 10px;background:#fafafa"><button class="btn btn-sm" onclick="CRM.rVacReset()">Все</button> <span id="rVac_lbl" style="font-size:11px;color:#888;margin-left:6px">Все</span></div></div></div>
<div class="f2" style="margin-top:10px">
<div class="fr"><label>Этапы (пусто = все)</label><div style="border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-top:4px"><div style="max-height:160px;overflow-y:auto;padding:4px 0">${stageOpts}</div><div style="border-top:1px solid #eee;padding:4px 10px;background:#fafafa"><button class="btn btn-sm" onclick="CRM.rClear('rStage','rStage_lbl','Все этапы')">Сбросить</button> <span id="rStage_lbl" style="font-size:11px;color:#888;margin-left:6px">Все</span></div></div></div>
<div class="fr"><label>Статусы (пусто = все)</label><div style="border:1px solid #ddd;border-radius:6px;overflow:hidden;margin-top:4px"><div style="max-height:160px;overflow-y:auto;padding:4px 0">${statusOpts}</div><div style="border-top:1px solid #eee;padding:4px 10px;background:#fafafa"><button class="btn btn-sm" onclick="CRM.rClear('rStatus','rStatus_lbl','Все статусы')">Сбросить</button> <span id="rStatus_lbl" style="font-size:11px;color:#888;margin-left:6px">Все</span></div></div></div>
</div>
<div class="mfoot" style="justify-content:space-between;margin-top:16px"><button class="btn" onclick="CRM.closeModal()">Закрыть</button><div style="display:flex;gap:8px"><button class="btn" style="background:#fff8e1;border-color:#f9a825;color:#e65100;font-weight:600" onclick="CRM.buildFunnel()">📈 Воронка</button><button class="btn btn-primary" onclick="CRM.buildReport()">Сформировать отчёт</button></div></div>
<div id="reportResult" style="margin-top:16px"></div>`,true);
}
function rUpdateLbl(name,lblId,def){const checked=[...document.querySelectorAll(`[name=${name}]:checked`)].map(x=>x.value).filter(x=>x!=='__all_refuse__');const hasRef=document.querySelector(`[name=${name}][value="__all_refuse__"]`)?.checked;const parts=[...checked,(hasRef?'Все отказы':'')].filter(Boolean);const el=document.getElementById(lblId);if(el)el.textContent=parts.length?parts.join(', '):def;}
function rClear(name,lblId,def){document.querySelectorAll(`[name=${name}]`).forEach(x=>x.checked=false);const el=document.getElementById(lblId);if(el)el.textContent=def;}
function rVacAll(cb){if(cb.checked)document.querySelectorAll('[name=rVac]').forEach(x=>{if(x.value!=='__all__')x.checked=false;});const el=document.getElementById('rVac_lbl');if(el)el.textContent='Все';}
function rVacOne(){const allCb=document.querySelector('[name=rVac][value="__all__"]');if(allCb)allCb.checked=false;const checked=[...document.querySelectorAll('[name=rVac]:checked')].map(x=>x.value).filter(x=>x!=='__all__');const el=document.getElementById('rVac_lbl');if(el)el.textContent=checked.length?checked.join(', '):'Все';}
function rVacReset(){document.querySelectorAll('[name=rVac]').forEach(x=>x.checked=false);const allCb=document.querySelector('[name=rVac][value="__all__"]');if(allCb)allCb.checked=true;const el=document.getElementById('rVac_lbl');if(el)el.textContent='Все';}
function getReportPool(){
  const from=document.getElementById('rFrom').value,to=document.getElementById('rTo').value;
  const selVacs=[...document.querySelectorAll('[name=rVac]:checked')].map(x=>x.value);
  const allVac=selVacs.includes('__all__')||selVacs.length===0;
  let pool=D.candidates;
  if(from)pool=pool.filter(c=>c.added&&c.added>=from);
  if(to)pool=pool.filter(c=>c.added&&c.added<=to);
  if(!allVac)pool=pool.filter(c=>selVacs.filter(x=>x!=='__all__').includes(c.vacancy));
  return pool;
}
function buildReport(){
  const pool=getReportPool();
  const selStages=[...document.querySelectorAll('[name=rStage]:checked')].map(x=>x.value);
  const selStatuses=[...document.querySelectorAll('[name=rStatus]:checked')].map(x=>x.value);
  let effectiveStatuses=selStatuses.filter(x=>x!=='__all_refuse__');
  if(selStatuses.includes('__all_refuse__'))effectiveStatuses=[...new Set([...effectiveStatuses,...REFUSE_STATUSES])];
  let rows=pool;
  if(selStages.length)rows=rows.filter(c=>selStages.includes(c.stage));
  if(effectiveStatuses.length)rows=rows.filter(c=>effectiveStatuses.includes(c.status));
  const total=rows.length,refused=rows.filter(c=>REFUSE_STATUSES.includes(c.status)).length,selfRefuse=rows.filter(c=>c.status==='Отказался сам (кандидат)').length,noShow=rows.filter(c=>c.status==='Не вышел на собеседование').length,compRefuse=rows.filter(c=>c.status==='Отказ').length,training=rows.filter(c=>['Обучение','Работает','Выход'].includes(c.stage)).length,offer=rows.filter(c=>['Оффер','Обучение','Работает','Выход'].includes(c.stage)).length,inWork=rows.filter(c=>c.status==='В работе').length;
  const tableRows=rows.map(c=>`<tr><td>${c.id}</td><td>${c.name}</td><td>${c.vacancy}</td><td>${c.stage}</td><td>${c.status}</td><td>${c.added||''}</td></tr>`).join('');
  document.getElementById('reportResult').innerHTML=`<div class="section-title" style="margin-top:0">Результат</div><div class="report-grid"><div class="report-card blue"><div class="report-card-n">${total}</div><div class="report-card-l">Всего</div></div><div class="report-card"><div class="report-card-n">${inWork}</div><div class="report-card-l">В работе</div></div><div class="report-card orange"><div class="report-card-n">${offer}</div><div class="report-card-l">Оффер</div></div><div class="report-card green"><div class="report-card-n">${training}</div><div class="report-card-l">На обучении</div></div><div class="report-card red"><div class="report-card-n">${refused}</div><div class="report-card-l">Всего отказов</div></div><div class="report-card red"><div class="report-card-n">${selfRefuse}</div><div class="report-card-l">Отказался сам</div></div><div class="report-card red"><div class="report-card-n">${noShow}</div><div class="report-card-l">Не вышел на собес</div></div><div class="report-card red"><div class="report-card-n">${compRefuse}</div><div class="report-card-l">Отказ компании</div></div></div>${total>0?`<div class="report-detail"><table><thead><tr><th>ID</th><th>ФИО</th><th>Вакансия</th><th>Этап</th><th>Статус</th><th>Добавлен</th></tr></thead><tbody>${tableRows}</tbody></table></div>`:'<div class="empty">Нет кандидатов</div>'}`;
}
function buildFunnel(){
  const pool=getReportPool();
  const from=document.getElementById('rFrom').value,to=document.getElementById('rTo').value;
  const selVacs=[...document.querySelectorAll('[name=rVac]:checked')].map(x=>x.value);
  const allVac=selVacs.includes('__all__')||selVacs.length===0;
  const period=(from?`с ${from.split('-').reverse().join('.')} `:'')+(to?`по ${to.split('-').reverse().join('.')}` :'');
  const vacLabel=allVac?'Все вакансии':selVacs.filter(x=>x!=='__all__').join(', ');
  const total=pool.length;
  function reached(c,level){return stageLevel(c.stage)>=level;}
  const hrAssigned=pool.filter(c=>reached(c,1)).length;
  const hrNoShow=pool.filter(c=>stageLevel(c.stage)===1&&c.status==='Не вышел на собеседование').length;
  const hrDone=pool.filter(c=>reached(c,2)).length;
  const ropAssigned=pool.filter(c=>reached(c,3)).length;
  const ropNoShow=pool.filter(c=>stageLevel(c.stage)===3&&c.status==='Не вышел на собеседование').length;
  const ropDone=pool.filter(c=>reached(c,4)).length;
  const offerCount=pool.filter(c=>reached(c,5)).length;
  const trainCount=pool.filter(c=>reached(c,6)).length;
  const workCount=pool.filter(c=>reached(c,7)).length;
  const totalRefuse=pool.filter(c=>REFUSE_STATUSES.includes(c.status)).length;
  function pct(a,b){return b>0?Math.round(a/b*100)+'%':'—';}
  function fRow(icon,label,n,prev,base,green){return `<tr style="border-bottom:1px solid #e8ecf0${green?';background:#f0fff4':''}"><td style="padding:11px 14px;font-weight:600;font-size:13px">${icon} ${label}</td><td style="padding:11px 14px;text-align:center;font-size:20px;font-weight:700;color:#1F3864">${n}</td><td style="padding:11px 14px;text-align:center;font-size:13px;color:#888">${pct(n,base)}</td><td style="padding:11px 14px;text-align:center;font-size:13px;color:#555">${prev>0?pct(n,prev):'—'}</td></tr>`;}
  document.getElementById('reportResult').innerHTML=`<div class="section-title" style="margin-top:0">📈 Воронка ${period?'— '+period:''} | ${vacLabel}</div><div style="background:#fff;border:1px solid #c8d4e8;border-radius:8px;overflow:hidden;margin-bottom:12px"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="background:#1F3864;color:#fff"><th style="padding:10px 14px;text-align:left">Этап</th><th style="padding:10px 14px;text-align:center">Кол-во</th><th style="padding:10px 14px;text-align:center">% от откликов</th><th style="padding:10px 14px;text-align:center">% от пред. этапа</th></tr></thead><tbody><tr style="background:#e3f2fd;border-bottom:1px solid #e8ecf0"><td style="padding:11px 14px;font-weight:700">📥 Отклики</td><td style="padding:11px 14px;text-align:center;font-size:22px;font-weight:700;color:#1F3864">${total}</td><td style="padding:11px 14px;text-align:center;color:#888">100%</td><td style="padding:11px 14px;text-align:center;color:#888">—</td></tr>${fRow('🗣️','Интервью HR — назначено',hrAssigned,total,total,false)}${fRow('✅','Интервью HR — проведено',hrDone,hrAssigned,total,true)}${fRow('👔','Интервью с РОП — назначено',ropAssigned,hrDone,total,false)}${fRow('✅','Интервью с РОП — проведено',ropDone,ropAssigned,total,true)}${fRow('📄','Оффер',offerCount,ropDone,total,false)}${fRow('🎓','Обучение — начали',trainCount,offerCount,total,false)}${fRow('🏆','Вышел на работу',workCount,trainCount,total,true)}</tbody></table></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px"><div class="report-card red"><div class="report-card-n">${totalRefuse}</div><div class="report-card-l">Всего отказов</div></div><div class="report-card red"><div class="report-card-n">${hrNoShow+ropNoShow}</div><div class="report-card-l">Не вышли на собес</div></div><div class="report-card green"><div class="report-card-n">${workCount}</div><div class="report-card-l">Вышли на работу ✅</div></div></div>`;
}
let pendingPdfName='';
function loadPDFJS(){return new Promise((resolve,reject)=>{if(typeof pdfjsLib!=='undefined'){resolve();return;}const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';s.onload=()=>{pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';resolve();};s.onerror=reject;document.head.appendChild(s);});}
function extractFromPDFText(text){const result={name:'',phone:''};const nm=text.substring(0,500).match(/([А-Я][а-я]+)\s+([А-Я][а-я]+)\s+([А-Я][а-я]+)/);if(nm)result.name=nm[0];const m=text.match(/(?:\+7|8|7)[\s\-\(\)]*(\d{3})[\s\-\(\)]*(\d{3})[\s\-\(\)]*(\d{2})[\s\-\(\)]*(\d{2})/);if(m)result.phone='+7'+m[1]+m[2]+m[3]+m[4];else{const sd=text.match(/\d{10}/);if(sd)result.phone='+7'+sd[0];}return result;}
async function parsePDF(e){const file=e.target.files[0];if(!file)return;pendingPdfName=file.name;const area=document.querySelector('.upload-area');if(area)area.innerHTML='⏳ Читаю резюме...';try{await loadPDFJS();const pdf=await pdfjsLib.getDocument({data:await file.arrayBuffer()}).promise;let text='';for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();text+=tc.items.map(x=>x.str).join(' ')+' ';}const ex=extractFromPDFText(text);if(ex.name){const fn=document.getElementById('fn');if(fn)fn.value=ex.name;}if(ex.phone){const fp=document.getElementById('fphone');if(fp)fp.value=ex.phone;}if(area){if(ex.phone){area.innerHTML='✅ Телефон загружен!';area.style.borderColor='#639922';area.style.background='#EAF3DE';area.style.color='#3B6D11';}else{area.innerHTML='⚠️ Телефон не найден.';area.style.borderColor='#F9A825';area.style.background='#FFF8E1';area.style.color='#E65100';}}}catch(err){if(area){area.innerHTML='⚠️ Ошибка PDF.';area.style.borderColor='#E24B4A';area.style.color='#A32D2D';}}}
function openAdd(){
  const id=nextId();pendingPdfName='';
  modal(`<h2>➕ Новый кандидат</h2>
<div class="upload-area" onclick="document.getElementById('pdfIn').click()">📄 Загрузить PDF резюме<input type="file" id="pdfIn" accept=".pdf" style="display:none" onchange="CRM.parsePDF(event)"></div>
<div class="section-title">Основные данные</div>
<div class="f2"><div class="fr"><label>ID</label><input id="fi" value="${id}" readonly></div><div class="fr"><label>Дата добавления</label><input type="date" id="fa" value="${todayStr()}"></div></div>
<div class="fr"><label>ФИО *</label><input id="fn" placeholder="Фамилия Имя Отчество"></div>
<div class="f2"><div class="fr"><label>Вакансия</label><select id="fv">${sel(VACANCIES,'Менеджер по продажам')}</select></div><div class="fr"><label>Источник</label><input id="fs" placeholder="hh.ru"></div></div>
<div class="fr"><label>📞 Телефон</label><input id="fphone" placeholder="+7 999 000-00-00"></div>
<div class="fr"><label>📧 Email</label><input id="femail" placeholder="ivan@mail.ru"></div>
<div class="section-title">Воронка</div>
<div class="f2"><div class="fr"><label>Этап</label><select id="fst" onchange="CRM.autoFillNextStep(this.value,document.getElementById('fnd').value)">${selStage('Отклик')}</select></div><div class="fr"><label>Статус</label><select id="fsts" onchange="CRM.toggleRefuse(this,'addRefuse')">${sel(STATUSES,'В работе')}</select></div></div>
<div class="fr" id="addRefuse" style="display:none"><label>Причина отказа</label><select id="frr"><option value="">— выберите —</option>${REFUSE_REASONS.filter(x=>x).map(r=>`<option>${r}</option>`).join('')}</select></div>
<div class="f2"><div class="fr"><label>Следующий шаг</label><input id="fnx"></div><div class="fr"><label>Дата шага</label><input type="date" id="fnd" onchange="CRM.autoFillNextStep(document.getElementById('fst').value,this.value)"></div></div>
<div class="fr"><label>Время встречи</label><input type="time" id="fmt"></div>
<div class="fr"><label>Комментарий</label><textarea id="fco"></textarea></div>
<div class="fr"><label>Ссылка на резюме</label><input id="frl" placeholder="https://..."></div>
<div class="fr"><label>Ссылка на HH</label><input id="fhh" placeholder="https://hh.ru/resume/..."></div>
<div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Отмена</button><button class="btn btn-primary" onclick="CRM.saveNew()">Добавить</button></div>`);
}
function saveNew(){
  const name=document.getElementById('fn')?.value.trim();if(!name){alert('Введите ФИО');return;}
  D.candidates.push({id:document.getElementById('fi')?.value||nextId(),added:document.getElementById('fa')?.value||todayStr(),name,vacancy:document.getElementById('fv')?.value||VACANCIES[0],contacts:document.getElementById('fphone')?.value.trim()||'',email:document.getElementById('femail')?.value.trim()||'',source:document.getElementById('fs')?.value||'',stage:document.getElementById('fst')?.value||'Отклик',status:document.getElementById('fsts')?.value||'В работе',next:document.getElementById('fnx')?.value||'',nextDate:document.getElementById('fnd')?.value||'',comment:document.getElementById('fco')?.value||'',resumeLink:document.getElementById('frl')?.value||'',meetTime:document.getElementById('fmt')?.value||'',hhLink:document.getElementById('fhh')?.value||'',pdfName:pendingPdfName,refuseReason:document.getElementById('frr')?.value||''});
  D.history.push({date:todayStr(),cid:D.candidates[D.candidates.length-1].id,name,vacancy:document.getElementById('fv')?.value||'',event:'Добавлен кандидат',desc:'',result:'',resp:'Я'});
  saveData();render();
  // После добавления — сразу открываем карточку редактирования
  const newId = D.candidates[D.candidates.length-1].id;
  closeModal();
  setTimeout(function(){ openEdit(newId); }, 100);
}
function openEdit(id){
  const c=D.candidates.find(x=>x.id===id);if(!c)return;
  const phone=c.contacts&&c.contacts.match(/[\d\+]/)?c.contacts:'';
  modal(`<h2>✏️ ${c.name}</h2>
<div class="f2"><div class="fr"><label>ID</label><input value="${c.id}" readonly></div><div class="fr"><label>Дата добавления</label><input type="date" id="fa" value="${c.added||''}"></div></div>
<div class="fr"><label>ФИО</label><input id="fn" value="${c.name}"></div>
<div class="f2"><div class="fr"><label>Вакансия</label><select id="fv">${sel(VACANCIES,c.vacancy)}</select></div><div class="fr"><label>Источник</label><input id="fs" value="${c.source||''}"></div></div>
<div class="fr"><label>📞 Телефон</label><input id="fphone" value="${phone}"></div>
<div class="fr"><label>📧 Email</label><input id="femail" value="${c.email||''}"></div>
<div class="f2"><div class="fr"><label>Этап</label><select id="fst" onchange="CRM.autoFillNextStep(this.value,document.getElementById('fnd').value)">${selStage(c.stage)}</select></div><div class="fr"><label>Статус</label><select id="fsts" onchange="CRM.toggleRefuse(this,'editRefuse')">${sel(STATUSES,c.status)}</select></div></div>
<div class="fr" id="editRefuse" style="${REFUSE_STATUSES.includes(c.status)?'':'display:none'}"><label>Причина отказа</label><select id="frr"><option value="">— выберите —</option>${REFUSE_REASONS.filter(x=>x).map(r=>`<option${r===c.refuseReason?' selected':''}>${r}</option>`).join('')}</select></div>
<div class="f2"><div class="fr"><label>Следующий шаг</label><input id="fnx" value="${c.next||''}"></div><div class="fr"><label>Дата шага</label><input type="date" id="fnd" value="${c.nextDate||''}" onchange="CRM.autoFillNextStep(document.getElementById('fst').value,this.value)"></div></div>
<div class="fr"><label>Время встречи</label><input type="time" id="fmt" value="${c.meetTime||''}"></div>
<div class="fr"><label>Комментарий</label><textarea id="fco">${c.comment||''}</textarea></div>
<div class="fr"><label>Ссылка на резюме</label><input id="frl" value="${c.resumeLink||''}"></div>
<div class="fr"><label>Ссылка на HH</label><input id="fhh" value="${c.hhLink||''}"></div>
<div class="mfoot" style="justify-content:space-between;flex-wrap:wrap;gap:8px;padding-top:14px;border-top:1px solid #eee;">
<div style="display:flex;gap:6px;flex-wrap:wrap;">
<button class="btn" style="color:#1565c0;border-color:#90caf9;background:#e3f2fd;" onclick="CRM.saveEditThenHist('${id}')">📋 Событие</button>
<button class="btn" style="color:#555;border-color:#ccc;" onclick="CRM.archiveCandidate('${id}')">🗄 Архив</button>
<button class="btn" style="color:#c62828;border-color:#ef9a9a;background:#fff5f5;" onclick="CRM.deleteCandidate('${id}')">🗑 Удалить</button>
</div>
<div style="display:flex;gap:6px;flex-wrap:wrap;" id="meetBtnsContainer_${id}">
<span id="meetBtnsPlaceholder_${id}"></span>
<button class="btn" style="background:#5c6bc0;color:#fff;border-color:#5c6bc0;" onclick="CRM.saveEdit('${id}');setTimeout(function(){CRM.openOfficeInvite('${id}');},300)">🏢 Пригласить в офис</button>
<button class="btn" onclick="CRM.closeModal()">Отмена</button>
<button class="btn btn-primary" onclick="CRM.saveEdit('${id}')">💾 Сохранить</button>
</div>
</div>
${(()=>{
  const hist=D.history.filter(h=>h.cid===c.id).slice(0,15);
  if(!hist.length) return '';
  const rows=hist.map(h=>'<tr style="border-bottom:1px solid #f0f0f0;"><td style="padding:6px 10px;white-space:nowrap;font-size:12px;color:#666;">'+h.date+'</td><td style="padding:6px 10px;font-size:12px;font-weight:600;">'+(h.event||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</td><td style="padding:6px 10px;font-size:12px;color:#444;">'+(h.desc||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</td></tr>').join('');
  return '<hr style="margin:16px 0;border-color:#eee;"><div style="font-size:11px;font-weight:700;color:#1F3864;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;">📋 История кандидата</div><div style="max-height:180px;overflow-y:auto;border:1px solid #e8ecf0;border-radius:6px;"><table style="width:100%;border-collapse:collapse;"><tbody>'+rows+'</tbody></table></div>';
})()}`);
  var _ec=D.candidates.find(x=>x.id===id);
  var _hm=_ec&&_ec.meetTime&&_ec.meetTime!=='--:--'&&_ec.meetTime!=='';
  setTimeout(function(){
    var ph=document.getElementById('meetBtnsPlaceholder_'+id);if(!ph)return;
    ph.outerHTML=_hm?
      '<button class="btn" style="background:#e3f2fd;color:#1565c0;border-color:#90caf9;" onclick="CRM.openSendInviteAgain(\''+id+'\')">📨 Повторить приглашение</button>'+
      '<button class="btn" style="background:#fff3e0;color:#e65100;border-color:#ffcc80;" onclick="CRM.releaseSlot(\''+id+'\')">🔄 Изменить встречу</button>'
      :'<button class="btn" style="background:#1976d2;color:#fff;border-color:#1976d2;font-weight:700;" onclick="CRM.openBookSlot(\''+id+'\')">📅 Назначить встречу</button>';
  },80);
}
function saveEdit(id){
  const c=D.candidates.find(x=>x.id===id);if(!c)return;
  // Запоминаем старый этап и статус для истории
  const oldStage=c.stage||'';
  const oldStatus=c.status||'';
  c.added=document.getElementById('fa')?.value||c.added;c.name=document.getElementById('fn')?.value.trim()||c.name;c.vacancy=document.getElementById('fv')?.value||c.vacancy;c.source=document.getElementById('fs')?.value||'';c.contacts=document.getElementById('fphone')?.value.trim()||'';c.email=document.getElementById('femail')?.value.trim()||'';c.stage=document.getElementById('fst')?.value||c.stage;c.status=document.getElementById('fsts')?.value||c.status;c.next=document.getElementById('fnx')?.value||'';c.nextDate=document.getElementById('fnd')?.value||'';c.comment=document.getElementById('fco')?.value||'';c.resumeLink=document.getElementById('frl')?.value||'';c.meetTime=document.getElementById('fmt')?.value||'';c.hhLink=document.getElementById('fhh')?.value||'';
  if(document.getElementById('frr'))c.refuseReason=document.getElementById('frr').value;
  if(!REFUSE_STATUSES.includes(c.status))c.refuseReason='';
  // Автоматически записываем событие если изменился этап или статус
  const newStage=c.stage||'';
  const newStatus=c.status||'';
  if(oldStage!==newStage||oldStatus!==newStatus){
    var eventDesc='';
    if(oldStage!==newStage) eventDesc='Этап: '+( oldStage||'—')+' → '+newStage;
    if(oldStatus!==newStatus){
      if(eventDesc) eventDesc+=' | ';
      eventDesc+='Статус: '+(oldStatus||'—')+' → '+newStatus;
    }
    if(c.nextDate){
      var d=new Date(c.nextDate+'T12:00:00');
      var ds=d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'});
      if(c.meetTime&&c.meetTime!=='--:--') eventDesc+=' ('+ds+' '+c.meetTime+')';
      else eventDesc+=' ('+ds+')';
    }
    D.history.unshift({
      date:todayStr(),
      cid:c.id,
      name:c.name,
      vacancy:c.vacancy||'',
      event:newStage||newStatus,
      desc:eventDesc,
      result:'',
      resp:'Я'
    });
  }
  saveData();closeModal();render();
}
function saveEditThenHist(id){
  const c=D.candidates.find(x=>x.id===id);
  if(c){c.added=document.getElementById('fa')?.value||c.added;c.name=document.getElementById('fn')?.value.trim()||c.name;c.vacancy=document.getElementById('fv')?.value||c.vacancy;c.source=document.getElementById('fs')?.value||'';c.contacts=document.getElementById('fphone')?.value.trim()||'';c.stage=document.getElementById('fst')?.value||c.stage;c.status=document.getElementById('fsts')?.value||c.status;c.next=document.getElementById('fnx')?.value||'';c.nextDate=document.getElementById('fnd')?.value||'';c.comment=document.getElementById('fco')?.value||'';c.resumeLink=document.getElementById('frl')?.value||'';c.meetTime=document.getElementById('fmt')?.value||'';c.hhLink=document.getElementById('fhh')?.value||'';if(document.getElementById('frr'))c.refuseReason=document.getElementById('frr').value;if(!REFUSE_STATUSES.includes(c.status))c.refuseReason='';saveData();}
  openHist(id);
}
function openHist(id){
  const c=D.candidates.find(x=>x.id===id);if(!c)return;
  modal(`<h2>📋 Событие — ${c.name}</h2>
<div class="fr"><label>Дата</label><input type="date" id="hd" value="${todayStr()}"></div>
<div class="fr"><label>Тип события</label><select id="he">${sel(EVENTS,'Интервью HR — назначено')}</select></div>
<div class="fr"><label>Описание</label><textarea id="hds"></textarea></div>
<div class="fr"><label>Результат</label><input id="hr"></div>
<div class="mfoot"><button class="btn" onclick="CRM.openEdit('${id}')">← Назад</button><button class="btn btn-primary" onclick="CRM.saveHist('${id}')">Добавить</button></div>`);
}
function saveHist(id){
  const c=D.candidates.find(x=>x.id===id);if(!c)return;
  D.history.push({date:document.getElementById('hd')?.value||todayStr(),cid:c.id,name:c.name,vacancy:c.vacancy,event:document.getElementById('he')?.value||'',desc:document.getElementById('hds')?.value||'',result:document.getElementById('hr')?.value||'',resp:'Я'});
  saveData();closeModal();render();
}
function importJSON(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=function(ev){try{const data=JSON.parse(ev.target.result);if(data.candidates&&Array.isArray(data.candidates))D.candidates=data.candidates.map(c=>({...c,status:normalizeStatus(c.status)}));if(data.history&&Array.isArray(data.history))D.history=data.history;saveLocal();render();syncToSheets();alert('✅ Данные загружены!');}catch(err){alert('Ошибка: '+err.message);}};
  reader.readAsText(file);e.target.value='';
}

loadLocal();updateFVSelect();render();loadFromSheets();

// ========== ИНТЕГРАЦИЯ С HR-АССИСТЕНТОМ ==========
// Открывает модалку добавления кандидата, заполненную данными из HR-ассистента.
// Вызывается напрямую при передаче кандидата внутри объединённого приложения,
// либо через checkURLParams() ниже — это fallback для случая, когда CRM
// открыта отдельной страницей по ссылке вида /?action=add&name=...
function addCandidateFromHR({ name: nameFromHR, phone: phoneFromHR, email: emailFromHR, vacancy: vacancyFromHR, source: sourceFromHR }) {
  if (!nameFromHR) return;

  const id = nextId();
  pendingPdfName = '';

  let matchedVacancy = VACANCIES[0] || '';
  if (vacancyFromHR) {
    const exact = VACANCIES.find(v => v.toLowerCase() === vacancyFromHR.toLowerCase());
    const partial = VACANCIES.find(v =>
      v.toLowerCase().includes(vacancyFromHR.toLowerCase()) ||
      vacancyFromHR.toLowerCase().includes(v.toLowerCase())
    );
    matchedVacancy = exact || partial || VACANCIES[0] || '';
  }

  const nameEsc = nameFromHR.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  const phoneEsc = (phoneFromHR || '').replace(/"/g, '&quot;');
  const emailEsc = (emailFromHR || '').replace(/"/g, '&quot;');
  const sourceEsc = (sourceFromHR || 'HR-ассистент').replace(/"/g, '&quot;');

  document.getElementById('mdl').style.display = 'flex';
  document.getElementById('mdl').className = 'modal-bg';
  document.getElementById('mdl').innerHTML = `<div class="modal">
<h2>➕ Новый кандидат из HR-ассистента</h2>
<div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#2e7d32;display:flex;align-items:center;gap:8px;">
  ✅ Данные подгружены из HR-ассистента. Проверь и нажми «Добавить».
</div>
<div class="upload-area" onclick="document.getElementById('pdfInHR').click()">📄 Загрузить PDF резюме<input type="file" id="pdfInHR" accept=".pdf" style="display:none" onchange="CRM.parsePDF(event)"></div>
<div class="section-title">Основные данные</div>
<div class="f2"><div class="fr"><label>ID</label><input id="fi" value="${id}" readonly></div><div class="fr"><label>Дата добавления</label><input type="date" id="fa" value="${todayStr()}"></div></div>
<div class="fr"><label>ФИО *</label><input id="fn" value="${nameEsc}"></div>
<div class="f2"><div class="fr"><label>Вакансия</label><select id="fv">${sel(VACANCIES, matchedVacancy)}</select></div><div class="fr"><label>Источник</label><input id="fs" value="${sourceEsc}"></div></div>
<div class="fr"><label>📞 Телефон</label><input id="fphone" value="${phoneEsc}"></div>
<div class="fr"><label>📧 Email</label><input id="femail" value="${emailEsc}"></div>
<div class="section-title">Воронка</div>
<div class="f2"><div class="fr"><label>Этап</label><select id="fst" onchange="CRM.autoFillNextStep(this.value,document.getElementById('fnd').value)">${selStage('Отклик')}</select></div><div class="fr"><label>Статус</label><select id="fsts" onchange="CRM.toggleRefuse(this,'addRefuseHR')">${sel(STATUSES,'В работе')}</select></div></div>
<div class="fr" id="addRefuseHR" style="display:none"><label>Причина отказа</label><select id="frr"><option value="">— выберите —</option>${REFUSE_REASONS.filter(x=>x).map(r=>'<option>'+r+'</option>').join('')}</select></div>
<div class="f2"><div class="fr"><label>Следующий шаг</label><input id="fnx"></div><div class="fr"><label>Дата шага</label><input type="date" id="fnd" onchange="CRM.autoFillNextStep(document.getElementById('fst').value,this.value)"></div></div>
<div class="fr"><label>Время встречи</label><input type="time" id="fmt"></div>
<div class="fr"><label>Комментарий</label><textarea id="fco"></textarea></div>
<div class="fr"><label>Ссылка на резюме</label><input id="frl" placeholder="https://..."></div>
<div class="fr"><label>Ссылка на HH</label><input id="fhh" placeholder="https://hh.ru/resume/..."></div>
<div class="mfoot"><button class="btn" onclick="CRM.closeModal()">Отмена</button><button class="btn btn-primary" onclick="CRM.saveNew()">Добавить</button></div>
</div>`;
}

// Fallback: если CRM открыта отдельно по ссылке с ?action=add&name=...
(function checkURLParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('action') !== 'add') return;

  const nameFromHR = decodeURIComponent(params.get('name') || '');
  const phoneFromHR = decodeURIComponent(params.get('phone') || '');
  const vacancyFromHR = decodeURIComponent(params.get('vacancy') || '');
  const sourceFromHR = decodeURIComponent(params.get('source') || 'HR-ассистент');

  if (!nameFromHR) return;

  setTimeout(function() {
    addCandidateFromHR({ name: nameFromHR, phone: phoneFromHR, vacancy: vacancyFromHR, source: sourceFromHR });

    const cleanUrl = window.location.protocol + '//' + window.location.host + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }, 900);
})();

return {
  addCandidateFromHR,
  addManager,
  addSlot,
  addVacancy,
  applyStageFilter,
  emailInvite,
  parsePDF,
  applyStatusFilter,
  archiveAllInactive,
  archiveCandidate,
  arrow,
  autoFillNextStep,
  bookSlot,
  buildFunnel,
  buildReport,
  bulkDelete,
  clearDate,
  clearPastSlots,
  clearStageFilter,
  clearStatusFilter,
  clearVacColor,
  closeModal,
  closeSettingsMenu,
  closeVacancy,
  copyText,
  deleteCandidate,
  deleteManager,
  deleteSlot,
  dlabel,
  extractFromPDFText,
  getChecked,
  getManagers,
  getReportPool,
  getSlots,
  getVacMeta,
  getVacStyle,
  importJSON,
  insertManager,
  isSameDay,
  loadFromSheets,
  loadLocal,
  loadPDFJS,
  modal,
  mskTime,
  nextId,
  normalizeStatus,
  openAdd,
  openBookSlot,
  openBulkDelete,
  openCloseVacancy,
  openEdit,
  openHist,
  openManagersSettings,
  openOfficeInvite,
  openReport,
  openSendInvite,
  openSendInviteAgain,
  openSlotsManager,
  openVacancySettings,
  parseDate,
  rClear,
  rUpdateLbl,
  rVacAll,
  rVacOne,
  rVacReset,
  rclass,
  releaseSlot,
  removeVacancy,
  render,
  renderArchive,
  renderHeaders,
  renderHistory,
  renderStats,
  renderTable,
  renderVacList,
  saveData,
  saveEdit,
  saveEditThenHist,
  saveHist,
  saveLocal,
  saveManagerEdits,
  saveManagers,
  saveNew,
  saveSlots,
  saveVacancies,
  saveVacancyName,
  sbadge,
  sel,
  selStage,
  setReportMonth,
  setSyncStatus,
  setToday,
  setVacColor,
  setVacMeta,
  showFunnelList,
  sortBy,
  stageLevel,
  switchTab,
  syncToSheets,
  todayStr,
  toggleDD,
  toggleRefuse,
  toggleSettingsMenu,
  unarchiveCandidate,
  updateDelCount,
  updateFVSelect,
  vacBadge
};
})();
