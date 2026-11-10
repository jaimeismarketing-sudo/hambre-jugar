/* Optional creative direction. Effects are fictional playtest starting values. */
(function (root) {
  'use strict';

  const version = 1;
  const briefs = Object.freeze([
    Object.freeze({
      id: 'discovery', name: 'Puerta de entrada', segment: 'discovery', segmentName: 'Descubrimiento',
      description: 'Un lanzamiento accesible para quien escucha al artista por primera vez.',
      tradeoff: 'Más escuchas orgánicas y menos demanda de copias.',
    }),
    Object.freeze({
      id: 'collectors', name: 'Pieza de colección', segment: 'collectors', segmentName: 'Coleccionistas',
      description: 'Una obra pensada para quien quiere conservarla y volver a ella.',
      tradeoff: 'Más demanda de copias y menos escuchas orgánicas.',
    }),
    Object.freeze({
      id: 'community', name: 'Para la comunidad', segment: 'community', segmentName: 'Comunidad',
      description: 'Una obra que se apoya en la relación previa con el público cercano.',
      tradeoff: 'Alcance orgánico moderado. La demanda de copias mejora si ya hay afinidad con este público.',
    }),
  ]);
  const segments = briefs.map(brief => brief.segment);
  const emptyAudience = Object.freeze({ version, discovery: 50, collectors: 50, community: 50 });
  const neutralDemand = Object.freeze({ organicStreams: 1, paidCopies: 1 });

  // Basis points keep the stored fit portable and the outcomes modest. At a
  // neutral affinity, the two specialist routes trade one demand source for
  // another. The community route sacrifices the specialist peaks for balance.
  const profiles = Object.freeze({
    discovery: { organicStreams: [1080, 1140], paidCopies: [900, 940] },
    collectors: { organicStreams: [920, 960], paidCopies: [1100, 1160] },
    community: { organicStreams: [1000, 1080], paidCopies: [960, 1040] },
  });

  function getBrief(id) {
    return briefs.find(brief => brief.id === id) || null;
  }

  function hasExactFields(value, fields) {
    return !!value && typeof value === 'object' && !Array.isArray(value)
      && Object.keys(value).length === fields.length
      && fields.every(field => Object.prototype.hasOwnProperty.call(value, field));
  }

  function validAffinity(value) {
    return Number.isInteger(value) && value >= 0 && value <= 100;
  }

  function validAudience(value) {
    return hasExactFields(value, ['version', ...segments]) && value.version === version
      && segments.every(segment => validAffinity(value[segment]));
  }

  function readAudience(value) {
    const source = validAudience(value) ? value : emptyAudience;
    return { ...source };
  }

  function multiplier([low, high], affinity) {
    return (low * 100 + (high - low) * affinity) / 100000;
  }

  function calculate(brief, affinity) {
    const profile = profiles[brief.id];
    return {
      briefId: brief.id,
      segment: brief.segment,
      affinity,
      organicStreams: multiplier(profile.organicStreams, affinity),
      paidCopies: multiplier(profile.paidCopies, affinity),
    };
  }

  function preview(briefId, audience) {
    const brief = getBrief(briefId);
    if (!brief) return { briefId: null, segment: null, affinity: null, ...neutralDemand };
    return calculate(brief, readAudience(audience)[brief.segment]);
  }

  function deliver(briefId, audience) {
    const brief = getBrief(briefId);
    if (!brief) return null;
    const next = readAudience(audience);
    const direction = { version, ...calculate(brief, next[brief.segment]) };
    // Only an actual release teaches the audience. Gradual gains and losses
    // make consecutive works matter, with firm bounds for long careers.
    for (const segment of segments) {
      next[segment] = segment === brief.segment ? Math.min(100, next[segment] + 5) : Math.max(0, next[segment] - 2);
    }
    return { direction, audience: next };
  }

  function validDirection(value) {
    if (!hasExactFields(value, ['version', 'briefId', 'segment', 'affinity', 'organicStreams', 'paidCopies'])
      || value.version !== version || !validAffinity(value.affinity)) return false;
    const brief = getBrief(value.briefId);
    if (!brief || brief.segment !== value.segment) return false;
    const expected = calculate(brief, value.affinity);
    return value.organicStreams === expected.organicStreams && value.paidCopies === expected.paidCopies;
  }

  function demand(direction) {
    if (!validDirection(direction)) return { ...neutralDemand };
    return { organicStreams: direction.organicStreams, paidCopies: direction.paidCopies };
  }

  function validate(s) {
    const errors = [];
    const clients = Array.isArray(s?.management?.artists) ? s.management.artists : [];
    const careers = [
      { actor: s?.player, projects: s?.projects, releases: s?.releases },
      ...clients.map(actor => ({ actor, projects: actor?.projects, releases: actor?.releases })),
    ];
    for (const career of careers) {
      const { actor, projects, releases } = career;
      const knownProjects = Array.isArray(projects) ? projects : [];
      if (actor?.creativeAudience !== undefined && !validAudience(actor.creativeAudience)) {
        errors.push('Afinidad creativa de la carrera inválida.');
      }
      if (knownProjects.some(project => project?.creativeBriefId !== undefined && !getBrief(project.creativeBriefId))) {
        errors.push('Enfoque creativo de proyecto inválido.');
      }
      for (const release of Array.isArray(releases) ? releases : []) {
        if (release?.creativeDirection === undefined) continue;
        const source = knownProjects.find(project => project?.id === release.projectId);
        if (!validDirection(release.creativeDirection) || !validAudience(actor?.creativeAudience)
          || (source && source.creativeBriefId !== release.creativeDirection.briefId)) {
          errors.push('Afinidad de público guardada para un lanzamiento inválida.');
        }
      }
    }
    return errors;
  }

  const api = { briefs, getBrief, readAudience, preview, deliver, demand, validate };
  root.RapCreativeDirection = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
