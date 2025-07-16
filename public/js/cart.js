/* ---------- Cart add / update / remove ---------- */
async function addToCart(btn) {
  const { id, name, price } = btn.dataset;

  const res = await fetch('/cart/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, name, price })
  });

  const data = await res.json();
  if (data.ok) {
    // Replace Add to Cart button with qty-controls
    const card = btn.closest('.card');
    btn.remove();

    const controls = document.createElement('div');
    controls.className = 'qty-controls';
    controls.innerHTML = `
      <button onclick="updateQty('${id}', -1)">−</button>
      <span id="qty-${id}">1</span>
      <button onclick="updateQty('${id}', 1)">+</button>
    `;
    card.appendChild(controls);

    updateCartBadge(data.cartCount);
  }
}

async function updateQty(id, delta) {
  const qtyEl = document.getElementById(`qty-${id}`);
  if (!qtyEl) return;

  const newQty = +qtyEl.textContent + delta;

  if (newQty < 1) {
    // Remove item from cart
    const res = await fetch('/cart/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    const data = await res.json();
    if (data.ok) {
      const card = qtyEl.closest('.card');

      // Remove qty-controls
      const controls = card.querySelector('.qty-controls');
      if (controls) controls.remove();

      // Re-add the Add to Cart button
      const addBtn = document.createElement('button');
      addBtn.className = 'btn';
      addBtn.textContent = 'Add to Cart';
      addBtn.dataset.id = id;
      addBtn.dataset.name = card.querySelector('h3')?.textContent || '';
      addBtn.dataset.price = card.querySelector('p')?.textContent.replace(/[^\d]/g, '') || '';
      addBtn.onclick = () => addToCart(addBtn);

      card.appendChild(addBtn);

      updateCartBadge(data.cartCount);
    }

    return;
  }

  // Update quantity in cart
  const res = await fetch('/cart/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, qty: newQty })
  });

  const data = await res.json();
  if (data.ok) {
    qtyEl.textContent = newQty;
    updateCartBadge(data.cartCount);
  }
}

/* ---------- Update cart badge in nav ---------- */
function updateCartBadge(count) {
  const cartLink = document.querySelector('a[href="/cart"]');
  if (cartLink) {
    cartLink.textContent = `🛒 Cart (${count ?? 0})`;
  }
}
