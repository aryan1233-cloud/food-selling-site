/* ---------- AOS scroll animations ---------- */
AOS.init({ duration: 700 });

/* ---------- Swiper testimonial slider ---------- */
if (document.querySelector('.mySwiper')) {
  /* global Swiper */
  new Swiper('.mySwiper', {
    loop: true,
    autoplay: { delay: 4500 },
    pagination: { el: '.swiper-pagination', clickable: true }
  });
}

/* ---------- Live search (menu page) ---------- */
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  const cards = [...document.querySelectorAll('.menu-item')];
  searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    cards.forEach(c =>
      (c.style.display = c.dataset.name.includes(q) ? '' : 'none')
    );
  });
}

/* ---------- Image zoom modal (menu page) ---------- */
document.addEventListener('click', e => {
  if (!e.target.classList.contains('zoom-img')) return;

  let modal = document.getElementById('imgModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imgModal';
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <img class="modal-img" />
      <span class="modal-close">&times;</span>`;
    document.body.appendChild(modal);
  }
  modal.querySelector('.modal-img').src = e.target.src;
  modal.classList.add('open');

  modal.querySelector('.modal-backdrop').onclick =
    modal.querySelector('.modal-close').onclick = () =>
      modal.classList.remove('open');
});
