const USERNAME = "sistetecni";
const PASS_HASH_HEX = "6e6c411e8deb15719c3f287baaf04015267bfac5420fc172a46301e21d787eee"; // sha256('catalogo2025')
const TOKEN_KEY = "sistetecni-auth";
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

async function sha256Hex(str) {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
function setSession(){ localStorage.setItem(TOKEN_KEY, JSON.stringify({t:Date.now()})); }
function clearSession(){ localStorage.removeItem(TOKEN_KEY); }
function hasValidSession(){
  try{ const o = JSON.parse(localStorage.getItem(TOKEN_KEY)); return o && (Date.now()-o.t) < TOKEN_TTL_MS; }
  catch(e){ return false; }
}
async function doLogin(ev){
  ev.preventDefault();
  const u = document.getElementById('login-user').value.trim();
  const p = document.getElementById('login-pass').value;
  if(u !== USERNAME) return showMsg('Usuario o contraseña incorrectos', true);
  const h = await sha256Hex(p);
  if(h !== PASS_HASH_HEX) return showMsg('Usuario o contraseña incorrectos', true);
  setSession(); showMsg('Acceso concedido. Redirigiendo...', false);
  const url = new URL(window.location.href);
  const redirect = url.searchParams.get('redirect') || 'admin.html';
  setTimeout(()=> window.location.href = redirect, 400);
}
function requireAuth(){
  if(!hasValidSession()){
    const current = encodeURIComponent(window.location.pathname.split('/').pop() || 'admin.html');
    window.location.href = `login.html?redirect=${current}`;
  }
}
function logout(){ clearSession(); window.location.href='index.html'; }
function showMsg(msg, isErr=false){
  const box = document.getElementById('login-msg');
  if(!box) return;
  box.className = 'alert ' + (isErr ? 'alert-danger' : 'alert-success');
  box.textContent = msg; box.style.display='block';
}
window.Auth = {requireAuth, logout, doLogin};