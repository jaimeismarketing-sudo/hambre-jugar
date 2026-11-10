/* Commissioned album campaigns. Integer-day clock; customer funds never enter free cash. */
(function(root){
 'use strict';
 const tiers=[
  {id:'local',name:'Sesión local',cost:1200,energy:22,shootDays:1,editDays:7},
  {id:'studio',name:'Producción de estudio',cost:12000,energy:22,shootDays:1,editDays:14},
  {id:'cinematic',name:'Cortometraje musical',cost:90000,energy:22,shootDays:2,editDays:21},
  {id:'flagship',name:'Gran producción',cost:600000,energy:22,shootDays:3,editDays:28}
 ];
 const round=n=>Math.round((n+Number.EPSILON)*100)/100,clone=v=>JSON.parse(JSON.stringify(v)),num=n=>Number.isFinite(n)?n:0;
 // Transient indexes are rebuilt once per tick, never serialized or reused across days.
 const tickIndexes=new WeakMap();
 const campaigns=s=>Array.isArray(s?.albumCampaigns)?s.albumCampaigns:[],videos=s=>Array.isArray(s?.musicVideos)?s.musicVideos:[];
 const license=(s,id)=>s.label?.contracts?.find(c=>c.artistId===id&&c.status==='active'&&s.week<c.endsWeek);
 const represented=(s,a)=>a?.contract?.status==='active'&&s.week<a.contract.endsWeek;
 function authorized(s,a,target){
  if(!a||!target)return false;
  if(a.id==='player')return a.allowed;
  const c=license(s,a.id);
  return represented(s,a.entity)||!!c&&target.labelTerms?.contractId===c.id;
 }
 const sole=s=>s.label?.owners?.length===1&&Math.abs(s.label.owners[0].share-1)<.00001;
 function actor(s,id='player'){
  if(id==='player')return{id,name:s.player.name,entity:s.player,projects:s.projects||[],releases:s.releases||[],account:'personal',allowed:s.management?.role!=='manager'};
  const a=s.management?.artists?.find(a=>a.id===id);return a?{id,name:a.name,entity:a,projects:a.projects||[],releases:a.releases||[],account:'client',allowed:represented(s,a)||!!license(s,id)}:null;
 }
 function payers(s,a,h,project){
  const result=[{id:a.account,name:a.id==='player'?'Caja personal':'Caja del artista · '+a.name,cash:a.id==='player'?s.cash:a.entity.cash,spendable:a.id==='player'?h.spendable(s,'personal'):h.clientSpendable(s,a.id)}];
  const c=license(s,a.id);if(c&&sole(s)&&(!project||project.labelTerms?.contractId===c.id))result.push({id:'label',name:'Caja del sello · '+s.label.name,cash:s.label.cash,spendable:h.spendable(s,'label')});
  return result;
 }
 function select(s,p,h,kind){
  const errors=[],a=actor(s,p.artistId||'player'),project=a?.projects.find(x=>x.id===p.projectId),release=a?.releases.find(x=>x.id===p.releaseId),target=project||release;
  if(kind==='video'&&!!p.projectId===!!p.releaseId)errors.push('Elige exactamente un proyecto o un lanzamiento para el videoclip.');
  if(p.projectId&&!project||p.releaseId&&!release)errors.push('La obra indicada no pertenece al artista seleccionado.');
  if(kind==='campaign'&&p.releaseId)errors.push('La preventa solo admite un proyecto sin publicar.');
  if(!a?.allowed)errors.push('Elige tu carrera de artista o un artista con representación o licencia vigente.');
  if(!target||target.type!=='album')errors.push('Selecciona un álbum propio de este artista.');
  const options=a?payers(s,a,h,target):[],account=p.payer||a?.account,accountInfo=options.find(x=>x.id===account);
  if(!accountInfo)errors.push('La cuenta pagadora no está autorizada para esta obra.');
  if(s.activeWeek&&s.agenda?.mode!=='hourly')errors.push('Ordena la campaña o el videoclip entre semanas.');
  if(s.financialHold)errors.push('Completa la conciliación antes de contratar.');
  if(a?.id!=='player'&&a&&target&&!authorized(s,a,target))errors.push('Sin representación vigente, la licencia debe incluir este proyecto; firmar no transfiere el catálogo anterior.');
  return{a,project,release,target,account,accountInfo,options,errors};
 }
 function campaignQuote(s,p={},h){
  // Inclusive calendar days: one week ordered on Monday closes on Sunday (tick 7).
  const q=select(s,p,h,'campaign'),weeks=Number(p.weeks),releaseDay=s.calendar.day+weeks*7-1;
  if(!Number.isInteger(weeks)||weeks<1||weeks>8)q.errors.push('La preventa dura de 1 a 8 semanas; nunca más de 56 días.');
  if(!q.project||!['working','ready'].includes(q.project.status))q.errors.push('El álbum debe estar en preparación o terminado, sin publicar.');
  if(campaigns(s).some(c=>c.artistId===q.a?.id&&c.projectId===p.projectId))q.errors.push('Este álbum ya tiene un encargo de distribución; no se cobra ni se abre otra preventa.');
  if(campaigns(s).length>=20000)q.errors.push('El archivo conserva su máximo de 20.000 campañas; las obras anteriores siguen generando regalías.');
  if(q.a&&s.plan.some(x=>x.projectId===p.projectId&&['release','management_release'].includes(x.id)))q.errors.push('Retira el estreno manual de la agenda antes de encargar la distribución automática.');
  const c=q.a&&license(s,q.a.id),authorityEnds=Math.max(represented(s,q.a?.entity)?q.a.entity.contract.endsWeek:0,c&&q.project?.labelTerms?.contractId===c.id?c.endsWeek:0);
  if(q.a?.id!=='player'&&q.a&&Number.isInteger(weeks)&&Math.floor(releaseDay/7)+1>=authorityEnds)q.errors.push('La representación o licencia autorizada termina antes del estreno; elige un plazo más corto.');
  const fee=q.a?.id==='player'?700:h.releaseCost(q.a?.entity),spendable=q.accountInfo?.spendable||0;
  if(spendable<fee)q.errors.push('La cuenta elegida no tiene fondos libres para el servicio de distribución.');
  return{ok:!q.errors.length,canOrder:!q.errors.length,errors:q.errors,message:q.errors.join(' '),fee,cost:fee,price:7.99,weeks,windowDays:weeks*7,releaseDay:Number.isInteger(releaseDay)?releaseDay:null,date:Number.isInteger(releaseDay)?h.date(s,releaseDay):null,account:q.account,payer:q.account,accountLabel:q.accountInfo?.name||'',spendable,payers:q.options};
 }
 function videoQuote(s,p={},h){
  const q=select(s,p,h,'video'),tier=tiers.find(t=>t.id===(p.tierId||p.tier||'local'));
  if(!tier)q.errors.push('Elige un presupuesto de videoclip disponible.');
  if(q.project?.status==='released')q.errors.push('Para una obra publicada, selecciona su lanzamiento en el catálogo.');
  if(videos(s).length>=20000)q.errors.push('El archivo conserva su máximo de 20.000 videoclips.');
  const spendable=q.accountInfo?.spendable||0;if(tier&&spendable<tier.cost)q.errors.push('La cuenta elegida no cubre el presupuesto del videoclip.');
  return{ok:!q.errors.length,canOrder:!q.errors.length,errors:q.errors,message:q.errors.join(' '),...(tier?clone(tier):{}),tierId:tier?.id||null,account:q.account,payer:q.account,accountLabel:q.accountInfo?.name||'',spendable,payers:q.options,coordinationCost:q.a?.id==='player'?0:30};
 }
 function random(o){let x=o.rng;x^=x<<13;x^=x>>>17;x^=x<<5;o.rng=x>>>0;return o.rng/4294967296;}
 function seed(s,id){let x=(s.rng^0x735a2d91)>>>0;for(const c of id)x=Math.imul(x^c.charCodeAt(0),16777619)>>>0;return x||1;}
 function announce(s,h,title,message,report){h.history(s,title,message,'music');if(report)report.highlights.push(message);}
 function refund(s,c,h,report,reason){
  if(c.status!=='preorder')return;
  c.refunded=round(c.refunded+c.escrow);c.escrow=0;c.status='cancelled';c.closedDay=s.calendar.day;c.reason=reason;
  const a=actor(s,c.artistId);if(a)a.entity.reputation=round(Math.max(0,a.entity.reputation-.5));
  announce(s,h,'Preventa cancelada',c.projectName+': '+reason+' Se devolvieron $'+c.refunded+' a sus compradores desde la cuenta de custodia; el servicio no es reembolsable.',report);
 }
 function onRelease(s,aId,p,r,h,report){
  tickIndexes.delete(s);
  for(const c of campaigns(s))if(c.status==='preorder'&&c.artistId===aId&&c.projectId===p.id){
   c.status='released';c.releaseId=r.id;c.closedDay=s.calendar.day;c.deliveredUnits=c.orders;c.deliveredGross=c.escrow;c.escrow=0;c.recognizedDay=null;
   announce(s,h,'Pedidos entregados',c.projectName+': '+c.orders+' pedidos entregados una sola vez. El distribuidor descuenta comisión y aplica los repartos; la liquidación llegará por el circuito normal.',report);
  }
  for(const v of videos(s))if(v.artistId===aId&&v.projectId===p.id&&!v.releaseId)v.releaseId=r.id;
 }
 function deliveryUnits(s,r,aId='player'){
  const index=tickIndexes.get(s),key=aId+'/'+r.id,list=index?.day===s.calendar.day?index.deliveries.get(key)||[]:campaigns(s).filter(c=>c.status==='released'&&c.artistId===aId&&c.releaseId===r.id&&c.recognizedDay===null);
  let units=0;for(const c of list)if(c.recognizedDay===null){units+=c.deliveredUnits;c.recognizedDay=s.calendar.day;}return units;
 }
 function prepaid(s,projectId,aId='player'){return campaigns(s).some(c=>c.artistId===aId&&c.projectId===projectId&&c.status==='preorder');}
 function tick(s,h,report){
  for(const c of campaigns(s)){
   if(c.status!=='preorder'||c.lastProcessedDay===s.calendar.day)continue;
   const a=actor(s,c.artistId),p=a?.projects.find(p=>p.id===c.projectId),existing=a?.releases.find(r=>r.projectId===c.projectId);
   if(existing){onRelease(s,c.artistId,p||{id:c.projectId},existing,h,report);continue;}
   c.lastProcessedDay=s.calendar.day;
   // A role change does not revoke distribution already commissioned for one's own work.
   if(!a||!p||a.id!=='player'&&!authorized(s,a,p)){refund(s,c,h,report,'La autorización o el proyecto ya no están disponibles.');continue;}
   if(s.calendar.day>=c.releaseDay){
    if(p.status!=='ready'){refund(s,c,h,report,'El álbum no estuvo terminado en la fecha comprometida; no se amplía el plazo de 56 días.');continue;}
    const result=h.release(s,a,p,report);if(!result)refund(s,c,h,report,'No pudo entregarse el álbum en su fecha.');
    continue;
   }
   // Orders have a finite audience: a long preorder shifts purchases earlier rather than creating a free fan base.
   const fanCap=Math.floor(a.entity.fans*.018),quality=Math.max(.05,num(p.quality)/100),age=s.calendar.day-c.startDay;
   const promotion=1+Math.min(.5,videos(s).filter(v=>v.artistId===c.artistId&&v.projectId===c.projectId&&v.status==='published').reduce((n,v)=>n+Math.sqrt(v.views)/2000,0));
   const expected=Math.max(0,a.entity.fans*.0007*quality*promotion*Math.pow(1+age/14,-.8))*(.6+random(c)*.8);
   const demand=Math.floor(expected)+(random(c)<expected%1?1:0),orders=Math.max(0,Math.min(demand,fanCap-c.orders));
   c.orders+=orders;c.escrow=round(c.escrow+orders*c.price);
  }
  for(const v of videos(s)){
   const a=actor(s,v.artistId);
   if(v.status==='editing'&&s.calendar.day>=v.publishDay){v.status='published';announce(s,h,'Videoclip publicado',v.name+': edición entregada. Sus vistas son vídeo, no discos vendidos ni reproducciones musicales.',report);}
   if(v.status!=='published'||v.lastProcessedDay===s.calendar.day||!a)continue;
   v.lastProcessedDay=s.calendar.day;const target=a.releases.find(r=>r.id===v.releaseId)||a.projects.find(p=>p.id===v.projectId),quality=Math.max(0,(num(target?.quality)-25)/75),age=s.calendar.day-v.publishDay;
   const base=(a.entity.fans*.022+Math.sqrt(v.budget)*18)*quality;
   const views=Math.max(0,Math.floor(base*Math.pow(1+age/12,-1.4)*(.3+random(v)*1.2)));v.views+=views;v.dailyViews=views;
  }
  const index={day:s.calendar.day,exposures:new Map(),deliveries:new Map()};
  for(const v of videos(s))if(v.status==='published'&&v.releaseId&&v.lastProcessedDay===s.calendar.day){const key=v.artistId+'/'+v.releaseId;index.exposures.set(key,(index.exposures.get(key)||0)+v.dailyViews*.025);}
  for(const c of campaigns(s))if(c.status==='released'&&c.recognizedDay===null){const key=c.artistId+'/'+c.releaseId,list=index.deliveries.get(key)||[];list.push(c);index.deliveries.set(key,list);}
  tickIndexes.set(s,index);
 }
 function exposure(s,r,aId='player'){const index=tickIndexes.get(s),views=index?.day===s.calendar.day?index.exposures.get(aId+'/'+r.id)||0:videos(s).filter(v=>v.status==='published'&&v.artistId===aId&&v.releaseId===r.id&&v.lastProcessedDay===s.calendar.day).reduce((n,v)=>n+v.dailyViews*.025,0);return views*Math.max(0,(r.quality-30)/70);}
 function act(s,type,p,h){
  if(type==='albumCampaign'){
   if(p.decision==='cancel'){const c=campaigns(s).find(c=>c.id===p.campaignId);if(!c||c.status!=='preorder')return{ok:false,message:'No hay una preventa abierta que cancelar.'};refund(s,c,h,null,'Cancelación autorizada por el jugador.');return{ok:true,message:'Preventa cancelada. Los compradores recuperan su dinero; no se devuelve el servicio.'};}
   if(p.decision!=='launch')return{ok:false,message:'Elige encargar o cancelar la campaña.'};
   const quote=campaignQuote(s,p,h);if(!quote.ok)return{ok:false,message:quote.message};const a=actor(s,p.artistId||'player'),project=a.projects.find(x=>x.id===p.projectId);
   if(!h.spend(s,a,quote.account,quote.cost,'Distribución programada · '+project.name,'production'))return{ok:false,message:'No hay fondos libres suficientes.'};
   if(!s.albumCampaigns)s.albumCampaigns=[];const id=h.uid(s,'album-campaign');
   const c={id,artistId:a.id,artistName:a.name,projectId:project.id,projectName:project.name,status:'preorder',startDay:s.calendar.day,releaseDay:quote.releaseDay,weeks:quote.weeks,price:quote.price,releaseFee:quote.cost,payer:quote.account,orders:0,escrow:0,deliveredUnits:0,deliveredGross:0,refunded:0,releaseId:null,closedDay:null,recognizedDay:null,lastProcessedDay:null,rng:seed(s,id)};s.albumCampaigns.push(c);
   announce(s,h,'Preventa abierta',project.name+': estreno autorizado para '+quote.date+'. Pedidos en custodia, plazo '+quote.weeks+' semanas. Si no terminas el álbum, se cancela y reembolsa sin prórroga.');
   return{ok:true,campaignId:id,message:'Preventa abierta y distribución encargada una sola vez. Termina el álbum antes de '+quote.date+'.'};
  }
  if(type!=='musicVideo')return{ok:false,message:'Encargo desconocido.'};
  const v=videos(s).find(v=>v.id===p.videoId);
  if(p.decision==='plan'){
   if(!v||v.status!=='ordered')return{ok:false,message:'Elige un videoclip pendiente de rodaje.'};
   const targetActor=actor(s,v.artistId),target=targetActor?.projects.find(p=>p.id===v.projectId)||targetActor?.releases.find(r=>r.id===v.releaseId);
   if(!authorized(s,targetActor,target))return{ok:false,message:'Ya no tienes autorización para dirigir esta obra de este artista.'};
   if(s.agenda?.mode!=='hourly'&&s.plan.length>=3)return{ok:false,message:'La agenda ya tiene tres actividades.'};
   const booked=s.plan.filter(x=>x.id==='album_video_shoot'&&x.videoId===v.id).length;
   if(booked>=v.shootDays-v.shootsCompleted)return{ok:false,message:'Todos los rodajes necesarios ya están en la agenda.'};
   s.plan.push({id:'album_video_shoot',videoId:v.id,artistId:v.artistId,label:'Rodaje · '+v.name,cost:v.artistId==='player'?0:30,energy:22,...(v.projectId?{projectId:v.projectId}:{})});
   return{ok:true,message:'Rodaje añadido: ocupa un turno y consume 22 de energía al completarlo.'};
  }
  if(p.decision==='cancel'){
   if(!v||v.status!=='ordered')return{ok:false,message:'Solo puedes cancelar un videoclip pendiente de rodaje.'};
   if(s.plan.some(x=>x.videoId===v.id))return{ok:false,message:'Retira sus rodajes de la agenda antes de cancelar.'};
   v.status='cancelled';v.closedDay=s.calendar.day;return{ok:true,message:'Producción cancelada; el presupuesto contratado no se reembolsa.'};
  }
  if(p.decision!=='commission')return{ok:false,message:'Elige encargar o programar un videoclip.'};
  const q=videoQuote(s,p,h);if(!q.ok)return{ok:false,message:q.message};const a=actor(s,p.artistId||'player'),target=a.projects.find(x=>x.id===p.projectId)||a.releases.find(x=>x.id===p.releaseId);
  if(!h.spend(s,a,q.account,q.cost,'Videoclip promocional · '+target.name,'ads'))return{ok:false,message:'No hay fondos libres suficientes.'};
  if(!s.musicVideos)s.musicVideos=[];const id=h.uid(s,'music-video'),projectTarget=a.projects.find(x=>x.id===target.id);s.musicVideos.push({id,artistId:a.id,artistName:a.name,projectId:projectTarget?target.id:target.projectId||null,releaseId:projectTarget?null:target.id,name:target.name+' · videoclip '+(videos(s).filter(v=>v.artistId===a.id&&(v.projectId===target.id||v.releaseId===target.id)).length+1),tier:q.tierId,budget:q.cost,payer:q.account,status:'ordered',orderedDay:s.calendar.day,shootDays:q.shootDays,shootsCompleted:0,shootHistory:[],editDays:q.editDays,publishDay:null,views:0,dailyViews:0,lastProcessedDay:null,rng:seed(s,id)});
  return{ok:true,videoId:id,message:'Videoclip encargado. Programa '+q.shootDays+' turno(s) de rodaje; después se editará y publicará automáticamente.'};
 }
 function shootStatus(s,item,h){
  const v=videos(s).find(v=>v.id===item?.videoId),a=v&&actor(s,v.artistId),target=a?.projects.find(p=>p.id===v.projectId)||a?.releases.find(r=>r.id===v.releaseId);
  const energy=round(22*(item.dailyPreparationEnergyMultiplier??root.RapEnterprise?.preparationEffects(s,item)?.energyMultiplier??1));
  let message=!v||v.status!=='ordered'||!authorized(s,a,target)?'Producción o autorización no disponibles.':s.player.energy<energy||s.player.health<12?'Rodaje omitido por agotamiento.':a.id!=='player'&&h.spendable(s,'personal')<30?'Faltan $30 personales de coordinación.':null;
  return{ok:!message,message:message||'Rodaje disponible.',energy,cost:v?.artistId==='player'?0:30};
 }
 function shoot(s,item,h,report){
  const v=videos(s).find(v=>v.id===item.videoId),a=v&&actor(s,v.artistId);
  const target=a?.projects.find(p=>p.id===v.projectId)||a?.releases.find(r=>r.id===v.releaseId);
  if(!v||v.status!=='ordered'||!authorized(s,a,target)){report.highlights.push('Rodaje omitido: producción o autorización no disponibles.');return;}
  const energy=round(22*(item.dailyPreparationEnergyMultiplier??root.RapEnterprise?.preparationEffects(s,item)?.energyMultiplier??1));
  if(s.player.energy<energy||s.player.health<12){report.highlights.push('Rodaje omitido por agotamiento; no se consume energía ni se avanza producción.');return;}
  if(a.id!=='player'&&!h.spend(s,actor(s,'player'),'personal',30,'Coordinación de rodaje · '+a.name,'management')){report.highlights.push('Rodaje omitido: faltan $30 personales de coordinación.');return;}
  s.player.energy=Math.max(0,s.player.energy-energy);s.player.health=round(Math.max(0,s.player.health-.77));v.shootsCompleted++;v.shootHistory.push(s.calendar.day);report.actions.push(item.label);
  if(a.id!=='player')h.track(s,a.entity,{coordinationExpenses:30});
  if(v.shootsCompleted>=v.shootDays){v.status='editing';v.publishDay=s.calendar.day+v.editDays;report.highlights.push(v.name+': rodaje completo; edición hasta '+h.date(s,v.publishDay)+'.');}
 }
 function summary(s,h){
  const targets=[actor(s,'player'),...(s.management?.artists||[]).map(a=>actor(s,a.id))].filter(a=>a?.allowed).map(a=>{const options=payers(s,a,h);return{id:a.id,name:a.name,artistId:a.id,artistName:a.name,account:a.account,accountLabel:options[0].name,spendable:options[0].spendable,payers:options,projects:a.projects.filter(p=>p.type==='album'&&['working','ready'].includes(p.status)).map(p=>({...clone(p),required:p.required??p.needed})),releases:a.releases.filter(r=>r.type==='album').map(r=>({id:r.id,name:r.name,type:r.type,quality:r.quality}))};});
  const totals={orders:0,escrow:0,deliveredUnits:0,deliveredGross:0,refunded:0,videoViews:0};for(const c of campaigns(s))for(const key of ['orders','escrow','deliveredUnits','deliveredGross','refunded'])totals[key]=round(totals[key]+c[key]);for(const v of videos(s))totals.videoViews+=v.views;
  const clipRows=videos(s).map(v=>({...clone(v),queuedShots:(s.activeWeek?.lockedPlan||s.plan||[]).filter((item,i)=>item.id==='album_video_shoot'&&item.videoId===v.id&&!s.activeWeek?.executedActions.includes(i)).length}));
  return{targets,campaigns:clone(campaigns(s)),videos:clipRows,tiers:clone(tiers),totals,escrowTotal:totals.escrow,note:'La custodia es dinero de compradores y una obligación de entrega: no es caja libre ni patrimonio. Una unidad se reconoce al entregar; views y streams se muestran separados.'};
 }
 function validate(s){
  const errors=[],bad=m=>errors.push(m),ids=new Set();
  for(const key of ['albumCampaigns','musicVideos'])if(s[key]!==undefined&&(!Array.isArray(s[key])||s[key].length>20000))bad('Archivo de campañas de álbum inválido.');
  for(const c of campaigns(s)){
   if(!c||typeof c.id!=='string'||ids.has(c.id)){bad('Campaña de álbum duplicada o inválida.');continue;}ids.add(c.id);const a=actor(s,c.artistId),p=a?.projects.find(p=>p.id===c.projectId),r=a?.releases.find(r=>r.id===c.releaseId);
   if(!a||!p&&!a.releases.some(r=>r.projectId===c.projectId)&&c.status!=='cancelled'||!['preorder','released','cancelled'].includes(c.status)||!['personal','label','client'].includes(c.payer)||!Number.isInteger(c.startDay)||c.startDay<0||c.startDay>s.calendar.day||!Number.isInteger(c.weeks)||c.weeks<1||c.weeks>8||c.releaseDay!==c.startDay+c.weeks*7-1||c.price!==7.99||!Number.isInteger(c.orders)||c.orders<0||!Number.isInteger(c.deliveredUnits)||['escrow','releaseFee','deliveredUnits','deliveredGross','refunded'].some(k=>!Number.isFinite(c[k])||c[k]<0)||Math.abs(c.orders*c.price-c.escrow-c.deliveredGross-c.refunded)>.02||c.status==='preorder'&&(c.deliveredUnits!==0||c.deliveredGross!==0||c.refunded!==0||c.closedDay!==null)||c.status==='released'&&(!r||c.deliveredUnits!==c.orders||c.escrow!==0||c.refunded!==0||c.closedDay>c.releaseDay)||c.status==='cancelled'&&(c.escrow!==0||c.deliveredUnits!==0||c.deliveredGross!==0)||!Number.isInteger(c.rng)||c.rng<0||c.rng>4294967295||c.recognizedDay!==null&&(!Number.isInteger(c.recognizedDay)||c.recognizedDay<c.startDay||c.recognizedDay>s.calendar.day))bad('Fechas, fondos de custodia o entrega del álbum inválidos.');
   if(typeof c.artistId!=='string'||typeof c.projectId!=='string'||typeof c.projectName!=='string'||typeof c.artistName!=='string'||p&&p.type!=='album'||r&&r.type!=='album'||c.artistId==='player'&&c.payer==='client'||c.artistId!=='player'&&c.payer==='personal'||c.releaseFee<=0||c.artistId==='player'&&c.releaseFee!==700||!Number.isSafeInteger(c.orders)||c.status==='preorder'&&s.calendar.day>c.releaseDay||c.lastProcessedDay!==null&&(!Number.isInteger(c.lastProcessedDay)||c.lastProcessedDay<c.startDay||c.lastProcessedDay>s.calendar.day)||c.status!=='preorder'&&(!Number.isInteger(c.closedDay)||c.closedDay<c.startDay||c.closedDay>s.calendar.day)||c.status==='released'&&c.recognizedDay!==c.closedDay||c.status!=='released'&&c.recognizedDay!==null)bad('Identidad, pagador o cierre de la campaña inválidos.');
  }
  const projectKeys=campaigns(s).map(c=>c?.artistId+'/'+c?.projectId);if(new Set(projectKeys).size!==projectKeys.length)bad('Preventa duplicada.');
  for(const v of videos(s)){
   if(!v||typeof v.id!=='string'||ids.has(v.id)){bad('Videoclip duplicado o inválido.');continue;}ids.add(v.id);const a=actor(s,v.artistId),t=tiers.find(t=>t.id===v.tier);
   const target=a?.releases.find(r=>r.id===v.releaseId)||a?.projects.find(p=>p.id===v.projectId)||a?.releases.find(r=>r.projectId===v.projectId);
   if(!a||!t||!target&&v.status!=='cancelled'||target?.type!=='album'&&v.status!=='cancelled'||v.releaseId&&!a.releases.some(r=>r.id===v.releaseId&&(!v.projectId||r.projectId===v.projectId))||!['personal','label','client'].includes(v.payer)||!['ordered','editing','published','cancelled'].includes(v.status)||v.budget!==t.cost||v.shootDays!==t.shootDays||v.editDays!==t.editDays||!Number.isInteger(v.shootsCompleted)||v.shootsCompleted<0||v.shootsCompleted>v.shootDays||!Array.isArray(v.shootHistory)||v.shootHistory.length!==v.shootsCompleted||v.shootHistory.some((d,i)=>!Number.isInteger(d)||d<v.orderedDay||d>s.calendar.day||i>0&&d<=v.shootHistory[i-1])||!Number.isInteger(v.views)||v.views<0||!Number.isInteger(v.dailyViews)||v.dailyViews<0||!Number.isInteger(v.orderedDay)||v.orderedDay<0||v.orderedDay>s.calendar.day||['editing','published'].includes(v.status)&&(v.shootsCompleted!==v.shootDays||v.publishDay!==v.shootHistory.at(-1)+v.editDays)||!Number.isInteger(v.rng)||v.rng<0||v.rng>4294967295)bad('Producción o métricas del videoclip inválidas.');
   if(typeof v.artistId!=='string'||typeof v.artistName!=='string'||typeof v.name!=='string'||!v.projectId&&!v.releaseId||v.artistId==='player'&&v.payer==='client'||v.artistId!=='player'&&v.payer==='personal'||v.status==='ordered'&&(v.shootsCompleted>=v.shootDays||v.publishDay!==null||v.views!==0)||v.status==='editing'&&v.views!==0||v.status==='published'&&v.publishDay>=s.calendar.day||v.lastProcessedDay!==null&&(!Number.isInteger(v.lastProcessedDay)||v.lastProcessedDay<v.orderedDay||v.lastProcessedDay>s.calendar.day)||!Number.isSafeInteger(v.views)||v.dailyViews>v.views)bad('Identidad, publicación o pagador del videoclip inválidos.');
  }
  for(const plan of [s.plan,s.activeWeek?.lockedPlan])for(const item of plan||[])if(item?.id==='album_video_shoot'){const v=videos(s).find(v=>v.id===item.videoId);if(!v||item.artistId!==v.artistId||item.energy!==22||item.cost!==(v.artistId==='player'?0:30)||item.projectId!==undefined&&item.projectId!==v.projectId)bad('Turno de rodaje inválido.');}
  return errors;
 }
 const api={tiers,campaignQuote,videoQuote,summary,act,tick,onRelease,deliveryUnits,prepaid,exposure,shoot,shootStatus,validate};root.RapAlbumCampaign=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
