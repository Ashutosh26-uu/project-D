const config = require('../config');

/**
 * Decide whether a detection should raise an alert.
 * Returns null when nothing of interest was seen, otherwise { severity, classes, message }.
 */
function evaluate(objects, { classes = config.alerts.classes, minConfidence = config.alerts.minConfidence } = {}) {
  const matches = objects.filter((o) => classes.has(o.className) && o.confidence >= minConfidence);
  if (matches.length === 0) return null;

  const counts = {};
  for (const o of matches) counts[o.className] = (counts[o.className] || 0) + 1;

  const strongest = Math.max(...matches.map((o) => o.confidence));
  let severity = 'low';
  if (matches.length >= 5 || strongest >= 0.85) severity = 'high';
  else if (matches.length >= 2) severity = 'medium';

  const message = Object.entries(counts)
    .map(([name, n]) => `${n} ${name}`)
    .join(', ');

  return { severity, classes: Object.keys(counts), message: `Detected ${message}` };
}

module.exports = { evaluate };
