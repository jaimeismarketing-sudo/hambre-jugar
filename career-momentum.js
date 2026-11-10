(function (root) {
  'use strict';

  const historyLimit = 52;
  const finite = Number.isFinite;
  const metrics = ['fame', 'fans', 'rosterFans', 'cash', 'labelCash', 'netWorth'];

  function capture(s, report) {
    const week = report.week;
    if (week !== s.week - 1 || week < 1 || s.financialHold) return;
    const records = s.careerMomentum?.records || [];
    if (records.at(-1)?.week >= week) return;
    const clients = s.management?.artists || [];
    const row = {
      week, fame: s.player.fame, fans: s.player.fans,
      rosterFans: s.management?.role === 'artist' && !clients.length ? null : clients.reduce((sum, artist) => sum + artist.fans, 0),
      cash: report.cash, labelCash: s.label ? s.label.cash : null, netWorth: report.netWorth
    };
    s.careerMomentum = { version: 1, records: [...records.slice(1 - historyLimit), row] };
  }

  function read(s) {
    return (s.careerMomentum?.records || []).map(row => ({ ...row }));
  }

  function validate(s) {
    const value = s.careerMomentum;
    if (value === undefined) return [];
    const error = ['Historial de trayectoria inválido.'];
    if (value?.version !== 1 || !Array.isArray(value.records) || value.records.length > historyLimit) return error;
    let previous = 0;
    for (const row of value.records) {
      if (!row || Object.keys(row).length !== metrics.length + 1 ||
          !Number.isInteger(row.week) || row.week <= previous || row.week >= s.week ||
          !finite(row.fame) || row.fame < 0 || row.fame > 100 ||
          !Number.isSafeInteger(row.fans) || row.fans < 0 ||
          !(row.rosterFans === null || Number.isSafeInteger(row.rosterFans) && row.rosterFans >= 0) ||
          !finite(row.cash) || !finite(row.netWorth) ||
          !(row.labelCash === null || finite(row.labelCash) && row.labelCash >= 0)) return error;
      previous = row.week;
    }
    return [];
  }

  const api = { capture, read, validate };
  root.RapCareerMomentum = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
