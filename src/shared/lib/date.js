/**
 * Date utility helpers
 */
export const todayStr = () => new Date().toISOString().slice(0, 10);

export function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function fmtDateTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function weekId(isoDate) {
  if (!isoDate) return 0;
  return Math.floor((Date.parse(isoDate + 'T00:00:00Z') / 864e5 + 3) / 7);
}

export function monthYearStr(isoDate) {
  if (!isoDate) return '';
  const d = new Date(isoDate + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}
