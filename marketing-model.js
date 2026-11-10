/* Fictional advertising response, shared by paid media products. No real CPMs or population statistics. */
(function(root){
 'use strict';
 const MODEL='open-budget-v1',HALF_LIFE_DAYS=28,DELIVERY_ALPHA=.001;
 const countries={CO:14000000,MX:38000000,AR:16000000,CL:8000000,PE:9000000,BR:65000000,PR:1400000,DO:3500000,ES:16000000,FR:22000000,GB:26000000,DE:28000000,JP:38000000,KR:18000000,ZA:12000000,AU:12000000,US:200000000};
 const names={'colombia':'CO','mexico':'MX','argentina':'AR','chile':'CL','peru':'PE','brasil':'BR','puerto rico':'PR','republica dominicana':'DO','espana':'ES','francia':'FR','reino unido':'GB','alemania':'DE','japon':'JP','corea del sur':'KR','sudafrica':'ZA','australia':'AU','usa':'US'};
 const normal=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 const territories=()=>root.RapTerritories||(typeof require==='function'?require('./territories.js'):null);
 function amount(value,name='budget'){if(!Number.isFinite(value)||value<0||!Number.isSafeInteger(Math.round(value*100)))throw new RangeError(name+' must be nonnegative money with safely representable cents.');return value;}
 function positive(value,name){if(!Number.isFinite(value)||value<=0)throw new RangeError(name+' must be positive and finite.');return value;}
 function unit(value,name){if(!Number.isFinite(value)||value<0||value>1)throw new RangeError(name+' must be between 0 and 1.');return value;}
 function marginal(p={}){
  const budget=amount(Number(p.budget??p.spend??0)),priorSpend=amount(Number(p.priorSpend??0),'priorSpend'),population=positive(Number(p.population??p.pool??p.audience),'population'),days=positive(Number(p.days??p.durationDays??1),'days'),cpm=positive(Number(p.cpm??6),'cpm'),quality=unit(Number(p.quality??1),'quality'),fit=unit(Number(p.fit??1),'fit'),competition=Number(p.competition??0);
  if(!Number.isFinite(competition)||competition<0)throw new RangeError('competition must be nonnegative and finite.');
  // Differencing log1p directly avoids cancellation for small marginal buys.
  const inventory=population*days/28,efficiency=quality*fit/(1+competition),rate=efficiency/(inventory*cpm/1000),priorImpressions=p.priorContacts===undefined?inventory/DELIVERY_ALPHA*Math.log1p(DELIVERY_ALPHA*rate*priorSpend):amount(Number(p.priorContacts),'priorContacts'),impressions=inventory/DELIVERY_ALPHA*Math.log1p(DELIVERY_ALPHA*rate*budget/(1+DELIVERY_ALPHA*rate*priorSpend)),unique=population*Math.exp(-priorImpressions/population)*(-Math.expm1(-impressions/population));
  if(!Number.isFinite(impressions)||!Number.isFinite(unique))throw new RangeError('Advertising arithmetic exceeded finite precision.');
  const frequency=impressions===0?0:unique>0?Math.min(Number.MAX_SAFE_INTEGER,impressions/unique):Number.MAX_SAFE_INTEGER;
  return{model:MODEL,budget,priorSpend,priorContacts:priorImpressions,population,days,cpm,quality,fit,competition,impressions,unique,uniqueReach:unique,frequency,effectiveCpm:impressions>0?budget/impressions*1000:0,saturated:impressions>0&&unique<1};
 }
 function stock(p={}){const previous=amount(Number(p.stock??p.previous??0),'stock'),added=amount(Number(p.added??p.amount??0),'added'),elapsedDays=Number(p.elapsedDays??p.days??0),halfLifeDays=positive(Number(p.halfLifeDays??HALF_LIFE_DAYS),'halfLifeDays');if(!Number.isFinite(elapsedDays)||elapsedDays<0)throw new RangeError('elapsedDays must be nonnegative.');return amount(previous*Math.pow(2,-elapsedDays/halfLifeDays)+added,'stock');}
 function poolInfo(s,p={}){
  const actorId=p.actorId||'player',a=actorId==='player'?s?.player:s?.management?.artists?.find(a=>a.id===actorId),scope=p.scope||'latam';
  if(!a)return{population:0,scope,market:'',label:'Carrera desconocida',simulated:true,allowed:false,reason:'Selecciona una carrera disponible.'};
  if(p.territoryId||scope==='territory'){
   const geo=territories(),target=geo?.resolve(p.territoryId),allowed=target&&geo.allowed(s,target.id);
   return{population:target?.population||0,scope:'territory',territoryId:target?.id||null,market:target?.name||'',label:(target?.name||'Territorio')+' · público publicitario simulado',simulated:true,allowed:!!allowed,reason:allowed?null:target?'Este territorio exige superar hard LATAM y abrir la expansión.':'Elige un territorio disponible.'};
  }
  if(!['country','latam','usa'].includes(scope))return{population:0,scope,market:'',label:'Mercado desconocido',simulated:true,allowed:false,reason:'Elige país, LATAM o USA.'};
  if(scope==='usa'){const allowed=s.progression?.usaUnlocked===true;return{population:allowed?200000000:0,scope,market:'USA',label:'USA · pool publicitario simulado',simulated:true,allowed,reason:allowed?null:'USA sigue bloqueado hasta superar sus requisitos en difícil.'};}
  if(scope==='latam')return{population:300000000,scope,market:'LATAM',label:'LATAM · pool publicitario simulado',simulated:true,allowed:true,reason:null};
  const origin=actorId==='player'?(s.career||{}):a,market=origin.marketId||origin.countryName||origin.country||s.career?.marketId||'',catalog=root.RapEngine?.catalog?.countries||[],country=catalog.find(c=>c.id===origin.countryId||normal(c.marketId)===normal(market)||normal(c.name)===normal(market)),id=country?.id||origin.countryId||names[normal(market)],fallback=!countries[id],population=countries[id]||12000000;
  return{population,scope,market:country?.name||market||'País de origen',countryId:id||null,label:(country?.name||market||'País de origen')+' · pool publicitario simulado'+(fallback?' (base de diseño por defecto)':''),fallback,simulated:true,allowed:true,reason:null};
 }
 function pool(s,p={}){return poolInfo(s,p).population;}
 function pressureFor(s,p={}){
  const actorId=p.actorId||'player',v=s.marketingPressure?.actors?.[actorId],elapsed=v?Math.max(0,s.calendar.day-v.day):0,decay=Math.pow(2,-elapsed/HALF_LIFE_DAYS),totalSpend=(v?.spendStock||0)*decay,totalContacts=v?.contactStock===undefined?undefined:v.contactStock*decay;
  if(!p.territoryId)return{spendStock:totalSpend,contactStock:totalContacts,day:s.calendar.day};
  const geo=territories(),leaves=geo?.leaves(p.territoryId)||[],ids=new Set(leaves.map(l=>l.id)),rows=Object.entries(v?.territorialStocks||{}),aged=rows.map(([id,row])=>({id,spend:row.spend*Math.pow(2,-Math.max(0,s.calendar.day-row.day)/HALF_LIFE_DAYS),contacts:row.contacts*Math.pow(2,-Math.max(0,s.calendar.day-row.day)/HALF_LIFE_DAYS)})),knownSpend=aged.reduce((n,r)=>n+r.spend,0),knownContacts=aged.reduce((n,r)=>n+r.contacts,0),target=geo?.resolve(p.territoryId),home=geo?.countryForActor(s,actorId),share=Math.min(1,(target?.population||0)/Math.max(home?.population||1,target?.population||1));
  return{spendStock:aged.filter(r=>ids.has(r.id)).reduce((n,r)=>n+r.spend,0)+Math.max(0,totalSpend-knownSpend)*share,contactStock:totalContacts===undefined?undefined:aged.filter(r=>ids.has(r.id)).reduce((n,r)=>n+r.contacts,0)+Math.max(0,totalContacts-knownContacts)*share,day:s.calendar.day};
 }
 function validDuration(s,weeks){const days=Number(weeks)*7,end=Number(s?.calendar?.day)+days,epoch=Date.parse(String(s?.calendar?.epoch)+'T00:00:00Z'),stamp=epoch+end*86400000;if(!Number.isSafeInteger(Number(weeks))||Number(weeks)<1||!Number.isSafeInteger(days)||!Number.isSafeInteger(end)||!Number.isFinite(stamp))return false;const date=new Date(stamp);return Number.isFinite(date.valueOf())&&date.getUTCFullYear()>=1&&date.getUTCFullYear()<=9999;}
 function validate(s){
  const errors=[],m=s?.marketingPressure;if(m===undefined)return errors;
  if(!m||m.model!==MODEL||!m.actors||typeof m.actors!=='object'||Array.isArray(m.actors))return['Memoria publicitaria inválida.'];
  for(const [id,v] of Object.entries(m.actors)){
   if(!v||v.actorId!==id||id!=='player'&&!s.management?.artists?.some(a=>a.id===id)||!Number.isInteger(v.day)||v.day<0||v.day>s.calendar.day||!Number.isFinite(v.spendStock)||v.spendStock<0||!Number.isSafeInteger(Math.round(v.spendStock*100))||!Number.isFinite(v.totalSpend)||v.totalSpend<0||!Number.isSafeInteger(Math.round(v.totalSpend*100))||v.contactStock!==undefined&&(!Number.isFinite(v.contactStock)||v.contactStock<0)){errors.push('Presión publicitaria de carrera inválida.');continue;}
   if([v.fanDay,v.fansToday,v.awardedToday].some(x=>x!==undefined)&&(!Number.isInteger(v.fanDay)||v.fanDay<0||v.fanDay>s.calendar.day||!Number.isSafeInteger(v.fansToday)||v.fansToday<0||!Number.isFinite(v.awardedToday)||v.awardedToday!==Math.round(Math.sqrt(v.fansToday)/1000*100)/100))errors.push('Fama publicitaria diaria inválida.');
   if(v.territorialStocks!==undefined){if(!v.territorialStocks||typeof v.territorialStocks!=='object'||Array.isArray(v.territorialStocks))errors.push('Saturación territorial inválida.');else for(const [key,row] of Object.entries(v.territorialStocks)){if(!territories()?.countries.some(c=>territories().leaves(c.id).some(l=>l.id===key))||!row||!Number.isInteger(row.day)||row.day<0||row.day>s.calendar.day||!Number.isFinite(row.spend)||row.spend<0||!Number.isFinite(row.contacts)||row.contacts<0)errors.push('Saturación territorial inválida.');}}
  }
  return errors;
 }
 function purchaseReach(s,p={}){
  if(validate(s).length)throw new Error('La memoria publicitaria requiere revisión.');
  const actorId=p.actorId||'player',info=poolInfo(s,p);if(!info.allowed)throw new Error(info.reason);
  const spend=amount(Number(p.spend??p.budget??0)),population=Number(p.pool??p.population??info.population),v=s.marketingPressure?.actors?.[actorId],pressure=pressureFor(s,p),priorSpend=pressure.spendStock,priorContacts=pressure.contactStock,q=marginal({...p,budget:spend,priorSpend,priorContacts,population});
  if(p.commit!==false&&spend>0){const aggregate=pressureFor(s,{actorId}),nextStock=stock({stock:aggregate.spendStock,added:spend}),totalSpend=amount((v?.totalSpend||0)+spend,'totalSpend'),contactStock=(aggregate.contactStock??q.priorContacts)+q.impressions;if(!s.marketingPressure)s.marketingPressure={model:MODEL,actors:{}};const next={...v,actorId,day:s.calendar.day,spendStock:nextStock,contactStock,totalSpend};
   if(p.territoryId){next.territorialStocks={...(v?.territorialStocks||{})};const rows=territories().leaves(p.territoryId),total=rows.reduce((n,r)=>n+r.population,0);for(const row of rows){const old=next.territorialStocks[row.id],decay=old?Math.pow(2,-(s.calendar.day-old.day)/HALF_LIFE_DAYS):0,share=row.population/total;next.territorialStocks[row.id]={day:s.calendar.day,spend:(old?.spend||0)*decay+spend*share,contacts:(old?.contacts||0)*decay+q.impressions*share};}}
   s.marketingPressure.actors[actorId]=next;}
  return{...q,actorId,scope:info.scope,market:info.market,poolLabel:info.label,simulatedPool:true};
 }
 function publicityFame(s,p={}){
  if(validate(s).length)throw new Error('La memoria publicitaria requiere revisión.');
  const actorId=p.actorId||'player',a=actorId==='player'?s.player:s.management?.artists?.find(a=>a.id===actorId),gain=Number(p.gain);
  if(!a||!Number.isSafeInteger(gain)||gain<0)throw new RangeError('Publicity requires an available actor and realized nonnegative integer fans.');
  if(gain===0)return 0;
  const day=s.calendar.day,v=s.marketingPressure?.actors?.[actorId],previous=v?.fanDay===day?v.fansToday:0,awarded=v?.fanDay===day?v.awardedToday:0,fansToday=previous+gain;if(!Number.isSafeInteger(fansToday))throw new RangeError('Daily fan arithmetic exceeded exact precision.');
  const awardedToday=Math.round(Math.sqrt(fansToday)/1000*100)/100,delta=Math.max(0,awardedToday-awarded),before=a.fame;
  a.fame=Math.round(Math.max(0,Math.min(100,a.fame+delta))*100)/100;
  if(!s.marketingPressure)s.marketingPressure={model:MODEL,actors:{}};
  s.marketingPressure.actors[actorId]={actorId,day,spendStock:0,contactStock:0,totalSpend:0,...v,fanDay:day,fansToday,awardedToday};return Math.round((a.fame-before)*100)/100;
 }
 const api={MODEL,HALF_LIFE_DAYS,DELIVERY_ALPHA,marginal,delivery:marginal,stock,pool,poolInfo,pressureFor,validDuration,purchaseReach,publicityFame,validate};root.RapMarketingModel=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
