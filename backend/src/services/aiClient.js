const config = require('../config');
const { HttpError } = require('../middleware/errors');

async function detect(file, { confidence } = {}) {
  const form = new FormData();
  form.append('file', new Blob([file.buffer], { type: file.mimetype }), file.originalname || 'image');

  const url = new URL('/detect', config.ai.url);
  if (confidence) url.searchParams.set('confidence', String(confidence));

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      body: form,
      headers: config.ai.token ? { 'X-Service-Token': config.ai.token } : {},
      signal: AbortSignal.timeout(config.ai.timeoutMs),
    });
  } catch (err) {
    console.error('AI service unreachable:', err.message);
    throw new HttpError(503, 'AI service unavailable');
  }

  if (res.status === 400 || res.status === 413) {
    const body = await res.json().catch(() => ({}));
    throw new HttpError(res.status, body.detail || 'Invalid image');
  }
  if (!res.ok) {
    console.error('AI service error:', res.status, await res.text().catch(() => ''));
    throw new HttpError(502, 'AI service error');
  }
  return res.json();
}

async function health() {
  try {
    const res = await fetch(new URL('/health', config.ai.url), { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

module.exports = { detect, health };
