(function(root){
 'use strict';
 // Minute mode advances fixed integer game minutes, independent of animation.
 // Late callbacks never catch up. New clocks start paused at a playable pace.
 const speedPresets=[
  {speed:1/60,label:'x1 · 1 día / 60 s',pace:'1 día de juego cada 60 segundos'},
  {speed:1/20,label:'x3 · 1 día / 20 s',pace:'1 día de juego cada 20 segundos'},
  {speed:1/6,label:'x10 · 1 día / 6 s',pace:'1 día de juego cada 6 segundos'},
  {speed:1,label:'Rápido · 1 día / s',pace:'1 día de juego por segundo'},
  {speed:3,label:'Rápido · 3 días / s',pace:'3 días de juego por segundo'},
  {speed:7,label:'Rápido · 1 semana / s',pace:'1 semana de juego por segundo'}
 ];
 const defaultSpeed=1/60;
 function speedLabel(speed){return speedPresets.find(p=>p.speed===speed)?.label||(speed===.1?'1 día / 10 s':String(speed)+' días / s');}
 function paceLabel(speed){return speedPresets.find(p=>p.speed===speed)?.pace||(speed===.1?'1 día de juego cada 10 segundos':speedLabel(speed));}
 const periods=['day','week','month','quarter','year','continuous','until'];
 const dayMs=86400000;
 function parseDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;
  const time=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(time)&&new Date(time).toISOString().slice(0,10)===value?time:null;
 }
 function addMonths(date,count){
  const time=parseDate(date);if(time===null)return null;
  const from=new Date(time),month=from.getUTCMonth()+count,year=from.getUTCFullYear()+Math.floor(month/12),m=month%12;
  if(year<0||year>9999)return null;
  const last=new Date(0);last.setUTCHours(0,0,0,0);last.setUTCFullYear(year,m+1,0);
  const target=new Date(0);target.setUTCHours(0,0,0,0);target.setUTCFullYear(year,m,Math.min(from.getUTCDate(),last.getUTCDate()));
  return target.toISOString().slice(0,10);
 }
 function periodTarget(options={}){
  if(!options||typeof options!=='object'||Array.isArray(options))return{ok:false,message:'Elige un período válido.'};
  const {period='week',currentDay,currentDate,untilDate}=options;
  if(!periods.includes(period))return{ok:false,message:'Elige un período válido.'};
  const from=parseDate(currentDate);
  if(!Number.isSafeInteger(currentDay)||currentDay<0||from===null)return{ok:false,message:'La fecha actual del juego no es válida.'};
  let days=null,targetDate=null;
  if(period==='day')days=1;
  else if(period==='week')days=7-currentDay%7;
  else if(['month','quarter','year'].includes(period)){
   targetDate=addMonths(currentDate,({month:1,quarter:3,year:12})[period]);
   if(!targetDate)return{ok:false,message:'La fecha objetivo está fuera del calendario disponible.'};
   days=Math.round((parseDate(targetDate)-from)/dayMs);
  }else if(period==='until'){
   const until=parseDate(untilDate);
   if(until===null||until<=from)return{ok:false,message:'Elige una fecha posterior a la fecha actual del juego.'};
   targetDate=untilDate;days=Math.round((until-from)/dayMs);
  }
  if(days!==null&&!targetDate){const time=from+days*dayMs;targetDate=new Date(time).toISOString().slice(0,10);if(parseDate(targetDate)===null)return{ok:false,message:'La fecha objetivo está fuera del calendario disponible.'};}
  const targetDay=days===null?null:currentDay+days;
  if(targetDay!==null&&!Number.isSafeInteger(targetDay))return{ok:false,message:'El día objetivo está fuera del calendario disponible.'};
  return{ok:true,period,startDay:currentDay,startDate:currentDate,targetDay,targetDate,days};
 }
 function create({step,onChange=()=>{},onError=()=>{},onStop=()=>{},schedule=setTimeout,cancel=clearTimeout,baseMs=5000,minuteMode=false,tickMs=100,now=()=>typeof performance!=='undefined'?performance.now():Date.now()}){
  let playing=false,speed=minuteMode?defaultSpeed:1,timer=null,generation=0,session=0,configured=false,period=minuteMode?'continuous':'week',startDay=null,startDate=null,targetDay=null,targetDate=null,currentDay=null,currentMinute=null,targetMinute=null,minuteCarry=0,completedDays=0,completedWeeks=0,pauseReason='idle',periodComplete=false;
  const state=()=>({playing,speed,daysPerSecond:minuteMode?speed:speed*1000/baseMs,minuteMode,msPerDay:minuteMode?1000/speed:baseMs/speed,configured,period,startDay,startDate,targetDay,targetDate,currentDay,currentMinute,targetMinute,completedDays,completedWeeks,pauseReason,periodComplete});
  function pause(reason='manual'){playing=false;generation++;if(timer!==null)cancel(timer);timer=null;pauseReason=reason;onChange(state());}
  function finish(reason,result,error){pause(reason);onStop({reason,state:state(),result,...(error?{error}:{})});}
  function configure(options){
   const next=periodTarget(options);if(!next.ok)return next;
   if(minuteMode&&options.currentMinute!==undefined&&(!Number.isSafeInteger(options.currentMinute)||Math.floor(options.currentMinute/1440)!==options.currentDay))return{ok:false,message:'Minuto actual inválido.'};
   pause('ready');session++;configured=true;period=next.period;startDay=next.startDay;startDate=next.startDate;targetDay=next.targetDay;targetDate=next.targetDate;currentDay=startDay;currentMinute=minuteMode?(options.currentMinute??startDay*1440):null;targetMinute=minuteMode&&targetDay!==null?targetDay*1440:null;minuteCarry=0;completedDays=0;completedWeeks=0;periodComplete=false;onChange(state());
   return{ok:true,state:state()};
  }
  function queue(delay){
   const token=generation,run=session;let fired=false;
   timer=schedule(()=>{
    // A canceled callback must not erase the current timer reference.
    if(fired||!playing||token!==generation)return;fired=true;
    timer=null;let result;const started=now(),rawMinutes=1440*speed*tickMs/1000+minuteCarry,wholeMinutes=Math.floor(rawMinutes+1e-9),minutes=minuteMode?Math.min(wholeMinutes,targetMinute===null?Infinity:Math.max(0,targetMinute-(currentMinute||0))):undefined;if(minuteMode)minuteCarry=Math.max(0,rawMinutes-wholeMinutes);
    try{result=step(minutes);}catch(error){finish('error',null,error);onError(error);return;}
    if(run!==session)return;
    if(!result||result.ok===false){finish(result?.stopReason||'blocked',result);return;}
    if(minuteMode){currentMinute=Number.isSafeInteger(result.minute)?result.minute:(currentMinute||0)+minutes;currentDay=Math.floor(currentMinute/1440);}else currentDay=Number.isSafeInteger(result.day)?result.day+1:(currentDay===null?completedDays+1:currentDay+1);
    completedDays=configured?Math.max(0,currentDay-startDay):completedDays+1;
    if(Array.isArray(result.weekReports))completedWeeks+=result.weekReports.length;else if(result.weekClosed)completedWeeks++;
    periodComplete=configured&&targetDay!==null&&currentDay>=targetDay;
    if(!playing){onChange(state());return;}
    if(result.stopReason){finish(result.stopReason,result);return;}
    if(periodComplete){finish('period',result);return;}
    if(!configured&&result.weekClosed){finish('week',result);return;}
    onChange(state());
    if(playing&&token===generation)queue(minuteMode?Math.max(0,tickMs-(now()-started)):undefined);
   },delay??(minuteMode?tickMs:baseMs/speed));
  }
  function play(){
   if(playing)return{ok:true};
   if(periodComplete)return{ok:false,message:'El período terminó. Elige un nuevo tramo para continuar.'};
   playing=true;pauseReason=null;generation++;onChange(state());queue();return{ok:true};
  }
  function setSpeed(value){if(!(minuteMode?[...speedPresets.map(p=>p.speed),.1]:[1,4,12]).includes(Number(value)))return;speed=Number(value);if(playing){generation++;if(timer!==null)cancel(timer);timer=null;queue();}onChange(state());}
  return{state,play,pause,setSpeed,configure,destroy:pause};
 }
 root.RapSimulationClock={create,periodTarget,speedPresets,defaultSpeed,speedLabel,paceLabel};
 if(typeof module!=='undefined'&&module.exports)module.exports=root.RapSimulationClock;
})(globalThis);
