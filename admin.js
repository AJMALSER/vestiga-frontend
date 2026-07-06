const API_URL = "https://vestiga-backend-3392.onrender.com/api";

// DOM Elements
const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");
const loginForm = document.getElementById("admin-login-form");
const loginError = document.getElementById("login-error");
const addProductForm = document.getElementById("add-product-form");
const addBtn = document.getElementById("add-btn");
const productListContainer = document.getElementById("admin-product-list");

// Edit ചെയ്യാൻ ഏത് product ആണ് സെലക്ട് ചെയ്തത് എന്ന് ട്രാക്ക് ചെയ്യാൻ
let editingProductId = null; 

// 1. Check if Admin is already logged in when page loads
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("adminToken");
    if (token) {
        showDashboard();
    }
});

// 2. Handle Admin Login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            localStorage.setItem("adminToken", data.token);
            loginError.style.display = "none";
            loginForm.reset();
            showDashboard();
        } else {
            loginError.innerText = data.message || "Login failed. Check credentials.";
            loginError.style.display = "block";
        }
    } catch (error) {
        console.error("Login Error:", error);
        loginError.innerText = "Network error. Please try again.";
        loginError.style.display = "block";
    }
});

// 3. UI Toggle Functions
function showDashboard() {
    loginSection.style.display = "none";
    dashboardSection.style.display = "block";
    fetchAdminProducts();
}

function logoutAdmin() {
    localStorage.removeItem("adminToken");
    dashboardSection.style.display = "none";
    loginSection.style.display = "flex";
}

// 4. Fetch & View Products
async function fetchAdminProducts() {
    productListContainer.innerHTML = '<p style="color: #888;">Loading products... ⏳</p>';
    
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        
        if (products.length === 0) {
            productListContainer.innerHTML = '<p style="color: #888;">No products found. Start adding some!</p>';
            return;
        }

        productListContainer.innerHTML = products.map(product => `
            <div style="display: flex; justify-content: space-between; align-items: center; background: #000; padding: 15px; margin-bottom: 15px; border-radius: 8px; border: 1px solid #222;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${product.images?.[0] || product.image || ''}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 5px;">
                    <div>
                        <h4 style="margin: 0; color: #D4AF37;">${product.name}</h4>
                        <p style="margin: 5px 0 0; font-size: 0.85rem; color: #aaa;">₹${product.price} &middot; ${product.category} &middot; Stock: ${product.countInStock || 0}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button onclick="populateEditForm('${product._id}')" style="background: transparent; border: 1px solid #D4AF37; color: #D4AF37; padding: 8px 12px; width: auto;"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="deleteProduct('${product._id}')" style="background: transparent; border: 1px solid red; color: red; padding: 8px 12px; width: auto;"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error("Error fetching products:", error);
        productListContainer.innerHTML = '<p style="color: red;">Failed to load products. Check network.</p>';
    }
}

// 5. Add OR Edit Product
addProductForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    addBtn.innerText = editingProductId ? "Updating Product... ⏳" : "Adding Product... ⏳";
    addBtn.disabled = true;

    const formData = new FormData();
    formData.append("name", document.getElementById("p-name").value);
    formData.append("category", document.getElementById("p-category").value);
    formData.append("price", document.getElementById("p-price").value);
    
    // Corrected to "countInStock"
    formData.append("countInStock", document.getElementById("p-stock").value); 
    formData.append("description", document.getElementById("p-desc").value);
    
    const imageFile = document.getElementById("p-image").files[0];
    if (imageFile) {
        // Corrected to "images"
        formData.append("images", imageFile); 
    }

    try {
        const token = localStorage.getItem("adminToken");
        
        // Corrected Route Logic
        const url = editingProductId 
            ? `${API_URL}/products/${editingProductId}` 
            : `${API_URL}/products/with-images`;
            
        const method = editingProductId ? "PUT" : "POST";

        const response = await fetch(url, {
            method: method,
            headers: {
                "Authorization": `Bearer ${token}` 
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert(editingProductId ? "Product Updated Successfully! 🎉" : "Product Added Successfully! 🎉");
            
            addProductForm.reset();
            editingProductId = null;
            addBtn.innerText = "Add Product";
            document.getElementById("p-image").required = true; 
            
            fetchAdminProducts(); 
        } else {
            alert(`Error: ${data.message || "Failed to save product"}`);
        }
    } catch (error) {
        console.error("Save Product Error:", error);
        alert("Network error. Backend might be down.");
    } finally {
        if (!editingProductId) addBtn.innerText = "Add Product";
        addBtn.disabled = false;
    }
});

// 6. Delete Product
async function deleteProduct(id) {
    if (!confirm("Are you sure you want to delete this masterpiece? 🗑️")) return;

    try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            fetchAdminProducts(); 
        } else {
            const data = await response.json();
            alert(`Error: ${data.message || "Failed to delete"}`);
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Network error.");
    }
}

// 7. Load Data into Form for Editing
async function populateEditForm(id) {
    try {
        const res = await fetch(`${API_URL}/products/${id}`);
        const product = await res.json();

        document.getElementById("p-name").value = product.name;
        document.getElementById("p-category").value = product.category;
        document.getElementById("p-price").value = product.price;
        // Map to countInStock if available
        document.getElementById("p-stock").value = product.countInStock || 0; 
        document.getElementById("p-desc").value = product.description;
        
        document.getElementById("p-image").required = false; 

        editingProductId = product._id; 
        addBtn.innerText = "Update Product";
        
        window.scrollTo({ top: 0, behavior: 'smooth' }); 
    } catch (error) {
        console.error("Fetch Product Error:", error);
        alert("Failed to load product details.");
    }
}
