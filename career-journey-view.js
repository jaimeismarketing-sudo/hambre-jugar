(function (root) {
  'use strict';

  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const arcStatus = { claimed: 'Cumplido', archived: 'Cumplido', expired: 'Plazo vencido', cancelled: 'Archivado' };
  const commitmentStatus = { fulfilled: 'Cumplido', breached: 'Incumplido', declined: 'Rechazado', expired: 'Propuesta vencida', withdrawn: 'Propuesta retirada' };

  function action(label, type, payload, { primary = false, disabled = false } = {}) {
    return `<button type="button" class="${primary ? 'btn' : 'outline'} small" data-act="${type}" data-payload="${escape(JSON.stringify(payload))}"${disabled ? ' disabled' : ''}>${escape(label)}</button>`;
  }

  function nav(label, target, primary = false) {
    return `<button type="button" class="${primary ? 'btn' : 'outline'} small" data-nav="${target}">${escape(label)}</button>`;
  }

  function tape(s) {
    const journey = root.RapCareerArcs?.summary(s);
    const commitment = root.RapCareerCommitments?.summary(s)?.current;
    const chapter = journey?.current;
    const entry = chapter || commitment;
    const openCount = (journey?.offers || []).filter(offer => !offer.unavailable).length;
    const badge = chapter ? (chapter.status === 'earned' ? 'Capítulo cumplido' : 'Capítulo en marcha') :
      commitment ? (commitment.status === 'offered' ? 'Propuesta de la escena' : 'Compromiso activo') : 'Trayectoria';
    const title = entry?.title || (openCount ? 'Elige el próximo capítulo' : 'Empieza a dejar huella');
    const progress = chapter
      ? chapter.progress.map(metric => metric.label + ' ' + metric.value + '/' + metric.target).join(' · ')
      : commitment?.contact || (openCount ? openCount + (openCount === 1 ? ' ruta disponible' : ' rutas disponibles') : 'Revisa tus primeros pasos');
    const limit = chapter?.status === 'active' ? chapter.dueWeek : commitment?.dueWeek || commitment?.expiresWeek;
    return `<section class="journey-tape" aria-label="Próximo paso de carrera">
      <div class="journey-tape-mark" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="journey-tape-text"><span>${escape(badge)}</span><strong>${escape(title)}</strong></div>
      <small>${escape(progress)}${!limit ? '' : ' · hasta S' + limit}</small>
      ${nav(chapter?.status === 'earned' ? 'Elegir recompensa' : 'Ver mi trayectoria', 'artist', chapter?.status === 'earned')}
    </section>`;
  }

  function chapterCurrent(record, canDecide, canEarnSkill) {
    const id = record.id;
    const options = { disabled: !canDecide };
    return `<article class="journey-current"><header>
      <div><span>${record.status === 'earned' ? 'Capítulo cumplido' : 'Capítulo en marcha'}</span><h3>${escape(record.title)}</h3></div>
      <span class="journey-deadline">${record.status === 'earned' ? 'Cerrado en S' + record.closedWeek : 'Hasta el domingo de S' + record.dueWeek}</span>
    </header><p>${escape(record.description)}${record.clientName ? ' · ' + escape(record.clientName) : ''}</p>
    <div class="journey-progress">${record.progress.map(metric => `<label><span>${escape(metric.label)} <b>${metric.value}/${metric.target}</b></span><progress max="${metric.target}" value="${metric.value}"></progress></label>`).join('')}</div>
    <div class="journey-actions">${record.status === 'earned' ? [
      action('Ganar 1 punto de habilidad', 'careerArc', { decision: 'claim', id, reward: 'skill' }, { primary: true, disabled: !canDecide || !canEarnSkill }),
      action('Ganar hasta 2 de reputación', 'careerArc', { decision: 'claim', id, reward: 'reputation' }, options),
      action('Cerrar sin recompensa', 'careerArc', { decision: 'archive', id }, options)
    ].join('') : record.destinations.map(([page, label]) => nav(label, page)).join('') +
      action('Archivar capítulo', 'careerArc', { decision: 'cancel', id }, options)}</div></article>`;
  }

  function chapterOffers(journey) {
    return `<div class="journey-offers">${journey.offers.map(offer => {
      const label = offer.id === 'roster' ? 'Elegir a quién dirigir' : 'Empezar capítulo';
      const options = !offer.unavailable && offer.id === 'roster'
        ? `<details><summary>${label}</summary><div class="journey-actions">${journey.clients.map(client =>
          action(client.name, 'careerArc', { decision: 'start', kind: offer.id, clientId: client.id })
        ).join('')}</div></details>`
        : action(label, 'careerArc', { decision: 'start', kind: offer.id }, { disabled: !!offer.unavailable });
      return `<article class="journey-offer" data-journey="${offer.id}">
        <header><span class="journey-groove" aria-hidden="true"></span><span>${offer.weeks} semanas</span></header>
        <h3>${escape(offer.title)}</h3><p>${escape(offer.description)}</p>
        ${offer.unavailable ? `<p class="journey-lock">${escape(offer.unavailable)}</p>` : ''}
        ${options}</article>`;
    }).join('')}</div>`;
  }

  function commitments(s, canDecide) {
    const view = root.RapCareerCommitments?.summary(s);
    if (!view) return '';
    const entry = view.current;
    const current = entry ? `<article class="journey-current journey-promise"><header>
      <div><span>${escape(entry.contact)}</span><h3>${escape(entry.title)}</h3></div>
      <span class="journey-deadline">${entry.status === 'offered' ? 'Responde hasta S' + entry.expiresWeek : 'Hasta el domingo de S' + entry.dueWeek}</span>
      </header><p>${escape(entry.detail)}</p><p class="journey-lock">${entry.status === 'offered'
        ? entry.unavailableReason ? escape(entry.unavailableReason) : 'Si aceptas hoy, el plazo termina en S' + entry.prospectiveDueWeek + '.'
        : escape(entry.progress)}</p>
      <div class="journey-actions">${entry.status === 'offered' ? [
        action('Aceptar compromiso', 'commitment', { id: entry.id, decision: 'accept' }, { primary: true, disabled: !canDecide || !entry.canAccept }),
        action('Dejar pasar', 'commitment', { id: entry.id, decision: 'decline' }, { disabled: !canDecide })
      ].join('') : [
        nav(entry.kind === 'roster' ? 'Ir al roster' : entry.kind === 'promoter' ? 'Comparar escenarios' : 'Ir al estudio',
          entry.kind === 'roster' ? 'management' : entry.kind === 'promoter' ? 'venues' : 'studio'),
        entry.canRenegotiate ? action('Pedir ' + entry.extension + ' semanas más', 'commitment',
          { id: entry.id, decision: 'renegotiate' }, { disabled: !canDecide }) : ''
      ].join('')}</div></article>` : '<p class="journey-lock">Aún no hay una propuesta. Los contactos consideran tus obras y el trabajo que tienes en marcha.</p>';
    return `<section class="journey-commitments"><h3>Acuerdos con la escena</h3>${current}
      ${view.history.length ? `<details><summary>Historial de compromisos</summary><ul class="journey-history">${view.history.slice(0, 6).map(row =>
        `<li><span><b>${escape(row.title)}</b><small>${escape(row.contact)} · ${escape(row.outcome)}</small></span><span>${commitmentStatus[row.status]} · S${row.resolvedWeek}</span></li>`
      ).join('')}</ul></details>` : ''}</section>`;
  }

  function momentum(s, metric) {
    const timeline = root.RapCareerMomentum?.read(s) || [];
    const labels = {
      fame: 'Fama', fans: 'Fans propios', rosterFans: 'Fans del roster',
      cash: 'Caja personal', labelCash: 'Caja del sello', netWorth: 'Patrimonio'
    };
    const manager = s.management?.role === 'manager';
    const available = Object.keys(labels).filter(key => {
      if (key === 'fame' || key === 'fans') return !manager;
      if (key === 'rosterFans' || key === 'labelCash') return timeline.some(row => row[key] !== null);
      return true;
    });
    if (!available.includes(metric)) metric = manager && available.includes('rosterFans') ? 'rosterFans' : available[0];
    const values = timeline.filter(row => Number.isFinite(row[metric]));
    const cash = ['cash', 'labelCash', 'netWorth'].includes(metric);
    const format = (value, compact = false) => (cash ? '$' : '') + new Intl.NumberFormat('es-CO', {
      notation: compact ? 'compact' : 'standard', maximumFractionDigits: compact ? 1 : 2
    }).format(value);
    const last = values.at(-1);
    const buttons = available.map(key => `<button type="button" class="outline small" data-momentum-metric="${key}" aria-pressed="${key === metric}">${labels[key]}</button>`).join('');
    if (!last) return `<section class="journey-momentum"><h3>Evolución de la carrera</h3><p>Tu primer cierre en esta edición abre el historial semanal.</p></section>`;
    const left = 72, right = 636, top = 14, bottom = 146;
    const firstWeek = timeline[0].week, lastWeek = timeline.at(-1).week;
    let minimum = Math.min(0, ...values.map(row => row[metric]));
    let maximum = Math.max(0, ...values.map(row => row[metric]));
    if (minimum === maximum) maximum += 1;
    const x = week => firstWeek === lastWeek ? (left + right) / 2 : left + (week - firstWeek) / (lastWeek - firstWeek) * (right - left);
    const y = value => bottom - (value - minimum) / (maximum - minimum) * (bottom - top);
    const grid = [minimum, (minimum + maximum) / 2, maximum];
    const segments = [];
    for (const row of values) {
      if (!segments.length || row.week !== segments.at(-1).at(-1).week + 1) segments.push([]);
      segments.at(-1).push(row);
    }
    const plot = `<svg viewBox="0 0 650 170" role="img" aria-label="${labels[metric]} entre S${firstWeek} y S${lastWeek}. Último dato ${escape(format(last[metric]))}">
      ${grid.map(value => `<line class="grid" x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}"/><text x="${left - 6}" y="${y(value) + 4}" text-anchor="end">${escape(format(value, true))}</text>`).join('')}
      ${segments.filter(rows => rows.length > 1).map(rows => `<polyline class="signal" points="${rows.map(row => x(row.week).toFixed(2) + ',' + y(row[metric]).toFixed(2)).join(' ')}"/>`).join('')}
      ${values.map(row => `<circle class="point" cx="${x(row.week).toFixed(2)}" cy="${y(row[metric]).toFixed(2)}" r="${row === last ? 4 : 2}"><title>S${row.week} · ${escape(format(row[metric]))}</title></circle>`).join('')}
      <text x="${left}" y="166">S${firstWeek}</text>${firstWeek === lastWeek ? '' : `<text x="${right}" y="166" text-anchor="end">S${lastWeek}</text>`}
      </svg>`;
    return `<section class="journey-momentum"><header><h3>Evolución de la carrera</h3><strong>${escape(format(last[metric]))} <small>S${last.week}</small></strong></header>
      <div class="journey-actions" role="group" aria-label="Métrica de trayectoria">${buttons}</div>${plot}
      <p class="journey-lock">${values.length} cierres registrados. La caja personal y la del sello se muestran por separado.</p></section>`;
  }

  function render(s, metric) {
    const journey = root.RapCareerArcs?.summary(s);
    if (!journey) return '';
    return `<section class="journey-board" aria-label="Capítulos y compromisos de carrera">
      <header class="journey-heading"><h2>Tu próximo capítulo</h2><p>Escoge un rumbo. La agenda, las fechas y el público deciden cuánto logras antes del cierre.</p></header>
      ${journey.current ? chapterCurrent(journey.current, journey.canDecide, journey.canEarnSkill) : chapterOffers(journey)}
      ${journey.recent.length ? `<details><summary>Capítulos anteriores</summary><ul class="journey-history">${journey.recent.map(row =>
        `<li><b>${escape(row.title)}</b><span>${arcStatus[row.status]} · S${row.closedWeek}</span></li>`
      ).join('')}</ul></details>` : ''}
      ${commitments(s, journey.canDecide)}
      ${momentum(s, metric)}
    </section>`;
  }

  function percentage(multiplier) {
    const amount = Math.round((multiplier - 1) * 1000) / 10;
    return (amount > 0 ? '+' : '') + amount.toLocaleString('es-CO') + '%';
  }

  function creativeFields(actor) {
    const creative = root.RapCreativeDirection;
    if (!creative) return '';
    return `<fieldset class="journey-brief-picker"><legend>Dirección creativa</legend>
      <p>Al publicar, se aplicará la afinidad de ese momento. La afinidad representa gustos del público, de 0 a 100.</p>
      <label><input type="radio" name="creativeBriefId" value="" checked><span><b>Sin encargo creativo</b><small>Usa la demanda habitual.</small></span></label>
      ${creative.briefs.map(brief => {
        const estimate = creative.preview(brief.id, actor?.creativeAudience);
        return `<label><input type="radio" name="creativeBriefId" value="${brief.id}"><span><b>${escape(brief.name)}</b><small>${escape(brief.description)} ${escape(brief.tradeoff)}</small>
          <small class="journey-impact">Afinidad ${estimate.affinity}/100 · ${percentage(estimate.organicStreams)} escuchas orgánicas · ${percentage(estimate.paidCopies)} demanda de copias</small></span></label>`;
      }).join('')}
    </fieldset>`;
  }

  function briefTag(project) {
    const brief = root.RapCreativeDirection?.getBrief(project?.creativeBriefId || project?.creativeDirection?.briefId);
    return brief ? `<span class="journey-brief-tag">${escape(brief.name)}</span>` : '';
  }

  function audience(actor) {
    const creative = root.RapCreativeDirection;
    if (!creative || !actor?.creativeAudience) return '';
    const affinity = creative.readAudience(actor.creativeAudience);
    return `<section class="journey-audience"><h3>Afinidad del público</h3><div class="journey-progress">${creative.briefs.map(brief =>
      `<label><span>${escape(brief.segmentName)} <b>${affinity[brief.segment]}/100</b></span><progress max="100" value="${affinity[brief.segment]}"></progress></label>`
    ).join('')}</div></section>`;
  }

  function repertoireOptions(s, bandId) {
    const library = root.RapShowSetlist;
    const works = library.available(s, { bandId });
    if (!works.length) return '<p>El repertorio personalizado se abre cuando publiques una obra para esta formación.</p>';
    const options = works.map(work => `<option value="${escape(work.releaseId)}">${escape(work.name)} · ${escape(work.kindName)}</option>`).join('');
    return `<div class="journey-setlist-picks">${Array.from({ length: Math.min(library.maxWorks, works.length) }, (_, slot) =>
      `<label class="field">Obra ${slot + 1}<select name="repertoire"><option value="">Sin elegir</option>${options}</select></label>`
    ).join('')}</div>`;
  }

  function setlistFields(s) {
    if (!root.RapShowSetlist) return '';
    return `<fieldset class="journey-setlist"><legend>Repertorio opcional</legend>
      <p>Las obras conocidas atraen público. Las recientes ayudan a la actuación y pueden reducir la convocatoria. Cada obra añade esfuerzo.</p>
      <div data-repertoire-picks data-scope="solo">${repertoireOptions(s, null)}</div>
      <output data-repertoire-quote aria-live="polite">Repertorio habitual · 32 de energía</output>
    </fieldset>`;
  }

  function syncSetlist(s, form) {
    const picks = form.querySelector('[data-repertoire-picks]');
    const readout = form.querySelector('[data-repertoire-quote]');
    const library = root.RapShowSetlist;
    if (!picks || !readout || !library) return;
    const bandId = form.querySelector('input[name="group"]')?.checked ? s.bands?.active?.id ?? null : null;
    const scope = bandId || 'solo';
    if (picks.dataset.scope !== scope) {
      picks.innerHTML = repertoireOptions(s, bandId);
      picks.dataset.scope = scope;
    }
    const releaseIds = [...picks.querySelectorAll('select')].map(select => select.value).filter(Boolean);
    const quote = library.quote(s, { releaseIds, bandId });
    if (!quote.ok) {
      readout.textContent = quote.message;
      return;
    }
    const effects = library.effects(quote.setlist);
    readout.textContent = quote.setlist
      ? percentage(effects.demandMultiplier) + ' demanda estimada · +' + effects.performanceBonus + ' actuación · ' + effects.energyCost + ' de energía'
      : 'Repertorio habitual · 32 de energía';
  }

  root.RapCareerJourneyView = { tape, render, creativeFields, briefTag, audience, setlistFields, syncSetlist };
})(typeof globalThis !== 'undefined' ? globalThis : this);
