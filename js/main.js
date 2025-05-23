(() => {
  //carga de productos y usuarios predefinidos
  document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    await loadPredefinedUsers();
    init();
  });
  async function loadProducts() {
    const resp = await fetch('./json/products.json');
    products = await resp.json();
  }
  async function loadPredefinedUsers() {
    const resp = await fetch('https://jsonplaceholder.typicode.com/users');
    const predefined = await resp.json();
    predefined.forEach(u => {
      if (!users.some(user => user.username === u.username)) {
        users.push({ username: u.username, password: "francia2do" });
      }
    });
    saveUsers();
  } 
  //variables globales
  let products = [];
  let cart = [];
  let users = [];
  let datosCompra = {};
  let currentUser = null;
  //elementos del DOM
  const dom = {
    productsSection: document.getElementById('products-section'),
    cartItemsList: document.getElementById('cart-items'),
    cartSubtotal: document.getElementById('cart-subtotal'),
    cartCountBadge: document.getElementById('cart-count'),
    emptyCartButton: document.getElementById('empty-cart-offcanvas'),
    checkoutBtn: document.getElementById('checkoutBtn'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    cartSidebarToggle: document.querySelector('[data-bs-target="#cartSidebar"]'),
    summaryList: document.getElementById('purchaseSummaryList'),
    summaryTotal: document.getElementById('purchaseSummaryTotal'),
    confirmPurchaseBtn: document.getElementById('confirmPurchaseBtn'),
    modalPurchaseSummary: document.getElementById('modalPurchaseSummary'),
    modalLogin: document.getElementById('modalLogin'),
    modalRegister: document.getElementById('modalRegister'),
    modalPurchaseData: document.getElementById('modalPurchaseData'),
    formPurchaseData: document.getElementById('formPurchaseData'),
  };
  //inicialización
  function init() {
    loadState();
    bindUIEvents();
    renderProducts();
    renderCart();
    updateUserUI();
  }
  //local storage usuario carrito
  function loadState() {
    cart = JSON.parse(localStorage.getItem('cart')) || [];
    users = JSON.parse(localStorage.getItem('users')) || [];
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
  }
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
  }
  function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }
  //eventos de la interfaz, alertas con sweetalert
  function bindUIEvents() {
    dom.emptyCartButton?.addEventListener('click', () => {
      Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Esta acción eliminará todos los productos del carrito.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#f59e42',
        cancelButtonColor: '#264653',
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          cart = [];
          saveCart();
          renderCart();
          Swal.fire({
            icon: 'success',
            title: 'Carrito vacío',
            showConfirmButton: false,
            timer: 1000
          });
        }
      });
    });
    dom.checkoutBtn?.addEventListener('click', () => {
      if (!currentUser) return showLoginModal();
      if (cart.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'Carrito vacío',
          text: 'Agregá productos antes de finalizar la compra.',
          confirmButtonColor: '#264653'
        });
        return;
      }
      new bootstrap.Modal(dom.modalPurchaseData).show();
    });
    dom.confirmPurchaseBtn?.addEventListener('click', () => {
      Swal.fire({
        icon: 'success',
        title: '¡Gracias por tu compra!',
        html: `
          <div>Gracias por tu compra, <strong>${currentUser.username}</strong>!</div>
          <div class="mt-2 mb-2">Detalle de tu compra:</div>
          ${generateTicket(cart)}
        `,
        confirmButtonColor: '#264653'
      });
      cart = [];
      saveCart();
      renderCart();
      bootstrap.Modal.getInstance(dom.modalPurchaseData).hide();
      bootstrap.Modal.getInstance(dom.modalPurchaseSummary)?.hide();
    });
    dom.formPurchaseData?.addEventListener('submit', function(e) {
      e.preventDefault();
      purchaseData = {
        name: document.getElementById('nameComprador').value,
        direction: document.getElementById('direccionComprador').value,
        email: document.getElementById('emailComprador').value,
        paymentMethod: document.getElementById('metodoPago').value
      };
      bootstrap.Modal.getInstance(dom.modalPurchaseData).hide();
      renderPurchaseSummary();
      new bootstrap.Modal(dom.modalPurchaseSummary).show();
    });
    dom.cartSidebarToggle?.addEventListener('click', e => {
      if (!currentUser) {
        e.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Iniciá sesión',
          text: 'Tenés que iniciar sesión para acceder al carrito.',
          confirmButtonColor: '#264653'
        });
      }
    });
    dom.registerForm?.addEventListener('submit', handleRegister);
    dom.loginForm?.addEventListener('submit', handleLogin);
    dom.logoutBtn?.addEventListener('click', handleLogout);
  }
  //renderización de productos y carrito
  function renderProducts() {
    dom.productsSection.innerHTML = '';
    const categories = {};
    products.forEach(product => {
      if (!categories[product.category]) categories[product.category] = [];
      categories[product.category].push(product);
    });
    Object.entries(categories).forEach(([category, list]) => {
      const article = document.createElement('article');
      article.className = 'idb-section';
      const title = document.createElement('h2');
      title.className = 'idb-section__title ms-2 pt-2';
      title.textContent = category;
      article.appendChild(title);
      const row = document.createElement('div');
      row.className = 'row g-0 d-flex justify-content-around';
      list.forEach(product => {
        const card = createProductCard(product);
        row.appendChild(card);
      });
      article.appendChild(row);
      dom.productsSection.appendChild(article);
    });
  }
  function createProductCard({ id, name, price, img }) {
    const col = document.createElement('div');
    col.className = 'col-2 d-flex justify-content-around mb-3';
    col.innerHTML = `
      <div class="idb-card card">
        <img src="${img}"
             class="idb-card__image card-img-top"
             alt="${name}">
        <div class="idb-card__body pt-1 ps-1 card-body">
          <h5 class="idb-card__title m-0 card-title">${name}</h5>
          <p class="idb-card__text card-text">$${price}</p>
          <div class="d-flex justify-content-end p-0 m-0">
            <button class="idb-card__cart btn agregar-carrito">
              <img src="./assets/cart_icon.png" alt="Agregar al carrito">
            </button>
          </div>
        </div>
      </div>`;
    const btn = col.querySelector('.agregar-carrito');
    btn.addEventListener('click', () => addToCart({ id, name: name, price: price }));
    return col;
  }
  //carrito
  function addToCart(item) {
    const existing = cart.find(p => p.id === item.id);
    existing ? existing.quantity++ : cart.push({ ...item, quantity: 1 });
    saveCart();
    renderCart();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Producto agregado al carrito',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      background: '#264653',
      color: '#fff'
    });
  }
  function removeFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
  }
  function changeQuantity(index, delta) {
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) removeFromCart(index);
    else {
      saveCart();
      renderCart();
    }
  }
  function renderCart() {
    dom.cartItemsList.innerHTML = '';
    let subtotal = 0;
    cart.forEach((p, i) => {
      const total = p.price * p.quantity;
      subtotal += total;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center px-0';
      li.innerHTML = `
        <div>
          ${p.name}
          <span class="badge bg-secondary mx-1">x${p.quantity}</span>
          $${total.toFixed(2)}
        </div>
        <div>
          <button class="btn btn-sm btn-outline-secondary me-1">−</button>
          <button class="btn btn-sm btn-outline-secondary me-1">+</button>
          <button class="btn btn-sm btn-danger">&times;</button>
        </div>`;
      const [btnDec, btnInc, btnRem] = li.querySelectorAll('button');
      btnDec.addEventListener('click', () => changeQuantity(i, -1));
      btnInc.addEventListener('click', () => changeQuantity(i, +1));
      btnRem.addEventListener('click', () => removeFromCart(i));
      dom.cartItemsList.appendChild(li);
    });
    dom.cartSubtotal.textContent = subtotal.toFixed(2);
    dom.cartCountBadge.textContent = cart.reduce((s, p) => s + p.quantity, 0);
  }
  function renderPurchaseSummary() {
    dom.summaryList.innerHTML = '';
    let total = 0;
    cart.forEach(item => {
      const subtotal = item.price * item.quantity;
      total += subtotal;
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          ${item.name} <span class="badge bg-secondary mx-2">x${item.quantity}</span>
        </div>
        <div>$${subtotal.toFixed(2)}</div>
      `;
      dom.summaryList.appendChild(li);
    });
    dom.summaryTotal.textContent = total.toFixed(2);
  }
  function generateTicket(cart) {
    return `
      <div style="text-align:left">
        <ul style="padding-left:1.2em; margin:0;">
          ${cart.map(p => `
            <li>
              <strong>${p.name}</strong> x${p.quantity} — $${(p.price * p.quantity).toFixed(2)}
            </li>
          `).join('')}
        </ul>
        <hr style="margin:0.5em 0;">
        <div><strong>Total:</strong> $${cart.reduce((s, p) => s + p.price * p.quantity, 0).toFixed(2)}</div>
      </div>
    `;
  }
  //registro e inicio de sesión
  function handleRegister(e) {
    e.preventDefault();
    const form = e.target;
    const username = form['register-username'].value.trim();
    const password = form['register-password'].value;
    if (users.some(u => u.username === username)) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario existente',
        text: 'El usuario ya existe.',
        confirmButtonColor: '#264653'
      });
      return;
    }
    users.push({ username, password });
    saveUsers();
    Swal.fire({
      icon: 'success',
      title: 'Registro exitoso',
      text: 'Ahora podés iniciar sesión.',
      confirmButtonColor: '#264653'
    });
    bootstrap.Modal.getOrCreateInstance(dom.modalRegister).hide();
  }
  function handleLogin(e) {
    e.preventDefault();
    const form = e.target;
    const username = form['login-username'].value.trim();
    const password = form['login-password'].value;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Usuario o contraseña incorrectos.',
        confirmButtonColor: '#264653'
      });
      return;
    }
    currentUser = user;
    saveCurrentUser();
    bootstrap.Modal.getOrCreateInstance(dom.modalLogin).hide();
    form.reset();
    updateUserUI();
    setTimeout(() => {
      Swal.fire({
        icon: 'success',
        title: `Bienvenido/a, ${user.username}`,
        showConfirmButton: false,
        timer: 1200
      });
    }, 300);
  }
  function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUserUI();
  }
  function updateUserUI() {
    if (currentUser) {
      dom.userInfoSpan.textContent = `Hola, ${currentUser.username}`;
      dom.loginBtn.style.display = 'none';
      dom.logoutBtn.style.display = 'inline-block';
    } else {
      dom.userInfoSpan.textContent = '';
      dom.loginBtn.style.display = 'inline-block';
      dom.logoutBtn.style.display = 'none';
    }
  }
  function showLoginModal() {
    new bootstrap.Modal(dom.modalLogin).show();
  }
})();