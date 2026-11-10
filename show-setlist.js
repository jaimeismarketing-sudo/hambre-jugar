/* Optional live repertoire. Design values start small so venue and price still matter. */
(function (root) {
  'use strict';

  const maxWorks = 3;
  const newReleaseDays = 42;
  const recognitionStreams = 1000;
  const baseEnergy = 32;
  const neutral = Object.freeze({ demandMultiplier: 1, performanceBonus: 0, energyCost: baseEnergy });
  const kinds = Object.freeze({
    familiar: { name: 'Conocida', detail: '+4% a la demanda previa al aforo · +2 energía de coste', demand: 400, performance: 0, energy: 2 },
    fresh: { name: 'Reciente', detail: '−3% a la demanda · +4 puntos de actuación · +2 energía de coste', demand: -300, performance: 4, energy: 2 },
    catalog: { name: 'De catálogo', detail: '+1% a la demanda · +1 punto de actuación · +1 energía de coste', demand: 100, performance: 1, energy: 1 },
  });
  const snapshotFields = ['version', 'bookedDay', 'bandId', 'works'];
  const workFields = ['releaseId', 'name', 'kind', 'ageDays', 'totalStreams'];

  function exactFields(value, fields) {
    return !!value && typeof value === 'object' && !Array.isArray(value)
      && Object.keys(value).length === fields.length
      && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
  }

  function id(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= 96 && value.trim() === value;
  }

  function title(value) {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= 120;
  }

  function count(value) {
    return Number.isSafeInteger(value) && value >= 0;
  }

  function classify(ageDays, totalStreams) {
    if (ageDays !== null && ageDays < newReleaseDays) return 'fresh';
    if (ageDays !== null && totalStreams !== null && totalStreams >= recognitionStreams) return 'familiar';
    return 'catalog';
  }

  function snapshot(s, release, bandId) {
    if (!id(release?.id) || !title(release.name)) return null;
    if (release.status !== undefined && release.status !== 'released') return null;
    if (count(release.releasedDay) && count(s.calendar?.day) && release.releasedDay > s.calendar.day) return null;
    if (count(release.releasedWeek) && count(s.week) && release.releasedWeek > s.week) return null;
    if (bandId ? release.bandTerms?.bandId !== bandId : release.bandTerms != null) return null;
    const ageDays = count(release.ageDays) ? release.ageDays : null;
    const totalStreams = count(release.totalStreams) ? release.totalStreams : null;
    return { releaseId: release.id, name: release.name, kind: classify(ageDays, totalStreams), ageDays, totalStreams };
  }

  function releasedWorks(s, bandId) {
    if (!Array.isArray(s?.releases) || (bandId !== null && (!id(bandId) || s.bands?.active?.id !== bandId))) return [];
    return s.releases.map(release => snapshot(s, release, bandId)).filter(Boolean).reverse();
  }

  function available(s, { bandId = null } = {}) {
    return releasedWorks(s, bandId).map(work => ({ ...work, kindName: kinds[work.kind].name, detail: kinds[work.kind].detail }));
  }

  function quote(s, { releaseIds = [], bandId = null } = {}) {
    const rejected = message => ({ ok: false, message, setlist: null });
    if (!Array.isArray(releaseIds) || releaseIds.length > maxWorks || [...releaseIds].some(value => !id(value))) {
      return rejected('Elige hasta tres obras publicadas para el repertorio.');
    }
    if (releaseIds.length === 0) return { ok: true, message: 'Repertorio habitual.', setlist: null };
    if (new Set(releaseIds).size !== releaseIds.length) return rejected('Cada obra puede aparecer una sola vez.');
    if (bandId !== null && !id(bandId)) return rejected('La formación seleccionada es inválida.');
    if (!count(s?.calendar?.day)) return rejected('Falta el día de reserva del concierto.');
    const availableWorks = releasedWorks(s, bandId);
    const works = releaseIds.map(releaseId => availableWorks.find(work => work.releaseId === releaseId));
    if (works.some(work => !work)) return rejected(bandId ? 'Elige obras ya publicadas por esta formación.' : 'Elige obras ya publicadas de tu catálogo personal.');
    return { ok: true, message: 'Repertorio preparado para esta fecha.', setlist: { version: 1, bookedDay: s.calendar.day, bandId, works } };
  }

  function validSnapshot(value) {
    if (!exactFields(value, snapshotFields) || value.version !== 1 || !count(value.bookedDay)
      || (value.bandId !== null && !id(value.bandId)) || !Array.isArray(value.works)
      || value.works.length < 1 || value.works.length > maxWorks) return false;
    const seen = new Set();
    for (const work of value.works) {
      if (!exactFields(work, workFields) || !id(work.releaseId) || seen.has(work.releaseId) || !title(work.name)
        || (work.ageDays !== null && !count(work.ageDays)) || (work.totalStreams !== null && !count(work.totalStreams))
        || work.kind !== classify(work.ageDays, work.totalStreams)) return false;
      seen.add(work.releaseId);
    }
    return true;
  }

  function effects(setlist) {
    if (!validSnapshot(setlist)) return { ...neutral };
    let demand = 10000;
    let performanceBonus = 0;
    let energyCost = baseEnergy;
    for (const work of setlist.works) {
      const kind = kinds[work.kind];
      demand += kind.demand;
      performanceBonus += kind.performance;
      energyCost += kind.energy;
    }
    return { demandMultiplier: demand / 10000, performanceBonus, energyCost };
  }

  function validate(s) {
    const errors = [];
    const day = s?.calendar?.day;
    const weekDay = s?.calendar?.dayOfWeek;
    const plans = [s?.plan, s?.activeWeek?.lockedPlan];
    for (const plan of plans) {
      if (!Array.isArray(plan)) continue;
      for (const item of plan) {
        if (item?.setlist === undefined) continue;
        const setlist = item.setlist;
        if (item.id !== 'show' || !validSnapshot(setlist) || setlist.bandId !== (item.bandTerms?.bandId ?? null)
          || !count(day) || setlist.bookedDay > day || (count(weekDay) && setlist.bookedDay < day - weekDay)
          || item.energy !== effects(setlist).energyCost) errors.push('Repertorio de concierto guardado inválido.');
      }
    }
    return errors;
  }

  const api = { maxWorks, available, quote, effects, validate };
  root.RapShowSetlist = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
