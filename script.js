/* ---------- DATA: 12 MENU ITEMS ---------- */
const MENU = [
  { id: "m1", name: "Cheese Burst Pizza", price: 299, img: "cheese burst pizza.jpeg" },
  { id: "m2", name: "Veg Burger", price: 149, img: "burger.jpeg" },
  { id: "m3", name: "French Fries", price: 49, img: "french fries.jpeg" },
  { id: "m4", name: "Grilled Sandwich", price: 129, img: "sandwich.jpeg" },
  { id: "m5", name: "Paneer Tikka", price: 249, img: "paneer tikka.jpeg" },
  { id: "m6", name: "Cakes", price: 59, img: "cakee.jpeg" },
  { id: "m7", name: "Schezwan Noodles", price: 199, img: "noodles.jpeg" },
  { id: "m8", name: "Butter Chicken", price: 229, img: "butter chicken.jpeg" },
  { id: "m9", name: "Momos (8 pcs)", price: 99, img: "momos.jpeg" },
  { id: "m10", name: "Chocolate Brownie", price: 89, img: "chocolate brownie.jpeg" },
  { id: "m11", name: "Cold Coffee", price: 79, img: "cold.jpeg" },
  { id: "m12", name: "Masala Dosa", price: 149, img: "masala dosa.jpeg" }
];

/* ---------- CART (localStorage) ---------- */
let cart = JSON.parse(localStorage.getItem("cart_v1")) || []; // versioned key

function saveCart(){
  localStorage.setItem("cart_v1", JSON.stringify(cart));
  updateCartCountBadge();
}

/* ---------- NAV BADGE ---------- */
function updateCartCountBadge(){
  const count = cart.reduce((s,i)=> s + (i.qty || 1), 0);
  const badge = document.getElementById("cart-count");
  if(badge) badge.innerText = count;
}

/* ---------- ADD TO CART (advanced) ---------- */
function addToCart(itemId){
  const item = MENU.find(m=>m.id===itemId);
  if(!item) return;
  const found = cart.find(c=>c.id===itemId);
  if(found){
    found.qty = (found.qty||1) + 1;
  } else {
    cart.push({ id:item.id, name:item.name, price:item.price, img:item.img, qty:1 });
  }
  saveCart();
  showToast(`${item.name} added to your cart`);
}

/* ---------- TOAST ---------- */
let toastTimer = null;
function showToast(text){
  let t = document.getElementById("toast");
  if(!t){
    t = document.createElement("div");
    t.id = "toast";
    t.className = "toast";
    t.innerHTML = `<div class="ok">✓</div><div class="msg"></div>`;
    document.body.appendChild(t);
  }
  t.querySelector(".msg").innerText = text;
  t.classList.add("show");
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove("show"), 2000);
}

/* ---------- RENDER MENU (order.html) ---------- */
function renderMenu(){
  const container = document.getElementById("menuGrid");
  if(!container) return;
  container.innerHTML = "";
  MENU.forEach(item=>{
    container.innerHTML += `
      <div class="card">
        <img src="${item.img}?auto=format&fit=crop&w=800&q=60" alt="${escapeHtml(item.name)}">
        <div class="meta">
          <h3>${escapeHtml(item.name)}</h3>
          <div class="price">₹${item.price}</div>
        </div>
        <div class="desc">Freshly prepared — perfect for any time of day.</div>
        <div class="controls">
          <button onclick="addToCart('${item.id}')">Add to Cart</button>
          <button class="small" onclick="quickAdd('${item.id}')">+1</button>
        </div>
      </div>
    `;
  });
}

/* ---------- QUICK ADD (same as addToCart but no duplicate toast) ---------- */
function quickAdd(id){
  addToCart(id);
}

