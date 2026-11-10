/* Prospectively operated businesses. All amounts are fictional game dollars.
   Assets remain in s.assets exactly once; this module owns no shadow balance. */
(function(root){
  'use strict';
  const version=1, money=n=>Math.round((Number(n)||0)*100)/100, clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const clone=v=>JSON.parse(JSON.stringify(v));
  const families={
    studio:{name:'Estudios',unit:'sesiones',capacity:10,price:240,variable:75,icon:'studio',description:'Reserva de sesiones, ocupación y calidad del equipo.'},
    rooms:{name:'Salas y equipo',unit:'reservas',capacity:24,price:75,variable:16,icon:'rooms',description:'Reservas cortas y desgaste por utilización.'},
    retail:{name:'Comercio',unit:'ventas',capacity:90,price:30,variable:18,icon:'retail',description:'Inventario real, reposición y ventas limitadas por existencias.'},
    property:{name:'Inmuebles',unit:'unidades ocupadas',capacity:4,price:250,variable:20,icon:'property',description:'Inquilinos, vacancia y mantenimiento del inmueble.'},
    transport:{name:'Transporte',unit:'servicios',capacity:12,price:95,variable:32,icon:'transport',description:'Servicios, combustible y desgaste. No presta el bono de gira mientras trabaja comercialmente.'},
    finance:{name:'Inversiones financieras',unit:'participaciones',capacity:1,price:0,variable:0,icon:'finance',description:'Dividendos y cotización del mercado existente. No vende ni compra posiciones automáticamente.'}
  };
  const locations={neighborhood:{name:'Barrio',demand:.8,cost:.85},circuit:{name:'Circuito de la ciudad',demand:1,cost:1},center:{name:'Centro comercial',demand:1.2,cost:1.35}};
  const staff=[
    {id:'alba',name:'Alba Torres',skill:82,personality:'prudente',salary:260,description:'Cuida el mantenimiento y conserva caja; promoción moderada.'},
    {id:'nico',name:'Nicolás Vega',skill:68,personality:'comercial',salary:220,description:'Busca ocupación; puede gastar promoción sin convertirla en ventas.'},
    {id:'ines',name:'Inés Salas',skill:91,personality:'metódica',salary:350,description:'Mejora la operación y reduce errores; salario elevado.'},
    {id:'leo',name:'Leo Cruz',skill:48,personality:'aprendiz',salary:120,description:'Menor salario y más riesgo de una decisión operativa fallida.'}
  ];
  const preparations=[
    {id:'session',name:'Asistencia de sesión',cost:180,days:14,actions:['record','home_record','produce','management_record'],progressMultiplier:1.08,energyMultiplier:1,description:'Asistente durante una sesión del proyecto elegido. +8% de progreso de esa sesión.'},
    {id:'rehearsal',name:'Preparación técnica',cost:120,days:14,actions:['rehearse','band_rehearsal'],progressMultiplier:1,energyMultiplier:.9,description:'Un técnico prepara el ensayo elegido. Consume un 10% menos de energía.'},
    {id:'shoot',name:'Asistencia de rodaje',cost:160,days:14,actions:['album_video_shoot','video'],progressMultiplier:1,energyMultiplier:.9,description:'Apoyo logístico para un rodaje. Consume un 10% menos de energía.'}
  ];
  const stages={artist:{name:'Artista veterano',goal:'Completar actuaciones y estrenos desde esta elección.',target:6},producer:{name:'Productor residente',goal:'Completar sesiones de grabación o mezcla desde esta elección.',target:12},manager:{name:'Director de carrera',goal:'Completar trabajo real para los artistas representados.',target:12}};
  function hash(text){let n=2166136261;for(const c of String(text)){n^=c.charCodeAt(0);n=Math.imul(n,16777619);}return n>>>0;}
  const roll=(s,u,key)=>hash([u.marketSeed??s.seed??s.career?.seed??0,u.id,s.week,key].join(':'))/4294967296;
  function familyFor(t){if(!t||t.id==='merch')return null;if(t.category==='bolsa')return'finance';if(t.category==='inmueble')return'property';if(['tour_van','used_van','tour_bus','used_motorcycle'].includes(t.id))return'transport';if(['home_studio','commercial_studio','mobile_recording_booth'].includes(t.id))return'studio';if(['rehearsal_rooms','equipment_rental'].includes(t.id))return'rooms';if(t.category==='negocio')return'retail';return null;}
  const templates=h=>h?.catalog||root.RapEngine?.catalog?.investments||[];
  const getTemplate=(s,a,h)=>templates(h).find(t=>t.id===a?.catalogId);
  function ensure(s){if(!s.enterprise)s.enterprise={version,units:[],preparations:[],nextId:1,stage:null,stageArchive:[]};return s.enterprise;}
  function ownsAsset(s,id){return !!s.enterprise?.units?.some(u=>u.assetId===id&&u.status==='active'&&s.week>=u.startsWeek);}
  function unitFor(s,id){return s.enterprise?.units?.find(u=>u.id===id||u.assetId===id);}
  const balance=(s,h)=>Math.max(0,typeof h?.spendable==='function'?h.spendable(s):Number(s.cash)||0);
  function write(s,h,label,amount,category){if(!h||typeof h.ledger!=='function')throw new Error('Enterprise requiere ledger personal explícito.');h.ledger(s,label,money(amount),category,{deductible:true});}
  function spend(s,h,label,amount,category='business'){if(amount<0||!Number.isFinite(amount)||!Number.isSafeInteger(Math.round(amount*100))||balance(s,h)+.001<amount)return false;write(s,h,label,-amount,category);return true;}
  function log(u,s,text,spent=0){u.log.push({week:s.week,day:s.calendar?.day||0,text,spent:money(spent)});u.log=u.log.slice(-40);}
  function paidExpense(u,a,s,amount){u.totalExpenses=money(u.totalExpenses+amount);a.totalExpenses=money(a.totalExpenses+amount);u.paidCosts=u.paidCosts||[];const row=u.paidCosts.find(x=>x.week===s.week);if(row)row.amount=money(row.amount+amount);else u.paidCosts=[...u.paidCosts.slice(-51),{week:s.week,amount:money(amount)}];}
  function capacity(u,t){return Math.max(1,Math.floor(families[u.family].capacity*(t?.id==='building'?1:t?.id==='condo'||t?.id==='compact_flat'? .25:1)*(1+u.expansion*.2)));}
  const ownerMinutes=(u,week)=>(u.ownerUse||[]).find(x=>x.week===week)?.minutes||0;
  function recordOwnerUse(s,assetId,minutes,useId){const u=unitFor(s,assetId);if(!u||!ownsAsset(s,assetId)||!['studio','rooms'].includes(u.family)||!Number.isSafeInteger(minutes)||minutes<=0||minutes>10080)return false;u.ownerUse=u.ownerUse||[];let row=u.ownerUse.find(x=>x.week===s.week);if(!row){row={week:s.week,minutes:0,keys:[]};u.ownerUse.push(row);u.ownerUse=u.ownerUse.slice(-52);}if(useId&&row.keys.includes(String(useId)))return false;row.minutes+=minutes;if(useId)row.keys.push(String(useId));return true;}
  function facilities(s,h){return(s.enterprise?.units||[]).filter(u=>ownsAsset(s,u.assetId)&&u.open&&['studio','rooms'].includes(u.family)).map(u=>{const a=s.assets.find(a=>a.id===u.assetId),t=getTemplate(s,a,h),referenceMinutes=u.family==='studio'?240:120;return{assetId:u.assetId,name:a?.name||'Instalación',family:u.family,referenceMinutes,capacityMinutes:capacity(u,t)*referenceMinutes,ownerMinutes:ownerMinutes(u,s.week)};});}
  function preparationTarget(s,p){if(p.projectId){const project=[...(s.projects||[]),...(s.management?.artists||[]).flatMap(a=>a.projects||[])].find(x=>x.id===p.projectId);return project&&['working','ready'].includes(project.status)?project:null;}return true;}
  function usablePreparation(s,p,item){return p.status==='ready'&&(s.calendar?.day||0)<=p.expiresDay&&p.actionId===item.id&&(!p.projectId||p.projectId===(item.projectId||s.projects?.find(x=>x.status==='working')?.id))&&preparationTarget(s,p);}
  function preparationEffects(s,item){const p=s.enterprise?.preparations?.find(p=>usablePreparation(s,p,item));if(!p)return{progressMultiplier:1,energyMultiplier:1};const d=preparations.find(x=>x.id===p.kind);return{progressMultiplier:d.progressMultiplier,energyMultiplier:d.energyMultiplier,preparationId:p.id};}
  function completePreparation(s,item,completed){if(!completed)return;const hasSnapshot=Object.prototype.hasOwnProperty.call(item,'dailyPreparationId'),p=s.enterprise?.preparations?.find(p=>hasSnapshot?p.id===item.dailyPreparationId&&p.actionId===item.id&&p.status!=='used':usablePreparation(s,p,item));if(p){p.status='used';p.usedDay=s.calendar?.day||0;}recordStage(s,item);}
  function recordStage(s,item){const st=s.enterprise?.stage;if(!st||st.status!=='active')return;const eligible=st.path==='producer'?['record','home_record','produce','management_record']:st.path==='manager'?['management_record','management_promote','management_show','management_release']:['show','release'];if(!eligible.includes(item.id))return;if(item.appointmentId){st.workKeys=st.workKeys||[];if(st.workKeys.includes(item.appointmentId))return;st.workKeys.push(item.appointmentId);}const work=Number.isFinite(item.agendaWorkUnits)&&item.agendaWorkUnits>0?item.agendaWorkUnits:1;st.progress=money(Math.min(st.target,st.progress+work));if(st.progress>=st.target){st.status='completed';st.completedWeek=s.week;}}
  function act(s,p={},h={}){
    if(s.financialHold||s.continuityHold)return{ok:false,message:'Concilia el archivo histórico antes de operar empresas.'};
    const no=message=>({ok:false,message}),yes=message=>({ok:true,message});
    if(p.decision==='adopt'){
      const a=s.assets?.find(x=>x.id===p.assetId),t=getTemplate(s,a,h),family=familyFor(t);
      if(!a||!family)return no('Selecciona un activo propio compatible.');
      if(unitFor(s,a.id))return no('Este activo ya pertenece a la cartera de empresas.');
      if(a.businessOpportunity?.status==='accepted'&&Math.max(a.businessBoostUntil||0,a.businessMaintenanceUntil||0)>=s.week)return no('Espera a que termine la mejora ya pagada antes de cambiar la operación.');
      const e=ensure(s),u={id:'enterprise-'+e.nextId++,assetId:a.id,owner:'personal',family,location:'circuit',tariff:1,expansion:0,condition:100,inventory:0,managerId:null,open:true,status:'active',startsWeek:s.week+(s.activeWeek?1:0),lastClosedWeek:0,automation:{enabled:false,budget:0,reserve:1000,promotion:false,maintenance:false,pricing:false},totalIncome:0,totalExpenses:0,history:[],log:[]};
      u.name=a.name;u.marketSeed=hash([s.rng??s.seed??0,u.id,s.week].join(':'));e.units.push(u);log(u,s,'Operación empresarial autorizada; sustituye la renta y los bonos anteriores desde S'+u.startsWeek+'.');return yes('Empresa incorporada. El activo sigue contando una sola vez; fondos personales.');
    }
    if(p.decision==='prepare'){
      const kind=preparations.find(x=>x.id===p.kind);if(!kind||!kind.actions.includes(p.actionId))return no('Elige un preparativo y una actividad compatibles.');
      if(kind.id==='session'&&!p.projectId)return no('Elige el proyecto al que se reserva la asistencia.');
      if(!preparationTarget(s,p))return no('El proyecto ya no está disponible.');
      if(s.enterprise?.preparations?.some(x=>x.status==='ready'&&(s.calendar?.day||0)<=x.expiresDay&&x.actionId===p.actionId&&(x.projectId||null)===(p.projectId||null)))return no('Ya tienes apoyo reservado para esta actividad y proyecto.');
      if(p.budget!==undefined&&(!Number.isFinite(p.budget)||p.budget<kind.cost))return no('El presupuesto no cubre el servicio.');
      if(!spend(s,h,kind.name,kind.cost,'production'))return no('Caja personal disponible insuficiente.');
      const e=ensure(s),day=s.calendar?.day||0;e.preparations.push({id:'preparation-'+e.nextId++,kind:kind.id,actionId:p.actionId,projectId:p.projectId||null,cost:kind.cost,startsDay:day,expiresDay:day+kind.days,status:'ready'});e.preparations=e.preparations.filter(x=>x.status==='ready').concat(e.preparations.filter(x=>x.status!=='ready').slice(-30));return yes('Servicio reservado para una actividad. Se consume al completarla y vence en '+kind.days+' días.');
    }
    if(p.decision==='stage'){
      if(!stages[p.path])return no('Elige una etapa disponible.');
      if(s.week<53)return no('Las etapas de veterano se abren después del primer año.');
      if(s.enterprise?.stage?.status==='active')return no('Completa o deja tu etapa actual antes de elegir otra.');
      if(p.path==='manager'&&!(s.management?.artists||[]).length)return no('Representa primero a un artista.');
      const e=ensure(s);
      if(e.stage)e.stageArchive=[...e.stageArchive.slice(-11),clone(e.stage)];
      e.stage={path:p.path,startedWeek:s.week,progress:0,target:stages[p.path].target,status:'active'};return yes('Nueva etapa elegida. Sólo cuenta el trabajo que completes desde ahora.');
    }
    if(p.decision==='leaveStage'){if(!s.enterprise?.stage||s.enterprise.stage.status!=='active')return no('No hay etapa activa.');s.enterprise.stage.status='left';s.enterprise.stage.endedWeek=s.week;return yes('Etapa archivada. Tu carrera, contratos y patrimonio continúan.');}
    const u=unitFor(s,p.unitId),a=s.assets?.find(x=>x.id===u?.assetId),t=getTemplate(s,a,h);if(!u||!a||u.status!=='active')return no('Esta empresa ya no está disponible.');
    if(p.decision==='configure'){
      if(u.family==='finance')return no('La cartera financiera usa las cotizaciones y dividendos del mercado; no tiene local ni tarifa comercial.');
      if(p.location!==undefined&&!locations[p.location]||p.tariff!==undefined&&(!Number.isFinite(p.tariff)||p.tariff<.6||p.tariff>1.8)||p.open!==undefined&&typeof p.open!=='boolean')return no('Ubicación, tarifa o estado no válidos.');
      if(p.location&&p.location!==u.location){const cost=money(Math.max(100,t.maintenance*2));if(!spend(s,h,'Traslado operativo · '+a.name,cost))return no('La caja personal no cubre el traslado.');paidExpense(u,a,s,cost);log(u,s,'Traslado a '+locations[p.location].name+'.',cost);u.location=p.location;}
      if(p.tariff!==undefined)u.tariff=p.tariff;if(p.open!==undefined)u.open=p.open;return yes('Operación actualizada para los próximos servicios.');
    }
    if(p.decision==='hire'){
      const manager=staff.find(x=>x.id===p.managerId);if(!manager)return no('Elige un gerente.');
      if(u.family==='finance')return no('Las posiciones financieras no necesitan gerente.');
      if(s.enterprise.units.some(x=>x.status==='active'&&x.managerId===manager.id))return no('Esta persona ya dirige otra empresa.');
      if(!spend(s,h,'Incorporación · '+manager.name,manager.salary))return no('Caja insuficiente para incorporar al gerente.');
      paidExpense(u,a,s,manager.salary);u.managerId=manager.id;log(u,s,'Contratado '+manager.name+' por $'+manager.salary+' semanales. Autonomía conserva su autorización actual.',manager.salary);return yes('Gerente contratado. Su salario se paga semanalmente; la autonomía se autoriza aparte.');
    }
    if(p.decision==='dismiss'){u.managerId=null;u.automation.enabled=false;log(u,s,'Gerencia terminada y automatización desactivada.');return yes('Gerencia terminada; no se harán encargos automáticos.');}
    if(p.decision==='delegate'){
      const d=p.policy;if(!d||typeof d.enabled!=='boolean'||!Number.isFinite(d.budget)||d.budget<0||!Number.isSafeInteger(Math.round(d.budget*100))||!Number.isFinite(d.reserve)||d.reserve<0||!Number.isSafeInteger(Math.round(d.reserve*100))||['promotion','maintenance','pricing'].some(k=>typeof d[k]!=='boolean'))return no('Define autorización, presupuesto, reserva y tareas.');
      if(d.enabled&&!u.managerId)return no('Contrata primero un gerente.');u.automation={enabled:d.enabled,budget:money(d.budget),reserve:money(d.reserve),promotion:d.promotion,maintenance:d.maintenance,pricing:d.pricing};log(u,s,d.enabled?'Autonomía autorizada dentro del presupuesto y la reserva.':'Autonomía desactivada.');return yes('Límites guardados. Salario y operación base se muestran aparte; no se contratará deuda ni venderán activos o derechos.');
    }
    if(p.decision==='invest'){
      if(u.family==='finance')return no('Compra participaciones desde el mercado existente.');
      const cost=money(Math.max(500,t.cost*.06)*(1+u.expansion*.4));if(p.budget!==undefined&&(!Number.isFinite(p.budget)||p.budget<cost))return no('El presupuesto no cubre esta ampliación.');
      if(!spend(s,h,'Ampliación · '+a.name,cost,'investment'))return no('Caja insuficiente para ampliar.');u.expansion++;a.costBasis=money(a.costBasis+cost);a.value=money(a.value+cost/Math.max(1,a.quantity));log(u,s,'Ampliación de capacidad. Su demanda no está garantizada.',cost);return yes('Capacidad ampliada. La inversión está incluida en el valor del mismo activo.');
    }
    if(p.decision==='stock'){
      if(u.family!=='retail'||!Number.isSafeInteger(p.quantity)||p.quantity<1||p.quantity>1000000)return no('Elige una cantidad válida para un comercio.');
      const cost=money(p.quantity*families.retail.variable);if(!spend(s,h,'Mercancía · '+a.name,cost,'business'))return no('Caja insuficiente para comprar existencias.');u.inventory+=p.quantity;paidExpense(u,a,s,cost);log(u,s,'Entraron '+p.quantity+' unidades de mercancía.',cost);return yes('Existencias compradas. Se venderán sólo si hay demanda.');
    }
    if(p.decision==='repair'){
      if(u.family==='finance')return no('Una posición financiera no necesita reparación.');const cost=money((100-u.condition)*Math.max(2,t.maintenance/10));if(!cost)return no('La instalación está en buen estado.');if(!spend(s,h,'Mantenimiento preventivo · '+a.name,cost,'maintenance'))return no('Caja insuficiente para reparar.');u.condition=100;paidExpense(u,a,s,cost);log(u,s,'Estado operativo restaurado.',cost);return yes('Mantenimiento completado.');
    }
    return no('Decisión empresarial no disponible.');
  }
  function closeWeek(s,h,report={},options=null){
    const e=s.enterprise;if(!e)return;for(const p of e.preparations)if(p.status==='ready'&&(s.calendar?.day||0)>p.expiresDay)p.status='expired';
    const fraction=options?clamp(options.fraction,0,1):1;
    for(const u of e.units){if(options&&u.assetId!==options.assetId||u.status!=='active'||u.startsWeek>s.week||u.lastClosedWeek>=s.week)continue;const a=s.assets?.find(x=>x.id===u.assetId),t=getTemplate(s,a,h);if(!a||!t){u.status='sold';u.managerId=null;u.automation.enabled=false;continue;}
      const f=families[u.family],manager=staff.find(x=>x.id===u.managerId),loc=locations[u.location],quantity=Math.max(1,a.quantity),before=a.value;let income=0,expense=0,spendAuto=0,promotion=1,error=false,services=0;
      const debit=(label,cost,category='business')=>{cost=money(cost);if(!cost)return;write(s,h,label,-cost,category);expense=money(expense+cost);};
      const committed=money((u.family==='finance'?0:t.maintenance*quantity*loc.cost*(u.open?1:.35)*(1+u.expansion*.12))+(manager?.salary||0)+(u.family==='retail'||u.family==='finance'?0:capacity(u,t)*quantity*f.variable));
      const d=u.automation,autoCan=cost=>d.enabled&&manager&&spendAuto+cost<=d.budget+.001&&balance(s,h)-cost-committed>=d.reserve;
      if(!options&&d.enabled&&manager&&u.open){
        if(d.maintenance&&u.condition<85){const cost=money((100-u.condition)*Math.max(2,t.maintenance/10));if(autoCan(cost)){debit('Gerencia · mantenimiento '+a.name,cost,'maintenance');spendAuto=money(spendAuto+cost);u.condition=100;log(u,s,'Gerente completó mantenimiento autorizado.',cost);}else log(u,s,'Mantenimiento omitido por límite o reserva.');}
        if(d.promotion&&u.family!=='finance'){const cost=money(Math.max(25,t.maintenance*.2));if(autoCan(cost)){debit('Gerencia · promoción '+a.name,cost,'promotion');spendAuto=money(spendAuto+cost);error=roll(s,u,'manager-error')>(.7+manager.skill*.0025);promotion=error?1:1.08+manager.skill/1000;log(u,s,error?'La promoción autorizada no produjo nueva demanda.':'Gerencia amplió la demanda con promoción autorizada.',cost);}else log(u,s,'Promoción omitida por límite o reserva.');}
        if(d.pricing){const old=u.tariff;u.tariff=money(clamp(u.tariff+(manager.personality==='comercial'?.04:-.02),.6,1.8));log(u,s,'Gerente ajustó la tarifa de '+Math.round(old*100)+'% a '+Math.round(u.tariff*100)+'% dentro del mandato.');}
      }
      if(u.family==='finance'){
        if(!options)a.value=money(s.marketPrices?.[t.id]??a.value);income=money(t.rent*quantity*fraction);services=quantity;
      }else{
        const cap=capacity(u,t)*quantity,ownUnits=['studio','rooms'].includes(u.family)?ownerMinutes(u,s.week)/(u.family==='studio'?240:120):0,available=Math.max(0,cap-ownUnits),quality=.65+u.condition/300+(manager?manager.skill/1000:0),demand=clamp((.4+roll(s,u,'demand')*.55)*loc.demand*quality*promotion*Math.pow(u.tariff,-1.3),0,1);
        services=u.open?Math.floor(available*demand*fraction):0;
        if(u.family==='retail')services=Math.min(services,u.inventory);
        if(u.family==='property'){services=u.open?Math.min(cap,Math.floor(cap*clamp(.55+roll(s,u,'tenancy')*.55-.2*(u.tariff-1),0,1))):0;}
        if(u.condition<35){services=Math.floor(services*.5);log(u,s,'El mal estado redujo la actividad; revisa mantenimiento.');}
        if(u.family==='retail')u.inventory-=services;
        income=money(services*f.price*u.tariff*(u.family==='property'?fraction:1));
        if(u.family!=='retail')debit('Costes variables · '+a.name,services*f.variable*(u.family==='property'?fraction:1));
        const maintenance=money(t.maintenance*quantity*loc.cost*(u.open?1:.35)*(1+u.expansion*.12)*fraction);debit('Mantenimiento · '+a.name,maintenance,'maintenance');
        if(u.open)u.condition=money(clamp(u.condition-((u.family==='transport'?2.5:u.family==='rooms'?1.8:.8)+(services+ownUnits)/Math.max(1,cap))*fraction,0,100));
        if(!options)a.value=money(Math.max(t.cost*.1,a.value*(1-(t.depreciation||0)*(u.open?1:.6))));
      }
      if(manager)debit('Salario · '+manager.name,manager.salary*fraction,'team');
      if(income)write(s,h,'Ventas · '+a.name,income,'rent');a.totalIncome=money(a.totalIncome+income);a.totalExpenses=money(a.totalExpenses+expense);u.totalIncome=money(u.totalIncome+income);u.totalExpenses=money(u.totalExpenses+expense);
      const prepaid=money((u.paidCosts||[]).filter(x=>x.week===s.week).reduce((n,x)=>n+x.amount,0)),record={week:s.week,services,income,expenses:money(expense+prepaid),net:money(income-expense-prepaid),condition:u.condition,inventory:u.inventory,autoSpent:spendAuto,error,tariff:u.tariff,partial:!!options,ownerMinutes:ownerMinutes(u,s.week)};u.history=[...u.history.slice(-51),record];u.lastClosedWeek=s.week;
      a.lastOperation={week:s.week,mode:u.open?'standard':'paused',vehicleMode:u.family==='transport'?'active':a.vehicleMode||'active',income,expenses:record.expenses,maintenance:money(t.maintenance*quantity*loc.cost*(u.open?1:.35)*fraction),repair:0,opportunityCost:prepaid,net:record.net,valueChange:money((a.value-before)*quantity)};a.operationHistory=[...(a.operationHistory||[]).slice(-25),clone(a.lastOperation)];a.pendingOperatingCosts=0;
      report.assetIncome=money((report.assetIncome||0)+income);report.assetChange=money((report.assetChange||0)+(a.value-before)*quantity);report.highlights=report.highlights||[];if(record.net<0)report.highlights.push(a.name+' cerró con pérdida operativa de $'+Math.abs(record.net)+'.');
    }
  }
  function inventoryValue(s){return money((s.enterprise?.units||[]).filter(u=>u.status==='active').reduce((n,u)=>n+u.inventory*families.retail.variable*.5,0));}
  function inventoryBookValue(s){return money((s.enterprise?.units||[]).filter(u=>u.status==='active').reduce((n,u)=>n+u.inventory*families.retail.variable,0));}
  function beforeSale(s,assetId,h,report){const u=unitFor(s,assetId);if(!u||u.status!=='active')return{ok:true};const fraction=clamp(((s.calendar?.dayOfWeek||0)+(s.calendar?.minute||0)/1440)/7,0,1);if(u.startsWeek<=s.week)closeWeek(s,h,report||s.activeWeek?.report||{}, {assetId,fraction});if(u.inventory){const recovered=money(u.inventory*families.retail.variable*.5);write(s,h,'Liquidación de existencias · '+u.inventory+' unidades',recovered,'business');u.totalIncome=money(u.totalIncome+recovered);const a=s.assets?.find(a=>a.id===assetId);if(a)a.totalIncome=money(a.totalIncome+recovered);u.inventory=0;log(u,s,'Existencias liquidadas al 50% de su coste. Ingreso $'+recovered+'.');}u.status='sold';u.managerId=null;u.automation.enabled=false;log(u,s,'Venta autorizada por el propietario; operación liquidada hasta esta fecha.');return{ok:true};}
  function summary(s,h){const e=s.enterprise;return{version,owner:'personal',families:clone(families),locations:clone(locations),staff:clone(staff),preparationsCatalog:clone(preparations),stages:clone(stages),stage:clone(e?.stage||null),stageArchive:clone(e?.stageArchive||[]),preparations:clone(e?.preparations||[]),units:(e?.units||[]).map(u=>{const a=s.assets?.find(x=>x.id===u.assetId),t=getTemplate(s,a,h),cap=capacity(u,t)*Math.max(1,a?.quantity||1),own=ownerMinutes(u,s.week);return{...clone(u),name:a?.name||'Activo vendido',capacity:cap,ownerMinutes:own,availableCapacity:Math.max(0,cap-(['studio','rooms'].includes(u.family)?own/(u.family==='studio'?240:120):0)),value:money((a?.value||0)*(a?.quantity||1)),maintenance:money((t?.maintenance||0)*(a?.quantity||1)*locations[u.location].cost*(u.open?1:.35)*(1+u.expansion*.12)),salary:staff.find(x=>x.id===u.managerId)?.salary||0,expansionCost:money(Math.max(500,(t?.cost||0)*.06)*(1+u.expansion*.4)),repairCost:money((100-u.condition)*Math.max(2,(t?.maintenance||0)/10))};}),eligible:(s.assets||[]).filter(a=>familyFor(getTemplate(s,a,h))&&!unitFor(s,a.id)).map(a=>({assetId:a.id,name:a.name,family:familyFor(getTemplate(s,a,h))}))};}
  function validate(s){const e=s.enterprise;if(e===undefined)return[];const err=['Cartera empresarial inválida.'];if(!e||e.version!==version||!Array.isArray(e.units)||!Array.isArray(e.preparations)||!Number.isSafeInteger(e.nextId)||e.nextId<1||!Array.isArray(e.stageArchive)||e.stageArchive.length>12)return err;const ids=new Set(),assets=new Set(),managers=new Set();for(const u of e.units){if(!u||typeof u.id!=='string'||ids.has(u.id)||typeof u.assetId!=='string'||assets.has(u.assetId)||!families[u.family]||u.owner!=='personal'||!locations[u.location]||!['active','sold'].includes(u.status)||typeof u.open!=='boolean'||!Number.isFinite(u.tariff)||u.tariff<.6||u.tariff>1.8||!Number.isSafeInteger(u.expansion)||u.expansion<0||!Number.isFinite(u.condition)||u.condition<0||u.condition>100||!Number.isSafeInteger(u.inventory)||u.inventory<0||!Number.isInteger(u.startsWeek)||u.startsWeek<1||!Number.isInteger(u.lastClosedWeek)||u.lastClosedWeek<0||u.lastClosedWeek>s.week||['totalIncome','totalExpenses'].some(k=>!Number.isFinite(u[k])||u[k]<0)||!Array.isArray(u.history)||u.history.length>52||!Array.isArray(u.log)||u.log.length>40)return err;ids.add(u.id);assets.add(u.assetId);if(u.managerId!==null){if(!staff.some(x=>x.id===u.managerId)||managers.has(u.managerId))return err;managers.add(u.managerId);}const d=u.automation;if(!d||['enabled','promotion','maintenance','pricing'].some(k=>typeof d[k]!=='boolean')||['budget','reserve'].some(k=>!Number.isFinite(d[k])||d[k]<0)||d.enabled&&!u.managerId)return err;let last=0;for(const row of u.history){if(!row||!Number.isInteger(row.week)||row.week<=last||row.week>u.lastClosedWeek||['income','expenses','autoSpent'].some(k=>!Number.isFinite(row[k])||row[k]<0)||Math.abs(row.net-money(row.income-row.expenses))>.001)return err;last=row.week;}}
    for(const u of e.units){if(u.marketSeed!==undefined&&(!Number.isInteger(u.marketSeed)||u.marketSeed<0||u.marketSeed>4294967295))return err;if(u.ownerUse!==undefined&&(!Array.isArray(u.ownerUse)||u.ownerUse.length>52||u.ownerUse.some(r=>!r||!Number.isInteger(r.week)||r.week<1||r.week>s.week||!Number.isSafeInteger(r.minutes)||r.minutes<0||!Array.isArray(r.keys)||r.keys.some(k=>typeof k!=='string')||new Set(r.keys).size!==r.keys.length)))return err;if(u.paidCosts!==undefined&&(!Array.isArray(u.paidCosts)||u.paidCosts.length>200||u.paidCosts.some(p=>!p||!Number.isInteger(p.week)||p.week<1||p.week>s.week||!Number.isFinite(p.amount)||p.amount<0)))return err;if(u.log.some(row=>!row||!Number.isInteger(row.week)||row.week<1||row.week>s.week||!Number.isInteger(row.day)||row.day<0||typeof row.text!=='string'||!Number.isFinite(row.spent)||row.spent<0))return err;}
    const prepIds=new Set();for(const p of e.preparations){const k=preparations.find(x=>x.id===p?.kind);if(!k||!k.actions.includes(p.actionId)||!['ready','used','expired'].includes(p.status)||!Number.isInteger(p.startsDay)||p.startsDay<0||p.expiresDay!==p.startsDay+k.days||p.cost!==k.cost||typeof p.id!=='string'||prepIds.has(p.id)||p.projectId!==null&&typeof p.projectId!=='string')return err;prepIds.add(p.id);}
    for(const st of [e.stage,...e.stageArchive].filter(Boolean))if(!stages[st.path]||!['active','completed','left'].includes(st.status)||!Number.isFinite(st.progress)||st.progress<0||st.progress>st.target||st.target!==stages[st.path].target||!Number.isInteger(st.startedWeek)||st.startedWeek<1||st.workKeys!==undefined&&(!Array.isArray(st.workKeys)||st.workKeys.length>100||st.workKeys.some(k=>typeof k!=='string')||new Set(st.workKeys).size!==st.workKeys.length))return err;return[];}
  const api={version,families,locations,staff,preparations,stages,ensure,act,summary,closeWeek,validate,ownsAsset,familyFor,preparationEffects,completePreparation,beforeSale,inventoryValue,inventoryBookValue,recordOwnerUse,facilities};root.RapEnterprise=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof globalThis!=='undefined'?globalThis:this);
