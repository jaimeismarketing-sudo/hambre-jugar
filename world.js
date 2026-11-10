/* RAPPER SIM: HAMBRE — fictional, deterministic weekly world.
 * All names, histories and events here are invented. Real-world observations
 * inform scale only. Balance constants are provisional until human playtests.
 * Contract: advance(state, completedWeek) closes explicit integer weeks;
 * ensure() and reads never tick. No wall clock, Math.random or player scaling.
 */
(function (root) {
  'use strict';
  const VERSION = 1;
  const CAP = 26;
  const charts = typeof module !== 'undefined' && module.exports ? require('./charts-view.js') : null;
  const MAX = Number.MAX_SAFE_INTEGER - 1000000000;
  const MARKETS = ['co', 'mx', 'ar', 'cl', 'pe', 'pr', 'do', 'br'];
  const COUNTRIES = {co:'Colombia',mx:'México',ar:'Argentina',cl:'Chile',pe:'Perú',pr:'Puerto Rico',do:'República Dominicana',br:'Brasil'};
  const GENRES = ['hip-hop', 'trap', 'rap', 'rock', 'reggae', 'urbano', 'R&B', 'pop'];
  const STATUS = {writing:'En estudio',promotion:'Promoción',tour:'De gira',rest:'Descanso',retired:'Retirado'};
  // Provisional fictional cohorts replenish several scales of the wider LATAM
  // circuit, not just beginners. The five-cohort cycle is independent of the
  // eight markets and of the player's wealth/fame. These are newly introduced
  // histories, never retroactive upgrades to an existing rival.
  const ENTRY_COHORTS = [
    {id:'emerging',name:'Nueva Voz',label:'Emergente',min:350,span:1650,listeners:18,fans:4,subscribers:8,views:180,career:1,craft:52},
    {id:'local',name:'Contraluz',label:'Escena local',min:5000,span:15000,listeners:16,fans:3,subscribers:8,views:200,career:40,craft:56},
    {id:'regional',name:'Frontera',label:'Circuito regional',min:40000,span:120000,listeners:14,fans:2.5,subscribers:7,views:250,career:150,craft:62},
    {id:'established',name:'Vértice',label:'Trayectoria consolidada',min:300000,span:900000,listeners:12,fans:1.5,subscribers:5,views:600,career:350,craft:68},
    {id:'major',name:'Órbita',label:'Primera línea',min:2000000,span:4000000,listeners:11,fans:1,subscribers:3,views:900,career:650,craft:74}
  ];
  // Seed history is a rule of this fictional world, independent of the save.
  const SEEDS = [
    ['kairo','Kairo','co','trap',1800,35000,800,19000,1800000,32,58],
    ['nerea','Nerea','cl','rock',28000,450000,22000,130000,27000000,110,77],
    ['lazaro','Lázaro','mx','rap',620000,7200000,450000,2400000,840000000,380,83],
    ['valentina','Valentina Cruz','co','pop',5600000,42000000,3200000,15000000,8400000000,640,87],
    ['rayo_sur','Rayo Sur','ar','trap',140000,2600000,110000,680000,190000000,190,74],
    ['monte','MONTE','pe','hip-hop',12000,210000,9000,65000,7000000,75,79],
    ['costa_azul','Costa Azul','pr','reggae',12000000,64000000,4800000,28000000,14000000000,820,84],
    ['marea_roja','Marea Roja','do','urbano',320000,4700000,260000,1100000,330000000,280,76],
    ['iara','IARA','br','pop',8600000,53000000,3500000,22000000,12000000000,760,88],
    ['roto','ROTO','co','trap',650,14000,300,7200,420000,18,55],
    ['luz_noche','Luz de Noche','mx','R&B',1100000,9000000,600000,3600000,1700000000,430,81],
    ['cobalto','Cobalto','cl','rap',3200000,24000000,1600000,8100000,6200000000,1100,85]
  ];
  const TITLES = ['La ciudad despierta','Kilómetro cero','Nadie nos espera','Lado B','Cielo de concreto','Volver sin ruido','Hora de salida','Antes del amanecer','Señal de humo','Fuera de foco','Mapa sin norte','Última frecuencia'];
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const count = n => Math.round(clamp(Number.isFinite(n) ? n : 0, 0, MAX));
  const keep = (a, cap = CAP) => { if (a.length > cap) a.splice(0, a.length - cap); return a; };
  const clone = a => JSON.parse(JSON.stringify(a));
  function random(w) {
    // xorshift32, unsigned state. Its stream is owned only by this subsystem.
    let x = w.rng >>> 0;
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    w.rng = x >>> 0;
    return w.rng / 4294967296;
  }
  const pick = (w, a) => a[Math.floor(random(w) * a.length)];
  function seedValue(input) {
    if (input === undefined) return 1635498545;
    let h = 2166136261;
    const s = String(input);
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
    return h || 1635498545;
  }
  function news(w, week, kind, artist, text) {
    keep(w.news.push({week,kind,artistId:artist ? artist.id : null,text}) && w.news,80);
  }
  function initialArtist(row, i, start) {
    const [id,name,market,genre,dailyStreams,monthlyListeners,activeFans,youtubeSubscribers,totalViews,careerWeeks,craft] = row;
    const strength = Object.fromEntries(MARKETS.map(m => [m, m === market ? 1 : .12 + ((i * 7 + MARKETS.indexOf(m) * 3) % 9) / 40]));
    if (market === 'br') MARKETS.forEach(m => { if (m !== 'br') strength[m] *= .6; });
    return {
      id,name,market,genre,isFictional:true,role:id === 'kairo' ? 'Rival de la primera escena' : 'Artista del universo',
      dailyStreams,monthlyListeners,activeFans,youtubeSubscribers,totalViews,
      totalSpotifyStreams:count(dailyStreams * careerWeeks * 7 * .5),
      careerWeeks,craft,cataloguePower:dailyStreams,listenerRatio:monthlyListeners / dailyStreams,
      fanRatio:activeFans / monthlyListeners,videoRatio:.55 + (i % 5) * .33,
      momentum:1,status:'writing',statusUntil:start + 2 + (i % 4),
      nextProjectType:i % 4 === 0 ? 'album' : 'single',lastReleaseWeek:Math.max(0, start - 2 - (i % 5)),
      latestTitle:'Catálogo anterior',releases:[],releaseCount:Math.max(1,Math.floor(careerWeeks / 18)),
      historicalAlbums:Math.floor(careerWeeks / 75),successfulReleases:0,failedReleases:0,
      toursCompleted:0,tourMarkets:[],history:[],retirementWeek:null,
      historyOrigin:'Historial inicial ficticio definido por las reglas del universo, no por la carrera del jugador.',
      marketStrength:strength
    };
  }
  function ensure(state) {
    if (!state || typeof state !== 'object' || Array.isArray(state)) throw new TypeError('Se necesita un estado de partida.');
    if (state.world) {
      if (state.world.version !== VERSION || !Array.isArray(state.world.artists) || !Number.isSafeInteger(state.world.lastCompletedWeek)) throw new Error('El estado del universo no es compatible; no se reemplazó su historial.');
      // Diagnostic curves are bounded; cumulative streams, careers and RNG stay intact.
      state.world.artists.forEach(a => { if (Array.isArray(a.history)) keep(a.history); });
      if (Array.isArray(state.world.chartHistory)) keep(state.world.chartHistory);
      if (Array.isArray(state.world.news)) keep(state.world.news,80);
      state.world.historyRetentionWeeks = CAP;
      return state.world;
    }
    const start = Number.isSafeInteger(state.week) && state.week >= 1 ? state.week : 1;
    const w = {
      version:VERSION,week:start,startWeek:start,lastCompletedWeek:start - 1,rng:seedValue(state.worldSeed),historyRetentionWeeks:CAP,
      artists:SEEDS.map((row,i) => initialArtist(row,i,start)),news:[],marketPressure:{},marketStats:{},charts:{},chartHistory:[],
      trends:Object.fromEntries(MARKETS.map((m,i) => [m,{genre:GENRES[i % GENRES.length],until:start + 8 + i} ])),
      balanceStatus:'Provisional: los rangos sirven para probar carreras a largo plazo; no representan datos de artistas reales.'
    };
    state.world = w;
    rebuildCharts(w, start, false);
    return w;
  }
  function release(w, a, week) {
    const quality = clamp(a.craft + (random(w) - .5) * 30, 25, 99);
    const roll = random(w);
    const outcome = roll < .13 ? 'breakout' : roll > .8 ? 'disappointment' : 'steady';
    const lift = outcome === 'breakout' ? 1.2 + random(w) * .8 : outcome === 'disappointment' ? .12 + random(w) * .2 : .45 + random(w) * .5;
    const type = a.nextProjectType;
    const peak = count(clamp(a.cataloguePower * lift * (quality / 75) * (type === 'album' ? 1.5 : 1), 50, 24000000));
    const collaborator = random(w) < .25 ? pick(w, w.artists.filter(p => p.id !== a.id && p.status !== 'retired')) : null;
    const title = pick(w,TITLES) + ' ' + (a.releaseCount + 1);
    const r = {id:a.id+'-'+week,title,type,week,quality:Math.round(quality),outcome,dailyStreams:peak,peakDaily:peak,totalStreams:0,collaboratorId:collaborator ? collaborator.id : null};
    a.releases.push(r);
    if (a.releases.length > 24) a.releases.shift();
    a.releaseCount++; a.lastReleaseWeek = week; a.latestTitle = title;
    a.status = 'promotion'; a.statusUntil = week + 3 + Math.floor(random(w) * 3);
    a.momentum = clamp(a.momentum + (outcome === 'breakout' ? .5 : outcome === 'disappointment' ? -.2 : .1), .08, 3.5);
    a.cataloguePower = clamp(a.cataloguePower * (outcome === 'breakout' ? 1.12 : outcome === 'disappointment' ? .94 : 1.025), 50, 60000000);
    if (outcome === 'disappointment') a.failedReleases++; else a.successfulReleases++;
    if (collaborator) {
      collaborator.momentum = clamp(collaborator.momentum + .07, .08, 3.5);
      news(w,week,'feature',a,a.name+' publica «'+title+'» junto a '+collaborator.name+'. La colaboración abre exposición compartida.');
    } else news(w,week,'release',a,a.name+' lanza '+(type === 'album' ? 'el álbum' : 'el single')+' «'+title+'». '+(outcome === 'breakout' ? 'El estreno supera su demanda habitual.' : outcome === 'disappointment' ? 'El estreno queda por debajo de su campaña.' : 'Su público empieza a responder.'));
  }
  function changePhase(w, a, week) {
    if (a.status === 'retired' || week < a.statusUntil) return;
    if (a.status === 'writing') { release(w,a,week); return; }
    if (a.status === 'promotion') {
      if (random(w) < .66) {
        a.status = 'tour'; a.statusUntil = week + 3 + Math.floor(random(w) * 6);
        const second = pick(w,MARKETS.filter(m => m !== a.market));
        a.tourMarkets = [a.market,second];
        news(w,week,'tour',a,a.name+' inicia una gira por '+a.tourMarkets.map(m => m.toUpperCase()).join(' y ')+'. La convocatoria se mide por plaza.');
      } else { a.status = 'rest'; a.statusUntil = week + 3 + Math.floor(random(w) * 6); }
      return;
    }
    if (a.status === 'tour') {
      a.toursCompleted++; a.status = 'rest'; a.statusUntil = week + 4 + Math.floor(random(w) * 8);
      a.tourMarkets.forEach(m => { a.marketStrength[m] = clamp(a.marketStrength[m] + .025, .05, 1); });
      a.tourMarkets = [];
      news(w,week,'rest',a,a.name+' cierra su gira y descansa. Su catálogo sigue recibiendo escuchas.');
      return;
    }
    a.status = 'writing'; a.nextProjectType = random(w) < .26 ? 'album' : 'single';
    a.statusUntil = week + (a.nextProjectType === 'album' ? 10 : 3) + Math.floor(random(w) * 6);
  }
  function updateArtist(w, a, week) {
    a.careerWeeks++;
    if (a.status !== 'retired' && a.careerWeeks > 900 && (a.careerWeeks >= 1850 || random(w) < .0018)) {
      a.status = 'retired'; a.retirementWeek = week; a.tourMarkets = [];
      news(w,week,'retirement',a,a.name+' anuncia su retiro de lanzamientos y giras. El catálogo permanece activo.');
    }
    changePhase(w,a,week);
    const trendMatch = w.trends[a.market].genre === a.genre;
    const noise = (random(w) - .5) * .026;
    a.cataloguePower = clamp(a.cataloguePower * (a.status === 'retired' ? .997 : (trendMatch ? 1.0015 : .999) + noise), 40, 60000000);
    a.momentum = clamp(a.momentum * .94 + .06, .08, 3.5);
    let releaseStreams = 0;
    a.releases.forEach(r => {
      const age = week - r.week;
      if (age > 0) r.dailyStreams = count(r.dailyStreams * (age < 4 ? .91 : age < 12 ? .96 : .985));
      r.totalStreams = count(r.totalStreams + r.dailyStreams * 7);
      releaseStreams += r.dailyStreams;
    });
    const tourLift = a.status === 'tour' ? 1.05 : 1;
    const target = clamp(a.cataloguePower * a.momentum * tourLift + releaseStreams * .5, 0, 100000000);
    a.dailyStreams = count(a.dailyStreams * .7 + target * .3);
    const listenerTarget = clamp(a.dailyStreams * a.listenerRatio * .75, 0, 300000000);
    a.monthlyListeners = count(a.monthlyListeners * .92 + listenerTarget * .08);
    const fanTarget = a.monthlyListeners * a.fanRatio * (a.status === 'tour' ? 1.08 : 1);
    a.activeFans = count(clamp(a.activeFans * .98 + fanTarget * .02, 0, a.monthlyListeners));
    const weeklyViews = count(a.dailyStreams * 7 * a.videoRatio * (.8 + random(w) * .4));
    a.totalViews = count(a.totalViews + weeklyViews);
    a.youtubeSubscribers = count(clamp(a.youtubeSubscribers * .9996 + weeklyViews * (.00015 + random(w) * .0003), 0, 500000000));
    a.totalSpotifyStreams = count(a.totalSpotifyStreams + a.dailyStreams * 7);
    keep(a.history.push({week,dailyStreams:a.dailyStreams,monthlyListeners:a.monthlyListeners,activeFans:a.activeFans,youtubeSubscribers:a.youtubeSubscribers,status:a.status}) && a.history);
  }
  function rebuildCharts(w, week, archive) {
    MARKETS.forEach(m => {
      const previous = w.charts[m] || [];
      const recent = w.artists.filter(a => a.status !== 'retired' && week - a.lastReleaseWeek >= 0 && week - a.lastReleaseWeek < 4);
      const localReleases = recent.filter(a => a.market === m || a.marketStrength[m] > .5).length;
      const radioCompetition = clamp(.35 + localReleases * .07 + w.artists.reduce((n,a) => n + (a.status === 'tour' && a.tourMarkets.includes(m) ? .04 : 0),0), .15, 1);
      const saturation = clamp(.35 + localReleases * .11 + (w.trends[m].genre === 'pop' ? .06 : 0), .1, 1);
      const rows = w.artists.map(a => {
        const affinity = a.marketStrength[m];
        const trendLift = w.trends[m].genre === a.genre ? 1.15 : 1;
        const dailyStreams = count(a.dailyStreams * affinity * trendLift * (m === a.market ? .2 : .025));
        const radioScore = Math.round(clamp((Math.log10(1 + dailyStreams) - 2) * 15 + (a.status === 'promotion' ? 12 : 0) - radioCompetition * 12,0,100));
        return {artistId:a.id,name:a.name,title:a.latestTitle,dailyStreams,radioScore};
      }).sort((a,b) => b.dailyStreams - a.dailyStreams || a.artistId.localeCompare(b.artistId)).slice(0,10);
      w.charts[m] = rows.map((r,i) => { const prior = previous.find(p => p.artistId === r.artistId); return {...r,rank:i+1,previousRank:prior ? prior.rank : null,change:prior ? prior.rank-(i+1) : null}; });
      const attentionMultiplier = Math.round(clamp(1.1-saturation*.3,.8,1.1)*10000)/10000;
      w.marketStats[m] = {saturation:Math.round(saturation*1000)/1000,radioCompetition:Math.round(radioCompetition*1000)/1000,trend:w.trends[m].genre,releaseCount:localReleases,leader:rows[0] ? rows[0].name : null,attentionMultiplier};
      w.marketPressure[COUNTRIES[m]] = attentionMultiplier;
    });
    w.marketPressure.Caribe = Math.round((w.marketPressure['Puerto Rico'] + w.marketPressure['República Dominicana']) / 2 * 10000) / 10000;
    w.marketPressure.USA = 1;
    if (archive) keep(w.chartHistory.push({week,leaders:Object.fromEntries(MARKETS.map(m => [m,w.charts[m].slice(0,3).map(r => ({artistId:r.artistId,rank:r.rank,dailyStreams:r.dailyStreams}))]))}) && w.chartHistory);
  }
  function tick(w, week) {
    MARKETS.forEach(m => {
      if (week >= w.trends[m].until) {
        w.trends[m] = {genre:pick(w,GENRES),until:week + 8 + Math.floor(random(w)*10)};
        news(w,week,'trend',null,'La programación de '+m.toUpperCase()+' da más espacio a '+w.trends[m].genre+'. La atención disponible cambia.');
      }
    });
    w.artists.forEach(a => updateArtist(w,a,week));
    // Replenish the active circuit slowly. Retired artists and their catalogue
    // are preserved; a newcomer is a distinct artist, never a reset of one.
    const active = w.artists.filter(a => a.status !== 'retired');
    const retiredReady = w.artists.some(a => a.status === 'retired' && Number.isInteger(a.retirementWeek) && week-a.retirementWeek >= 52);
    if (active.length < 12 && retiredReady && week % 13 === 0) {
      const sequence = (w.nextEmergent || 0) + 1;
      w.nextEmergent = sequence;
      const market = MARKETS[(sequence-1)%MARKETS.length], genre = GENRES[(sequence-1)%GENRES.length];
      const cohort=ENTRY_COHORTS[(sequence-1)%ENTRY_COHORTS.length];
      const n = cohort.min + Math.floor(random(w)*cohort.span), id='emergente-'+week+'-'+sequence;
      const artist=initialArtist([id,cohort.name+' '+sequence,market,genre,n,n*cohort.listeners,count(n*cohort.fans),n*cohort.subscribers,n*cohort.views,cohort.career,cohort.craft+Math.floor(random(w)*16)],sequence,week);
      artist.role=cohort.label+' del circuito';artist.entryTier=cohort.id;artist.entryWeek=week;artist.priorCareerWeeks=cohort.career;
      artist.historyOrigin='Trayectoria previa ficticia: '+cohort.career+' semanas antes de incorporarse al universo visible en S'+week+'. Escala de diseño provisional, independiente de la carrera del jugador.';
      w.artists.push(artist);
      news(w,week,'emergent',artist,artist.name+' entra al circuito visible desde '+COUNTRIES[market]+' · '+cohort.label.toLowerCase()+'. Su trayectoria previa es ficticia.');
    }
    if (w.artists.length > 48) {
      const retired=w.artists.findIndex(a=>a.status==='retired' && Number.isInteger(a.retirementWeek) && week-a.retirementWeek>=52);
      if(retired>=0){if(!Array.isArray(w.retiredArchive))w.retiredArchive=[];w.retiredArchive.push(w.artists.splice(retired,1)[0]);}
    }
    // Public events at 3–4 week intervals; no claims about real people.
    if ((week - w.startWeek) % 4 === 3) {
      const candidates = w.artists.filter(a => a.status !== 'retired');
      if (candidates.length) {
        const a = pick(w,candidates), good = random(w) < .55;
        a.momentum = clamp(a.momentum * (good ? 1.15 : .83), .08, 3.5);
        news(w,week,good ? 'discovery' : 'setback',a,good ? 'Una sesión de '+a.name+' circula por comunidades nuevas.' : 'La campaña de '+a.name+' pierde atención frente a varios estrenos rivales.');
      }
    }
    rebuildCharts(w,week,true);
    w.lastCompletedWeek = week; w.week = week + 1;
  }
  function advance(state, completedWeek) {
    if (!Number.isSafeInteger(completedWeek) || completedWeek < 0) return {advanced:0,reason:'invalid_week'};
    const w = ensure(state);
    if (completedWeek <= w.lastCompletedWeek) return {advanced:0,week:w.week,reason:'already_completed'};
    const steps = completedWeek - w.lastCompletedWeek;
    if (steps > 10000) throw new RangeError('El cierre del universo supera 10.000 semanas; divídelo en lotes explícitos.');
    for (let week = w.lastCompletedWeek + 1; week <= completedWeek; week++) {
      tick(w,week);
      const chartApi = charts || root.RapCharts;
      if (chartApi && typeof chartApi.capture === 'function') chartApi.capture(state,week);
    }
    return {advanced:steps,week:w.week,completedWeek:w.lastCompletedWeek};
  }
  function standings(state) {
    return ensure(state).artists.map(a => ({
      id:a.id,name:a.name,market:COUNTRIES[a.market],marketCode:a.market,dailyStreams:a.dailyStreams,monthlyListeners:a.monthlyListeners,
      activeFans:a.activeFans,youtubeSubscribers:a.youtubeSubscribers,totalViews:a.totalViews,
      status:STATUS[a.status] || a.status,statusCode:a.status,lastReleaseWeek:a.lastReleaseWeek,
      genre:a.genre,latestTitle:a.latestTitle,isFictional:true
    })).sort((a,b) => b.dailyStreams-a.dailyStreams || a.id.localeCompare(b.id));
  }
  function modifiers(state) {
    const w = ensure(state);
    const requested = state.career?.marketId || state.currentMarket || state.market || state.player?.market || state.progression?.market;
    const countryCode = MARKETS.find(m => COUNTRIES[m] === requested);
    const m = MARKETS.includes(requested) ? requested : countryCode || (requested === 'Caribe' ? 'pr' : 'co');
    const p = w.marketStats[m];
    return {attentionMultiplier:requested === 'USA' ? 1 : requested === 'Caribe' ? w.marketPressure.Caribe : p.attentionMultiplier,market:COUNTRIES[m],marketCode:m,saturation:p.saturation};
  }
  const api = {ensure,advance,standings,modifiers};
  root.RapWorld = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