/* ---------- CART PAGE: LOAD & RENDER ---------- */
function loadCartPage(){
  const wrap = document.getElementById("cartList");
  if(!wrap) return;
  if(cart.length === 0){
    wrap.innerHTML = `<div class="cart-list" style="text-align:center;padding:40px">Your cart is empty. <br/><a href="order.html" style="color:#ff6b3d;font-weight:700">Browse menu</a></div>`;
    updateCartCountBadge();
    updateTotals();
    return;
  }
  let html = `<div class="cart-list">`;
  cart.forEach(i=>{
    const subtotal = (i.price * (i.qty||1)).toFixed(0);
    html += `
      <div class="cart-row" data-id="${i.id}">
        <img class="cart-thumb" src="${i.img}?auto=format&fit=crop&w=400&q=60" alt="${escapeHtml(i.name)}">
        <div class="cart-info">
          <div class="cart-title">${escapeHtml(i.name)}</div>
          <div style="color:#6b5a53;margin-top:6px">₹${i.price} each</div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px">
          <div class="qty-controls">
            <button onclick="updateQuantity('${i.id}', -1)">−</button>
            <div style="min-width:44px;text-align:center;font-weight:700">${i.qty}</div>
            <button onclick="updateQuantity('${i.id}', 1)">+</button>
          </div>
          <div style="font-weight:700">₹${subtotal}</div>
          <button class="remove" onclick="removeItem('${i.id}')">Remove</button>
        </div>
      </div>
    `;
  });
  html += `
    <div class="totals">
      <div class="line"><div>Subtotal</div><div id="subtotalVal">₹0</div></div>
      <div class="line"><div>Delivery</div><div id="deliveryVal">₹30</div></div>
      <div class="line" style="font-size:1.15rem;color:#111"><div>Total</div><div id="totalVal">₹0</div></div>
      <div style="display:flex;gap:12px;margin-top:8px">
        <button onclick="checkout()" style="flex:1;padding:10px;border-radius:10px;background:#676be8ff;color:white;border:none;font-weight:800;cursor:pointer">Checkout</button>
        <button onclick="clearCart()" style="padding:10px;border-radius:10px;border:1px solid #676be8ff;background:white;color:#ff6b3d;cursor:pointer">Clear</button>
      </div>
    </div>
  </div>
  `;
  wrap.innerHTML = html;
  updateTotals();
  updateCartCountBadge();
}

/* ---------- UPDATE QUANTITY ---------- */
function updateQuantity(itemId, delta){
  const idx = cart.findIndex(i=>i.id===itemId);
  if(idx === -1) return;
  cart[idx].qty = (cart[idx].qty || 1) + delta;
  if(cart[idx].qty <= 0) {
    // remove if qty 0
    cart.splice(idx,1);
  }
  saveCart();
  loadCartPage();
}

/* ---------- REMOVE ---------- */
function removeItem(itemId){
  cart = cart.filter(i => i.id !== itemId);
  saveCart();
  loadCartPage();
  showToast("Item removed from cart");
}

/* ---------- CLEAR CART ---------- */
function clearCart(){
  if(!confirm("Clear all items from the cart?")) return;
  cart = [];
  saveCart();
  loadCartPage();
  showToast("Cart cleared");
}

/* ---------- TOTALS ---------- */
function updateTotals(){
  const subtotal = cart.reduce((s,i)=> s + (i.price * (i.qty||1)), 0);
  const delivery = subtotal === 0 ? 0 : 30; // simple rule
  const total = subtotal + delivery;
  const subEl = document.getElementById("subtotalVal");
  const delEl = document.getElementById("deliveryVal");
  const totEl = document.getElementById("totalVal");
  if(subEl) subEl.innerText = `₹${subtotal.toFixed(0)}`;
  if(delEl) delEl.innerText = `₹${delivery.toFixed(0)}`;
  if(totEl) totEl.innerText = `₹${total.toFixed(0)}`;
}

/* ---------- CHECKOUT (demo) ---------- */
function checkout(){
  if(cart.length===0){ alert("Your cart is empty"); return; }
  // For demo: show order summary and clear cart
  const subtotal = cart.reduce((s,i)=> s + (i.price * (i.qty||1)), 0);
  const total = subtotal + 30;
  alert(`Order received!\nItems: ${cart.length}\nTotal: ₹${total.toFixed(0)}\n(Checkout demo)`);
  cart = [];
  saveCart();
  loadCartPage();
}

/* ---------- NAV MOBILE TOGGLE ---------- */
function toggleNav(){
  const nav = document.getElementById("mainNav");
  if(!nav) return;
  if(nav.style.display === "flex") nav.style.display = "none";
  else nav.style.display = "flex";
}

/* ---------- UTILS ---------- */
function escapeHtml(str){
  return String(str).replace(/[&<>"'`=\/]/g, function(s){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'})[s];});
}

/* ---------- INIT ON EVERY PAGE ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  // render menu if on order page
  renderMenu();
  // load cart page content if present
  if(document.getElementById("cartList")) loadCartPage();
  // cart count
  updateCartCountBadge();
  // set up mobile hamburger
  const hamb = document.getElementById("hamb");
  if(hamb) hamb.addEventListener("click", toggleNav);
});
