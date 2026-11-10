(function (root) {
  'use strict';
  // A read-only camera on the fixed-day simulation. It owns no timers, effects,
  // random stream, action execution, or save fields.
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const activityMap = { album_video_shoot:'perform',management_record:'record',management_promote:'social',management_release:'produce',management_show:'perform',band_audition:'perform', band_rehearsal:'rehearse', record: 'record', home_record: 'record', collab: 'record', rehearse: 'rehearse', show: 'perform', street: 'perform', produce: 'produce', release: 'produce', write: 'write', business: 'write', rest: 'rest', dayjob: 'work', employment_shift:'work', fanclub: 'work', social: 'social', interview: 'social', network: 'social', video: 'social' };
  const activityNames = { record: 'Sesión de grabación', rehearse: 'Ensayo', perform: 'En el escenario', produce: 'Mesa de producción', write: 'Una idea toma forma', rest: 'Descanso planificado', work: 'Jornada de trabajo', social: 'Conectar con el público', idle: 'Sin cita hoy', blocked: 'La actividad está en espera' };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
  const copy = value => value == null ? null : JSON.parse(JSON.stringify(value));
  const fmt = value => finite(value).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  function genreOf(style) { const value = String(style || '').toLowerCase(); return /metal/.test(value) ? 'metal' : /rock|punk/.test(value) ? 'rock' : /reggae|dancehall|ska/.test(value) ? 'reggae' : /pop|soul|r&b/.test(value) ? 'pop' : 'hiphop'; }
  function sceneActionLabel(s, item) {
    if (!item) return '';
    const genre=genreOf(s.player?.style), names=genre==='hiphop'?{}:{write:'Componer canciones',street:genre==='reggae'?'Jam y comunidad':'Tocar en la escena',collab:'Sesión con otros artistas'};
    return names[item.id] || item.label || activityNames[activityMap[item.id]] || '';
  }
  function find(list, id) { return Array.isArray(list) ? list.find(item => item && item.id === id) : null; }
  function hasStudio(s, catalog) { return (s.assets || []).some(asset => find(catalog?.investments, asset.catalogId)?.bonus === 'studio'); }
  function venueFor(item, catalog) { return ['show','management_show'].includes(item?.id) ? find(catalog?.venues, item.venueId) : null; }
  function venueGrade(capacity) { return capacity > 30000 ? 'stadium' : capacity > 10000 ? 'arena' : capacity > 1500 ? 'theater' : capacity > 250 ? 'club' : 'small'; }
  function placeLabel(place) { const name = String(place.name || ''), city = String(place.city || ''); return city && !name.toLocaleLowerCase().includes(city.toLocaleLowerCase()) ? name + ' · ' + city : name; }
  const roleNames={voice:'Voz',rapper:'MC',guitar:'Guitarra',bass:'Bajo',drums:'Batería',keys:'Teclas',producer:'Producción',manager:'Mánager'};
  function ensembleFor(s,item) {
    if(!item&&s.management?.role==='manager')return{source:'management',name:'Tu oficina',groupId:null,managedArtistId:null,projectId:null,projectName:null,frozen:false,members:[{id:'player',name:s.player?.name||'Tu mánager',role:'manager',isPlayer:true,appearance:{...(s.player?.appearance||{})}}]};
    if(String(item?.id||'').startsWith('management_')||item?.id==='album_video_shoot'&&item.artistId!=='player'){
      const artist=find(s.management?.artists,item.artistId),project=artist?find(artist.projects,item.projectId):null,manager={id:'player',name:s.player?.name||'Tu mánager',role:'manager',isPlayer:true,appearance:{...(s.player?.appearance||{})}},genre=genreOf(artist?.style);
      const members=[manager];if(artist)members.push({id:String(artist.id),name:artist.name,role:genre==='hiphop'?'rapper':['rock','metal','reggae'].includes(genre)?'guitar':'voice',isPlayer:false,appearance:copy(artist.appearance||{})});
      return{source:'management',name:artist?.name||'Tu oficina',groupId:null,managedArtistId:artist?.id||null,projectId:project?.id||null,projectName:project?.name||null,frozen:false,members,genre};
    }
    let terms=null,source='solo',frozen=false,project=null;
    const active=s.bands?.active;
    if(item?.id==='show'&&item.bandTerms){terms=item.bandTerms;source='show';frozen=true;}
    else if(item?.id==='band_rehearsal'&&active&&(!item.bandId||active.id===item.bandId)){terms=active;source='active';}
    else if(item?.id==='band_audition') {const offer=find(s.bands?.offers,item.offerId);if(offer){terms={...offer,playerRole:offer.role};source='audition';}}
    else if(['write','home_record','record','produce','collab','release','album_video_shoot'].includes(item?.id)){
      const projectId=item.id==='collab'?null:item.projectId;
      project=['release','album_video_shoot'].includes(item.id)?find(s.projects,projectId):(s.projects||[]).find(p=>p&&p.status==='working'&&(!projectId||p.id===projectId));
      if(item.id==='album_video_shoot'&&!project){const video=find(s.musicVideos,item.videoId),release=find(s.releases,video?.releaseId);if(release){project=release;if(release.bandTerms){terms=release.bandTerms;source='project';frozen=true;}}}
      if(project?.bandTerms){terms=project.bandTerms;source='project';frozen=true;}
    } else if(!item&&active){terms=active;source='active';}
    const player={id:'player',name:s.player?.name||'Tu artista',role:terms?.playerRole||null,isPlayer:true,appearance:{...(s.player?.appearance||{})}};
    const members=[player];
    if(terms)for(const member of (terms.members||[]).filter(m=>m&&m.id!=='player').slice(0,5))members.push({id:String(member.id),name:member.name||'Integrante',role:member.role||'voice',isPlayer:false,appearance:root.RapActivityActor?.memberAppearance?.(s,member)||{}});
    return {source,name:terms?.name||player.name,groupId:terms?.bandId||terms?.id||null,projectId:project?.id||null,projectName:project?.name||null,frozen,members};
  }
  function placeFor(s, item, catalog) {
    const id = item?.id, venue = venueFor(item, catalog), city = s.player?.city || s.player?.origin?.split(',')[0] || 'Tu ciudad';
    if(!item&&s.management?.role==='manager')return{key:'workshop',name:'Tu oficina',city,grade:null,capacity:null};
    if (venue) return { key: 'venue', name: item.venueName || venue.name, city: item.venueCity || venue.city || city, grade: venueGrade(venue.capacity), capacity: venue.capacity };
    if (id === 'album_video_shoot') return {key:'film',name:'El set del videoclip',city,grade:null,capacity:null};
    if (id === 'street') return { key: 'street', name: 'El circuito de tu barrio', city, grade: 'small', capacity: null };
    if (['rehearse','band_rehearsal','band_audition'].includes(id)) return { key: 'garage', name: item?.facilityName || 'La sala de ensayo', city, grade: null, capacity: null };
    if (['record', 'produce', 'release', 'collab','management_record','management_release'].includes(id)) return { key: 'studio', name: ['release','management_release'].includes(id) ? 'El estudio · mesa de distribución' : item?.facilityName || 'El estudio', city, grade: null, capacity: null };
    if (id === 'dayjob' || id === 'employment_shift') return { key: 'workshop', name: 'El turno de trabajo', city, grade: null, capacity: null };
    if (id === 'fanclub') return { key: 'workshop', name: 'Tu puesto de venta directa', city, grade: null, capacity: null };
    if (['social', 'video', 'interview', 'network','management_promote'].includes(id)) return { key: 'social', name: id === 'interview' ? 'El rincón de la entrevista' : id==='management_promote'?'La promoción del artista':'Tu rincón creativo', city, grade: null, capacity: null };
    return { key: 'home', name: id === 'home_record' ? 'Tu estudio de habitación' : id === 'write' ? 'La libreta de ideas' : id === 'business' ? 'La mesa de trabajo' : 'Tu casa', city, grade: null, capacity: null };
  }
  function preflight(s, item, catalog) {
    if (s.financialHold || s.continuityHold) return 'Falta conciliar esta carrera antes de reanudar el tiempo.';
    if (!item) return null;
    if(item.id==='album_video_shoot'){const status=root.RapEngine?.musicVideoActionStatus?.(s,item);return status?.ok?null:status?.message||'Comprueba la producción y su autorización antes de rodar.';}
    if(String(item.id||'').startsWith('management_')){const status=root.RapEngine?.managementActionStatus?.(s,item);return status?(status.ok?null:status.message||'Esta sesión de representación no está disponible.'):'El área de representación se está preparando.';}
    if (item.id==='band_audition'||item.id==='band_rehearsal'){const eligibility=root.RapBands?.canResolveAction?.(s,item);if(eligibility&&!eligibility.ok)return eligibility.message||'La formación ya no puede realizar esta sesión.';}
    const venue = venueFor(item, catalog), action = find(catalog?.actions, item.id);
    if (!venue && !action) return 'La actividad no está disponible en esta versión de la carrera.';
    if (item.id === 'release') { const project = find(s.projects, item.projectId); if (!project || project.status !== 'ready') return 'La obra necesita estar terminada para publicarse.'; }
    const energy = item.id === 'show' ? 18 : finite(action?.energy, finite(item.energy));
    const health = item.id === 'show' ? 15 : 12;
    if (energy > 0 && (finite(s.player?.energy) < energy || finite(s.player?.health) < health)) return finite(s.player?.health) < health ? 'La salud actual no permite realizar esta actividad.' : 'Falta energía para realizar esta actividad.';
    let cost = finite(action?.cost, finite(item.cost));
    if(item.id==='release')cost=finite(item.cost,cost);
    if (item.id === 'record' && hasStudio(s, catalog)) cost *= .45;
    if (venue) cost = venue.cost * ((s.assets || []).some(asset => find(catalog?.investments, asset.catalogId)?.bonus === 'tour') ? .8 : 1) + finite(item.travelCost);
    cost = Math.round(Math.max(0, cost) * 100) / 100;
    // Free paid work remains possible when the career has negative cash.
    const mondayDue = s.calendar?.dayOfWeek === 0 && s.activeWeek && !s.activeWeek.mondaySettled ? (s.receivables || []).filter(receipt => !receipt.settled && receipt.dueWeek <= s.week).reduce((sum, receipt) => sum + finite(receipt.amount), 0) : 0;
    const available = (root.RapEngine?.taxSpendable?root.RapEngine.taxSpendable(s):finite(s.cash)) + mondayDue;
    if (cost > 0 && available + .001 < cost) return 'Faltan $' + (cost - available).toLocaleString('es-CO', { maximumFractionDigits: 2 }) + ' de caja para esta actividad.';
    return null;
  }
  function previousResult(s, day) {
    const report = s.pendingDayReport;
    if (!report || !Number.isInteger(report.day) || report.day >= day || report.day < 0) return null;
    const actions = Array.isArray(report.actions) ? report.actions.filter(x => typeof x === 'string').map(label=>sceneActionLabel(s,(root.RapEngine?.catalog?.actions||[]).find(a=>a.label===label)||{label})) : [];
    const results = (s.activeWeek?.actionResults || []).filter(result => result.day === report.day).map(copy);
    const observedActions = actions.length ? actions : results.filter(result => result.status === 'completed').map(result => result.label).filter(label => typeof label === 'string');
    const skipped = results.some(result => result.status === 'skipped');
    const label = observedActions.length ? observedActions.join(' · ') : skipped ? 'La actividad no se pudo realizar' : report.day % 7 === 6 ? 'Semana cerrada · informe disponible' : 'Jornada sin acción de agenda';
    return { day: report.day, date: typeof report.date === 'string' ? report.date : '', week: report.week, dayLabel: dayNames[report.day % 7], actions: observedActions.slice(), actionResults: results, highlights: Array.isArray(report.highlights) ? report.highlights.filter(x => typeof x === 'string').slice() : [], status: skipped ? 'skipped' : observedActions.length ? 'completed' : 'quiet', label, streams: finite(report.streams), units: finite(report.units), income: finite(report.income), expenses: finite(report.expenses), net: finite(report.net), cash: finite(report.cash) };
  }
  function hourlyView(s,actorId='player') {
    const info=root.RapEngine.agendaSummary(s,{fromDay:Math.max(0,s.calendar.day-s.calendar.dayOfWeek),days:14}),minute=info.minute,day=s.calendar.day,weekday=day%7;
    const rows=info.appointments.filter(a=>a.participants.includes(actorId)),appointment=rows.find(a=>a.status==='running'),item=appointment?.item||null;
    const upcoming=rows.find(a=>a.status==='scheduled'),person=actorId==='player'?s.player:find(s.management?.artists,actorId),activity=appointment?(activityMap[item.id]||'idle'):'idle';
    let ensemble=ensembleFor(s,item);
    if(actorId!=='player'){
      const genre=genreOf(person?.style),client={id:actorId,name:person?.name||'Artista',role:genre==='hiphop'?'rapper':['rock','metal','reggae'].includes(genre)?'guitar':'voice',isPlayer:false,appearance:copy(person?.appearance||{})};
      const members=appointment?.participants.includes('player')?[{id:'player',name:s.player.name,role:'manager',isPlayer:true,appearance:copy(s.player.appearance)},client]:[client];
      ensemble={source:'management',name:client.name,managedArtistId:actorId,projectId:item?.projectId||null,members,genre,groupId:null,frozen:false};
    }
    const place=placeFor(s,item,root.RapEngine.catalog),clock=m=>String(Math.floor(m%1440/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
    const weekStart=day-weekday,weekSchedule=dayNames.map((name,i)=>{const dated=rows.filter(a=>Math.floor(a.startMinute/1440)===weekStart+i&&a.status!=='cancelled'),first=dated.find(a=>a.status==='running')||dated.find(a=>a.status==='scheduled')||dated[0];return{index:i,dayOfWeek:i,dayLabel:name,dayShort:dayShort[i],id:first?.actionId||null,label:first?clock(first.startMinute)+' '+first.label+(dated.length>1?' +'+(dated.length-1):''):'Disponible',activity:activityMap[first?.actionId]||'idle',status:first?.status==='running'?'scheduled':first?.status||'free',current:i===weekday,past:i<weekday};});
    const reason=appointment?'Sesión real de '+clock(appointment.startMinute)+' a '+clock(appointment.endMinute)+'. La preparación y la disponibilidad determinan su resultado.':upcoming?'Próxima cita: '+dayNames[Math.floor(upcoming.startMinute/1440)%7]+' '+clock(upcoming.startMinute)+' · '+upcoming.label+'.':'Sin actividad programada. Puedes preparar una sesión mientras corre el reloj.';
    return{activity,label:appointment?.label||'Entre sesiones',place,scheduledAction:copy(item),day,dayOfWeek:weekday,dayLabel:dayNames[weekday],date:s.calendar.date,status:appointment?'scheduled':'idle',reason,weekSchedule,previousResult:previousResult(s,day),genre:genreOf(person?.style),ensemble,appointmentId:appointment?.id||null,progress:appointment?.progress||0,supervised:!!appointment?.participants.includes('player'),nextAppointment:upcoming?{dayOfWeek:Math.floor(upcoming.startMinute/1440)%7,dayShort:dayShort[Math.floor(upcoming.startMinute/1440)%7],label:clock(upcoming.startMinute)+' '+upcoming.label}:null};
  }
  function describe(s) {
    if(s?.agenda?.mode==='hourly')return hourlyView(s);
    if (!s || !s.player) return { activity: 'blocked', label: 'Carga una carrera', place: { key: 'home', name: 'Camerino', city: '', grade: null, capacity: null }, scheduledAction: null, day: 0, dayOfWeek: 0, dayLabel: dayNames[0], date: '', status: 'unavailable', reason: 'No hay una carrera cargada.', weekSchedule: [], previousResult: null, genre: 'hiphop',ensemble:{source:'solo',name:'Tu artista',groupId:null,frozen:false,members:[]} };
    const catalog = root.RapEngine?.catalog || {}, day = Math.max(0, Math.floor(finite(s.calendar?.day))), dayOfWeek = Number.isInteger(s.calendar?.dayOfWeek) ? Math.max(0, Math.min(6, s.calendar.dayOfWeek)) : day % 7;
    const active = !!s.activeWeek, plan = active ? s.activeWeek.lockedPlan || [] : s.plan || [], results = s.activeWeek?.actionResults || [];
    const index = dayOfWeek <= 4 && dayOfWeek % 2 === 0 ? dayOfWeek / 2 : null;
    const item = index === null ? null : plan[index] || null;
    const done = index === null ? null : results.find(result => result.index === index);
    const archive = !!(s.financialHold || s.continuityHold), blocked = active && !done && item ? preflight(s, item, catalog) : null;
    const status = archive ? 'archive' : !active ? 'planning' : done ? done.status : blocked ? 'blocked' : item ? 'scheduled' : 'idle';
    const activity = archive || blocked ? 'blocked' : active && item && !done ? activityMap[item.id] || 'idle' : 'idle';
    const ensemble=ensembleFor(s,item),place = placeFor(s, active && item ? item : null, catalog);
    if(ensemble.members.length>1&&(!active||!item)){Object.assign(place,{key:ensemble.source==='management'?'workshop':'garage',name:ensemble.source==='management'?'La oficina · preparando la sesión':'La sala · antes de empezar'});}
    const reason = archive ? 'Esta carrera espera conciliación. El reloj y las actividades están detenidos.' : blocked || (!active ? 'Elige tu agenda y reproduce la semana cuando estés listo.' : done ? 'La actividad de hoy ya tiene un resultado guardado.' : !item ? dayOfWeek === 6 ? 'Al terminar el domingo se abre el informe y el reloj se detiene.' : 'Hoy no hay una acción en la agenda. La siguiente cita conserva su día.' : 'La acción se resuelve al terminar este día del reloj.');
    const weekSchedule = dayNames.map((dayLabel, weekday) => {
      const actionIndex = weekday <= 4 && weekday % 2 === 0 ? weekday / 2 : null;
      const action = actionIndex === null ? null : plan[actionIndex] || null;
      const result = actionIndex === null ? null : results.find(result => result.index === actionIndex);
      return { index: actionIndex, dayOfWeek: weekday, dayLabel, dayShort: dayShort[weekday], id: action?.id || null, label: sceneActionLabel(s,action) || (weekday === 6 ? 'Cierre de semana' : 'Sin cita'), activity: action ? activityMap[action.id] || 'idle' : 'idle', status: result?.status || (weekday === dayOfWeek && blocked ? 'blocked' : action ? active ? 'scheduled' : 'planned' : 'free'), reason: weekday === dayOfWeek ? blocked : null, current: weekday === dayOfWeek, past: active && weekday < dayOfWeek };
    });
    return { activity, label: blocked ? 'No se puede realizar ' + (sceneActionLabel(s,item) || 'la actividad').toLowerCase() : archive ? 'Continuidad por conciliar' : !active ? 'Tu próxima semana' : item && !done ? sceneActionLabel(s,item) || activityNames[activity] : dayOfWeek === 6 ? 'Domingo · cierre de semana' : activityNames.idle, place, scheduledAction: copy(item), day, dayOfWeek, dayLabel: dayNames[dayOfWeek], date: s.calendar?.date || '', status, reason, weekSchedule, previousResult: previousResult(s, day), genre: genreOf(s.player.style),ensemble };
  }
  // A view of each client's actual appointment, not a parallel simulation. The
  // manager's three shared slots remain Monday/Wednesday/Friday; a client's
  // forthcoming appointment is never presented as work happening today.
  function describeManagerRoster(s, options = {}) {
    if(s?.agenda?.mode==='hourly'){const requested=options.artistId||'all',eligible=(s.management?.artists||[]).filter(a=>a.contract?.status==='active'&&s.week<a.contract.endsWeek||(s.label?.contracts||[]).some(c=>c.artistId===a.id&&c.status==='active'&&s.week<c.endsWeek)),selected=requested==='all'?eligible.slice(0,6):eligible.filter(a=>a.id===requested),clients=selected.map(a=>({...hourlyView(s,a.id),artistId:a.id,name:a.name,cash:a.cash,contractActive:true}));return{day:s.calendar.day,date:s.calendar.date,dayOfWeek:s.calendar.dayOfWeek,dayLabel:dayNames[s.calendar.dayOfWeek],selectedArtistId:requested,selectionValid:requested==='all'||selected.length>0,clients};}
    const base = describe(s), requested = options?.artistId == null ? 'all' : String(options.artistId);
    const artists = Array.isArray(s?.management?.artists) ? s.management.artists.filter(a => a && typeof a.id === 'string') : [];
    const contractActive = a => a.contract?.status === 'active' && finite(s?.week) < finite(a.contract?.endsWeek) || (s.label?.contracts || []).some(c => c.artistId === a.id && c.status === 'active' && s.week >= c.startedWeek && s.week < c.endsWeek);
    const selected = requested === 'all' ? artists.filter(contractActive).slice(0, 6) : artists.filter(a => a.id === requested).slice(0, 1);
    const plan = s?.activeWeek ? s.activeWeek.lockedPlan || [] : s?.plan || [], results = s?.activeWeek?.actionResults || [];
    const current = String(base.scheduledAction?.id || '').startsWith('management_')||base.scheduledAction?.id==='album_video_shoot'&&base.scheduledAction.artistId!=='player' ? base.scheduledAction : null;
    const clients = selected.map(artist => {
      const active = contractActive(artist), today = current?.artistId === artist.id ? current : null;
      const appointments = plan.map((item, index) => ({ item, index, weekday:index*2, result:results.find(r => r.index === index) }))
        .filter(entry => entry.item?.artistId === artist.id && (String(entry.item.id).startsWith('management_')||entry.item.id==='album_video_shoot') && entry.weekday <= 4);
      const next = appointments.find(entry => !entry.result && (!s.activeWeek || entry.weekday >= base.dayOfWeek));
      const status = base.status === 'archive' ? 'archive' : !active ? 'unavailable' : !s.activeWeek ? 'planning' : today ? base.status : 'idle';
      const activity = status === 'archive' || status === 'blocked' ? 'blocked' : status === 'scheduled' && today ? base.activity : 'idle';
      const supervised = !!today && status === 'scheduled' && activity !== 'idle';
      const genre = genreOf(artist.style), project = today ? find(artist.projects,today.projectId) : null;
      const reason = status === 'archive' ? base.reason : !active ? 'La representación no está vigente. Este artista no tiene sesiones bajo tu dirección.' : !s.activeWeek ? 'La agenda está en preparación. Las sesiones empiezan al poner la semana en marcha.' : today ? base.reason : 'Hoy no tiene una sesión en tu agenda compartida. Descansa entre citas.';
      const client = { id:artist.id, name:artist.name || 'Artista', role:genre === 'hiphop' ? 'rapper' : ['rock','metal','reggae'].includes(genre) ? 'guitar' : 'voice', isPlayer:false, appearance:copy(artist.appearance || {}) };
      const members = supervised ? [{id:'player',name:s.player?.name || 'Tu mánager',role:'manager',isPlayer:true,appearance:copy(s.player?.appearance || {})},client] : [client];
      const place = today && s.activeWeek && active ? placeFor(s,today,root.RapEngine?.catalog || {}) : {key:'home',name:'Entre sesiones',city:'',grade:null,capacity:null};
      const label = status === 'blocked' ? 'Sesión en espera' : status === 'archive' ? 'Reloj detenido' : !active ? 'Fuera de representación' : status === 'planning' ? 'Preparando su semana' : status === 'scheduled' ? (today.label || activityNames[activity]) : status === 'completed' ? 'Sesión terminada' : status === 'skipped' ? 'Sesión no realizada' : 'Entre sesiones';
      return {artistId:artist.id,name:client.name,cash:finite(artist.cash),contractActive:active,supervised,activity,status,reason,label,place,genre,scheduledAction:copy(today),projectName:project?.name || null,
        nextAppointment:active && next ? {dayOfWeek:next.weekday,dayLabel:dayNames[next.weekday],dayShort:dayShort[next.weekday],id:next.item.id,label:next.item.label || activityNames[activityMap[next.item.id]],projectId:next.item.projectId || null} : null,
        day:base.day,date:base.date,dayOfWeek:base.dayOfWeek,dayLabel:base.dayLabel,weekSchedule:[],previousResult:null,
        ensemble:{source:'management',name:client.name,groupId:null,managedArtistId:artist.id,projectId:project?.id || null,projectName:project?.name || null,frozen:false,members,genre}};
    });
    return {day:base.day,date:base.date,dayOfWeek:base.dayOfWeek,dayLabel:base.dayLabel,status:base.status,selectedArtistId:requested,currentArtistId:s?.activeWeek && current && !['completed','skipped'].includes(base.status) ? current.artistId : null,selectionValid:requested === 'all' || selected.length === 1,clients};
  }
  function wall(width = 1600, color = '#29343e') {
    const boards=[110,320,530,740,950,1160,1370,1580].map(x=>'<path d="M'+x+' 650 '+(800+(x-800)*1.65)+' 900"/>').join('');
    return '<path fill="'+color+'" d="M0 0h'+width+'v650H0z"/><path d="M0 0h1600v64H0z" fill="#172b36" opacity=".42"/><path d="M0 59h1600m-1600 14h1600" stroke="#a4aca1" stroke-width="3" opacity=".17"/><path d="M0 620h1600v32H0z" fill="#1f2a32"/><path d="M0 621h1600" stroke="#b09c7b" stroke-width="4" opacity=".4"/><path fill="var(--scene-floor,#715447)" d="M0 650h1600v250H0z"/><path d="M0 650h1600v30H0z" fill="#1b2931" opacity=".2"/><g fill="none" stroke="#362c2b" stroke-width="3" opacity=".48">'+boards+'<path d="M0 735h1600M0 844h1600M232 650v85m400 0v109m495 0v56"/></g><path d="M20 749h124m53 23h91m475-99h90m107 97h71m214 93h136m-1075-40h94" stroke="#cfb38c" stroke-width="3" opacity=".13"/>';
  }
  function windows(x = 70, y = 135, width = 340, height = 340) {
    const w=width,h=height;
    return '<g transform="translate('+x+' '+y+')"><path d="M12 8h'+w+'v'+h+'h-'+w+'z" fill="#102731" opacity=".3"/><path d="M-8-8h'+(w+16)+'v'+(h+16)+'H-8z" fill="#8b8474" stroke="#20323b" stroke-width="7"/><path d="M6 6h'+(w-12)+'v'+(h-12)+'H6z" fill="#bed0c7"/><path d="M8 '+(h-10)+'v-106h45v-47h45v77h41v-143h56v65h40v-38h53v84h42v108Z" fill="#7f9f9d"/><path d="m8 '+(h-116)+' 22-19 23 19m85-66 28-18 28 18m42 27 27-12 27 12" fill="#a87f69"/><path d="M28 '+(h-70)+'h9m23-44h9m41 65h9m36-112h10m24 24h10m41 7h10m26 48h9" stroke="#cbd5bd" stroke-width="13"/><path d="M8 '+Math.round(h*.3)+'q'+Math.round(w*.55)+' 45 '+(w-16)+'-12" fill="none" stroke="#3f646a" stroke-width="2" opacity=".4"/><path d="M'+Math.round(w*.5)+' 0v'+h+'M0 '+Math.round(h*.52)+'h'+w+'" stroke="#344955" stroke-width="13"/><path d="M'+(Math.round(w*.5)-3)+' 8v'+(h-16)+'M8 '+(Math.round(h*.52)-3)+'h'+(w-16)+'" stroke="#a5ada0" stroke-width="3" opacity=".45"/><path d="M-18 '+h+'h'+(w+36)+'v17H-18z" fill="#b5a486" stroke="#2a3a43" stroke-width="5"/><path d="M13 14h'+Math.round(w*.25)+'L13 '+Math.round(h*.55)+'Z" fill="#e2e5ca" opacity=".18"/></g>';
  }
  function speaker(x, y, scale = 1) { return '<g transform="translate(' + x + ' ' + y + ') scale(' + scale + ')"><rect width="120" height="225" rx="9" fill="#181d28"/><rect x="9" y="9" width="102" height="207" rx="5" fill="#27313d"/><g class="activity-scene__speaker-cone as-motion"><circle cx="60" cy="145" r="43" fill="#111721" stroke="#48515b" stroke-width="5"/><circle cx="60" cy="145" r="17" fill="#29333d"/></g><circle cx="60" cy="51" r="24" fill="#111721" stroke="#555763" stroke-width="4"/><circle cx="60" cy="51" r="7" fill="#424d57"/></g>'; }
  function lamp(x, y) { return '<g><path d="M' + x + ' ' + y + 'v180m-40 0h80" stroke="#b5a58d" stroke-width="8"/><path d="m' + (x - 65) + ' ' + (y + 15) + ' 30-80h70l30 80Z" fill="#e9c183"/><path class="activity-scene__lamp-glow" d="m' + (x - 53) + ' ' + (y + 17) + '-105 260h316L' + (x + 53) + ' ' + (y + 17) + 'Z" fill="#f6cc83" opacity=".1"/></g>'; }
  function ensembleRoom(view){
    const studio=['studio','home'].includes(view.place.key),accent={hiphop:'#cead75',rock:'#c27d69',metal:'#b4a3ca',reggae:'#b6bd7c',pop:'#adbad5'}[view.genre]||'#cead75';
    let art=`<path d="M0 0h1600v900H0Z" fill="var(--scene-shadow,#19232d)"/><path d="M125 95h1350v520H125Z" fill="${studio?'#35424a':'#454047'}"/><path d="M0 0l125 95v520L0 755Z" fill="#202b35"/><path d="M1600 0l-125 95v520l125 140Z" fill="#1d2833"/><path d="M0 0h1600l-125 95H125Z" fill="#141e29"/>
    <path d="M125 615h1350l125 140v145H0V755Z" fill="var(--scene-floor,${studio?'#655342':'#68574c'})"/><path d="M0 756h1600M0 833h1600M125 615 0 900M350 615 260 900M575 615 540 900M800 615v285M1025 615l35 285M1250 615l90 285M1475 615l125 285" fill="none" stroke="#332d2b" stroke-width="3" opacity=".48"/>
    <path d="M135 105h1330v10H135ZM125 585h1350v30H125Z" fill="#192630"/><path d="M210 0 310 95M1390 0l-100 95" stroke="#4f575a" stroke-width="12"/>
    <path d="M330 40h940" stroke="#1c2630" stroke-width="35"/><path d="M340 43h430m370 0h120" stroke="#e9d4ae" stroke-width="8"/><path d="M330 60 90 740h820L760 60Z" fill="#ebd0a4" opacity=".035"/>
    <path d="M325 644h910l160 198H176Z" fill="#3c3740" stroke="#a89273" stroke-width="6"/><path d="M346 661h866l124 160H213Z" fill="none" stroke="#64575b" stroke-width="4"/><path d="M380 691h800M300 791h998" stroke="#51474d" stroke-width="3"/>
    <path d="M100 733q190-65 386 24t290-24 366 30 338-29M190 849q155-80 311-23t395 14 459 15" fill="none" stroke="#181e27" stroke-width="5"/>`;
    if(studio){
      art+=`<path d="M430 142h690v300H430Z" fill="#17252f" stroke="#847b6b" stroke-width="15"/><path d="M446 160h658v262H446Z" fill="#42606a"/><path d="M458 176h634v232H458Z" fill="#29434e"/><path d="M446 347h658v75H446Z" fill="#374a53"/><path d="m447 160 350 262h90L537 160ZM802 160l302 229v-53L871 160Z" fill="#c9dfce" opacity=".1"/><path d="M770 162v259" stroke="#172731" stroke-width="10"/>
      <rect x="594" y="224" width="136" height="92" rx="5" fill="#162631"/><path class="activity-scene__wave" d="M604 270h12l8-18 8 39 10-48 9 35 12-18 12 19 10-36 9 45 10-17h14" fill="none" stroke="#9ebda9" stroke-width="3"/><path d="M585 340h175l30 30H565Z" fill="#182631"/>
      <rect x="1129" y="156" width="164" height="51" rx="4" fill="#272f35"/><circle class="activity-scene__record-led" cx="1151" cy="181" r="7" fill="#c67e6b"/><text x="1170" y="187" fill="#e7c7ac" font-size="17" font-family="sans-serif" letter-spacing="3">STUDIO A</text>`;
      for(let i=0;i<6;i++)art+=`<rect x="${155+i*39}" y="164" width="25" height="330" rx="4" fill="${i%2?'#343943':'#202d37'}"/><rect x="${1210+i*39}" y="239" width="25" height="260" rx="4" fill="${i%2?'#343943':'#202d37'}"/>`;
    }else{
      art+=`<path d="M179 155h344v361H179Z" fill="#575b5e" stroke="#222d36" stroke-width="10"/>`;
      for(let i=0;i<8;i++)art+=`<path d="M185 ${175+i*43}h332" stroke="#3d444b" stroke-width="5"/>`;
      art+=`<path d="M551 137h494v376H551Z" fill="#302f38"/><path d="M559 147h478v359H559Z" fill="#4d454a"/>`;
      for(let i=0;i<7;i++)art+=`<path d="M${573+i*68} 157v339" stroke="#342f39" stroke-width="33"/>`;
      art+=`<g transform="rotate(4 1250 320)"><rect x="1132" y="179" width="228" height="290" fill="#a7916e"/><rect x="1146" y="192" width="200" height="262" fill="#4b4651"/><path d="m1180 347 40-81 40 81 41-81" fill="none" stroke="${accent}" stroke-width="13"/><text x="1250" y="419" text-anchor="middle" fill="#d0b897" font-size="22" font-family="sans-serif" letter-spacing="4">EN VIVO</text></g>`;
    }
    art+=`<rect x="580" y="472" width="450" height="70" rx="4" fill="#1d2932" stroke="#a18b68" stroke-width="2"/><text x="805" y="516" text-anchor="middle" font-size="26" font-family="sans-serif" font-weight="700" letter-spacing="3" fill="${accent}">${esc(String(view.ensemble.name).slice(0,28).toLocaleUpperCase())}</text>`;
    art+=speaker(135,447,.69)+speaker(1370,447,.69)+`<g fill="#1a242f" stroke="#667173" stroke-width="2"><path d="M0 766h131l29 134H0Z"/><path d="M1468 766h132v134h-160Z"/></g><path d="M27 795h82m-76 21h81m1363-21h82m-88 21h81" stroke="#697171" stroke-width="4"/><g fill="#d3b982"><rect x="59" y="849" width="17" height="5"/><rect x="1515" y="849" width="17" height="5"/></g>`;
    return art;
  }
  function environment(view) {
    const { key, grade } = view.place;
    let scenery = '';
    if (key === 'film') {
      scenery=wall(1600,'#2d3744')+'<path d="M330 75h940v610H330Z" fill="#44435a"/><path d="M330 660q470-75 940 0v90H330Z" fill="#5b5265"/><path d="M190 160v500m-60 70 60-100 60 100m1160-570v500m-60 70 60-100 60 100" stroke="#929fa5" stroke-width="9" fill="none"/><path d="m125 140 120-15 25 90-120 15Zm1185-15 120 15-25 90-120-15Z" fill="#d7c5a3" stroke="#202a35" stroke-width="12"/><path d="m210 245 220 410h740l200-410" fill="#d9c6a0" opacity=".045"/><g data-film-camera="true"><path d="M225 465v240m-70 55 70-90 70 90" fill="none" stroke="#8c9ba0" stroke-width="10"/><rect x="130" y="350" width="180" height="108" rx="14" fill="#172632" stroke="#7d9097" stroke-width="5"/><path d="m310 374 57-20v94l-57-20Z" fill="#253841"/><circle cx="174" cy="405" r="13" fill="#536a71"/><rect x="146" y="322" width="95" height="20" fill="#8d9d9c"/><circle class="activity-scene__record-lamp as-motion" cx="280" cy="373" r="7" fill="#cd8071"/></g><g transform="translate(1240 400)"><path d="M0 0h170v120H0Z" fill="#d6c9ac" stroke="#28313d" stroke-width="6"/><path d="M0 0h170v27H0Z" fill="#28313d"/><path d="m10 0 25 27m10-27 25 27m10-27 25 27m10-27 25 27" stroke="#d6c9ac" stroke-width="13"/><text x="85" y="73" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#28313d">RODAJE</text><path d="M22 90h126" stroke="#6a7576" stroke-width="3"/></g>';
    } else if (key === 'studio') {
      scenery = wall(1600, '#273747') + windows(65, 145, 380, 370) + '<path d="M70 145 445 515M80 145 445 505" stroke="#d7f0ed" stroke-width="10" opacity=".14"/>';
      for (let i = 0; i < 7; i++) scenery += '<rect x="' + (480 + i * 73) + '" y="110" width="45" height="370" rx="8" fill="' + (i % 2 ? '#3d4e5a' : '#1f2c38') + '"/>';
      scenery += '<path d="m1060 570 470-30 50 160h-540Z" fill="#374351"/><path d="M1065 700h485v125h-28v-97h-430v97h-27Z" fill="#202938"/><rect x="1205" y="350" width="210" height="150" rx="12" fill="#111d2a"/><rect x="1220" y="365" width="180" height="117" fill="#264d58"/><path d="M1230 430h15l10-32 15 60 15-52 14 30 12-10 11 8 13-28 13 48 13-40 11 16h18" stroke="#8de6c7" stroke-width="4" fill="none" class="activity-scene__wave"/><path d="M1310 500v50m-50 0h100" stroke="#111d2a" stroke-width="10"/>' + speaker(1090, 385, .58) + speaker(1440, 375, .58);
      for (let i = 0; i < 10; i++) scenery += '<path d="m' + (1100 + i * 39) + ' 602 8 67" stroke="#a3aaa9" stroke-width="4"/><rect class="activity-scene__meter" x="' + (1097 + i * 39) + '" y="' + (589 + i % 3 * 9) + '" width="8" height="28" rx="2" fill="#73c3ae" style="animation-delay:-' + (i % 4 * .15) + 's"/>';
      scenery += '<rect x="70" y="540" width="335" height="105" rx="16" fill="#2b3441"/><path d="M110 645v55m260-55v55" stroke="#18222e" stroke-width="14"/>';
    } else if (key === 'garage') {
      scenery = wall(1600, '#373b46') + '<path d="M70 90h490v455H70Z" fill="#555b65" stroke="#252c36" stroke-width="12"/>';
      for (let i = 0; i < 8; i++) scenery += '<path d="M80 ' + (140 + i * 52) + 'h470" stroke="#303a46" stroke-width="8"/>';
      scenery += '<rect x="1100" y="95" width="270" height="225" transform="rotate(5 1235 205)" fill="#c39b67"/><path d="m1125 230 50-88 51 88m-26-44h-50m90-45 70 90m-70 0 70-90" fill="none" stroke="#694b44" stroke-width="13"/>' + speaker(1100, 480, 1.1) + speaker(1290, 510, .85) + '<path d="M0 675c200-25 300 55 490 15s300 15 430 0 370 65 680-20" fill="none" stroke="#1c2732" stroke-width="8"/><g fill="#c38b58" stroke="#2c303b" stroke-width="7"><ellipse cx="290" cy="590" rx="100" ry="36"/><path d="M190 590v105q100 35 200 0V590"/><ellipse cx="290" cy="590" rx="100" ry="36"/><ellipse cx="195" cy="525" rx="60" ry="20"/><ellipse cx="365" cy="515" rx="60" ry="20"/></g><path d="M195 545v125m170-135v135" stroke="#abb0b0" stroke-width="7"/>';
    } else if (key === 'venue') {
      const large = ['theater', 'arena', 'stadium'].includes(grade);
      scenery = '<path fill="#1b2337" d="M0 0h1600v900H0z"/><path fill="#48334a" d="M0 90h1600v610H0z"/><path d="M0 680h1600v220H0Z" fill="#44352f"/><path d="M0 680h1600m-1600 85h1600" stroke="#ac8063" stroke-width="5"/>';
      scenery += '<path d="M0 0h200q-90 260-60 680H0Zm1600 0h-200q90 260 60 680h140Z" fill="#643c54"/><path d="M35 0q-15 400 55 650M90 0q-20 410 40 640m1380-640q20 410-40 640m-35-640q15 400-55 650" fill="none" stroke="#3e2c42" stroke-width="25"/>';
      scenery += '<path d="M170 80h1260" stroke="#7c8392" stroke-width="18"/><path d="m190 50 110 55 110-55 110 55 110-55 110 55 110-55 110 55 110-55 110 55 110-55" stroke="#41495a" stroke-width="7" fill="none"/>';
      for (let i = 0; i < (large ? 6 : 3); i++) {
        const x = 290 + i * (large ? 200 : 480);
        scenery += '<g class="activity-scene__spot" style="animation-delay:-' + i * .3 + 's"><path d="m' + x + ' 125-210 555h420Z" fill="' + (i % 2 ? '#69c7c3' : '#e7a161') + '" opacity=".1"/><rect x="' + (x - 25) + '" y="85" width="50" height="65" rx="8" fill="#a2a2a1"/><ellipse cx="' + x + '" cy="150" rx="23" ry="9" fill="#e3c084"/></g>';
      }
      scenery += speaker(180, 415, large ? 1.1 : .8) + speaker(1300, 415, large ? 1.1 : .8) + '<path d="M500 705h165l-25 58H485Zm450 0h165l15 58H975Z" fill="#1b2332"/>';
      if (large) scenery += '<path d="M0 850h1600v50H0Z" fill="#151e2c"/><path d="M0 834h1600m-1600 36h1600" stroke="#555064" stroke-width="8"/>';
    } else if (key === 'street') {
      scenery = '<path fill="#a0b7b7" d="M0 0h1600v900H0z"/><path d="M0 160h420v480H0Zm1100-70h500v550h-500Z" fill="#8e776e"/><path d="M80 220h100v150H80Zm170 0h100v150H250Zm920-80h100v140h-100Zm170 0h100v140h-100Z" fill="#394d5b"/><path d="M0 640h1600v260H0Z" fill="#6c7778"/><path d="M0 650h1600M120 900l420-250m880 250-420-250" stroke="#a9b1ac" stroke-width="10"/><path d="M430 280h660v360H430Z" fill="#596e79"/><path d="m490 470 75-100 74 100 80-100 75 100 80-100 75 100 80-100" stroke="#a1a79b" stroke-width="20" fill="none" opacity=".55"/>' + speaker(260, 580, .65) + '<path d="M1160 180v490m-70-470h140" stroke="#3a4d56" stroke-width="10"/><path d="M1090 190q70-80 140 0" fill="#f2cf92"/>';
    } else if (key === 'workshop') {
      scenery = wall(1600, '#39484c') + windows(85, 105, 330, 300) + '<path d="M1085 125h415v510h-415Z" fill="#293338"/><path d="M1085 280h415m-415 170h415m-278-325v510m140-510v510" stroke="#8c806b" stroke-width="13"/>';
      for (let i = 0; i < 9; i++) scenery += '<path d="M' + (1105 + i % 3 * 140) + ' ' + (175 + Math.floor(i / 3) * 170) + 'h100v92h-100Z" fill="' + ['#a98965', '#8d7663', '#b79a72'][i % 3] + '"/><path d="M' + (1155 + i % 3 * 140) + ' ' + (175 + Math.floor(i / 3) * 170) + 'v50" stroke="#d3b68d" stroke-width="14"/>';
      scenery += '<rect x="80" y="495" width="360" height="45" rx="9" fill="#c7a478"/><path d="M100 540v175m320-175v175" stroke="#1e3038" stroke-width="18"/><path d="M120 490v-70h135v70m55 0v-95h80v95" fill="#8b6f5a"/><circle cx="620" cy="150" r="62" fill="#e1d6b6" stroke="#283a43" stroke-width="12"/><path d="M620 110v40l29 20" stroke="#40484a" stroke-width="7" fill="none"/>';
    } else {
      scenery = wall(1600, '#3a3b4a') + windows(95, 100, 320, 330) + '<path d="M80 555h395v140H80Z" fill="#626371"/><path d="M55 530h90v210H55Zm355 0h90v210h-90Z" fill="#51535f"/><path d="M150 550h255v125H150Z" fill="#787582"/><path d="M100 740v40m350-40v40" stroke="#2a2d39" stroke-width="14"/>' + lamp(1250, 450);
      scenery += '<path d="M1120 670h370v50h-370Z" fill="#98795e"/><path d="M1140 720v100m330-100v100" stroke="#302e38" stroke-width="15"/><path d="M1340 300h120v235h-120Z" fill="#a18e70"/><path d="M1355 315h90v200h-90Z" fill="#2e4b55"/><path d="m1380 450 20-50 24 50m-35-20h27" stroke="#729c9d" stroke-width="8" fill="none"/>';
      if (key === 'social') scenery += '<g><path d="M420 400v280m-48 50 48-65 45 65" fill="none" stroke="#b4b5b0" stroke-width="9"/><circle cx="420" cy="350" r="70" fill="none" stroke="#dbcaac" stroke-width="20"/><rect x="401" y="315" width="38" height="75" rx="7" fill="#24323e"/><circle cx="420" cy="329" r="4" fill="#8cbcc6"/></g>';
      scenery += '<path d="M1480 710v-130" stroke="#819778" stroke-width="13"/><path d="M1480 625q-90-5-80-65 80-20 80 65m0-25q75-5 65-65-70 0-65 65" fill="#829c86"/><path d="M1440 695h85l-12 80h-60Z" fill="#b1856b"/>';
    }
    if(view.ensemble.members.length>1&&['studio','garage','home'].includes(key))scenery=ensembleRoom(view);
    if(key==='venue')scenery+='<rect x="525" y="178" width="550" height="120" rx="4" fill="#202b3a" stroke="#a18468" stroke-width="2"/><text x="800" y="251" text-anchor="middle" font-size="37" font-family="sans-serif" font-weight="700" letter-spacing="5" fill="#d7bd91">'+esc(String(view.ensemble.name).slice(0,26).toLocaleUpperCase())+'</text><path d="M240 790h1120" stroke="#bfa07a" stroke-width="3" opacity=".45"/>';
    return '<svg class="activity-scene__environment" viewBox="0 0 1600 900" preserveAspectRatio="none" role="img" aria-label="' + esc(placeLabel(view.place)) + '" xmlns="http://www.w3.org/2000/svg">' + scenery + '</svg>';
  }
  function actor(s, view,member) {
    const placement=stagePositions(view),mx=placement.find(p=>p.member.id===member.id)?.x||50,px=placement.find(p=>p.member.isPlayer)?.x||50;
    const managed=view.ensemble.source==='management',appearance = member.appearance, opts = { filming:view.place.key==='film',name:member.name,identity:member.id,role:member.role,task:managed&&!member.isPlayer&&view.scheduledAction?.id==='management_release'?'distribution':null,ensemble:view.ensemble.members.length>1&&!managed,isPlayer:member.isPlayer,isLead:managed?!member.isPlayer:member.isPlayer,lookDirection:managed?(member.isPlayer?1:-1):mx>px?-1:1 },activity=managed&&member.isPlayer&&!['idle','blocked'].includes(view.activity)?'work':view.activity;
    if (root.RapActivityActor?.render) return root.RapActivityActor.render(view.ensemble.genre||view.genre, appearance, activity, opts);
    if (root.RapCharacter?.render) return root.RapCharacter.render(view.genre, appearance, view.activity === 'blocked' ? 'tired' : 'confident', opts);
    return '<span class="activity-scene__actor-loading">Tu personaje se está preparando</span>';
  }
  function stagePositions(view){
    const members=view.ensemble.members;
    if(view.ensemble.source==='management')return members.map(member=>({member,back:member.isPlayer,x:member.isPlayer?22:62,h:member.isPlayer?69:88,bottom:member.isPlayer?18:2}));
    // Instrument furniture goes in the rear plane; the player stays in the front
    // unless their actual role requires a kit or console. Positions are pure.
    const priority={guitar:0,drums:1,bass:3,keys:4,producer:5,voice:6,rapper:6},ordered=members.filter(m=>!m.isPlayer).sort((a,b)=>(priority[a.role]??7)-(priority[b.role]??7));
    const player=members.find(m=>m.isPlayer);if(player)ordered.splice(Math.floor((members.length-1)/2),0,player);
    const positions={2:[33,68],3:[22,50,79],4:[18,39,61,83],5:[12,31,50,69,88],6:[10,26,42,58,74,90]}[ordered.length]||[50];
    return ordered.map((member,index)=>{const back=['drums','keys','producer'].includes(member.role);return{member,back,x:positions[index],h:back?68:member.isPlayer?84:79,bottom:back?22:member.isPlayer?1:3};});
  }
  function cast(s,view){const members=view.ensemble.members;if(members.length<2)return '<div class="activity-scene__actor">'+(members[0]?actor(s,view,members[0]):'')+'</div>';
    return '<div class="activity-scene__ensemble" aria-label="'+esc(view.ensemble.name)+' · '+members.length+(view.ensemble.source==='management'?' personas en sesión':' integrantes')+'">'+stagePositions(view).map(({member,back,x,h,bottom})=>'<div class="activity-scene__performer" data-member-id="'+esc(member.id)+'" data-role="'+esc(member.role)+'" data-player="'+member.isPlayer+'" data-plane="'+(back?'rear':'front')+'" style="--performer-x:'+x+'%;--performer-height:'+h+'%;--performer-bottom:'+bottom+'%;--performer-depth:'+(back?1:member.isPlayer?4:3)+'">'+actor(s,view,member)+'</div>').join('')+'</div>';
  }
  function roster(view){if(view.ensemble.members.length<2)return'';const members=stagePositions(view).sort((a,b)=>a.x-b.x).map(p=>p.member);return '<div class="activity-scene__roster" aria-label="Integrantes, de izquierda a derecha">'+members.map(m=>'<span data-player="'+m.isPlayer+'" title="'+esc(m.name+' · '+(roleNames[m.role]||'Artista'))+'"><i aria-hidden="true">'+(m.isPlayer?'◆':'·')+'</i><b>'+esc(m.name)+'</b><small>'+esc(roleNames[m.role]||'Artista')+'</small></span>').join('')+'</div>';}
  function sceneAtmosphere(view){
    if(view.place.key==='film'&&view.activity==='perform')return '<svg class="activity-scene__atmosphere" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g transform="translate(696 100)"><rect width="208" height="52" rx="5" fill="#172632" stroke="#b7a282" stroke-width="2"/><circle class="activity-scene__record-lamp as-motion" cx="26" cy="26" r="8" fill="#d18770"/><text x="50" y="33" font-family="sans-serif" font-size="20" fill="#e3d6bd">EN RODAJE</text></g></svg>';
    const live=view.activity==='perform'&&['venue','street'].includes(view.place.key),studio=['record','produce'].includes(view.activity),rehearsal=view.activity==='rehearse';
    const sessionLabel=String(view.scheduledAction?.id||'').endsWith('release')?'ENVÍO':view.activity==='record'?'REC':'MIX';
    if(live)return '<svg class="activity-scene__atmosphere" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g class="activity-scene__light-fan as-motion"><path d="M360 60 130 790h580Z" fill="var(--scene-accent,#c5a36a)" opacity=".1"/><path d="m1240 60-410 730h520Z" fill="var(--scene-light,#abd0cf)" opacity=".085"/></g><ellipse class="activity-scene__stage-wash as-motion" cx="800" cy="777" rx="650" ry="82" fill="var(--scene-accent,#d4ae73)" opacity=".06"/></svg>';
    if(studio)return '<svg class="activity-scene__atmosphere activity-scene__studio-signal" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g transform="translate(729 113)"><rect width="142" height="48" rx="5" fill="#17252d" stroke="var(--scene-accent,#c6a87a)" stroke-width="2"/><circle class="activity-scene__record-lamp as-motion" cx="24" cy="24" r="7" fill="var(--scene-accent,#d4a56e)"/><text x="45" y="31" font-family="sans-serif" font-weight="700" font-size="19" letter-spacing="3" fill="#ded9c6">'+sessionLabel+'</text></g><g transform="translate(1125 240)">'+Array.from({length:8},(_,i)=>'<rect class="activity-scene__session-meter as-motion" x="'+i*12+'" y="0" width="6" height="42" rx="1" fill="var(--scene-light,#98b9a3)" style="--meter-order:'+i+'"/>').join('')+'</g></svg>';
    if(rehearsal)return '<svg class="activity-scene__atmosphere activity-scene__rehearsal-signal" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true"><g transform="translate(758 206)"><path d="M22 0h38l24 91H0Z" fill="#654e3c" stroke="#202832" stroke-width="4"/><path d="M28 12h26l17 64H11Z" fill="#c3b899"/><path d="M40 18v53" stroke="#7a6f59" stroke-width="2"/><g class="activity-scene__metronome-arm as-motion"><path d="M40 75V17" stroke="#25333b" stroke-width="5"/><rect x="33" y="29" width="14" height="13" rx="2" fill="var(--scene-accent,#c4a272)" stroke="#25333b" stroke-width="2"/></g><circle cx="40" cy="76" r="5" fill="#a7a68d"/></g></svg>';
    return'';
  }
  function audience(view){
    if(view.activity!=='perform'||!['venue','street'].includes(view.place.key))return'';
    const count=view.place.key==='street'?5:['arena','stadium'].includes(view.place.grade)?16:view.place.grade==='theater'?12:8;
    let art='';
    for(let i=0;i<count;i++){
      const x=35+i*(1530/(count-1)),y=875+(i%3)*10,shade=['#172731','#1c2c35','#21313b'][i%3];
      art+='<g transform="translate('+x+' '+y+')"><g class="activity-scene__fan as-motion" style="--fan-phase:'+(-i%4*.28)+'s"><path d="M-23 42-20 5Q-16-5 0-5T20 5l3 37Z" fill="'+shade+'"/><ellipse cx="0" cy="-16" rx="14" ry="17" fill="'+shade+'"/><g class="activity-scene__fan-arm as-motion" style="--fan-phase:'+(-i%3*.33)+'s;--fan-direction:'+(i%2?-1:1)+'"><path d="M-15 8-29-20-20-45" fill="none" stroke="'+shade+'" stroke-width="11" stroke-linecap="round"/><circle cx="-20" cy="-46" r="7" fill="'+shade+'"/>'+(i%4===1?'<rect x="-26" y="-66" width="13" height="22" rx="3" fill="#111b25"/><rect x="-23" y="-62" width="7" height="13" rx="1" fill="var(--scene-light,#a8c5bf)" opacity=".5"/>':'')+'</g><g class="activity-scene__fan-arm activity-scene__fan-arm--right as-motion" style="--fan-phase:'+(-i%5*.25)+'s;--fan-direction:'+(i%2?1:-1)+'"><path d="M15 8 28-7 32-28" fill="none" stroke="'+shade+'" stroke-width="10" stroke-linecap="round"/><circle cx="32" cy="-30" r="7" fill="'+shade+'"/></g></g></g>';
    }
    return '<svg class="activity-scene__audience" viewBox="0 0 1600 900" preserveAspectRatio="none" aria-hidden="true">'+art+'</svg>';
  }
  function resultBand(result) {
    if (!result) return '<div class="activity-scene__result activity-scene__result--empty"><span>Tu historia sigue aquí.</span><p>El primer resultado aparece al terminar un día del reloj.</p></div>';
    const catalogue = result.streams > 0 || result.units > 0 ? '<span class="activity-scene__catalogue">Catálogo: ' + fmt(result.streams) + ' streams · ' + fmt(result.units) + ' copias</span>' : '';
    return '<div class="activity-scene__result" data-result-day="' + result.day + '" data-result-status="' + esc(result.status) + '"><span>Último cierre · S' + esc(result.week) + ' · ' + esc(result.dayLabel) + '</span><p>' + esc(result.label) + '</p>' + catalogue + (result.status === 'skipped' && result.highlights[0] ? '<small>' + esc(result.highlights[0]) + '</small>' : '') + '</div>';
  }
  function renderManagerRoster(s, clock = {}, options = {}) {
    const rosterView = describeManagerRoster(s,options), speed = [1/60,1/20,1/6,.1,1,3,7].includes(Number(clock?.speed)) ? Number(clock.speed) : 1;
    const tempo = 1, duration = 6;
    if(!rosterView.clients.length)return '<section class="manager-roster-scene manager-roster-scene--empty" data-selection="'+esc(rosterView.selectedArtistId)+'" aria-label="Escena de tus artistas"><span aria-hidden="true">◇</span><div><strong>'+(rosterView.selectionValid?'La sala espera a tus artistas':'Ese artista no está en tu roster')+'</strong><p>'+(rosterView.selectionValid?'Firma una representación y elige sus sesiones para verlas aquí.':'Elige un cliente de la lista para consultar su actividad real.')+'</p></div></section>';
    const rooms = rosterView.clients.map(view => {
      const moving = view.status === 'scheduled' && view.activity !== 'idle', playing = clock?.playing === true && !!s?.activeWeek && moving;
      const flag = view.status === 'scheduled' ? view.place.key==='film'?'EN RODAJE':{record:'EN TOMA',social:'PROMOCIÓN',produce:'ESTRENO',perform:'EN VIVO'}[view.activity] || 'EN SESIÓN' : view.status === 'blocked' ? 'EN ESPERA' : view.status === 'archive' ? 'DETENIDO' : view.status === 'unavailable' ? 'SIN CONTRATO' : view.status === 'planning' ? 'PREPARACIÓN' : view.status === 'completed' ? 'TERMINADO' : view.status === 'skipped' ? 'OMITIDO' : 'DESCANSO';
      const next = view.nextAppointment, detail = ['blocked','archive','unavailable'].includes(view.status) ? view.reason : view.status === 'scheduled' ? view.projectName || placeLabel(view.place) : next ? 'Próxima cita · '+next.dayShort+' · '+next.label : view.status === 'completed' ? 'La sesión de hoy ya terminó.' : view.status === 'skipped' ? 'La sesión de hoy no se realizó.' : 'Sin otra sesión programada esta semana.';
      const cash = '$'+view.cash.toLocaleString('es-CO',{minimumFractionDigits:2,maximumFractionDigits:2});
      return '<article class="activity-scene manager-client-scene" data-manager-artist-id="'+esc(view.artistId)+'" data-roster-active="'+moving+'" data-playing="'+playing+'" data-activity="'+esc(view.activity)+'" data-status="'+esc(view.status)+'" data-ensemble="'+view.ensemble.members.length+'" data-roster-source="management" data-place="'+esc(view.place.key)+'" data-speed="'+speed+'" style="--activity-tempo:'+tempo+'s;--activity-day-duration:'+duration+'s" aria-label="'+esc(view.name+' · '+view.label)+'">'+
        '<div class="activity-scene__camera"><div class="activity-scene__set">'+environment(view)+(root.RapOwnedScenery?.render(s,view)||'')+cast(s,view)+sceneAtmosphere(view)+audience(view)+'<div class="activity-scene__daylight" aria-hidden="true"></div><div class="activity-scene__edge" aria-hidden="true"></div></div><span class="manager-client-scene__flag">'+flag+'</span></div>'+
        '<div class="manager-client-scene__info"><div class="manager-client-scene__identity"><strong>'+esc(view.name)+'</strong><small>'+esc(view.supervised?'Con '+(s.player?.name || 'su mánager'):view.label)+'</small></div><p class="manager-client-scene__detail" title="'+esc(detail)+'"'+(['blocked','archive'].includes(view.status)?' role="status"':'')+'>'+esc(detail)+'</p><span class="manager-client-scene__cash" title="Caja propia del artista; no forma parte de tu caja personal.">Caja del artista <b>'+cash+'</b></span></div></article>';
    }).join('');
    return '<section class="manager-roster-scene'+(options?.compact === true?' manager-roster-scene--compact':'')+'" data-selection="'+esc(rosterView.selectedArtistId)+'" data-client-count="'+rosterView.clients.length+'" aria-label="Actividad real de tus artistas"><div class="manager-roster-scene__rooms">'+rooms+'</div></section>';
  }
  function render(s, options = {}) {
    const view = describe(s), compact = options.compact === true, playing = options.playing === true && !!s?.activeWeek && !['archive', 'unavailable','blocked'].includes(view.status), speed = [1/60,1/20,1/6,.1,1,3,7].includes(Number(options.speed)) ? Number(options.speed) : 1;
    const tempo = 1, duration = 6;
    const safeState = s || { player: {} }, date = view.date ? view.date.split('-').reverse().join('/') : '';
    const schedule = view.weekSchedule.map(day => '<li data-status="' + esc(day.status) + '"' + (day.current ? ' aria-current="date" class="is-current"' : '') + '><span>' + esc(day.dayShort) + '</span><i aria-hidden="true">' + (day.status === 'completed' ? '✓' : day.status === 'skipped' || day.status === 'blocked' ? '!' : day.id ? '●' : day.dayOfWeek === 6 ? '◇' : '·') + '</i><strong>' + esc(day.label) + '</strong></li>').join('');
    return '<section class="activity-scene' + (compact ? ' activity-scene--compact' : '') + '" data-playing="' + playing + '" data-activity="' + esc(view.activity) + '" data-status="' + esc(view.status) + '" data-ensemble="'+view.ensemble.members.length+'" data-roster-source="'+view.ensemble.source+'" data-place="' + esc(view.place.key) + '" data-speed="' + speed + '" style="--activity-tempo:' + tempo + 's;--activity-day-duration:' + duration + 's" aria-label="Escena de tu carrera">' +
      '<div class="activity-scene__camera"><div class="activity-scene__set">' + environment(view) + (root.RapOwnedScenery?.render(safeState,view)||'') + cast(safeState,view) +sceneAtmosphere(view)+audience(view)+ '<div class="activity-scene__daylight" aria-hidden="true"></div><div class="activity-scene__edge" aria-hidden="true"></div></div>' +
      '<div class="activity-scene__hud"><div class="activity-scene__date">' + esc(view.dayLabel) + '<small>' + esc(date) + '</small></div><div class="activity-scene__state"><i aria-hidden="true"></i><span class="activity-scene__when-playing">En marcha</span><span class="activity-scene__when-paused">En pausa</span><b class="activity-scene__speed">' + speed + '×</b></div></div>' +
      '<div class="activity-scene__caption"><span>' + esc(placeLabel(view.place)) + '</span><h2>' + esc(view.label) + '</h2>' + (view.status === 'blocked' || view.status === 'archive' ? '<p role="status">' + esc(view.reason) + '</p>' : '<p>' + esc(view.reason) + '</p>') + '</div>' +
      (view.status === 'blocked' || view.status === 'archive' ? '<span class="activity-scene__waiting-sign" aria-hidden="true">En espera</span>' : '') + '</div>' +roster(view)+
      (compact ? '<div class="activity-scene__compact-links"><button type="button" data-nav="live">Ver escena</button><button type="button" data-nav="week">Mi agenda</button></div>' : '<ol class="activity-scene__schedule" aria-label="Agenda de esta semana">' + schedule + '</ol>') + resultBand(view.previousResult) + '</section>';
  }
  const api = { describe, render, describeManagerRoster, renderManagerRoster, genreOf };
  root.RapActivityScene = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
