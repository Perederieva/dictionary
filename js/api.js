import { CONFIG } from './config.js';

export const configured = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_KEY) &&
  !/YOUR-/.test(String(CONFIG.SUPABASE_URL) + String(CONFIG.SUPABASE_KEY));

const base = String(CONFIG.SUPABASE_URL || '').replace(/\/+$/, '');

async function rpc(fn, args) {
  let res;
  try {
    res = await fetch(base + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: CONFIG.SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
  } catch (e) {
    const err = new Error('network');
    err.code = 'network';
    throw err;
  }
  let data = null;
  try {
    const text = await res.text();
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = null;
  }
  if (!res.ok) {
    const msg = String((data && data.message) || '');
    const err = new Error(msg || 'http ' + res.status);
    err.code = /invalid key/i.test(msg) ? 'invalid_key' : /creation closed/i.test(msg) ? 'closed' : res.status === 404 ? 'not_installed' : 'server';
    throw err;
  }
  return data;
}

export const api = {
  createSpace: (studentKey, teacherKey, code, settings) => rpc('create_space', { student_key: studentKey, teacher_key: teacherKey, create_code: code, p_settings: settings }),
  getState: (k) => rpc('get_state', { k: k }),
  addCards: (k, items) => rpc('add_cards', { k: k, items: items }),
  saveProgress: (k, patches) => rpc('save_progress', { k: k, patches: patches }),
  saveLog: (k, day, n) => rpc('save_log', { k: k, p_day: day, p_n: n }),
  saveSettings: (k, settings) => rpc('save_settings', { k: k, p_settings: settings }),
  updateCard: (k, id, f) => rpc('update_card', { k: k, p_id: id, p_en: f.en, p_uk: f.uk, p_ex: f.ex, p_kind: f.kind, p_tags: f.tags }),
  deleteCards: (k, ids) => rpc('delete_cards', { k: k, ids: ids }),
  rotateTeacher: (k, newKey) => rpc('rotate_teacher', { k: k, new_key: newKey })
};
