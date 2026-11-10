/* Geographic observations of the existing simulation. Counts are partitions, never bonuses.
 * Populations, recognition and reach coefficients are fictional balance parameters. */
(function(root){
 'use strict';
 const VERSION=1, HISTORY=52, LATAM=['CO','MX','AR','CL','PE','BR','PR','DO'];
 const definitions=[
  ['CO','Colombia','América',14000000,-74,5,['Medellín','Cali','Bogotá','Barranquilla']],
  ['MX','México','América',38000000,-102,24,['Ciudad de México','Guadalajara','Monterrey','Puebla']],
  ['AR','Argentina','América',16000000,-64,-35,['Buenos Aires','Córdoba','Rosario','Mendoza']],
  ['CL','Chile','América',8000000,-71,-31,['Santiago','Valparaíso','Concepción']],
  ['PE','Perú','América',9000000,-76,-10,['Lima','Arequipa','Trujillo']],
  ['BR','Brasil','América',65000000,-50,-10,['São Paulo','Rio de Janeiro','Belo Horizonte','Recife']],
  ['PR','Puerto Rico','América',1400000,-66,18,['San Juan','Ponce','Mayagüez']],
  ['DO','República Dominicana','América',3500000,-70,19,['Santo Domingo','Santiago de los Caballeros','La Romana']],
  ['US','USA','América',200000000,-100,39,['Miami','Nueva York','Los Ángeles']],
  ['ES','España','Europa',16000000,-4,40,['Madrid','Barcelona']],
  ['FR','Francia','Europa',22000000,2,47,['París','Lyon']],
  ['GB','Reino Unido','Europa',26000000,-2,54,['Londres','Manchester']],
  ['DE','Alemania','Europa',28000000,11,51,['Berlín','Hamburgo']],
  ['JP','Japón','Asia',38000000,138,37,['Tokio','Osaka']],
  ['KR','Corea del Sur','Asia',18000000,128,36,['Seúl','Busan']],
  ['ZA','Sudáfrica','África',12000000,25,-29,['Johannesburgo','Ciudad del Cabo']],
  ['AU','Australia','Oceanía',12000000,134,-25,['Sídney','Melbourne']]
 ];
 const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),slug=v=>norm(v).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const countries=definitions.map(([id,name,continent,population,lon,lat,names])=>({id,name,marketId:name,continent,population,lon,lat,latam:LATAM.includes(id),cities:names.map((name,i)=>({id:id.toLowerCase()+'-'+(name==='Ciudad de México'?'cdmx':slug(name)),name,countryId:id,continent,population:Math.floor(population*.65/names.length),lon:lon+((i%2)*2-1)*1.5,lat:lat+(Math.floor(i/2)-.5)*2}))}));
 const cities=countries.flatMap(c=>c.cities),byId=new Map(countries.map(c=>[c.id,c]).concat(cities.map(c=>[c.id,c]))),safe=n=>Number.isSafeInteger(n)&&n>=0,finite=n=>Number.isFinite(n)&&n>=0,clone=v=>JSON.parse(JSON.stringify(v));
 const actors=s=>[{...s.player,id:'player'},...(s.management?.artists||[])],actor=(s,id='player')=>id==='player'?s.player:(s.management?.artists||[]).find(a=>a.id===id);
 const day=s=>Math.max(0,Math.floor(s.calendar?.day||0));
 function country(value){if(norm(value)==='caribe')return byId.get('PR');return countries.find(c=>c.id===String(value).toUpperCase()||norm(c.name)===norm(value)||value==='Estados Unidos'&&c.id==='US')||null;}
 function resolve(value){const canonical={'br-rio':'br-rio-de-janeiro','do-santiago':'do-santiago-de-los-caballeros'}[value]||value;if(byId.has(canonical))return byId.get(canonical);return country(value)||cities.find(c=>norm(c.name)===norm(value))||null;}
 function allowed(s,id){const t=resolve(id);return !!t&&(LATAM.includes(t.countryId||t.id)||s.progression?.usaUnlocked===true);}
 function leaves(id){const t=resolve(id);if(!t)return[];if(t.countryId)return[{id:t.id,countryId:t.countryId,population:t.population}];return [...t.cities.map(c=>({id:c.id,countryId:t.id,population:c.population})),{id:t.id+':rest',countryId:t.id,population:t.population-t.cities.reduce((n,c)=>n+c.population,0)}];}
 function leafCountry(id){return byId.get(id)?.countryId||(/^[A-Z]{2}:rest$/.test(id)?id.slice(0,2):null);}
 function countryForActor(s,id){const a=actor(s,id);return country(id==='player'?s.career?.marketId||a?.countryId:a?.marketId)||country(s.career?.marketId)||countries[0];}
 function targetFor(s,p={}){const explicit=resolve(p.territoryId||p.targetId||p.cityId);if(explicit)return explicit;const c=country(p.marketId||p.country)||countryForActor(s,p.actorId||'player');return cities.find(t=>t.countryId===c.id&&norm(t.name)===norm(p.city))||c;}
 function streamTotal(s,id){const rows=id==='player'?s.releases:actor(s,id)?.releases;return (rows||[]).reduce((n,r)=>n+(safe(r.totalStreams)?r.totalStreams:0),0);}
 function snapshot(s){return{day:day(s),actors:Object.fromEntries(actors(s).map(a=>[a.id,{fans:Math.round(a.fans||0),streams:streamTotal(s,a.id)}]))};}
 function blank(s,id,prior){return{actorId:id,startedDay:day(s),trackedFans:prior.fans,trackedStreams:prior.streams,unlocated:prior.fans,unlocatedStreams:0,cells:{},history:[],campaigns:[],lastDay:day(s),legacy:prior.fans>0};}
 function distribute(total,weights){if(!safe(total)||total===0)return weights.map(()=>0);const sum=weights.reduce((n,v)=>n+Math.max(0,v),0);if(sum<=0)return weights.map((_,i)=>i?0:total);const exact=weights.map(w=>total*Math.max(0,w)/sum),out=exact.map(Math.floor);let remaining=total-out.reduce((n,v)=>n+v,0);const order=exact.map((v,i)=>({i,f:v-out[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);for(let i=0;i<remaining;i++)out[order[i].i]++;return out;}
 function cell(book,id){return book.cells[id]||(book.cells[id]={fans:0,streams:0,gains:0,losses:0,firstDay:null,lastDay:null,activeDays:0});}
 function add(s,book,n,p,metric='fans'){
  if(n===0)return;const local=!!(p.territoryId||p.targetId||p.cityId||p.city||p.marketId||p.country),t=local?targetFor(s,p):null;
  let keys=t?leaves(t.id).map(x=>x.id):Object.keys(book.cells).filter(k=>book.cells[k].fans>0);
  let weights=t?leaves(t.id).map(x=>x.population):keys.map(k=>book.cells[k].fans);
  if(!keys.length){if(metric==='fans')book.unlocated+=n;else book.unlocatedStreams+=n;return;}
  const amounts=distribute(n,weights);keys.forEach((key,i)=>{if(!amounts[i])return;const c=cell(book,key);c[metric]+=amounts[i];if(metric==='fans')c.gains+=amounts[i];if(c.lastDay!==day(s)){c.activeDays++;c.lastDay=day(s);}if(c.firstDay===null)c.firstDay=day(s);});
 }
 function lose(book,n){const keys=['unlocated',...Object.keys(book.cells)],counts=keys.map(k=>k==='unlocated'?book.unlocated:book.cells[k].fans),parts=distribute(n,counts);keys.forEach((k,i)=>{if(k==='unlocated')book.unlocated-=parts[i];else{book.cells[k].fans-=parts[i];book.cells[k].losses+=parts[i];}});}
 function targetMetrics(book,id){const ids=new Set(leaves(id).map(x=>x.id)),rows=Object.entries(book?.cells||{}).filter(([id])=>ids.has(id)).map(([,v])=>v);return{fans:rows.reduce((n,c)=>n+c.fans,0),streams:rows.reduce((n,c)=>n+c.streams,0),gains:rows.reduce((n,c)=>n+c.gains,0),activeDays:Math.max(0,...rows.map(c=>c.activeDays)),firstDay:Math.min(...rows.map(c=>c.firstDay).filter(v=>v!==null))};}
 function repertoire(s,id){const rows=id==='player'&&s.management?.role==='manager'?(s.management.artists||[]).filter(a=>a.contract?.status==='active'||a.labelContract?.status==='active').flatMap(a=>(a.releases||[]).map(r=>({...r,key:a.id+':'+r.id}))):(id==='player'?s.releases:actor(s,id)?.releases)||[];return rows.filter(r=>typeof r.id==='string'&&!r.canonical).map(r=>({key:r.key||r.id,day:r.releasedDay}));}
 function campaignCriteria(s,id,c){const a=actor(s,id),releases=repertoire(s,id),newReleases=releases.filter(r=>safe(r.day)&&r.day>=c.startedDay&&(r.day>c.startedDay||!(c.startReleaseIds||[]).includes(r.key))).length,reputation=Math.max(0,Number(a?.reputation)||0),ownCash=id==='player'?s.cash:a?.cash,solvent=Number.isFinite(ownCash)&&ownCash>=0&&Number.isFinite(s.cash)&&s.cash>=0&&!(s.loans||[]).some(l=>l.status==='default');return{repertoire:newReleases,reputation,reputationTarget:c.reputationTarget||0,solvent};}
 function progress(s,book){for(const c of book.campaigns){if(c.status!=='active')continue;const m=targetMetrics(book,c.targetId),newFans=Math.max(0,m.gains-c.startGains),elapsed=day(s)-c.startedDay,criteria=c.criteriaVersion===2?campaignCriteria(s,book.actorId,c):null;c.progress={fans:newFans,days:elapsed,activeFans:m.fans,...(criteria||{})};const stages=[newFans>=c.targets[0],newFans>=c.targets[1]&&elapsed>=7&&(!criteria||criteria.repertoire>=1&&criteria.reputation>=c.reputationTarget),newFans>=c.targets[2]&&elapsed>=28&&m.fans>=Math.ceil(c.targets[2]*.75)&&(!criteria||criteria.solvent)];let count=0;while(stages[count])count++;for(let i=c.stages.length;i<count;i++)c.stages.push({index:i,day:day(s)});if(count===3){c.status='completed';c.completedDay=day(s);}}}
 function capture(s,before,context={}){
  if(!before?.actors||s.financialHold||s.continuityHold)return;
  if(!s.territories)s.territories={version:VERSION,actors:{}};
  for(const a of actors(s)){
   const id=a.id,prior=before.actors[id];if(!prior)continue;
   let b=s.territories.actors[id];if(!b)b=s.territories.actors[id]=blank(s,id,prior);
   const current=Math.round(a.fans||0),delta=current-b.trackedFans,streams=streamTotal(s,id),ds=Math.max(0,streams-b.trackedStreams),p=context.actorId&&context.actorId!==id?{actorId:id}:{...context,actorId:id};
   if(delta>0)add(s,b,delta,p);else if(delta<0)lose(b,-delta);
   if(ds>0)add(s,b,ds,p,'streams');b.trackedFans=current;b.trackedStreams=streams;b.lastDay=day(s);progress(s,b);
   const week=Math.floor(day(s)/7);if(day(s)>0&&day(s)%7===0&&b.history.at(-1)?.week!==week){b.history.push({week,fans:current,knownFans:current-b.unlocated,unlocated:b.unlocated});if(b.history.length>HISTORY)b.history.shift();}
  }
 }
 function recognition(fans,population){return Math.round(Math.min(100,Math.log10(1+fans/Math.max(1,population)*100000)*20)*10)/10;}
 function summary(s,p={}){
  const id=p.actorId||'player',a=actor(s,id);if(!a)return null;const stored=s.territories?.actors?.[id],book=stored||blank(s,id,{fans:Math.round(a.fans||0),streams:streamTotal(s,id)}),total=Math.round(a.fans||0);
  const rows=countries.map(c=>{const m=targetMetrics(book,c.id);return{...c,...m,firstDay:Number.isFinite(m.firstDay)?m.firstDay:null,recognition:recognition(m.fans,c.population),allowed:allowed(s,c.id),cities:c.cities.map(t=>{const m=targetMetrics(book,t.id);return{...t,...m,recognition:recognition(m.fans,t.population),allowed:allowed(s,t.id)};})};});
  return{actorId:id,name:a.name,totalFans:total,knownFans:Math.max(0,total-book.unlocated),unlocated:book.unlocated,trackedFromDay:stored?.startedDay??null,rows,campaigns:clone(book.campaigns),history:clone(book.history),actors:actors(s).map(a=>({id:a.id,name:a.name})),note:'Fans localizados desde actividades registradas. Países y continentes agrupan las mismas personas. Las cifras de población y reconocimiento son simuladas.'};
 }
 function showDemand(s,p={}){
  const id=p.actorId||'player',a=actor(s,id);if(!a)return{effectiveFans:0,knownFans:0,legacyEstimate:0,estimated:false,localRecognition:0};
  const t=targetFor(s,p),c=country(t.countryId||t.id),b=s.territories?.actors?.[id],total=Math.round(a.fans||0),unlocated=b?b.unlocated:total;
  const local=targetMetrics(b,t.id),national=targetMetrics(b,c.id),knownFans=t.countryId?local.fans+Math.floor(Math.max(0,national.fans-local.fans)*.035):national.fans;
  // A legacy estimate is not a distribution or an observed count. It is only a disclosed booking forecast.
  const home=country(id==='player'?a.countryId||a.countryName:a.marketId)||countryForActor(s,id),legacyEstimate=Math.floor(unlocated*(c.id===home.id?(t.countryId ? .1 : .18):.006));
  return{effectiveFans:knownFans+legacyEstimate,knownFans,legacyEstimate,estimated:unlocated>0,localRecognition:recognition(local.fans,t.population),territoryId:t.id,name:t.name};
 }
 function act(s,p={}){
  const id=p.actorId||'player',a=actor(s,id),t=resolve(p.targetId||p.territoryId);if(!a)return{ok:false,message:'Elige un artista de la carrera.'};
  if(s.financialHold||s.continuityHold)return{ok:false,message:'Concilia la carrera antes de fijar una expansión.'};
  if(p.decision==='start'){
   if(!t||!allowed(s,t.id))return{ok:false,message:'Este territorio requiere superar la campaña hard LATAM y abrir la expansión.'};
   if(s.territories?.actors?.[id]?.campaigns.some(c=>['active','paused'].includes(c.status)))return{ok:false,message:'Termina o abandona la expansión actual de este artista.'};
   if(!s.territories)s.territories={version:VERSION,actors:{}};const b=s.territories.actors[id]||(s.territories.actors[id]=blank(s,id,{fans:Math.round(a.fans||0),streams:streamTotal(s,id)})),m=targetMetrics(b,t.id),base=Math.max(10,Math.ceil(Math.sqrt(Math.max(1,a.fans))*2)),targets=[base,base*3,base*8];
   const prefix='territory-'+id+'-'+day(s)+'-',usedIds=new Set(b.campaigns.map(c=>c.id));let sequence=b.campaigns.length;while(usedIds.has(prefix+sequence))sequence++;
   const c={id:prefix+sequence,targetId:t.id,startedDay:day(s),status:'active',startGains:m.gains,targets,stages:[],criteriaVersion:2,startReleaseIds:repertoire(s,id).filter(r=>r.day===day(s)).map(r=>r.key),startReputation:Math.max(0,Number(a.reputation)||0),reputationTarget:Math.max(10,Math.min(100,Number(a.reputation)||0)),progress:{fans:0,days:0},completedDay:null};c.progress={...c.progress,...campaignCriteria(s,id,c)};b.campaigns.push(c);if(b.campaigns.length>30)b.campaigns.shift();return{ok:true,message:'Expansión hacia '+t.name+' fijada. Necesita público, un nuevo estreno, reputación y caja solvente. Las acciones y campañas requieren tus propias órdenes.'};
  }
  const b=s.territories?.actors?.[id],c=b?.campaigns.find(c=>c.id===p.campaignId)||b?.campaigns.find(c=>['active','paused'].includes(c.status));if(!c)return{ok:false,message:'No hay expansión abierta para este artista.'};
  if(p.decision==='pause'&&c.status==='active'){c.status='paused';return{ok:true,message:'Objetivo territorial en pausa; la ciudad y la publicidad ya contratada siguen su calendario.'};}
  if(p.decision==='resume'&&c.status==='paused'){c.status='active';progress(s,b);return{ok:true,message:'Seguimiento de expansión reanudado.'};}
  if(p.decision==='abandon'&&['active','paused'].includes(c.status)){c.status='abandoned';return{ok:true,message:'Objetivo archivado. Tus fans y contratos permanecen.'};}
  return{ok:false,message:'La expansión ya está cerrada o esa orden no corresponde.'};
 }
 function validate(s){
  const v=s.territories;if(v===undefined)return[];const errors=[],bad=()=>errors.push('Registro territorial inválido.');
  if(v?.version!==VERSION||!v.actors||typeof v.actors!=='object'||Array.isArray(v.actors))return['Registro territorial inválido.'];
  for(const [id,b] of Object.entries(v.actors)){
   if(!actor(s,id)||!b||b.actorId!==id||!safe(b.startedDay)||b.startedDay>day(s)||!safe(b.unlocated)||!safe(b.unlocatedStreams)||!safe(b.trackedFans)||!safe(b.trackedStreams)||!b.cells||typeof b.cells!=='object'||Array.isArray(b.cells)||!Array.isArray(b.history)||b.history.length>HISTORY||!Array.isArray(b.campaigns)||b.campaigns.length>30){bad();continue;}
   let total=b.unlocated;for(const [key,c] of Object.entries(b.cells)){if(!leafCountry(key)||!c||['fans','streams','gains','losses','activeDays'].some(k=>!safe(c[k]))||c.firstDay!==null&&(!safe(c.firstDay)||c.firstDay>day(s))||c.lastDay!==null&&(!safe(c.lastDay)||c.lastDay>day(s))){bad();continue;}total+=c.fans;}
   if(total!==b.trackedFans||b.trackedFans!==Math.round(actor(s,id).fans||0)||!safe(total))bad();let prior=0;for(const row of b.history){if(!row||!safe(row.week)||row.week<=prior||['fans','knownFans','unlocated'].some(k=>!safe(row[k]))||row.fans!==row.knownFans+row.unlocated)bad();prior=row?.week;}
   const ids=new Set();for(const c of b.campaigns){if(!c||typeof c.id!=='string'||ids.has(c.id)||!resolve(c.targetId)||!['active','paused','completed','abandoned'].includes(c.status)||!safe(c.startedDay)||c.startedDay>day(s)||!safe(c.startGains)||!Array.isArray(c.targets)||c.targets.length!==3||c.targets.some(n=>!safe(n)||n===0)||!Array.isArray(c.stages)||c.stages.length>3||c.stages.some((r,i)=>r.index!==i||!safe(r.day)||r.day<c.startedDay||r.day>day(s))||!c.progress||!safe(c.progress.fans)||!safe(c.progress.days)||c.status==='completed'&&(c.stages.length!==3||!safe(c.completedDay)||c.completedDay<c.startedDay||c.completedDay>day(s)))bad();if(c?.criteriaVersion!==undefined&&(c.criteriaVersion!==2||!Array.isArray(c.startReleaseIds)||c.startReleaseIds.some(k=>typeof k!=='string')||!finite(c.startReputation)||c.startReputation>100||!finite(c.reputationTarget)||c.reputationTarget<10||c.reputationTarget>100))bad();ids.add(c?.id);}if(b.campaigns.filter(c=>['active','paused'].includes(c.status)).length>1)bad();
  }return errors;
 }
 const api={VERSION,countries,cities,marketNames:countries.map(c=>c.name),country,resolve,allowed,leaves,countryForActor,targetFor,snapshot,capture,summary,showDemand,act,validate,distribute,recognition};root.RapTerritories=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
