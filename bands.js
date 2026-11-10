/* HAMBRE — original group mechanics. Provisional balance, isolated RNG, no cash writes. */
(function(root){
 'use strict';
 const VERSION=1,copy=x=>JSON.parse(JSON.stringify(x)),money=x=>Math.round((Number(x)||0)*100)/100,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const ROLES=[{id:'voice',name:'Voz',skillKey:'flow'},{id:'rapper',name:'MC',skillKey:'flow'},{id:'guitar',name:'Guitarra',skillKey:'stage'},{id:'bass',name:'Bajo',skillKey:'stage'},{id:'drums',name:'Batería',skillKey:'stage'},{id:'keys',name:'Teclados',skillKey:'production'},{id:'producer',name:'Producción / DJ',skillKey:'production'}];
 const TYPES=[{id:'band',name:'Banda',maxMembers:6},{id:'duo',name:'Dúo',maxMembers:2},{id:'collective',name:'Colectivo',maxMembers:5}];
 const PEOPLE=[
  {id:'vera',name:'Vera Vidal',role:'guitar',skill:36,minSkill:20,minReputation:5},
  {id:'nico',name:'Nico Rivas',role:'drums',skill:33,minSkill:18,minReputation:5},
  {id:'sol',name:'Sol Medina',role:'bass',skill:35,minSkill:20,minReputation:8},
  {id:'lila',name:'Lila Norte',role:'voice',skill:40,minSkill:25,minReputation:10},
  {id:'teo',name:'Teo B',role:'producer',skill:38,minSkill:22,minReputation:8},
  {id:'brisa',name:'Brisa Uno',role:'rapper',skill:34,minSkill:18,minReputation:5},
  {id:'ian',name:'Ian Soler',role:'keys',skill:55,minSkill:40,minReputation:25},
  {id:'mara',name:'Mara Vela',role:'guitar',skill:64,minSkill:48,minReputation:35},
  {id:'elias',name:'Elías Cruz',role:'producer',skill:70,minSkill:55,minReputation:45}
 ];
 const TEMPLATES=[
  {name:'Ruido de Patio',type:'band',role:'voice',members:['vera','nico','sol'],minSkill:24,minReputation:8},
  {name:'Frecuencia Dos',type:'duo',role:'rapper',members:['teo'],minSkill:22,minReputation:6},
  {name:'Sur en Común',type:'collective',role:'producer',members:['brisa','lila'],minSkill:26,minReputation:10},
  {name:'Kilómetro Azul',type:'band',role:'guitar',members:['ian','nico','lila'],minSkill:42,minReputation:28}
 ];
 const RULES={auditionCost:30,auditionEnergy:18,rehearsalCost:60,rehearsalEnergy:16,rehearsalEveryWeeks:2,rehearsalCohesion:8,missedCohesion:12,requestEveryWeeks:4,maxOffers:8,provisional:true,note:'Balance provisional. El artista adelanta costes. Solo las obras y fechas elegidas como grupales comparten ingresos; nunca se cede el catálogo solista previo.'};
 const role=id=>ROLES.find(r=>r.id===id),type=id=>TYPES.find(t=>t.id===id),member=id=>PEOPLE.find(p=>p.id===id),skill=(s,id)=>Number(s.player?.skills?.[role(id)?.skillKey])||0;
 function initial(s){return{version:VERSION,rng:(((s.rng||1)^0x6b8b4567)>>>0)||1,seq:0,startedWeek:s.week,lastClosedWeek:s.week-1,nextRequestWeek:s.week,active:null,offers:[],history:[],recruiting:{},earnings:{totalMemberEarnings:0,groups:[],recent:[]}};}
 function ensure(s){if(s.bands===undefined)s.bands=initial(s);return s.bands;}
 function random(b){let x=b.rng;x^=x<<13;x^=x>>>17;x^=x<<5;b.rng=x>>>0;return b.rng/4294967296;}
 function uid(b,prefix){return'band-'+prefix+'-'+(++b.seq);}
 function log(s,b,kind,message){b.history.push({week:s.week,kind,message});if(b.history.length>60)b.history.splice(0,b.history.length-60);}
 function split(g){const n=g.members.length+1;g.playerShare=1/n;g.members.forEach((m,i)=>{m.share=i===g.members.length-1?1-g.playerShare-(g.members.length-1)/n:1/n;});g.status=g.members.length?'active':'forming';}
 function freshGroup(s,b,data){const g={id:uid(b,'group'),name:data.name,type:data.type,playerRole:data.role,playerShare:1,members:copy(data.members||[]),cohesion:55,nextRehearsalWeek:s.week+2,missedCommitments:0,rehearsals:0,lastRehearsalDay:null,formedWeek:s.week};split(g);return g;}
 function offer(s,b,kind='audition'){
  const pool=TEMPLATES.filter(t=>!b.offers.some(o=>['open','planned','qualified'].includes(o.status)&&o.name===t.name));
  if(!pool.length)return null;
  const t=pool[Math.floor(random(b)*pool.length)],members=t.members.map(id=>{const m=member(id);return{id:m.id,name:m.name,role:m.role,skill:m.skill,share:1/(t.members.length+1)};});
  if(members.length)members.at(-1).share=1-1/(members.length+1)-(members.length-1)/(members.length+1);
  const qualified=skill(s,t.role)>=t.minSkill+18&&(s.player?.reputation||0)>=t.minReputation+15;
  const o={id:uid(b,'offer'),name:t.name,type:t.type,role:t.role,kind:kind==='invitation'&&qualified?'invitation':'audition',status:'open',members,playerShare:1/(members.length+1),minSkill:t.minSkill,minReputation:t.minReputation,offeredWeek:s.week,expiresWeek:s.week+4};
  b.offers.push(o);if(b.offers.length>8){const drop=b.offers.findIndex(x=>!['open','planned','qualified'].includes(x.status));if(drop>=0)b.offers.splice(drop,1);else b.offers.shift();}
  log(s,b,o.kind,o.kind==='invitation'?o.name+' te invita a entrar. Revisa los roles y el reparto antes de decidir.':o.name+' abre una audición para '+role(o.role).name+'.');return o;
 }
 function eligibility(s,b,m){
  const g=b.active;
  if(!g)return'Primero funda un grupo.';
  if(g.members.length+1>=type(g.type).maxMembers)return'El grupo ya tiene su formación completa.';
  if(g.members.some(x=>x.id===m.id))return'Ya forma parte del grupo.';
  if(!['voice','rapper','producer'].includes(m.role)&&(g.playerRole===m.role||g.members.some(x=>x.role===m.role)))return'Este puesto ya está cubierto.';
  if((b.recruiting[m.id]||0)>s.week)return'Puedes volver a proponerlo en S'+b.recruiting[m.id]+'.';
  if(skill(s,g.playerRole)<m.minSkill||(s.player?.reputation||0)<m.minReputation)return'Necesita habilidad '+m.minSkill+' en tu rol y reputación '+m.minReputation+'.';
  return null;
 }
 function queue(s,b,ctx,id,payload,label){
  if(!ctx||typeof ctx.plan!=='function')return{ok:false,message:'La agenda no está disponible.'};
  if((s.plan||[]).some(x=>x.id===id&&(id==='band_audition'?x.offerId===payload.offerId:x.bandId===payload.bandId)))return{ok:false,message:'Esta sesión ya está en la agenda.'};
  const result=ctx.plan(id,payload);
  if(result?.ok)log(s,b,'planned',label+' añadida a la agenda. Se resolverá el día de la sesión.');
  return result;
 }
 function act(s,p={},ctx={}){
  if(s.activeWeek&&s.agenda?.mode!=='hourly'||s.financialHold)return{ok:false,message:'Espera al cierre de la semana o concilia la partida antes de cambiar el grupo.'};
  const b=ensure(s),decision=p.decision,g=b.active;
  if(decision==='create'){
   if(g)return{ok:false,message:'Ya tienes un grupo. Debes salir antes de formar otro.'};
   if((s.plan||[]).some(a=>a.id==='band_audition'))return{ok:false,message:'Retira la audición pendiente de la agenda antes de fundar un grupo.'};
   const name=typeof p.name==='string'?p.name.trim().slice(0,48):'';
   if(!name||!type(p.type)||!role(p.role))return{ok:false,message:'Elige un nombre, tipo de grupo y rol válidos.'};
   b.active=freshGroup(s,b,{name,type:p.type,role:p.role});log(s,b,'formed','Fundaste '+name+'. Está en formación: recluta al menos a una persona.');
   return{ok:true,message:name+' está en formación. Aún no tiene miembros ni ingresos grupales.'};
  }
  if(decision==='request'){
   if(s.week<b.nextRequestWeek)return{ok:false,message:'La próxima búsqueda abre en S'+b.nextRequestWeek+'.'};
   if(b.offers.filter(o=>['open','planned','qualified'].includes(o.status)).length>=4)return{ok:false,message:'Revisa las oportunidades abiertas antes de buscar más.'};
   b.nextRequestWeek=s.week+4;const o=offer(s,b);
   return{ok:true,message:o?'Encontraste una audición. Consulta los requisitos y reserva la sesión.':'No hay otra audición disponible esta ronda.'};
  }
  if(decision==='invite'){
   const m=member(p.memberId);if(!m)return{ok:false,message:'Ese músico no está disponible.'};
   const reason=eligibility(s,b,m);if(reason)return{ok:false,message:reason};
   b.recruiting[m.id]=s.week+4;
   const chance=clamp(.55+(skill(s,g.playerRole)-m.minSkill)/150+((s.player?.reputation||0)-m.minReputation)/180,.35,.92);
   if(random(b)>chance){log(s,b,'declined',m.name+' rechaza entrar en '+g.name+' esta vez.');return{ok:true,outcome:'declined',message:m.name+' rechaza la propuesta. Puedes volver a hablar en S'+b.recruiting[m.id]+'.'};}
   if(!g.members.length)g.nextRehearsalWeek=s.week+2;
   g.members.push({id:m.id,name:m.name,role:m.role,skill:m.skill,share:0});split(g);g.cohesion=clamp(g.cohesion-3,0,100);
   log(s,b,'joined',m.name+' entra en '+g.name+'. Las nuevas obras usarán el nuevo reparto igualitario.');
   return{ok:true,outcome:'joined',message:m.name+' aceptó. Revisa la nueva formación y agenda un ensayo.'};
  }
  if(decision==='leave'){
   if(!g)return{ok:false,message:'No formas parte de un grupo.'};
   if((s.plan||[]).some(a=>a.bandId===g.id||a.bandTerms?.bandId===g.id))return{ok:false,message:'Retira primero los compromisos grupales pendientes de tu agenda.'};
   log(s,b,'left','Saliste de '+g.name+'. Los repartos de obras ya acordadas continúan; el catálogo solista sigue siendo tuyo.');b.active=null;
   return{ok:true,message:'Saliste del grupo. Las participaciones ya fijadas en obras publicadas y proyectos acordados se conservan.'};
  }
  if(decision==='rehearse'){
   if(!g?.members.length)return{ok:false,message:'Necesitas al menos otro integrante para un ensayo grupal.'};
   return queue(s,b,ctx,'band_rehearsal',{bandId:g.id},'Ensayo de '+g.name);
  }
  const o=b.offers.find(x=>x.id===(p.offerId||p.id));
  if(!o||!['open','planned','qualified'].includes(o.status))return{ok:false,message:'Esta oportunidad ya no está abierta.'};
  if(s.week>o.expiresWeek){o.status='expired';return{ok:false,message:'La oportunidad venció.'};}
  if(decision==='reject'){
   if((s.plan||[]).some(a=>a.offerId===o.id))return{ok:false,message:'Retira primero la audición de la agenda.'};
   o.status='rejected';log(s,b,'rejected','Rechazaste la propuesta de '+o.name+'.');return{ok:true,message:'Propuesta rechazada. No cambia tu pertenencia actual.'};
  }
  if(decision==='audition'){
   if(o.kind==='invitation'||o.status==='qualified')return{ok:false,message:'Ya puedes revisar y aceptar esta invitación; no necesitas otra audición.'};
   if(g)return{ok:false,message:'Termina tus compromisos y sal de tu grupo antes de audicionar para otro.'};
   if(skill(s,o.role)<o.minSkill||(s.player?.reputation||0)<o.minReputation)return{ok:false,message:'La audición exige habilidad '+o.minSkill+' en '+role(o.role).name+' y reputación '+o.minReputation+'.'};
   const result=queue(s,b,ctx,'band_audition',{offerId:o.id},'Audición para '+o.name);if(result?.ok)o.status='planned';return result;
  }
  if(decision==='accept'){
   if(g)return{ok:false,message:'Ya perteneces a un grupo. No se cambia de grupo automáticamente.'};
   if((s.plan||[]).some(a=>a.id==='band_audition'))return{ok:false,message:'Retira la audición pendiente de la agenda antes de unirte.'};
   if(o.kind!=='invitation'&&o.status!=='qualified')return{ok:false,message:'Primero debes superar la audición y recibir una invitación.'};
   b.active=freshGroup(s,b,{name:o.name,type:o.type,role:o.role,members:o.members});o.status='accepted';o.acceptedWeek=s.week;
   log(s,b,'accepted','Entraste en '+o.name+' como '+role(o.role).name+'. Tu cuota para nuevas obras grupales es '+money(b.active.playerShare*100)+'%.');
   return{ok:true,message:'Ahora formas parte de '+o.name+'. Tu catálogo anterior no se comparte. Elige expresamente cada proyecto o fecha grupal.'};
  }
  return{ok:false,message:'Decisión de grupo desconocida.'};
 }
 function canResolveAction(s,item){
  const b=s.bands;
  if(item?.id==='band_audition'){const o=b?.offers?.find(x=>x.id===item.offerId);return o&&['open','planned'].includes(o.status)&&s.week<=o.expiresWeek&&!b.active?{ok:true}:{ok:false,message:'Audición no disponible.'};}
  if(item?.id==='band_rehearsal'){const g=b?.active;return g&&g.id===item.bandId&&g.members.length&&g.lastRehearsalDay!==s.calendar?.day?{ok:true}:{ok:false,message:'Ensayo no disponible o ya realizado.'};}
  return{ok:false,message:'Sesión grupal desconocida.'};
 }
 function resolveAction(s,item,report={}){
  const preflight=canResolveAction(s,item);if(!preflight.ok)return{...preflight,completed:false};
  const b=ensure(s);let message,passed=false;
  if(item.id==='band_audition'){
   const o=b.offers.find(x=>x.id===item.offerId);
   if(!o||!['open','planned'].includes(o.status)||s.week>o.expiresWeek||b.active)return{ok:false,completed:false,message:'Audición no disponible.'};
   const score=skill(s,o.role)*.65+(Number(s.player?.skills?.stage)||0)*.2+(Number(s.player?.energy)||0)*.15;
   const chance=clamp(.5+(score-o.minSkill)/100+((s.player?.reputation||0)-o.minReputation)/250,.2,.9);
   passed=random(b)<chance;o.auditionWeek=s.week;o.auditionDay=s.calendar.day;o.status=passed?'qualified':'failed';if(passed)o.expiresWeek=Math.max(o.expiresWeek,s.week+2);
   message=passed?'Superaste la audición de '+o.name+'. Recibiste una invitación: falta que decidas unirte.':'No superaste la audición de '+o.name+'. La sesión y su coste se consumieron; no cambió tu grupo.';
  }else if(item.id==='band_rehearsal'){
   const g=b.active;if(!g||g.id!==item.bandId||!g.members.length||g.lastRehearsalDay===s.calendar.day)return{ok:false,completed:false,message:'Ensayo no disponible o ya realizado.'};
   g.lastRehearsalDay=s.calendar.day;g.rehearsals++;g.cohesion=clamp(g.cohesion+8,0,100);g.nextRehearsalWeek=s.week+2;g.missedCommitments=0;
   message='Ensayaste con '+g.name+'. Cohesión '+g.cohesion+'/100; próximo compromiso antes del cierre de S'+g.nextRehearsalWeek+'.';passed=true;
  }else return{ok:false,completed:false,message:'Sesión grupal desconocida.'};
  log(s,b,passed?'session':'failed',message);if(Array.isArray(report.highlights))report.highlights.push(message);
  return{ok:true,completed:true,passed,message};
 }
 function closeWeek(s,completedWeek){
  const b=ensure(s);if(!Number.isInteger(completedWeek)||completedWeek<=b.lastClosedWeek)return{advanced:false};
  b.lastClosedWeek=completedWeek;
  for(const o of b.offers){if(['open','planned','qualified'].includes(o.status)&&s.week>o.expiresWeek)o.status='expired';if(o.status==='planned'&&!(s.plan||[]).some(a=>a.offerId===o.id))o.status='open';}
  const g=b.active;
  if(g?.members.length&&completedWeek>=g.nextRehearsalWeek){
   g.cohesion=clamp(g.cohesion-12,0,100);g.missedCommitments++;g.nextRehearsalWeek=completedWeek+2;
   log(s,b,'missed',g.name+' perdió un compromiso de ensayo. Cohesión '+g.cohesion+'/100.');
   if(g.cohesion<25&&g.missedCommitments>=2&&random(b)<.45){const departing=g.members.splice(Math.floor(random(b)*g.members.length),1)[0];split(g);log(s,b,'departed',departing.name+' sale de '+g.name+' por falta de compromiso. Conserva su cuota en las obras ya acordadas.');}
  }
  if((completedWeek-b.startedWeek+1)%6===0&&b.offers.filter(o=>['open','planned','qualified'].includes(o.status)).length<4&&random(b)<.55)offer(s,b,'invitation');
  return{advanced:true};
 }
 function modifiers(s){
  const g=s.bands?.active;if(!g?.members.length)return{productionBonus:0,stageBonus:0};
  const craft=g.members.reduce((n,m)=>n+m.skill,0)/g.members.length,cohesion=g.cohesion/100;
  return{productionBonus:money(Math.min(8,craft*.1)*cohesion),stageBonus:money(Math.min(6,craft*.08)*cohesion)};
 }
 function projectTerms(s){const g=s.bands?.active;if(!g?.members.length)return null;return{bandId:g.id,name:g.name,type:g.type,playerRole:g.playerRole,playerShare:g.playerShare,members:g.members.map(m=>({id:m.id,name:m.name,role:m.role,share:m.share})),formedWeek:g.formedWeek,...modifiers(s)};}
 function recordEarnings(s,terms,amount,context={}){
  if(!terms||!Number.isFinite(amount)||amount<=0||!Array.isArray(terms.members)||!terms.members.length)return[];
  const b=ensure(s),sum=terms.members.reduce((n,m)=>n+m.share,0);if(!(sum>0))return[];
  const cents=Math.round(amount*100),exact=terms.members.map(m=>cents*m.share/sum),values=exact.map(Math.floor),order=exact.map((n,i)=>({i,f:n-values[i]})).sort((a,b)=>b.f-a.f||a.i-b.i);
  for(let i=0,n=cents-values.reduce((a,v)=>a+v,0);i<n;i++)values[order[i].i]++;
  const payments=terms.members.map((m,i)=>({id:m.id,name:m.name,amount:values[i]/100}));
  const earnings=b.earnings;earnings.totalMemberEarnings=money(earnings.totalMemberEarnings+amount);let group=earnings.groups.find(g=>g.bandId===terms.bandId);
  if(!group){group={bandId:terms.bandId,name:terms.name,amount:0};earnings.groups.push(group);if(earnings.groups.length>32)earnings.groups.shift();}group.amount=money(group.amount+amount);
  earnings.recent.push({week:s.week,bandId:terms.bandId,name:terms.name,amount:money(amount),source:typeof context==='string'?context:String(context.source||'Música grupal').slice(0,80),...(context.releaseId?{releaseId:context.releaseId}:{}),payments});if(earnings.recent.length>24)earnings.recent.shift();
  return payments;
 }
 function summary(s){
  const b=s.bands||initial(s),g=b.active;
  const offers=copy(b.offers).reverse().map(o=>{if(o.status==='planned'&&!(s.plan||[]).some(a=>a.offerId===o.id)&&!(s.activeWeek?.lockedPlan||[]).some(a=>a.offerId===o.id))o.status='open';return o;});
  return{active:g?copy(g):null,candidates:PEOPLE.map(m=>{const reason=eligibility(s,b,m);return{...copy(m),available:!reason,reason};}),offers,types:copy(TYPES),roles:copy(ROLES),history:copy(b.history).reverse(),earnings:copy(b.earnings),nextRequestWeek:b.nextRequestWeek,canRequest:s.week>=b.nextRequestWeek&&b.offers.filter(o=>['open','planned','qualified'].includes(o.status)).length<4,modifiers:modifiers(s),rules:copy(RULES)};
 }
 function validTerms(t){return!!t&&typeof t.bandId==='string'&&typeof t.name==='string'&&t.name.length>0&&t.name.length<=48&&!!type(t.type)&&!!role(t.playerRole)&&Number.isFinite(t.playerShare)&&t.playerShare>0&&t.playerShare<1&&Array.isArray(t.members)&&t.members.length>=1&&t.members.length<=(type(t.type)?.maxMembers||0)-1&&t.members.every(m=>m&&typeof m.id==='string'&&typeof m.name==='string'&&role(m.role)&&Number.isFinite(m.share)&&m.share>0&&m.share<1)&&new Set(t.members.map(m=>m.id)).size===t.members.length&&Math.abs(t.members.reduce((n,m)=>n+m.share,t.playerShare)-1)<.000001&&Number.isInteger(t.formedWeek)&&t.formedWeek>=1&&Number.isFinite(t.productionBonus)&&t.productionBonus>=0&&t.productionBonus<=8&&Number.isFinite(t.stageBonus)&&t.stageBonus>=0&&t.stageBonus<=6;}
 function validate(s){
  if(!s||typeof s!=='object')return{ok:false,errors:['Partida inválida.']};
  const list=value=>Array.isArray(value)?value:[];
  const b=s.bands,plans=[...list(s.plan),...list(s.activeWeek?.lockedPlan)],works=[...list(s.projects),...list(s.releases),...plans];
  if(b===undefined)return works.some(item=>item?.bandTerms!==undefined||['band_audition','band_rehearsal'].includes(item?.id))?{ok:false,errors:['Hay acuerdos grupales sin estado de bandas.']}:{ok:true,errors:[]};const errors=[];
  if(!b||b.version!==1||!Number.isInteger(b.rng)||b.rng<=0||b.rng>4294967295||!Number.isSafeInteger(b.seq)||b.seq<0||!Number.isInteger(b.startedWeek)||b.startedWeek<1||!Number.isInteger(b.lastClosedWeek)||b.lastClosedWeek<0||!Number.isInteger(b.nextRequestWeek)||!Array.isArray(b.offers)||b.offers.length>8||!Array.isArray(b.history)||b.history.length>60||!b.recruiting||typeof b.recruiting!=='object'||Array.isArray(b.recruiting)||!b.earnings)return{ok:false,errors:['Estado de bandas inválido.']};
  const checkMembers=(members,share)=>Array.isArray(members)&&members.length<=5&&members.every(m=>m&&typeof m.id==='string'&&typeof m.name==='string'&&role(m.role)&&Number.isFinite(m.share)&&m.share>0&&m.share<1)&&new Set(members.map(m=>m.id)).size===members.length&&Number.isFinite(share)&&share>0&&share<=1&&Math.abs(members.reduce((n,m)=>n+m.share,share)-1)<.000001;
  if(b.active){const g=b.active;if(typeof g.id!=='string'||typeof g.name!=='string'||!g.name||g.name.length>48||!type(g.type)||!role(g.playerRole)||!['forming','active'].includes(g.status)||!checkMembers(g.members,g.playerShare)||g.status!==(g.members.length?'active':'forming')||g.members.length+1>type(g.type).maxMembers||g.members.some(m=>!Number.isFinite(m.skill)||m.skill<0||m.skill>100)||!Number.isFinite(g.cohesion)||g.cohesion<0||g.cohesion>100||!Number.isInteger(g.nextRehearsalWeek)||!Number.isInteger(g.missedCommitments)||g.missedCommitments<0||!Number.isInteger(g.rehearsals)||g.rehearsals<0)errors.push('Formación de banda inválida.');}
  for(const o of b.offers)if(!o||typeof o.id!=='string'||typeof o.name!=='string'||!type(o.type)||!role(o.role)||!['audition','invitation'].includes(o.kind)||!['open','planned','qualified','accepted','rejected','expired','failed'].includes(o.status)||!checkMembers(o.members,o.playerShare)||!Number.isInteger(o.offeredWeek)||!Number.isInteger(o.expiresWeek)||o.expiresWeek<o.offeredWeek||!Number.isFinite(o.minSkill)||!Number.isFinite(o.minReputation))errors.push('Invitación de grupo inválida.');
  if(new Set(b.offers.map(o=>o?.id)).size!==b.offers.length)errors.push('Invitaciones duplicadas.');
  if(Object.keys(b.recruiting).length>PEOPLE.length||Object.entries(b.recruiting).some(([id,w])=>!member(id)||!Number.isInteger(w)||w<1))errors.push('Agenda de reclutamiento inválida.');
  const e=b.earnings;if(!Number.isFinite(e.totalMemberEarnings)||e.totalMemberEarnings<0||!Array.isArray(e.groups)||e.groups.length>32||!Array.isArray(e.recent)||e.recent.length>24)errors.push('Repartos de banda inválidos.');
  else if(e.groups.some(g=>!g||typeof g.bandId!=='string'||!Number.isFinite(g.amount)||g.amount<0)||e.recent.some(r=>!r||!Number.isFinite(r.amount)||r.amount<0||!Array.isArray(r.payments)||r.payments.some(p=>!p||!Number.isFinite(p.amount)||p.amount<0)||Math.abs(r.payments.reduce((n,p)=>n+p.amount,0)-r.amount)>.011))errors.push('Reparto de integrantes no conciliado.');
  for(const item of works){if(!item||typeof item!=='object'){errors.push('Obra o sesión inválida.');continue;}if(item.bandTerms!==undefined&&!validTerms(item.bandTerms))errors.push('Acuerdo de grupo inválido.');}
  for(const item of plans){if(!item||typeof item!=='object')continue;if(item.id==='band_audition'&&(typeof item.offerId!=='string'||!b.offers.some(o=>o?.id===item.offerId)))errors.push('Audición de agenda inválida.');if(item.id==='band_rehearsal'&&(typeof item.bandId!=='string'||item.bandId!==b.active?.id))errors.push('Ensayo de agenda inválido.');}
  return{ok:!errors.length,errors};
 }
 const api={ensure,act,resolveAction,canResolveAction,closeWeek,summary,snapshot:summary,projectTerms,modifiers,recordEarnings,validate,validTerms,rules:copy(RULES)};
 root.RapBands=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
