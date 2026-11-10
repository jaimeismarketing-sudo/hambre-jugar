(function (root) {
  'use strict';

  // First pacing values, subject to playtesting. These limits affect offers,
  // never a contract, a spending authorization or the availability of an action.
  const WINDOWS = { studio: 2, 'studio-release': 4, promoter: 3, roster: 4 };
  const ROTATION = ['studio', 'promoter', 'roster'];
  const EXTENSION = 2;
  const HISTORY_LIMIT = 40;
  const SETTLED = ['fulfilled', 'breached', 'declined', 'expired', 'withdrawn'];
  const PROPOSAL_LIFETIME = 1;
  const RECORDING = new Set(['record', 'home_record']);
  const REHEARSAL = new Set(['rehearse', 'band_rehearsal']);

  function weekAt(day) { return Math.floor(day / 7) + 1; }
  function namedId(id) { return typeof id === 'string' && id.length > 0 && id.length <= 180; }
  function weekNumber(week) { return Number.isSafeInteger(week) && week >= 1; }
  function weekWithin(week, from, to) { return weekNumber(week) && week >= from && week <= to; }
  function managementRole(s) { return ['manager', 'both'].includes(s.management?.role); }
  function artistRole(s) { return s.management?.role !== 'manager'; }
  function findProject(projects, id) { return projects?.find(project => project.id === id); }
  function findArtist(s, id) { return s.management?.artists?.find(artist => artist.id === id); }
  function openProject(project) { return ['working', 'ready'].includes(project?.status); }

  function canDirectThrough(s, artist, week) {
    const covers = contract => contract?.status === 'active' && contract.startedWeek <= s.week && contract.endsWeek > week;
    return managementRole(s) && !!artist && (covers(artist.contract) ||
      s.label?.contracts?.some(contract => contract.artistId === artist.id && covers(contract)) === true);
  }

  function ensure(s) {
    if (s.commitments === undefined) {
      s.commitments = { version: 1, startedWeek: s.week, nextOfferWeek: s.week + 1, nextId: 1, rotation: 0, current: null, history: [] };
    }
    return s.commitments;
  }

  function refusedRecently(state, candidate, week) {
    return state.history.some(entry => entry.kind === candidate.kind && entry.contactId === candidate.contactId &&
      entry.status === 'breached' && week < entry.resolvedWeek + 12);
  }

  function chooseOffer(s, state, kind) {
    if (kind === 'studio' && artistRole(s)) {
      const project = s.projects?.find(p => p.status === 'working' && !state.history.some(entry =>
        entry.kind === 'studio' && entry.projectId === p.id && entry.status === 'fulfilled'));
      if (project) return { kind, contactId: 'luna', projectId: project.id, projectName: project.name };
    }
    if (kind === 'promoter' && artistRole(s) && (s.releases?.length || s.stats?.totalShows > 0)) {
      const marketId = s.career?.marketId;
      if (namedId(marketId) && !state.history.some(entry => entry.kind === kind && entry.marketId === marketId &&
        entry.status === 'fulfilled' && s.week < entry.resolvedWeek + 16)) {
        return { kind, contactId: 'bruno', marketId };
      }
    }
    if (kind === 'roster' && managementRole(s)) {
      for (const artist of s.management?.artists || []) {
        if (!canDirectThrough(s, artist, s.week + WINDOWS.roster)) continue;
        const project = artist.projects?.find(openProject);
        if (!project) continue;
        const candidate = { kind, contactId: artist.id, artistId: artist.id, artistName: artist.name,
          projectId: project.id, projectName: project.name };
        if (!refusedRecently(state, candidate, s.week)) return candidate;
      }
    }
    return null;
  }

  function openWeek(s) {
    if (s.financialHold || s.continuationReady === false) return;
    const state = ensure(s);
    if (state.current || s.week < state.nextOfferWeek) return;
    let candidate = null;
    // A specific follow-up to an actual session is more meaningful than a new random offer.
    const last = state.history.at(-1);
    if (artistRole(s) && last?.kind === 'studio' && last.status === 'fulfilled') {
      const project = findProject(s.projects, last.projectId);
      const followup = project && { kind: 'studio-release', contactId: 'luna', projectId: project.id, projectName: project.name };
      if (openProject(project) && !refusedRecently(state, followup, s.week)) candidate = followup;
    }
    for (let offset = 0; !candidate && offset < ROTATION.length; offset++) {
      const index = (state.rotation + offset) % ROTATION.length;
      const offer = chooseOffer(s, state, ROTATION[index]);
      if (!offer || refusedRecently(state, offer, s.week)) continue;
      candidate = offer;
      state.rotation = (index + 1) % ROTATION.length;
    }
    if (!candidate) return;
    state.current = { ...candidate, id: 'promise-' + state.nextId++, status: 'offered',
      offeredWeek: s.week, expiresWeek: s.week + PROPOSAL_LIFETIME };
  }

  function targetUnavailableReason(s, entry, deadline) {
    if (entry.kind === 'roster') {
      if (!managementRole(s)) return 'El rol actual no permite dirigir el proyecto del roster.';
      const artist = findArtist(s, entry.artistId);
      if (!canDirectThrough(s, artist, deadline)) return 'No hay un acuerdo activo que cubra el plazo de este lanzamiento.';
      if (!openProject(findProject(artist.projects, entry.projectId))) return 'La obra del cliente ya no está pendiente de publicación.';
      return '';
    }
    if (!artistRole(s)) return 'El rol actual no permite este compromiso de artista.';
    if (entry.kind === 'promoter') return '';
    const project = findProject(s.projects, entry.projectId);
    if (entry.kind === 'studio' && project?.status === 'working') return '';
    if (entry.kind === 'studio-release' && openProject(project)) return '';
    if (entry.kind === 'studio' && project?.status === 'ready') return 'La obra ya está lista y no necesita otra toma.';
    return 'La obra ya no está disponible para este compromiso.';
  }

  function archive(s, entry, status, closeReason) {
    const state = s.commitments;
    const relationship = s.relationships?.find(contact => contact.id === entry.contactId);
    const adjustment = status === 'fulfilled' ? 5 : status === 'breached' ? -5 : 0;
    if (adjustment && relationship && Number.isFinite(relationship.bond)) {
      relationship.bond = Math.min(100, Math.max(0, relationship.bond + adjustment));
    }
    state.history.push({ ...entry, status, resolvedWeek: s.week, ...(closeReason ? { closeReason } : {}) });
    if (state.history.length > HISTORY_LIMIT) state.history.shift();
    state.current = null;
    state.nextOfferWeek = s.week + (status === 'withdrawn' ? 1 : status === 'fulfilled' ? 2 : 4);
  }

  function act(s, payload) {
    const fail = message => ({ ok: false, message });
    const entry = s.commitments?.current;
    if (!entry || entry.id !== payload?.id) return fail('Ese compromiso ya no está disponible.');
    if (s.activeWeek || s.financialHold || s.continuationReady === false) return fail('Los compromisos se deciden en planificación.');
    if (entry.status === 'offered' && s.week <= entry.expiresWeek) {
      if (payload.decision === 'decline') {
        archive(s, entry, 'declined');
        return { ok: true, message: 'Propuesta rechazada. No se contrajo ningún compromiso.' };
      }
      if (payload.decision === 'accept') {
        const deadline = s.week + WINDOWS[entry.kind];
        const reason = targetUnavailableReason(s, entry, deadline);
        if (reason) return fail(reason);
        Object.assign(entry, { status: 'active', acceptedWeek: s.week, originalDueWeek: deadline, dueWeek: deadline });
        return { ok: true, message: 'Compromiso confirmado hasta el cierre de S' + deadline + '. Programa las actividades necesarias.' };
      }
    }
    if (payload.decision === 'renegotiate' && canRenegotiate(s, entry)) {
      entry.renegotiatedWeek = s.week;
      entry.dueWeek += EXTENSION;
      return { ok: true, message: 'Nuevo plazo hasta el cierre de S' + entry.dueWeek + '. Se conserva lo que ya hiciste.' };
    }
    return fail('Esta decisión no está disponible para el estado actual del compromiso.');
  }

  function canRenegotiate(s, entry) {
    return entry.status === 'active' && entry.renegotiatedWeek === undefined && s.week <= entry.dueWeek &&
      !targetUnavailableReason(s, entry, entry.dueWeek + EXTENSION);
  }

  function beforeActivity(s, item) {
    const entry = s.commitments?.current;
    if (entry?.status !== 'active' || entry.kind !== 'studio' || entry.sessionDay !== undefined || !RECORDING.has(item.id)) return null;
    const project = item.projectId ? findProject(s.projects, item.projectId) : s.projects?.find(p => p.status === 'working');
    return project?.id === entry.projectId && Number.isFinite(project.progress) ? project.progress : null;
  }

  function afterActivity(s, item, status, before) {
    const entry = s.commitments?.current, day = s.calendar?.day;
    if (status !== 'completed' || entry?.status !== 'active' || !Number.isSafeInteger(day) ||
      !weekWithin(weekAt(day), entry.acceptedWeek, entry.dueWeek)) return;
    if (entry.kind === 'studio' && RECORDING.has(item.id) && Number.isFinite(before) && entry.sessionDay === undefined &&
      findProject(s.projects, entry.projectId)?.progress > before) {
      entry.sessionDay = day;
    }
    if (entry.kind !== 'promoter') return;
    if (REHEARSAL.has(item.id) && entry.rehearsalDay === undefined) entry.rehearsalDay = day;
    if (item.id === 'show' && item.marketId === entry.marketId && entry.rehearsalDay < day && entry.showDay === undefined) {
      entry.showDay = day;
    }
  }

  function releaseEvidence(s, entry) {
    const owner = entry.kind === 'roster' ? findArtist(s, entry.artistId) : s;
    if (entry.kind === 'roster' ? !canDirectThrough(s, owner, s.week) : !artistRole(s)) return null;
    return owner?.releases?.find(release => release.projectId === entry.projectId && namedId(release.id) &&
      Number.isSafeInteger(release.releasedDay) && release.releasedDay >= 0 && release.releasedDay <= s.calendar.day &&
      release.releasedWeek === weekAt(release.releasedDay) &&
      weekWithin(release.releasedWeek, entry.acceptedWeek, Math.min(s.week, entry.dueWeek)));
  }

  function closeWeek(s, report) {
    const entry = s.commitments?.current;
    if (!entry || s.financialHold) return;
    if (entry.status === 'offered') {
      const reason = targetUnavailableReason(s, entry, s.week + 1 + WINDOWS[entry.kind]);
      if (reason) {
        archive(s, entry, 'withdrawn', reason);
        report?.highlights?.push('Propuesta retirada. ' + reason);
      } else if (s.week >= entry.expiresWeek) {
        archive(s, entry, 'expired');
      }
      return;
    }
    if (entry.status !== 'active') return;
    const release = ['studio-release', 'roster'].includes(entry.kind) ? releaseEvidence(s, entry) : null;
    if (release) {
      entry.releaseId = release.id;
      entry.releaseDay = release.releasedDay;
    }
    const fulfilled = entry.sessionDay !== undefined || entry.showDay !== undefined || entry.releaseDay !== undefined;
    if (!fulfilled && s.week < entry.dueWeek) return;
    const status = fulfilled ? 'fulfilled' : 'breached';
    archive(s, entry, status);
    report?.highlights?.push((fulfilled ? 'Compromiso cumplido · ' : 'Compromiso vencido · ') + describe(s, { ...entry, status }).title + '.');
  }

  function describe(s, entry) {
    const contact = entry.artistName || s.relationships?.find(person => person.id === entry.contactId)?.name ||
      (entry.contactId === 'bruno' ? 'Bruno Cruz' : 'Luna Vega');
    let title, detail, progress;
    if (entry.kind === 'studio') {
      title = 'Una toma para «' + entry.projectName + '»';
      detail = 'Graba una maqueta o una sesión de estudio que avance esta obra. La sesión ocupa agenda y mantiene su coste habitual.';
      progress = entry.sessionDay === undefined ? 'Falta completar la grabación.' : 'Grabación completada en S' + weekAt(entry.sessionDay) + '.';
    } else if (entry.kind === 'promoter') {
      title = 'Ensayo y fecha en ' + entry.marketId;
      detail = 'Completa un ensayo y después un concierto en ' + entry.marketId + '. Reserva el escenario por el canal habitual. La fecha puede generar pérdidas.';
      progress = entry.showDay !== undefined ? 'Ensayo y concierto completados.' : entry.rehearsalDay !== undefined ? 'Ensayo hecho. Falta el concierto.' : 'Faltan el ensayo y el concierto.';
    } else {
      title = (entry.kind === 'roster' ? 'Estreno del roster · ' : 'El siguiente paso · ') + entry.projectName;
      detail = (entry.kind === 'roster' ? 'Publica esta obra de ' + contact + ' bajo un acuerdo vigente. ' : 'Publica la misma obra después de la sesión acordada. ') +
        'Una fecha programada o una preventa no cuentan como estreno.';
      progress = entry.releaseDay === undefined ? 'Falta un estreno registrado en el catálogo.' : 'Estreno registrado en S' + weekAt(entry.releaseDay) + '.';
    }
    const outcomes = { fulfilled: 'Cumpliste lo acordado.', breached: 'Venció el plazo sin completar lo acordado. Este contacto espera antes de ofrecer otro compromiso similar.',
      declined: 'Dejaste pasar la propuesta.', expired: 'Venció la propuesta sin una decisión.', withdrawn: entry.closeReason };
    let unavailableReason = '';
    if (entry.status === 'offered') {
      if (s.financialHold || s.continuationReady === false) unavailableReason = 'La carrera debe estar disponible para decidir.';
      else if (s.activeWeek) unavailableReason = 'Podrás responder al volver a la planificación.';
      else if (s.week > entry.expiresWeek) unavailableReason = 'La propuesta ya venció.';
      else unavailableReason = targetUnavailableReason(s, entry, s.week + WINDOWS[entry.kind]);
    }
    return { ...entry, contact, title, detail, progress, outcome: outcomes[entry.status] || '',
      prospectiveDueWeek: s.week + WINDOWS[entry.kind], extension: EXTENSION,
      unavailableReason, canAccept: entry.status === 'offered' && !unavailableReason,
      canRenegotiate: !s.activeWeek && !s.financialHold && s.continuationReady !== false && canRenegotiate(s, entry) };
  }

  function summary(s) {
    const state = s.commitments;
    return { current: state?.current ? describe(s, state.current) : null,
      history: Array.isArray(state?.history) ? state.history.slice().reverse().map(entry => describe(s, entry)) : [] };
  }

  function validEntry(entry, state, s, allowedStatuses) {
    if (!entry || !Object.hasOwn(WINDOWS, entry.kind) || !allowedStatuses.includes(entry.status) ||
      typeof entry.id !== 'string' || !/^promise-[1-9]\d*$/.test(entry.id) || Number(entry.id.slice(8)) >= state.nextId ||
      !namedId(entry.contactId) || !weekWithin(entry.offeredWeek, state.startedWeek, s.week) ||
      entry.expiresWeek !== entry.offeredWeek + PROPOSAL_LIFETIME) return false;
    if (entry.kind === 'promoter') {
      if (entry.contactId !== 'bruno' || !namedId(entry.marketId)) return false;
    } else if (!namedId(entry.projectId) || !namedId(entry.projectName)) return false;
    if (entry.kind === 'roster' && (!namedId(entry.artistId) || !namedId(entry.artistName) || entry.artistId !== entry.contactId)) return false;
    if (['studio', 'studio-release'].includes(entry.kind) && entry.contactId !== 'luna') return false;
    const terminal = SETTLED.includes(entry.status);
    if (terminal && !weekWithin(entry.resolvedWeek, entry.offeredWeek, s.week) || !terminal && entry.resolvedWeek !== undefined) return false;
    if (entry.status === 'withdrawn' ? !namedId(entry.closeReason) : entry.closeReason !== undefined) return false;
    const accepted = ['active', 'fulfilled', 'breached'].includes(entry.status);
    if (!accepted) return ['acceptedWeek', 'dueWeek', 'originalDueWeek', 'renegotiatedWeek', 'sessionDay', 'rehearsalDay', 'showDay', 'releaseId', 'releaseDay']
      .every(key => entry[key] === undefined);
    if (!weekWithin(entry.acceptedWeek, entry.offeredWeek, Math.min(entry.expiresWeek, s.week)) ||
      entry.originalDueWeek !== entry.acceptedWeek + WINDOWS[entry.kind]) return false;
    const extended = entry.renegotiatedWeek !== undefined;
    if (extended && !weekWithin(entry.renegotiatedWeek, entry.acceptedWeek, Math.min(entry.originalDueWeek, s.week))) return false;
    if (entry.dueWeek !== entry.originalDueWeek + (extended ? EXTENSION : 0) ||
      entry.status === 'active' && s.week > entry.dueWeek || terminal && !weekWithin(entry.resolvedWeek, entry.acceptedWeek, entry.dueWeek)) return false;
    const evidenceLimit = Math.min(entry.dueWeek, entry.resolvedWeek ?? s.week);
    const validDay = day => Number.isSafeInteger(day) && day >= 0 && day <= s.calendar?.day && weekWithin(weekAt(day), entry.acceptedWeek, evidenceLimit);
    if (entry.sessionDay !== undefined && (entry.kind !== 'studio' || !validDay(entry.sessionDay))) return false;
    if (entry.rehearsalDay !== undefined && (entry.kind !== 'promoter' || !validDay(entry.rehearsalDay))) return false;
    if (entry.showDay !== undefined && (entry.kind !== 'promoter' || !validDay(entry.showDay) || !(entry.rehearsalDay < entry.showDay))) return false;
    if ((entry.releaseDay !== undefined || entry.releaseId !== undefined) &&
      (!['studio-release', 'roster'].includes(entry.kind) || !validDay(entry.releaseDay) || !namedId(entry.releaseId))) return false;
    const complete = entry.sessionDay !== undefined || entry.showDay !== undefined || entry.releaseDay !== undefined;
    return entry.status === 'fulfilled' ? complete : entry.status === 'breached' ? !complete && entry.resolvedWeek === entry.dueWeek : true;
  }

  function validate(s) {
    const state = s.commitments;
    if (state === undefined) return [];
    const errors = ['Compromisos de carrera inválidos.'];
    if (!state || state.version !== 1 || !weekWithin(state.startedWeek, 1, s.week) ||
      !weekWithin(state.nextOfferWeek, state.startedWeek + 1, s.week + 4) || !weekNumber(state.nextId) ||
      ![0, 1, 2].includes(state.rotation) || !Array.isArray(state.history) || state.history.length > HISTORY_LIMIT ||
      !state.history.every(entry => validEntry(entry, state, s, SETTLED))) return errors;
    if (state.current !== null && !validEntry(state.current, state, s, ['offered', 'active'])) return errors;
    const ids = state.history.map(entry => entry.id);
    if (state.current) ids.push(state.current.id);
    return new Set(ids).size === ids.length ? [] : errors;
  }

  const api = { ensure, openWeek, closeWeek, act, beforeActivity, afterActivity, summary, validate };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.RapCareerCommitments = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
