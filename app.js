// Utils
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const cart = JSON.parse(localStorage.getItem('cart')||'[]');
const wish = JSON.parse(localStorage.getItem('wish')||'[]');

function saveCart(){localStorage.setItem('cart',JSON.stringify(cart)); updateCounts();}
function saveWish(){localStorage.setItem('wish',JSON.stringify(wish)); updateCounts();}
function updateCounts(){
  $('#cartCount').textContent = cart.reduce((a,b)=>a+b.qty,0);
  $('#wishCount').textContent = wish.length;
}

// Dark Mode
$('#darkToggle')?.addEventListener('click',()=>{
  document.body.classList.toggle('light');
  $('#darkToggle').textContent = document.body.classList.contains('light')? '🌙' : '☀️';
});

// Slider
let slideIdx=0;
const slides=$$('.slide');
function showSlide(i){slides.forEach(s=>s.classList.remove('active')); slides[i].classList.add('active');}
$('.next')?.addEventListener('click',()=>{slideIdx=(slideIdx+1)%slides.length;showSlide(slideIdx);});
$('.prev')?.addEventListener('click',()=>{slideIdx=(slideIdx-1+slides.length)%slides.length;showSlide(slideIdx);});
setInterval(()=>{$('.next')?.click()},5000);

// Render Product Card
function card(p){
  return `<div class="card fade-in">
    <a href="product.html?id=${p.id}"><img src="${p.img}" alt="${p.name}"></a>
    <div class="card-body">
      <h3>${p.name}</h3>
      <p class="price">Rp${p.price.toLocaleString('id-ID')}</p>
      <button onclick="addCart(${p.id})" class="btn btn-outline">Add to Cart</button>
    </div>
  </div>`;
}

// Shop Page
if($('#productGrid')){
  const cats=[...new Set(PRODUCTS.map(p=>p.cat))];
  cats.forEach(c=>$('#categoryFilter').innerHTML+=`<option>${c}</option>`);

  function renderShop(){
    let list=[...PRODUCTS];
    const q=$('#searchInput').value.toLowerCase();
    const cat=$('#categoryFilter').value;
    const sort=$('#sortFilter').value;
    if(q) list=list.filter(p=>p.name.toLowerCase().includes(q));
    if(cat) list=list.filter(p=>p.cat===cat);
    if(sort==='low') list.sort((a,b)=>a.price-b.price);
    if(sort==='high') list.sort((a,b)=>b.price-a.price);
    $('#productGrid').innerHTML=list.map(card).join('');
  }
  $('#searchInput').oninput=renderShop;
  $('#categoryFilter').onchange=renderShop;
  $('#sortFilter').onchange=renderShop;
  renderShop();

  $('#bestSellerGrid').innerHTML=PRODUCTS.filter(p=>p.best).map(card).join('');
}

// Product Detail
if($('#productDetail')){
  const id=new URLSearchParams(location.search).get('id');
  const p=PRODUCTS.find(x=>x.id==id);
  if(p){
    $('#productDetail').innerHTML=`
      <img src="${p.img}" alt="${p.name}">
      <div>
        <h1>${p.name}</h1>
        <p class="price">Rp${p.price.toLocaleString('id-ID')}</p>
        <p>${p.desc}</p>
        <div class="sizes">${p.size.map(s=>`<button>${s}</button>`).join('')}</div>
        <button onclick="addCart(${p.id})" class="btn btn-primary">Add to Cart</button>
        <button onclick="toggleWish(${p.id})" class="btn btn-outline">❤️ Wishlist</button>
      </div>`;
    $('#relatedGrid').innerHTML=PRODUCTS.filter(x=>x.cat===p.cat&&x.id!=p.id).slice(0,4).map(card).join('');
  }
}

// Cart Logic
window.addCart=(id,qty=1)=>{
  const i=cart.findIndex(x=>x.id==id);
  if(i>-1) cart[i].qty+=qty; else cart.push({id,qty});
  saveCart(); alert('Ditambah ke keranjang');
}
window.toggleWish=id=>{
  const i=wish.indexOf(id);
  i>-1?wish.splice(i,1):wish.push(id);
  saveWish();
}

if($('#cartItems')){
  function renderCart(){
    if(!cart.length){$('#cartItems').innerHTML='<p>Keranjang kosong</p>';return;}
    $('#cartItems').innerHTML=cart.map(it=>{
      const p=PRODUCTS.find(x=>x.id==it.id);
      return `<div class="card" style="display:flex;gap:12px;margin-bottom:12px">
        <img src="${p.img}" width="80">
        <div><h4>${p.name}</h4><p>Rp${p.price.toLocaleString('id-ID')} x ${it.qty}</p></div>
        <button onclick="rmCart(${it.id})">🗑️</button>
      </div>`;
    }).join('');
    updateTotal();
  }
  window.rmCart=id=>{cart.splice(cart.findIndex(x=>x.id==id),1);saveCart();renderCart();}
  let discount=0;
  $('#applyCoupon')?.addEventListener('click',()=>{
    const code=$('#couponCode').value.toUpperCase();
    discount=COUPONS[code]||0;
    alert(discount?`Kupon aktif: ${discount*100}%`:'Kupon salah');
    updateTotal();
  });
  function updateTotal(){
    const sub=cart.reduce((a,it)=>a+PRODUCTS.find(p=>p.id==it.id).price*it.qty,0);
    const disc=sub*discount;
    $('#subtotal').textContent='Rp'+sub.toLocaleString('id-ID');
    $('#discount').textContent='-Rp'+disc.toLocaleString('id-ID');
    $('#total').textContent='Rp'+(sub-disc).toLocaleString('id-ID');
  }
  renderCart();
}

// Checkout WA
$('#checkoutForm')?.addEventListener('submit',e=>{
  e.preventDefault();
  const f=e.target;
  let msg=`Halo Indigo Flow Store\nNama: ${f[0].value}\nWA: ${f[1].value}\nAlamat: ${f[2].value}\n\nPesanan:\n`;
  cart.forEach(it=>{
    const p=PRODUCTS.find(x=>x.id==it.id);
    msg+=`- ${p.name} x${it.qty}\n`;
  });
  msg+=`\nTotal: ${$('#total').textContent}`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`);
  localStorage.removeItem('cart');
});

updateCounts();