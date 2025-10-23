
let data = [];

const filesInput = document.getElementById('imgfiles');
const urlsInput  = document.getElementById('imgsurls');
const preview    = document.getElementById('preview');

filesInput.addEventListener('change', async (e)=>{
  const files = Array.from(e.target.files || []);
  preview.innerHTML = '';
  for(const f of files){
    const url = await fileToDataURL(f);
    addThumb(url);
  }
});

function addThumb(src){
  const img = document.createElement('img');
  img.src = src;
  img.className = 'rounded border';
  img.style.width = '120px';
  img.style.height = '90px';
  img.style.objectFit = 'cover';
  preview.appendChild(img);
}

function fileToDataURL(file){
  return new Promise((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=> resolve(r.result);
    r.onerror = ()=> reject(r.error);
    r.readAsDataURL(file);
  });
}

function paint(){
  const tbody = document.getElementById('list');
  tbody.innerHTML = data.map(it=>`
    <tr>
      <td>${it.id}</td><td>${it.nombre}</td><td>${it.categoria||''}</td><td>${it.precio||''}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light" onclick="editItem('${it.id}')">Editar</button>
        <button class="btn btn-sm btn-outline-light" onclick="delItem('${it.id}')">Borrar</button>
      </td>
    </tr>
  `).join('');
}

function getFormBase(){
  return {
    id: document.getElementById('id').value.trim(),
    nombre: document.getElementById('nombre').value.trim(),
    categoria: document.getElementById('categoria').value.trim(),
    precio: document.getElementById('precio').value.trim(),
    descripcion: document.getElementById('descripcion').value.trim(),
    tags: document.getElementById('tags').value.split(',').map(s=>s.trim()).filter(Boolean),
    estado: document.getElementById('estado').value
  }
}

async function buildImages(){
  const imgs = [];
  const files = Array.from(filesInput.files || []);
  for(const f of files){ imgs.push(await fileToDataURL(f)); }
  const urls = (urlsInput.value||'').split(',').map(s=>s.trim()).filter(Boolean);
  imgs.push(...urls);
  return imgs;
}

async function editItem(id){
  const it = data.find(x=>x.id===id);
  if(!it) return;
  setForm(it);
}

function setForm(it){
  document.getElementById('id').value = it.id || '';
  document.getElementById('nombre').value = it.nombre || '';
  document.getElementById('categoria').value = it.categoria || '';
  document.getElementById('precio').value = it.precio || '';
  document.getElementById('descripcion').value = it.descripcion || '';
  document.getElementById('tags').value = (it.tags||[]).join(', ');
  document.getElementById('estado').value = it.estado || 'disponible';

  preview.innerHTML = '';
  const imgs = (Array.isArray(it.imgs) && it.imgs.length) ? it.imgs : (it.img ? [it.img] : []);
  imgs.forEach(addThumb);
  filesInput.value = '';
  urlsInput.value = '';
}

function delItem(id){
  data = data.filter(x=>x.id!==id);
  paint();
}

document.getElementById('btnAdd').addEventListener('click', async (e)=>{
  e.preventDefault();
  const base = getFormBase();
  if(!base.id) return alert('ID requerido');

  const imgs = await buildImages();
  if(imgs.length){ base.img = imgs[0]; base.imgs = imgs; }

  const idx = data.findIndex(x=>x.id===base.id);
  if(idx>=0) data[idx]=base; else data.push(base);
  paint();
});

document.getElementById('btnExport').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'catalog.json';
  a.click();
});

document.getElementById('btnLoad').addEventListener('click', ()=>{
  const f = document.getElementById('fileIn').files[0];
  if(!f) return alert('Selecciona un archivo JSON');
  const r = new FileReader();
  r.onload = e=>{
    try{ data = JSON.parse(e.target.result); paint(); }
    catch(err){ alert('JSON inválido'); }
  }
  r.readAsText(f);
});
