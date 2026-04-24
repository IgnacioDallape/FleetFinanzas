const SUPABASE_URL = 'https://eqenqgrqvjithlayrezv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qom4VOOQvZiFqvSXmT8pmw_Y2gqm_7l';
const SUPABASE_AUTH_KEY = 'fleet_session';
const SUPABASE_APP_KEYS = Object.freeze({
  flujo: 'flujo_data',
  units: 'flujo_units',
  fleetcostHist: 'fleetcost_historial'
});

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function readSupabaseSession() {
  try {
    const raw = localStorage.getItem(SUPABASE_AUTH_KEY) || sessionStorage.getItem(SUPABASE_AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function getSupabaseUserId() {
  return readSupabaseSession()?.supabaseId || null;
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function supabaseLogin(email, password) {
  try {
    const passwordHash = await hashPassword(password);
    const { data, error } = await _supabase.rpc('login_user', {
      p_email: email.toLowerCase(),
      p_password_hash: passwordHash
    });
    if (error) return { success: false, error: 'Error de conexion' };
    return data;
  } catch (err) {
    console.error('supabaseLogin error:', err);
    return { success: false, error: 'Error de conexion' };
  }
}

async function supabaseChangePassword(supabaseId, oldPassword, newPassword) {
  try {
    const oldHash = await hashPassword(oldPassword);
    const newHash = await hashPassword(newPassword);
    const { data, error } = await _supabase.rpc('change_password', {
      p_user_id: supabaseId,
      p_old_hash: oldHash,
      p_new_hash: newHash
    });
    if (error) return { success: false, error: 'Error de conexion' };
    return data;
  } catch (err) {
    console.error('supabaseChangePassword error:', err);
    return { success: false, error: 'Error de conexion' };
  }
}

async function supabaseLoadAppState(appName) {
  const userId = getSupabaseUserId();
  if (!userId) return { success: false, skipped: true, error: 'no-session' };

  try {
    const { data, error } = await _supabase.rpc('get_user_app_state', {
      p_user_id: userId,
      p_app_name: appName
    });
    if (error) {
      console.warn('supabaseLoadAppState failed:', appName, error);
      return { success: false, error: error.message || 'Error de lectura' };
    }
    return { success: true, data: data ?? null };
  } catch (err) {
    console.warn('supabaseLoadAppState error:', appName, err);
    return { success: false, error: 'Error de lectura' };
  }
}

async function supabaseSaveAppState(appName, payload) {
  const userId = getSupabaseUserId();
  if (!userId) return { success: false, skipped: true, error: 'no-session' };

  try {
    const { data, error } = await _supabase.rpc('upsert_user_app_state', {
      p_user_id: userId,
      p_app_name: appName,
      p_payload: payload
    });
    if (error) {
      console.warn('supabaseSaveAppState failed:', appName, error);
      return { success: false, error: error.message || 'Error de guardado' };
    }
    return { success: true, data: data ?? null };
  } catch (err) {
    console.warn('supabaseSaveAppState error:', appName, err);
    return { success: false, error: 'Error de guardado' };
  }
}

async function supabaseDeleteAppState(appName) {
  const userId = getSupabaseUserId();
  if (!userId) return { success: false, skipped: true, error: 'no-session' };

  try {
    const { data, error } = await _supabase.rpc('delete_user_app_state', {
      p_user_id: userId,
      p_app_name: appName
    });
    if (error) {
      console.warn('supabaseDeleteAppState failed:', appName, error);
      return { success: false, error: error.message || 'Error de borrado' };
    }
    return { success: true, data: data ?? null };
  } catch (err) {
    console.warn('supabaseDeleteAppState error:', appName, err);
    return { success: false, error: 'Error de borrado' };
  }
}

window.supabaseState = {
  keys: SUPABASE_APP_KEYS,
  readSession: readSupabaseSession,
  getUserId: getSupabaseUserId,
  load: supabaseLoadAppState,
  save: supabaseSaveAppState,
  remove: supabaseDeleteAppState
};
