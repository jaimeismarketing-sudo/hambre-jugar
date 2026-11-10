/* Hourly agenda. Calendar minutes are simulation time, never wall-clock time. */
(function(root){
 'use strict';
 const DAY=1440,WEEK=10080,MAX=7e6*DAY,clone=x=>JSON.parse(JSON.stringify(x)),round=x=>Math.round(x*100)/100;
 const variable=new Set(['home_record','write','record','produce','rehearse','social','network','street','business','rest']);
 const durations={dayjob:480,employment_shift:480,album_video_shoot:480,video:240,home_record:240,write:240,record:240,produce:240,release:120,rehearse:240,social:240,network:240,collab:240,street:240,interview:120,business:240,fanclub:180,band_audition:120,band_rehearsal:240,management_record:240,management_promote:240,management_release:120,management_show:360,show:360,rest:480};
 const pending=a=>a.status==='scheduled'||a.status==='running';
 const active=s=>s?.version===4&&s.agenda?.mode==='hourly';
 const now=s=>s.agenda?.minute??((s.calendar?.day||0)*DAY);
 const rule=id=>({baseMinutes:durations[id]||240,minMinutes:variable.has(id)?120:durations[id]||240,maxMinutes:variable.has(id)?480:durations[id]||240,stepMinutes:variable.has(id)?120:durations[id]||240,variable:variable.has(id)});
 function actors(s){return[{id:'player',name:s.player.name,energy:s.player.energy},...(s.management?.artists||[]).map(a=>({id:a.id,name:a.name,energy:s.agenda?.actorEnergy?.[a.id]??90})),...(s.bands?.active?.members||[]).map(a=>({id:'band:'+a.id,name:a.name,energy:s.agenda?.actorEnergy?.['band:'+a.id]??90}))];}
 function participants(s,item,actorId){const list=[actorId];if(actorId!=='player'&&item.supervised!==false)list.push('player');const terms=item.bandTerms||s.projects?.find(p=>p.id===item.projectId)?.bandTerms,current=s.bands?.active?.members||[],available=new Set(current.map(m=>m.id));if(item.id==='band_rehearsal'||item.id==='band_audition'||terms)for(const m of terms?.members||current)if(available.has(m.id))list.push('band:'+m.id);return[...new Set(list)].sort();}
 function resources(item,actorId){if(item.id==='show'||item.id==='management_show')return['venue:'+item.venueId];if(item.resourceId)return[item.resourceId];if(['record','produce','collab','band_rehearsal','management_record'].includes(item.id))return['rental:'+actorId];return[];}
 function syncPlan(s){if(!active(s))return;const first=Math.floor(s.agenda.minute/WEEK)*WEEK,last=first+WEEK;s.plan=s.agenda.appointments.filter(a=>a.startMinute>=first&&a.startMinute<last&&a.status!=='cancelled').map(a=>({...clone(a.item),appointmentId:a.id}));if(s.activeWeek)s.activeWeek.lockedPlan=clone(s.plan);}
 function enable(s){
  if(s.version===4)return{ok:true,mode:s.agenda.mode};
  const current=s.calendar.day*DAY,transition=s.activeWeek?(Math.floor(s.calendar.day/7)+1)*7:null;
  s.version=4;s.calendar.minute=0;s.agenda={version:1,mode:transition===null?'hourly':'legacy-transition',minute:current,transitionDay:transition,nextId:1,appointments:[],actorEnergy:{},completedCount:0};
  if(transition===null){for(let i=0;i<s.plan.length;i++){const item=clone(s.plan[i]),id='appointment-'+s.agenda.nextId++,actorId=item.artistId||'player',duration=rule(item.id).baseMinutes,start=(s.calendar.day+i*2)*DAY+480;s.agenda.appointments.push({id,actionId:item.id,label:item.label,actorId,participants:participants(s,item,actorId),resources:resources(item,actorId),startMinute:start,endMinute:start+duration,durationMinutes:duration,status:'scheduled',completedMinutes:0,cost:item.cost,energy:item.energy,clientCost:0,item});}syncPlan(s);}
  return{ok:true,mode:s.agenda.mode,message:transition===null?'Agenda diaria activada.':'La agenda anterior se conserva hasta el próximo lunes.'};
 }
 function conflicts(s,q,exclude){return(s.agenda?.appointments||[]).find(a=>a.id!==exclude&&pending(a)&&q.startMinute<a.endMinute&&q.endMinute>a.startMinute&&(q.participants.some(x=>a.participants.includes(x))||q.resources.some(x=>a.resources.includes(x))));}
 function quote(s,p,hooks){
  if(s.version!==4||!s.agenda)return{ok:false,message:'Activa la agenda diaria antes de programar.'};
  const prepared=hooks.prepare(s,p);if(!prepared.ok)return prepared;
  const item=prepared.item,actorId=item.artistId||p.actorId||'player',spec=rule(item.id),duration=p.durationMinutes===undefined?spec.baseMinutes:Number(p.durationMinutes),earliest=s.agenda.mode==='legacy-transition'?s.agenda.transitionDay*DAY:now(s);
  if(!Number.isSafeInteger(duration)||duration<spec.minMinutes||duration>spec.maxMinutes||duration%spec.stepMinutes)return{ok:false,message:'Duración permitida: '+spec.minMinutes+'–'+spec.maxMinutes+' minutos, en bloques de '+spec.stepMinutes+'.'};
  const people=participants(s,item,actorId),places=resources(item,actorId);let start=p.startMinute===undefined?Math.ceil(Math.max(earliest,Math.floor(earliest/DAY)*DAY+480)/60)*60:Number(p.startMinute);
  if(!Number.isSafeInteger(start)||start<earliest||start%60||start+duration>MAX)return{ok:false,message:'Elige una hora futura válida; las citas empiezan en horas enteras.'};
  const factor=duration/spec.baseMinutes,q={ok:true,actionId:item.id,label:item.label,actorId,participants:people,resources:places,startMinute:start,endMinute:start+duration,durationMinutes:duration,variable:spec.variable,cost:round(item.cost*factor),energy:round(item.energy*factor*(prepared.energyMultiplier||1)),clientCost:round((prepared.clientCost||0)*factor),item};
  if(!actors(s).some(a=>a.id===actorId))return{ok:false,message:'El artista no está disponible.'};
  if(p.startMinute===undefined){let tries=0;while(conflicts(s,q,p.appointmentId)&&tries++<10000){q.startMinute+=60;q.endMinute+=60;}if(q.endMinute>MAX)return{ok:false,message:'No queda una fecha representable.'};}
  const collision=conflicts(s,q,p.appointmentId);if(collision)return{ok:false,message:'Conflicto con '+collision.label+'. Ese participante o espacio ya está ocupado.',conflictId:collision.id};
  if(['release','management_release'].includes(item.id)&&s.agenda.appointments.some(a=>a.id!==p.appointmentId&&pending(a)&&a.actionId===item.id&&a.item.projectId===item.projectId&&a.actorId===actorId))return{ok:false,message:'Esa publicación ya está programada.'};
  if(item.id==='album_video_shoot'){const video=(s.musicVideos||[]).find(v=>v.id===item.videoId),booked=s.agenda.appointments.filter(a=>a.id!==p.appointmentId&&pending(a)&&a.actionId===item.id&&a.item.videoId===item.videoId).length;if(video&&booked>=video.shootDays-video.shootsCompleted)return{ok:false,message:'Todos los rodajes necesarios ya están programados.'};}
  return q;
 }
 function act(s,p,hooks){
  if(p.decision==='schedule'&&p.appointmentId!==undefined)return{ok:false,message:'Una cita nueva no puede reemplazar una existente. Usa editar antes de que comience.'};
  const row=s.agenda?.appointments.find(a=>a.id===p.appointmentId);
  if(p.decision==='cancel'){
   if(!row||row.status!=='scheduled')return{ok:false,message:'Solo se puede cancelar una cita que aún no comenzó.'};
   row.status='cancelled';if(row.actionId==='band_audition'){const offer=s.bands?.offers?.find(o=>o.id===row.item.offerId);if(offer?.status==='planned')offer.status=s.week>offer.expiresWeek?'expired':'open';}syncPlan(s);return{ok:true,message:'Cita cancelada; no se cobró la actividad.'};
  }
  if(!['schedule','edit'].includes(p.decision))return{ok:false,message:'Elige programar, editar o cancelar.'};
  if(p.decision==='schedule'&&s.agenda?.appointments.length>=20000)return{ok:false,message:'La agenda alcanzó el límite técnico de citas conservadas.'};
  if(p.decision==='edit'&&(!row||row.status!=='scheduled'))return{ok:false,message:'Una actividad iniciada conserva sus condiciones.'};
  const source=row?{...row.item,actionId:row.actionId,actorId:row.actorId,startMinute:row.startMinute,durationMinutes:row.durationMinutes,...p}:p;
  const q=quote(s,source,hooks);if(!q.ok)return q;
  const appointment={id:row?.id||'appointment-'+s.agenda.nextId++,actionId:q.actionId,label:q.label,actorId:q.actorId,participants:q.participants,resources:q.resources,startMinute:q.startMinute,endMinute:q.endMinute,durationMinutes:q.durationMinutes,status:'scheduled',completedMinutes:0,cost:q.cost,energy:q.energy,clientCost:q.clientCost,item:clone(q.item)};
  if(row)s.agenda.appointments[s.agenda.appointments.indexOf(row)]=appointment;else s.agenda.appointments.push(appointment);
  s.agenda.appointments.sort((a,b)=>a.startMinute-b.startMinute||a.id.localeCompare(b.id));syncPlan(s);
  return{ok:true,appointmentId:appointment.id,appointment:clone(appointment),message:q.label+' programado.'};
 }
 function reserved(s,account='personal',artistId=null,excludeId=null){return round((s.agenda?.appointments||[]).filter(a=>a.status==='running'&&a.id!==excludeId).reduce((n,a)=>n+(account==='personal'?a.cost:account==='client'&&a.actorId===artistId?a.clientCost:0)*(1-a.completedMinutes/a.durationMinutes),0));}
 function boundary(s,target){let end=Math.min(target,(Math.floor(now(s)/DAY)+1)*DAY);for(const a of s.agenda.appointments){if(a.status==='scheduled'&&a.startMinute>=now(s))end=Math.min(end,a.startMinute);if(a.status==='running')end=Math.min(end,a.startMinute+a.completedMinutes+(rule(a.actionId).variable?120:a.durationMinutes));}return end;}
 function trim(s){const a=s.agenda,cut=a.minute-28*DAY;a.appointments=a.appointments.filter(x=>pending(x)||x.endMinute>=cut).slice(-20000);}
 function tick(s,target,hooks){
  if(!Number.isSafeInteger(target)||target<now(s)||target>MAX)return{ok:false,message:'Minuto objetivo inválido.'};
  const dayReports=[],weekReports=[],events=[];let turns=0;
  while(now(s)<target){
   if(++turns>100000)return{ok:false,message:'Avanza un tramo más corto.',minute:now(s),dayReports,weekReports};
   if(s.agenda.mode==='legacy-transition'){
    const next=Math.min(target,(s.calendar.day+1)*DAY);s.agenda.minute=next;s.calendar.minute=next%DAY;
    if(next===(s.calendar.day+1)*DAY){s.calendar.minute=0;const r=hooks.legacyDay(s);if(!r.ok)return r;dayReports.push(r.dayReport);if(r.weekClosed)weekReports.push(r.weekReport);if(s.calendar.day>=s.agenda.transitionDay){s.agenda.mode='hourly';s.agenda.transitionDay=null;syncPlan(s);}}
    continue;
   }
   const opened=hooks.open(s);if(opened?.ok===false)return opened;
   // Start all simultaneous activities in stable order, after prior finishes.
   for(const a of s.agenda.appointments.filter(a=>a.status==='scheduled'&&a.startMinute===now(s)).sort((a,b)=>a.id.localeCompare(b.id))){const ready=hooks.ready(s,a);if(ready.ok){a.status='running';events.push({type:'start',id:a.id,minute:now(s)});}else{a.status='skipped';a.reason=ready.message;events.push({type:'skipped',id:a.id,minute:now(s),reason:a.reason});}}
   const next=boundary(s,target);if(next<=now(s))return{ok:false,message:'La agenda contiene una frontera repetida.'};
   s.agenda.minute=next;s.calendar.minute=next%DAY;
   for(const a of s.agenda.appointments.filter(a=>a.status==='running'&&a.startMinute+a.completedMinutes+(rule(a.actionId).variable?120:a.durationMinutes)===next).sort((a,b)=>a.id.localeCompare(b.id))){
    const quantum=rule(a.actionId).variable?120:a.durationMinutes,result=hooks.resolve(s,a,quantum/rule(a.actionId).baseMinutes);
    a.completedMinutes+=quantum;
    if(!result.ok){a.status='skipped';a.reason=result.message||'La actividad no pudo completarse.';events.push({type:'skipped',id:a.id,minute:next,reason:a.reason});}
    else if(a.completedMinutes>=a.durationMinutes){a.status='completed';s.agenda.completedCount++;events.push({type:'complete',id:a.id,minute:next});}
   }
   if(next%DAY===0){const r=hooks.close(s);if(!r.ok)return r;dayReports.push(r.dayReport);if(r.weekClosed)weekReports.push(r.weekReport);hooks.recover(s);trim(s);syncPlan(s);}
  }
  return{ok:true,minute:now(s),currentDay:s.calendar.day,day:s.calendar.day-1,daysAdvanced:dayReports.length,weekClosed:weekReports.length>0,dayReports,weekReports,events,dayReport:dayReports.at(-1)||null,weekReport:weekReports.at(-1)||null};
 }
 function summary(s,options={},catalog=[]){const a=s.agenda,minute=now(s),from=(options.fromDay??s.calendar.day)*DAY,to=from+(options.days??14)*DAY;return{enabled:!!a,mode:a?.mode||'legacy',minute,day:s.calendar.day,minuteOfDay:s.calendar.minute||0,transitionDay:a?.transitionDay??null,actors:actors(s),appointments:(a?.appointments||[]).filter(x=>x.endMinute>=from&&x.startMinute<to&&(!options.actorId||x.participants.includes(options.actorId))).map(x=>({...clone(x),projectId:x.item.projectId||null,supervised:x.item.supervised!==false,progress:Math.max(0,Math.min(1,(minute-x.startMinute)/x.durationMinutes))})),catalog:catalog.map(x=>({id:x.id,label:x.label,...rule(x.id)}))};}
 function validate(s){
  if(s.version!==4)return s.agenda===undefined?[]:['La agenda horaria requiere versión 4.'];
  const a=s.agenda,errors=[];if(!a||a.version!==1||!['hourly','legacy-transition'].includes(a.mode)||!Number.isSafeInteger(a.minute)||a.minute<0||a.minute>MAX||!Number.isInteger(s.calendar?.minute)||s.calendar.minute<0||s.calendar.minute>=DAY||a.minute!==s.calendar.day*DAY+s.calendar.minute||!Number.isSafeInteger(a.nextId)||a.nextId<1||!Number.isSafeInteger(a.completedCount)||a.completedCount<0||!Array.isArray(a.appointments)||a.appointments.length>20000||!a.actorEnergy||typeof a.actorEnergy!=='object'||Array.isArray(a.actorEnergy))return['Agenda horaria inválida.'];
  if(a.mode==='legacy-transition'&&(!Number.isInteger(a.transitionDay)||a.transitionDay%7||a.transitionDay<=s.calendar.day)||a.mode==='hourly'&&a.transitionDay!==null)errors.push('Transición de agenda inválida.');
  for(const value of Object.values(a.actorEnergy))if(!Number.isFinite(value)||value<0||value>100)errors.push('Energía de participante inválida.');
  const ids=new Set();for(const row of a.appointments){const r=rule(row?.actionId);if(!row||typeof row.id!=='string'||ids.has(row.id)||!Object.hasOwn(durations,row.actionId)||!row.item||row.item.id!==row.actionId||typeof row.actorId!=='string'||!Array.isArray(row.participants)||!row.participants.includes(row.actorId)||new Set(row.participants).size!==row.participants.length||row.participants.some(x=>typeof x!=='string')||!Array.isArray(row.resources)||row.resources.some(x=>typeof x!=='string')||!Number.isInteger(row.startMinute)||row.startMinute<0||row.startMinute%60||!Number.isInteger(row.durationMinutes)||row.durationMinutes<r.minMinutes||row.durationMinutes>r.maxMinutes||row.durationMinutes%r.stepMinutes||row.endMinute!==row.startMinute+row.durationMinutes||row.endMinute>MAX||!['scheduled','running','completed','skipped','cancelled'].includes(row.status)||!Number.isInteger(row.completedMinutes)||row.completedMinutes<0||row.completedMinutes>row.durationMinutes||['cost','energy','clientCost'].some(k=>!Number.isFinite(row[k]))||row.cost<0||row.clientCost<0||row.status==='scheduled'&&(row.startMinute<a.minute||row.completedMinutes!==0)||row.status==='running'&&(row.startMinute>a.minute||row.endMinute<a.minute)||row.status==='completed'&&(row.completedMinutes!==row.durationMinutes||row.endMinute>a.minute)){errors.push('Cita horaria inválida.');continue;}ids.add(row.id);if(pending(row)&&conflicts(s,row,row.id))errors.push('La agenda contiene citas incompatibles.');}
  return[...new Set(errors)];
 }
 const api={DAY,WEEK,active,now,rule,enable,quote,act,tick,summary,validate,reserved,syncPlan};root.RapDailyAgenda=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
