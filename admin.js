const API_URL = "https://vestiga-backend-3392.onrender.com/api";

const loginSection = document.getElementById("login-section");
const appLayout = document.getElementById("app-layout");
const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("login-error");
const loginBtn = document.getElementById("login-btn");

const addProductForm = document.getElementById("add-product-form");
const addBtn = document.getElementById("add-btn");
const productListContainer = document.getElementById("admin-product-list");
let editingProductId = null; 

// ✨ 1. AUTH LOGIC
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        showApp();
    } else {
        gsap.from(".login-box", { y: 50, opacity: 0, duration: 1, ease: "power3.out" });
    }
});

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginBtn.innerText = "Authenticating...";
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();

        if (data.token) {
            localStorage.setItem("adminToken", data.token);
            loginError.style.display = "none";
            loginForm.reset();
            showApp();
        }
    } catch (error) {
        loginError.innerText = "Authentication failed or network error.";
        loginError.style.display = "block";
        gsap.fromTo(".login-box", {x: -10}, {x: 10, duration: 0.1, yoyo: true, repeat: 5});
    } finally {
        loginBtn.innerText = "Authenticate";
    }
});

function showApp() {
    loginSection.style.display = "none";
    appLayout.style.display = "flex";
    gsap.from(".sidebar", { x: -200, opacity: 0, duration: 0.8, ease: "power3.out" });
    gsap.from(".topbar", { y: -50, opacity: 0, duration: 0.8, ease: "power3.out", delay: 0.2 });
    
    fetchDashboardStats();
    initCharts();
}

function logoutAdmin() {
    localStorage.removeItem("adminToken");
    appLayout.style.display = "none";
    loginSection.style.display = "flex";
    loginForm.reset();
}

// ✨ 2. SPA ROUTING
document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");

        document.querySelectorAll(".view-section").forEach(view => view.classList.remove("active"));
        const target = item.dataset.target;
        document.getElementById(target).classList.add("active");
        document.getElementById("current-page-title").innerText = item.textContent.trim();

        if(target === 'view-products') fetchAdminProducts();
        if(target === 'view-orders') fetchAdminOrders();
        if(target === 'view-dashboard') fetchDashboardStats();
        // Added Customers and Offers routing
        if(target === 'view-customers') fetchAdminCustomers();
        if(target === 'view-offers') fetchAdminOffers();
    });
});

// ✨ 3. PRODUCTS CRUD (With Error Handling)
async function fetchAdminProducts() {
    productListContainer.innerHTML = '<p style="color: var(--text-muted); text-align:center;">Fetching Masterpieces... ⏳</p>';
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json(); 
        const products = Array.isArray(data) ? data : (data.products || []); 
        
        if (products.length === 0) {
            productListContainer.innerHTML = '<p style="color: var(--text-muted); text-align:center;">No products found.</p>';
            return;
        }

        productListContainer.innerHTML = products.map(product => {
            const imageUrl = product.images?.[0]?.url || product.image || '';
            return `
            <div class="product-item" style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 15px; margin-bottom: 12px; border-radius: 8px; border: 1px solid var(--glass-border);">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${imageUrl}" style="width: 55px; height: 55px; object-fit: cover; border-radius: 6px; border: 1px solid var(--gold);">
                    <div>
                        <h4 style="margin: 0; color: var(--gold); font-family: 'Playfair Display'; font-size: 1.1rem;">${product.name}</h4>
                        <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted);">₹${product.price} &middot; ${product.category} &middot; Stock: ${product.countInStock || 0}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="populateEditForm('${product._id}')" style="background: rgba(212, 175, 55, 0.1); border: 1px solid var(--gold); color: var(--gold); padding: 8px 12px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteProduct('${product._id}')" style="background: rgba(255, 71, 87, 0.1); border: 1px solid var(--danger); color: var(--danger); padding: 8px 12px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>`}).join('');

    } catch (error) {
        console.error("Products Fetch Error:", error);
        productListContainer.innerHTML = '<p style="color: var(--danger); text-align:center;">Failed to load products.</p>';
    }
}

addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    addBtn.innerText = editingProductId ? "Updating... ⏳" : "Adding... ⏳";
    addBtn.disabled = true;

    const formData = new FormData();
    formData.append("name", document.getElementById("p-name").value);
    formData.append("category", document.getElementById("p-category").value);
    formData.append("price", document.getElementById("p-price").value);
    formData.append("countInStock", document.getElementById("p-stock").value); 
    formData.append("description", document.getElementById("p-desc").value);
    
    const imageFile = document.getElementById("p-image").files[0];
    if (imageFile) formData.append("images", imageFile); 

    try {
        const token = localStorage.getItem("adminToken");
        const url = editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products/with-images`;
        const method = editingProductId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        alert(editingProductId ? "Masterpiece Updated! 🎉" : "Masterpiece Added! 🎉");
        addProductForm.reset();
        editingProductId = null;
        addBtn.innerText = "Add Product";
        document.getElementById("p-image").required = true; 
        fetchAdminProducts(); 
        
    } catch (error) {
        console.error("Save Error:", error);
        alert("Failed to save product.");
    } finally {
        if (!editingProductId) addBtn.innerText = "Add Product";
        addBtn.disabled = false;
    }
});

async function deleteProduct(id) {
    if (!confirm("Delete this Masterpiece forever? 🗑️")) return;
    try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        fetchAdminProducts(); 
    } catch (error) {
        alert("Failed to delete product.");
    }
}

async function populateEditForm(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const data = await res.json();
        const product = data.product || data; 

        document.getElementById("p-name").value = product.name;
        document.getElementById("p-category").value = product.category;
        document.getElementById("p-price").value = product.price;
        document.getElementById("p-stock").value = product.countInStock || 0; 
        document.getElementById("p-desc").value = product.description;
        document.getElementById("p-image").required = false; 

        editingProductId = product._id; 
        addBtn.innerText = "Update Masterpiece";
        document.querySelector('.content-area').scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (error) {
        alert("Failed to load product details.");
    }
}

// ✨ 4. ORDERS MANAGEMENT
async function fetchAdminOrders() {
    const list = document.getElementById("admin-orders-list");
    list.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Fetching orders... ⏳</td></tr>';
    
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/orders`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        const orders = Array.isArray(data) ? data : (data.orders || []);

        if (orders.length === 0) {
            list.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No orders received yet.</td></tr>';
            return;
        }

        list.innerHTML = orders.map(order => `
            <tr>
                <td style="font-family: monospace; color: var(--gold);">#${order._id.substring(0,8)}</td>
                <td>${order.user ? order.user.name : 'Guest User'}</td>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>₹${order.totalPrice}</td>
                <td><span class="status-badge status-${order.status ? order.status.toLowerCase() : 'pending'}">${order.status || 'Pending'}</span></td>
                <td>
                    <select onchange="updateOrderStatus('${order._id}', this.value)" style="background: #000; color: var(--gold); border: 1px solid var(--gold); padding: 5px; border-radius: 4px;">
                        <option value="" disabled selected>Update</option>
                        <option value="Shipped">Ship Order</option>
                        <option value="Delivered">Mark Delivered</option>
                    </select>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Fetch Orders Error:", error);
        list.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Failed to load orders. API might not be ready.</td></tr>';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
            method: "PUT",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}` 
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        fetchAdminOrders(); 
    } catch (error) {
        alert("Failed to update status. Ensure backend route exists.");
    }
}

// ✨ 5. DASHBOARD & CHARTS
async function fetchDashboardStats() {
    try {
        const res = await fetch(`${API_URL}/products`);
        if (!res.ok) return;
        const data = await res.json();
        const productsCount = Array.isArray(data) ? data.length : (data.products ? data.products.length : 0);
        
        document.getElementById("dash-products").innerText = productsCount;
    } catch(err) {
        console.log("Dashboard stats fetch failed", err);
    }
}

let chartsInitialized = false;
function initCharts() {
    if(chartsInitialized) return;
    chartsInitialized = true;

    const revCtx = document.getElementById('revenueChart');
    if(revCtx) {
        new Chart(revCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{ label: 'Revenue (₹)', data: [150000, 280000, 210000, 420000, 390000, 550000], borderColor: '#D4AF37', backgroundColor: 'rgba(212, 175, 55, 0.1)', borderWidth: 2, fill: true, tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#888' } }, x: { grid: { display: false }, ticks: { color: '#888' } } } }
        });
    }

    const catCtx = document.getElementById('categoryChart');
    if(catCtx) {
        new Chart(catCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Watches', 'Footwear', 'Accessories'],
                datasets: [{ data: [65, 25, 10], backgroundColor: ['#D4AF37', '#fff', '#555'], borderWidth: 0 }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#fff' } } }, cutout: '75%' }
        });
    }
}

