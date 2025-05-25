//variables globales
let products = [];
let cart = [];
let users = [];
let datosCompra = {};
let currentUser = null;

//carga de productos y usuarios predefinidos
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