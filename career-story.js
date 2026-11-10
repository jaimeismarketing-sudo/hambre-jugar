(function (root) {
  'use strict';
  // This layer reads recorded evidence. It never grants rewards, writes a save or ticks time.
  const list = value => Array.isArray(value) ? value.filter(x => x && typeof x === 'object') : [];
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const label = (value, fallback = '') => typeof value === 'string' && value.trim() ? value.trim().slice(0, 160) : fallback;
  const route = (kind, target, payload) => ({ kind, target, ...(payload ? { payload } : {}) });
  const action = (text, destination) => ({ label: text, route: destination });
  const evidence = (path, week) => ({ path, ...(finite(week) ? { week } : {}) });
  const knownNumber = (value, target, unit) => finite(value) && value >= 0 ? { value, target, unit } : null;

  function summary(input) {
    const s = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
    const p = s.player && typeof s.player === 'object' ? s.player : {};
    const canonical = s.provenance?.mode === 'canonical-archive' || s.provenance?.mode === 'canonical-continuation' || !!s.canonical;
    const held = s.financialHold === true || s.continuationReady === false;
    const projects = list(s.projects), releases = list(s.releases), history = list(s.history);
    const name = label(p.name, 'Tu artista'), genre = label(p.style, 'Tu música');
    const origin = label(p.origin, 'Origen por confirmar');
    const identity = {
      name, genre, hometown: label(p.city, origin), origin,
      country: label(p.country) || null, city: label(p.city) || null,
      countryId: label(p.countryId) || null, cityId: label(p.cityId) || null,
      scene: label(p.scene) || null,
      backgroundId: label(p.backgroundId) || null,
      background: label(p.background) || null,
      currentMarket: label(s.career?.marketId) || null
    };
    if(s.management?.role==='manager')return managerSummary(s,identity,held,canonical);
    const release = releases.find(r => label(r.name));
    const finished = projects.find(x => ['ready', 'released'].includes(x.status));
    const working = projects.find(x => x.status === 'working');
    const recordedCompletion = history.find(h => h.kind === 'music' && h.title === 'Proyecto terminado');
    const canonicalAlbum = label(s.canonical?.album?.title);
    const productionComplete = !!(finished || release || recordedCompletion || canonicalAlbum);
    const published = !!(release || canonicalAlbum);
    const productionEvidence = finished ? [evidence('projects[' + s.projects.indexOf(finished) + '].status', finished.releasedWeek)] : release ? [evidence('releases[' + s.releases.indexOf(release) + ']', release.releasedWeek)] : recordedCompletion ? [evidence('history[' + s.history.indexOf(recordedCompletion) + ']', recordedCompletion.week)] : canonicalAlbum ? [evidence('canonical.album.title')] : [];
    const publicationEvidence = release ? [evidence('releases[' + s.releases.indexOf(release) + ']', release.releasedWeek)] : canonicalAlbum ? [evidence('canonical.album.title')] : [];

    // An aggregate weekly surplus or gross ticket sales cannot establish show profit.
    const historicalShow = history.find(h => h.kind === 'show' && finite(h.details?.net) && h.details.net > 0);
    const durableShow = s.career?.firstProfitableShow && finite(s.career.firstProfitableShow.net) && s.career.firstProfitableShow.net > 0 && Number.isInteger(s.career.firstProfitableShow.week) && s.career.firstProfitableShow.week >= 1 ? s.career.firstProfitableShow : null;
    const recentShows = list(s.pendingReport?.shows);
    const recentShow = recentShows.find(show => finite(show.net) && show.net > 0);
    const profitableShow = !!(durableShow || historicalShow || recentShow);
    const showEvidence = durableShow ? [evidence('career.firstProfitableShow', durableShow.week)] : historicalShow ? [evidence('history[' + s.history.indexOf(historicalShow) + '].details.net', historicalShow.week)] : recentShow ? [evidence('pendingReport.shows[' + s.pendingReport.shows.indexOf(recentShow) + '].net', s.pendingReport.week)] : [];
    const showProfit = durableShow?.net ?? historicalShow?.details.net ?? recentShow?.net;
    const showUnknown = !profitableShow && (canonical || !Array.isArray(s.history) || !finite(s.stats?.totalShows) || s.stats.totalShows > 0 && !history.some(h => h.kind === 'show' && finite(h.details?.net)));

    const contracts = list(s.contracts);
    const signed = contracts.find(c => ['active', 'completed'].includes(c.status));
    const licenses = list(s.licenses);
    const licensed = licenses.find(l => ['active', 'completed'].includes(l.status) && releases.some(r => r.id === l.releaseId));
    const formed = s.label && typeof s.label === 'object' && label(s.label.name);
    const canonicalFounders = canonical && label(s.canonical?.entity) && list(s.canonical?.founders).length;
    const businessComplete = !!(signed || licensed || formed || canonicalFounders);
    const businessEvidence = signed ? [evidence('contracts[' + s.contracts.indexOf(signed) + ']', signed.startedWeek)] : licensed ? [evidence('licenses[' + s.licenses.indexOf(licensed) + ']', licensed.startedWeek)] : formed ? [evidence('label', s.label.formedWeek)] : canonicalFounders ? [evidence('canonical.founders')] : [];
    const ready = projects.find(x => x.status === 'ready');
    const noProject = !finished && !working && !release;
    const planned = list(s.plan);
    const plannedProduction = working && planned.some(a => ['write', 'home_record', 'record', 'produce'].includes(a.id) && (!a.projectId || a.projectId === working.id));
    const plannedRelease = ready && planned.some(a => a.id === 'release' && a.projectId === ready.id);
    const creationAction = noProject ? action('Crear mi primer tema', route('ui', 'project')) : plannedProduction ? action('Revisar y jugar mi semana', route('ui', 'advance')) : action('Trabajar en mi tema', route('nav', 'studio'));
    const publishAction = plannedRelease ? action('Revisar y jugar el estreno', route('ui', 'advance')) : ready ? action('Programar el estreno', route('plan', 'plan', { id: 'release', projectId: ready.id })) : action('Preparar un lanzamiento', route('nav', 'studio'));

    const objectives = [
      {
        id: 'first-work', order: 1, title: 'Una idea terminada',
        description: 'Lleva una obra de la libreta al estado listo para publicar.',
        complete: productionComplete,
        unverified: !productionComplete && (canonical || !Array.isArray(s.projects)),
        progress: productionComplete ? { value: 1, target: 1, unit: 'obra terminada' } : working && finite(working.progress) && finite(working.required) && working.required > 0 ? { value: Math.max(0, working.progress), target: working.required, unit: 'producción' } : { value: 0, target: 1, unit: 'obra terminada' },
        evidence: productionEvidence,
        hint: working ? 'Las acciones de composición, maqueta y producción trabajan sobre el proyecto. Prepararlas no lo termina: hay que jugar la semana.' : 'Un sencillo exige preproducción, trabajo y energía. Tu primera maqueta puede empezar en casa.',
        action: creationAction
      },
      {
        id: 'first-release', order: 2, title: 'Que la puedan escuchar',
        description: 'Publica una obra de tu catálogo.', complete: published,
        unverified: !published && (canonical || !Array.isArray(s.releases)),
        progress: { value: published ? 1 : 0, target: 1, unit: 'lanzamiento' }, evidence: publicationEvidence,
        hint: 'Tener el tema terminado y tenerlo publicado son decisiones distintas. El estreno ocupa una acción y se ejecuta en su día de la agenda.',
        action: publishAction
      },
      {
        id: 'local-community', order: 3, title: 'Cien personas que vuelven',
        description: 'Sostén una comunidad de al menos 100 fans activos.',
        complete: finite(p.fans) && p.fans >= 100,
        unverified: !finite(p.fans) || p.fans < 0,
        progress: knownNumber(p.fans, 100, 'fans activos'),
        evidence: finite(p.fans) && p.fans >= 0 ? [evidence('player.fans')] : [],
        hint: canonical && !finite(p.fans) ? 'Los fans activos de esta carrera no constan en el archivo. No se deducen del alcance, las reproducciones o los oyentes mensuales.' : 'Contenido, actuaciones y colaboración pueden atraer público. Los oyentes mensuales y los suscriptores no sustituyen a los fans activos; esta meta usa la comunidad actual.',
        action: action('Buscar a mi público', route('nav', 'week'))
      },
      {
        id: 'first-profitable-show', order: 4, title: 'Que la fecha se sostenga',
        description: 'Completa un concierto con resultado neto positivo registrado.',
        complete: profitableShow, unverified: showUnknown,
        progress: profitableShow ? { value: 1, target: 1, unit: 'concierto rentable' } : showUnknown ? null : { value: 0, target: 1, unit: 'concierto rentable' },
        evidence: showEvidence,
        result: finite(showProfit) ? { net: showProfit, currency: 'USD' } : null,
        hint: showUnknown ? 'Hay historia de directo o datos incompletos, pero falta un neto individual de concierto verificable. Un resultado conjunto antes del reparto no prueba este hito.' : 'Mira la demanda estimada, el viaje y todos los costes antes de reservar. Una fecha llena puede perder dinero.',
        action: action('Examinar una fecha', route('nav', 'venues'))
      },
      {
        id: 'first-business', order: 5, title: 'Elegir tus condiciones',
        description: 'Firma un contrato o licencia musical, o constituye tu propio sello.',
        complete: businessComplete,
        unverified: !businessComplete && (canonical || !Array.isArray(s.contracts)),
        progress: { value: businessComplete ? 1 : 0, target: 1, unit: 'acuerdo o sello' }, evidence: businessEvidence,
        hint: 'Una oferta abierta todavía no es un contrato. Puedes seguir independiente hasta que los términos te convengan; este capítulo no obliga a firmar ni a pedir un préstamo.',
        action: action('Revisar mis opciones', route('nav', 'deals'))
      }
    ];
    const current = objectives.find(o => !o.complete);
    for (const o of objectives) {
      o.status = o.complete ? 'complete' : o.unverified ? 'unverified' : o === current ? 'current' : 'upcoming';
      if (o.unverified) {
        o.progress = null;
        if (canonical) o.action = action('Revisar la evidencia histórica', route('nav', 'archive'));
      }
      delete o.complete; delete o.unverified;
    }
    const completed = objectives.filter(o => o.status === 'complete').length;
    const verification = held || objectives.some(o => o.status === 'unverified');
    const status = verification ? 'verification-pending' : completed === objectives.length ? 'established' : 'opening';
    const genreKey = /reggae|dancehall/i.test(genre) ? 'reggae' : /rock|punk|metal/i.test(genre) ? 'band' : /pop|soul|r&b/i.test(genre) ? 'song' : 'rap';
    const invitation = {
      rap: 'Trae una letra y una base que puedas defender con tu voz. Primero terminamos una maqueta; después decidimos cómo presentarla.',
      band: 'Trae un riff, una melodía o una canción a medio armar. Primero cerramos una maqueta que pueda sostenerse también en ensayo.',
      reggae: 'Trae una canción y el pulso que quieres construir. Primero terminamos la maqueta y escuchamos qué necesita el arreglo.',
      song: 'Trae una melodía, una letra o un arreglo en borrador. Primero hagamos una maqueta que diga quién eres.'
    }[genreKey];
    const contactId = { 'self-taught': 'luna', 'live-scene': 'kairo', organizer: 'bruno' }[identity.backgroundId] || 'luna';
    const contact = list(s.relationships).find(r => r.id === contactId) || list(s.relationships).find(r => r.id === 'luna') || list(s.relationships).find(r => /productor/i.test(r.role || ''));
    const backgroundLine = identity.background ? 'Llegas como ' + identity.background + '. ' : '';
    const openingContact = canonical || productionComplete || s.progression?.usaUnlocked ? null : {
      id: label(contact?.id) || null,
      name: label(contact?.name, 'Tu libreta'),
      role: label(contact?.role, 'Punto de partida'),
      kind: contact ? 'fictional-opening' : 'artist-note',
      text: (contact ? name + ', tu punto de partida es ' : 'Tu punto de partida es ') + identity.hometown + '. ' + backgroundLine + invitation,
      scene: identity.scene,
      backgroundHook: identity.background ? 'Llegas desde ' + identity.background + '. Esa experiencia es parte de tu historia; lo que hagas ahora quedará en tu carrera.' : null,
      grantsNothing: true
    };
    const blockers = [];
    if (held) blockers.push({ kind: 'verification', text: 'La continuidad necesita conciliación antes de resolver semanas o mover dinero.' });
    if (!held && finite(s.cash) && s.cash < 150) blockers.push({ kind: 'budget', text: 'La caja es corta. Compara los costes del plan y las formas de generar ingresos antes de comprometer un estreno o una fecha.' });
    if (!held && finite(p.energy) && p.energy < 25) blockers.push({ kind: 'energy', text: 'Tu energía está baja. Revisa el descanso antes de añadir más trabajo.' });
    const chapter = canonical && verification ? { id: 'continuity', title: 'Tu historia sigue abierta', index: null, total: 5, text: 'La trayectoria registrada se conserva. Los datos pendientes se muestran como desconocidos; no vuelves al comienzo.' } : current ? { id: current.id, title: current.title, index: current.order, total: 5, text: current.description } : { id: 'beyond-opening', title: 'Ya tienes una historia propia', index: 5, total: 5, text: 'Los primeros pasos están registrados. Ahora toca sostener el catálogo, la comunidad y tus condiciones.' };
    return {
      version: 1, status, identity, chapter,
      progress: { completed, total: objectives.length, percent: Math.round(completed / objectives.length * 100) },
      objectives,
      nextAction: held ? action('Revisar mi continuidad', route('nav', 'wealth')) : current?.status === 'unverified' ? action('Revisar la evidencia', route('nav', canonical ? 'archive' : 'people')) : current?.action || action('Preparar mi próximo capítulo', route('nav', 'studio')),
      openingContact, blockers,
      unlockHint: s.progression?.usaUnlocked ? 'USA está abierto: superaste las metas de difícil en LATAM. Puedes trabajar el circuito internacional y seguir desarrollando tu catálogo.' : 'Tu próximo horizonte es LATAM. Para abrir USA, consulta y supera las metas de difícil: catálogo, comunidad, giras y una carrera que puedas sostener.',
      design: { communityTarget: 100, provisional: true, rewards: true, gatesEngine: false, lifetimeHistoryComplete: false, note: 'Los hitos nuevos se recompensan una sola vez. El historial anterior incompleto no se presume ni se paga retroactivamente.' }
    };
  }
  function activeRoster(s){return list(s.management?.artists).filter(a=>a.contract?.status==='active'&&s.week<a.contract.endsWeek||list(s.label?.contracts).some(c=>c.artistId===a.id&&c.status==='active'&&s.week>=c.startedWeek&&s.week<c.endsWeek));}
  function managerSummary(s,identity,held,canonical){
    const artists=list(s.management?.artists),active=activeRoster(s),published=artists.flatMap(a=>list(a.releases)).length,fans=artists.reduce((n,a)=>n+(finite(a.fans)?a.fans:0),0),working=artists.flatMap(a=>list(a.projects)).find(p=>['working','ready'].includes(p.status)),goals=managerGoals(s);
    const detail={
      'manager-first-release':{description:'Dirige un proyecto del roster hasta publicarlo, bajo representación o licencia vigente.',progress:working&&!published?{value:finite(working.progress)?working.progress:0,target:finite(working.needed)?working.needed:1,unit:'producción del roster'}:{value:published?1:0,target:1,unit:'lanzamiento del roster'},evidence:published?[evidence('management.artists[].releases')]:[],hint:'Elige un artista y un proyecto desde Dirección. La coordinación ocupa tu agenda y su producción se paga desde la cuenta autorizada; el mánager no necesita grabar un tema propio.',action:action(active.length?'Dirigir mi roster':'Comparar artistas y condiciones',route('nav','management'))},
      'manager-community':{description:'Construye o incorpora una comunidad de al menos 1.000 seguidores entre los artistas del roster.',progress:{value:fans,target:1000,unit:'seguidores del roster'},evidence:artists.length?[evidence('management.artists[].fans')]:[],hint:'El público pertenece a los artistas. Promoción y conciertos pueden desarrollar sus carreras; firmarlos no transfiere esos seguidores a tu marca personal.',action:action('Revisar el público del roster',route('nav','management'))},
      'manager-roster':{description:'Mantén tres artistas activos bajo representación o licencia de tu sello.',progress:{value:active.length,target:3,unit:'artistas activos'},evidence:active.length?[evidence('management.artists[].contract'),evidence('label.contracts')]:[],hint:'Una licencia de sello vigente también permite dirigir al artista. Sello y representación conservan sus propios repartos; el mismo artista cuenta una vez.',action:action('Revisar contratos del roster',route('nav','management'))}
    };
    const first=goals.find(g=>!g.complete),unverified=held||!Array.isArray(s.management?.artists),objectives=goals.map((g,i)=>({id:g.id,order:i+1,title:g.title,...detail[g.id],status:g.complete?'complete':unverified?'unverified':g===first?'current':'upcoming'})),completed=goals.filter(g=>g.complete).length;
    const blockers=[];if(held)blockers.push({kind:'verification',text:'La continuidad necesita conciliación antes de coordinar trabajo o mover dinero.'});else if(finite(s.cash)&&s.cash<30)blockers.push({kind:'budget',text:'La coordinación requiere caja personal. Revisa ingresos y compromisos antes de encargar trabajo a un cliente.'});if(!held&&finite(s.player?.energy)&&s.player.energy<18)blockers.push({kind:'energy',text:'Descansa antes de coordinar otra sesión.'});
    return{version:1,role:'manager',status:unverified?'verification-pending':first?'opening':'established',identity,chapter:first?{id:first.id,title:first.title,index:goals.indexOf(first)+1,total:goals.length,text:detail[first.id].description}:{id:'manager-established',title:'Tu roster ya tiene trayectoria',index:goals.length,total:goals.length,text:'Sostén las carreras, los contratos y las cuentas que diriges.'},progress:{completed,total:goals.length,percent:Math.round(completed/goals.length*100)},objectives,nextAction:held?action('Revisar mi continuidad',route('nav','wealth')):first?detail[first.id].action:action('Revisar carreras y compromisos',route('nav','management')),openingContact:canonical||artists.length?null:{id:null,name:'Tu libreta de dirección',role:'Primeros clientes',kind:'manager-note',text:'Tu carrera como mánager empieza por elegir a quién puedes representar y qué trabajo puedes financiar. No necesitas un catálogo propio.',grantsNothing:true},blockers,unlockHint:s.progression?.usaUnlocked?'USA está abierto; conserva las condiciones y las cuentas de tus artistas.':'Desarrolla el roster en LATAM y consulta los requisitos de gestión para abrir USA.',design:{communityTarget:1000,provisional:true,rewards:true,gatesEngine:false,lifetimeHistoryComplete:false,note:'Los tres hitos de gestión existentes se reconocen una sola vez; los antecedentes no generan pagos retroactivos.'}};
  }
  function managerGoals(s) {
    const artists=list(s.management?.artists);
    return [
      {id:'manager-first-release',title:'Primer lanzamiento del roster',complete:artists.some(a=>list(a.releases).length>0)},
      {id:'manager-community',title:'Comunidad de 1.000 seguidores del roster',complete:artists.reduce((n,a)=>n+(Number.isFinite(a.fans)?a.fans:0),0)>=1000},
      {id:'manager-roster',title:'Equipo de tres artistas activos',complete:activeRoster(s).length>=3}
    ];
  }
  // Old careers establish an evidence baseline without granting historic rewards.
  function initialize(s) {
    if (s.careerAwards) return s.careerAwards;
    const completedMilestones = summary(s).objectives.filter(o => o.status === 'complete').map(o => ({ id:o.id, week:null, reward:0, historical:true }));
    for(const goal of managerGoals(s)) if(goal.complete&&!completedMilestones.some(m=>m.id===goal.id)) completedMilestones.push({id:goal.id,week:null,reward:0,historical:true});
    s.careerAwards = { version:1, startedWeek:s.week, completedMilestones, awards:[],managerRosterIncludesLabel:true };
    return s.careerAwards;
  }
  function closeWeek(s, week, weeklyStreams) {
    const book = initialize(s), rewards = [], notes = [];
    if (s.financialHold || s.provenance?.mode === 'canonical-archive') return {rewards,notes};
    if(book.managerRosterIncludesLabel!==true){
      if(activeRoster(s).length>=3&&!book.completedMilestones.some(m=>m.id==='manager-roster'))book.completedMilestones.push({id:'manager-roster',week:null,reward:0,historical:true});
      book.managerRosterIncludesLabel=true;
    }
    for (const objective of summary(s).objectives) {
      if (objective.status !== 'complete' || book.completedMilestones.some(m => m.id === objective.id)) continue;
      book.completedMilestones.push({id:objective.id,week,reward:250,historical:false});
      rewards.push({label:'Hito · '+objective.title,amount:250});
      notes.push('Hito conseguido: '+objective.title+' · apoyo de $250.');
    }
    if (s.management?.role !== 'artist') for(const goal of managerGoals(s)) {
      if(!goal.complete || book.completedMilestones.some(m=>m.id===goal.id)) continue;
      book.completedMilestones.push({id:goal.id,week,reward:250,historical:false});
      rewards.push({label:'Hito · '+goal.title,amount:250});
      notes.push('Hito del roster: '+goal.title+' · apoyo de $250.');
    }
    if (week % 52 === 0 && !book.awards.some(a => a.week === week)) {
      const recent = list(s.releases).filter(r => Number.isFinite(r.releasedWeek) && r.releasedWeek > week-52 && r.releasedWeek <= week);
      const releases = recent.filter(r => Number(r.quality) >= 70);
      const entries = [
        {id:'revelacion',title:'Artista revelación LATAM',eligible:recent.length > 0 && s.player.fans >= 1000 && s.stats.totalStreams >= 50000 && s.player.reputation >= 20,criteria:'Estreno en 52 semanas, 1.000 fans, 50.000 streams acumulados y reputación 20.'},
        {id:'disco',title:'Disco del circuito',eligible:releases.length > 0 && weeklyStreams >= 100000,criteria:'Estreno de calidad 70+ en 52 semanas y 100.000 streams en la semana.'},
        {id:'management',title:'Representante del año',eligible:s.management?.role !== 'artist' && list(s.management?.artists).some(a=>list(a.releases).some(r=>r.releasedWeek>week-52 && r.releasedWeek<=week && r.quality>=70 && r.totalStreams>=50000)),criteria:'Cliente con estreno de calidad 70+ en 52 semanas y 50.000 streams acumulados.'}
      ];
      const outcomes = entries.map((e,i) => {
        const chance = Math.max(.05,Math.min(.8,.1+s.player.fame/250+s.player.reputation/350+Math.log10(1+s.stats.totalStreams)/40));
        let roll = (s.rng ^ Math.imul(week,2654435761) ^ Math.imul(i+1,2246822519)) >>> 0;
        roll = Math.imul(roll ^ (roll >>> 16), 2246822519) >>> 0;
        roll = Math.imul(roll ^ (roll >>> 13), 3266489917) >>> 0;
        roll = (roll ^ (roll >>> 16)) >>> 0;
        const won = e.eligible && roll / 4294967296 < chance;
        if (won && e.id==='management') { s.player.reputation=Math.min(100,Math.round((s.player.reputation+3)*100)/100); notes.push('Ganaste '+e.title+': +3 reputación como representante.'); }
        else if (won) { s.player.fame=Math.min(100,Math.round((s.player.fame+3)*100)/100); s.player.reputation=Math.min(100,Math.round((s.player.reputation+2)*100)/100); notes.push('Ganaste '+e.title+': +3 fama y +2 reputación.'); }
        else if(e.eligible) notes.push('Nominación: '+e.title+'. Esta vez ganó otro artista.');
        return {...e,won,chance:e.eligible?Math.round(chance*100):0};
      });
      book.awards.push({week,outcomes});
      if(book.awards.length>200)book.awards.splice(0,book.awards.length-200);
    }
    return {rewards,notes};
  }
  function renderAwards(s) {
    const book=s.careerAwards;
    if(!book) return '<section class="panel"><h3>Premios del circuito</h3><p>La próxima semana empezará el registro sin conceder premios históricos.</p></section>';
    const esc = x => String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const latest=book.awards.slice(-5).reverse();
    const goals=s.management?.role!=='artist'?managerGoals(s).map(g=>`${esc(g.title)}: ${book.completedMilestones.some(m=>m.id===g.id)?'conseguido':'pendiente'}`).join(' · '):'';
    return `<section class="panel"><h3>Premios del circuito ficticio</h3><p>Ceremonia cada 52 semanas. Revelación: estreno reciente, 1.000 fans, 50.000 streams y reputación 20. Disco: obra reciente de calidad 70+ y 100.000 streams semanales. Esos premios suman 3 fama y 2 reputación. Representante: cliente con estreno reciente de calidad 70+ y 50.000 streams acumulados; suma 3 reputación. Cada nominación tiene una probabilidad de ganar.</p>${latest.length?latest.map(a=>`<p><b>S${a.week}</b> · ${a.outcomes.map(o=>`${esc(o.title)}: ${o.won?'ganado':o.eligible?'nominado':'sin nominación'}${o.eligible?' ('+o.chance+'% de probabilidad)':''}`).join(' · ')}</p>`).join(''):'<p>La primera ceremonia se celebra en S52.</p>'}${goals?'<p>Hitos del roster · '+goals+'</p>':''}<p>Cada hito nuevo da $250 una sola vez. Hitos recompensados: ${book.completedMilestones.filter(m=>!m.historical).length}; los logros anteriores a esta función no generan pagos retroactivos.</p></section>`;
  }
  const api = { summary, initialize, closeWeek, renderAwards };
  root.RapCareerStory = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
