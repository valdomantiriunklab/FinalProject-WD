function handleContactSubmit(e) {
  e.preventDefault();

  const name = document.querySelector("#contact-name").value.trim();
  const email = document.querySelector("#contact-email").value.trim();
  const msg = document.querySelector("#contact-message").value.trim();

  if (!name || !email || !msg) {
    alert("Isi semua field kontak dulu!");
    return;
  }

  // Simulasi pengiriman
  alert(`Pesan terkirim!\n\nTerima kasih, ${name}!`);
  document.querySelector("#contact-form").reset();
}

// Inisialisasi
document.addEventListener("DOMContentLoaded", () => {
  const cf = document.querySelector("#contact-form");
  if (cf) cf.addEventListener("submit", handleContactSubmit);
});
