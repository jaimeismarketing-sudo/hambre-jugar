(function (root) {
  'use strict';

  const chapters = Object.freeze({
    release: {
      title: 'Un estreno con dirección', weeks: 6, artist: true,
      description: 'Publica una obra y llega al público por dos vías distintas. Cada actividad usa la agenda y el presupuesto habituales.',
      requirement: 'Necesitas una obra en producción o un lanzamiento anterior.',
      destinations: [['studio', 'Ir al estudio'], ['week', 'Planificar difusión']]
    },
    circuit: {
      title: 'De sala en sala', weeks: 8, artist: true,
      description: 'Toca ante público en dos salas distintas. Tú eliges cuánto pagar por producción, viaje y descanso.',
      requirement: 'Disponible tras el primer directo o con 100 fans.',
      destinations: [['venues', 'Comparar escenarios'], ['week', 'Revisar agenda']]
    },
    roster: {
      title: 'La apuesta del sello', weeks: 8, artist: false,
      description: 'Elige a un artista representado. Publica una obra suya y coordina dos sesiones, fechas o acciones de promoción para esa carrera.',
      requirement: 'Necesitas un cliente con un acuerdo activo.',
      destinations: [['management', 'Ir al roster']]
    }
  });
  for (const chapter of Object.values(chapters)) {
    chapter.destinations.forEach(Object.freeze);
    Object.freeze(chapter.destinations);
    Object.freeze(chapter);
  }
  const outreach = new Set(['social', 'interview', 'street', 'collab']);
  const rosterWork = new Set(['management_record', 'management_promote', 'management_show']);
  const statuses = new Set(['active', 'earned', 'claimed', 'archived', 'expired', 'cancelled']);
  const rewardChoices = new Set(['reputation', 'skill']);
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const validWeek = (week, maximum) => Number.isSafeInteger(week) && week > 0 && week <= maximum;
  const list = value => Array.isArray(value) ? value : [];
  const blocked = s => Boolean(s.financialHold || s.continuityHold);

  function availableClients(s) {
    if (!['manager', 'both'].includes(s.management?.role)) return [];
    return list(s.management.artists).filter(client =>
      (client.contract?.status === 'active' && s.week < client.contract.endsWeek) ||
      list(s.label?.contracts).some(contract => contract.artistId === client.id &&
        contract.status === 'active' && s.week >= contract.startedWeek && s.week < contract.endsWeek)
    );
  }

  function lastAttempt(s, kind) {
    return list(s.careerArcs?.records).findLast(record => record.kind === kind);
  }

  function offer(s, kind) {
    const chapter = chapters[kind];
    const previous = lastAttempt(s, kind);
    if (blocked(s)) return 'La carrera debe estar disponible para decidir.';
    if (s.activeWeek) return 'Elige el capítulo cuando termine la semana.';
    if (list(s.careerArcs?.records).some(record => ['active', 'earned'].includes(record.status))) {
      return 'Cierra o archiva primero tu capítulo actual.';
    }
    if (previous && s.week < previous.startedWeek + 13) return 'Disponible de nuevo en S' + (previous.startedWeek + 13) + '.';
    if (chapter.artist && s.management?.role === 'manager') return 'Este capítulo requiere una carrera de artista.';
    if (s.week < 3) return 'Se abre en la semana 3.';
    if (kind === 'release' && !list(s.projects).some(p => ['working', 'ready'].includes(p.status)) && !list(s.releases).some(r => !r.canonical)) return chapter.requirement;
    if (kind === 'circuit' && !s.stats?.totalShows && !(s.player?.fans >= 100)) return chapter.requirement;
    if (kind === 'roster' && availableClients(s).length === 0) return chapter.requirement;
    return '';
  }

  function progress(record) {
    const { released, channels, rooms, sessions } = record;
    if (record.kind === 'release') return [
      { label: 'Estreno', value: Number(released), target: 1 },
      { label: 'Vías de difusión', value: channels.length, target: 2 }
    ];
    if (record.kind === 'circuit') return [{ label: 'Salas con público', value: rooms.length, target: 2 }];
    return [
      { label: 'Estreno del cliente', value: Number(released), target: 1 },
      { label: 'Acciones coordinadas', value: sessions, target: 2 }
    ];
  }

  function summary(s) {
    const records = list(s.careerArcs?.records);
    const rows = records.map(record => ({
      ...record,
      rooms: [...record.rooms],
      channels: [...record.channels],
      title: chapters[record.kind].title,
      description: chapters[record.kind].description,
      destinations: chapters[record.kind].destinations,
      clientName: list(s.management?.artists).find(client => client.id === record.clientId)?.name || '',
      progress: progress(record)
    }));
    return {
      current: rows.findLast(record => ['active', 'earned'].includes(record.status)) || null,
      recent: rows.filter(record => !['active', 'earned'].includes(record.status)).slice(-5).reverse(),
      offers: Object.entries(chapters)
        .filter(([, chapter]) => chapter.artist ? s.management?.role !== 'manager' : ['manager', 'both'].includes(s.management?.role))
        .map(([id, chapter]) => ({ id, ...chapter, unavailable: offer(s, id) })),
      clients: availableClients(s).map(({id, name}) => ({id, name})),
      canDecide: !blocked(s) && !s.activeWeek,
      canEarnSkill: (s.player?.skillPoints || 0) < 1000000
    };
  }

  function act(s, payload = {}) {
    if (blocked(s) || s.activeWeek) return { ok: false, message: 'Puedes decidir al volver a la planificación.' };
    const { decision, kind, id, reward } = payload;
    if (decision === 'start') {
      if (typeof kind !== 'string' || !has(chapters, kind)) return { ok: false, message: 'Elige un capítulo válido.' };
      const unavailable = offer(s, kind);
      if (unavailable) return { ok: false, message: unavailable };
      const clientId = kind === 'roster' ? payload.clientId : null;
      if (kind === 'roster' && !availableClients(s).some(client => client.id === clientId)) {
        return { ok: false, message: 'Elige un cliente con un acuerdo activo.' };
      }
      const state = s.careerArcs || { version: 1, records: [] };
      state.records = state.records.slice(-11);
      state.records.push({
        id: kind + '@' + s.week, kind, clientId, status: 'active',
        startedWeek: s.week, dueWeek: s.week + chapters[kind].weeks - 1,
        lastClosedWeek: s.week - 1, closedWeek: null, reward: null,
        released: false, channels: [], rooms: [], sessions: 0
      });
      s.careerArcs = state;
      return { ok: true, message: 'Comienza «' + chapters[kind].title + '». Tú decides cómo organizar la agenda.' };
    }

    const record = list(s.careerArcs?.records).find(row => row.id === id);
    if (!record) return { ok: false, message: 'No se encontró ese capítulo.' };
    if (decision === 'cancel' && record.status === 'active') {
      record.status = 'cancelled';
      record.closedWeek = s.week;
      return { ok: true, message: 'Capítulo archivado. Conservas el trabajo que ya hiciste.' };
    }
    if (decision === 'archive' && record.status === 'earned') {
      record.status = 'archived';
      return { ok: true, message: 'Capítulo cerrado. El resultado queda en tu historial.' };
    }
    if (decision !== 'claim' || record.status !== 'earned' || !rewardChoices.has(reward)) {
      return { ok: false, message: 'Esa decisión ya no está disponible.' };
    }
    if (reward === 'skill') {
      if (s.player.skillPoints >= 1000000) return { ok: false, message: 'Ya tienes el máximo de puntos. Puedes elegir reputación.' };
      s.player.skillPoints = (s.player.skillPoints || 0) + 1;
    }
    else s.player.reputation = Math.min(100, Math.round((s.player.reputation + 2) * 100) / 100);
    record.reward = reward;
    record.status = 'claimed';
    return { ok: true, message: reward === 'skill' ? 'Capítulo cerrado. Ganaste 1 punto de habilidad.' : 'Capítulo cerrado. Ganaste hasta 2 puntos de reputación.' };
  }

  function onRelease(s, ownerId) {
    const record = list(s.careerArcs?.records).find(row => row.status === 'active');
    if (!record || s.week < record.startedWeek || s.week > record.dueWeek) return;
    if ((record.kind === 'release' && ownerId === 'player') ||
        (record.kind === 'roster' && ownerId === record.clientId)) record.released = true;
  }

  function closeWeek(s, report) {
    const record = list(s.careerArcs?.records).find(row => row.status === 'active');
    if (!record || s.week <= record.lastClosedWeek || s.week < record.startedWeek) return;
    const active = s.activeWeek;
    const actions = list(active?.actionResults).filter(action => action.status === 'completed');
    if (record.kind === 'release') {
      for (const action of actions) {
        if (record.channels.length === 2) break;
        if (outreach.has(action.id) && !record.channels.includes(action.id)) record.channels.push(action.id);
      }
    } else if (record.kind === 'circuit') {
      for (const show of list(report.shows)) {
        if (record.rooms.length === 2) break;
        if (show.attendance > 0 && typeof show.venue === 'string' && show.venue && !record.rooms.includes(show.venue)) record.rooms.push(show.venue);
      }
    } else {
      record.sessions = Math.min(2, record.sessions + actions.filter(action =>
        rosterWork.has(action.id) && active.lockedPlan[action.index]?.artistId === record.clientId
      ).length);
    }
    record.lastClosedWeek = s.week;
    if (progress(record).every(metric => metric.value === metric.target)) {
      record.status = 'earned';
      record.closedWeek = s.week;
      report.highlights.unshift('Capítulo cumplido: ' + chapters[record.kind].title + '. Elige la recompensa en Carrera.');
    } else if (s.week >= record.dueWeek) {
      record.status = 'expired';
      record.closedWeek = s.week;
      report.highlights.unshift('Terminó el plazo de «' + chapters[record.kind].title + '». El trabajo realizado se conserva.');
    }
  }

  function validate(s) {
    const state = s.careerArcs;
    if (state === undefined) return [];
    const error = ['Registro de capítulos de carrera inválido.'];
    if (!state || state.version !== 1 || !Array.isArray(state.records) || state.records.length > 12) return error;
    const ids = new Set();
    let pending = 0;
    for (const record of state.records) {
      if (!record || typeof record.kind !== 'string' || !has(chapters, record.kind) || !statuses.has(record.status)) return error;
      const chapter = chapters[record.kind];
      const isRoster = record.kind === 'roster';
      if (!validWeek(record.startedWeek, s.week) || record.id !== record.kind + '@' + record.startedWeek || ids.has(record.id) ||
          record.dueWeek !== record.startedWeek + chapter.weeks - 1 ||
          !Number.isSafeInteger(record.lastClosedWeek) || record.lastClosedWeek < record.startedWeek - 1 || record.lastClosedWeek > Math.min(s.week, record.dueWeek) ||
          (record.status === 'active' ? record.closedWeek !== null : !validWeek(record.closedWeek, Math.min(s.week, record.dueWeek)) || record.closedWeek < record.startedWeek) ||
          (record.status === 'claimed' ? !rewardChoices.has(record.reward) : record.reward !== null) ||
          (isRoster ? typeof record.clientId !== 'string' || !record.clientId || record.clientId.length > 200 : record.clientId !== null) ||
          typeof record.released !== 'boolean' || !Number.isInteger(record.sessions) || record.sessions < 0 || record.sessions > 2 ||
          !Array.isArray(record.channels) || record.channels.length > 2 || new Set(record.channels).size !== record.channels.length || record.channels.some(channel => !outreach.has(channel)) ||
          !Array.isArray(record.rooms) || record.rooms.length > 2 || new Set(record.rooms).size !== record.rooms.length ||
          record.rooms.some(room => typeof room !== 'string' || !room || room.length > 200)) return error;
      if ((record.kind !== 'release' && record.channels.length) || (record.kind !== 'circuit' && record.rooms.length) ||
          (!isRoster && record.sessions) || (record.kind === 'circuit' && record.released)) return error;
      const done = progress(record).every(metric => metric.value === metric.target);
      const awaitingClose = record.status === 'active' && Boolean(s.activeWeek);
      if (!awaitingClose && ['earned', 'claimed', 'archived'].includes(record.status) !== done) return error;
      if (record.status === 'active' && s.week > record.dueWeek) return error;
      if (['active', 'earned'].includes(record.status) && ++pending > 1) return error;
      ids.add(record.id);
    }
    return [];
  }

  const api = { act, onRelease, closeWeek, summary, validate };
  root.RapCareerArcs = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
