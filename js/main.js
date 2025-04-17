//array de productos
const productos = [
  { id: 1, nombre: "Licuadora", precio: 60000 },
  { id: 2, nombre: "Air fryer", precio: 130000 },
  { id: 3, nombre: "Batidora", precio: 110000 },
  { id: 4, nombre: "Mini Pimmer", precio: 50000 },
  { id: 5, nombre: "Microondas", precio: 185000 }
];
//o recuperar carrito de localStorage y sino inicializar como array vacio
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
//renderizo los productos
function renderizarProductos() {
  const contenedor = document.getElementById("productos-container");
  contenedor.innerHTML = "";
  productos.forEach(producto => {
    //card del producto
    const card = document.createElement("div");
    card.className = "col-2 d-flex justify-content-around my-3";
    card.innerHTML = `
      <div class="idb-card card">
        <img src="./assets/image_placeholder.png" class="idb-card__image card-img-top" alt="${producto.nombre}">
        <div class="idb-card__body pt-1 ps-1 card-body">
          <h5 class="idb-card__title m-0 card-title">${producto.nombre}</h5>
          <p class="idb-card__text card-text">$${producto.precio}</p>
          <div class="d-flex justify-content-end p-0 m-0">
            <button class="idb-card__cart btn agregar-carrito" data-id="${producto.id}">
              <img src="./assets/cart_icon.png" alt="Agregar al carrito">
            </button>
          </div>
        </div>
      </div>
    `;
    contenedor.appendChild(card);
  });
  //evento click para cada boton de agregar a carrito
  document.querySelectorAll(".agregar-carrito").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idProducto = parseInt(e.currentTarget.getAttribute("data-id"));
      const productoSeleccionado = productos.find(p => p.id === idProducto);
      carrito.push(productoSeleccionado);
      localStorage.setItem("carrito", JSON.stringify(carrito));
      renderizarCarrito();
    });
  });
}
//se muestra el carrito en el dom
function renderizarCarrito() {
  const listaCarrito = document.getElementById("carrito-lista");
  listaCarrito.innerHTML = "";

  if (carrito.length === 0) {
    const liVacio = document.createElement("li");
    liVacio.className = "list-group-item";
    liVacio.innerText = "El carrito está vacío.";
    listaCarrito.appendChild(liVacio);
  } else {
    carrito.forEach((producto) => {
      const li = document.createElement("li");
      li.className = "list-group-item d-flex justify-content-between align-items-center";
      li.innerText = `${producto.nombre} - $${producto.precio}`;
      listaCarrito.appendChild(li);
    });
  }
}
//evento vaciar el carrito
document.getElementById("vaciar-carrito").addEventListener("click", () => {
  carrito = [];
  localStorage.removeItem("carrito");
  renderizarCarrito();
});
//renderizar productos y carrito
renderizarProductos();
renderizarCarrito();