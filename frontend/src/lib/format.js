const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function timeAgo(value) {
  if (!value) return 'never';
  const seconds = Math.round((new Date(value).getTime() - Date.now()) / 1000);
  const abs = Math.abs(seconds);
  if (abs < 60) return rtf.format(seconds, 'second');
  if (abs < 3600) return rtf.format(Math.round(seconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(seconds / 3600), 'hour');
  return rtf.format(Math.round(seconds / 86400), 'day');
}

export const fmt = (v, unit = '', digits = 0) =>
  v === undefined || v === null ? '—' : `${Number(v).toFixed(digits)}${unit}`;

export function summarize(objects) {
  const counts = {};
  for (const o of objects) counts[o.className] = (counts[o.className] || 0) + 1;
  const parts = Object.entries(counts).map(([k, n]) => `${n} ${k}`);
  return parts.length ? parts.join(', ') : 'Nothing detected';
}
