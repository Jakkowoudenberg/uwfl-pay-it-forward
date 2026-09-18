'use strict';
const { fail } = require('./core');
const modes = new Set(['chat', 'translate', 'translate_text', 'register']);
function parseChatRequest(event) {
  const raw = event.body || '';
  if (Buffer.byteLength(raw, 'utf8') > 131072) fail(413, 'request_too_large');
  let data;
  try { data = JSON.parse(raw); } catch { fail(400, 'invalid_json'); }
  if (!data || Array.isArray(data) || typeof data !== 'object') fail(400, 'invalid_fields');
  const mode = data.mode === undefined ? 'chat' : data.mode;
  if (!modes.has(mode)) fail(400, 'invalid_mode');
  if (mode === 'register') {
    if (!data.data || Array.isArray(data.data) || typeof data.data !== 'object') fail(400, 'invalid_fields');
    return { mode, data: data.data };
  }
  if (mode === 'chat') {
    if (!Array.isArray(data.messages) || !data.messages.length || data.messages.length > 80) fail(400, 'invalid_messages');
    let length = 0;
    const messages = data.messages.map(message => {
      if (!message || !['user', 'assistant'].includes(message.role) || typeof message.content !== 'string' || !message.content.trim()) fail(400, 'invalid_messages');
      length += message.content.length;
      if (length > 60000) fail(413, 'request_too_large');
      return { role: message.role, content: message.content };
    });
    return { mode, messages };
  }
  if (typeof data.targetLang !== 'string' || !/^[A-Za-z][A-Za-z ()-]{0,59}$/.test(data.targetLang)) fail(400, 'invalid_language');
  if (mode === 'translate_text') {
    if (typeof data.text !== 'string' || !data.text.trim()) fail(400, 'invalid_fields');
    if (data.text.length > 12000) fail(413, 'request_too_large');
    return { mode, targetLang: data.targetLang, text: data.text };
  }
  if (!data.content || !['string', 'object'].includes(typeof data.content)) fail(400, 'invalid_fields');
  if (JSON.stringify(data.content).length > 60000) fail(413, 'request_too_large');
  return { mode, targetLang: data.targetLang, content: data.content };
}
module.exports = { parseChatRequest };
