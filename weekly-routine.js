/* Explicit weekly routine permission. Replans through public engine actions only. */
(function(root){
 'use strict';
 const repeatable=new Set(['dayjob','employment_shift','video','home_record','write','record','produce','rehearse','social','network','street','interview','business','fanclub','rest','management_record','management_promote']);
 const projectWork=new Set(['home_record','write','record','produce']);
 const api=()=>root.RapEngine||(typeof require==='function'?require('./engine.js'):null);
 const label=item=>String(item?.label||item?.id||'Actividad');
 function capture(s){
  if(s?.version===4&&s.agenda?.mode==='hourly'){
   const base=Math.floor(s.agenda.minute/10080)*10080,items=[],excluded=[];
   for(const a of s.agenda.appointments.filter(a=>a.startMinute>=base&&a.startMinute<base+10080&&!['cancelled','skipped'].includes(a.status))){if(!repeatable.has(a.actionId)){excluded.push({id:a.actionId,label:a.label,reason:'Actividad puntual; requiere una orden nueva.'});continue;}items.push({...JSON.parse(JSON.stringify(a.item)),id:a.actionId,label:a.label,actorId:a.actorId,durationMinutes:a.durationMinutes,startOffsetMinutes:a.startMinute-base});}
   return{version:2,items,excluded};
  }
  const items=[],excluded=[],source=s?.activeWeek?.lockedPlan||s?.plan||[];
  for(const planned of source){
   if(!repeatable.has(planned?.id)){excluded.push({id:String(planned?.id||''),label:label(planned),reason:'Actividad puntual: no se repetirá ni se contratará automáticamente.'});continue;}
   const item={id:planned.id,label:label(planned)};
   if(planned.id==='employment_shift')item.jobId=planned.jobId||s.employment?.id||null;
   if(planned.id.startsWith('management_')){
    item.artistId=planned.artistId||null;
    if(planned.id==='management_record'){const artist=s.management?.artists.find(a=>a.id===item.artistId);item.projectId=planned.projectId||artist?.projects.find(p=>p.status==='working')?.id||null;}
   }else if(projectWork.has(planned.id)){
    const projectId=planned.projectId||s.projects?.find(p=>p.status==='working')?.id;
    if(projectId)item.projectId=projectId;
   }
   items.push(item);
  }
  return{items,excluded};
 }
 function apply(s,routine){
  const E=api(),items=Array.isArray(routine?.items)?routine.items:[],log=[];let planned=0,skipped=0;
  const skip=(item,reason)=>{skipped++;log.push(label(item)+': '+reason);};
  if(s?.version===4&&s.agenda?.mode==='hourly'){
   const base=Math.floor(s.agenda.minute/10080)*10080;
   for(const item of items){
    if(!repeatable.has(item?.id)){skip(item,'Actividad fuera de la autorización de rutina.');continue;}
    const startMinute=Number.isInteger(item.startOffsetMinutes)?base+item.startOffsetMinutes:undefined;
    if(startMinute!==undefined&&startMinute<s.agenda.minute){skip(item,'La hora autorizada ya pasó.');continue;}
    if(s.agenda.appointments.some(a=>['scheduled','running','completed'].includes(a.status)&&a.startMinute===startMinute&&a.actionId===item.id&&a.actorId===(item.actorId||item.artistId||'player'))){skip(item,'La cita autorizada ya existe.');continue;}
    if(projectWork.has(item.id)&&item.projectId&&!s.projects?.some(p=>p.id===item.projectId&&p.status==='working')){skip(item,'El proyecto autorizado ya no está en producción.');continue;}
    if(item.id==='employment_shift'&&s.employment?.id!==item.jobId){skip(item,'El empleo autorizado cambió.');continue;}
    const result=E.act(s,'agenda',{...item,decision:'schedule',actionId:item.id,...(startMinute!==undefined?{startMinute}:{})});
    if(result.ok){planned++;log.push(label(item)+': programada con la duración y participantes autorizados.');}else skip(item,result.message);
   }
   return{planned,skipped,log};
  }
  if(!E||!s||s.activeWeek||s.plan?.length){for(const item of items)skip(item,s?.activeWeek?'La semana ya tiene una agenda cerrada.':'La agenda existente se conserva; no se duplican actividades.');return{planned,skipped,log};}
  for(const item of items){
   if(!repeatable.has(item?.id)){skip(item,'Actividad fuera de la autorización de rutina.');continue;}
   let result;
   if(item.id==='employment_shift'){
    if(!item.jobId||s.employment?.status!=='active'||s.employment.id!==item.jobId){skip(item,'El empleo autorizado ya no está activo.');continue;}
    result=E.act(s,'plan',{id:item.id});
   }else if(item.id.startsWith('management_')){
    const artist=s.management?.artists.find(a=>a.id===item.artistId);
    if(!artist){skip(item,'El artista autorizado ya no está en el roster.');continue;}
    const activity=item.id.replace('management_','');
    if(activity==='record'&&(!item.projectId||!artist.projects.some(p=>p.id===item.projectId&&p.status==='working'))){skip(item,'El proyecto autorizado no está en producción; no se sustituye por otro.');continue;}
    const status=E.managementActionStatus?.(s,item);
    if(!status?.ok){skip(item,status?.message||'No hay autorización vigente para trabajar con este artista.');continue;}
    result=E.act(s,'management',{decision:'plan',artistId:item.artistId,activity,...(activity==='record'?{projectId:item.projectId}:{})});
   }else{
    if(projectWork.has(item.id)&&item.projectId&&!s.projects?.some(p=>p.id===item.projectId&&p.status==='working')){skip(item,'El proyecto autorizado ya no está en producción; no se sustituye por otro.');continue;}
    result=E.act(s,'plan',{id:item.id,...(item.projectId?{projectId:item.projectId}:{})});
   }
   if(result?.ok){planned++;log.push(label(item)+': programada en el siguiente hueco disponible.');}else skip(item,result?.message||'No se pudo programar.');
  }
  return{planned,skipped,log};
 }
 const exported={capture,apply};root.RapWeeklyRoutine=exported;if(typeof module!=='undefined'&&module.exports)module.exports=exported;
})(typeof globalThis!=='undefined'?globalThis:this);
