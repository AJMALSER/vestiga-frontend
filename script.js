const API_URL = "https://vestiga-backend-3392.onrender.com/api";

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smooth: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

const spotlight = document.querySelector('.spotlight');
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');

document.addEventListener('mousemove', (e) => {
    spotlight.style.setProperty('--x', `${e.clientX}px`);
    spotlight.style.setProperty('--y', `${e.clientY}px`);
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
    gsap.to(follower, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
});

document.querySelectorAll('a, button, .magnetic-btn').forEach(el => {
    el.addEventListener('mouseenter', () => gsap.to(follower, { width: 60, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', duration: 0.3 }));
    el.addEventListener('mouseleave', () => gsap.to(follower, { width: 40, height: 40, backgroundColor: 'transparent', duration: 0.3 }));
});

window.addEventListener('scroll', () => {
    let scrollVal = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
    document.querySelector('.scroll-progress').style.width = `${scrollVal}%`;
});

const particlesContainer = document.getElementById('particles');
for(let i=0; i<30; i++) {
    let div = document.createElement('div');
    div.classList.add('particle');
    div.style.width = Math.random() * 4 + 'px';
    div.style.height = div.style.width;
    div.style.left = Math.random() * 100 + 'vw';
    div.style.top = Math.random() * 100 + 'vh';
    particlesContainer.appendChild(div);
    
    gsap.to(div, {
        y: `-=${Math.random() * 200 + 100}`,
        x: `+=${Math.random() * 100 - 50}`,
        opacity: 0,
        duration: Math.random() * 10 + 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

// ✨ Premium Loader & Page Transition
window.addEventListener('load', () => {
    const splitTitle = new SplitType('.split-target', { types: 'chars' });
    const splitBrand = new SplitType('.split-brand', { types: 'chars' }); 
    
    const tl = gsap.timeline();
    let count = { val: 0 };
    
    gsap.set(splitBrand.chars, { opacity: 0, scale: 1.5, filter: 'blur(10px)' });
    
    tl.to(count, {
        val: 100, duration: 1.5, roundProps: "val", ease: "power2.inOut",
        onUpdate: () => document.querySelector('.loader-counter').innerText = count.val + "%"
    })
    .to(splitBrand.chars, { opacity: 1, scale: 1, filter: 'blur(0px)', stagger: 0.1, duration: 1, ease: 'expo.out' }, "-=1.5")
    .to('.loader-overlay-2', { height: 0, duration: 1, ease: 'expo.inOut', delay: 0.5 })
    .to('.loader-overlay-1', { height: 0, duration: 1, ease: 'expo.inOut' }, "-=0.8")
    .to('.loader-content', { opacity: 0, duration: 0.5 }, "-=1.5")
    .set('.luxury-loader', { display: 'none' })
    .from('.glass-navbar', { y: -100, opacity: 0, duration: 1, ease: 'power3.out' }, "-=0.5")
    .from(splitTitle.chars, {
        y: 100, rotationX: -90, opacity: 0, filter: 'blur(10px)',
        stagger: 0.05, duration: 1.2, ease: 'back.out(1.7)'
    }, "-=0.5")
    .from('.fade-up', { y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: 'power2.out' }, "-=0.5");
});

// Magnetic Buttons
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.4, y: y * 0.4, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.3)' });
    });
});

// ✨ Cart Base Logic
let currentCartCount = 0;
const cartIcon = document.getElementById('cart-icon');
const cartBadge = document.querySelector('.cart-count');
const cartDrawer = document.getElementById('cart-drawer');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const productModal = document.querySelector('.product-modal');
const modalClose = document.querySelector('.modal-close');

cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartDrawer.classList.add('open');
});
closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

modalClose.addEventListener('click', () => {
    gsap.to('.product-modal', { 
        clipPath: 'circle(0% at 50% 50%)', 
        duration: 0.8, 
        ease: 'power3.inOut',
        onComplete: () => {
            productModal.style.display = 'none';
            lenis.start(); 
        }
    });
});

