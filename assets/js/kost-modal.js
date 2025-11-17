
async function loadKostData(){
  try {
    const res = await fetch('./js/kostData.json'); // gunakan path relatif
    if(!res.ok) throw new Error('Gagal mengambil data kost: ' + res.status);
    const data = await res.json();
    window.kosts = data;
    renderKostCards(data);
  } catch (err) {
    console.error(err);
    const container = document.querySelector('#kost-cards') || document.querySelector('.container');
    if(container) container.innerHTML = '<p class="text-danger">Gagal memuat data kost. Cek path file atau jalankan lewat server.</p>';
  }
}

function renderKostCards(data){
  const container = document.querySelector('#kost-cards') || document.querySelector('.container');
  if (!container) return;
  container.innerHTML = "";
  let html = '<div class="row g-3">';
  data.forEach(k=>{
    html += `
      <div class="col-md-4">
        <div class="card h-100 card-kost p-3">
          <img src="${k.foto_utama}" class="card-img-top" style="height:180px;object-fit:cover;border-radius:8px;">
          <div class="card-body">
            <h5 class="card-title">${k.name}</h5>
            <p class="small-muted mb-1">${k.location}</p>
            <p class="mb-1">Rp. ${k.price}</p>
            <div class="d-flex justify-content-between align-items-center mt-2">
              <button class="btn btn-sm btn-primary" onclick="openKostModal(${k.id})">Detail</button>
              <p class="kost-status">${k.available ? '<span class="text-success">Tersedia</span>' : '<span class="text-danger">Penuh</span>'}</p>
              <span class="small-muted">${k.kategori}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += '</div>';
  container.insertAdjacentHTML('beforeend', html);
}

function applyKostFilters() {
  if (!window.kosts) return;

  const q = (document.querySelector('#search-q')?.value || '').trim().toLowerCase();
  const min = Number(document.querySelector('#filter-min')?.value || 0);
  const maxInput = document.querySelector('#filter-max')?.value;
  const max = maxInput === "" ? Infinity : Number(maxInput);
  const onlyAvailable = document.querySelector('#filter-available')?.checked || false;
  const kategori = document.querySelector('#filter-kategori')?.value || "";

  const filtered = window.kosts.filter(k => {

    // log debugging
    console.log("kategori dipilih:", kategori, "kategori item:", k.kategori);

    const matchesQ =
      !q ||
      (k.name || "").toLowerCase().includes(q) ||
      (k.location || "").toLowerCase().includes(q);

    const price = Number(k.price || 0);
    const matchesPrice = price >= min && price <= max;

    const matchesAvailable = !onlyAvailable || !!k.available;

    const matchesKategori =
      kategori === "" ||
      (k.kategori && k.kategori.toLowerCase() === kategori.toLowerCase());

    return matchesQ && matchesPrice && matchesAvailable && matchesKategori;
  });

  renderKostCards(filtered);
}

function resetFilters() {
  document.querySelector('#search-q').value = "";
  document.querySelector('#filter-min').value = "";
  document.querySelector('#filter-max').value = "";
  document.querySelector('#filter-available').checked = false;
  document.querySelector('#filter-kategori').value = "";

  // render ulang semua data
  renderKostCards(window.kosts);
}


function openKostModal(id){
  const k = window.kosts.find(x=>x.id===id);
  if(!k) return alert('Data tidak ditemukan');

  let indicators = '';
  let inner = '';
  const images = [k.foto_utama].concat(k.foto_tambahan || []);
  images.forEach((src, idx)=>{
    indicators += `<button type="button" data-bs-target="#kostDetailCarousel" data-bs-slide-to="${idx}" ${idx===0?'class="active" aria-current="true"':''} aria-label="Slide ${idx+1}"></button>`;
    inner += `<div class="carousel-item ${idx===0?'active':''}"><img src="${src}" class="d-block w-100" style="height:300px;object-fit:cover;"></div>`;
  });
  const facilities = (k.fasilitas || []).map(f=>`<li>${f}</li>`).join('');

  const mapsImg = k.maps_img || 'assets/img/maps/placeholder.jpg';
  const modalHtml = `
  <div class="modal fade" id="kostDetailModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">${k.name} — ${k.kategori}</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div id="kostDetailCarousel" class="carousel slide mb-3" data-bs-ride="false">
            <div class="carousel-indicators">${indicators}</div>
            <div class="carousel-inner">${inner}</div>
            <button class="carousel-control-prev" type="button" data-bs-target="#kostDetailCarousel" data-bs-slide="prev">
              <span class="carousel-control-prev-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Previous</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#kostDetailCarousel" data-bs-slide="next">
              <span class="carousel-control-next-icon" aria-hidden="true"></span>
              <span class="visually-hidden">Next</span>
            </button>
          </div>
          <div class="row">
            <div class="col-md-6">
              <h6>Kontak</h6>
              <p class="small-muted">${k.kontak}</p>
              <h6>Alamat</h6>
              <p class="small-muted">${k.location}</p>
              <h6>Fasilitas</h6>
              <ul>${facilities}</ul>
              <p><strong>Jumlah kamar:</strong> ${k.jumlah_kamar} &nbsp; <strong>Kapasitas/ kamar:</strong> ${k.kapasitas_per_kamar}</p>
            </div>
            <div class="col-md-6 text-center">
              <a href="${k.maps_link}" target="_blank" rel="noopener">
                <img src="${mapsImg}" alt="maps" class="img-fluid rounded shadow-sm" style="max-height:300px;object-fit:cover;">
              </a>
              <p class="small-muted mt-2">Klik peta untuk buka Google Maps</p>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
        </div>
      </div>
    </div>
  </div>
  `;

  const existing = document.querySelector('#kostDetailModal');
  if(existing) existing.remove();
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  var modal = new bootstrap.Modal(document.getElementById('kostDetailModal'));
  modal.show();
}

document.addEventListener('DOMContentLoaded', () => {
  loadKostData();

  const form = document.querySelector('#search-form');
  if (form) {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      applyKostFilters();
    });
  }

const inputs = ['#search-q','#filter-min','#filter-max','#filter-available', '#filter-kategori'];
  inputs.forEach(sel => {
    const el = document.querySelector(sel);
    if(!el) return;
    const evt = (el.type === 'checkbox') ? 'change' : 'input';
    el.addEventListener(evt, () => {
      applyKostFilters();

    const resetBtn = document.querySelector('#reset-filter');
    if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        resetFilters();
    });
}
    });
  });
});