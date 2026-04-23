// ── SUPABASE CONFIG ───────────────────────────────────
const SUPABASE_URL     = 'https://eqenqgrqvjithlayrezv.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qom4VOOQvZiFqvSXmT8pmw_Y2gqm_7l';

const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Hashear contraseña con SHA-256 (en el cliente, antes de enviar)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Login via RPC seguro — el password_hash nunca se devuelve al cliente
async function supabaseLogin(email, password) {
  try {
    const passwordHash = await hashPassword(password);
    const { data, error } = await _supabase.rpc('login_user', {
      p_email:         email.toLowerCase(),
      p_password_hash: passwordHash
    });
    if (error) return { success: false, error: 'Error de conexión' };
    return data; // { success, id, email, full_name, storage_id } o { success: false, error }
  } catch (err) {
    console.error('supabaseLogin error:', err);
    return { success: false, error: 'Error de conexión' };
  }
}

// Cambiar contraseña via RPC seguro
async function supabaseChangePassword(supabaseId, oldPassword, newPassword) {
  try {
    const oldHash = await hashPassword(oldPassword);
    const newHash = await hashPassword(newPassword);
    const { data, error } = await _supabase.rpc('change_password', {
      p_user_id:  supabaseId,
      p_old_hash: oldHash,
      p_new_hash: newHash
    });
    if (error) return { success: false, error: 'Error de conexión' };
    return data; // { success } o { success: false, error }
  } catch (err) {
    console.error('supabaseChangePassword error:', err);
    return { success: false, error: 'Error de conexión' };
  }
}