// ✨ LOAD PRODUCTS API CALL (Corrected object destructuring & image URL)
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const { products } = await res.json();

    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    if (!products || products.length === 0) {
        grid.innerHTML = "<p style='color: #888; text-align: center; width: 100%;'>No masterpiece collections available right now.</p>";
        return;
    }

    products.forEach(product => {
      const imageUrl = product.images?.[0]?.url || product.image || '';
      
      grid.innerHTML += `
        <div class="product-card hover-glow reveal-target">
          <div class="product-img-wrapper">
            <img src="${imageUrl}" class="inner-img product-image" alt="${product.name}">
          </div>

          <div class="product-info">
            <span class="category">${product.category}</span>
            <h3>${product.name}</h3>
            <div class="price-row">
              <span class="price">₹${product.price}</span>
              <button class="add-to-cart magnetic-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    });

    // Initialize dynamic elements AFTER products are loaded
    initializeProductInteractions();

  } catch (err) {
    console.log("Error loading products:", err);
  }
}

// ✨ Initialize dynamic elements
function initializeProductInteractions() {
    ScrollTrigger.refresh();

    gsap.utils.toArray('.reveal-target').forEach(target => {
        const imgWrapper = target.querySelector('.product-img-wrapper');
        const img = target.querySelector('.inner-img');
        
        gsap.to(imgWrapper, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1.5, ease: 'expo.out',
            scrollTrigger: { trigger: target, start: 'top 80%' }
        });
        
        gsap.from(img, {
            scale: 1.3, duration: 1.5, ease: 'expo.out',
            scrollTrigger: { trigger: target, start: 'top 80%' }
        });
    });

    document.querySelectorAll('.product-card').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(follower, { width: 60, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', duration: 0.3 }));
        el.addEventListener('mouseleave', () => gsap.to(follower, { width: 40, height: 40, backgroundColor: 'transparent', duration: 0.3 }));
    });

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            const card = button.closest('.product-card');
            const img = card.querySelector('.product-image');
            const title = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            
            const flyingImg = img.cloneNode();
            flyingImg.classList.add('flying-item');
            
            const imgRect = img.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();
            
            flyingImg.style.width = '100px';
            flyingImg.style.height = '100px';
            flyingImg.style.top = `${imgRect.top + imgRect.height/2 - 50}px`;
            flyingImg.style.left = `${imgRect.left + imgRect.width/2 - 50}px`;
            
            document.body.appendChild(flyingImg);
            
            requestAnimationFrame(() => {
                flyingImg.style.top = `${cartRect.top}px`;
                flyingImg.style.left = `${cartRect.left}px`;
                flyingImg.style.width = '20px';
                flyingImg.style.height = '20px';
                flyingImg.style.opacity = '0';
            });
            
            setTimeout(() => {
                flyingImg.remove();
                currentCartCount++;
                cartBadge.innerText = currentCartCount;
                gsap.fromTo(cartIcon, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
                
                if(currentCartCount === 1) cartItemsContainer.innerHTML = ''; 
                cartItemsContainer.innerHTML += `
                    <div class="cart-item-ui">
                        <img src="${img.src}" alt="${title}">
                        <div>
                            <h4>${title}</h4>
                            <div class="price">${price}</div>
                        </div>
                    </div>
                `;
            }, 800);
        });
    });

    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if(e.target.classList.contains('add-to-cart')) return;
            
            const imgSrc = card.querySelector('.product-image').src;
            const title = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            const category = card.querySelector('.category').innerText;
            
            document.querySelector('.modal-img').src = imgSrc;
            document.querySelector('.modal-title').innerText = title;
            document.querySelector('.modal-price').innerText = price;
            document.querySelector('.modal-category').innerText = category;
            
            lenis.stop(); 
            
            const tl = gsap.timeline();
            tl.set('.product-modal', { display: 'flex' })
              .fromTo('.product-modal', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 1.2, ease: 'power4.inOut' })
              .fromTo('.modal-img', { scale: 1.5, filter: 'blur(20px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }, "-=0.6")
              .fromTo(['.modal-category', '.modal-title', '.modal-price', '.modal-info button'], 
                      { y: 60, opacity: 0, rotationX: 45 }, 
                      { y: 0, opacity: 1, rotationX: 0, stagger: 0.1, duration: 1, ease: 'back.out(1.5)' }, "-=0.8");
        });
    });
}

// Start loading products
loadProducts();
        onComplete: () => {
            productModal.style.display = 'none';
            lenis.start(); 
        }
    });
});

// ✨ LOAD PRODUCTS API CALL
async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    products.forEach(product => {
      // ✅ FIX: Image URL extraction fixed here
      const imageUrl = product.images?.[0]?.url || product.image || '';
      
      grid.innerHTML += `
        <div class="product-card hover-glow reveal-target">
          <div class="product-img-wrapper">
            <img src="${imageUrl}" class="inner-img product-image" alt="${product.name}">
          </div>

          <div class="product-info">
            <span class="category">${product.category}</span>
            <h3>${product.name}</h3>
            <div class="price-row">
              <span class="price">₹${product.price}</span>
              <button class="add-to-cart magnetic-btn">Add to Cart</button>
            </div>
          </div>
        </div>
      `;
    });

    // ✅ FIX: Initialize GSAP and Event Listeners AFTER products are loaded into the DOM
    initializeProductInteractions();

  } catch (err) {
    console.log("Error loading products:", err);
  }
}

// ✨ Initialize dynamic elements (Called after loadProducts)
function initializeProductInteractions() {
    // 1. Refresh ScrollTrigger for new elements
    ScrollTrigger.refresh();

    // 2. GSAP Reveal for new products
    gsap.utils.toArray('.reveal-target').forEach(target => {
        const imgWrapper = target.querySelector('.product-img-wrapper');
        const img = target.querySelector('.inner-img');
        
        gsap.to(imgWrapper, {
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
            duration: 1.5, ease: 'expo.out',
            scrollTrigger: { trigger: target, start: 'top 80%' }
        });
        
        gsap.from(img, {
            scale: 1.3, duration: 1.5, ease: 'expo.out',
            scrollTrigger: { trigger: target, start: 'top 80%' }
        });
    });

    // 3. Custom Cursor for new product cards
    document.querySelectorAll('.product-card').forEach(el => {
        el.addEventListener('mouseenter', () => gsap.to(follower, { width: 60, height: 60, backgroundColor: 'rgba(212, 175, 55, 0.1)', duration: 0.3 }));
        el.addEventListener('mouseleave', () => gsap.to(follower, { width: 40, height: 40, backgroundColor: 'transparent', duration: 0.3 }));
    });

    // 4. Add to Cart Logic for new buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            
            const card = button.closest('.product-card');
            const img = card.querySelector('.product-image');
            const title = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            
            const flyingImg = img.cloneNode();
            flyingImg.classList.add('flying-item');
            
            const imgRect = img.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();
            
            flyingImg.style.width = '100px';
            flyingImg.style.height = '100px';
            flyingImg.style.top = `${imgRect.top + imgRect.height/2 - 50}px`;
            flyingImg.style.left = `${imgRect.left + imgRect.width/2 - 50}px`;
            
            document.body.appendChild(flyingImg);
            
            requestAnimationFrame(() => {
                flyingImg.style.top = `${cartRect.top}px`;
                flyingImg.style.left = `${cartRect.left}px`;
                flyingImg.style.width = '20px';
                flyingImg.style.height = '20px';
                flyingImg.style.opacity = '0';
            });
            
            setTimeout(() => {
                flyingImg.remove();
                currentCartCount++;
                cartBadge.innerText = currentCartCount;
                gsap.fromTo(cartIcon, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
                
                if(currentCartCount === 1) cartItemsContainer.innerHTML = ''; 
                cartItemsContainer.innerHTML += `
                    <div class="cart-item-ui">
                        <img src="${img.src}" alt="${title}">
                        <div>
                            <h4>${title}</h4>
                            <div class="price">${price}</div>
                        </div>
                    </div>
                `;
            }, 800);
        });
    });

    // 5. Extreme Product Reveal Modal for new cards
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if(e.target.classList.contains('add-to-cart')) return;
            
            const imgSrc = card.querySelector('.product-image').src;
            const title = card.querySelector('h3').innerText;
            const price = card.querySelector('.price').innerText;
            const category = card.querySelector('.category').innerText;
            
            document.querySelector('.modal-img').src = imgSrc;
            document.querySelector('.modal-title').innerText = title;
            document.querySelector('.modal-price').innerText = price;
            document.querySelector('.modal-category').innerText = category;
            
            lenis.stop(); 
            
            const tl = gsap.timeline();
            tl.set('.product-modal', { display: 'flex' })
              .fromTo('.product-modal', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 1.2, ease: 'power4.inOut' })
              .fromTo('.modal-img', { scale: 1.5, filter: 'blur(20px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }, "-=0.6")
              .fromTo(['.modal-category', '.modal-title', '.modal-price', '.modal-info button'], 
                      { y: 60, opacity: 0, rotationX: 45 }, 
                      { y: 0, opacity: 1, rotationX: 0, stagger: 0.1, duration: 1, ease: 'back.out(1.5)' }, "-=0.8");
        });
    });
}

// Start loading products
loadProducts();
        ease: 'expo.out',
        scrollTrigger: { trigger: target, start: 'top 80%' }
    });
});

// ✨ Cart Logic & Drawer
let currentCartCount = 0;
const cartIcon = document.getElementById('cart-icon');
const cartBadge = document.querySelector('.cart-count');
const cartDrawer = document.getElementById('cart-drawer');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.querySelector('.cart-items');

cartIcon.addEventListener('click', (e) => {
    e.preventDefault();
    cartDrawer.classList.add('open');
});
closeCartBtn.addEventListener('click', () => cartDrawer.classList.remove('open'));

document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation(); // Prevents the extreme product modal from opening when clicking cart
        
        const card = button.closest('.product-card');
        const img = card.querySelector('.product-image');
        const title = card.querySelector('h3').innerText;
        const price = card.querySelector('.price').innerText;
        
        const flyingImg = img.cloneNode();
        flyingImg.classList.add('flying-item');
        
        const imgRect = img.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();
        
        flyingImg.style.width = '100px';
        flyingImg.style.height = '100px';
        flyingImg.style.top = `${imgRect.top + imgRect.height/2 - 50}px`;
        flyingImg.style.left = `${imgRect.left + imgRect.width/2 - 50}px`;
        
        document.body.appendChild(flyingImg);
        
        requestAnimationFrame(() => {
            flyingImg.style.top = `${cartRect.top}px`;
            flyingImg.style.left = `${cartRect.left}px`;
            flyingImg.style.width = '20px';
            flyingImg.style.height = '20px';
            flyingImg.style.opacity = '0';
        });
        
        setTimeout(() => {
            flyingImg.remove();
            currentCartCount++;
            cartBadge.innerText = currentCartCount;
            gsap.fromTo(cartIcon, { scale: 1.5 }, { scale: 1, duration: 0.5, ease: "back.out(2)" });
            
            // Add item to drawer
            if(currentCartCount === 1) cartItemsContainer.innerHTML = ''; // Clear empty msg
            cartItemsContainer.innerHTML += `
                <div class="cart-item-ui">
                    <img src="${img.src}" alt="${title}">
                    <div>
                        <h4>${title}</h4>
                        <div class="price">${price}</div>
                    </div>
                </div>
            `;
        }, 800);
    });
});

// ✨ Extreme Product Reveal Logic
const productModal = document.querySelector('.product-modal');
const modalClose = document.querySelector('.modal-close');

document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
        // Stop if clicking Add to Cart
        if(e.target.classList.contains('add-to-cart')) return;
        
        const imgSrc = card.querySelector('.product-image').src;
        const title = card.querySelector('h3').innerText;
        const price = card.querySelector('.price').innerText;
        const category = card.querySelector('.category').innerText;
        
        document.querySelector('.modal-img').src = imgSrc;
        document.querySelector('.modal-title').innerText = title;
        document.querySelector('.modal-price').innerText = price;
        document.querySelector('.modal-category').innerText = category;
        
        lenis.stop(); // Freeze scroll
        
        const tl = gsap.timeline();
        tl.set('.product-modal', { display: 'flex' })
          .fromTo('.product-modal', { clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(150% at 50% 50%)', duration: 1.2, ease: 'power4.inOut' })
          .fromTo('.modal-img', { scale: 1.5, filter: 'blur(20px)' }, { scale: 1, filter: 'blur(0px)', duration: 1.2, ease: 'expo.out' }, "-=0.6")
          .fromTo(['.modal-category', '.modal-title', '.modal-price', '.modal-info button'], 
                  { y: 60, opacity: 0, rotationX: 45 }, 
                  { y: 0, opacity: 1, rotationX: 0, stagger: 0.1, duration: 1, ease: 'back.out(1.5)' }, "-=0.8");
    });
});

modalClose.addEventListener('click', () => {
    gsap.to('.product-modal', { 
        clipPath: 'circle(0% at 50% 50%)', 
        duration: 0.8, 
        ease: 'power3.inOut',
        onComplete: () => {
            productModal.style.display = 'none';
            lenis.start(); // Resume scroll
        }
    });
});

async function loadProducts() {
  try {
    const res = await fetch(`${API_URL}/products`);
    const products = await res.json();

    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    products.forEach(product => {
      grid.innerHTML += `
        <div class="product-card hover-glow reveal-target">
          <div class="product-img-wrapper">
            <img src="${product.images?.[0] || product.image}"
                 class="inner-img product-image">
          </div>

          <div class="product-info">
            <span class="category">${product.category}</span>

            <h3>${product.name}</h3>

            <div class="price-row">
              <span class="price">₹${product.price}</span>

              <button class="add-to-cart magnetic-btn">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.log(err);
  }
}

loadProducts();
