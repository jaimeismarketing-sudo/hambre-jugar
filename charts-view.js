/* Weekly charts are a readout of completed simulation days, never an income source. */
(function(root){
 'use strict';
 const TYPES=['artists','singles','albums'], LIMIT=60*1024;
 const TITLES={artists:'Artistas',singles:'Singles',albums:'Álbumes / EP'};
 const COUNTRIES={co:'Colombia',mx:'México',ar:'Argentina',cl:'Chile',pe:'Perú',pr:'Puerto Rico',do:'Rep. Dominicana',br:'Brasil'};
 const chartPreferences=new WeakMap();
 let activeHistory=null;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const num=v=>Number(v||0).toLocaleString('es-CO',{maximumFractionDigits:0});
 const safe=v=>Number.isSafeInteger(v)&&v>=0;
 const text=(v,n=64)=>String(v??'').slice(0,n);
 const compare=(a,b)=>b.streams-a.streams||(a.id<b.id?-1:a.id>b.id?1:0);
 function dailyTotal(history,start,end){
  const selected=(history||[]).filter(r=>r.day>=start&&r.day<end);
  if(selected.length!==end-start||new Set(selected.map(r=>r.day)).size!==end-start||selected.some(r=>!Number.isInteger(r.day)||!safe(r.streams)))return null;
  return selected.reduce((sum,r)=>sum+r.streams,0);
 }
 function validClose(s,week){
  return Number.isSafeInteger(week)&&week>=1&&s?.calendar?.day===week*7&&s.week===week+1&&s.world?.lastCompletedWeek===week&&dailyTotal(s.salesHistory,(week-1)*7,week*7)!==null;
 }
 function closedCounters(s,week,total){
  if(!validClose(s,week)||s.activeWeek||s.calendar.status!=='planning'||s.pendingReport?.week!==week||s.pendingReport.streams!==total)return null;
  const start=(week-1)*7,end=week*7,releases=s.releases||[],ids=new Set();let sum=0;
  for(const r of releases){
   if(ids.has(r.id)||!safe(r.streams))return null;ids.add(r.id);
   if(Number.isInteger(r.releasedDay)&&r.releasedDay>=end){if(r.streams!==0)return null;continue;}
   const from=Number.isInteger(r.releasedDay)?Math.max(start,r.releasedDay):start,observed=dailyTotal(r.dailyHistory,from,end);
   if(observed!==null&&observed!==r.streams)return null;
   sum+=r.streams;
  }
  return safe(sum)&&sum===total?new Map(releases.map(r=>[r.id,r.streams])):null;
 }
 function allocate(budget,releases){
  const raw=releases.map(r=>Math.max(0,Math.round((Number(r.dailyStreams)||0)*7))),sum=raw.reduce((a,b)=>a+b,0);
  if(sum<=budget)return raw;
  const exact=raw.map(n=>n*budget/sum),parts=exact.map(Math.floor);
  let remainder=budget-parts.reduce((a,b)=>a+b,0);
  const order=exact.map((n,i)=>({i,f:n-parts[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  for(let i=0;i<remainder;i++)parts[order[i].i]++;
  return parts;
 }
 function rankings(s,week){
  if(!s?.world||s.world.lastCompletedWeek!==week)return null;
  const start=(week-1)*7,end=week*7,playerStreams=dailyTotal(s.salesHistory,start,end);
  if(playerStreams===null)return null;
  const out={artists:[],singles:[],albums:[],missing:0,unattributed:0},counters=closedCounters(s,week,playerStreams);
  for(const a of s.world.artists||[]){
   const budget=Math.max(0,Math.round((Number(a.dailyStreams)||0)*7));
   out.artists.push({id:'n:a:'+a.id,title:a.name,byline:COUNTRIES[a.market]||a.market,format:a.genre,player:false,streams:budget});
   const releases=(a.releases||[]).filter(r=>Number.isInteger(r.week)&&r.week<=week),parts=allocate(budget,releases);
   out.unattributed+=budget-parts.reduce((sum,n)=>sum+n,0);
   releases.forEach((r,i)=>{const type=r.type==='single'?'singles':'albums';out[type].push({id:'n:r:'+r.id,title:r.title,byline:a.name,format:r.type,player:false,streams:parts[i]});});
  }
  out.artists.push({id:'p:artist',title:s.player?.name||'Tu artista',byline:s.player?.origin||'Tu carrera',format:s.player?.style||'',player:true,streams:playerStreams});
  for(const r of s.releases||[]){
   if(Number.isInteger(r.releasedDay)&&r.releasedDay>=end)continue;
   // Days before a known release date are genuinely zero, not missing observations.
   const from=Number.isInteger(r.releasedDay)?Math.max(start,r.releasedDay):start;
   const observed=dailyTotal(r.dailyHistory,from,end),streams=observed===null&&counters?counters.get(r.id):observed;
   if(streams===null){out.missing++;continue;}
   const type=r.type==='single'?'singles':'albums';
   out[type].push({id:'p:r:'+r.id,title:r.name,byline:r.bandTerms?.name||s.player?.name||'Tu artista',format:r.type,player:true,streams});
  }
  for(const type of TYPES)out[type].sort(compare).forEach((row,i)=>{row.rank=i+1;});
  return out;
 }
 function selected(rows){
  const best=rows.find(r=>r.player),top=rows.slice(0,20);
  if(best&&best.rank>20)top.push(best);
  return top;
 }
 function prune(book){
  const referenced=new Set(book.snapshots.flatMap(snap=>TYPES.flatMap(type=>snap[type].map(row=>row[0]))));
  for(const id of Object.keys(book.dictionary))if(!referenced.has(id))delete book.dictionary[id];
  const records=Object.keys(book.records).sort((a,b)=>book.records[b][2]-book.records[a][2]||book.records[a][3]-book.records[b][3]||(a<b?-1:1));
  for(const id of records.slice(96))delete book.records[id];
 }
 function capture(s,week){
  if(!validClose(s,week))return {captured:false,reason:'incomplete_week'};
  if(s.chartBook&&s.chartBook.version!==1)return {captured:false,reason:'unsupported_version'};
  const old=s.chartBook;
  if(old?.snapshots?.some(row=>row.week>=week))return {captured:false,reason:'already_observed'};
  const ranks=rankings(s,week);
  const book=old?JSON.parse(JSON.stringify(old)):{version:1,startedWeek:week,snapshots:[],dictionary:{},records:{}};
  const snap={week,missing:ranks.missing};
  for(const type of TYPES){
   snap[type]=selected(ranks[type]).map(r=>{
    const prev=book.records[r.id],change=prev&&prev[2]===week-1?prev[3]-r.rank:null;
    const record=[prev?Math.min(prev[0],r.rank):r.rank,(prev?.[1]||0)+1,week,r.rank,prev?.[4]||week];
    book.records[r.id]=record;
    book.dictionary[r.id]=[text(r.title),text(r.byline,44),text(r.format,20),r.player?1:0];
    // ID, actual rank, weekly streams, movement, observed peak, observed closes, first observation.
    return [r.id,r.rank,r.streams,change,record[0],record[1],record[4]];
   });
  }
  book.snapshots.push(snap);
  if(book.snapshots.length>4)book.snapshots.splice(0,book.snapshots.length-4);
  prune(book);
  // A hard byte ceiling prevents the report from crowding financial save data.
  while(JSON.stringify(book).length*2>LIMIT&&book.snapshots.length>1){book.snapshots.shift();prune(book);}
  while(JSON.stringify(book).length*2>LIMIT&&Object.keys(book.records).length){const ids=Object.keys(book.records).sort((a,b)=>book.records[a][2]-book.records[b][2]);delete book.records[ids[0]];}
  if(JSON.stringify(book).length*2>LIMIT)return {captured:false,reason:'report_size_limit'};
  s.chartBook=book;
  return {captured:true,week,bytes:JSON.stringify(book).length*2};
 }
 function readSnapshot(s,week){
  const book=s.chartBook?.version===1?s.chartBook:null,snaps=book?.snapshots||[],latest=snaps.at(-1),wanted=week===undefined||week===null||week===''?latest?.week:Number(week),saved=snaps.find(x=>x.week===wanted);
  const view={book,snaps,wanted,snapshot:saved,dictionary:book?.dictionary||{},reconciled:false};
  if(!saved||saved!==latest||!saved.missing||!validClose(s,saved.week))return view;
  const total=dailyTotal(s.salesHistory,(saved.week-1)*7,saved.week*7);
  if(!closedCounters(s,saved.week,total))return view;
  const ranks=rankings(s,saved.week);if(!ranks||ranks.missing>=saved.missing)return view;
  const dictionary={...view.dictionary},snapshot={week:saved.week,missing:ranks.missing};
  for(const type of TYPES)snapshot[type]=selected(ranks[type]).map(r=>{
   dictionary[r.id]=[text(r.title),text(r.byline,44),text(r.format,20),r.player?1:0];
   // This is a read-only reconciliation of the current close. Historical
   // movements, peaks and appearance counts are not reconstructed or saved.
   return[r.id,r.rank,r.streams,null,null,null,null];
  });
  return{...view,snapshot,dictionary,reconciled:true};
 }
 function dateRange(s,week){
  const epoch=Date.parse((s.calendar?.epoch||'2026-01-05')+'T00:00:00Z');
  if(!Number.isFinite(epoch))return 'Fecha sin registro';
  const fmt=n=>new Date(epoch+n*86400000).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  return fmt((week-1)*7)+' al '+fmt(week*7-1);
 }
 function historyContext(s,type,view,own,leader){
  const archive=view.snaps.filter(snap=>snap.week<=view.snapshot.week)
   .map(snap=>snap.week===view.snapshot.week?view.snapshot:snap);
  const entries=new Map();
  for(const snap of archive.slice().reverse())for(const row of snap[type]){
   if(!entries.has(row[0])&&view.dictionary[row[0]])entries.set(row[0],view.dictionary[row[0]]);
  }
  if(!chartPreferences.has(s))chartPreferences.set(s,{});
  const preferences=chartPreferences.get(s);
  const preference=preferences[type]||(preferences[type]={metric:'streams',entry:null});
  const ownHasActivity=own&&archive.some(snap=>snap[type].some(row=>row[0]===own[0]&&row[2]>0));
  const defaultEntry=ownHasActivity?own[0]:leader?.[0]||own?.[0]||entries.keys().next().value;
  return {type,view,archive,entries,preference,defaultEntry};
 }
 function historyEntry(context){
  if(context.entries.has(context.preference.entry))return context.preference.entry;
  return context.entries.has(context.defaultEntry)?context.defaultEntry:context.entries.keys().next().value;
 }
 function historyRows(context,id){
  return context.archive.map(snap=>({week:snap.week,row:snap[context.type].find(row=>row[0]===id)||null,
   reconciled:context.view.reconciled&&snap===context.view.snapshot}));
 }
 const short=v=>v>=1e9?(v/1e9).toLocaleString('es-CO',{maximumFractionDigits:1})+' mil M':v>=1e6?(v/1e6).toLocaleString('es-CO',{maximumFractionDigits:1})+' M':v>=1e3?(v/1e3).toLocaleString('es-CO',{maximumFractionDigits:1})+' mil':num(v);
 function historyPlot(observations,metric,title){
  const isRank=metric==='rank',points=observations.map(entry=>{
   const row=entry.row;
   return {...entry,value:isRank?(row?.[2]>0?row[1]:null):row?.[2]??null};
  });
  if(!points.some(p=>p.value!==null))return `<p class="chart-history-empty">${isRank?'Aún no hay un puesto con actividad en estas ediciones.':'No hay streams registrados para esta entrada en las ediciones disponibles.'}</p>`;
  const W=600,H=178,L=66,R=29,T=18,B=33;
  const first=points[0].week,last=points.at(-1).week,span=last-first;
  const maximum=Math.max(...points.map(p=>p.value??0),isRank?2:1);
  const scale=Math.pow(10,Math.floor(Math.log10(Math.max(1,maximum/3))));
  const step=Math.max(1,Math.ceil(maximum/(3*scale))*scale);
  const top=isRank?Math.max(4,Math.ceil((maximum-1)/3)*3+1):step*3;
  const ticks=isRank?[1,1+(top-1)/3,1+(top-1)*2/3,top]:[0,step,step*2,top];
  const x=w=>span?L+(w-first)/span*(W-L-R):(W+L-R)/2;
  const y=v=>isRank?T+(v-1)/(top-1)*(H-T-B):H-B-v/top*(H-T-B);
  const segments=[];
  for(const p of points){
   if(p.value===null)continue;
   const current=segments.at(-1);
   if(current?.at(-1).week===p.week-1)current.push(p);
   else segments.push([p]);
  }
  const precision=n=>n.toFixed(2);
  return `<svg class="chart-history-plot" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc((isRank?'Puesto, con el número uno arriba':'Streams semanales')+' de '+title+'. Ediciones conservadas de semana '+first+' a '+last+'. Valores exactos debajo del gráfico.')}" focusable="false">
   ${ticks.map(v=>`<line x1="${L}" x2="${W-R}" y1="${precision(y(v))}" y2="${precision(y(v))}" class="chart-history-rule"/><text x="${L-11}" y="${precision(y(v)+5)}" text-anchor="end">${isRank?'#'+num(v):short(v)}</text>`).join('')}
   ${segments.filter(part=>part.length>1).map(part=>`<polyline class="chart-history-line" points="${part.map(p=>precision(x(p.week))+','+precision(y(p.value))).join(' ')}"/>`).join('')}
   ${points.filter(p=>p.value!==null).map(p=>`<circle class="chart-history-point ${p.week===last?'is-edition':''}" cx="${precision(x(p.week))}" cy="${precision(y(p.value))}" r="${p.week===last?6:4}"><title>S${p.week} · ${isRank?'#'+num(p.value):num(p.value)+' streams'}</title></circle>`).join('')}
   ${points.map((p,i)=>span>8&&i!==0&&i!==points.length-1?'':`<text x="${precision(x(p.week))}" y="${H-10}" text-anchor="${p.week===first&&span?'start':p.week===last&&span?'end':'middle'}">S${p.week}</text>`).join('')}
  </svg>`;
 }
 function historyMarkup(context){
  if(!context.entries.size)return '';
  const {entries,preference,view}=context,id=historyEntry(context);
  const [title,byline,format,player]=entries.get(id),observations=historyRows(context,id),current=observations.at(-1);
  const registered=observations.filter(o=>o.row).length;
  const noRow=current.row?'':`<p class="chart-history-message">Esta entrada no tiene fila en S${current.week}. Puedes consultar las semanas en que quedó registrada.</p>`;
  const metricGroup=`<div class="chart-history-metrics" role="group" aria-label="Medida del historial">${[['streams','Streams'],['rank','Puesto']].map(([metric,label])=>`<button type="button" data-chart-metric="${metric}" aria-pressed="${metric===preference.metric}">${label}</button>`).join('')}</div>`;
  return `<div class="chart-history-head"><div><h2 id="chart-history-title">Historial semanal</h2><p>${registered} de ${observations.length} ${observations.length===1?'edición disponible':'ediciones disponibles'} con fila · hasta S${view.snapshot.week}</p></div>${metricGroup}</div>
   <div class="chart-history-context"><label class="chart-history-choice">Explorar entrada<select data-chart-entry>${[...entries].map(([key,meta])=>`<option value="${esc(key)}" ${key===id?'selected':''}>${esc(meta[0])}${meta[3]?' · tú':''}${meta[1]?' · '+esc(meta[1]):''}</option>`).join('')}</select></label>
   <p class="chart-history-identity"><b>${esc(title)}</b> ${esc(byline)}${format?' · '+esc(format):''}${player?' · Tu carrera':''}</p></div>
   ${noRow}${historyPlot(observations,preference.metric,title)}
   <dl class="chart-history-values" aria-label="Valores exactos por edición">${observations.map(o=>{
    const row=o.row;
    const value=preference.metric==='rank'?(row?.[2]>0?'#'+num(row[1]):row?'Sin actividad':'Sin registro'):(row?num(row[2]):'Sin registro');
    const hint=row?(preference.metric==='rank'?(row[2]>0?num(row[2])+' streams':'0 streams'):(row[2]>0?'Puesto #'+num(row[1]):'Sin puesto')):'Fuera del detalle guardado';
    return `<div${o.week===current.week?' class="is-edition"':''}><dt>S${o.week}${o.reconciled?' · conciliada':''}</dt><dd><strong>${value}</strong><small>${hint}</small></dd></div>`;
   }).join('')}</dl>
   <p class="chart-history-key">${preference.metric==='rank'?'El #1 va arriba. ':''}La línea sólo une cierres consecutivos con dato. El archivo conserva hasta cuatro ediciones.</p>`;
 }
 function changeHistory(control,{entry,metric}){
  const desk=control.closest('.chart-desk'),panel=desk?.querySelector('[data-chart-history]');
  if(!panel||!activeHistory)return;
  if(entry&&activeHistory.entries.has(entry))activeHistory.preference.entry=entry;
  if(metric==='streams'||metric==='rank')activeHistory.preference.metric=metric;
  panel.innerHTML=historyMarkup(activeHistory);
  const selected=historyEntry(activeHistory);
  for(const trigger of desk.querySelectorAll('[data-chart-track]')){
   trigger.setAttribute('aria-pressed',String(trigger.dataset.chartTrack===selected));
  }
  const next=metric?panel.querySelector('[data-chart-metric="'+metric+'"]'):panel.querySelector('[data-chart-entry]');
  next?.focus({preventScroll:true});
  if(control.dataset.chartTrack)panel.scrollIntoView({block:'start'});
  const announcement=panel.querySelector('[data-chart-entry]')?.selectedOptions[0]?.textContent;
  const status=desk.querySelector('[data-chart-history-status]');
  if(status&&announcement)status.textContent=`${announcement}. ${activeHistory.preference.metric==='rank'?'Puesto':'Streams'} por edición.`;
 }
 function chartTable(rows,type,snap,info,active){
  if(!rows.length)return `<div class="chart-empty compact"><h2>Esta edición aún no registra ${type==='singles'?'singles':'álbumes'} identificados.</h2><p>Los títulos previos de los rivales cuentan en su total de artista. Las obras que aparezcan después quedarán en el archivo a partir de su cierre.</p></div>`;
  const movement=n=>n===null?'<span class="chart-move unknown" title="Sin cierre anterior comparable">—</span>':n===0?'<span class="chart-move flat" aria-label="Sin cambio">=</span>':`<span class="chart-move ${n>0?'up':'down'}" aria-label="${n>0?'Sube':'Baja'} ${Math.abs(n)} posiciones">${n>0?'↑':'↓'} ${Math.abs(n)}</span>`;
  const entries=rows.map((r,i)=>{
   const d=info(r[0]);
   const earlier=Number.isInteger(r[6])?'Observaciones desde S'+r[6]:'Sin historial comparable para esta conciliación';
   const divider=r[1]>20?'<tr class="chart-gap"><td colspan="6">Mejor posición propia fuera del Top 20</td></tr>':'';
   return `${divider}<tr class="${d[3]?'chart-player':''} ${i===0&&r[2]>0?'chart-leader':''}">
    <td class="chart-rank">${r[2]>0?r[1]:'—'}</td><td>${movement(r[2]>0?r[3]:null)}</td>
    <td><button type="button" class="chart-track" data-chart-track="${esc(r[0])}" aria-pressed="${active===r[0]}" aria-controls="chart-history-panel"><span class="chart-disc" aria-hidden="true">${type==='artists'?esc(d[0].slice(0,1)):r[1]===1&&r[2]>0?'★':'◉'}</span><span><b>${esc(d[0])}${d[3]?'<mark>Tú</mark>':''}</b><small>${esc(d[1])}${d[2]?' · '+esc(d[2]):''}</small></span></button></td>
    <td class="chart-streams">${num(r[2])}${r[2]>0?'':'<small>Sin actividad</small>'}</td>
    <td title="${earlier}">${r[2]>0&&Number.isInteger(r[4])?'#'+r[4]:'—'}</td>
    <td title="${earlier}">${Number.isInteger(r[5])?r[5]:'—'}</td>
   </tr>`;
  }).join('');
  return `<div class="chart-table-wrap" role="region" tabindex="0" aria-label="Tabla de posiciones y lanzamientos"><table class="chart-table"><caption>${esc(TITLES[type])} en S${snap.week} · Top 20 y mejor posición propia <span>Elige un nombre para abrir su historial.</span></caption><thead><tr><th scope="col">Puesto</th><th scope="col">Cambio</th><th scope="col">${type==='artists'?'Artista / escena':'Obra / artista'}</th><th scope="col">Streams<small>7 días cerrados</small></th><th scope="col">Pico<small>observado</small></th><th scope="col">Cierres<small>registrados</small></th></tr></thead><tbody>${entries}</tbody></table></div>`;
 }
 function render(s,{type='artists',week}={}){
  if(!TYPES.includes(type))type='artists';
  const view=readSnapshot(s,week),{book,snaps,wanted}=view,latest=snaps.at(-1),snap=view.snapshot,rows=snap?.[type]||[];
  const info=id=>view.dictionary[id]||['Obra sin nombre','','',0],own=rows.find(r=>info(r[0])[3]),leader=rows.find(r=>r[2]>0);
  const tabs=`<div class="chart-tabs" role="group" aria-label="Tipo de chart">${TYPES.map(id=>`<button type="button" data-chart-type="${id}" aria-pressed="${id===type}">${TITLES[id]}</button>`).join('')}</div>`;
  const followsLatest=week===undefined||week===null||week==='';
  const expired=latest&&!snap&&Number.isInteger(wanted)?`<option value="${wanted}" disabled selected>S${wanted} · fuera del archivo</option>`:'';
  const selector=snaps.length?`<label class="chart-edition">Edición semanal<select data-chart-week aria-label="Semana del chart"><option value="" ${followsLatest?'selected':''}>Seguir último cierre (S${latest.week})</option>${expired}${snaps.slice().reverse().map(x=>`<option value="${x.week}" ${!followsLatest&&snap?.week===x.week?'selected':''}>Semana ${x.week}</option>`).join('')}</select></label>`:'';
  const header=`<header class="chart-heading"><div><span class="chart-kicker">Circuito simulado / LATAM</span><h1>Pulso del circuito</h1><p>Clasificación interna de tu artista y los rivales ficticios, de lunes a domingo.</p></div><div class="chart-stamp"><span>${snap&&snap.week===latest.week?'Último cierre':snap?'Archivo semanal':'Próxima edición'}</span><strong>${snap?'S'+snap.week:'Domingo'}</strong><small>${snap?dateRange(s,snap.week):'Completa la semana'}</small></div></header><div class="chart-toolbar">${tabs}${selector}</div>`;
  if(!snap){
   activeHistory=null;
   return `<section class="chart-desk">${header}<div class="chart-empty"><span class="chart-empty-record" aria-hidden="true">◉</span><h2>${latest?'Esa edición ya no está en el archivo.':'El ranking cierra el domingo.'}</h2><p>${latest?'Elige una de las ediciones disponibles arriba.':'Completa siete días de agenda para comparar tus streams con los del circuito. Las carreras antiguas empiezan el archivo en el siguiente cierre registrado.'}</p>${latest?'':'<button type="button" class="outline" data-nav="week">Volver a mi agenda</button>'}</div></section>`;
  }
  const context=historyContext(s,type,view,own,leader);
  activeHistory=context;
  const spotlight=own?`<span>Tu posición</span><strong>${own[2]>0?'#'+own[1]:'—'}</strong><b>${esc(info(own[0])[0])}</b><small>${own[2]>0?num(own[2])+' streams esta semana':'Sin actividad · 0 streams'}</small>`:`<span>Tu posición</span><strong>—</strong><b>${type==='artists'?'Sin registro':'Aún sin obra clasificable'}</b><small>${snap.missing?'Faltan días completos por obra en el historial.':'Publica '+(type==='singles'?'un single':'un álbum o EP')+' y completa el cierre.'}</small>`;
  const gap=own&&own[2]>0&&leader&&own[1]!==1?`A ${num(Math.max(0,leader[2]-own[2]+1))} streams de superar las escuchas del #1.`:own?.[1]===1&&own[2]>0?'Lideras esta edición. La próxima cuenta otra semana.':'';
  const reconciliation=view.reconciled?'<p class="chart-reconciled"><strong>Cierre conciliado.</strong> Los contadores de obra cuadran con los siete días. Esta edición no reconstruye movimientos, picos ni apariciones anteriores.</p>':'';
  const panel=context.entries.size?`<section class="chart-history" id="chart-history-panel" data-chart-history aria-labelledby="chart-history-title">${historyMarkup(context)}</section><span class="chart-visually-hidden" data-chart-history-status aria-live="polite"></span>`:'';
  return `<section class="chart-desk">${header}${reconciliation}
   <div class="chart-board"><div class="chart-hero"><div class="chart-your-place">${spotlight}</div><div class="chart-leader-note"><span>Líder del circuito</span><h2>${leader?esc(info(leader[0])[0]):'Sin actividad registrada'}</h2><p>${leader?num(leader[2])+' streams · '+esc(info(leader[0])[1]):'El próximo estreno abre la lista.'}</p>${gap?`<small>${gap}</small>`:''}</div></div>${panel}</div>
   ${chartTable(rows,type,snap,info,historyEntry(context))}
   <details class="chart-method" id="chart-methodology"><summary>Cómo se calcula este ranking</summary><p>Tus streams suman siete días de lunes a domingo. Si se compactó el detalle, el contador por obra sólo se admite cuando concilia con los siete días del cierre. Los rivales usan su demanda diaria al cierre × 7. La suma de sus obras se limita al total del artista. Los álbumes, EP y deluxe se comparan como obras completas.</p><p>Top 20 más la mejor posición propia. Pico y cierres cuentan apariciones observadas desde S${book.startedWeek}. El archivo conserva hasta cuatro ediciones. Un guion indica que falta una comparación o que hubo cero streams. ${snap.missing?`${snap.missing} obra(s) tuya(s) quedaron sin clasificar por falta de días completos. `:''}Es un ranking interno de la carrera y del circuito ficticio LATAM. Streams y ventas son unidades distintas.</p></details>
   <button type="button" class="outline small chart-sales-link" data-nav="sales">Ver ventas y curva de catálogo</button></section>`;
 }
 if(root.document){
  function restoreEditionFocus(selector){
   root.requestAnimationFrame(()=>root.document.querySelector('.chart-desk '+selector)?.focus({preventScroll:true}));
  }
  root.document.addEventListener('change',event=>{
   const control=event.target;
   if(control.matches?.('.chart-desk [data-chart-entry]'))changeHistory(control,{entry:control.value});
   if(control.matches?.('.chart-desk [data-chart-week]'))restoreEditionFocus('[data-chart-week]');
  });
  root.document.addEventListener('click',event=>{
   const control=event.target.closest?.('.chart-desk button');
   if(!control)return;
   if(control.dataset.chartMetric)changeHistory(control,{metric:control.dataset.chartMetric});
   if(control.dataset.chartTrack)changeHistory(control,{entry:control.dataset.chartTrack});
   if(TYPES.includes(control.dataset.chartType))restoreEditionFocus('[data-chart-type="'+control.dataset.chartType+'"]');
  });
 }
 const api={capture,render,rankings,readSnapshot};
 root.RapCharts=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
