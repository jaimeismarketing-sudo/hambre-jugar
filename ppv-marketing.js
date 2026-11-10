/* PPV media buying. Campaigns share the artist's advertising stock and a film's buyers. */
(function(root){
 'use strict';
 const clone=v=>JSON.parse(JSON.stringify(v)),money=n=>Math.round((n+Number.EPSILON)*100)/100,num=n=>Number.isFinite(n)?n:0;
 const model=()=>root.RapMarketingModel||(typeof require==='function'?require('./marketing-model.js'):null);
 const history=s=>Array.isArray(s.ppvCampaigns)?s.ppvCampaigns:[],films=s=>Array.isArray(s.ppvFilms)?s.ppvFilms:[];
 const safeMoney=n=>Number.isFinite(n)&&n>0&&money(n)===n&&Number.isSafeInteger(Math.round(n*100));
 function operationRate(s){return Math.max(.015,.05-num(s.player?.skills?.business)*.00025-((s.team||[]).some(t=>t.id==='publicist')?.01:0));}
 function list(s){const rows=history(s).slice(),c=s.adsCampaign;if(c?.active&&c.campaignId&&!rows.some(x=>x.campaignId===c.campaignId))rows.push(c);return rows;}
 function active(s){return list(s).filter(c=>c?.active&&c.status==='active');}
 function seed(s,id){let x=(s.rng^0x83f96a11)>>>0;for(const c of id)x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x||1;}
 function random(o){let x=o.rng;x^=x<<13;x^=x>>>17;x^=x<<5;o.rng=x>>>0;return o.rng/4294967296;}
 function ensure(s,h){
  h.ensureLegacy(s);
  if(!s.ppvMarketing){
   s.ppvMarketing={version:1,trackedFromDay:s.calendar.day,lastProcessedWeek:null};
   const c=s.adsCampaign;if(c?.active&&!history(s).some(x=>x.campaignId===c.campaignId))s.ppvCampaigns.push(clone(c));
  }
 }
 function sync(s){
  const rows=history(s),selected=rows.filter(c=>c.active&&c.status==='active').at(-1)||rows.at(-1);
  if(!selected)return;
  const lastPaid=Math.max(-1,...rows.map(c=>Number.isInteger(c.lastPaidAdDay)?c.lastPaidAdDay:-1));
  s.adsCampaign=clone(selected);
  if(s.adsCampaign.status==='cancelled'){s.adsCampaign.status='completed';s.adsCampaign.active=false;s.adsCampaign.cancelled=true;}
  if(lastPaid>=0)s.adsCampaign.lastPaidAdDay=lastPaid;
 }
 function quote(s,p={},h){
  const errors=[],mode=p.mode||'create',legacyRequest=!p.mode,film=mode==='existing'?films(s).find(f=>f.id===p.filmId):null;
  const deluxe=p.deluxeProjectId?s.projects.find(x=>x.id===p.deluxeProjectId):legacyRequest?s.projects.find(x=>x.type==='deluxe'&&x.status==='ready'):null;
  const budget=Number(p.budget??200000),duration=Number(p.duration??12),price=mode==='existing'?film?.price:Number(p.price??49),scope=p.scope||'latam',poolInfo=model().poolInfo(s,{actorId:'player',scope});
  if(p.id&&p.id!=='ppv')errors.push('Campaña desconocida.');
  if(s.activeWeek)errors.push('Ordena o cancela publicidad entre semanas.');
  if(s.financialHold)errors.push('Completa la conciliación antes de comprometer dinero.');
  if(!['create','existing'].includes(mode))errors.push('Elige crear una película o promocionar una existente.');
  if(s.stats.totalShows<1||!s.releases.some(r=>!r.canonical))errors.push('El PPV necesita un concierto realizado y una grabación propia publicada.');
  if(mode==='existing'&&!film)errors.push('Selecciona una película PPV existente.');
  if(mode==='create'&&p.showId&&!(s.ppvShows||[]).some(show=>show.id===p.showId))errors.push('Selecciona un concierto real registrado.');
  if((legacyRequest||p.deluxeProjectId)&&(!deluxe||deluxe.type!=='deluxe'||deluxe.status!=='ready'))errors.push('Termina el deluxe antes de prometer su distribución.');
  if(deluxe&&list(s).some(c=>c.deluxeProjectId===deluxe.id&&(!c.deluxeReleased||c.deluxeReleaseCostPaid===true)))errors.push('La distribución de ese deluxe ya está reservada o pagada; no se cobra otra vez.');
  if(deluxe&&s.plan.some(item=>item.id==='release'&&item.projectId===deluxe.id))errors.push('Retira el estreno manual antes de reservar su distribución en la campaña.');
  if(!safeMoney(budget))errors.push('El presupuesto debe ser positivo, con céntimos representables de forma segura.');
  if(!model().validDuration(s,duration))errors.push('La duración debe ser un número entero positivo dentro del calendario y precisión admitidos por la partida.');
  if(!safeMoney(price))errors.push('El precio debe ser positivo, con hasta dos decimales y céntimos representables.');
  if(!poolInfo.allowed)errors.push(poolInfo.reason);
  if(p.payer&&p.payer!=='personal')errors.push('Estas películas pertenecen a tu carrera; su publicidad usa la caja personal.');
  // This is a serialization boundary, not a marketing/concurrency progression gate.
  if(history(s).length>=20000||mode==='create'&&films(s).length>=20000)errors.push('El archivo alcanzó el tamaño de almacenamiento compatible; conserva y exporta esta carrera.');
  const spendable=h.spendable(s,'personal'),deluxeCost=deluxe?700:0,weeklyBudget=safeMoney(budget)&&Number.isSafeInteger(duration)&&duration>0?money(budget/duration):0,rate=operationRate(s),weeklyOperations=money(weeklyBudget*rate),weeklyTotal=money(weeklyBudget+weeklyOperations);
  if(deluxeCost>spendable)errors.push('Faltan $700 libres para reservar la distribución del deluxe.');
  return{ok:!errors.length,canOrder:!errors.length,errors,message:errors.join(' '),budget,duration,price,scope,poolInfo,weeklyBudget,operationRate:rate,weeklyOperations,weeklyTotal,spendable,deluxeCost,account:'personal',payers:[{id:'personal',name:'Caja personal',spendable,cash:s.cash}],mode,deluxeProjectId:deluxe?.id||null};
 }
 function act(s,p,h){
  if(p.decision==='cancel'){
   const c=list(s).find(c=>c.campaignId===(p.campaignId||p.id));if(!c?.active)return{ok:false,message:'Selecciona una campaña PPV activa.'};
   ensure(s,h);const stored=history(s).find(x=>x.campaignId===c.campaignId);stored.active=false;stored.status='cancelled';stored.cancelledWeek=s.week;sync(s);
   h.history(s,'Publicidad PPV detenida',stored.name+': no se cobra el presupuesto sin ejecutar. Las ventas y cargos anteriores se conservan.','campaign');
   return{ok:true,message:'Publicidad detenida; no se cobra presupuesto sin gastar. La distribución de un deluxe ya contratado conserva su fecha y no se cobra otra vez.'};
  }
  if(p.decision&&!['start','launch'].includes(p.decision))return{ok:false,message:'Elige iniciar o cancelar una campaña PPV.'};
  const q=quote(s,p,h);if(!q.ok)return{ok:false,message:q.message};
  if(q.deluxeCost&&!h.pay(s,'Distribución deluxe reservada para campaña',q.deluxeCost,'production'))return{ok:false,message:'Faltan fondos libres para la distribución del deluxe.'};
  ensure(s,h);let film=q.mode==='existing'?films(s).find(f=>f.id===p.filmId):null;
  if(!film){const show=(s.ppvShows||[]).find(x=>x.id===p.showId);film={id:h.uid(s,'ppv-film'),name:h.text(p.name,show?'Película · '+show.venue:'Película de concierto anterior'),showId:show?.id||null,showName:show?.venue||'Concierto anterior · detalle no conservado',createdWeek:s.week,price:q.price,sales:0,revenue:0,adSpend:0,legacy:false,marketingModel:'open-budget-v1'};s.ppvFilms.push(film);}
  const c={id:'ppv',campaignId:h.uid(s,'ppv-campaign'),filmId:film.id,name:'Publicidad · '+film.name,active:true,status:'active',budget:q.budget,duration:q.duration,totalWeeks:q.duration,elapsed:0,spent:0,revenue:0,ppvSales:0,partnerShare:0,price:film.price,startedWeek:s.week,startedDay:s.calendar.day,deluxeProjectId:q.deluxeProjectId,deluxeReleased:!q.deluxeProjectId,deluxeReleaseCostPaid:!!q.deluxeProjectId,source:'Compra de medios autorizada; presupuesto progresivo, saturación compartida y costes de operación explícitos.',marketingVersion:1,scope:q.scope,operations:0,gross:0,platformFee:0,reach:0,impressions:0,lastProcessedWeek:null,operationRate:q.operationRate};
  s.ppvCampaigns.push(c);sync(s);h.history(s,'PPV activado','$'+q.budget.toLocaleString('es-CO')+' de medios durante '+q.duration+' semanas. Operación externa de compra y optimización: 1,5–5% según equipo y habilidad. Sin promesa de ventas.','campaign');
  return{ok:true,campaignId:c.campaignId,filmId:film.id,message:'Campaña autorizada. Medios y operación se pagan progresivamente con caja libre; los encargos simultáneos comparten audiencia.'};
 }
 function prepaid(s,projectId){return list(s).some(c=>c.deluxeProjectId===projectId&&c.deluxeReleaseCostPaid===true);}
 function pendingDistributions(s){return list(s).filter(c=>c.deluxeProjectId&&!c.deluxeReleased&&c.deluxeDistributionStatus!=='failed'&&(c.marketingVersion===1||c.active||c.status==='cancelled'));}
 function plan(s,h){
  const rows=active(s).map(c=>{const media=c.elapsed<c.duration?money(Math.max(0,c.budget-c.spent)/Math.max(1,c.duration-c.elapsed)):0,rate=c.marketingVersion===1?operationRate(s):0;return{c,media,rate,operations:money(media*rate),total:money(media+money(media*rate))};});
  const reservedProjects=new Set(rows.filter(x=>x.c.deluxeProjectId&&!x.c.deluxeReleased&&!x.c.deluxeReleaseCostPaid).map(x=>x.c.deluxeProjectId));
  const spendable=Math.max(0,h.spendable(s,'personal')-reservedProjects.size*700),plannedMedia=money(rows.reduce((n,x)=>n+x.media,0)),operations=money(rows.reduce((n,x)=>n+x.operations,0));
  return{rows,media:plannedMedia,plannedMedia,operations,total:money(plannedMedia+operations),spendable,limited:plannedMedia+operations>spendable};
 }
 function distribute(total,weights,scale=100){
  const count=Math.round(total*scale),sum=weights.reduce((n,w)=>n+w,0);if(!count||!sum)return weights.map(()=>0);
  const raw=weights.map(w=>count*w/sum),parts=raw.map(Math.floor),order=raw.map((x,i)=>({i,f:x-parts[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  const remaining=count-parts.reduce((n,x)=>n+x,0);for(let i=0;i<remaining;i++)parts[order[i%order.length].i]++;
  return parts.map(x=>x/scale);
 }
 function filmTracking(s,film){
  if(!film.marketing)film.marketing={version:1,trackedFromDay:s.calendar.day,baselineSales:Number.isFinite(film.sales)?film.sales:null,observedSales:0,buyerStock:Number.isFinite(film.sales)?film.sales:0,lastWeek:s.week,lastOrganicWeek:null,adAttributedSales:0,organicSales:0,organicGross:0,organicRevenue:0,organicPlatformFee:0,organicPartnerShare:0,rng:seed(s,film.id)};
  const m=film.marketing;if(s.week>m.lastWeek){m.buyerStock*=Math.pow(2,-(s.week-m.lastWeek)/104);m.lastWeek=s.week;}return m;
 }
 function tick(s,h,report){
  if(!active(s).length&&!films(s).some(f=>f.marketingModel==='open-budget-v1')&&!pendingDistributions(s).length)return;
  ensure(s,h);if(s.ppvMarketing.lastProcessedWeek===s.week)return;
  const schedule=plan(s,h),spendLimits=distribute(Math.min(schedule.total,schedule.spendable),schedule.rows.map(x=>x.total)),rows=[];
  for(let i=0;i<schedule.rows.length;i++){
   const {c,media:desired,rate}=schedule.rows[i],limit=spendLimits[i];if(c.lastProcessedWeek===s.week)continue;
   let media=Math.min(desired,Math.floor((limit/(1+rate)+1e-9)*100)/100),operations=money(media*rate);if(money(media+operations)>limit){media=money(Math.max(0,media-.01));operations=money(media*rate);}
   const nextCent=money(media+.01);if(nextCent<=desired&&money(nextCent+money(nextCent*rate))<=limit){media=nextCent;operations=money(media*rate);}
   if(media>0&&!h.pay(s,'Publicidad PPV · semana '+(c.elapsed+1)+' · '+c.name,media,'ads')){media=0;operations=0;}
   if(operations>0&&!h.pay(s,'Compra y optimización PPV · '+c.name,operations,'ads'))throw new Error('La reserva de operación PPV no concilia con el gasto autorizado.');
   c.spent=money(c.spent+media);if(c.marketingVersion===1){c.operations=money(c.operations+operations);c.operationRate=rate;}if(media>0)c.lastPaidAdDay=s.calendar.day;
   if(media+.01<desired)report.highlights.push(c.name+': gasto de medios limitado por caja libre, $'+media.toLocaleString('es-CO')+' esta semana.');
   rows.push({c,spend:media,operations,sales:0,gross:0,platformFee:0,partnerShare:0,reach:0,impressions:0});
  }
  const byScope=new Map();for(const row of rows){const key=row.c.scope||'latam',group=byScope.get(key)||[];group.push(row);byScope.set(key,group);}
  // One purchase per scope for the whole brand, then apportion: splitting campaigns never resets the curve.
  for(const [scope,group] of byScope){
   const spend=money(group.reduce((n,x)=>n+x.spend,0));if(!spend)continue;
   const quality=Math.max(.05,Math.min(1,(num(s.player.skills.stage)+num(s.player.reputation))/200)),fit=Math.max(.1,Math.min(1,.25+num(s.player.fame)/150+num(s.player.skills.business)/500));
   const reached=model().purchaseReach(s,{actorId:'player',scope,spend,days:7,cpm:6,quality,fit,competition:num(s.world?.marketPressure?.[s.career.marketId])*.15,commit:true});
   for(const row of group){row.reach=reached.unique*(row.spend/spend);row.impressions=reached.impressions*(row.spend/spend);if(row.c.marketingVersion===1){row.c.reach+=row.reach;row.c.impressions+=row.impressions;}}
  }
  const filmIndex=new Map(films(s).map(f=>[f.id,f])),byFilm=new Map();for(const row of rows){const group=byFilm.get(row.c.filmId)||[];group.push(row);byFilm.set(row.c.filmId,group);}
  for(const film of films(s))if(film.marketingModel==='open-budget-v1'&&!byFilm.has(film.id))byFilm.set(film.id,[]);
  const contentGroups=new Map();for(const [id,group] of byFilm){const film=filmIndex.get(id);if(!film)continue;const key=film.showId||'historical-footage',content=contentGroups.get(key)||[];content.push({film,group});contentGroups.set(key,content);}
  const sourceStocks=new Map(),sourceWeeks=new Map();for(const f of films(s)){const key=f.showId||'historical-footage';if(contentGroups.has(key)){sourceStocks.set(key,(sourceStocks.get(key)||0)+filmTracking(s,f).buyerStock);if(Number.isInteger(f.createdWeek))sourceWeeks.set(key,Math.min(sourceWeeks.get(key)??s.week,f.createdWeek));}}
  const organicTotal={sales:0,gross:0,platformFee:0,partnerShare:0,net:0};
  for(const [sourceKey,content] of contentGroups){
   // Editions of the same concert share known buyers, including editions whose media ended.
   const stock=sourceStocks.get(sourceKey)||0,contentFilms=content.length;
   for(const {film,group} of content){
    const track=filmTracking(s,film),age=Math.max(0,s.week-(sourceWeeks.get(sourceKey)??film.createdWeek??s.week)),tail=Math.pow(1+age/18,-1.35),reach=group.reduce((n,x)=>n+x.reach,0),quality=Math.max(.02,Math.min(1,(num(s.player.skills.stage)+num(s.player.reputation))/200));
    const saturation=1/(1+stock/Math.max(100, s.player.fans*.06+reach*.003)),priceFactor=2/(1+Math.pow(film.price/49,1.45)),creative=Math.max(0,(random(track)-.06)*1.55);
    const organic=(s.player.fans*.0008/Math.max(1,byFilm.size)),conversion=(.00012+quality*.0014)*(1+Math.min(1,s.player.fame/100));
    const interest=tail*saturation*priceFactor*creative,paidExpected=reach*(-Math.expm1(-conversion*interest)),organicExpected=s.player.fans*(-Math.expm1(-organic/Math.max(1,s.player.fans)*interest)),expected=Math.max(0,paidExpected+organicExpected),sales=Math.floor(expected)+(random(track)<expected%1?1:0),channels=film.marketingModel==='open-budget-v1'?distribute(sales,[paidExpected,organicExpected],1):[sales,0],paidSales=channels[0],organicSales=channels[1],unitShares=distribute(paidSales,group.map(x=>x.spend>0?x.spend:1),1);
    track.observedSales+=sales;track.buyerStock+=sales;track.lastOrganicWeek=s.week;
    const paidReceipt={price:film.price,partnerShare:0,revenue:0,ppvSales:0},paidResult=h.settle(s,paidReceipt,film,paidSales),platformParts=distribute(paidResult.platformFee,unitShares),partnerParts=distribute(paidResult.partnerShare,unitShares);
    for(let i=0;i<group.length;i++){
     const row=group[i],c=row.c;row.sales=unitShares[i];row.gross=money(row.sales*film.price);row.platformFee=platformParts[i];row.partnerShare=partnerParts[i];
     c.ppvSales+=row.sales;c.partnerShare=money(num(c.partnerShare)+row.partnerShare);c.revenue=money(c.revenue+row.gross-row.platformFee-row.partnerShare);
     if(c.marketingVersion===1){c.gross=money(c.gross+row.gross);c.platformFee=money(c.platformFee+row.platformFee);}
    }
    track.adAttributedSales+=paidSales;
    if(organicSales>0){
     const receipt={price:film.price,partnerShare:0,revenue:0,ppvSales:0,organic:true},result=h.settle(s,receipt,film,organicSales);
     track.organicSales+=organicSales;track.organicGross=money(track.organicGross+result.gross);track.organicRevenue=money(track.organicRevenue+result.gross-result.platformFee-result.partnerShare);track.organicPlatformFee=money(track.organicPlatformFee+result.platformFee);track.organicPartnerShare=money(track.organicPartnerShare+result.partnerShare);
     organicTotal.sales+=organicSales;for(const key of ['gross','platformFee','partnerShare'])organicTotal[key]=money(organicTotal[key]+result[key]);organicTotal.net=money(organicTotal.gross-organicTotal.platformFee-organicTotal.partnerShare);
    }
    h.fanGain(s,sales*.08);
   }
  }
  for(const row of rows){
   const c=row.c,film=filmIndex.get(c.filmId);if(film){if(Number.isFinite(film.adSpend))film.adSpend=money(film.adSpend+row.spend);if(c.marketingVersion===1)film.operationsCost=money(num(film.operationsCost)+row.operations);}
   if(c.marketingVersion===1){c.lastWeeklyMedia=row.spend;c.lastWeeklyReach=row.reach;}
   c.elapsed++;c.lastProcessedWeek=s.week;
   if(c.elapsed>=c.totalWeeks){c.active=false;c.status='completed';report.highlights.push(c.name+': campaña finalizada; $'+c.spent.toLocaleString('es-CO')+' de medios ejecutados.');}
  }
  // Advertising and the already-paid distribution service are distinct obligations.
  for(const c of pendingDistributions(s))if(Number.isInteger(c.startedWeek)&&s.week>=c.startedWeek+c.duration-1){
   const p=s.projects.find(p=>p.id===c.deluxeProjectId);if(p?.status==='ready')h.release(s,p,report);
   if(p?.status==='released'){c.deluxeReleased=true;c.deluxeDistributionStatus='fulfilled';h.history(s,'Distribución deluxe cumplida',p.name+' ya está publicado. El servicio pagado se conserva aunque se detenga la publicidad; no hay otro cargo.','campaign');}
   else{c.deluxeDistributionStatus='failed';report.highlights.push('Incumplimiento de distribución: el deluxe no estuvo listo en su fecha; no se completa ni publica contenido inventado.');h.history(s,'Distribución deluxe incumplida','El proyecto prometido no estuvo disponible en la fecha pactada; no se inventó ni se publicó una obra.','campaign');}
  }
  s.ppvMarketing.lastProcessedWeek=s.week;sync(s);
  const total={spend:0,operations:0,sales:0,gross:0,platformFee:0,partnerShare:0,reach:0,impressions:0,net:0};
  for(const row of rows)for(const key of Object.keys(total))if(key!=='net')total[key]+=num(row[key]);for(const key of ['spend','operations','gross','platformFee','partnerShare'])total[key]=money(total[key]);total.net=money(total.gross-total.platformFee-total.partnerShare-total.spend-total.operations);
  total.elapsed=s.adsCampaign.elapsed;total.totalWeeks=s.adsCampaign.totalWeeks;if(rows.length)report.campaign=total;report.ppvOrganic=organicTotal;report.campaigns=rows.map(row=>({campaignId:row.c.campaignId,filmId:row.c.filmId,name:row.c.name,...Object.fromEntries(Object.keys(total).filter(k=>!['elapsed','totalWeeks'].includes(k)).map(k=>[k,k==='net'?money(row.gross-row.platformFee-row.partnerShare-row.spend-row.operations):num(row[k])]))}));
 }
 function summary(s,h){
  const records=list(s),rows=records.map(c=>({...clone(c),id:c.campaignId||'legacy-'+c.startedWeek})),totals={budget:0,spent:0,operations:0,sales:0,revenue:0,net:0,known:true};
  for(const c of records){for(const [key,field] of Object.entries({budget:'budget',spent:'spent',operations:'operations',sales:'ppvSales',revenue:'revenue'})){if(Number.isFinite(c[field]))totals[key]=money(totals[key]+c[field]);else if(key!=='operations')totals.known=false;}}totals.net=money(totals.revenue-totals.spent-totals.operations);
  totals.organicSales=films(s).reduce((n,f)=>n+num(f.marketing?.organicSales),0);totals.organicRevenue=money(films(s).reduce((n,f)=>n+num(f.marketing?.organicRevenue),0));totals.combinedNet=money(totals.net+totals.organicRevenue);
  const sourceWeeks=new Map();for(const f of films(s))if(Number.isInteger(f.createdWeek)){const key=f.showId||'historical-footage';sourceWeeks.set(key,Math.min(sourceWeeks.get(key)??s.week,f.createdWeek));}
  const filmRows=films(s).map(f=>({...clone(f),sourceReleaseWeek:sourceWeeks.get(f.showId||'historical-footage')??null,sourceAgeWeeks:Number.isInteger(sourceWeeks.get(f.showId||'historical-footage'))?Math.max(0,s.week-sourceWeeks.get(f.showId||'historical-footage')):null}));
  const p=plan(s,h);return{films:filmRows,campaigns:rows,activeCampaigns:rows.filter(c=>c.active&&c.status==='active'),totals,weeklyPlan:{media:p.media,plannedMedia:p.plannedMedia,operations:p.operations,total:p.total,spendable:p.spendable,limited:p.limited},operationRate:operationRate(s),note:'Presupuesto progresivo de medios, más operación externa de compra y optimización (1,5–5% para nuevos encargos). La audiencia comparte saturación con la marca. Los compradores de la misma película se contabilizan una vez por semana; relanzar no rejuvenece la película. Las películas nuevas conservan una cola orgánica decreciente después de los anuncios, registrada aparte de las ventas atribuidas. Alcance y demanda son simulados y no garantizan beneficio. Las campañas antiguas no reciben cargos de operación retroactivos.'};
 }
 function musicPromotion(s){
  const recent=list(s).filter(c=>Number.isInteger(c.lastPaidAdDay)&&s.calendar.day-c.lastPaidAdDay<7);
  if(recent.some(c=>c.marketingVersion!==1))return .2;
  const reach=recent.reduce((n,c)=>n+num(c.lastWeeklyReach),0);return .2*(-Math.expm1(-reach/Math.max(500,num(s.player.fans)*.5)));
 }
 function validate(s){
  const errors=[];if(s.ppvMarketing===undefined)return errors;
  const m=s.ppvMarketing;if(!m||m.version!==1||!Number.isInteger(m.trackedFromDay)||m.trackedFromDay<0||m.trackedFromDay>s.calendar.day||m.lastProcessedWeek!==null&&(!Number.isInteger(m.lastProcessedWeek)||m.lastProcessedWeek<1||m.lastProcessedWeek>s.week))return['Seguimiento de publicidad PPV inválido.'];
  const ids=new Set();for(const c of history(s)){
   if(!c||typeof c.campaignId!=='string'||ids.has(c.campaignId)){errors.push('Campaña PPV duplicada o inválida.');continue;}ids.add(c.campaignId);
   if(c.marketingVersion!==1)continue;
   if(!films(s).some(f=>f?.id===c.filmId&&f.price===c.price)||!['active','completed','cancelled'].includes(c.status)||c.active!==(c.status==='active')||!safeMoney(c.budget)||!safeMoney(c.price)||!Number.isSafeInteger(c.duration)||c.duration<1||c.totalWeeks!==c.duration||!Number.isInteger(c.elapsed)||c.elapsed<0||c.elapsed>c.totalWeeks||c.status==='completed'&&c.elapsed!==c.totalWeeks||!Number.isInteger(c.startedWeek)||c.startedWeek<1||c.startedWeek>s.week||!Number.isInteger(c.startedDay)||c.startedDay!==(c.startedWeek-1)*7||c.startedDay>s.calendar.day||!['country','latam','usa'].includes(c.scope)||c.scope==='usa'&&!s.progression.usaUnlocked||['spent','operations','gross','platformFee','reach','impressions','revenue','ppvSales','partnerShare'].some(k=>!Number.isFinite(c[k])||c[k]<0)||!Number.isSafeInteger(c.ppvSales)||c.spent>c.budget+.01||c.operationRate<.015||c.operationRate>.05||Math.abs(c.gross-c.platformFee-c.partnerShare-c.revenue)>.03||c.lastProcessedWeek!==null&&(!Number.isInteger(c.lastProcessedWeek)||c.lastProcessedWeek<c.startedWeek||c.lastProcessedWeek>s.week))errors.push('Presupuesto, alcance o reparto PPV inválido.');
  }
  for(const film of films(s))if(film?.marketing){const t=film.marketing;if(t.version!==1||!Number.isInteger(t.trackedFromDay)||t.trackedFromDay<0||t.trackedFromDay>s.calendar.day||t.baselineSales!==null&&(!Number.isSafeInteger(t.baselineSales)||t.baselineSales<0)||!Number.isSafeInteger(t.observedSales)||t.observedSales<0||!Number.isFinite(t.buyerStock)||t.buyerStock<0||!Number.isInteger(t.lastWeek)||t.lastWeek<1||t.lastWeek>s.week||!Number.isInteger(t.rng)||t.rng<0||t.rng>4294967295||['adAttributedSales','organicSales','organicGross','organicRevenue','organicPlatformFee','organicPartnerShare'].some(k=>!Number.isFinite(t[k])||t[k]<0)||!Number.isSafeInteger(t.adAttributedSales)||!Number.isSafeInteger(t.organicSales)||t.observedSales!==t.adAttributedSales+t.organicSales||t.baselineSales!==null&&film.sales!==t.baselineSales+t.observedSales||Math.abs(t.organicGross-t.organicPlatformFee-t.organicPartnerShare-t.organicRevenue)>.03)errors.push('Audiencia de película PPV inválida.');}
  return errors;
 }
 const api={operationRate,list,active,quote,act,prepaid,plan,tick,summary,musicPromotion,validate};root.RapPpvMarketing=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
