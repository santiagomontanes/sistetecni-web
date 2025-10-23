// Reemplaza por tus datos reales:
const WHATSAPP_NUMBER = "573043547758"; // ej: 573001112233 (sin '+')
const SALES_EMAIL = "sistetecnioficial@gmail.com";

const MESSAGE_TEMPLATE = (it) => `Hola, quisiera cotizar el equipo: ${it.nombre}${it.id ? ` (ID: ${it.id})` : ''}. ¿Me ayudas por favor?`;

function mailtoURL(it){
  const subject = encodeURIComponent(`Cotización: ${it.nombre}${it.id ? ` (${it.id})` : ''}`);
  const body = encodeURIComponent(MESSAGE_TEMPLATE(it));
  return `mailto:${SALES_EMAIL}?subject=${subject}&body=${body}`;
}
function whatsAppURL(it){
  const msg = encodeURIComponent(MESSAGE_TEMPLATE(it));
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}

function carouselHTML(id, images){
  if(!images || images.length===0){ return ''; }
  if(images.length===1){
    return `<img src="${images[0]}" class="card-img-top" alt="Imagen">`;
  }
  const slides = images.map((src, i)=>`
    <div class="carousel-item ${i===0?'active':''}">
      <img src="${src}" class="d-block w-100" alt="Imagen ${i+1}">
    </div>`).join('');

  return `
  <div id="${id}" class="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
    <div class="carousel-inner">
      ${slides}
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#${id}" data-bs-slide="prev">
      <span class="carousel-control-prev-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Anterior</span>
    </button>
    <button class="carousel-control-next" type="button" data-bs-target="#${id}" data-bs-slide="next">
      <span class="carousel-control-next-icon" aria-hidden="true"></span>
      <span class="visually-hidden">Siguiente</span>
    </button>
  </div>`;
}

async function loadCatalog(){
  try{
    const res = await fetch('data/catalog.json', {cache:'no-store'});
    const items = await res.json();
    const q = document.getElementById('q');
    const cat = document.getElementById('cat');
    const grid = document.getElementById('grid');
    const count = document.getElementById('count');

    function card(it){
      let images = [];
      if(Array.isArray(it.imgs) && it.imgs.length){ images = it.imgs; }
      else if(it.img){ images = [it.img]; }
      else { images = ['assets/img/placeholder.png']; }

      const carId = 'car_' + (it.id || Math.random().toString(36).slice(2));
      const wa = whatsAppURL(it);
      const em = mailtoURL(it);

      return `
      <div class="col-sm-6 col-lg-4">
        <div class="card h-100">
          ${carouselHTML(carId, images)}
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${it.nombre}</h5>
            <p class="text-muted small mb-2">${it.categoria ?? ''} · ${it.estado ?? '—'}</p>
            <p class="card-text">${it.descripcion ?? ''}</p>
            <div class="d-flex gap-2 flex-wrap mb-3">
              ${(it.tags||[]).map(t=>`<span class="badge badge-brand">${t}</span>`).join('')}
            </div>
            <div class="mt-auto d-flex justify-content-between align-items-center gap-2">
              <span class="fw-bold">COP ${it.precio ?? ''}</span>
              <div class="d-flex gap-2">
                <a href="${wa}" target="_blank" rel="noopener" class="btn btn-brand btn-sm">Cotizar</a>
                <a href="${em}" class="btn btn-outline-light btn-sm">Email</a>
              </div>
            </div>
          </div>
        </div>
      </div>`;
    }

    function render(list){
      grid.innerHTML = list.map(card).join('');
      count.textContent = `${list.length} ítems`;
    }

    function filter(){
      const term = (q.value||'').toLowerCase();
      const c = cat.value;
      const filtered = items.filter(it=>{
        const matchCat = !c || it.categoria===c;
        const hay = `${it.nombre} ${(it.tags||[]).join(' ')}`.toLowerCase();
        const matchQ = !term || hay.includes(term);
        return matchCat && matchQ;
      });
      render(filtered);
    }

    q.addEventListener('input', filter);
    cat.addEventListener('change', filter);
    render(items);
  }catch(e){
    document.getElementById('grid').innerHTML = `<div class="alert alert-danger">No se pudo cargar el catálogo.</div>`;
  }
}
document.addEventListener('DOMContentLoaded', loadCatalog);