// ✨ 6. CUSTOMERS (CLIENTELE) MANAGEMENT
async function fetchAdminCustomers() {
    const list = document.getElementById("admin-customers-list");
    if (!list) return;
    list.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Fetching VIPs... ⏳</td></tr>';
    
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/users`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        const customers = Array.isArray(data) ? data : (data.users || []);

        if (customers.length === 0) {
            list.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No clients registered yet.</td></tr>';
            return;
        }

        list.innerHTML = customers.map(user => `
            <tr>
                <td style="font-family: monospace; color: var(--text-muted);">#${user._id.substring(0,8)}</td>
                <td style="color: var(--gold); font-weight: 500;">${user.name}</td>
                <td>${user.email}</td>
                <td><span class="status-badge" style="background: ${user.isAdmin ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)'}; color: ${user.isAdmin ? 'var(--gold)' : '#aaa'}; border: 1px solid ${user.isAdmin ? 'var(--gold)' : '#333'};">${user.isAdmin ? 'Admin' : 'Customer'}</span></td>
                <td>
                    <button onclick="deleteCustomer('${user._id}')" style="background: rgba(255, 71, 87, 0.1); border: 1px solid var(--danger); color: var(--danger); padding: 5px 10px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error("Fetch Customers Error:", error);
        list.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">API Route /users might not be ready yet.</td></tr>';
    }
}

async function deleteCustomer(id) {
    if (!confirm("Are you sure you want to remove this client? 🛑")) return;
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        fetchAdminCustomers(); 
    } catch (error) {
        alert("Failed to delete customer.");
    }
}

// ✨ 7. OFFERS & COUPONS MANAGEMENT
const addOfferForm = document.getElementById("add-offer-form");

async function fetchAdminOffers() {
    const listContainer = document.getElementById("admin-offers-list");
    if (!listContainer) return;
    listContainer.innerHTML = '<p style="color: var(--text-muted); text-align:center;">Loading coupons... ⏳</p>';
    
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/coupons`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        const data = await res.json();
        const coupons = Array.isArray(data) ? data : (data.coupons || []);

        if (coupons.length === 0) {
            listContainer.innerHTML = '<p style="color: var(--text-muted); text-align:center;">No active coupons.</p>';
            return;
        }

        listContainer.innerHTML = coupons.map(coupon => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 15px; margin-bottom: 12px; border-radius: 8px; border: 1px dashed var(--gold);">
                <div>
                    <h4 style="margin: 0; color: var(--gold); letter-spacing: 2px;">${coupon.code}</h4>
                    <p style="margin: 4px 0 0; font-size: 0.8rem; color: var(--text-muted);">${coupon.discountPercentage}% OFF &middot; Expires: ${new Date(coupon.expiryDate).toLocaleDateString()}</p>
                </div>
                <button onclick="deleteOffer('${coupon._id}')" style="background: rgba(255, 71, 87, 0.1); border: 1px solid var(--danger); color: var(--danger); padding: 8px 12px; border-radius: 6px; cursor: pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join('');

    } catch (error) {
        console.error("Fetch Offers Error:", error);
        listContainer.innerHTML = '<p style="color: var(--danger); text-align:center;">API Route /coupons not ready yet.</p>';
    }
}

if(addOfferForm) {
    addOfferForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = document.getElementById("add-offer-btn");
        btn.innerText = "Creating... ⏳";
        btn.disabled = true;

        const payload = {
            code: document.getElementById("o-code").value.toUpperCase(),
            discountPercentage: document.getElementById("o-discount").value,
            expiryDate: document.getElementById("o-expiry").value
        };

        try {
            const token = localStorage.getItem("adminToken");
            const res = await fetch(`${API_URL}/coupons`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
            
            alert("Premium Coupon Created! 🎉");
            addOfferForm.reset();
            fetchAdminOffers(); 
            
        } catch (error) {
            console.error("Save Coupon Error:", error);
            alert("Failed to create coupon.");
        } finally {
            btn.innerText = "Create Coupon";
            btn.disabled = false;
        }
    });
}

async function deleteOffer(id) {
    if (!confirm("Revoke this coupon? 🗑️")) return;
    try {
        const token = localStorage.getItem("adminToken");
        const res = await fetch(`${API_URL}/coupons/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        fetchAdminOffers(); 
    } catch (error) {
        alert("Failed to delete coupon.");
    }
}
